
import React, { useState, useEffect } from 'react';

interface PinOverlayProps {
  onSuccess: (pin: string) => void;
  onCancel: () => void;
  isSetting?: boolean;
  error?: string;
}

const PinOverlay: React.FC<PinOverlayProps> = ({ onSuccess, onCancel, isSetting, error: externalError }) => {
  const [pin, setPin] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [firstPin, setFirstPin] = useState('');
  const [localError, setLocalError] = useState('');

  const displayError = externalError || localError;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setLocalError('');
    }
  };

  const handleClear = () => setPin(prev => prev.slice(0, -1));

  useEffect(() => {
    if (pin.length >= 4) {
      if (isSetting) {
        if (pin.length === 6 || (pin.length >= 4 && !confirming)) {
          // Logic for finishing? Let's assume user hits "Confirm" for variable length
        }
      } else if (pin.length === 6) {
        // Auto-submit for 6 digits if not setting? 
        // Better to have a confirm button for variable 4-6
      }
    }
  }, [pin]);

  const handleConfirm = () => {
    if (pin.length < 4) {
      setLocalError('PIN must be 4-6 digits.');
      return;
    }

    if (isSetting) {
      if (!confirming) {
        setFirstPin(pin);
        setPin('');
        setConfirming(true);
      } else {
        if (pin === firstPin) {
          onSuccess(pin);
        } else {
          setLocalError('PINs do not match. Resetting.');
          setPin('');
          setConfirming(false);
        }
      }
    } else {
      onSuccess(pin);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xs text-center">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 text-zinc-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        
        <h2 className="text-xl font-bold mb-1">
          {isSetting ? (confirming ? "Confirm Security PIN" : "Create Security PIN") : "LexRoom Protected"}
        </h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-black mb-10">
          {confirming ? "Verify access key" : "Enter identification code"}
        </p>

        <div className="flex justify-center gap-4 mb-10">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full border border-zinc-700 transition-all duration-200 ${i < pin.length ? 'bg-zinc-100 scale-125' : 'bg-transparent'}`}
            />
          ))}
        </div>

        {displayError && (
          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-6 animate-bounce">
            {displayError}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Cancel', 0, 'Clear'].map((btn) => (
            <button
              key={btn}
              onClick={() => {
                if (typeof btn === 'number') handleDigit(btn.toString());
                else if (btn === 'Cancel') onCancel();
                else if (btn === 'Clear') handleClear();
              }}
              className={`w-full aspect-square rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                typeof btn === 'number' 
                  ? 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800' 
                  : 'text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-100'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <button 
          onClick={handleConfirm}
          className="w-full py-4 bg-zinc-100 text-zinc-950 font-black rounded hover:bg-zinc-200 transition-all uppercase tracking-widest text-xs"
        >
          {confirming ? 'Initialize' : 'Confirm'}
        </button>
      </div>
    </div>
  );
};

export default PinOverlay;
