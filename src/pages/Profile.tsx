
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Crown } from "lucide-react";
import { MEMBERSHIP_NAMES, MEMBERSHIP_BENEFITS } from "@/utils/membershipLimits";
import { useNavigate } from "react-router-dom";

export function Profile() {
    const { user, membership } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return null;
    }

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
    const benefits = MEMBERSHIP_BENEFITS[membershipTier];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">个人资料</h1>
                <p className="text-muted-foreground mt-2">管理您的账户信息和会员权益</p>
            </div>

            {/* 用户信息卡片 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        <Avatar className="w-20 h-20">
                            {user.avatar_url ? (
                                <AvatarImage src={user.avatar_url} alt={user.username} />
                            ) : (
                                <AvatarFallback className="text-2xl">
                                    {getInitials(user.username)}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold">{user.username}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${membershipTier === 'enterprise' ? 'bg-purple-500/10 text-purple-500' :
                                        membershipTier === 'premium' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-gray-500/10 text-gray-500'
                                        }`}>
                                        <Crown className="w-3.5 h-3.5" />
                                        {membershipName}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>加入于 {new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 会员权益卡片 */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">当前会员权益</h3>
                        {membershipTier === 'free' && (
                            <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => navigate("/membership")}
                            >
                                升级会员
                            </Button>
                        )}
                    </div>

                    <ul className="space-y-2">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {benefit}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
