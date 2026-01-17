import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Zap, Sparkles } from "lucide-react";
import { MembershipTier } from "@/types/auth";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentTier?: MembershipTier;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
    const navigate = useNavigate();

    const handleUpgrade = () => {
        onOpenChange(false);
        navigate("/membership");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl">升级您的会员等级</DialogTitle>
                    <DialogDescription>
                        您已达到免费试用限制。升级到高级会员，解锁无限处理能力和更多高级功能。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-6">
                    <div className="p-4 rounded-xl bg-secondary/50 border space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            高级会员特权
                        </h4>
                        <ul className="space-y-2">
                            {[
                                "无限次图片背景移除",
                                "高清证件照制作",
                                "无限制音频/视频格式转换",
                                "优先处理通道",
                                "24/7 优先技术支持"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1">
                        稍后再说
                    </Button>
                    <Button variant="gradient" onClick={handleUpgrade} className="flex-1 gap-2">
                        <Zap className="w-4 h-4" />
                        立即升级
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
