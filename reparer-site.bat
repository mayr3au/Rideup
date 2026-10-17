@echo off
cd /d "%~dp0"
title RIDEUP - reparation
echo Arret des serveurs en cours...
for %%p in (3000 3001) do (
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r ":%%p .*LISTENING"') do taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo Suppression du cache .next...
if exist ".next" rmdir /s /q ".next"
echo Relance du serveur (premiere compilation : ~20 s)...
call lancer-site.bat
