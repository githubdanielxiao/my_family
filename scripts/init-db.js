import { initializeDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
