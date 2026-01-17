
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles } from "lucide-react";
import { MEMBERSHIP_NAMES, MEMBERSHIP_BENEFITS } from "@/utils/membershipLimits";
import { MembershipTier } from "@/types/auth";

const tiers: Array<{
    tier: MembershipTier;
    price: string;
    description: string;
    popular?: boolean;
}> = [
        {
            tier: "free",
            price: "¥0",
            description: "体验基础功能",
        },
        {
            tier: "premium",
            price: "¥29",
            description: "解锁全部功能",
            popular: true,
        },
        {
            tier: "enterprise",
            price: "¥99",
            description: "企业级服务",
        },
    ];

export function Membership() {
    const { membership } = useAuth();
    const navigate = useNavigate();
    const currentTier = membership?.tier || "free";

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    会员中心
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">选择适合您的方案</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    升级会员，解锁更多功能，享受无限制的文件处理服务
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {tiers.map((tier) => {
                    const isCurrentTier = tier.tier === currentTier;
                    const benefits = MEMBERSHIP_BENEFITS[tier.tier];

                    return (
                        <Card
                            key={tier.tier}
                            className={`relative ${tier.popular
                                ? "border-primary shadow-lg scale-105"
                                : ""
                                }`}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-medium">
                                        <Crown className="w-3 h-3" />
                                        最受欢迎
                                    </span>
                                </div>
                            )}

                            <CardContent className="pt-6 space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-2">
                                        {MEMBERSHIP_NAMES[tier.tier]}
                                    </h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold">{tier.price}</span>
                                        {tier.tier !== "free" && (
                                            <span className="text-muted-foreground">/月</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {tier.description}
                                    </p>
                                </div>

                                <ul className="space-y-3">
                                    {benefits.map((benefit, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    variant={tier.popular ? "gradient" : "outline"}
                                    className="w-full"
                                    disabled={isCurrentTier}
                                    onClick={() => {
                                        if (tier.tier === "free") {
                                            navigate("/profile");
                                        } else {
                                            alert("支付功能开发中，敬请期待！");
                                        }
                                    }}
                                >
                                    {isCurrentTier ? "当前方案" : tier.tier === "free" ? "免费使用" : "立即升级"}
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card className="max-w-3xl mx-auto">
                <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">常见问题</h3>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-1">免费会员有什么限制？</h4>
                            <p className="text-muted-foreground">
                                免费会员可以体验每个功能一次，包括背景移除、证件照制作、音频转换等。
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-1">如何升级会员？</h4>
                            <p className="text-muted-foreground">
                                点击上方的"立即升级"按钮，选择支付方式完成购买即可。
                            </p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-1">会员可以取消吗？</h4>
                            <p className="text-muted-foreground">
                                可以随时取消，取消后会员权益将在当前计费周期结束后失效。
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
