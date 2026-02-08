
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import VaultCard from '../components/VaultCard';
import Logo from '../components/Logo';

const VerifyEmail: React.FC = () => {
  const { user, verifyCode, resendVerificationCode, isAuthenticated } = useVault();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('Verification email sent. Check your inbox or spam folder.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.isEmailVerified) return <Navigate to="/dashboard" replace />;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const result = verifyCode(fullCode);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || "The code provided is incorrect.");
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setSuccess('New security code dispatched. Check inbox or spam.');
    setError('');
    await resendVerificationCode();
    setResendCooldown(60);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Logo size="xl" showText={false} />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase text-white">Identity Verification</h2>
          <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Security Clearance Required</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-800/50 text-emerald-500 text-xs text-center rounded font-bold uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
            {success}
          </div>
        )}

        <VaultCard title="Professional Authentication">
          <div className="text-center mb-8">
            <p className="text-zinc-400 text-sm font-serif leading-relaxed mb-2">
              A secure verification code has been dispatched to:
            </p>
            <p className="text-zinc-100 font-bold text-sm tracking-tight">{user.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 bg-zinc-950 border border-zinc-800 rounded text-center text-xl font-black text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || code.some(d => !d)}
              className="w-full py-4 bg-zinc-50 text-zinc-950 font-black rounded hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {isSubmitting ? "Validating Credentials..." : "Verify Identity"}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-zinc-800 pt-8">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">Didn't receive a message?</p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                resendCooldown > 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Resend Security Code"}
            </button>
          </div>
        </VaultCard>

        <div className="mt-12 p-6 border border-zinc-800 rounded-lg bg-zinc-900/30 text-center">
          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
            Unverified sessions expire automatically after 10 minutes. <br/>
            Check your <strong>spam</strong> or <strong>junk</strong> folder if the message does not appear within 2 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
