const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../family_tree.sqlite');

let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('数据库连接失败:', err);
        reject(err);
        return;
      }
      console.log('数据库已连接');

      // 读取schema文件并执行
      const schema = fs.readFileSync(
        path.join(__dirname, 'schema.sql'),
        'utf8'
      );

      db.exec(schema, (err) => {
        if (err) {
          console.error('数据库初始化失败:', err);
          reject(err);
        } else {
          console.log('数据库初始化完成');
          resolve(db);
        }
      });
    });
  });
}

function getDatabase() {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase
};
