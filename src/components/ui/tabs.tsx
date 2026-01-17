import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, onValueChange, children, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue);

    const handleSetActiveTab = React.useCallback(
      (tab: string) => {
        setActiveTab(tab);
        onValueChange?.(tab);
      },
      [onValueChange]
    );

    return (
      <TabsContext.Provider
        value={{ activeTab, setActiveTab: handleSetActiveTab }}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "pills" | "underline";
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1",
        variant === "default" && "rounded-xl bg-muted p-1.5",
        variant === "pills" && "rounded-2xl bg-secondary/60 p-2 shadow-inner",
        variant === "underline" && "border-b border-border gap-0",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  variant?: "default" | "pills" | "underline";
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, variant = "default", ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within Tabs");

    const isActive = context.activeTab === value;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && [
            "rounded-lg px-4 py-2.5",
            isActive
              ? "bg-background text-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
          ],
          variant === "pills" && [
            "rounded-xl px-6 py-3 gap-2.5",
            isActive
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
              : "text-muted-foreground hover:text-foreground hover:bg-background/80",
          ],
          variant === "underline" && [
            "px-6 py-3 border-b-2 -mb-[2px] rounded-none",
            isActive
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
          ],
          className
        )}
        onClick={() => context.setActiveTab(value)}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within Tabs");

    if (context.activeTab !== value) return null;

    return (
      <div
        ref={ref}
        className={cn("mt-4 animate-fade-in", className)}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
