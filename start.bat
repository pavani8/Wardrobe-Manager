@echo off
REM Wardrobe Manager - Startup Script (Batch File)
REM This script starts the application using PowerShell

echo ========================================
echo    WARDROBE MANAGER
echo    Starting Application...
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Write-Host 'Starting application...' -ForegroundColor Green"

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0start.ps1"

REM If PowerShell script fails, show error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Failed to start application
    echo Make sure PowerShell is enabled on your system
    pause
    exit /b %ERRORLEVEL%
)

pause






