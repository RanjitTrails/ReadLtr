import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantStyles = {
    default: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-600",
    outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300",
    ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300",
    link: "bg-transparent underline-offset-4 hover:underline text-zinc-300 hover:text-zinc-100"
  };
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10 p-2"
  };
  
  const classes = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  ].join(" ");
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
