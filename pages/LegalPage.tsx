
import React from 'react';
import { useParams, Link } from 'react-router-dom';

const LEGAL_CONTENT: Record<string, { title: string, content: string }> = {
  'privacy': {
    title: 'Privacy Policy',
    content: 'LexVault is built on the principle of absolute digital privacy. We do not track users across the web. We do not sell metadata. Your identity is used solely for terminal access and subscription validation. All document contents are processed in volatile memory clusters and destroyed immediately after your session ends.'
  },
  'terms': {
    title: 'Terms of Service',
    content: 'By accessing the LexVault terminal, you agree to use our stateless intelligence engine for lawful professional purposes. Users are responsible for ensuring they have the rights to the documents uploaded. Document processing is subject to plan-specific page and volume limits.'
  },
  'zero-retention': {
    title: 'Zero-Data Retention Policy',
    content: 'Our architecture is "stateless by design." LexVault does not maintain file servers for user documents. When you ingest a file, it exists only in encrypted RAM buffers. Refreshing your browser, timing out due to inactivity, or manual purging triggers a secure wipe of all temporary storage clusters.'
  },
  'security': {
    title: 'Security Overview',
    content: 'LexVault utilizes TLS 1.3 for all data in transit. In-memory processing is isolated at the virtual cluster level. We leverage Gemini 3.0 Enterprise models with strict zero-training constraints, ensuring your professional data never contributes to any external knowledge base.'
  }
};

const LegalPage: React.FC = () => {
  const { slug } = useParams();
  const doc = LEGAL_CONTENT[slug || ''] || { title: 'Legal', content: 'Document not found.' };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 md:p-20">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
            <Link to="/" className="text-zinc-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                ← Back to Portal
            </Link>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-12 rounded-lg">
            <h1 className="text-4xl font-black mb-10 tracking-tighter">{doc.title}</h1>
            <div className="space-y-6 text-zinc-400 leading-relaxed font-serif text-lg">
                <p>{doc.content}</p>
                <p>Last Modified: June 12, 2024</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
