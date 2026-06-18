const express = require('express');
const { getDatabase } = require('../db/init');

const router = express.Router();

// 获取家族树
router.get('/tree', (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;

  db.all(
    `SELECT fm.* FROM family_members fm
     INNER JOIN permissions p ON fm.id = p.member_id
     WHERE p.user_id = ? AND p.can_view = 1`,
    [userId],
    (err, members) => {
      if (err) {
        return res.status(500).json({ error: '获取家族树失败' });
      }

      // 构建树形结构
      const tree = buildFamilyTree(members);
      res.json({ tree });
    }
  );
});

// 获取成员详情
router.get('/member/:memberId', (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;
  const memberId = req.params.memberId;

  db.get(
    `SELECT fm.* FROM family_members fm
     INNER JOIN permissions p ON fm.id = p.member_id
     WHERE p.user_id = ? AND p.can_view = 1 AND fm.id = ?`,
    [userId, memberId],
    (err, member) => {
      if (err) {
        return res.status(500).json({ error: '获取成员信息失败' });
      }

      if (!member) {
        return res.status(403).json({
          error: '您没有权限查看此成员信息'
        });
      }

      res.json({ member });
    }
  );
});

// 更新成员信息
router.put('/member/:memberId', (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;
  const memberId = req.params.memberId;
  const { name, birth_date, gender, phone, home_address, new_world_address } = req.body;

  // 检查编辑权限
  db.get(
    'SELECT * FROM permissions WHERE user_id = ? AND member_id = ? AND can_edit_info = 1',
    [userId, memberId],
    (err, permission) => {
      if (err || !permission) {
        return res.status(403).json({
          error: '您没有权限编辑此成员信息'
        });
      }

      db.run(
        `UPDATE family_members SET
         name = ?, birth_date = ?, gender = ?, phone = ?,
         home_address = ?, new_world_address = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [name, birth_date, gender, phone, home_address, new_world_address, memberId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: '更新失败' });
          }

          // 记录审计日志
          db.run(
            'INSERT INTO audit_logs (user_id, action, target_member_id, details) VALUES (?, ?, ?, ?)',
            [userId, 'UPDATE_MEMBER', memberId, JSON.stringify(req.body)]
          );

          res.json({ message: '成员信息更新成功' });
        }
      );
    }
  );
});

// 添加新成员
router.post('/member', (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;
  const { name, birth_date, gender, phone, home_address, new_world_address, father_id, mother_id } = req.body;

  db.run(
    `INSERT INTO family_members
     (user_id, name, birth_date, gender, phone, home_address, new_world_address, father_id, mother_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, birth_date, gender, phone, home_address, new_world_address, father_id, mother_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '添加成员失败' });
      }

      res.json({
        message: '成员添加成功',
        memberId: this.lastID
      });
    }
  );
});

function buildFamilyTree(members) {
  const map = {};
  const roots = [];

  members.forEach(member => {
    map[member.id] = { ...member, children: [] };
  });

  members.forEach(member => {
    if (member.father_id && map[member.father_id]) {
      map[member.father_id].children.push(map[member.id]);
    } else if (member.mother_id && map[member.mother_id]) {
      map[member.mother_id].children.push(map[member.id]);
    } else if (member.is_root) {
      roots.push(map[member.id]);
    }
  });

  return roots;
}

module.exports = router;
