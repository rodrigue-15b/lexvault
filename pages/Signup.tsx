
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import VaultCard from '../components/VaultCard';
import Logo from '../components/Logo';
import { User } from '../types';

const Signup: React.FC = () => {
  const { signup } = useVault();
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    organization: string;
    role: User['role'];
    password: string;
  }>({
    name: '',
    email: '',
    organization: '',
    role: 'Attorney',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) return;
    await signup(formData.email, formData.name, formData.role, formData.organization);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">Register Workspace</h2>
          <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Enterprise Access Registration</p>
        </div>

        <VaultCard title="Professional Profile Details">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Full Name</label>
                <input 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 text-sm font-medium"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Professional Email</label>
                <input 
                  type="email"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 text-sm font-medium"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Organization</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 text-sm font-medium"
                  value={formData.organization}
                  onChange={e => setFormData({...formData, organization: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Profession</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 text-sm appearance-none font-bold text-zinc-300"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as User['role']})}
                >
                  <option>Attorney</option>
                  <option>Physician</option>
                  <option>Engineer</option>
                  <option>Financial Analyst</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Security Key</label>
              <input 
                type="password"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 focus:outline-none focus:border-zinc-500 text-sm"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
                <input 
                    type="checkbox" 
                    id="terms" 
                    required 
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="terms" className="text-xs text-zinc-500 leading-relaxed font-medium">
                    I acknowledge the <Link to="/legal/terms" className="text-zinc-300 underline font-bold">Terms of Engagement</Link> and the <Link to="/legal/zero-retention" className="text-zinc-300 underline font-bold">Confidentiality Standards</Link>.
                </label>
            </div>

            <button 
                type="submit" 
                disabled={!acceptedTerms}
                className="w-full py-4 bg-emerald-600 text-white font-black rounded hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
            >
              Initialize Workspace Access
            </button>
          </form>
        </VaultCard>

        <p className="mt-8 text-center text-zinc-500 text-[10px] font-black uppercase tracking-widest">
          Already registered? <Link to="/login" className="text-zinc-300 font-black hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
