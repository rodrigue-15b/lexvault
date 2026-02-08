
import React from 'react';

interface VaultCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const VaultCard: React.FC<VaultCardProps> = ({ children, title, className = "" }) => {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default VaultCard;
