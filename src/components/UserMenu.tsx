import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
} from "@/components/ui/dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Crown, LogOut, ChevronDown } from "lucide-react";
import { MEMBERSHIP_NAMES } from "@/utils/membershipLimits";

export function UserMenu() {
    const navigate = useNavigate();
    const { user, membership, signOut } = useAuth();
    const [isOpen, setIsOpen] = React.useState(false);

    if (!user) {
        return null;
    }

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate("/");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const membershipTier = membership?.tier || "free";
    const membershipName = MEMBERSHIP_NAMES[membershipTier];

    return (
        <Dropdown>
            <DropdownTrigger onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <Avatar className="w-8 h-8">
                        {user.avatar_url ? (
                            <AvatarImage src={user.avatar_url} alt={user.username} />
                        ) : (
                            <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                        )}
                    </Avatar>
                    <div className="hidden md:block text-left">
                        <div className="text-sm font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{membershipName}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
                </div>
            </DropdownTrigger>

            {isOpen && (
                <DropdownContent>
                    <div className="px-4 py-3 border-b">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>

                    <DropdownItem onClick={() => { setIsOpen(false); navigate("/profile"); }}>
                        <User className="w-4 h-4" />
                        个人资料
                    </DropdownItem>

                    <DropdownItem onClick={() => { setIsOpen(false); navigate("/membership"); }}>
                        <Crown className="w-4 h-4" />
                        会员中心
                    </DropdownItem>

                    <DropdownSeparator />

                    <DropdownItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4" />
                        退出登录
                    </DropdownItem>
                </DropdownContent>
            )}
        </Dropdown>
    );
}
