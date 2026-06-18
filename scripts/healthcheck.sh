#!/bin/bash

# 基础健康检查脚本

echo "[⚡] 执行健���检查..."

# 检查服务器是否运行
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "[✓] 服务器正常运行"
    exit 0
else
    echo "[✗] 服务器不可用"
    exit 1
fi
