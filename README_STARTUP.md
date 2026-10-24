# Quick Start Guide

## Easy Startup Options

### Option 1: Double-Click (Easiest)
1. **Double-click `start.bat`** - This will start both servers automatically
2. Wait for the servers to start (30-60 seconds for first time)
3. Open http://localhost:3000 in your browser

### Option 2: PowerShell Script
1. **Right-click `start.ps1`** → "Run with PowerShell"
2. Or open PowerShell and run: `.\start.ps1`
3. Open http://localhost:3000 in your browser

### Option 3: Command Line
```powershell
# Start both servers
npm run dev

# Or start separately
npm run server    # Backend only
npm run client    # Frontend only
```

## Stopping the Application

### Option 1: Double-Click
- **Double-click `stop.bat`** - This will stop all servers

### Option 2: PowerShell
- **Right-click `stop.ps1`** → "Run with PowerShell"
- Or run: `.\stop.ps1`

### Option 3: Command Line
```powershell
# Stop all Node.js processes
Get-Process -Name node | Stop-Process
```

### Option 4: Close Windows
- Close the minimized PowerShell windows from the taskbar

## What the Startup Script Does

1. ✅ Checks if Node.js is installed
2. ✅ Checks if npm is installed
3. ✅ Installs dependencies if missing
4. ✅ Stops any existing servers
5. ✅ Starts backend server (port 5000)
6. ✅ Starts frontend server (port 3000)
7. ✅ Checks server status
8. ✅ Shows access URLs

## Server Information

- **Backend Server**: http://localhost:5000
- **Frontend Server**: http://localhost:3000
- **Application URL**: http://localhost:3000

## Troubleshooting

### "Node.js is not installed"
- Download and install Node.js from https://nodejs.org/
- Restart your computer after installation

### "PowerShell execution policy error"
- Run PowerShell as Administrator
- Run: `Set-ExecutionPolicy RemoteSigned`
- Or use `start.bat` instead

### "Port already in use"
- Run `stop.bat` or `stop.ps1` first
- Or manually close the PowerShell windows
- Or change ports in `.env` (backend) and `client/package.json` (frontend)

### "Dependencies installation failed"
- Check your internet connection
- Try running `npm install` manually in the project root
- Then run `cd client && npm install`

### Servers not starting
- Check the minimized PowerShell windows for error messages
- Ensure ports 3000 and 5000 are not in use by other applications
- Check Windows Firewall settings

## First Time Setup

If this is your first time running the application:

1. Run `start.bat` or `start.ps1`
2. Wait for dependencies to install (may take 2-5 minutes)
3. Servers will start automatically
4. Open http://localhost:3000 in your browser
5. Register a new account
6. Select your gender to initialize categories
7. Start adding your wardrobe!

## Notes

- The startup script creates two minimized PowerShell windows
- Check the taskbar for server logs
- Servers will continue running even if you close the startup window
- Use `stop.bat` to properly stop all servers








