
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import Logo from '../components/Logo';
import { VaultService } from '../services/vaultService';

const SmartBriefView: React.FC = () => {
  const { brief, setAdvisory, approveExtraction, user, purgeSession, isProcessing, setProcessing } = useVault();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  if (!brief) return null;

  const handleApproveAndProceed = async () => {
    if (isProcessing) return;
    approveExtraction();
    setProcessing(true);
    setError(null);
    try {
      // Fix: VaultService.generateAdvisory only accepts one argument (brief).
      // The User type does not contain a subscription property.
      const advisory = await VaultService.generateAdvisory(brief);
      setAdvisory(advisory);
    } catch (err: any) {
      setError(err.message || "Professional advisory insights could not be generated at this time.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePurgeAndExit = () => {
    purgeSession();
    navigate('/dashboard');
  };

  const getReadinessColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
      case 'Caution': return 'text-orange-500 border-orange-500/30 bg-orange-500/5';
      case 'Not Ready': return 'text-red-500 border-red-500/30 bg-red-500/5';
      default: return 'text-zinc-500 border-zinc-500/30';
    }
  };

  const isTotalFailure = !brief.title || (brief.extraction.clauses.length === 0 && brief.extraction.rightsAndObligations.length === 0);

  if (isTotalFailure) {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-12 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-900/20 border border-red-900 rounded-full flex items-center justify-center mb-8 text-red-500">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <h2 className="text-2xl font-black mb-4 uppercase">Submission Rejection</h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-10 font-medium tracking-tight">The submitted document does not contain sufficient readable information to provide a professional review. Please upload a complete and legible file.</p>
        <button onClick={handlePurgeAndExit} className="px-10 py-4 bg-zinc-100 text-zinc-950 font-black rounded uppercase tracking-widest text-xs">Return to Workspace</button>
      </div>
    );
  }

  const isRecoveryMode = !brief.hasSubstantiveContent;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="flex items-center gap-6">
            <Logo size="md" />
            <div className="h-8 w-px bg-zinc-800 hidden md:block"></div>
            <div>
                <h1 className="text-xl font-black tracking-tight uppercase">Professional Review Summary</h1>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-0.5">Authoritative Advisory Insights</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={handlePurgeAndExit} className="px-5 py-2.5 bg-red-600/10 border border-red-500 text-red-500 text-xs font-black rounded hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">Wipe Session</button>
        </div>
      </div>

      {isRecoveryMode && (
        <div className="mb-10 p-6 bg-zinc-900 border border-zinc-800 rounded flex gap-5 items-center animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-black/50">
          <div className="w-12 h-12 bg-orange-900/20 border border-orange-500 rounded flex items-center justify-center text-orange-500 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-100">Limited Document Clarity Detected</h5>
            <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-relaxed">
              Full structured review was limited due to content legibility. System has provided contextual summaries based on available intent signals and metadata.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white text-zinc-950 p-12 md:p-20 shadow-2xl rounded-sm mb-12 border border-zinc-200 print:shadow-none print:p-0">
        <header className="border-b-[8px] border-zinc-950 pb-10 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">{isRecoveryMode ? 'Contextual Summary' : 'Stage 1: Primary Document Findings'}</h2>
            <h3 className="text-5xl font-serif font-black mb-6 tracking-tight">{brief.title}</h3>
            <div className="flex gap-3">
              <span className="bg-zinc-100 text-zinc-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border border-zinc-200">
                {brief.documentType}
              </span>
            </div>
        </header>

        <section className="space-y-16 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-3 mb-6">
                  {isRecoveryMode ? 'Content Explanation' : 'Citations & Clauses'}
                </h4>
                <div className="space-y-4">
                  {brief.extraction.clauses.map((c, i) => (
                    <div key={i} className="p-4 bg-zinc-50 border border-zinc-100 text-sm font-serif italic leading-relaxed text-zinc-700">
                      "{c}"
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-3 mb-6">Commitments & Deliverables</h4>
                <ul className="space-y-3">
                  {brief.extraction.commitments.map((commit, i) => (
                    <li key={i} className="text-xs font-mono font-bold text-zinc-950 bg-zinc-50 p-3 border border-zinc-100 rounded-sm">
                      {commit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-3 mb-6">
                  Primary Takeaways & Intent
                </h4>
                <ul className="space-y-4">
                  {brief.extraction.rightsAndObligations.map((r, i) => (
                    <li key={i} className="text-sm text-zinc-900 font-serif leading-relaxed flex gap-3">
                      <span className="text-zinc-300 font-black">/</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-3 mb-6">Critical Timeframes</h4>
                <ul className="space-y-3">
                  {brief.extraction.timelines.map((t, i) => (
                    <li key={i} className="text-[11px] font-bold text-red-700 bg-red-50/50 p-2 border border-red-100">
                       {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {!brief.isApproved ? (
          <div className="p-16 bg-zinc-950 text-white rounded-sm text-center space-y-10 shadow-3xl shadow-emerald-500/5">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tight">Generate Professional Advisory</h3>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                Confirm accuracy of findings to proceed to Stage 2: Strategic Advisory Insights.
              </p>
            </div>
            <div className="space-y-4">
              <button 
                onClick={handleApproveAndProceed}
                disabled={isProcessing}
                className="w-full py-6 bg-emerald-600 text-white font-black rounded hover:bg-emerald-500 transition-all uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-emerald-900/20 text-sm"
              >
                {isProcessing ? "SYNTHESIZING ADVISORY..." : "Confirm Accuracy and Generate Advisory"}
              </button>
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-950/20 p-4 border border-red-900/50">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-1000">
            <div className="mb-20 p-5 bg-emerald-50 border border-emerald-100 rounded text-center">
               <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">Findings Verified &bull; Advisory Cluster Active</p>
            </div>

            {brief.advisory ? (
              <section className="space-y-24">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-4 mb-8">Executive Strategic Takeaways</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {brief.advisory.executiveSignals.map((sig, i) => (
                      <div key={i} className="p-8 bg-zinc-950 text-white rounded-sm border-l-4 border-emerald-500">
                        <span className="text-[10px] font-black text-zinc-500 uppercase block mb-4">Strategic Signal 0{i+1}</span>
                        <p className="text-sm font-serif leading-relaxed italic">"{sig}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50 p-12 border border-zinc-100">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-200 pb-4 mb-8">Professional Analytic Observations</h4>
                  <div className="space-y-8">
                    {brief.advisory.readersMiss.map((item, i) => (
                      <div key={i} className="flex gap-6 items-start">
                        <span className="text-2xl font-black text-zinc-200">/</span>
                        <p className="text-lg text-zinc-900 font-serif leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                   <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-4 mb-8">Strategic Forecasts</h4>
                     <ul className="space-y-6">
                       {brief.advisory.scenarios.map((sc, i) => (
                         <li key={i} className="text-sm text-zinc-800 font-serif leading-relaxed border-b border-zinc-100 pb-4">
                           {sc}
                         </li>
                       ))}
                     </ul>
                   </div>
                   <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-4 mb-8">Operational Considerations</h4>
                     <div className="p-10 bg-zinc-950 text-zinc-100 rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                           <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${brief.advisory.risks.level === 'Critical' ? 'bg-red-600' : brief.advisory.risks.level === 'High' ? 'bg-orange-600' : 'bg-emerald-600'}`}>
                             {brief.advisory.risks.level} Complexity
                           </span>
                        </div>
                        <p className="text-sm font-serif italic text-zinc-400 mb-8 leading-relaxed">"{brief.advisory.risks.details}"</p>
                        <div className="space-y-4">
                          {brief.advisory.risks.flags.map((flag, i) => (
                            <div key={i} className="text-[9px] font-black text-red-400 uppercase tracking-[0.2em] border-b border-zinc-900 pb-2 flex gap-2">
                               <span className="text-red-600">⚠</span> {flag}
                            </div>
                          ))}
                        </div>
                     </div>
                   </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 border-b border-zinc-100 pb-4 mb-8">Strategic Leverage & Next Steps</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {brief.advisory.leverage.map((lev, i) => (
                      <div key={i} className="p-6 bg-zinc-50 border-l-[6px] border-zinc-950 text-zinc-900 font-serif text-lg leading-relaxed">
                        {lev}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-12 border-2 rounded-sm text-center ${getReadinessColor(brief.advisory.signingReadiness.status)}`}>
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4">Advisory Readiness Assessment</h4>
                   <h5 className="text-4xl font-black mb-6 uppercase tracking-tighter">{brief.advisory.signingReadiness.status}</h5>
                   <p className="text-sm font-serif max-w-2xl mx-auto leading-relaxed italic opacity-80">
                     {brief.advisory.signingReadiness.justification}
                   </p>
                </div>

                <div className="bg-zinc-950 p-12 rounded-sm text-zinc-100">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8">Consultation Directives</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {brief.advisory.professionalQuestions.map((q, i) => (
                       <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 text-sm font-black uppercase tracking-wider leading-relaxed text-zinc-300">
                         "{q}"
                       </div>
                     ))}
                   </div>
                </div>
              </section>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-300">
                <div className="w-12 h-12 border-4 border-zinc-300 border-t-zinc-950 rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Developing Strategic Advisory Insights...</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-40 pt-12 border-t border-zinc-200">
            <p className="text-center text-[10px] font-black text-red-600 uppercase tracking-[0.5em] mb-12 italic leading-relaxed px-10">
              "{brief.disclaimer}"
            </p>
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400">
              <p>LexVault Professional Advisory Cluster &bull; Authority v2.9</p>
              <p className="bg-zinc-100 px-4 py-1.5 rounded-full text-zinc-900 border border-zinc-200">CONFIDENTIAL SESSION PROTECTED</p>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default SmartBriefView;
