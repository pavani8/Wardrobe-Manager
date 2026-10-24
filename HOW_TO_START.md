# How to Start Wardrobe Manager

Step-by-step guide for opening the app after restarting your laptop or returning to the project.

**Project folder:** `C:\Users\vasap\Wardrobe`

---

## Prerequisites

- **Node.js** installed (v14+ recommended; includes npm). Download from [https://nodejs.org/](https://nodejs.org/) if needed.
- Project cloned or copied to `C:\Users\vasap\Wardrobe`.

Verify Node is available:

```powershell
node --version
npm --version
```

---

## Option 1: Easiest — `start.bat`

1. Open File Explorer and go to `C:\Users\vasap\Wardrobe`.
2. **Double-click `start.bat`.**
3. The script runs `start.ps1`, which:
   - Checks Node.js and npm
   - Installs missing dependencies if needed
   - Stops any old Node processes
   - Starts backend (port **5000**) and frontend (port **3000**) in minimized PowerShell windows
4. Wait **30–60 seconds** on first compile.
5. Open your browser to **[http://localhost:3000](http://localhost:3000)**.

You can close the startup window; the servers keep running in the background.

---

## Option 2: PowerShell / command line (dev mode)

Open PowerShell in the project folder:

```powershell
cd C:\Users\vasap\Wardrobe
npm run dev
```

This runs **both** servers concurrently:

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:3000 |
| Backend (API) | http://localhost:5000 |

Then open **http://localhost:3000** in your browser.

### Start servers separately (optional)

```powershell
npm run server    # Backend only → http://localhost:5000
npm run client    # Frontend only → http://localhost:3000
```

### Alternative: run `start.ps1` directly

```powershell
cd C:\Users\vasap\Wardrobe
.\start.ps1
```

If you get an execution policy error, use `start.bat` instead, or run once as Administrator:

```powershell
Set-ExecutionPolicy RemoteSigned
```

---

## Option 3: Production mode (for ngrok / sharing one URL)

Use this when you want a **single port** (5000) serving both the UI and API—required for ngrok and similar tunnels.

1. **Stop dev servers** first:

   ```powershell
   cd C:\Users\vasap\Wardrobe
   .\stop.bat
   ```

   Or: `Get-Process -Name node | Stop-Process`

2. **Build the React app:**

   ```powershell
   cd C:\Users\vasap\Wardrobe\client
   npm run build
   ```

3. **Start the server only** (serves API + built frontend):

   ```powershell
   cd C:\Users\vasap\Wardrobe
   npm run server
   ```

4. Open **http://localhost:5000** locally.

5. **Share via ngrok** (install from [ngrok.com](https://ngrok.com/) if needed):

   ```powershell
   ngrok http 5000
   ```

   Copy the **https** URL ngrok shows and share it. Update `CLIENT_URL` in `server/.env` to that URL if you use email password reset.

---

## How to STOP the app

| Method | Action |
|--------|--------|
| **Easiest** | Double-click `stop.bat` |
| **PowerShell** | `.\stop.ps1` |
| **Manual** | `Get-Process -Name node \| Stop-Process` |
| **UI** | Close the minimized PowerShell windows from the taskbar (backend + frontend) |

`stop.bat` / `stop.ps1` kill **all** Node.js processes on the machine—if you run other Node apps, close those windows individually instead.

---

## First time after clone / fresh laptop

Install all dependencies once from the project root:

```powershell
cd C:\Users\vasap\Wardrobe
npm run install-all
```

This runs `npm install` in the root, `server/`, and `client/`.

Then:

1. Copy `server/.env.example` → `server/.env` (optional but recommended).
2. Run `start.bat` or `npm run dev`.
3. Open http://localhost:3000.
4. **Register** a new account, or log in as admin: **`superadmin`** / **`admin123`** (change this password after first login).

---

## Troubleshooting

### Port already in use (3000 or 5000)

- Run `stop.bat` first.
- Or find and kill the process using the port:

  ```powershell
  netstat -ano | findstr :5000
  netstat -ano | findstr :3000
  taskkill /PID <pid> /F
  ```

- Change backend port in `server/.env` (`PORT=5001`) or frontend in `client/package.json` if needed.

### ngrok not found

- Install ngrok and add it to your PATH, or run it from its install folder.
- Sign up at ngrok.com and run `ngrok config add-authtoken <your-token>` once.

### Compile errors on frontend

- Delete and reinstall client deps:

  ```powershell
  cd C:\Users\vasap\Wardrobe\client
  Remove-Item -Recurse -Force node_modules
  npm install
  ```

- Ensure Node.js is v14+.

### "Node.js is not installed"

- Install from [https://nodejs.org/](https://nodejs.org/), restart the terminal (or reboot), then retry.

### Dependencies installation failed

- Check internet connection.
- Run manually:

  ```powershell
  cd C:\Users\vasap\Wardrobe
  npm install
  cd server && npm install
  cd ../client && npm install
  ```

### Backend not responding

- Check the minimized backend PowerShell window for errors.
- Hit http://localhost:5000/api/health — should return `{"status":"OK"}`.

### Camera not working

- Grant camera permission in the browser.
- Use HTTPS (ngrok) or localhost; some browsers block camera on plain HTTP over LAN.

### PowerShell execution policy

- Use `start.bat`, or set `RemoteSigned` policy as shown above.

---

## Quick reference

| Goal | Command / action |
|------|------------------|
| **Dev locally** | Double-click `start.bat` **or** `npm run dev` → open http://localhost:3000 |
| **Share with brother (temporary)** | `stop.bat` → `cd client && npm run build` → `npm run server` → `ngrok http 5000` → share https URL |
| **Share on same WiFi (dev)** | Start app, use `http://<your-PC-LAN-IP>:3000` on phone (same network) |
| **Admin login** | Username: `superadmin` / Password: `admin123` (change after first login) |
| **Stop everything** | Double-click `stop.bat` |
| **First-time setup** | `npm run install-all` |
| **Production local URL** | Build client, `npm run server` → http://localhost:5000 |
| **Health check** | http://localhost:5000/api/health |

---

## What runs where

```
Development (npm run dev / start.bat)
├── Frontend  →  http://localhost:3000  (React dev server)
└── Backend   →  http://localhost:5000  (Express API + uploads)

Production (after client build + npm run server)
└── Single server  →  http://localhost:5000  (API + static React build)
```

For full feature and API documentation, see **APPLICATION_GUIDE.md**.
