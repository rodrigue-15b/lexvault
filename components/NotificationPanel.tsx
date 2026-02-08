
import React from 'react';
import { useVault } from '../context/VaultContext';
import { Notification } from '../types';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, clearNotifications } = useVault();

  const getTypeStyle = (type: Notification['type']) => {
    switch (type) {
      case 'security': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'system': return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
      default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 max-h-[500px] overflow-hidden flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Vault Activity Feed</h3>
        <button 
          onClick={clearNotifications}
          className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 uppercase transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">No recent alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getTypeStyle(notif.type)}`}>
                    {notif.type}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600">
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-serif">
                  {notif.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-800 text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
