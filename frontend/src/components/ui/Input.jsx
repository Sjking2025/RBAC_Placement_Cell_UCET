import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

const Input = forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm transition-all duration-200",
        "placeholder:text-muted-foreground/50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-primary/50",
        "focus-visible:shadow-[0_0_0_3px_hsl(172_66%_50%/0.08)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-destructive focus-visible:ring-destructive/30 focus-visible:border-destructive",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
