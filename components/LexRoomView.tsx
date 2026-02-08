
import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { SavedBrief } from '../types';
import VaultCard from './VaultCard';

const LexRoomView: React.FC = () => {
  const { savedBriefs, deleteSavedBrief, wipeLexRoom, user } = useVault();
  const [selectedBrief, setSelectedBrief] = useState<SavedBrief | null>(null);

  if (selectedBrief) {
    return (
      <div className="animate-in fade-in duration-500">
        <button 
          onClick={() => setSelectedBrief(null)}
          className="mb-8 text-xs font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"
        >
          ← Back to Private Vault
        </button>
        <div className="bg-white text-zinc-950 p-12 rounded shadow-2xl">
          <header className="border-b-4 border-zinc-950 pb-6 mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Archived Advisory Record</h2>
            <h3 className="text-4xl font-serif font-black">{selectedBrief.customTitle}</h3>
            <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">Secured: {new Date(selectedBrief.savedAt).toLocaleString()}</p>
          </header>
          <div className="space-y-10">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Summary Abstract</h4>
              <p className="font-serif text-lg leading-relaxed">
                {selectedBrief.brief.advisory?.risks.details || selectedBrief.brief.extraction.clauses[0] || "No abstract available for this record."}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Primary Findings</h4>
              <ul className="list-disc list-inside space-y-2 font-serif text-sm">
                {selectedBrief.brief.extraction.rightsAndObligations.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div className="bg-zinc-50 p-6 border border-zinc-100 rounded">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Recommended Actions</h4>
               <ul className="space-y-2">
                 {(selectedBrief.brief.advisory?.leverage || []).map((a, i) => (
                   <li key={i} className="text-xs font-bold text-zinc-800 flex items-center gap-3">
                     <span className="w-1.5 h-1.5 bg-zinc-950 rounded-full"></span> {a}
                   </li>
                 ))}
                 {!selectedBrief.brief.advisory && (
                   <li className="text-xs text-zinc-500 italic">Stage 2 advisory insights not recorded for this brief.</li>
                 )}
               </ul>
            </div>
          </div>
          <footer className="mt-20 pt-6 border-t border-zinc-100 text-[9px] font-black uppercase tracking-widest text-zinc-400 flex justify-between">
            <span>Confidentiality Guaranteed for {user?.name}</span>
            <span className="text-emerald-600">Verified Secure Status</span>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-xl font-bold">Confidential Vault Storage</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Archived Advisory Summaries</p>
        </div>
        <button 
          onClick={() => { if(confirm("This will permanently remove all archived reviews and reset your access PIN. Continue?")) wipeLexRoom(); }}
          className="text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-900/50 px-3 py-1.5 rounded hover:bg-red-900/10 transition-all"
        >
          Purge Private Vault
        </button>
      </div>

      {savedBriefs.length === 0 ? (
        <div className="h-[400px] border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center p-12 bg-zinc-900/30">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-700">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Vault Empty</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-black max-w-xs">Review summaries must be manually saved to persist beyond the current workspace session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBriefs.map((sb) => (
            <VaultCard key={sb.id} className="hover:border-zinc-600 transition-all cursor-pointer flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-mono text-zinc-500 uppercase">{new Date(sb.savedAt).toLocaleDateString()}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteSavedBrief(sb.id); }}
                  className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              <h3 className="text-lg font-bold mb-3 font-serif line-clamp-2">{sb.customTitle}</h3>
              <p className="text-xs text-zinc-500 mb-6 line-clamp-3 leading-relaxed font-serif italic">
                "{ (sb.brief.advisory?.risks.details || sb.brief.extraction.clauses[0] || "Summary content secured").substring(0, 120) }..."
              </p>
              <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Confidential</span>
                <button 
                  onClick={() => setSelectedBrief(sb)}
                  className="text-[10px] font-black text-zinc-100 uppercase tracking-widest hover:underline"
                >
                  Open Record →
                </button>
              </div>
            </VaultCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default LexRoomView;
