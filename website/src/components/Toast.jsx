import { AlertCircle, X } from 'lucide-react';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 bg-panel/90 backdrop-blur-md border border-edge rounded-xl p-4 shadow-xl max-w-sm">
      <AlertCircle className="text-signal shrink-0" size={20} />
      <p className="text-sm font-body text-ink/90 leading-snug">{message}</p>
      <button onClick={onClose} className="text-dim hover:text-ink transition-colors shrink-0 ml-1">
        <X size={18} />
      </button>
    </div>
  );
}
