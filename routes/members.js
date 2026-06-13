import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get Family Tree
router.get('/tree', async (req, res) => {
  try {
    const db = await getDatabase();
    const userId = req.user.id;

    // Get all members user has access to
    const members = await db.all(`
      SELECT DISTINCT m.* FROM members m
      LEFT JOIN permissions p ON m.id = p.member_id AND p.user_id = ?
      WHERE p.member_id IS NOT NULL OR m.user_id = ?
      ORDER BY m.name
    `, [userId, userId]);

    // Build tree structure
    const tree = buildFamilyTree(members);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Member Details
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const userId = req.user.id;

    // Check permission
    const permission = await db.get(`
      SELECT * FROM permissions WHERE member_id = ? AND user_id = ? AND can_view = 1
    `, [id, userId]);

    if (!permission && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const member = await db.get('SELECT * FROM members WHERE id = ?', [id]);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Get children
    const children = await db.all(
      'SELECT * FROM members WHERE father_id = ? OR mother_id = ?',
      [id, id]
    );

    // Get parents
    let father = null, mother = null;
    if (member.father_id) {
      father = await db.get('SELECT * FROM members WHERE id = ?', [member.father_id]);
    }
    if (member.mother_id) {
      mother = await db.get('SELECT * FROM members WHERE id = ?', [member.mother_id]);
    }

    res.json({
      member,
      father,
      mother,
      children
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Member
router.post('/', [
  body('name').notEmpty(),
  body('gender').isIn(['male', 'female', 'other']),
  body('birth_date').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, gender, birth_date, phone, address, xinshijie_address, father_id, mother_id } = req.body;
  const userId = req.user.id;

  try {
    const db = await getDatabase();
    const memberId = uuidv4();

    await db.run(`
      INSERT INTO members (id, user_id, name, gender, birth_date, phone, address, xinshijie_address, father_id, mother_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [memberId, userId, name, gender, birth_date || null, phone || null, address || null, xinshijie_address || null, father_id || null, mother_id || null]);

    const member = await db.get('SELECT * FROM members WHERE id = ?', [memberId]);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Member
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const userId = req.user.id;

    // Check edit permission
    const permission = await db.get(`
      SELECT * FROM permissions WHERE member_id = ? AND user_id = ? AND can_edit = 1
    `, [id, userId]);

    if (!permission && req.user.id !== id) {
      return res.status(403).json({ error: 'Edit access denied' });
    }

    const { name, gender, birth_date, phone, address, xinshijie_address } = req.body;
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (birth_date !== undefined) { updates.push('birth_date = ?'); values.push(birth_date); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (xinshijie_address !== undefined) { updates.push('xinshijie_address = ?'); values.push(xinshijie_address); }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(`UPDATE members SET ${updates.join(', ')} WHERE id = ?`, values);
    const member = await db.get('SELECT * FROM members WHERE id = ?', [id]);
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function buildFamilyTree(members) {
  const memberMap = {};
  const roots = [];

  members.forEach(m => {
    memberMap[m.id] = { ...m, children: [] };
  });

  members.forEach(m => {
    if (m.father_id && memberMap[m.father_id]) {
      memberMap[m.father_id].children.push(memberMap[m.id]);
    } else if (m.mother_id && memberMap[m.mother_id]) {
      memberMap[m.mother_id].children.push(memberMap[m.id]);
    } else if (!m.father_id && !m.mother_id) {
      roots.push(memberMap[m.id]);
    }
  });

  return roots;
}

export default router;
