# Wardrobe-Manager
# 👗 Wardrobe Manager - Personal Dress Management Application

A beautiful, modern web application to manage your wardrobe, categorize your dresses, and easily pick outfits for any occasion. Built with React and Node.js, featuring a Myntra-inspired UI.

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login system
- 📁 **Category Management** - Create, edit, and delete custom dress categories
- 📸 **Photo Upload & Capture** - Upload photos or capture directly with your camera
- 🗂️ **Dress Management** - Add, view, edit, and delete dresses with details
- 🎨 **Beautiful Modern UI** - Gradient backgrounds, smooth animations, and responsive design
- 🔍 **Search & Filter** - Filter dresses by category and search by name
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 📊 **Dashboard** - Overview of your wardrobe with statistics

## 🚀 Quick Start

### Easiest Way (Recommended)
**Just double-click `start.bat`** - That's it! The script will:
- Check for Node.js installation
- Install dependencies if needed
- Start both servers automatically
- Open http://localhost:3000 in your browser

### Alternative Methods

**Option 1: PowerShell Script**
- Right-click `start.ps1` → "Run with PowerShell"
- Or run: `.\start.ps1`

**Option 2: Command Line**
```bash
npm run dev
```

**Option 3: Manual Start**
```bash
# Install dependencies (first time only)
npm run install-all

# Start servers
npm run dev
```

### Prerequisites
- Node.js (v14 or higher) - Download from https://nodejs.org/
- npm (comes with Node.js)

### What Gets Started
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000
- Access the application at http://localhost:3000

### Stopping the Application

**Easiest:** Double-click `stop.bat`

**Or use PowerShell:**
```powershell
.\stop.ps1
```

**Or manually:**
```powershell
Get-Process -Name node | Stop-Process
```

### Alternative: Run servers separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## 📖 Usage Guide

1. **Register/Login**: Create a new account or login with existing credentials
2. **Create Categories**: Set up categories like "Casual", "Formal", "Party", "Work", etc.
3. **Add Dresses**: 
   - Click "Add Dress" button
   - Upload a photo or capture one with your camera
   - Fill in details (name, category, color, season, occasion)
   - Save your dress
4. **Browse Wardrobe**: View all your dresses in a beautiful grid layout
5. **Filter & Search**: Filter by category or search by name
6. **Manage**: Edit or delete dresses and categories as needed

## 🛠️ Tech Stack

- **Frontend**: 
  - React 18
  - React Router
  - Tailwind CSS
  - Axios
  - React Icons

- **Backend**: 
  - Node.js
  - Express
  - JWT Authentication
  - Multer (file uploads)
  - bcryptjs (password hashing)

- **Storage**: 
  - JSON files (easily upgradeable to database)
  - Local file system for images

## 📁 Project Structure

```
wardrobe-manager/
├── server/
│   ├── routes/          # API routes (auth, categories, dresses)
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Data storage utilities
│   ├── uploads/         # Uploaded images (created automatically)
│   └── data/            # JSON data files (created automatically)
├── client/
│   ├── src/
│   │   ├── components/  # Reusable components (Navbar, PrivateRoute)
│   │   ├── context/     # Auth context
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API utilities
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Categories
- `GET /api/categories` - Get all categories (requires auth)
- `POST /api/categories` - Create category (requires auth)
- `PUT /api/categories/:id` - Update category (requires auth)
- `DELETE /api/categories/:id` - Delete category (requires auth)

### Dresses
- `GET /api/dresses` - Get all dresses (optional ?categoryId=) (requires auth)
- `GET /api/dresses/:id` - Get single dress (requires auth)
- `POST /api/dresses` - Create dress with image upload (requires auth)
- `PUT /api/dresses/:id` - Update dress (requires auth)
- `DELETE /api/dresses/:id` - Delete dress (requires auth)

## 🎨 UI Features

- **Gradient Backgrounds**: Beautiful purple-to-indigo gradients
- **Smooth Animations**: Fade-in and slide-in animations
- **Card-based Layout**: Modern card design for categories and dresses
- **Modal Dialogs**: Clean modals for forms and image previews
- **Responsive Grid**: Adaptive grid layout for different screen sizes
- **Hover Effects**: Interactive hover effects on cards and buttons

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes on both frontend and backend
- File upload validation (image types only)
- File size limits (10MB max)

## 🐛 Troubleshooting

### Port already in use
- Change `PORT` in `.env` file for backend
- Change port in `client/package.json` scripts for frontend

### Camera not working
- Ensure camera permissions are granted in browser
- Use HTTPS in production for camera access
- Try a different browser if issues persist

### Images not loading
- Ensure backend server is running
- Check that `server/uploads/` directory exists
- Verify image URLs in browser console

### CORS errors
- Ensure backend CORS is configured (already set up)
- Check that frontend proxy is set correctly in `client/package.json`

## 📝 Notes

- Data is stored in JSON files in `server/data/` directory
- Images are stored in `server/uploads/` directory
- Each user has their own folder for uploaded images
- For production, consider using a database (MongoDB, PostgreSQL) instead of JSON files
- Consider using cloud storage (AWS S3, Cloudinary) for images in production

## 🚀 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Cloud image storage
- [ ] Outfit planning feature
- [ ] Calendar integration for planned outfits
- [ ] Weather-based outfit suggestions
- [ ] Social sharing features
- [ ] Mobile app version

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created with ❤️ for easy wardrobe management

---

**Enjoy managing your wardrobe! 🎉**

