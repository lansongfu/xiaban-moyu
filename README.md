# 下班摸鱼 🐟

一个有趣的打工人状态追踪网站，记录你的摸鱼、打工和下班时刻！

## 功能

- 🐟 **摸鱼** - 记录摸鱼时刻
- 💼 **打工中** - 显示正在努力工作
- 🏃 **下班** - 庆祝下班！

## 实时统计

- 摸鱼人数
- 打工中人数
- 已下班人数
- 最早/最晚下班时间
- 下班排名

## 本地开发

```bash
# 安装依赖
cd backend
npm install

# 启动服务
node server.js

# 访问 http://localhost:3000
```

## 部署到 Railway

1. 在 GitHub 创建仓库并推送代码
2. 访问 https://railway.app
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测 Node.js 并部署
6. 获取公网 URL

## 部署到 Render

1. 访问 https://render.com
2. 创建 "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node server.js`
5. 部署完成！

## 技术栈

- **前端**: HTML + CSS + JavaScript
- **后端**: Node.js + Express
- **数据库**: SQLite

## 项目结构

```
xiaban-moyu/
├── backend/
│   ├── server.js      # 后端 API
│   └── package.json
├── frontend/
│   └── index.html     # 前端页面
└── database/
    └── xiaban.db      # SQLite 数据库
```

## License

MIT
