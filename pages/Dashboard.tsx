
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVault } from '../context/VaultContext';
import VaultCard from '../components/VaultCard';
import { VaultService } from '../services/vaultService';
import PinOverlay from '../components/PinOverlay';
import LexRoomView from '../components/LexRoomView';
import NotificationPanel from '../components/NotificationPanel';
import Logo from '../components/Logo';

const Dashboard: React.FC = () => {
  const { 
    user, setDocument, currentDocument, setBrief, setProcessing, incrementUsage, 
    isProcessing, logout, isLexRoomUnlocked, unlockLexRoom, setLexRoomPin, lockLexRoom,
    notifications, markNotificationsAsRead, purgeSession, addNotification, systemSettings
  } = useVault();
  
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [view, setView] = useState<'workspace' | 'vault'>('workspace');
  const [error, setError] = useState<string | null>(null);
  const [pinMode, setPinMode] = useState<'verify' | 'setup' | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (notifications.length === 0) {
      addNotification('system', 'Workspace initialized. Document buffer ready for unrestricted submission.');
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (systemSettings.maintenanceMode) {
        setError("The platform is currently undergoing maintenance. Submissions are temporarily restricted.");
        return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      setError("This document does not contain sufficient readable information to provide a professional review.");
      addNotification('security', 'Submission rejected: No readable content detected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setDocument({
        name: file.name, size: file.size, type: file.type,
        content: content, pageCount: Math.ceil(content.length / 3000), timestamp: Date.now()
      });
      setError(null);
      addNotification('system', `Document "${file.name}" ready for professional review.`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!currentDocument || isProcessing) return;
    setProcessing(true);
    setError(null);

    try {
      const briefData = await VaultService.generateExtraction(
        currentDocument.content, 
        { filename: currentDocument.name, filetype: currentDocument.type }
      );
      setBrief(briefData as any);
      incrementUsage();
      setProcessing(false);
      addNotification('system', 'Review Stage 1 complete. Advisory insights pending verification.');
      navigate('/brief');
    } catch (err) {
      setError("The document review process encountered an unexpected interruption. Please re-submit.");
      addNotification('system', 'Review process interrupted due to system notification.');
      setProcessing(false);
    }
  };

  const handlePinSuccess = (pin: string) => {
    if (pinMode === 'setup') {
      setLexRoomPin(pin);
      setPinMode(null);
      setView('vault');
      addNotification('security', 'Private Vault secondary authentication activated.');
    } else {
      const result = unlockLexRoom(pin);
      if (result.success) {
        setPinMode(null);
        setView('vault');
      }
    }
  };

  if (systemSettings.maintenanceMode && !user.isAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
            <div className="max-w-md text-center">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 text-orange-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">System Under Maintenance</h1>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                    LexVault is currently undergoing professional cluster updates to improve advisory accuracy. Access will be restored shortly.
                </p>
                <button onClick={logout} className="px-6 py-2 bg-zinc-100 text-zinc-950 font-black rounded uppercase tracking-widest text-xs">End Session</button>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 min-h-screen">
      {pinMode && <PinOverlay isSetting={pinMode === 'setup'} onSuccess={handlePinSuccess} onCancel={() => setPinMode(null)} />}

      {systemSettings.systemNotice && (
        <div className="mb-8 p-3 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{systemSettings.systemNotice}</span>
            </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative">
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <div className="h-8 w-px bg-zinc-800 hidden md:block"></div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-3 uppercase">
              {view === 'workspace' ? 'Workspace' : 'Private Vault'}
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
              {user.name} &bull; {user.organization || 'Independent Professional'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 border border-zinc-800 rounded p-1 mr-2">
            <button onClick={() => {setView('workspace'); lockLexRoom();}} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'workspace' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Workspace</button>
            {systemSettings.featuresEnabled.lexRoom && (
                <button onClick={() => isLexRoomUnlocked ? setView('vault') : setPinMode(user.lexRoomPinHash ? 'verify' : 'setup')} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${view === 'vault' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Private Vault</button>
            )}
          </div>
          
          <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
            {systemSettings.featuresEnabled.support && (
                <Link to="/support" className="p-2 text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-2" title="Support Analyst">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="hidden xl:inline text-[9px] font-black uppercase tracking-widest">Support Analyst</span>
                </Link>
            )}

            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="p-2 text-zinc-500 hover:text-zinc-200 transition-colors relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border border-zinc-950"></span>
                )}
              </button>
              {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
            </div>

            <Link to="/profile" className="flex items-center gap-3 p-1 hover:bg-zinc-900 rounded-lg transition-all group border border-transparent hover:border-zinc-800 ml-2">
              <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 font-black text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-[9px] font-black text-zinc-100 uppercase tracking-widest leading-none mb-0.5">{user.name.split(' ')[0]}</p>
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Identity Profile</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {view === 'workspace' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2">
            <VaultCard className="min-h-[500px] flex flex-col border-zinc-800">
              {isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-12 h-12 border-2 border-zinc-500 border-t-zinc-50 rounded-full animate-spin mx-auto mb-8"></div>
                  <h3 className="text-xl font-bold mb-2 text-zinc-300 tracking-tight uppercase">Professional Review Underway</h3>
                  <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">Stage 1: Comprehensive Summary Findings</p>
                </div>
              ) : (
                <div className="p-8 h-full flex flex-col">
                  {currentDocument ? (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                      <div className="flex items-center justify-between mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center text-zinc-500">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-200 truncate max-w-[200px]">{currentDocument.name}</p>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{currentDocument.pageCount} Pages &bull; Volatile Memory Active</p>
                          </div>
                        </div>
                        <button onClick={purgeSession} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Wipe Workspace</button>
                      </div>
                      <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                        <h2 className="text-2xl font-black font-serif italic text-zinc-400">"Authoritative review grounded in documentation."</h2>
                        <button onClick={handleStartAnalysis} className="w-full py-5 bg-zinc-100 text-zinc-950 font-black rounded hover:bg-zinc-200 transition-all text-sm uppercase tracking-widest shadow-lg">Begin Stage 1 Review</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center group border-2 border-dashed border-zinc-800 rounded-lg hover:border-zinc-700 transition-all cursor-pointer bg-zinc-900/50" onClick={() => fileInputRef.current?.click()}>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".txt,.pdf,.doc,.docx" />
                      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-700 group-hover:text-zinc-500 transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      </div>
                      <h3 className="text-xl font-bold mb-2 uppercase tracking-tight">Submit Document for Review</h3>
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">Unrestricted access for professional document evaluation.</p>
                      <div className="mt-8 px-6 py-2 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded group-hover:bg-zinc-700 group-hover:text-white transition-all">Select Document</div>
                    </div>
                  )}
                  {error && <p className="mt-6 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}
                </div>
              )}
            </VaultCard>
          </div>
          <div className="space-y-6">
            <VaultCard title="Review Standards">
              <div className="text-xs text-zinc-400 space-y-4">
                <p><span className="font-black text-zinc-200">ADAPTIVE ANALYSIS:</span> Automatically triggered for scans or low-text files to infer intent.</p>
                <p><span className="font-black text-zinc-200">STRICT GROUNDING:</span> Analysis strictly avoids external assumptions or general knowledge.</p>
                <p><span className="font-black text-zinc-200">CONFIDENTIALITY:</span> Submitted data never persists beyond the active session.</p>
                <p><span className="font-black text-zinc-200">UNRESTRICTED:</span> All professional features are currently active and free of charge.</p>
              </div>
            </VaultCard>
          </div>
        </div>
      ) : (
        <LexRoomView />
      )}
    </div>
  );
};

export default Dashboard;
