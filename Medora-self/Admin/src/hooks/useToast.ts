import { useState } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return { showToast, toast };
};