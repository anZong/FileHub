import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface OptionPickerProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "compact" | "card";
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  accentColor?: "primary" | "image" | "audio" | "video";
}

const colorClasses = {
  primary: {
    active: "bg-primary text-primary-foreground ring-primary/30",
    hover: "hover:border-primary/50 hover:bg-primary/5",
  },
  image: {
    active: "bg-image text-primary-foreground ring-image/30",
    hover: "hover:border-image/50 hover:bg-image/5",
  },
  audio: {
    active: "bg-audio text-primary-foreground ring-audio/30",
    hover: "hover:border-audio/50 hover:bg-audio/5",
  },
  video: {
    active: "bg-video text-primary-foreground ring-video/30",
    hover: "hover:border-video/50 hover:bg-video/5",
  },
};

export function OptionPicker({
  options,
  value,
  onChange,
  variant = "default",
  columns = 3,
  className,
  accentColor = "primary",
}: OptionPickerProps) {
  const colors = colorClasses[accentColor];

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-5",
    6: "grid-cols-3 sm:grid-cols-6",
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                isSelected
                  ? cn(colors.active, "border-transparent ring-2")
                  : cn(
                      "border-border bg-background text-foreground",
                      colors.hover
                    )
              )}>
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={cn("grid gap-3", gridCols[columns], className)}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "relative p-4 rounded-xl text-left transition-all duration-200 border-2",
                isSelected
                  ? cn(colors.active, "border-transparent shadow-lg")
                  : cn("border-border bg-card hover:shadow-md", colors.hover)
              )}>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4" />
                </div>
              )}
              {option.icon && (
                <div
                  className={cn(
                    "mb-2",
                    isSelected ? "" : "text-muted-foreground"
                  )}>
                  {option.icon}
                </div>
              )}
              <div className="font-medium">{option.label}</div>
              {option.description && (
                <div
                  className={cn(
                    "text-xs mt-1",
                    isSelected ? "opacity-80" : "text-muted-foreground"
                  )}>
                  {option.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("grid gap-2", gridCols[columns], className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border text-center",
              isSelected
                ? cn(colors.active, "border-transparent ring-2 shadow-md")
                : cn(
                    "border-border bg-background text-foreground",
                    colors.hover
                  )
            )}>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
