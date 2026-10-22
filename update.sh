#!/bin/bash
# Mac / Linux 更新脚本
cd "$(dirname "$0")"

if ! command -v git >/dev/null 2>&1; then
  echo "[ERROR] Git not found. Please install git first."
  exit 1
fi

echo "Pulling latest updates..."
git pull || { echo "[ERROR] git pull failed"; exit 1; }

echo "Updating dependencies..."
npm install

echo "Update complete! Run ./start.sh to launch."
