const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/init');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'family-tree-secret-key-2026';

// 登录
router.post('/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      error: '手机号和密码不能为空'
    });
  }

  const db = getDatabase();

  db.get(
    'SELECT * FROM users WHERE phone = ?',
    [phone],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: '登录失败' });
      }

      if (!user) {
        // 自动创建新用户（首次登录）
        const hashedPassword = bcrypt.hashSync(password, 10);
        db.run(
          'INSERT INTO users (phone, password) VALUES (?, ?)',
          [phone, hashedPassword],
          function(err) {
            if (err) {
              return res.status(500).json({ error: '创建用户失败' });
            }

            const token = jwt.sign(
              { id: this.lastID, phone, passwordChanged: false },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.json({
              token,
              user: {
                id: this.lastID,
                phone,
                passwordChanged: false
              }
            });
          }
        );
      } else {
        // 验证密码
        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
          return res.status(401).json({
            error: '密码错误'
          });
        }

        const token = jwt.sign(
          { id: user.id, phone, passwordChanged: user.password_changed },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            phone,
            passwordChanged: user.password_changed
          }
        });
      }
    }
  );
});

// 修改密码
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.headers['x-user-id'];

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: '当前密码和新密码不能为空'
    });
  }

  const db = getDatabase();

  db.get(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: '用户不存在' });
      }

      const passwordMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({
          error: '当前密码错误'
        });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.run(
        'UPDATE users SET password = ?, password_changed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: '密码修改失败' });
          }

          res.json({
            message: '密码修改成功'
          });
        }
      );
    }
  );
});

module.exports = router;
