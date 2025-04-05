import { toast as showToast, ToastProps } from './toast';

/**
 * Hook to use toast functionality
 * 
 * This is a compatibility layer for shadcn/ui toast component
 * It allows us to use the toast functionality in a way that's compatible with shadcn/ui
 */
export const useToast = () => {
  return {
    toast: showToast,
    dismiss: (toastId?: string) => {
      // Our implementation doesn't support dismissing by ID yet
      console.log('Toast dismiss called', toastId);
    },
  };
};

export type { ToastProps };

// Re-export the toast function for convenience
export const toast = showToast;
