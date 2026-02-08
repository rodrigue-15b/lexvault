
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { useNavigate } from 'react-router-dom';
import VaultCard from '../components/VaultCard';
import Logo from '../components/Logo';
import { User, Notification } from '../types';
import { VaultService } from '../services/vaultService';

type AdminTab = 'operations' | 'identities' | 'strategy' | 'communications' | 'logs' | 'configuration';

const Admin: React.FC = () => {
  const { 
    user, logout, adminGetAllUsers, adminUpdateUser, adminDeleteUser, 
    adminBroadcastMessage, adminUpdateSettings, adminGetAuditLogs, systemSettings 
  } = useVault();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('operations');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [broadcastType, setBroadcastType] = useState<Notification['type']>('system');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Strategy Advisor State
  const [advisoryInput, setAdvisoryInput] = useState('');
  const [advisoryHistory, setAdvisoryHistory] = useState<{ query: string; response: string }[]>([]);
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(false);
  const advisorScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/login');
      return;
    }
    refreshData();
  }, [user, navigate]);

  useEffect(() => {
    if (advisorScrollRef.current) {
      advisorScrollRef.current.scrollTop = advisorScrollRef.current.scrollHeight;
    }
  }, [advisoryHistory, isAdvisoryLoading]);

  const refreshData = () => {
    setUsers(adminGetAllUsers());
    setAuditLogs(adminGetAuditLogs());
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.organization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const total = users.length;
    const activeLast24h = users.filter(u => Date.now() - u.lastLogin < 24 * 60 * 60 * 1000).length;
    const totalDocs = users.reduce((acc, u) => acc + u.docsProcessed, 0);
    return { total, activeLast24h, totalDocs };
  }, [users]);

  const handleToggleSuspension = (targetUser: User) => {
    if (confirm(`Confirm administrative action: ${targetUser.isSuspended ? 'Reactivate' : 'Suspend'} access for ${targetUser.email}?`)) {
        adminUpdateUser({ ...targetUser, isSuspended: !targetUser.isSuspended });
        refreshData();
    }
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`CRITICAL ACTION: Permanently delete account and all data for ${email}? This cannot be undone.`)) {
        adminDeleteUser(email);
        refreshData();
    }
  };

  const handleSendBroadcast = () => {
    if (!broadcastContent.trim()) return;
    adminBroadcastMessage(broadcastContent, 'all', broadcastType);
    setBroadcastContent('');
    alert("System broadcast successfully dispatched to all active users.");
    refreshData();
  };

  const handleToggleMaintenance = () => {
    adminUpdateSettings({ maintenanceMode: !systemSettings.maintenanceMode });
  };

  const handleAdvisoryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryInput.trim() || isAdvisoryLoading) return;

    const query = advisoryInput.trim();
    setAdvisoryInput('');
    setIsAdvisoryLoading(true);

    try {
      const response = await VaultService.generateAdminAdvisory(
        query,
        {
          totalUsers: stats.total,
          activeUsers24h: stats.activeLast24h,
          totalDocs: stats.totalDocs
        },
        advisoryHistory
      );
      setAdvisoryHistory(prev => [...prev, { query, response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdvisoryLoading(false);
    }
  };

  const NavItem: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest text-left border-l-2 transition-all ${
        activeTab === tab ? 'border-emerald-500 bg-emerald-500/5 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen flex bg-zinc-950">
      <aside className="w-64 border-r border-zinc-900 p-6 flex flex-col flex-shrink-0">
        <div className="mb-12">
            <Logo size="sm" />
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-2 px-1">Restricted Oversight</p>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
            <NavItem tab="operations" label="Operations Overview" />
            <NavItem tab="identities" label="System Identities" />
            <NavItem tab="strategy" label="Strategic Oversight" />
            <NavItem tab="communications" label="System Messaging" />
            <NavItem tab="logs" label="Audit Terminal" />
            <NavItem tab="configuration" label="Global Parameters" />
        </nav>
        <div className="mt-12 pt-6 border-t border-zinc-900">
            <button 
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full py-3 bg-red-600/10 border border-red-900/50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-600 hover:text-white transition-all"
            >
                End Root Session
            </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Administration</h1>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">Platform Control Terminal &bull; {activeTab.replace('_', ' ')}</p>
            </div>
            <div className="flex gap-4">
                <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${systemSettings.maintenanceMode ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                        {systemSettings.maintenanceMode ? 'Operational Restriction Active' : 'Cluster Status: Nominal'}
                    </span>
                </div>
            </div>
        </header>

        {activeTab === 'operations' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <VaultCard className="p-8 text-center border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Workspace Identities</p>
                        <p className="text-4xl font-black text-white font-mono">{stats.total}</p>
                    </VaultCard>
                    <VaultCard className="p-8 text-center border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Active Sessions (24h)</p>
                        <p className="text-4xl font-black text-emerald-500 font-mono">{stats.activeLast24h}</p>
                    </VaultCard>
                    <VaultCard className="p-8 text-center border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Advisory Extractions</p>
                        <p className="text-4xl font-black text-white font-mono">{stats.totalDocs}</p>
                    </VaultCard>
                    <VaultCard className="p-8 text-center border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">System Health Index</p>
                        <p className="text-4xl font-black text-emerald-500 font-mono">100%</p>
                    </VaultCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <VaultCard title="System Performance Indices">
                        <div className="space-y-6">
                           {[
                               { label: 'Intelligence Model Latency', value: '240ms', status: 'Optimal' },
                               { label: 'Cluster In-Memory Usage', value: '14.2 GB', status: 'Stable' },
                               { label: 'Document Buffer Throughput', value: '12 docs/min', status: 'Nominal' },
                               { label: 'API Identity Response', value: '15ms', status: 'Optimal' }
                           ].map((idx, i) => (
                               <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                                   <div>
                                       <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{idx.label}</p>
                                       <p className="text-sm font-bold text-white mt-1">{idx.value}</p>
                                   </div>
                                   <span className="text-[9px] font-black uppercase text-emerald-500 px-2 py-0.5 border border-emerald-500/20 rounded">{idx.status}</span>
                               </div>
                           ))}
                        </div>
                    </VaultCard>
                    <VaultCard title="Operational Status Trail">
                         <div className="h-48 flex flex-col items-center justify-center opacity-40">
                             <svg className="w-10 h-10 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">No Disruptions Logged</p>
                         </div>
                    </VaultCard>
                </div>
            </div>
        )}

        {activeTab === 'identities' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded">
                    <input 
                        type="text" 
                        placeholder="Search identities by name, email, or organization..." 
                        className="bg-transparent text-sm w-full outline-none px-2 font-medium"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <VaultCard className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Advisory Volume</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900 text-[11px] font-medium text-zinc-300">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className={`hover:bg-zinc-800/30 transition-colors ${u.isSuspended ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-zinc-100">{u.name}</div>
                                        <div className="text-zinc-600 font-mono">{u.email}</div>
                                        <div className="text-[9px] uppercase tracking-tighter text-zinc-500 mt-1">{u.organization || 'Independent'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.isSuspended ? (
                                            <span className="text-red-500 font-black uppercase tracking-widest text-[9px]">Suspended</span>
                                        ) : (
                                            <span className="text-emerald-500 font-black uppercase tracking-widest text-[9px]">Authorized</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono">
                                        {u.docsProcessed} Cumulative
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 font-mono">
                                        {new Date(u.lastLogin).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleToggleSuspension(u)}
                                                className={`px-2 py-1 rounded text-[9px] font-black uppercase border transition-all ${
                                                    u.isSuspended ? 'border-emerald-900 text-emerald-500 hover:bg-emerald-950' : 'border-red-900 text-red-500 hover:bg-red-950'
                                                }`}
                                            >
                                                {u.isSuspended ? 'Restore' : 'Suspend'}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.email)}
                                                className="px-2 py-1 rounded text-[9px] font-black uppercase border border-zinc-800 text-zinc-500 hover:bg-zinc-900"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </VaultCard>
            </div>
        )}

        {activeTab === 'strategy' && (
            <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
                <VaultCard title="Administrative Advisor" className="flex-1 flex flex-col min-h-[600px] border-zinc-800">
                    <div 
                        ref={advisorScrollRef}
                        className="flex-1 overflow-y-auto p-2 space-y-8"
                    >
                        {advisoryHistory.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 text-center space-y-4">
                                <svg className="w-12 h-12 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                                <div>
                                    <p className="text-sm font-bold text-zinc-400 font-serif">Awaiting administrative inquiry...</p>
                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Request operational guidance for platform strategy.</p>
                                </div>
                            </div>
                        )}
                        {advisoryHistory.map((h, i) => (
                            <div key={i} className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-end">
                                    <div className="bg-zinc-800/50 border border-zinc-800 p-4 rounded max-w-[80%]">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Owner Query</p>
                                        <p className="text-sm font-medium text-zinc-100">{h.query}</p>
                                    </div>
                                </div>
                                <div className="flex justify-start">
                                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg max-w-[90%] font-serif">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-4">Strategic Advisory Observation</p>
                                        <div className="text-sm leading-relaxed text-zinc-300 space-y-4 whitespace-pre-wrap">
                                            {h.response}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isAdvisoryLoading && (
                            <div className="flex justify-start animate-in fade-in duration-300">
                                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                        <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Synthesizing platform guidance...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <form 
                        onSubmit={handleAdvisoryRequest}
                        className="mt-6 pt-6 border-t border-zinc-800"
                    >
                        <div className="relative flex items-center">
                            <input 
                                type="text"
                                value={advisoryInput}
                                onChange={(e) => setAdvisoryInput(e.target.value)}
                                disabled={isAdvisoryLoading}
                                placeholder={isAdvisoryLoading ? "Generating strategy findings..." : "Ask for operational guidance..."}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded px-6 py-4 pr-32 text-sm font-medium focus:outline-none focus:border-emerald-900 transition-colors"
                            />
                            <button 
                                type="submit"
                                disabled={!advisoryInput.trim() || isAdvisoryLoading}
                                className="absolute right-2 px-6 py-2 bg-zinc-100 text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded hover:bg-zinc-200 transition-all disabled:opacity-50"
                            >
                                Dispatch
                            </button>
                        </div>
                        <div className="mt-3 flex justify-between items-center text-[9px] font-black text-zinc-600 uppercase tracking-widest px-2">
                            <span>Advisory grounded in current platform metrics.</span>
                            <span>Confidentiality standards in effect.</span>
                        </div>
                    </form>
                </VaultCard>
            </div>
        )}

        {activeTab === 'communications' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <VaultCard title="Dispatch System Broadcast" className="border-zinc-800">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Dispatch Type</label>
                                        <select 
                                            value={broadcastType}
                                            onChange={e => setBroadcastType(e.target.value as any)}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            <option value="system">System Advisory</option>
                                            <option value="security">Security Alert</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Transmission Content</label>
                                    <textarea 
                                        placeholder="Compose authoritative message for global dispatch..."
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-medium text-zinc-100 min-h-[150px] focus:outline-none focus:border-emerald-500"
                                        value={broadcastContent}
                                        onChange={e => setBroadcastContent(e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={handleSendBroadcast}
                                    disabled={!broadcastContent.trim()}
                                    className="w-full py-4 bg-emerald-600 text-white font-black rounded hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                                >
                                    Confirm Transmission Dispatch
                                </button>
                            </div>
                        </VaultCard>
                    </div>
                    <div className="space-y-6">
                        <VaultCard title="Dispatch Standards" className="border-zinc-800">
                            <div className="text-xs text-zinc-500 space-y-4 font-serif italic">
                                <p>“Broadcasts should maintain a professional, neutral tone consistent with LexVault branding.”</p>
                                <p>“Critical security alerts will trigger browser-level notifications for all active sessions.”</p>
                                <p>“Zero-Retention standards apply to all communication logs after 30 days.”</p>
                            </div>
                        </VaultCard>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <VaultCard title="Platform Security & Audit Trail" className="border-zinc-800">
                    <div className="space-y-1 font-mono">
                        <div className="grid grid-cols-4 text-[9px] font-black uppercase text-zinc-600 border-b border-zinc-800 pb-2 mb-2">
                            <span>Timestamp</span>
                            <span>Operation</span>
                            <span>Identifier</span>
                            <span className="text-right">Admin Identity</span>
                        </div>
                        {auditLogs.length === 0 ? (
                            <p className="text-center py-12 text-zinc-700 uppercase tracking-widest text-[10px]">Audit trail clear</p>
                        ) : (
                            auditLogs.map((log, i) => (
                                <div key={i} className="grid grid-cols-4 text-[10px] py-2 border-b border-zinc-900 last:border-0 hover:bg-zinc-800/20">
                                    <span className="text-zinc-500">{new Date(log.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                    <span className="font-bold text-zinc-300">{log.event}</span>
                                    <span className="text-zinc-500 truncate">{log.target}</span>
                                    <span className="text-right text-zinc-400">{log.admin}</span>
                                </div>
                            ))
                        )}
                    </div>
                </VaultCard>
            </div>
        )}

        {activeTab === 'configuration' && (
            <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
                <VaultCard title="Global Platform Parameters" className="border-zinc-800">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-white">Maintenance Mode</p>
                                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Restrict platform access for cluster updates</p>
                            </div>
                            <button 
                                onClick={handleToggleMaintenance}
                                className={`px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${
                                    systemSettings.maintenanceMode ? 'bg-orange-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                                }`}
                            >
                                {systemSettings.maintenanceMode ? 'Active' : 'Disabled'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Feature Entitlements (Global)</p>
                            {[
                                { id: 'lexRoom', label: 'Private Vault Storage' },
                                { id: 'advisory', label: 'Strategic Advisory Insights' },
                                { id: 'support', label: 'Support Analyst Channel' }
                            ].map((feat) => (
                                <div key={feat.id} className="flex items-center justify-between py-2 border-b border-zinc-900 last:border-0">
                                    <span className="text-xs font-bold text-zinc-300">{feat.label}</span>
                                    <button 
                                        onClick={() => adminUpdateSettings({ 
                                            featuresEnabled: { 
                                                ...systemSettings.featuresEnabled, 
                                                [feat.id]: !((systemSettings.featuresEnabled as any)[feat.id]) 
                                            } 
                                        })}
                                        className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all ${
                                            (systemSettings.featuresEnabled as any)[feat.id] ? 'bg-emerald-900/20 text-emerald-500' : 'bg-zinc-900 text-zinc-600'
                                        }`}
                                    >
                                        {(systemSettings.featuresEnabled as any)[feat.id] ? 'Authorized' : 'Restricted'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Global System Notice Banner</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter system notice content..."
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs font-medium text-white focus:outline-none"
                                    defaultValue={systemSettings.systemNotice || ''}
                                    onBlur={e => adminUpdateSettings({ systemNotice: e.target.value || null })}
                                />
                                <button 
                                    onClick={() => adminUpdateSettings({ systemNotice: null })}
                                    className="px-3 py-2 bg-zinc-900 text-zinc-500 text-[9px] font-black uppercase rounded"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </VaultCard>
            </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
