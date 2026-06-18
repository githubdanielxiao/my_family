#!/bin/bash

# 一键部署脚本 - 暴虐配置

set -e

echo "========================================"
echo "家族关系管理系统 - 部署脚本"
echo "========================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "错误：Node.js未安装"
    exit 1
fi

echo "✓ Node.js版本: $(node -v)"
echo "✓ npm版本: $(npm -v)"

# 安装依赖
echo "
>>> 安装依赖..."
npm install

# 构建前端
echo "
>>> 构建前端..."
npm run build

# 创建数据目录
echo "
>>> 创建数据目录..."
mkdir -p ./data
mkdir -p ./logs
mkdir -p ./data/backups

# 设置环境变量
echo "
>>> 检查环境配置..."
if [ ! -f ".env" ]; then
    echo "✗ .env 文件不存在，正在创建..."
    cp .env.example .env
    echo "✓ 已创建 .env，请修改会话密钥"
else
    echo "✓ .env 文件已存在"
fi

# 设置脚本执行权限
echo "
>>> 设置脚本权限..."
chmod +x scripts/*.sh deploy.sh make-executable.sh 2>/dev/null || true

echo "
========================================"
echo "✓ 部署完成！"
echo "========================================"
echo "
下一步：

  本地开发（启动同时前后端）：
    npm run dev

  暴虐模式（仅运行后端）：
    npm run start

  Docker部署：
    docker-compose up -d

  PM2部署：
    npm run start:pm2

详细信息请查看 DEPLOYMENT.md
"
