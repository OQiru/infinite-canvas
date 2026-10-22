@echo off
cd /d "%~dp0"
title Infinite Canvas Updater

where git >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Git not found. Please install from https://git-scm.com
  echo.
  pause
  exit /b 1
)

echo Pulling latest updates...
git pull
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] git pull failed. Check your network and try again.
  pause
  exit /b 1
)

echo Updating dependencies...
call npm install

echo.
echo Update complete! Now run start.bat to launch.
pause
