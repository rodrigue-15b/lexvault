
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VaultCard from '../components/VaultCard';
import { useVault } from '../context/VaultContext';
import Logo from '../components/Logo';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useVault();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Access Recovery</h2>
          <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Security Restore Protocol</p>
        </div>

        <VaultCard title="Verification Request">
          {sent ? (
            <div className="text-center py-8">
              <p className="text-emerald-500 font-black mb-4 italic uppercase tracking-widest text-xs">Request Received.</p>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-serif">
                If an identity exists for {email}, recovery instructions have been dispatched. 
                Please check your encrypted mail tunnel.
              </p>
              <Link to="/login" className="text-zinc-100 font-black text-xs uppercase tracking-widest hover:underline">Return to Terminal</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Verified Email Identity</label>
                <input 
                  type="email"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors text-sm font-medium"
                  placeholder="identity@enterprise.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full py-4 bg-zinc-100 text-zinc-950 font-black rounded hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs">
                Initialize Recovery
              </button>
            </form>
          )}
        </VaultCard>
      </div>
    </div>
  );
};

export default ForgotPassword;
