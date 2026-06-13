import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get Permissions for a Member
router.get('/member/:memberId', async (req, res) => {
  try {
    const db = await getDatabase();
    const { memberId } = req.params;
    const userId = req.user.id;

    // Check if user can manage permissions
    const canManage = await db.get(`
      SELECT * FROM permissions WHERE member_id = ? AND user_id = ? AND can_manage_permissions = 1
    `, [memberId, userId]);

    if (!canManage) {
      return res.status(403).json({ error: 'Cannot manage permissions for this member' });
    }

    const permissions = await db.all(
      'SELECT * FROM permissions WHERE member_id = ?',
      [memberId]
    );

    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grant Permission
router.post('/grant', async (req, res) => {
  try {
    const db = await getDatabase();
    const { member_id, user_id, can_view, can_edit, can_manage_permissions } = req.body;
    const adminUserId = req.user.id;

    // Check if requester can manage permissions
    const canManage = await db.get(`
      SELECT * FROM permissions WHERE member_id = ? AND user_id = ? AND can_manage_permissions = 1
    `, [member_id, adminUserId]);

    if (!canManage) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const permissionId = uuidv4();
    await db.run(`
      INSERT OR REPLACE INTO permissions 
      (id, member_id, user_id, can_view, can_edit, can_manage_permissions)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [permissionId, member_id, user_id, can_view ? 1 : 0, can_edit ? 1 : 0, can_manage_permissions ? 1 : 0]);

    res.json({ message: 'Permission granted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke Permission
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const userId = req.user.id;

    const permission = await db.get('SELECT * FROM permissions WHERE id = ?', [id]);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    const canManage = await db.get(`
      SELECT * FROM permissions WHERE member_id = ? AND user_id = ? AND can_manage_permissions = 1
    `, [permission.member_id, userId]);

    if (!canManage) {
      return res.status(403).json({ error: 'Cannot revoke this permission' });
    }

    await db.run('DELETE FROM permissions WHERE id = ?', [id]);
    res.json({ message: 'Permission revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
