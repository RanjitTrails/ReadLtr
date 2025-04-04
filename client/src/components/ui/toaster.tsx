import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { initializeToast, ToastProps } from './toast';

/**
 * Toast interface for internal use
 */
interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'default' | 'success' | 'error' | 'warning';
}

/**
 * Context for the toaster
 */
interface ToasterContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

/**
 * Hook to access the toaster context
 * Only used internally by the Toaster component
 */
function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
}

interface ToasterProviderProps {
  children: ReactNode;
}

/**
 * ToasterProvider component
 *
 * Provides the toast functionality to the application
 */
export function ToasterProvider({ children }: ToasterProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to add a toast
  const addToast = (toast: Partial<Toast>) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { ...toast, id } as Toast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  // Function to remove a toast
  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Initialize the toast function when the component mounts
  useEffect(() => {
    initializeToast(addToast);
  }, []);

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToasterContext.Provider>
  );
}

/**
 * Toaster component
 *
 * Renders the toast notifications
 */
function Toaster() {
  const { toasts, removeToast } = useToaster();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] rounded-lg p-4 shadow-lg flex items-start gap-3
            ${toast.type === 'success' ? 'bg-green-900 text-green-100' : ''}
            ${toast.type === 'error' ? 'bg-red-900 text-red-100' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-900 text-yellow-100' : ''}
            ${toast.type === 'default' ? 'bg-zinc-800 text-zinc-100' : ''}
          `}
        >
          <div className="flex-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && (
              <p className="text-sm opacity-90 mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
