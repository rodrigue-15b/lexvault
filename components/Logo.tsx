
import React from 'react';
import { Link } from 'react-router-dom';
import { useVault } from '../context/VaultContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

/**
 * LexVault Enterprise Logo Component
 * Features a custom SVG vault icon with layered document elements.
 */
const Logo: React.FC<LogoProps> = ({ className = "", size = "md", showText = true }) => {
  const { isAuthenticated } = useVault();
  
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14"
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl"
  };

  return (
    <Link 
      to={isAuthenticated ? "/dashboard" : "/"} 
      className={`inline-flex items-center gap-3 group transition-opacity hover:opacity-90 ${className}`}
      aria-label="LexVault secure document platform"
    >
      <div className={`${iconSizes[size]} text-zinc-100 flex-shrink-0`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Document Layer 1 (Background) */}
          <rect x="12" y="4" width="22" height="28" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.2" />
          {/* Document Layer 2 (Middle) */}
          <rect x="8" y="8" width="22" height="28" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Main Vault Face (Foreground) */}
          <rect x="4" y="12" width="22" height="26" rx="1.5" fill="currentColor" />
          {/* Dial Detail - High Contrast black on white face */}
          <circle cx="15" cy="25" r="5" stroke="#09090b" strokeWidth="2.5" fill="none" />
          <path d="M15 20V25M15 25L18.5 28.5" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-black tracking-tighter text-white uppercase`}>
          LEX <span className="text-zinc-500">VAULT</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
