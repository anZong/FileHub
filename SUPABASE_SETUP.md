# Supabase 配置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录/注册
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **Name**: FileHub (或您喜欢的名称)
   - **Database Password**: 设置一个强密码（请妥善保管）
   - **Region**: 选择离您最近的区域
4. 点击 "Create new project" 并等待项目创建完成

## 2. 获取 API 密钥

项目创建完成后：

1. 在项目仪表板左侧菜单，点击 **Settings** (齿轮图标)
2. 点击 **API**
3. 找到以下信息：
   - **Project URL**: 这是您的 `VITE_SUPABASE_URL`
   - **anon public**: 这是您的 `VITE_SUPABASE_ANON_KEY`

## 3. 配置环境变量

1. 打开项目根目录的 `.env.local` 文件
2. 替换占位符为您的实际值：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 执行数据库架构

1. 在 Supabase 仪表板左侧菜单，点击 **SQL Editor**
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行脚本

执行成功后，您将看到以下表格被创建：
- `profiles` - 用户资料
- `memberships` - 会员信息
- `usage_logs` - 使用记录

## 5. 配置认证设置（可选）

### 基础认证设置 (Site URL)

**这是 OAuth 登录成功的关键步骤：**

1. 在 Supabase 仪表板，点击 **Authentication** → **Settings**
2. 找到 **Site URL** 配置项
3. 将其设置为您的本地开发地址：`http://localhost:5174` (或者您当前运行的端口)
4. 在 **Redirect URLs** 中，也添加同样的地址：`http://localhost:5174`
5. 点击页面底部的 **Save** 保存

### 邮箱确认设置

### 配置邮件模板

1. 在 **Authentication** → **Email Templates**
2. 自定义确认邮件、重置密码邮件等模板

### 第三方登录（可选）

如需支持 Google、GitHub 等第三方登录：

#### GitHub OAuth 配置

1. 在 Supabase 仪表板，点击 **Authentication** → **Providers**
2. 找到 **GitHub**，点击启用
3. **关键步骤**：复制 Supabase 提供的 **Callback URL (for OAuth)**
   - 格式类似：`https://your-project.supabase.co/auth/v1/callback`
4. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
5. 点击您的 OAuth App
6. 将刚才复制的 URL 粘贴到 **Authorization callback URL** 输入框中
7. 确保 **Homepage URL** 设置为 `http://localhost:5174` (或您的本地端口)
8. 点击 **Update application** 保存
9. 将 GitHub 提供的 **Client ID** 和 **Client Secret** 填回 Supabase 并保存

#### Google OAuth 配置

Google 登录需要从 Google Cloud Console 获取凭证：

**步骤 1: 创建 Google Cloud 项目**

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击顶部的项目下拉菜单，选择 **新建项目**
3. 输入项目名称（例如：FileHub）
4. 点击 **创建**

**步骤 2: 启用 Google+ API**

1. 在左侧菜单，点击 **API 和服务** → **库**
2. 搜索 "Google+ API"
3. 点击 **启用**

**步骤 3: 配置 OAuth 同意屏幕**

1. 在左侧菜单，点击 **API 和服务** → **OAuth 同意屏幕**
2. 选择 **外部**（如果是个人项目）
3. 点击 **创建**
4. 填写必填信息：
   - **应用名称**: FileHub（或您的应用名称）
   - **用户支持电子邮件**: 您的邮箱
   - **开发者联系信息**: 您的邮箱
5. 点击 **保存并继续**
6. 作用域页面可以跳过，点击 **保存并继续**
7. 测试用户页面可以跳过，点击 **保存并继续**

**步骤 4: 创建 OAuth 客户端 ID**

1. 在左侧菜单，点击 **API 和服务** → **凭据**
2. 点击顶部的 **+ 创建凭据** → **OAuth 客户端 ID**
3. 应用类型选择 **Web 应用**
4. 名称输入：FileHub Web Client
5. **已获授权的 JavaScript 来源**：
   - 添加：`http://localhost:5174`（开发环境）
   - 添加：`https://your-domain.com`（生产环境，如果有）
6. **已获授权的重定向 URI**：
   - 从 Supabase 获取重定向 URL：
     - 打开 Supabase 控制台
     - 进入 **Authentication** → **Providers** → **Google**
     - 复制 **Callback URL (for OAuth)** 
     - 格式类似：`https://your-project-id.supabase.co/auth/v1/callback`
   - 将这个 URL 粘贴到 Google Cloud Console 的重定向 URI 中
7. 点击 **创建**

**步骤 5: 获取凭证**

创建成功后，会弹出对话框显示：
- **客户端 ID** (Client ID)
- **客户端密钥** (Client Secret)

**请妥善保存这两个值！**

**步骤 6: 在 Supabase 中配置**

1. 回到 Supabase 控制台
2. 进入 **Authentication** → **Providers**
3. 找到 **Google**，点击启用
4. 填入刚才获取的：
   - **Client ID**: 粘贴 Google 的客户端 ID
   - **Client Secret**: 粘贴 Google 的客户端密钥
5. 点击 **Save**

完成！现在用户可以使用 Google 账号登录了。

> **提示**: 
> - 开发环境下，Google OAuth 可能需要将测试用户添加到 OAuth 同意屏幕的测试用户列表中
> - 生产环境需要提交应用审核（如果需要公开访问）
> - 确保 Supabase 的 Callback URL 已正确添加到 Google Cloud Console 的重定向 URI 中

## 6. 测试连接

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问应用并尝试注册新账户
3. 检查 Supabase 仪表板的 **Authentication** → **Users** 是否出现新用户
4. 检查 **Table Editor** 中的 `profiles` 和 `memberships` 表是否有对应数据

## 7. 常见问题

### Q: 注册后没有收到确认邮件？
A: 检查 Supabase 的邮件设置，开发环境可以暂时关闭邮箱确认。

### Q: 提示 "Invalid API key"？
A: 检查 `.env.local` 文件中的 API 密钥是否正确，确保重启了开发服务器。

### Q: 数据库连接失败？
A: 确认 Supabase 项目 URL 正确，检查网络连接。

### Q: RLS 策略导致无法访问数据？
A: 确保已正确执行 `schema.sql` 中的所有 RLS 策略。

## 8. 安全建议

- ✅ **不要**将 `.env.local` 文件提交到 Git
- ✅ 使用强密码策略
- ✅ 在生产环境启用邮箱确认
- ✅ 定期检查 Supabase 的安全日志
- ✅ 为生产环境使用独立的 Supabase 项目

## 9. 下一步

配置完成后，您可以：
- 测试用户注册和登录功能
- 体验会员系统
- 查看使用记录统计
- 根据需求调整会员等级和权限
