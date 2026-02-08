
import { GoogleGenAI, Type } from "@google/genai";
import { SmartBrief, SupportMessage, ExtractionData, AdvisoryData } from "../types";

export interface ExtractionContext {
  filename: string;
  filetype: string;
  userPrompt?: string;
}

export class VaultService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * STAGE 1: DOCUMENT REVIEW & SUMMARY FINDINGS
   * Comprehensive review of provided materials to determine primary subject and key takeaways.
   */
  public static async generateExtraction(
    documentContent: string,
    context: ExtractionContext
  ): Promise<Partial<SmartBrief>> {
    const ai = this.getClient();
    const model = 'gemini-3-pro-preview'; // Use pro for highest quality for all users

    const response = await ai.models.generateContent({
      model,
      contents: [{ 
        role: 'user', 
        parts: [{ 
          text: `DOCUMENT FOR REVIEW:
Filename: ${context.filename}
Nature: ${context.filetype}
User Objectives: ${context.userPrompt || "Standard Professional Review"}

DOCUMENT CONTENT:
${documentContent || "[UNREADABLE OR EMPTY DOCUMENT]"}` 
        }] 
      }],
      config: {
        systemInstruction: `You are the LexVault Senior Analyst. 
        TASK: Perform STAGE 1: DOCUMENT REVIEW & SUMMARY FINDINGS.
        
        GOALS:
        1. RECOVERY REVIEW: If content is unreadable or empty, explain that the document lacks sufficient clarity for a thorough review and suggest a clearer submission.
        2. NARRATIVE REVIEW: For informal documents, provide a plain-language explanation of purpose and intent.
        3. FORMAL REVIEW: For structured materials, identify key clauses and commitments.

        TERMINOLOGY RULES:
        - Do NOT use "Extraction", "AI", "Protocol", "Model", or "Prompt".
        - Use "Review Findings", "Advisory", "Professional Observations".
        
        OUTPUT SECTIONS:
        - title: Primary subject of the review.
        - documentType: Nature of the document (e.g., "Consultation Note", "Service Agreement").
        - extraction.clauses: Specific citations or content explanations.
        - extraction.rightsAndObligations: Intentions and primary responsibilities found.

        OUTPUT MUST BE JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            documentType: { type: Type.STRING },
            hasSubstantiveContent: { type: Type.BOOLEAN },
            extraction: {
              type: Type.OBJECT,
              properties: {
                clauses: { type: Type.ARRAY, items: { type: Type.STRING } },
                rightsAndObligations: { type: Type.ARRAY, items: { type: Type.STRING } },
                commitments: { type: Type.ARRAY, items: { type: Type.STRING } },
                timelines: { type: Type.ARRAY, items: { type: Type.STRING } },
                ambiguities: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['clauses', 'rightsAndObligations', 'commitments', 'timelines', 'ambiguities']
            }
          },
          required: ['title', 'documentType', 'hasSubstantiveContent', 'extraction']
        }
      }
    });

    try {
      const data = JSON.parse(response.text || "{}");
      return {
        ...data,
        isApproved: false,
        disclaimer: "This advisory summary is provided for informational purposes based on the submitted materials and does not constitute formal legal or professional advice. Please consult with qualified counsel for specific regulatory matters."
      };
    } catch (e) {
      throw new Error("REVIEW_SYSTEM_FAILURE");
    }
  }

  /**
   * STAGE 2: PROFESSIONAL ADVISORY & STRATEGIC INSIGHTS
   */
  public static async generateAdvisory(
    brief: SmartBrief
  ): Promise<AdvisoryData> {
    const ai = this.getClient();
    const model = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [{
          text: `REVIEW FINDINGS:\n${JSON.stringify(brief.extraction)}\n\nMODE: PROFESSIONAL ADVISORY`
        }]
      }],
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        systemInstruction: `You are the LexVault Senior Analyst.
        TASK: Perform STAGE 2: PROFESSIONAL ADVISORY & STRATEGIC INSIGHTS.
        
        GUIDELINES:
        1. Acknowledge any information limitations found in Stage 1.
        2. Focus on "Based on the documented [X]..." phrasing.
        3. TONE: Authoritative, expert, confidential, and protective.
        
        OUTPUT SECTIONS:
        - executiveSignals: Strategic takeaways for leadership.
        - readersMiss: Subtle observations or common oversights.
        - scenarios: Likely professional outcomes based on the text.
        - risks: Assessment of operational or regulatory considerations.
        - leverage: Actionable suggestions for negotiation or clarification.
        - signingReadiness: Professional assessment of document completeness.
        - professionalQuestions: Questions to resolve outstanding ambiguities.

        OUTPUT MUST BE JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            readersMiss: { type: Type.ARRAY, items: { type: Type.STRING } },
            scenarios: { type: Type.ARRAY, items: { type: Type.STRING } },
            risks: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING },
                details: { type: Type.STRING },
                flags: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['level', 'details', 'flags']
            },
            leverage: { type: Type.ARRAY, items: { type: Type.STRING } },
            signingReadiness: {
              type: Type.OBJECT,
              properties: {
                status: { type: Type.STRING },
                justification: { type: Type.STRING }
              },
              required: ['status', 'justification']
            },
            professionalQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['executiveSignals', 'readersMiss', 'scenarios', 'risks', 'leverage', 'signingReadiness', 'professionalQuestions']
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}") as AdvisoryData;
    } catch (e) {
      throw new Error("ADVISORY_SYSTEM_FAILURE");
    }
  }

  public static async generateSupportResponse(history: SupportMessage[], userQuery: string): Promise<string> {
    const ai = this.getClient();
    const contents = history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }));
    contents.push({ role: 'user', parts: [{ text: userQuery }] });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: { systemInstruction: `You are a Professional Support Analyst at LexVault. Assist users with platform navigation and security standards. Use a professional, helpful tone. No legal advice.` }
    });
    return response.text || "Service temporarily unavailable.";
  }

  /**
   * ADMINISTRATIVE ADVISOR: Strategic guidance for platform owner.
   */
  public static async generateAdminAdvisory(
    adminQuery: string,
    platformStats: {
      totalUsers: number;
      activeUsers24h: number;
      totalDocs: number;
    },
    history: { query: string; response: string }[]
  ): Promise<string> {
    const ai = this.getClient();
    
    const context = `
APP: LexVault
PURPOSE: Secure professional document review & advisory insights.
USERS: Attorneys, Physicians, Engineers, Financial Analysts, Consultants.
PRICING: Free to use for all professional identities.

CURRENT PLATFORM METRICS:
- Total Registered Identities: ${platformStats.totalUsers}
- Active Sessions (24h): ${platformStats.activeUsers24h}
- Global Document Volume: ${platformStats.totalDocs}
    `;

    const contents = history.flatMap(h => [
      { role: 'user', parts: [{ text: h.query }] },
      { role: 'model', parts: [{ text: h.response }] }
    ]);
    contents.push({ role: 'user', parts: [{ text: adminQuery }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents as any,
      config: {
        systemInstruction: `You are the Lead Strategic Consultant for LexVault. 
        Your objective is to provide professional operational guidance to the platform owner.
        
        GUIDELINES:
        - NEVER use the words "AI", "bot", "assistant", or "chat".
        - Presentation: Use professional, advisory headers like "Recommendation", "Observation", or "Suggested Action".
        - Context: Ground your advice in the provided LexVault platform statistics and model.
        - Focus: Retention, user engagement, usability, feature prioritization, and optimization.
        - Tone: Neutral, authoritative, and enterprise-grade.
        
        ADVISORY CONTEXT: ${context}`,
      }
    });

    return response.text || "Operational guidance channel interrupted.";
  }
}
