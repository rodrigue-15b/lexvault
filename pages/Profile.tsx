
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import VaultCard from '../components/VaultCard';
import Logo from '../components/Logo';

const Profile: React.FC = () => {
  const { user, logout, resendVerificationCode } = useVault();
  const navigate = useNavigate();

  if (!user) return null;

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const infoRow = (label: string, value: string | number) => (
    <div className="flex flex-col space-y-1 py-3 border-b border-zinc-800 last:border-0">
      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-medium text-zinc-300 font-mono tracking-tight">{value}</span>
    </div>
  );

  const handleStartVerification = async () => {
    await resendVerificationCode();
    navigate('/verify');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-screen">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <div className="h-8 w-px bg-zinc-800 hidden md:block"></div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Identity Profile</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Professional Records Management</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/dashboard" 
            className="px-4 py-2 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-zinc-900 transition-colors"
          >
            ← Back to Workspace
          </Link>
          <button 
            onClick={() => { logout(); navigate('/'); }} 
            className="px-4 py-2 bg-red-600/10 border border-red-900/50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-600 hover:text-white transition-all"
          >
            End Secure Session
          </button>
        </div>
      </header>

      {!user.isEmailVerified && (
        <div className="mb-8 p-4 bg-zinc-900 border border-emerald-900/30 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Verification Recommended</p>
              <p className="text-[11px] text-zinc-400 font-medium">Email verification recommended for account recovery and identity security.</p>
            </div>
          </div>
          <button 
            onClick={handleStartVerification}
            className="px-4 py-1.5 bg-emerald-600/10 border border-emerald-600/50 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded hover:bg-emerald-600 hover:text-white transition-all"
          >
            Verify Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
        <VaultCard title="Professional Credentials">
          <div className="space-y-1">
            {infoRow("Verified Name", user.name)}
            {infoRow("Registered Email", user.email)}
            {infoRow("Account Identifier", user.id)}
            {infoRow("Role / Profession", user.role)}
            {infoRow("Organization", user.organization || "Independent Entity")}
            {infoRow("Account Registration Date", formatDate(user.createdAt))}
            {infoRow("Last Authorized Login", formatDate(user.lastLogin))}
          </div>
        </VaultCard>

        <VaultCard title="Platform Access Status">
          <div className="space-y-1">
            <div className="flex flex-col space-y-1 py-3 border-b border-zinc-800">
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Access Level</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white uppercase tracking-tighter">UNRESTRICTED PROFESSIONAL</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">ACTIVE</span>
              </div>
            </div>
            {infoRow("Account Validity", "Continuous")}
            {infoRow("Service Type", "Pro-Grade Advisory")}
            {infoRow("Reviews Processed", `${user.docsProcessed} Cumulative`)}
          </div>
          <div className="mt-8 p-6 bg-zinc-950/50 border border-zinc-800 rounded text-center">
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-relaxed">
                LexVault is provided as an open professional utility. No billing information is required for unrestricted use of the advisory cluster.
            </p>
          </div>
        </VaultCard>
      </div>

      <div className="mt-12 p-8 border border-zinc-800 rounded-lg bg-zinc-900/30 text-center">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Confidentiality Verification</h3>
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
          Identity records are maintained solely for authorized workspace access. Advisory findings and document reviews are never permanently linked to your profile identity within our primary processing cluster.
        </p>
      </div>
    </div>
  );
};

export default Profile;
