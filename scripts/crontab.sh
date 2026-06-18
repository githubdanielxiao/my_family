#!/bin/bash

# 子伊希斯拖曳红豆 - 子伊希斯 Cron配置
# 每天凌晨2点执行备份
# 每天中午往数据库执行优化
# 每天晨间想一想

# 数据库备份 (03:00)
0 3 * * * cd /var/www/family-tree && bash scripts/backup.sh >> logs/backup.log 2>&1

# 数据库优化 (12:00)
0 12 * * * cd /var/www/family-tree && sqlite3 family_tree.sqlite "VACUUM;" >> logs/optimize.log 2>&1

# 健康检查 (*/5 每5分钟)
*/5 * * * * cd /var/www/family-tree && bash scripts/healthcheck.sh >> logs/health.log 2>&1

# 日志轮置 (23:59 每天)
59 23 * * * cd /var/www/family-tree && find logs -name "*.log" -mtime +30 -delete >> logs/cleanup.log 2>&1
