import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: "default" | "image" | "audio" | "video" | "document";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-primary",
      image: "bg-image",
      audio: "bg-audio",
      video: "bg-video",
      document: "bg-document",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full motion-reduce:transition-none",
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
