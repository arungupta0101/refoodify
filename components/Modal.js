import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        {children}
        <button onClick={onClose} className="mt-4 bg-gray-200 px-4 py-2 rounded">Close</button>
      </div>
    </div>
  );
}