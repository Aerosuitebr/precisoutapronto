@echo off
cd /d "%~dp0"
npm run build
start "Precisou, Tá Pronto" node server.mjs
start http://localhost:5173
