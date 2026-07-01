import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div className="premium-card relative w-full max-w-lg p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close modal" className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="pr-12">
          {children}
        </div>
        <button onClick={onClose} className="premium-button-secondary mt-6">
          Close
        </button>
      </div>
    </div>
  );
}