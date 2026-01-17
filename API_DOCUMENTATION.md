# FileHub API 文档

## 概述

FileHub 是一个文件处理应用，提供图片、音频和视频处理功能。本文档详细说明了应用的 API 端点、数据模型和业务逻辑。

**技术栈：**
- 后端：Supabase (PostgreSQL + Auth)
- 前端：React 18 + TypeScript + Vite
- 状态管理：Zustand + React Context
- 路由：React Router v7

**基础 URL：**
- API Base: `https://your-project.supabase.co`
- 前端: `http://localhost:5173` (开发环境)

---

## 目录

1. [认证 API](#认证-api)
2. [数据库表结构](#数据库表结构)
3. [业务逻辑 API](#业务逻辑-api)
4. [会员权限系统](#会员权限系统)
5. [错误处理](#错误处理)
6. [OpenAPI 规范](#openapi-规范)

---

## 认证 API

FileHub 使用 Supabase Auth 进行用户认证，支持邮箱密码登录和第三方 OAuth 登录。

### 1. 用户注册

**方法：** `signUp(email, password, username)`

**位置：** `src/contexts/AuthContext.tsx:118`

**请求参数：**
```typescript
{
  email: string;      // 用户邮箱
  password: string;   // 密码（最小长度由 Supabase 配置决定）
  username: string;   // 用户名
}
```

**响应：**
```typescript
// 成功：自动登录并创建用户资料
{
  user: {
    id: string;
    email: string;
    // ... 其他 Supabase auth.users 字段
  }
}

// 失败：抛出异常
Error: "注册失败" | Supabase错误信息
```

**行为：**
1. 调用 `supabase.auth.signUp()` 创建认证用户
2. 在 `profiles` 表中插入用户资料
3. 数据库触发器 `on_profile_created` 自动创建免费会员记录

**示例代码：**
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { signUp } = useAuth();

try {
  await signUp('user@example.com', 'password123', 'JohnDoe');
  // 注册成功，用户已登录
} catch (error) {
  console.error(error.message);
}
```

---

### 2. 用户登录

**方法：** `signIn(email, password)`

**位置：** `src/contexts/AuthContext.tsx:157`

**请求参数：**
```typescript
{
  email: string;     // 用户邮箱
  password: string;  // 密码
}
```

**响应：**
```typescript
// 成功：自动设置会话
// 失败：抛出异常
Error: "登录失败" | Supabase错误信息
```

**行为：**
1. 调用 `supabase.auth.signInWithPassword()`
2. 认证成功后，`onAuthStateChange` 监听器自动加载用户资料和会员信息

**示例代码：**
```typescript
const { signIn } = useAuth();

try {
  await signIn('user@example.com', 'password123');
  // 登录成功
} catch (error) {
  console.error(error.message);
}
```

---

### 3. OAuth 登录

**方法：** `signInWithOAuth(provider)`

**位置：** `src/contexts/AuthContext.tsx:185`

**请求参数：**
```typescript
{
  provider: 'github' | 'google';  // 第三方登录提供商
}
```

**响应：**
```typescript
// 成功：重定向到 OAuth 提供商
// 失败：抛出异常
Error: "第三方登录失败" | Supabase错误信息
```

**行为：**
1. 重定向用户到 OAuth 提供商授权页面
2. 授权成功后重定向回 `${window.location.origin}/`
3. 数据库触发器 `handle_new_user()` 自动创建用户资料（支持 OAuth）

**示例代码：**
```typescript
const { signInWithOAuth } = useAuth();

try {
  await signInWithOAuth('github');
  // 用户将被重定向到 GitHub 授权页面
} catch (error) {
  console.error(error.message);
}
```

---

### 4. 用户登出

**方法：** `signOut()`

**位置：** `src/contexts/AuthContext.tsx:172`

**请求参数：** 无

**响应：**
```typescript
// 成功：清空用户会话
// 失败：抛出异常
Error: "登出失败" | Supabase错误信息
```

**行为：**
1. 调用 `supabase.auth.signOut()`
2. 清空本地状态（user, membership）

**示例代码：**
```typescript
const { signOut } = useAuth();

try {
  await signOut();
  // 用户已登出
} catch (error) {
  console.error(error.message);
}
```

---

### 5. 获取当前用户

**方法：** 从 Context 获取

**位置：** `src/contexts/AuthContext.tsx:276`

**返回值：**
```typescript
{
  user: UserProfile | null;        // 当前用户资料
  membership: Membership | null;   // 当前用户会员信息
  loading: boolean;                // 加载状态
}
```

**示例代码：**
```typescript
const { user, membership, loading } = useAuth();

if (loading) {
  return <div>加载中...</div>;
}

if (!user) {
  return <div>未登录</div>;
}

return <div>欢迎, {user.username}!</div>;
```

---

## 数据库表结构

### 1. profiles（用户资料表）

**表名：** `public.profiles`

**架构：** `supabase/schema.sql:7`

**字段：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE | 用户ID（与认证表关联） |
| email | TEXT | NOT NULL | 用户邮箱 |
| username | TEXT | NOT NULL | 用户名 |
| avatar_url | TEXT | NULL | 头像URL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**行级安全策略（RLS）：**
- `Profiles are viewable by everyone` - 所有人可查看所有用户资料
- `Users can update own profile` - 用户只能更新自己的资料
- `Users can insert own profile` - 用户只能插入自己的资料

**触发器：**
- `update_profiles_updated_at` - 更新时自动更新 `updated_at` 字段

**TypeScript 类型：**
```typescript
// src/types/auth.ts:3
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
```

**API 操作示例：**

```typescript
// 查询用户资料
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// 更新用户资料
const { error } = await supabase
  .from('profiles')
  .update({ username: 'NewName', avatar_url: 'https://...' })
  .eq('id', userId);
```

---

### 2. memberships（会员信息表）

**表名：** `public.memberships`

**架构：** `supabase/schema.sql:40`

**字段：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 会员记录ID |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | 用户ID |
| tier | TEXT | NOT NULL, CHECK (tier IN ('free', 'premium', 'enterprise')) | 会员等级 |
| started_at | TIMESTAMPTZ | DEFAULT NOW() | 会员开始时间 |
| expires_at | TIMESTAMPTZ | NULL | 会员过期时间（NULL表示永久） |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**行级安全策略（RLS）：**
- `Users can view own membership` - 用户只能查看自己的会员信息
- `Users can insert own membership` - 用户可以插入自己的会员信息
- `Users can update own membership` - 用户可以更新自己的会员信息

**触发器：**
- `update_memberships_updated_at` - 更新时自动更新 `updated_at` 字段
- `on_profile_created` - 用户资料创建时自动创建免费会员记录

**索引：**
- `idx_memberships_user_id` - 用户ID索引
- `idx_memberships_is_active` - 激活状态索引

**TypeScript 类型：**
```typescript
// src/types/auth.ts:1
export type MembershipTier = 'free' | 'premium' | 'enterprise';

// src/types/auth.ts:12
export interface Membership {
  id: string;
  user_id: string;
  tier: MembershipTier;
  started_at: string;
  expires_at?: string;
  is_active: boolean;
}
```

**API 操作示例：**

```typescript
// 查询用户会员信息（获取最新的活跃记录）
const { data: membership, error } = await supabase
  .from('memberships')
  .select('*')
  .eq('user_id', userId)
  .eq('is_active', true)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// 升级会员
const { error } = await supabase
  .from('memberships')
  .update({ tier: 'premium', expires_at: '2025-12-31T23:59:59Z' })
  .eq('user_id', userId)
  .eq('is_active', true);
```

---

### 3. usage_logs（使用记录表）

**表名：** `public.usage_logs`

**架构：** `supabase/schema.sql:75`

**字段：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | 记录ID |
| user_id | UUID | NOT NULL, REFERENCES profiles(id) ON DELETE CASCADE | 用户ID |
| feature_type | TEXT | NOT NULL | 功能类型代码 |
| feature_name | TEXT | NOT NULL | 功能显示名称 |
| used_at | TIMESTAMPTZ | DEFAULT NOW() | 使用时间 |

**功能类型（feature_type）：**
- `image_bg_remove` - 图片背景移除
- `image_id_photo` - 证件照制作
- `image_stamp` - 图片加水印
- `audio_convert` - 音频格式转换
- `video_convert` - 视频格式转换

**行级安全策略（RLS）：**
- `Users can view own usage logs` - 用户只能查看自己的使用记录
- `Users can insert own usage logs` - 用户可以插入自己的使用记录

**索引：**
- `idx_usage_logs_user_id` - 用户ID索引
- `idx_usage_logs_feature_type` - 功能类型索引
- `idx_usage_logs_used_at` - 使用时间索引

**TypeScript 类型：**
```typescript
// src/types/auth.ts:21
export interface UsageLog {
  id: string;
  user_id: string;
  feature_type: string;
  feature_name: string;
  used_at: string;
}
```

**API 操作示例：**

```typescript
// 记录功能使用
const { error } = await supabase
  .from('usage_logs')
  .insert([{
    user_id: userId,
    feature_type: 'image_bg_remove',
    feature_name: '背景移除'
  }]);

// 查询使用次数
const { count, error } = await supabase
  .from('usage_logs')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('feature_type', 'image_bg_remove');
```

---

## 业务逻辑 API

### 1. 检查功能访问权限

**方法：** `checkFeatureAccess(featureType)`

**位置：** `src/contexts/AuthContext.tsx:202`

**请求参数：**
```typescript
{
  featureType: string;  // 功能类型代码
}
```

**返回值：**
```typescript
Promise<boolean>  // true: 可以使用, false: 不能使用
```

**逻辑：**
1. 检查用户是否登录
2. 获取该功能的使用次数
3. 根据会员等级和使用次数判断是否可以使用

**实现依赖：**
- `canUseFeature()` - `src/utils/membershipLimits.ts:89`

**示例代码：**
```typescript
const { checkFeatureAccess } = useAuth();

const canRemoveBackground = await checkFeatureAccess('image_bg_remove');

if (!canRemoveBackground) {
  alert('您的使用次数已用完，请升级会员');
  return;
}

// 执行功能...
```

---

### 2. 记录功能使用

**方法：** `logFeatureUsage(featureType, featureName)`

**位置：** `src/contexts/AuthContext.tsx:215`

**请求参数：**
```typescript
{
  featureType: string;   // 功能类型代码
  featureName: string;   // 功能显示名称（中文）
}
```

**返回值：**
```typescript
Promise<void>
```

**响应：**
```typescript
// 成功：无返回值
// 失败：抛出异常
Error: "用户未登录" | "记录使用失败"
```

**逻辑：**
1. 检查用户是否登录
2. 向 `usage_logs` 表插入使用记录

**示例代码：**
```typescript
const { logFeatureUsage } = useAuth();

try {
  await logFeatureUsage('image_bg_remove', '背景移除');
  console.log('使用记录已保存');
} catch (error) {
  console.error(error.message);
}
```

---

### 3. 获取功能使用次数

**方法：** `getUsageCount(featureType)`

**位置：** `src/contexts/AuthContext.tsx:239`

**请求参数：**
```typescript
{
  featureType: string;  // 功能类型代码
}
```

**返回值：**
```typescript
Promise<number>  // 使用次数
```

**逻辑：**
1. 检查用户是否登录（未登录返回0）
2. 查询 `usage_logs` 表中该用户该功能的记录数量

**示例代码：**
```typescript
const { getUsageCount } = useAuth();

const count = await getUsageCount('image_bg_remove');
console.log(`您已使用背景移除功能 ${count} 次`);
```

---

### 4. 判断功能可用性（工具函数）

**函数：** `canUseFeature(tier, featureType, usageCount)`

**位置：** `src/utils/membershipLimits.ts:89`

**参数：**
```typescript
{
  tier: MembershipTier;      // 会员等级
  featureType: string;       // 功能类型
  usageCount: number;        // 已使用次数
}
```

**返回值：**
```typescript
boolean  // true: 可以使用, false: 不能使用
```

**逻辑：**
1. 从 `FEATURE_LIMITS` 配置中获取该功能对应等级的限制
2. 如果限制为 `'unlimited'`，返回 true
3. 否则判断 `usageCount < limit`

**示例代码：**
```typescript
import { canUseFeature } from '@/utils/membershipLimits';

const canUse = canUseFeature('free', 'image_bg_remove', 0);
console.log(canUse); // true（免费用户可以使用1次）

const canUseAgain = canUseFeature('free', 'image_bg_remove', 1);
console.log(canUseAgain); // false（免费用户已用完1次）
```

---

### 5. 获取剩余使用次数（工具函数）

**函数：** `getRemainingUsage(tier, featureType, usageCount)`

**位置：** `src/utils/membershipLimits.ts:114`

**参数：**
```typescript
{
  tier: MembershipTier;      // 会员等级
  featureType: string;       // 功能类型
  usageCount: number;        // 已使用次数
}
```

**返回值：**
```typescript
number | 'unlimited'  // 剩余次数或无限
```

**逻辑：**
1. 从 `FEATURE_LIMITS` 配置中获取限制
2. 如果限制为 `'unlimited'`，返回 `'unlimited'`
3. 否则返回 `Math.max(0, limit - usageCount)`

**示例代码：**
```typescript
import { getRemainingUsage } from '@/utils/membershipLimits';

const remaining = getRemainingUsage('free', 'image_bg_remove', 0);
console.log(remaining); // 1

const premiumRemaining = getRemainingUsage('premium', 'image_bg_remove', 100);
console.log(premiumRemaining); // 'unlimited'
```

---

## 会员权限系统

### 会员等级

**类型定义：** `src/types/auth.ts:1`

```typescript
export type MembershipTier = 'free' | 'premium' | 'enterprise';
```

**等级名称：**
```typescript
// src/utils/membershipLimits.ts:53
export const MEMBERSHIP_NAMES: Record<MembershipTier, string> = {
  free: '免费会员',
  premium: '高级会员',
  enterprise: '企业会员',
};
```

---

### 功能使用限制

**配置：** `src/utils/membershipLimits.ts:14`

| 功能类型 | 免费会员 | 高级会员 | 企业会员 |
|---------|---------|---------|---------|
| image_bg_remove（背景移除） | 1次 | 无限 | 无限 |
| image_id_photo（证件照） | 1次 | 无限 | 无限 |
| image_stamp（水印） | 1次 | 无限 | 无限 |
| audio_convert（音频转换） | 1次 | 无限 | 无限 |
| video_convert（视频转换） | 1次 | 无限 | 无限 |

**配置代码：**
```typescript
export const FEATURE_LIMITS: FeatureLimits = {
  'image_bg_remove': {
    free: 1,
    premium: 'unlimited',
    enterprise: 'unlimited',
  },
  // ... 其他功能
};
```

---

### 文件大小限制

**配置：** `src/utils/membershipLimits.ts:46`

| 会员等级 | 最大文件大小 |
|---------|------------|
| 免费会员 | 10 MB |
| 高级会员 | 100 MB |
| 企业会员 | 500 MB |

**配置代码：**
```typescript
export const FILE_SIZE_LIMITS = {
  free: 10,      // MB
  premium: 100,  // MB
  enterprise: 500, // MB
};
```

---

### 会员权益

**配置：** `src/utils/membershipLimits.ts:60`

**免费会员：**
- 每个功能试用1次
- 最大文件10MB
- 基础处理速度

**高级会员：**
- 所有功能无限使用
- 最大文件100MB
- 高速处理
- 优先客服支持

**企业会员：**
- 所有高级功能
- 最大文件500MB
- 极速处理
- API访问权限
- 批量处理
- 专属客服

---

## 错误处理

### 认证错误

**常见错误码：**

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| "Invalid login credentials" | 邮箱或密码错误 | 检查输入的凭证 |
| "Email not confirmed" | 邮箱未验证 | 检查邮箱验证链接 |
| "User already registered" | 邮箱已被注册 | 使用其他邮箱或登录 |
| "Password should be at least 6 characters" | 密码太短 | 使用更长的密码 |

**错误处理模式：**
```typescript
try {
  await signIn(email, password);
} catch (error: any) {
  console.error('Error signing in:', error);
  // 在 UI 中显示错误消息
  addToast('error', error.message || '登录失败');
}
```

---

### 数据库错误

**常见错误码：**

| 错误码 | 错误信息 | 原因 |
|-------|---------|------|
| PGRST116 | "The result contains 0 rows" | 查询结果为空 |
| 23505 | "duplicate key value violates unique constraint" | 违反唯一约束 |
| 23503 | "foreign key violation" | 外键约束冲突 |
| 42501 | "permission denied" | 权限不足（RLS策略） |

**错误处理模式：**
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    console.warn('Profile not found');
    // 处理用户不存在的情况
  } else {
    console.error('Database error:', error);
    throw error;
  }
}
```

---

### 业务逻辑错误

**错误类型：**

| 错误消息 | 场景 | 处理方式 |
|---------|------|---------|
| "用户未登录" | 未登录尝试使用功能 | 重定向到登录页 |
| "使用次数已用完" | 超出会员限制 | 显示升级提示 |
| "文件大小超出限制" | 上传文件过大 | 显示文件大小限制 |
| "记录使用失败" | 使用记录插入失败 | 记录日志并提示用户 |

**错误处理模式：**
```typescript
const canUse = await checkFeatureAccess('image_bg_remove');

if (!canUse) {
  addToast('error', '使用次数已用完，请升级会员');
  setShowUpgradeModal(true);
  return;
}

// 继续执行功能...
```

---

## OpenAPI 规范

### 完整 OpenAPI 3.0 规范

```yaml
openapi: 3.0.3
info:
  title: FileHub API
  description: |
    FileHub 文件处理应用 API 文档
    
    提供用户认证、会员管理和功能使用记录等功能。
    
    **认证方式：** Bearer Token (Supabase JWT)
  version: 1.0.0
  contact:
    name: FileHub Support
  license:
    name: Proprietary

servers:
  - url: https://your-project.supabase.co/rest/v1
    description: Supabase REST API
  - url: https://your-project.supabase.co/auth/v1
    description: Supabase Auth API

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Supabase JWT token obtained from authentication

  schemas:
    UserProfile:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: 用户ID（与 auth.users 表关联）
        email:
          type: string
          format: email
          description: 用户邮箱
        username:
          type: string
          description: 用户名
        avatar_url:
          type: string
          format: uri
          nullable: true
          description: 头像URL
        created_at:
          type: string
          format: date-time
          description: 创建时间
        updated_at:
          type: string
          format: date-time
          description: 更新时间
      required:
        - id
        - email
        - username

    Membership:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: 会员记录ID
        user_id:
          type: string
          format: uuid
          description: 用户ID
        tier:
          type: string
          enum: [free, premium, enterprise]
          description: 会员等级
        started_at:
          type: string
          format: date-time
          description: 会员开始时间
        expires_at:
          type: string
          format: date-time
          nullable: true
          description: 会员过期时间（null表示永久）
        is_active:
          type: boolean
          description: 是否激活
        created_at:
          type: string
          format: date-time
          description: 创建时间
        updated_at:
          type: string
          format: date-time
          description: 更新时间
      required:
        - id
        - user_id
        - tier
        - is_active

    UsageLog:
      type: object
      properties:
        id:
          type: string
          format: uuid
          description: 记录ID
        user_id:
          type: string
          format: uuid
          description: 用户ID
        feature_type:
          type: string
          enum: 
            - image_bg_remove
            - image_id_photo
            - image_stamp
            - audio_convert
            - video_convert
          description: 功能类型代码
        feature_name:
          type: string
          description: 功能显示名称（中文）
        used_at:
          type: string
          format: date-time
          description: 使用时间
      required:
        - id
        - user_id
        - feature_type
        - feature_name

    SignUpRequest:
      type: object
      properties:
        email:
          type: string
          format: email
          description: 用户邮箱
        password:
          type: string
          format: password
          minLength: 6
          description: 密码（最少6位）
        options:
          type: object
          properties:
            data:
              type: object
              properties:
                username:
                  type: string
                  description: 用户名
      required:
        - email
        - password

    SignInRequest:
      type: object
      properties:
        email:
          type: string
          format: email
          description: 用户邮箱
        password:
          type: string
          format: password
          description: 密码
      required:
        - email
        - password

    AuthResponse:
      type: object
      properties:
        access_token:
          type: string
          description: JWT访问令牌
        token_type:
          type: string
          description: 令牌类型（bearer）
        expires_in:
          type: integer
          description: 令牌过期时间（秒）
        refresh_token:
          type: string
          description: 刷新令牌
        user:
          type: object
          description: 用户信息

    Error:
      type: object
      properties:
        message:
          type: string
          description: 错误消息
        code:
          type: string
          description: 错误代码
        details:
          type: string
          description: 错误详情

paths:
  # ==================== 认证端点 ====================
  /signup:
    post:
      tags:
        - Authentication
      summary: 用户注册
      description: |
        创建新用户账户，同时自动创建用户资料和免费会员记录。
        
        **数据库触发器：**
        - `handle_new_user` - 创建用户资料
        - `on_profile_created` - 创建免费会员
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SignUpRequest'
            example:
              email: user@example.com
              password: password123
              options:
                data:
                  username: JohnDoe
      responses:
        '200':
          description: 注册成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                message: "Password should be at least 6 characters"
        '422':
          description: 用户已存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                message: "User already registered"

  /token:
    post:
      tags:
        - Authentication
      summary: 用户登录
      description: 使用邮箱和密码登录，获取访问令牌
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SignInRequest'
            example:
              email: user@example.com
              password: password123
      responses:
        '200':
          description: 登录成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          description: 登录失败
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
              example:
                message: "Invalid login credentials"

  /logout:
    post:
      tags:
        - Authentication
      summary: 用户登出
      description: 使当前会话失效
      security:
        - BearerAuth: []
      responses:
        '204':
          description: 登出成功
        '401':
          description: 未授权

  # ==================== 用户资料端点 ====================
  /profiles:
    get:
      tags:
        - Profiles
      summary: 查询用户资料
      description: |
        查询用户资料列表（公开）
        
        **RLS策略：** 所有人可查看
      parameters:
        - name: id
          in: query
          description: 按用户ID过滤
          schema:
            type: string
            format: uuid
        - name: email
          in: query
          description: 按邮箱过滤
          schema:
            type: string
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/UserProfile'
    
    post:
      tags:
        - Profiles
      summary: 创建用户资料
      description: |
        创建新用户资料（通常由数据库触发器自动创建）
        
        **RLS策略：** 用户只能插入自己的资料
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserProfile'
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          description: 未授权
        '403':
          description: 权限不足（尝试创建其他用户的资料）

    patch:
      tags:
        - Profiles
      summary: 更新用户资料
      description: |
        更新用户资料（用户名、头像等）
        
        **RLS策略：** 用户只能更新自己的资料
      security:
        - BearerAuth: []
      parameters:
        - name: id
          in: query
          required: true
          description: 用户ID
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                avatar_url:
                  type: string
                  format: uri
            example:
              username: NewUsername
              avatar_url: https://example.com/avatar.jpg
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          description: 未授权
        '403':
          description: 权限不足（尝试更新其他用户的资料）

  # ==================== 会员信息端点 ====================
  /memberships:
    get:
      tags:
        - Memberships
      summary: 查询会员信息
      description: |
        查询当前用户的会员信息
        
        **RLS策略：** 用户只能查看自己的会员信息
      security:
        - BearerAuth: []
      parameters:
        - name: user_id
          in: query
          required: true
          description: 用户ID
          schema:
            type: string
            format: uuid
        - name: is_active
          in: query
          description: 按激活状态过滤
          schema:
            type: boolean
        - name: order
          in: query
          description: 排序方式
          schema:
            type: string
            default: created_at.desc
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Membership'
              example:
                - id: "550e8400-e29b-41d4-a716-446655440000"
                  user_id: "123e4567-e89b-12d3-a456-426614174000"
                  tier: "free"
                  started_at: "2025-01-01T00:00:00Z"
                  expires_at: null
                  is_active: true
                  created_at: "2025-01-01T00:00:00Z"
                  updated_at: "2025-01-01T00:00:00Z"
        '401':
          description: 未授权

    patch:
      tags:
        - Memberships
      summary: 更新会员信息
      description: |
        更新会员等级或过期时间（升级/续费）
        
        **RLS策略：** 用户可以更新自己的会员信息
      security:
        - BearerAuth: []
      parameters:
        - name: user_id
          in: query
          required: true
          description: 用户ID
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                tier:
                  type: string
                  enum: [free, premium, enterprise]
                expires_at:
                  type: string
                  format: date-time
            example:
              tier: premium
              expires_at: "2026-01-01T00:00:00Z"
      responses:
        '200':
          description: 更新成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Membership'
        '401':
          description: 未授权
        '403':
          description: 权限不足

  # ==================== 使用记录端点 ====================
  /usage_logs:
    get:
      tags:
        - Usage Logs
      summary: 查询使用记录
      description: |
        查询当前用户的功能使用记录
        
        **RLS策略：** 用户只能查看自己的使用记录
      security:
        - BearerAuth: []
      parameters:
        - name: user_id
          in: query
          required: true
          description: 用户ID
          schema:
            type: string
            format: uuid
        - name: feature_type
          in: query
          description: 按功能类型过滤
          schema:
            type: string
        - name: order
          in: query
          description: 排序方式
          schema:
            type: string
            default: used_at.desc
        - name: limit
          in: query
          description: 返回记录数量
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/UsageLog'
              example:
                - id: "660e8400-e29b-41d4-a716-446655440000"
                  user_id: "123e4567-e89b-12d3-a456-426614174000"
                  feature_type: "image_bg_remove"
                  feature_name: "背景移除"
                  used_at: "2025-01-17T10:30:00Z"
        '401':
          description: 未授权

    post:
      tags:
        - Usage Logs
      summary: 记录功能使用
      description: |
        记录用户使用某个功能
        
        **RLS策略：** 用户可以插入自己的使用记录
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id:
                  type: string
                  format: uuid
                feature_type:
                  type: string
                feature_name:
                  type: string
              required:
                - user_id
                - feature_type
                - feature_name
            example:
              user_id: "123e4567-e89b-12d3-a456-426614174000"
              feature_type: "image_bg_remove"
              feature_name: "背景移除"
      responses:
        '201':
          description: 记录成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UsageLog'
        '401':
          description: 未授权
        '403':
          description: 权限不足（尝试为其他用户创建记录）

tags:
  - name: Authentication
    description: 用户认证相关接口
  - name: Profiles
    description: 用户资料管理
  - name: Memberships
    description: 会员信息管理
  - name: Usage Logs
    description: 功能使用记录
```

---

## 附录

### A. Supabase 客户端配置

**文件：** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,    // 自动刷新令牌
      persistSession: true,      // 持久化会话
      detectSessionInUrl: true,  // 检测URL中的会话（OAuth回调）
    },
  }
);
```

**环境变量：**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### B. 完整使用流程示例

```typescript
import { useAuth } from '@/contexts/AuthContext';

function ImageBackgroundRemover() {
  const { user, membership, checkFeatureAccess, logFeatureUsage } = useAuth();

  async function handleRemoveBackground() {
    // 1. 检查功能访问权限
    const canUse = await checkFeatureAccess('image_bg_remove');
    
    if (!canUse) {
      alert('使用次数已用完，请升级会员');
      return;
    }

    try {
      // 2. 执行背景移除功能
      await removeBackground(image);

      // 3. 记录功能使用
      await logFeatureUsage('image_bg_remove', '背景移除');

      alert('背景移除成功！');
    } catch (error) {
      console.error(error);
      alert('处理失败，请重试');
    }
  }

  return (
    <div>
      <h1>背景移除</h1>
      <p>会员等级: {membership?.tier}</p>
      <button onClick={handleRemoveBackground}>
        移除背景
      </button>
    </div>
  );
}
```

---

### C. 数据库触发器详解

**触发器1：自动更新 updated_at 字段**

```sql
-- src/supabase/schema.sql:111
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用到 profiles 和 memberships 表
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**触发器2：新用户自动创建免费会员**

```sql
-- src/supabase/schema.sql:134
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
```

**触发器3：新用户注册自动创建资料（支持 OAuth）**

```sql
-- src/supabase/schema.sql:151
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      'User_' || substr(NEW.id::text, 1, 8)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### D. 相关文件索引

| 文件路径 | 说明 |
|---------|------|
| `supabase/schema.sql` | 数据库架构定义 |
| `src/types/auth.ts` | TypeScript 类型定义 |
| `src/contexts/AuthContext.tsx` | 认证上下文和业务逻辑 |
| `src/utils/membershipLimits.ts` | 会员权限配置和工具函数 |
| `src/lib/supabase.ts` | Supabase 客户端配置 |

---

## 许可证

本文档和相关代码归 FileHub 项目所有，保留所有权利。

**生成时间：** 2026-01-17

**版本：** 1.0.0
