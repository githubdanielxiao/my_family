#!/bin/bash

# 切换环境配置脚本

ENV=$1

if [ -z "$ENV" ]; then
    echo "使用方法: ./scripts/switch-env.sh [development|production]"
    exit 1
fi

case $ENV in
    development)
        echo "[⚡] 切换到开发环境..."
        cp .env.example .env
        export NODE_ENV=development
        npm run dev
        ;;
    production)
        echo "[⚡] 切换到生产环境..."
        cp .env.production .env
        export NODE_ENV=production
        npm run start:pm2
        ;;
    *)
        echo "错误：未知的环境 '$ENV'"
        echo "支持的环境：development | production"
        exit 1
        ;;
esac
