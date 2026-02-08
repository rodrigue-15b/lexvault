
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Landing: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <Logo />
        <div className="flex gap-8 items-center text-sm font-medium">
          <Link to="/login" className="text-zinc-400 hover:text-zinc-50 transition-colors font-bold uppercase tracking-widest text-[11px]">Professional Login</Link>
          <Link to="/signup" className="px-5 py-2.5 rounded bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition-all font-black uppercase tracking-widest text-[11px]">Request Access</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-20">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Zero-Retention Confidentiality Guarantee</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white">
            Clarity for the <br/><span className="text-zinc-600 italic">Regulated World.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-12">
            LexVault provides confidential document review and professional-grade insights for sensitive materials. Secure your decision-making with authoritative analysis grounded strictly in your documentation. <strong>Now accessible to all professionals without restriction.</strong>
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/signup" className="px-10 py-5 bg-emerald-600 text-white font-black rounded hover:bg-emerald-500 transition-all text-lg shadow-lg shadow-emerald-900/20 uppercase tracking-widest">
              Initialize Free Access
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { title: "Stateless Intelligence", desc: "Our engine processes data in volatile memory clusters, ensuring zero persistence once your session ends." },
            { title: "Grounded Advisory", desc: "Strategic insights generated strictly from your specific documentation, avoiding external assumptions." },
            { title: "Professional Grade", desc: "Designed for legal, medical, and engineering professionals requiring high-density analysis." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <h3 className="text-sm font-black text-zinc-200 uppercase tracking-widest mb-4">{feature.title}</h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-medium uppercase tracking-tight">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-20 border-t border-zinc-900 px-8 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1">
                <div className="mb-6">
                    <Logo size="sm" />
                </div>
                <p className="text-zinc-600 text-xs leading-relaxed font-medium uppercase tracking-tight">
                    Confidential document review and advisory services for legal, medical, and financial professionals. Built for absolute privacy.
                </p>
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Workspace Access</h4>
                <ul className="space-y-3 text-xs text-zinc-500 font-bold">
                    <li><Link to="/login" className="hover:text-zinc-100">Professional Login</Link></li>
                    <li><Link to="/signup" className="hover:text-zinc-100">Request Credentials</Link></li>
                    <li><Link to="/legal/security" className="hover:text-zinc-100">Security Standards</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Confidentiality Standards</h4>
                <ul className="space-y-3 text-xs text-zinc-500 font-bold">
                    <li><Link to="/legal/privacy" className="hover:text-zinc-100">Confidentiality Policy</Link></li>
                    <li><Link to="/legal/terms" className="hover:text-zinc-100">Service Engagement Terms</Link></li>
                    <li><Link to="/legal/zero-retention" className="hover:text-zinc-100">Zero-Retention Standards</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">Advisory Support</h4>
                <ul className="space-y-3 text-xs text-zinc-500 font-bold">
                    <li><span className="text-zinc-700">Support Terminal Available to All Users</span></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 text-center">
            <p className="text-zinc-700 text-[10px] tracking-widest uppercase font-black">&copy; 2024 LexVault Confidential Advisory. Unrestricted Professional Access.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
