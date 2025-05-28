#!/bin/bash

# 生产环境数据库迁移脚本
# 使用方法: ./scripts/production-migrate.sh

set -e  # 遇到错误立即退出

# 配置
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/migration_$DATE.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# 检查环境
check_environment() {
    log "检查环境配置..."
    
    if [ "$NODE_ENV" != "production" ]; then
        error "NODE_ENV 必须设置为 production"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        error "DATABASE_URL 环境变量未设置"
    fi
    
    # 检查 Prisma CLI
    if ! command -v npx &> /dev/null; then
        error "npx 命令未找到"
    fi
    
    log "环境检查通过"
}

# 创建备份
create_backup() {
    log "开始创建数据库备份..."
    
    mkdir -p $BACKUP_DIR
    
    # 从 DATABASE_URL 提取数据库信息
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    if [[ $DATABASE_URL == postgresql* ]]; then
        # PostgreSQL 备份
        pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
    elif [[ $DATABASE_URL == mysql* ]]; then
        # MySQL 备份
        mysqldump --single-transaction --routines --triggers $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
    else
        warn "未识别的数据库类型，跳过备份"
        return
    fi
    
    if [ $? -eq 0 ]; then
        log "备份创建成功: backup_$DATE.sql.gz"
    else
        error "备份创建失败"
    fi
}

# 检查迁移状态
check_migration_status() {
    log "检查当前迁移状态..."
    
    npx prisma migrate status > migration_status.tmp 2>&1
    
    if grep -q "Database schema is up to date" migration_status.tmp; then
        log "数据库已是最新状态"
        rm migration_status.tmp
        exit 0
    elif grep -q "following migrations have not yet been applied" migration_status.tmp; then
        log "发现待应用的迁移"
        cat migration_status.tmp | tee -a $LOG_FILE
    else
        error "无法确定迁移状态"
    fi
    
    rm migration_status.tmp
}

# 执行迁移
run_migration() {
    log "开始执行数据库迁移..."
    
    # 设置迁移超时
    export MIGRATION_LOCK_TIMEOUT=60000
    
    if npx prisma migrate deploy 2>&1 | tee -a $LOG_FILE; then
        log "迁移执行成功"
    else
        error "迁移执行失败"
    fi
}

# 验证迁移结果
verify_migration() {
    log "验证迁移结果..."
    
    # 检查迁移状态
    if npx prisma migrate status | grep -q "Database schema is up to date"; then
        log "迁移状态验证通过"
    else
        error "迁移状态验证失败"
    fi
    
    # 生成新的 Prisma Client
    if npx prisma generate 2>&1 | tee -a $LOG_FILE; then
        log "Prisma Client 生成成功"
    else
        error "Prisma Client 生成失败"
    fi
    
    # 运行自定义验证脚本（如果存在）
    if [ -f "scripts/verify-migration.js" ]; then
        log "运行自定义验证脚本..."
        if node scripts/verify-migration.js 2>&1 | tee -a $LOG_FILE; then
            log "自定义验证通过"
        else
            error "自定义验证失败"
        fi
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log "清理旧备份文件..."
    
    # 保留最近7天的备份
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    
    log "旧备份清理完成"
}

# 发送通知（可选）
send_notification() {
    log "发送迁移完成通知..."
    
    # 这里可以集成 Slack、邮件等通知方式
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"数据库迁移完成: '$DATE'"}' \
    #   $SLACK_WEBHOOK_URL
    
    log "通知发送完成"
}

# 主函数
main() {
    log "开始生产环境数据库迁移流程"
    
    # 确认操作
    echo -e "${YELLOW}警告: 即将在生产环境执行数据库迁移${NC}"
    echo -e "${YELLOW}请确认以下信息:${NC}"
    echo "- 环境: $NODE_ENV"
    echo "- 数据库: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***@/')"
    echo "- 时间: $(date)"
    echo ""
    read -p "确认继续? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log "用户取消操作"
        exit 0
    fi
    
    # 执行迁移流程
    check_environment
    create_backup
    check_migration_status
    run_migration
    verify_migration
    cleanup_old_backups
    send_notification
    
    log "数据库迁移流程完成"
    log "日志文件: $LOG_FILE"
    log "备份文件: $BACKUP_DIR/backup_$DATE.sql.gz"
}

# 错误处理
trap 'error "脚本执行过程中发生错误"' ERR

# 执行主函数
main "$@" 