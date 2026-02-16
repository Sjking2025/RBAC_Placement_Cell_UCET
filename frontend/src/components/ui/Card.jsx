import { cn } from '../../utils/helpers';

const Card = ({ className, interactive, ...props }) => (
  <div
    className={cn(
      "rounded-xl border border-border/50 bg-card text-card-foreground transition-all duration-300",
      "shadow-[0_1px_3px_hsl(220_20%_5%/0.04)]",
      "hover:shadow-[0_4px_16px_hsl(220_20%_5%/0.08)]",
      interactive && "cursor-pointer hover:-translate-y-1 active:translate-y-0",
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);

const CardTitle = ({ className, ...props }) => (
  <h3
    className={cn(
      "font-display text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
);

const CardDescription = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
