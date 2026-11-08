@echo off
cd /d "%~dp0"
title KFKA - Servidor Local

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERRO: Node.js nao foi encontrado neste computador.
    echo Instale o Node.js 22.5 ou superior e tente novamente.
    echo.
    pause
    exit /b 1
)

start "Servidor KFKA" cmd /k node --no-warnings backend\servidor.js
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000
