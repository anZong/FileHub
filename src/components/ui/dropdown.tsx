import * as React from "react";
import { cn } from "@/lib/utils";

const Dropdown = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative inline-block text-left", className)}
        {...props}
    />
));
Dropdown.displayName = "Dropdown";

const DropdownTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn("outline-none", className)}
        {...props}
    />
));
DropdownTrigger.displayName = "DropdownTrigger";

const DropdownContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "left" | "right" }
>(({ className, align = "right", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "absolute z-50 mt-2 w-56 rounded-lg border bg-card shadow-lg glass",
            align === "right" ? "right-0" : "left-0",
            className
        )}
        {...props}
    />
));
DropdownContent.displayName = "DropdownContent";

const DropdownItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2",
            "first:rounded-t-lg last:rounded-b-lg",
            className
        )}
        {...props}
    />
));
DropdownItem.displayName = "DropdownItem";

const DropdownSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("h-px bg-border my-1", className)}
        {...props}
    />
));
DropdownSeparator.displayName = "DropdownSeparator";

export {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
};
