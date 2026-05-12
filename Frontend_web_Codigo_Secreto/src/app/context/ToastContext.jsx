import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-md shadow-lg animate-in slide-in-from-right ${
            toast.type === 'error' ? 'bg-red-700' :
            toast.type === 'warning' ? 'bg-yellow-700' : 'bg-black/80'
        } text-white`}>
            {toast.message}
        </div>
        )}
    </ToastContext.Provider>
  );
};