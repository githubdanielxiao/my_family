import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db = null;

export async function initializeDatabase() {
  if (db) return db;

  try {
    db = await open({
      filename: process.env.DB_PATH || './data/family.db',
      driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON');

    // Create tables
    await createTables();
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  const tables = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      force_password_change BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      gender TEXT,
      birth_date DATE,
      phone TEXT,
      address TEXT,
      xinshijie_address TEXT,
      father_id TEXT,
      mother_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (father_id) REFERENCES members(id),
      FOREIGN KEY (mother_id) REFERENCES members(id)
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      can_view BOOLEAN DEFAULT 1,
      can_edit BOOLEAN DEFAULT 0,
      can_manage_permissions BOOLEAN DEFAULT 0,
      inherited_from_parent BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(member_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS family_config (
      id TEXT PRIMARY KEY,
      family_name TEXT NOT NULL,
      logo_url TEXT,
      root_member_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (root_member_id) REFERENCES members(id)
    );
  `;

  const statements = tables.split(';').filter(s => s.trim());
  for (const statement of statements) {
    await db.exec(statement);
  }
}

export async function getDatabase() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}
