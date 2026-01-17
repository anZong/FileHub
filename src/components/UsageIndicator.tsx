import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MembershipTier } from "@/types/auth";
import { FEATURE_LIMITS } from "@/utils/membershipLimits";

interface UsageIndicatorProps {
    tier: MembershipTier;
    featureType: string;
    usageCount: number;
    className?: string;
}

export function UsageIndicator({ tier, featureType, usageCount, className }: UsageIndicatorProps) {
    const limit = FEATURE_LIMITS[featureType]?.[tier];

    if (limit === 'unlimited') {
        return (
            <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                无限次使用
            </div>
        );
    }

    const remaining = Math.max(0, limit - usageCount);
    const percentage = (usageCount / limit) * 100;

    return (
        <div className={cn("space-y-1.5", className)}>
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                    已使用 {usageCount} / {limit} 次
                </span>
                <span className={cn(
                    "font-medium",
                    remaining === 0 ? "text-destructive" : "text-primary"
                )}>
                    剩余 {remaining} 次
                </span>
            </div>
            <Progress
                value={percentage}
                className="h-1.5"
            />
        </div>
    );
}
