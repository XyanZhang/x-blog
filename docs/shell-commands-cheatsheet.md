# Shell命令快速参考 🚀

## ⚡ 核心命令

| 命令 | 功能 | 示例 |
|------|------|------|
| `sleep n` | 等待n秒 | `sleep 5` |
| `curl URL` | 发送HTTP请求 | `curl -s http://localhost:3000` |
| `pkill pattern` | 杀死匹配的进程 | `pkill -f "next dev"` |
| `grep pattern` | 搜索文本 | `grep "error" file.log` |

## 🔗 常用组合

```bash
# 重启开发服务器
pkill -f "next dev" && sleep 2 && pnpm dev

# 测试服务器响应
curl -s http://localhost:3000 | grep "title"

# 查看进程
ps aux | grep node

# 实时监控错误
tail -f app.log | grep -i error
```

## 📋 curl常用选项

| 选项 | 功能 | 示例 |
|------|------|------|
| `-s` | 静默模式 | `curl -s URL` |
| `-I` | 只获取响应头 | `curl -I URL` |
| `-L` | 跟随重定向 | `curl -L URL` |
| `-o file` | 输出到文件 | `curl -o page.html URL` |
| `-X METHOD` | 指定请求方法 | `curl -X POST URL` |

## 🔍 grep常用选项

| 选项 | 功能 | 示例 |
|------|------|------|
| `-i` | 忽略大小写 | `grep -i "error" file` |
| `-v` | 反向匹配 | `grep -v "debug" file` |
| `-n` | 显示行号 | `grep -n "function" file` |
| `-r` | 递归搜索 | `grep -r "TODO" src/` |
| `-E` | 扩展正则 | `grep -E "(error\|warning)"` |

## ⚙️ 操作符

| 操作符 | 功能 | 示例 |
|--------|------|------|
| `\|` | 管道传递 | `ps aux \| grep node` |
| `&&` | 成功后执行 | `cmd1 && cmd2` |
| `\|\|` | 失败后执行 | `cmd1 \|\| cmd2` |
| `;` | 顺序执行 | `cmd1; cmd2` |
| `&` | 后台执行 | `cmd &` |

## 🏃‍♂️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+C` | 终止命令 |
| `Ctrl+Z` | 暂停命令 |
| `Ctrl+R` | 搜索历史 |
| `Ctrl+L` | 清屏 |
| `Tab` | 自动补全 |
| `!!` | 重复上个命令 |

## 🌐 网络调试

```bash
# 检查端口占用
lsof -i :3000
netstat -tulpn | grep :3000

# 杀死占用端口的进程
lsof -ti:3000 | xargs kill -9

# 测试网络连通性
ping google.com
curl -I https://example.com
```

## 📁 文件操作

```bash
# 查看文件内容
cat file.txt          # 显示全部内容
head -n 10 file.txt    # 显示前10行
tail -n 10 file.txt    # 显示后10行
tail -f file.txt       # 实时查看文件变化

# 文件搜索
find . -name "*.js"    # 查找JS文件
grep -r "keyword" .    # 递归搜索关键字
```

## 🔄 进程管理

```bash
# 查看进程
ps aux                 # 显示所有进程
ps aux | grep node     # 过滤node进程
top                    # 实时进程监控

# 杀死进程
kill PID              # 根据PID杀死
pkill node            # 杀死所有node进程
killall node          # 杀死所有node进程（替代方案）
```

## 📊 系统监控

```bash
# 系统资源
df -h                 # 磁盘使用情况
free -h               # 内存使用情况
top                   # CPU和内存监控
htop                  # 更好的top（需要安装）

# 网络状态
netstat -tulpn        # 查看端口监听
ss -tulpn             # 更现代的netstat
```

## 💡 开发常用别名

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
# 常用别名
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'

# 开发相关
alias dev='pnpm dev'
alias build='pnpm build'
alias restart='pkill -f "next dev" && sleep 2 && pnpm dev'

# 网络相关
alias ports='lsof -i -P -n | grep LISTEN'
alias myip='curl -s ifconfig.me'

# Git相关
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
```

## 🔧 正则表达式速查

| 符号 | 含义 | 示例 |
|------|------|------|
| `^` | 行首 | `grep "^Error"` |
| `$` | 行尾 | `grep "Error$"` |
| `.` | 任意字符 | `grep "a.b"` |
| `*` | 0个或多个 | `grep "ab*"` |
| `+` | 1个或多个 | `grep -E "ab+"` |
| `?` | 0个或1个 | `grep -E "ab?"` |
| `\|` | 或 | `grep -E "(error\|warning)"` |
| `[]` | 字符集 | `grep "[0-9]"` |

## 📝 实际场景示例

```bash
# 开发服务器管理
pkill -f "next dev" && sleep 2 && pnpm dev

# 查看页面响应
curl -s http://localhost:3000 | head -20

# 监控错误日志
tail -f app.log | grep -i --color error

# 检查API响应
curl -X POST -H "Content-Type: application/json" \
     -d '{"test":"data"}' \
     http://localhost:3000/api/test

# 批量处理文件
find src/ -name "*.tsx" | xargs grep -l "useState"

# 系统清理
docker system prune -f
npm cache clean --force
```

---

💡 **提示**: 使用 `man command` 查看任何命令的详细手册，例如 `man grep` 