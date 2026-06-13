import { getDatabase } from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

async function seedData() {
  try {
    const db = await getDatabase();

    // Create admin user
    const adminId = uuidv4();
    const adminPhone = '13800138000';
    const adminPassword = await bcrypt.hash('13800138000', 10);

    await db.run(`
      INSERT OR IGNORE INTO users (id, phone, password, is_admin, force_password_change)
      VALUES (?, ?, ?, 1, 0)
    `, [adminId, adminPhone, adminPassword]);

    // Create root member
    const rootId = uuidv4();
    await db.run(`
      INSERT OR IGNORE INTO members (id, user_id, name, gender, birth_date)
      VALUES (?, ?, ?, ?, ?)
    `, [rootId, adminId, '家族祖先', 'male', '1950-01-01']);

    // Create family config
    const configId = uuidv4();
    await db.run(`
      INSERT OR IGNORE INTO family_config (id, family_name, root_member_id)
      VALUES (?, ?, ?)
    `, [configId, '我的家族', rootId]);

    // Grant root permission to admin
    const permId = uuidv4();
    await db.run(`
      INSERT OR IGNORE INTO permissions (id, member_id, user_id, can_view, can_edit, can_manage_permissions)
      VALUES (?, ?, ?, 1, 1, 1)
    `, [permId, rootId, adminId]);

    console.log('✅ Database seeded successfully');
    console.log(`\n📋 Demo Credentials:`);
    console.log(`   Phone: ${adminPhone}`);
    console.log(`   Password: ${adminPhone}`);
    console.log(`\n⚠️  Remember to change password after first login!\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
