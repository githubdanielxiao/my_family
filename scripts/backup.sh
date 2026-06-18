#!/bin/bash

# 每日备份数据库脚本

BACKUP_DIR="./data/backups"
DB_FILE="./family_tree.sqlite"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 上储备份
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_DIR/family_tree_$DATE.sqlite"
    gzip "$BACKUP_DIR/family_tree_$DATE.sqlite"
    echo "[✓] 备份保存成功: family_tree_$DATE.sqlite.gz"
else
    echo "[✗] 数据库文件不存在: $DB_FILE"
    exit 1
fi

# 保留最多17天的备份
echo "[⚡] 清理旧备份..."
find "$BACKUP_DIR" -name "family_tree_*.sqlite.gz" -mtime +7 -delete

echo "[✓] 备份干准工作完成"
