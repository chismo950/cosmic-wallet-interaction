
import { useToast as useChakraToast, UseToastOptions } from "@chakra-ui/react";
import { createContext, useContext } from "react";

type ToastProps = Omit<UseToastOptions, "status"> & {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  description?: string;
};

// Create a context to hold the toast function
const ToastContext = createContext<((props: ToastProps) => void) | null>(null);

// Toast provider component
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const chakraToast = useChakraToast();
  
  const toast = ({ variant = "info", ...props }: ToastProps) => {
    let status: UseToastOptions["status"];
    
    switch (variant) {
      case "success":
        status = "success";
        break;
      case "error":
      case "destructive":
        status = "error";
        break;
      case "warning":
        status = "warning";
        break;
      default:
        status = "info";
    }
    
    chakraToast({
      status,
      position: "top",
      duration: 5000,
      isClosable: true,
      ...props,
    });
  };
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use the toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
