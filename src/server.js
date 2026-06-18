const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { initializeDatabase } = require('./db/init');
const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/family');
const permissionRoutes = require('./routes/permissions');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 初始化数据库
initializeDatabase();

// 公开路由
app.use('/api/auth', authRoutes);

// 受保护的路由
app.use('/api/family', authMiddleware, familyRoutes);
app.use('/api/permissions', authMiddleware, permissionRoutes);

// 静态文件
app.use(express.static(path.join(__dirname, '../dist')));

// SPA路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || '服务器错误'
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
