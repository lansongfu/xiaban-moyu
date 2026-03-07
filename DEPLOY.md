# 🚀 部署指南

## 方案 A: Railway（推荐 ⭐）

### 步骤：

1. **推送代码到 GitHub**
   ```bash
   cd /root/.openclaw/workspace/projects/xiaban-moyu
   git branch -M main
   git remote add origin <你的 GitHub 仓库地址>
   git push -u origin main
   ```

2. **部署到 Railway**
   - 访问 https://railway.app
   - 登录 GitHub 账号
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `xiaban-moyu` 仓库
   - Railway 会自动检测并部署

3. **获取公网 URL**
   - 部署完成后，Railway 会提供一个公网 URL
   - 格式：`https://xxx-production.up.railway.app`

### 优点：
- ✅ 免费额度够用
- ✅ 自动 HTTPS
- ✅ 部署简单
- ✅ 自动重启

---

## 方案 B: Render

### 步骤：

1. **推送代码到 GitHub**（同上）

2. **部署到 Render**
   - 访问 https://render.com
   - 登录 GitHub 账号
   - 点击 "New +" → "Web Service"
   - 选择 `xiaban-moyu` 仓库
   - 配置：
     - **Name**: xiaban-moyu
     - **Region**: Singapore（离中国近）
     - **Branch**: main
     - **Root Directory**: `backend`
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
   - 点击 "Create Web Service"

3. **获取公网 URL**
   - 部署完成后，Render 会提供 URL
   - 格式：`https://xiaban-moyu.onrender.com`

### 优点：
- ✅ 免费套餐
- ✅ 自动 HTTPS
- ✅ 离中国近（新加坡节点）

---

## 方案 C: Vercel + Serverless

需要改造后端为 Serverless 函数，适合前端为主的场景。

---

## 方案 D: 自有服务器

如果有自己的 VPS：

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
cd /root/.openclaw/workspace/projects/xiaban-moyu/backend
pm2 start server.js --name xiaban-moyu

# 设置开机自启
pm2 startup
pm2 save

# 配置 Nginx 反向代理
# 域名 → localhost:3000
```

---

## 环境变量（可选）

部署时可以设置：

```
PORT=3000
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 数据库持久化

**Railway/Render** 会自动持久化数据。

如果担心数据丢失，可以迁移到：
- PostgreSQL（Railway/Render 都支持）
- Supabase（免费 PostgreSQL）

---

## 推荐选择

**首次部署 → Railway**（最简单）
**追求速度 → Render 新加坡**（国内访问快）
**长期运营 → 自有服务器 + 域名**
