import { MembershipTier } from '@/types/auth';

export interface FeatureLimit {
    free: number;
    premium: number | 'unlimited';
    enterprise: number | 'unlimited';
}

export interface FeatureLimits {
    [featureType: string]: FeatureLimit;
}

// 功能使用限制配置
export const FEATURE_LIMITS: FeatureLimits = {
    // 图片处理功能
    'image_bg_remove': {
        free: 1,
        premium: 'unlimited',
        enterprise: 'unlimited',
    },
    'image_id_photo': {
        free: 1,
        premium: 'unlimited',
        enterprise: 'unlimited',
    },
    'image_stamp': {
        free: 1,
        premium: 'unlimited',
        enterprise: 'unlimited',
    },
    // 音频处理功能
    'audio_convert': {
        free: 1,
        premium: 'unlimited',
        enterprise: 'unlimited',
    },
    // 视频处理功能
    'video_convert': {
        free: 1,
        premium: 'unlimited',
        enterprise: 'unlimited',
    },
};

// 文件大小限制（MB）
export const FILE_SIZE_LIMITS = {
    free: 10,
    premium: 100,
    enterprise: 500,
};

// 会员等级显示名称
export const MEMBERSHIP_NAMES: Record<MembershipTier, string> = {
    free: '免费会员',
    premium: '高级会员',
    enterprise: '企业会员',
};

// 会员等级权益描述
export const MEMBERSHIP_BENEFITS = {
    free: [
        '每个功能试用1次',
        '最大文件10MB',
        '基础处理速度',
    ],
    premium: [
        '所有功能无限使用',
        '最大文件100MB',
        '高速处理',
        '优先客服支持',
    ],
    enterprise: [
        '所有高级功能',
        '最大文件500MB',
        '极速处理',
        'API访问权限',
        '批量处理',
        '专属客服',
    ],
};

/**
 * 检查用户是否可以使用某个功能
 * @param tier 会员等级
 * @param featureType 功能类型
 * @param usageCount 已使用次数
 * @returns 是否可以使用
 */
export function canUseFeature(
    tier: MembershipTier,
    featureType: string,
    usageCount: number
): boolean {
    const limit = FEATURE_LIMITS[featureType]?.[tier];

    if (!limit) {
        return false;
    }

    if (limit === 'unlimited') {
        return true;
    }

    return usageCount < limit;
}

/**
 * 获取功能剩余使用次数
 * @param tier 会员等级
 * @param featureType 功能类型
 * @param usageCount 已使用次数
 * @returns 剩余次数（'unlimited' 或数字）
 */
export function getRemainingUsage(
    tier: MembershipTier,
    featureType: string,
    usageCount: number
): number | 'unlimited' {
    const limit = FEATURE_LIMITS[featureType]?.[tier];

    if (!limit) {
        return 0;
    }

    if (limit === 'unlimited') {
        return 'unlimited';
    }

    return Math.max(0, limit - usageCount);
}
