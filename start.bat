@echo off
title Web Baca Komik Sub Indo
echo ========================================================
echo Memulai Aplikasi Web Baca Komik / Manga Subtitle Indonesia...
echo ========================================================
cd /d "%~dp0\server"
node src/index.js
pause
