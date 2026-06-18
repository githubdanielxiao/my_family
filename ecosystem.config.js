#!/usr/bin/env node

/**
 * 家族关系管理系统 - PM2优化配置
 */

module.exports = {
  apps: [
    {
      name: 'family-tree',
      script: './start.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        DEBUG: false
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      max_memory_restart: '500M',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['src'],
      ignore_watch: ['node_modules', 'data', 'logs', 'dist'],
      watch_delay: 1000,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      env_PATH: '/usr/bin:/usr/local/bin',
      interpreter: 'node',
      interpreter_args: '--max-old-space-size=512'
    }
  ]
}
