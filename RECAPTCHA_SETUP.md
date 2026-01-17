# Google reCAPTCHA v3 配置指南

## 为什么需要 reCAPTCHA？

reCAPTCHA v3 可以帮助您：
- 🛡️ 防止机器人自动注册账号
- 🚫 阻止恶意登录尝试
- ⚡ 防止 API 滥用和速率攻击
- ✅ 提供无感验证（用户无需点击）

## 配置步骤

### 1. 注册 reCAPTCHA

1. 访问 [Google reCAPTCHA 管理控制台](https://www.google.com/recaptcha/admin)
2. 点击 **+** 创建新站点

### 2. 填写站点信息

- **标签**: FileHub（或您的应用名称）
- **reCAPTCHA 类型**: 选择 **reCAPTCHA v3**
- **域名**: 
  - 开发环境：`localhost`
  - 生产环境：`your-domain.com`（您的实际域名）
- 接受服务条款
- 点击 **提交**

### 3. 获取密钥

创建成功后，您会看到两个密钥：

- **站点密钥 (Site Key)**: 用于前端，可以公开
- **密钥 (Secret Key)**: 用于后端验证，需要保密

**重要**: 我们只需要 **站点密钥**，因为验证逻辑在 Supabase 中处理。

### 4. 配置环境变量

编辑 `.env.local` 文件，添加站点密钥：

```env
VITE_RECAPTCHA_SITE_KEY=your_actual_site_key_here
```

将 `your_actual_site_key_here` 替换为您从 Google 获取的站点密钥。

### 5. 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 工作原理

### 前端流程

1. 用户访问登录/注册页面
2. reCAPTCHA 在后台分析用户行为
3. 用户提交表单时，获取 reCAPTCHA token
4. Token 随表单一起发送到 Supabase

### 安全分数

reCAPTCHA v3 返回一个分数（0.0 - 1.0）：
- **1.0**: 很可能是真人
- **0.5**: 中等风险
- **0.0**: 很可能是机器人

我们的实现会拒绝分数低于 0.5 的请求。

## 测试

### 开发环境测试

1. 打开应用的注册页面
2. 填写注册信息
3. 提交表单
4. 如果配置正确，注册应该正常工作

### 验证 reCAPTCHA 是否工作

1. 打开浏览器开发者工具 (F12)
2. 切换到 **Console** 标签
3. 应该看到 reCAPTCHA 相关的日志（如果启用了调试模式）
4. 在 **Network** 标签中，可以看到对 `recaptcha` 的请求

### 查看 reCAPTCHA 统计

1. 访问 [reCAPTCHA 管理控制台](https://www.google.com/recaptcha/admin)
2. 选择您的站点
3. 查看请求统计和分数分布

## 常见问题

### Q: 为什么需要站点密钥和密钥？

A: 
- **站点密钥**: 在前端使用，用于生成 token
- **密钥**: 在后端使用，用于验证 token（我们使用 Supabase，所以不需要自己处理）

### Q: reCAPTCHA v3 会影响用户体验吗？

A: 不会！reCAPTCHA v3 是完全无感的，用户不需要点击任何东西。

### Q: 如何处理低分用户？

A: 当前实现会阻止分数低于 0.5 的请求，但您可以调整阈值。

### Q: 开发环境下 localhost 可以使用吗？

A: 可以！在注册 reCAPTCHA 时添加 `localhost` 作为域名即可。

### Q: 生产环境需要更改什么？

A: 
1. 在 reCAPTCHA 控制台添加您的生产域名
2. 确保 `.env.local` 不会被提交到 Git
3. 在生产环境设置正确的环境变量

## 安全最佳实践

1. ✅ **不要提交密钥到 Git**
   - `.env.local` 已在 `.gitignore` 中
   
2. ✅ **使用环境变量**
   - 开发、测试、生产使用不同的密钥

3. ✅ **监控 reCAPTCHA 统计**
   - 定期检查是否有异常活动

4. ✅ **调整分数阈值**
   - 根据实际情况调整（当前为 0.5）

5. ✅ **配合其他安全措施**
   - reCAPTCHA + 速率限制 + RLS = 多层防护

## 下一步

配置完成后，您的应用将具备：
- ✅ 机器人防护
- ✅ 自动化攻击防护
- ✅ 用户友好的验证体验

如需进一步增强安全性，可以考虑：
- 添加邮箱验证
- 实施速率限制
- 启用多因素认证 (MFA)
