import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const Toast: React.FC = () => {
  const { toast, hideToast } = usePos();

  if (!toast) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200 transition-all max-w-md bg-white border-[#e2e1f2] text-[#30323e]">
      {toast.type === 'success' && (
        <div className="w-8 h-8 rounded-lg bg-[#006d4b]/10 text-[#006d4b] flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
      {toast.type === 'error' && (
        <div className="w-8 h-8 rounded-lg bg-[#a8364b]/10 text-[#a8364b] flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
      )}
      {toast.type === 'info' && (
        <div className="w-8 h-8 rounded-lg bg-[#684cb6]/10 text-[#684cb6] flex items-center justify-center shrink-0">
          <Info className="w-5 h-5" />
        </div>
      )}

      <div className="flex-1 pr-2">
        <p className="text-xs font-semibold leading-snug">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={hideToast}
        className="p-1 rounded-lg text-[#797988] hover:text-[#30323e] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
