import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContextType, UserProfile, Membership } from '@/types/auth';
import { canUseFeature } from '@/utils/membershipLimits';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [membership, setMembership] = React.useState<Membership | null>(null);
    const [loading, setLoading] = React.useState(true);

    // 初始化：检查当前会话
    React.useEffect(() => {
        let mounted = true;

        async function initAuth() {
            try {
                console.log('Initializing auth...');
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    if (session?.user) {
                        await loadUserProfile(session.user.id);
                    }
                }
            } catch (error) {
                console.error('Error in initAuth:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    console.log('Auth initialization complete.');
                }
            }
        }

        initAuth();

        // 监听认证状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);
                if (session?.user) {
                    await loadUserProfile(session.user.id);
                } else {
                    setUser(null);
                    setMembership(null);
                }
                if (mounted) {
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // 加载用户资料和会员信息
    async function loadUserProfile(userId: string) {
        try {
            console.log('Step 1: Loading profile for user:', userId);

            // 获取用户资料 - 添加超时处理
            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile query timeout')), 5000)
            );

            console.log('Step 2: Executing profile query...');
            const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;

            if (profileError) {
                console.error('Step 3: Profile query error:', profileError);
                // 如果是新用户，可能 profiles 表还没来得及插入，这里不抛出错误，只记录
                if (profileError.code === 'PGRST116') {
                    console.warn('Profile not found for user:', userId);
                } else {
                    throw profileError;
                }
            }

            console.log('Step 4: Profile loaded:', profile);
            setUser(profile);

            console.log('Step 5: Loading membership...');
            // 获取会员信息 - 使用 limit(1) 避免多个活跃记录导致的错误
            const { data: membershipData, error: membershipError } = await supabase
                .from('memberships')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (membershipError) {
                console.error('Step 6: Membership query error:', membershipError);
                throw membershipError;
            }

            console.log('Step 7: Membership loaded:', membershipData);
            setMembership(membershipData || null);
        } catch (error) {
            console.error('Error in loadUserProfile:', error);
        } finally {
            console.log('Step 8: loadUserProfile complete');
        }
    }

    // 注册
    async function signUp(email: string, password: string, username: string) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    },
                },
            });

            if (error) throw error;

            // 创建用户资料
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            email: data.user.email,
                            username,
                        },
                    ]);

                if (profileError) throw profileError;

                // 注意：数据库触发器 on_profile_created 会自动创建免费会员记录
                // 所以这里不再手动插入，避免重复
                console.log('Profile created, membership should be handled by trigger');
            }
        } catch (error: any) {
            console.error('Error signing up:', error);
            throw new Error(error.message || '注册失败');
        }
    }

    // 登录
    async function signIn(email: string, password: string) {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Error signing in:', error);
            throw new Error(error.message || '登录失败');
        }
    }

    // 登出
    async function signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setUser(null);
            setMembership(null);
        } catch (error: any) {
            console.error('Error signing out:', error);
            throw new Error(error.message || '登出失败');
        }
    }

    // 第三方登录 (GitHub, Google, etc.)
    async function signInWithOAuth(provider: 'github' | 'google') {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Error signing in with OAuth:', error);
            throw new Error(error.message || '第三方登录失败');
        }
    }

    // 检查功能访问权限
    async function checkFeatureAccess(featureType: string): Promise<boolean> {
        if (!user || !membership) {
            return false;
        }

        // 获取该功能的使用次数
        const usageCount = await getUsageCount(featureType);

        // 检查是否可以使用
        return canUseFeature(membership.tier, featureType, usageCount);
    }

    // 记录功能使用
    async function logFeatureUsage(featureType: string, featureName: string) {
        if (!user) {
            throw new Error('用户未登录');
        }

        try {
            const { error } = await supabase
                .from('usage_logs')
                .insert([
                    {
                        user_id: user.id,
                        feature_type: featureType,
                        feature_name: featureName,
                    },
                ]);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error logging feature usage:', error);
            throw new Error('记录使用失败');
        }
    }

    // 获取功能使用次数
    async function getUsageCount(featureType: string): Promise<number> {
        if (!user) {
            return 0;
        }

        try {
            const { count, error } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('feature_type', featureType);

            if (error) throw error;

            return count || 0;
        } catch (error) {
            console.error('Error getting usage count:', error);
            return 0;
        }
    }

    const value: AuthContextType = {
        user,
        membership,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        checkFeatureAccess,
        logFeatureUsage,
        getUsageCount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
