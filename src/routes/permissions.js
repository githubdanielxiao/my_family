const express = require('express');
const { getDatabase } = require('../db/init');
const { checkPermission } = require('../middleware/permission');

const router = express.Router();

// 获取成员的权限配置
router.get('/member/:memberId', (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;
  const memberId = req.params.memberId;

  // 检查是否有权限管理此成员
  db.get(
    'SELECT * FROM permissions WHERE user_id = ? AND member_id = ? AND can_manage_permissions = 1',
    [userId, memberId],
    (err, permission) => {
      if (err || !permission) {
        return res.status(403).json({
          error: '您没有权限管理此成员的权限'
        });
      }

      // 获取此成员下所有用户的权限
      db.all(
        'SELECT u.id, u.phone, p.* FROM users u LEFT JOIN permissions p ON u.id = p.user_id AND p.member_id = ? ORDER BY u.phone',
        [memberId],
        (err, userPermissions) => {
          if (err) {
            return res.status(500).json({ error: '获取权限失败' });
          }

          res.json({ userPermissions });
        }
      );
    }
  );
});

// 授予或更新权限
router.post('/grant', (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;
  const { targetUserId, memberId, can_view, can_edit_info, can_manage_permissions, can_view_children } = req.body;

  // 检查是否有权限管理此成员
  db.get(
    'SELECT * FROM permissions WHERE user_id = ? AND member_id = ? AND can_manage_permissions = 1',
    [userId, memberId],
    (err, permission) => {
      if (err || !permission) {
        return res.status(403).json({
          error: '您没有权限为此成员分配权限'
        });
      }

      // 检查该权限是否存在
      db.get(
        'SELECT * FROM permissions WHERE user_id = ? AND member_id = ?',
        [targetUserId, memberId],
        (err, existingPerm) => {
          if (existingPerm) {
            // 更新现有权限
            db.run(
              `UPDATE permissions SET
               can_view = ?, can_edit_info = ?, can_manage_permissions = ?, can_view_children = ?,
               updated_at = CURRENT_TIMESTAMP
               WHERE user_id = ? AND member_id = ?`,
              [can_view, can_edit_info, can_manage_permissions, can_view_children, targetUserId, memberId],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: '权限更新失败' });
                }

                // 审计日志
                db.run(
                  'INSERT INTO audit_logs (user_id, action, target_member_id, details) VALUES (?, ?, ?, ?)',
                  [userId, 'UPDATE_PERMISSION', memberId, JSON.stringify(req.body)]
                );

                res.json({ message: '权限更新成功' });
              }
            );
          } else {
            // 创建新权限
            db.run(
              `INSERT INTO permissions
               (user_id, member_id, can_view, can_edit_info, can_manage_permissions, can_view_children)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [targetUserId, memberId, can_view, can_edit_info, can_manage_permissions, can_view_children],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: '权限创建失败' });
                }

                // 审计日志
                db.run(
                  'INSERT INTO audit_logs (user_id, action, target_member_id, details) VALUES (?, ?, ?, ?)',
                  [userId, 'GRANT_PERMISSION', memberId, JSON.stringify(req.body)]
                );

                res.json({ message: '权限授予成功' });
              }
            );
          }
        }
      );
    }
  );
});

module.exports = router;
