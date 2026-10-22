@echo off
cd /d "%~dp0"
title Infinite Canvas

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo [ERROR] Node.js not found!
  echo Please install Node.js LTS from https://nodejs.org
  echo Then double-click start.bat again.
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First run: installing dependencies, please wait...
  call npm install
  if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed. Please check your network and try again.
    pause
    exit /b 1
  )
)

echo.
echo Starting... Browser will open http://localhost:5173
echo Press Ctrl+C to stop the server.
echo.
start "" http://localhost:5173
call npm run dev
pause
