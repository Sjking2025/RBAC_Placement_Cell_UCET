import * as React from "react"
import { cn } from "../../utils/helpers"

const TabsContext = React.createContext({})

const Tabs = React.forwardRef(({ className, value, onValueChange, children, ...props }, ref) => (
  <TabsContext.Provider value={{ value, onValueChange }}>
    <div
        ref={ref}
        className={cn("", className)}
        {...props}
    >
        {children}
    </div>
  </TabsContext.Provider>
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value: triggerValue, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
    
    return (
        <button
            ref={ref}
            type="button"
            className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className,
            selectedValue === triggerValue && "bg-background text-foreground shadow-sm"
            )}
            onClick={() => onValueChange && onValueChange(triggerValue)}
            data-state={selectedValue === triggerValue ? "active" : "inactive"}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value: contentValue, children, ...props }, ref) => {
  const { value: selectedValue } = React.useContext(TabsContext)

  if (selectedValue !== contentValue) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
