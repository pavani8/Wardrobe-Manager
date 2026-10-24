# Wardrobe Manager - Stop Script
# This script stops all running Node.js servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   STOPPING WARDROBE MANAGER" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $count = $nodeProcesses.Count
    Write-Host "  Found $count Node.js process(es)" -ForegroundColor White
    
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "  ✓ All Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "  ℹ No Node.js processes found" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SERVERS STOPPED" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")








