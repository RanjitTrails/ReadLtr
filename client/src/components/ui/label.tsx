import { LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  className?: string;
}

export function Label({ children, className = '', ...props }: LabelProps) {
  const baseStyles = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 mb-2 block";
  
  const classes = [baseStyles, className].join(" ");
  
  return (
    <label className={classes} {...props}>
      {children}
    </label>
  );
}
