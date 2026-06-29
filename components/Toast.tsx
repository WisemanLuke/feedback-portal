'use client';

import { useEffect, useState } from 'react';

interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

let addToast: (text: string, type?: 'success' | 'error') => void = () => {};

export function toast(text: string, type: 'success' | 'error' = 'success') {
  addToast(text, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToast = (text, type = 'success') => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, text, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all ${
            t.type === 'success'
              ? 'bg-grey-900 text-white border-l-4 border-brand'
              : 'bg-grey-900 text-white border-l-4 border-red-500'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
