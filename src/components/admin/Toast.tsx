'use client';

import React, { useEffect, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast: Toast = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
