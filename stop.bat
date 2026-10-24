@echo off
REM Wardrobe Manager - Stop Script (Batch File)

echo Stopping Wardrobe Manager servers...

powershell -ExecutionPolicy Bypass -File "%~dp0stop.ps1"

pause








