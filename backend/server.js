const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// 初始化数据库
const db = new Database(path.join(__dirname, '../database/xiaban.db'));

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS clock_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 生成用户 ID（基于 IP + UserAgent，长期不变）
function generateUserId(ip, userAgent) {
  const data = `${ip}-${userAgent}-xiaban-moyu-secret`;
  return crypto.createHash('md5').update(data).digest('hex');
}

// API: 提交状态
app.post('/api/clock', (req, res) => {
  try {
    const { status } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    if (!['摸鱼', '打工中', '下班'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }
    
    const userId = generateUserId(ip, userAgent);
    
    const stmt = db.prepare(`
      INSERT INTO clock_records (user_id, status, ip_hash)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(userId, status, ip);
    
    // 获取当前用户的排名（第几个下班）
    let rank = 0;
    if (status === '下班') {
      const rankStmt = db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM clock_records
        WHERE status = '下班'
        AND DATE(timestamp) = DATE('now')
        AND timestamp < (
          SELECT MIN(timestamp) FROM clock_records 
          WHERE user_id = ? AND status = '下班' AND DATE(timestamp) = DATE('now')
        )
      `);
      const rankResult = rankStmt.get(userId);
      rank = (rankResult?.count || 0) + 1;
    }
    
    res.json({
      success: true,
      message: '打卡成功',
      userId,
      rank: rank.rank
    });
  } catch (error) {
    console.error('Clock error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 获取统计数据
app.get('/api/stats', (req, res) => {
  try {
    // 今日各状态人数（去重）
    const statsStmt = db.prepare(`
      SELECT status, COUNT(DISTINCT user_id) as count
      FROM clock_records
      WHERE DATE(timestamp) = DATE('now')
      GROUP BY status
    `);
    const stats = statsStmt.all();
    
    // 最早下班
    const earliestStmt = db.prepare(`
      SELECT user_id, MIN(timestamp) as earliest_time
      FROM clock_records
      WHERE status = '下班'
      AND DATE(timestamp) = DATE('now')
    `);
    const earliest = earliestStmt.get();
    
    // 最晚下班
    const latestStmt = db.prepare(`
      SELECT user_id, MAX(timestamp) as latest_time
      FROM clock_records
      WHERE status = '下班'
      AND DATE(timestamp) = DATE('now')
    `);
    const latest = latestStmt.get();
    
    // 总下班人数
    const totalStmt = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as total
      FROM clock_records
      WHERE status = '下班'
      AND DATE(timestamp) = DATE('now')
    `);
    const total = totalStmt.get();
    
    res.json({
      success: true,
      data: {
        moyu: stats.find(s => s.status === '摸鱼')?.count || 0,
        work: stats.find(s => s.status === '打工中')?.count || 0,
        xiaban: stats.find(s => s.status === '下班')?.count || 0,
        earliest: (earliest && earliest.user_id) ? {
          time: earliest.earliest_time,
          user: earliest.user_id.substring(0, 8)
        } : null,
        latest: (latest && latest.user_id) ? {
          time: latest.latest_time,
          user: latest.user_id.substring(0, 8)
        } : null,
        total: total.total
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// API: 获取用户当前状态
app.get('/api/user-status', (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const userId = generateUserId(ip, userAgent);
    
    const stmt = db.prepare(`
      SELECT status, timestamp
      FROM clock_records
      WHERE user_id = ?
      AND DATE(timestamp) = DATE('now')
      ORDER BY timestamp DESC
      LIMIT 1
    `);
    
    const result = stmt.get(userId);
    
    res.json({
      success: true,
      data: result || null
    });
  } catch (error) {
    console.error('User status error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 数据库路径：database/xiaban.db`);
});
