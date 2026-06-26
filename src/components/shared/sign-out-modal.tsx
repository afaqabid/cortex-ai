"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X, Loader2 } from "lucide-react";

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
}: SignOutConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4 pt-2">
                {/* Warning Icon Container */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <LogOut className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    Confirm Sign Out
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to sign out? You will need to log back in to access your workspace.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3 pt-2">
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 rounded-xl border border-border bg-card/50 py-2.5 text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isProcessing}
                    className="flex-1 rounded-xl bg-red-500 text-white py-2.5 text-xs font-semibold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Sign Out"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
