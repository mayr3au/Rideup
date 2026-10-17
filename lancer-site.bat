@echo off
cd /d "%~dp0"
title RIDEUP - serveur local
if exist ".env.local.txt" if not exist ".env.local" ren ".env.local.txt" ".env.local"

rem Arrete un serveur RIDE'UP deja lance (evite d'en avoir deux qui se marchent dessus)
for %%p in (3000 3001) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r ":%%p .*LISTENING"') do taskkill /F /PID %%a >nul 2>&1
)

npm run dev
pause
