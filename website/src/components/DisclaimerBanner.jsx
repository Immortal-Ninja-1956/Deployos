import { useState } from 'react';
import { X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('disclaimer-dismissed') === 'true';
  });
  const [shouldRender, setShouldRender] = useState(!isDismissed);
  const [animateOut, setAnimateOut] = useState(false);

  if (!shouldRender) return null;

  const handleDismiss = () => {
    setAnimateOut(true);
    sessionStorage.setItem('disclaimer-dismissed', 'true');
    setTimeout(() => {
      setShouldRender(false);
      setIsDismissed(true);
    }, 300);
  };

  return (
    <div 
      className={`bg-signal text-panel font-bold flex items-center justify-center py-2 px-10 text-xs font-arcade tracking-wider select-none relative transition-all duration-300 ease-in-out ${
        animateOut ? 'opacity-0 max-h-0 py-0 border-none overflow-hidden' : 'max-h-20 opacity-100'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center text-center">
        <span className="animate-pulse mr-2">⚠️</span>
        NearMiss is an educational visualization. It is NOT an official planetary defense resource.
        <span className="animate-pulse ml-2">⚠️</span>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-panel hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
        aria-label="Dismiss disclaimer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
