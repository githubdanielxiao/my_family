const { getDatabase } = require('../db/init');

function checkPermission(requiredPermissions) {
  return (req, res, next) => {
    const db = getDatabase();
    const userId = req.user.id;
    const memberId = req.params.memberId;

    db.get(
      'SELECT * FROM permissions WHERE user_id = ? AND member_id = ?',
      [userId, memberId],
      (err, permission) => {
        if (err) {
          return res.status(500).json({ error: '权限检查失败' });
        }

        if (!permission) {
          return res.status(403).json({
            error: '您没有权限访问此节点'
          });
        }

        // 检查具体权限
        for (const perm of requiredPermissions) {
          if (!permission[`can_${perm}`]) {
            return res.status(403).json({
              error: `您没有权限执行此操作: ${perm}`
            });
          }
        }

        req.permission = permission;
        next();
      }
    );
  };
}

module.exports = { checkPermission };
