# Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Installation Steps

1. **Install backend dependencies:**
```bash
npm install
```

2. **Install frontend dependencies:**
```bash
cd client
npm install
cd ..
```

Or install all at once:
```bash
npm run install-all
```

3. **Create environment file (optional):**
Create a `.env` file in the root directory:
```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

4. **Start the development servers:**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

## Alternative: Run servers separately

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

## First Time Usage

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Create categories for your dresses (e.g., "Casual", "Formal", "Party")
4. Add dresses by uploading photos or capturing them with your camera
5. Browse and manage your wardrobe!

## Features

- ✅ User authentication (Register/Login)
- ✅ Category management
- ✅ Photo upload and camera capture
- ✅ Dress management with details
- ✅ Filter and search dresses
- ✅ Beautiful modern UI
- ✅ Responsive design

## Troubleshooting

### Port already in use
If port 5000 or 3000 is already in use, you can:
- Change PORT in `.env` file for backend
- Change port in `client/package.json` scripts for frontend

### Camera not working
- Ensure you've granted camera permissions in your browser
- Use HTTPS in production for camera access
- Try a different browser if issues persist

### Images not loading
- Ensure the backend server is running
- Check that the uploads directory exists in `server/uploads/`
- Verify the image URL in the browser console








