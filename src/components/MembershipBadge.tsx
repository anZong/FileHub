
import { MembershipTier } from "@/types/auth";
import { Crown } from "lucide-react";
import { MEMBERSHIP_NAMES } from "@/utils/membershipLimits";

interface MembershipBadgeProps {
    tier: MembershipTier;
    className?: string;
}

export function MembershipBadge({ tier, className = "" }: MembershipBadgeProps) {
    const colors = {
        free: "bg-gray-500/10 text-gray-500",
        premium: "bg-amber-500/10 text-amber-500",
        enterprise: "bg-purple-500/10 text-purple-500",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[tier]} ${className}`}
        >
            <Crown className="w-3 h-3" />
            {MEMBERSHIP_NAMES[tier]}
        </span>
    );
}
