-- FileHub 数据库架构
-- 在 Supabase 控制台的 SQL Editor 中执行此脚本

-- ============================================
-- 1. 用户资料表 (profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 profiles 表启用行级安全 (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有资料（公开）
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 用户只能更新自己的资料
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 用户可以插入自己的资料
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. 会员信息表 (memberships)
-- ============================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'enterprise')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 memberships 表启用行级安全 (RLS)
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的会员信息
CREATE POLICY "Users can view own membership"
  ON public.memberships
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的会员信息
CREATE POLICY "Users can insert own membership"
  ON public.memberships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的会员信息
CREATE POLICY "Users can update own membership"
  ON public.memberships
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. 使用记录表 (usage_logs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 例如: 'image_bg_remove', 'audio_convert'
  feature_name TEXT NOT NULL, -- 功能显示名称
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为 usage_logs 表启用行级安全 (RLS)
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的使用记录
CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的使用记录
CREATE POLICY "Users can insert own usage logs"
  ON public.usage_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. 索引优化
-- ============================================
-- 为常用查询创建索引
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_is_active ON public.memberships(is_active);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature_type ON public.usage_logs(feature_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_used_at ON public.usage_logs(used_at);

-- ============================================
-- 5. 触发器：自动更新 updated_at 字段
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 profiles 表添加触发器
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 为 memberships 表添加触发器
CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. 触发器：新用户自动创建免费会员
-- ============================================
CREATE OR REPLACE FUNCTION create_free_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (user_id, tier, is_active)
  VALUES (NEW.id, 'free', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_free_membership();

-- ============================================
-- 7. 触发器：新用户注册自动创建资料 (支持 OAuth)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 只有在 auth.users 插入新记录时触发
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- 完成！
-- ============================================
-- 数据库架构创建完成
-- 现在您可以在应用中使用 Supabase 认证功能了
