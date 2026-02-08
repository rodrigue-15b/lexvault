
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import Logo from '../components/Logo';
import { SupportMessage } from '../types';
import { VaultService } from '../services/vaultService';

const SupportPage: React.FC = () => {
  const { user } = useVault();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: SupportMessage = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseContent = await VaultService.generateSupportResponse(messages, userMsg.content);
      const assistantMsg: SupportMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: responseContent,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: SupportMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: "We encountered a temporary interruption in our advisory support channel. Please re-submit your inquiry.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
      <header className="flex justify-between items-center mb-8 flex-shrink-0">
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <div className="h-8 w-px bg-zinc-800 hidden md:block"></div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">Support Analyst Channel</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">Professional Advisory Support</p>
          </div>
        </div>
        <Link 
          to="/dashboard" 
          className="px-4 py-2 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-zinc-900 transition-colors"
        >
          ← Back to Workspace
        </Link>
      </header>

      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl relative">
        <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Support Analyst Connected</span>
          </div>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">
            Confidential Consultation: Purged on logout
          </p>
        </div>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              <div>
                <p className="text-sm font-bold text-zinc-400 font-serif">Awaiting professional inquiry...</p>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Questions regarding security, advisory features, or billing?</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] p-4 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-zinc-100 text-zinc-950 font-medium ml-12' 
                  : 'bg-zinc-800 text-zinc-100 border border-zinc-700 mr-12'
              }`}>
                <div className="flex justify-between items-center mb-1 gap-4">
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">
                    {msg.role === 'user' ? user?.name : 'Support Analyst'}
                  </span>
                  <span className="text-[8px] font-mono opacity-40">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed font-serif whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-lg flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
              </div>
            </div>
          )}
        </div>

        <form 
          onSubmit={handleSend}
          className="p-6 bg-zinc-900 border-t border-zinc-800 flex-shrink-0"
        >
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder={isTyping ? "Consultation in progress..." : "Submit your inquiry to a Support Analyst..."}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-6 py-4 pr-24 text-sm font-medium focus:outline-none focus:border-zinc-600 transition-colors disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 px-4 py-2 bg-zinc-100 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
          <div className="mt-3 flex justify-between items-center text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">
            <span>Consultations are private and not archived.</span>
            <span>Zero Document Access Standards in effect.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
