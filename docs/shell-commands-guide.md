# Shell命令学习指南

## 📚 概述

这些命令都是 **Unix/Linux Shell** 的核心工具，适用于：
- **macOS** (基于Unix)
- **Linux** 各种发行版 (Ubuntu, CentOS, Alpine等)
- **Windows WSL** (Windows Subsystem for Linux)
- **Git Bash** (Windows)

## 🔧 基础命令详解

### 1. `sleep` - 延时等待

**功能**: 让程序暂停指定的时间

```bash
# 基本语法
sleep [时间][单位]

# 示例
sleep 5        # 等待5秒
sleep 10       # 等待10秒
sleep 2m       # 等待2分钟
sleep 1h       # 等待1小时
sleep 30s      # 等待30秒（s可省略）

# 实际使用场景
sleep 3 && echo "3秒后执行"
```

**常用场景**:
- 服务重启后等待启动完成
- 批处理脚本中的延时
- 给系统处理时间

### 2. `curl` - 网络请求工具

**功能**: 发送HTTP请求，下载文件，测试API

```bash
# 基本语法
curl [选项] [URL]

# 常用选项
curl -s          # 静默模式，不显示进度
curl -v          # 详细模式，显示请求头
curl -I          # 只获取响应头
curl -L          # 跟随重定向
curl -o file     # 输出到文件
curl -X POST     # 指定请求方法

# 实际示例
curl http://localhost:3000                    # 获取首页内容
curl -s http://localhost:3000                # 静默获取（无进度条）
curl -I http://localhost:3000                # 只看响应头
curl -L https://example.com                  # 跟随重定向

# 测试API
curl -X POST -H "Content-Type: application/json" \
     -d '{"name":"test"}' \
     http://localhost:3000/api/users

# 下载文件
curl -o filename.zip https://example.com/file.zip
```

**常用场景**:
- 测试Web服务是否正常
- API接口测试
- 文件下载
- 健康检查

### 3. `pkill` - 进程终止

**功能**: 根据进程名称杀死进程

```bash
# 基本语法
pkill [选项] 进程名称模式

# 常用选项
pkill -f        # 匹配完整命令行
pkill -9        # 强制杀死
pkill -u user   # 杀死指定用户的进程

# 实际示例
pkill node                    # 杀死所有node进程
pkill -f "next dev"          # 杀死包含"next dev"的进程
pkill -f "npm start"         # 杀死npm start进程
pkill -9 -f "stuck_process"  # 强制杀死卡住的进程
```

**相关命令**:
```bash
ps aux | grep node    # 查看node相关进程
killall node          # 杀死所有node进程
kill -9 PID           # 根据进程ID杀死
```

### 4. `grep` - 文本搜索

**功能**: 在文本中搜索匹配的行

```bash
# 基本语法
grep [选项] "搜索模式" [文件]

# 常用选项
grep -i          # 忽略大小写
grep -v          # 反向匹配（显示不匹配的行）
grep -n          # 显示行号
grep -r          # 递归搜索目录
grep -E          # 使用扩展正则表达式
grep -o          # 只输出匹配的部分

# 实际示例
grep "error" app.log                    # 搜索错误日志
grep -i "warning" *.log                # 忽略大小写搜索警告
grep -v "debug" app.log                 # 排除debug信息
grep -n "function" script.js            # 显示行号
grep -r "TODO" src/                     # 递归搜索TODO注释

# 与其他命令组合
ps aux | grep node                      # 查找node进程
curl -s http://localhost:3000 | grep "title"  # 搜索网页中的title标签
```

**正则表达式示例**:
```bash
grep "^Error"           # 以Error开头的行
grep "Error$"           # 以Error结尾的行
grep "Error.*timeout"   # Error和timeout之间的任意字符
grep -E "(error|warning)"  # 匹配error或warning
```

## ⚡ 高级用法和组合

### 管道操作符 `|`

将前一个命令的输出作为后一个命令的输入：

```bash
# 基本组合
ps aux | grep node                        # 查看进程并过滤
curl -s http://localhost:3000 | grep "title"  # 获取页面并搜索
cat file.log | grep "error" | wc -l       # 统计错误行数

# 复杂组合
docker ps | grep "running" | awk '{print $1}' | xargs docker stop
# 解释：列出容器 → 过滤运行中的 → 提取容器ID → 停止容器
```

### 逻辑操作符

```bash
# && (AND) - 前一个命令成功才执行后一个
pkill -f "next dev" && sleep 2 && pnpm dev

# || (OR) - 前一个命令失败才执行后一个
pnpm dev || echo "启动失败"

# ; - 无论成功失败都执行下一个
cd /tmp; ls; cd -
```

### 后台执行 `&`

```bash
# 后台运行命令
pnpm dev &              # 后台启动开发服务器
sleep 10 &              # 后台等待10秒

# 查看后台任务
jobs                     # 列出当前shell的后台任务
bg                       # 将最近的任务放到后台
fg                       # 将后台任务拉到前台

# 彻底后台运行（不受终端关闭影响）
nohup pnpm dev > app.log 2>&1 &
```

## 🛠️ 项目开发中的实际应用

### 1. 开发服务器管理

```bash
# 重启开发服务器的完整流程
pkill -f "next dev" && sleep 2 && pnpm dev

# 检查服务器是否启动
sleep 5 && curl -s http://localhost:3000 > /dev/null && echo "服务器已启动"

# 监控服务器状态
while true; do
  curl -s http://localhost:3000 > /dev/null || echo "服务器异常: $(date)"
  sleep 30
done
```

### 2. 日志分析

```bash
# 实时查看错误日志
tail -f app.log | grep -i error

# 统计不同类型的日志
grep -c "ERROR" app.log
grep -c "WARNING" app.log
grep -c "INFO" app.log

# 查看最近的错误
grep "ERROR" app.log | tail -10
```

### 3. 端口和进程管理

```bash
# 查看端口占用
lsof -i :3000           # 查看3000端口占用
netstat -tulpn | grep :3000  # 另一种方法

# 杀死占用端口的进程
lsof -ti:3000 | xargs kill -9

# 批量管理进程
ps aux | grep node | awk '{print $2}' | xargs kill
```

### 4. 系统监控

```bash
# 监控系统资源
top                     # 实时系统状态
htop                    # 更友好的top
df -h                   # 磁盘使用情况
free -h                 # 内存使用情况

# 监控特定进程
ps aux | grep -E "(node|npm)" | grep -v grep
```

## 📖 学习路径建议

### 初级阶段
1. **基础文件操作**: `ls`, `cd`, `pwd`, `mkdir`, `rm`, `cp`, `mv`
2. **文本处理**: `cat`, `less`, `head`, `tail`, `grep`
3. **进程管理**: `ps`, `kill`, `pkill`, `jobs`
4. **网络工具**: `curl`, `ping`, `wget`

### 中级阶段
1. **管道和重定向**: `|`, `>`, `>>`, `<`, `2>&1`
2. **文本处理工具**: `awk`, `sed`, `sort`, `uniq`, `wc`
3. **压缩解压**: `tar`, `gzip`, `zip`, `unzip`
4. **系统信息**: `df`, `du`, `free`, `top`, `netstat`

### 高级阶段
1. **Shell脚本编程**: 变量、循环、条件判断
2. **正则表达式**: 高级模式匹配
3. **系统管理**: `systemctl`, `crontab`, `ssh`, `rsync`
4. **容器相关**: Docker命令行工具

## 🔗 推荐学习资源

### 在线教程
- **Linux Command Line Tutorial**: https://linuxcommand.org/
- **The Linux Command Handbook**: 免费电子书
- **ExplainShell**: https://explainshell.com/ (解释命令的网站)

### 练习网站
- **OverTheWire**: https://overthewire.org/wargames/bandit/
- **Linux Survival**: https://linuxsurvival.com/
- **Command Line Heroes**: 播客

### 参考手册
```bash
# 系统内置帮助
man command_name        # 查看命令手册
command_name --help     # 查看帮助信息
info command_name       # 查看info文档

# 示例
man grep               # grep的完整手册
curl --help           # curl的帮助信息
```

### macOS特定
```bash
# Homebrew包管理器
brew install htop     # 安装更好的top工具
brew install ripgrep  # 安装更快的grep (rg命令)
brew install jq       # JSON处理工具
```

## 💡 实用技巧

### 1. 命令历史
```bash
history               # 查看命令历史
!!                    # 重复上一个命令
!grep                 # 重复最近一个以grep开头的命令
Ctrl+R                # 搜索命令历史
```

### 2. 快捷键
```bash
Ctrl+C                # 终止当前命令
Ctrl+Z                # 暂停当前命令
Ctrl+D                # 退出当前shell
Ctrl+L                # 清屏
Tab                   # 自动补全
```

### 3. 别名设置
```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
alias ll='ls -la'
alias grep='grep --color=auto'
alias ports='lsof -i -P -n | grep LISTEN'
alias dev='pnpm dev'
alias restart='pkill -f "next dev" && sleep 2 && pnpm dev'
```

这些命令构成了Unix/Linux系统管理和开发的基础工具集，掌握它们将极大提高你的开发效率！ 