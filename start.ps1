# Wardrobe Manager - Startup Script
# This script starts both backend and frontend servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   WARDROBE MANAGER" -ForegroundColor Cyan
Write-Host "   Starting Application..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  OK Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
Write-Host ""
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "  OK npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if dependencies are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  WARNING Backend dependencies not found. Installing..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR Failed to install backend dependencies!" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "  OK Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  OK Backend dependencies found" -ForegroundColor Green
}

if (-not (Test-Path "client\node_modules")) {
    Write-Host "  WARNING Frontend dependencies not found. Installing..." -ForegroundColor Yellow
    Set-Location client
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR Failed to install frontend dependencies!" -ForegroundColor Red
        Set-Location ..
        Read-Host "Press Enter to exit"
        exit 1
    }
    Set-Location ..
    Write-Host "  OK Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  OK Frontend dependencies found" -ForegroundColor Green
}

# Stop any existing Node.js processes
Write-Host ""
Write-Host "Stopping any existing servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "  OK Cleaned up existing processes" -ForegroundColor Green

# Start backend server
Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '=== BACKEND SERVER ===' -ForegroundColor Cyan; Write-Host 'Port: 5000' -ForegroundColor White; Write-Host 'URL: http://localhost:5000' -ForegroundColor White; Write-Host ''; node server/index.js" -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; Write-Host '=== FRONTEND SERVER ===' -ForegroundColor Cyan; Write-Host 'Port: 3000' -ForegroundColor White; Write-Host 'URL: http://localhost:3000' -ForegroundColor White; Write-Host 'Compiling... (may take 30-60 seconds)' -ForegroundColor Yellow; Write-Host ''; npm start" -PassThru -WindowStyle Minimized

# Wait a bit for servers to start
Write-Host ""
Write-Host "Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check server status
Write-Host ""
Write-Host "Checking server status..." -ForegroundColor Yellow
$backendRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "  OK Backend Server: Running on http://localhost:5000" -ForegroundColor Green
    }
} catch {
    Write-Host "  WARNING Backend Server: Starting... (check minimized window)" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $frontendRunning = $true
        Write-Host "  OK Frontend Server: Running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "  WARNING Frontend Server: Starting... (may take 30-60 seconds to compile)" -ForegroundColor Yellow
}

# Display summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   APPLICATION STARTED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Access the application at:" -ForegroundColor White
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend API:" -ForegroundColor White
Write-Host "  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server Windows:" -ForegroundColor White
Write-Host "  - Two minimized PowerShell windows are running" -ForegroundColor Gray
Write-Host "  - Check taskbar for server logs" -ForegroundColor Gray
Write-Host ""
Write-Host "To Stop Servers:" -ForegroundColor White
Write-Host "  - Close the minimized PowerShell windows, OR" -ForegroundColor Gray
Write-Host "  - Run: Get-Process -Name node | Stop-Process" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to exit this window (servers will continue running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
