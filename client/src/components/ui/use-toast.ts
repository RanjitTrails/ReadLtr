import { useToaster } from './toaster';
import { v4 as uuidv4 } from 'uuid';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

export function toast({ title, description, variant = 'default' }: ToastProps) {
  const { addToast } = useToaster();

  // Map variant to type
  const type = variant === 'destructive' ? 'error' :
               variant === 'success' ? 'success' : 'default';

  addToast({
    id: uuidv4(),
    title,
    description,
    type
  });
}
