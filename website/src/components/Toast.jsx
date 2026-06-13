import { AlertCircle } from 'lucide-react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-4 bg-void arcade-panel p-4 shadow-xl max-w-sm select-none">
      <AlertCircle className="text-signal shrink-0 glow-magenta" size={20} />
      <p className="text-sm font-mono text-ink/90 leading-snug uppercase tracking-wide">{message}</p>
      <button 
        onClick={onClose} 
        className="bg-void border border-edge hover:border-signal text-edge hover:text-signal px-1.5 py-0.5 font-display text-[8px] cursor-pointer shrink-0 ml-1"
      >
        X
      </button>
    </div>
  );
}
