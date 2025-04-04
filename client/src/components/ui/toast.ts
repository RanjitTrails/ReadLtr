/**
 * Toast functionality for the application
 *
 * This module provides a global toast function that can be used anywhere in the app
 * without needing to pass props or use context hooks directly in components.
 */

// Types for the toast function
export type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

// Internal types
type ToastType = 'default' | 'success' | 'error' | 'warning';

type AddToastFunction = (toast: {
  title: string;
  description?: string;
  type: ToastType;
}) => void;

// Simple singleton to store the addToast function
let addToastFn: AddToastFunction | null = null;

/**
 * Global toast function
 *
 * Can be called from anywhere in the application to show a toast notification
 */
export function toast({ title, description, variant = 'default' }: ToastProps): void {
  if (!addToastFn) {
    console.warn('Toast function called before it was initialized');
    return;
  }

  // Map variant to type
  const type: ToastType =
    variant === 'destructive' ? 'error' :
    variant === 'success' ? 'success' : 'default';

  addToastFn({
    title,
    description,
    type
  });
}

/**
 * Initialize the toast function
 *
 * Called by the ToasterProvider to set up the toast function
 */
export function initializeToast(fn: AddToastFunction): void {
  addToastFn = fn;
}
