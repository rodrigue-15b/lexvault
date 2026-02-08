
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import VaultCard from '../components/VaultCard';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const { login } = useVault();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const message = (location.state as any)?.message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      if (result.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || "Invalid credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase text-white">LexVault Access</h2>
          <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Security Terminal Ingress</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-800 text-yellow-500 text-xs text-center rounded font-bold uppercase tracking-widest">
            {message}
          </div>
        )}

        <VaultCard title="Credentials Required">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Email Identity</label>
              <input 
                type="email"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors text-sm font-medium text-white"
                placeholder="identity@enterprise.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Security Key</label>
                <Link to="/forgot-password" className="text-[9px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">Recovery?</Link>
              </div>
              <input 
                type="password"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors text-sm text-white"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full py-4 bg-zinc-50 text-zinc-950 font-black rounded hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs">
              Open Vault
            </button>
          </form>
        </VaultCard>

        <p className="mt-8 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          New terminal user? <Link to="/signup" className="text-zinc-300 font-black hover:underline">Request Initialization</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
