#!/bin/bash
# Mac / Linux 一键启动
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "[提示] 没有检测到 Node.js，请先安装："
  echo "  打开 https://nodejs.org 下载 LTS 版本并安装"
  echo "  安装完成后重新运行本脚本"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "首次运行，正在安装依赖，请稍候..."
  npm install
fi

echo "正在启动... 浏览器会自动打开 http://localhost:5173"
( sleep 3; (open http://localhost:5173 || xdg-open http://localhost:5173) ) &
npm run dev
