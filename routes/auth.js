import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Login Route
router.post('/login', [
  body('phone').isMobilePhone('zh-CN'),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone, password } = req.body;

  try {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        is_admin: user.is_admin,
        force_password_change: user.force_password_change
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        is_admin: user.is_admin,
        force_password_change: user.force_password_change
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Route (Admin only)
router.post('/register', [
  body('phone').isMobilePhone('zh-CN'),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone, password, is_admin } = req.body;

  try {
    const db = await getDatabase();
    const existingUser = await db.get('SELECT id FROM users WHERE phone = ?', [phone]);

    if (existingUser) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await db.run(
      `INSERT INTO users (id, phone, password, is_admin, force_password_change) 
       VALUES (?, ?, ?, ?, 1)`,
      [userId, phone, hashedPassword, is_admin ? 1 : 0]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, phone, is_admin: is_admin ? 1 : 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change Password
router.post('/change-password', [
  body('old_password').notEmpty(),
  body('new_password').isLength({ min: 6 })
], async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.run(
      `UPDATE users SET password = ?, force_password_change = 0, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [hashedPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
