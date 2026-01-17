import * as React from "react";
import { cn } from "@/lib/utils";

interface Step {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  variant?: "default" | "compact" | "vertical";
  accentColor?: "primary" | "image" | "audio" | "video";
  className?: string;
}

const colorClasses = {
  primary: {
    icon: "bg-primary/10 text-primary border-primary/20",
    line: "bg-primary/20",
    dot: "bg-primary",
  },
  image: {
    icon: "bg-image/10 text-image border-image/20",
    line: "bg-image/30",
    dot: "bg-image",
  },
  audio: {
    icon: "bg-audio/10 text-audio border-audio/20",
    line: "bg-audio/30",
    dot: "bg-audio",
  },
  video: {
    icon: "bg-video/10 text-video border-video/20",
    line: "bg-video/30",
    dot: "bg-video",
  },
};

export function StepIndicator({
  steps,
  variant = "default",
  accentColor = "primary",
  className,
}: StepIndicatorProps) {
  const colors = colorClasses[accentColor];

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-center gap-2", className)}>
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  colors.icon
                )}>
                {step.icon}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("w-8 h-0.5 rounded-full", colors.line)} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm",
                  colors.icon
                )}>
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn("w-0.5 flex-1 my-2 rounded-full", colors.line)}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <h4 className="font-medium">{step.title}</h4>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default - beautiful horizontal cards
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="relative">
          <div
            className={cn(
              "flex flex-col items-center text-center p-5 rounded-2xl border-2 bg-gradient-to-br from-card to-secondary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
              colors.icon.replace("bg-", "border-").split(" ")[2]
            )}>
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm border-2",
                colors.icon
              )}>
              <div className="scale-125">{step.icon}</div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-primary-foreground",
                  colors.dot
                )}>
                {index + 1}
              </span>
              <h4 className="font-semibold">{step.title}</h4>
            </div>
            {step.description && (
              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 translate-x-full z-10">
              <div className={cn("w-4 h-1 rounded-full", colors.line)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
