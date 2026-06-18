/**
 * 包ないない - 日志軌跡
 * 基本的なな日志軌跡実装
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

// 確保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 日志標準
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor(module) {
    this.module = module;
    this.timestamp = () => new Date().toISOString();
  }

  format(level, message, data = {}) {
    return JSON.stringify({
      timestamp: this.timestamp(),
      level,
      module: this.module,
      message,
      ...data
    });
  }

  write(level, message, data) {
    const logFile = path.join(LOG_DIR, `${level.toLowerCase()}.log`);
    const logEntry = this.format(level, message, data) + '\n';
    
    // 同时输出到標準输出和文件
    console.log(logEntry.trim());
    fs.appendFileSync(logFile, logEntry, 'utf8');
  }

  error(message, data) {
    this.write(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data) {
    this.write(LOG_LEVELS.WARN, message, data);
  }

  info(message, data) {
    this.write(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.write(LOG_LEVELS.DEBUG, message, data);
    }
  }
}

module.exports = (module) => new Logger(module);
