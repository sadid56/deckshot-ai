import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";

export interface ToastMethods {
  (message: string, severity?: AlertColor): void;
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

const ToastContext = createContext<ToastMethods | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastState, setToastState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  const show = useCallback((message: string, severity: AlertColor = "info") => {
    setToastState({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event | null, reason?: string) => {
    if (reason === "clickaway") return;
    setToastState((prev) => ({ ...prev, open: false }));
  }, []);

  // Create toast methods callable directly: toast("msg") or toast.error("msg")
  const toastMethods: ToastMethods = Object.assign(
    (message: string, severity: AlertColor = "info") => show(message, severity),
    {
      error: (message: string) => show(message, "error"),
      success: (message: string) => show(message, "success"),
      info: (message: string) => show(message, "info"),
      warning: (message: string) => show(message, "warning"),
    }
  );

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      <Snackbar
        open={toastState.open}
        autoHideDuration={4500}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={toastState.severity}
          variant='filled'
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.8)",
            fontSize: "0.86rem",
            fontWeight: 600,
          }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastMethods => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
