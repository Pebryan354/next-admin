"use client";

import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const ToastContext = React.createContext();

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProviderCustom({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const addToast = (title, description, variant = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const getIcon = (variant) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500 " />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500 " />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500 " />;
      default:
        return <Info className="w-5 h-5 text-blue-500 " />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <ToastProvider>
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant}>
            <div className="flex items-start gap-3">
              {getIcon(toast.variant)}
              <div>
                <ToastTitle>{toast.title}</ToastTitle>
                <ToastDescription>{toast.description}</ToastDescription>
              </div>
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
