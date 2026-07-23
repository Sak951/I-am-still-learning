"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function ToastContainer() {
  const { toasts, dismissToast } = useChat();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error":
        return <AlertOctagon className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="pointer-events-auto flex items-start p-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-card)]/90 backdrop-blur-md shadow-lg"
          >
            <div className="mr-3 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 mr-2 min-w-0">
              <h4 className="text-xs font-semibold text-[var(--text-main)] truncate">
                {toast.title}
              </h4>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-[var(--text-inactive)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
