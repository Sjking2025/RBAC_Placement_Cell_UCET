import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../utils/helpers"

const DialogContext = React.createContext({});

const Dialog = ({
  open,
  onOpenChange,
  children
}) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
        {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ asChild, children, onClick }) => {
    const { onOpenChange } = React.useContext(DialogContext);
    
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: (e) => {
                children.props.onClick?.(e);
                onOpenChange(true);
            }
        });
    }
    
    return (
        <button onClick={() => onOpenChange(true)}>
            {children}
        </button>
    );
}

const DialogContent = ({ className, children, ...props }) => {
  const { open, onOpenChange } = React.useContext(DialogContext);
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      <div 
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100"
        onClick={() => onOpenChange(false)}
      />
      <div 
        className={cn(
            "fixed z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg sm:max-w-lg sm:rounded-lg",
            className
        )}
        {...props}
      >
        {children}
         <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
