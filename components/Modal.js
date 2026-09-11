import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Modal({ isOpen, onClose, children, hideDefaultClose = false, maxWidth = 'max-w-xl' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl relative w-full ${maxWidth} max-h-[88vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white z-20"
        >
          <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
        </button>
        <div>
          {children}
        </div>
        {!hideDefaultClose && (
          <button onClick={onClose} className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
            Close
          </button>
        )}
      </div>
    </div>
  );
}