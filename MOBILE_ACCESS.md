# Mobile Access Guide - Single URL Setup

This guide explains how to access the Wardrobe Manager application from mobile devices using a single URL.

## Storage Management

### Current Storage Architecture

The application uses a **file-based storage system** that works perfectly for single-server deployments:

1. **User Data**: Stored in `server/data/users.json`
2. **Categories**: Stored in `server/data/categories.json`
3. **Dresses Metadata**: Stored in `server/data/dresses.json`
4. **Images**: Stored in `server/uploads/{userId}/` directories

### Why This Works for Mobile Access

- **Single Server**: All data is stored on one server
- **Network Access**: Mobile devices connect to the same server via network IP
- **Persistent Storage**: All data persists on the server filesystem
- **User Isolation**: Each user's data is separated by userId
- **Scalable**: Can handle multiple users simultaneously

### Storage Location

```
server/
├── data/              # JSON data files (users, categories, dresses)
│   ├── users.json
│   ├── categories.json
│   └── dresses.json
└── uploads/           # User uploaded images
    ├── {userId1}/
    │   └── dress-*.jpg
    └── {userId2}/
        └── dress-*.jpg
```

## Setup for Mobile Access

### Option 1: Production Build (Recommended - Single URL)

This is the **best option** for mobile access as it provides a single URL for both API and frontend.

#### Steps:

1. **Build the React application:**
   ```bash
   npm run build
   ```

2. **Start the server (serves both API and frontend):**
   ```bash
   npm start
   ```

3. **Find your network IP:**
   - The server will automatically display network IPs when it starts
   - Look for output like: `http://192.168.1.100:5000`

4. **Access from mobile:**
   - Connect your mobile device to the same WiFi network
   - Open browser and go to: `http://192.168.1.100:5000`
   - **Single URL** works for everything!

#### Advantages:
- ✅ Single URL for mobile access
- ✅ No CORS issues
- ✅ Works on any device on the same network
- ✅ Simpler configuration

### Option 2: Development Mode (Separate URLs)

For development with hot-reload:

1. **Start backend server:**
   ```bash
   npm run server
   ```

2. **Start frontend (in another terminal):**
   ```bash
   npm run client
   ```

3. **Configure mobile device:**
   - Find your computer's IP address (server will show it)
   - On mobile, you'll need to access frontend with the network IP
   - Requires proxy configuration or environment variable

## Network Configuration

### Server Configuration

The server is configured to:
- Bind to `0.0.0.0` (all network interfaces) - allows network access
- Serve React build files in production mode
- Automatically detect and display network IPs

### Firewall Settings

**Windows:**
1. Open Windows Firewall
2. Allow Node.js through firewall
3. Or allow port 5000 (or your configured port)

**Mac/Linux:**
```bash
# Allow port 5000 through firewall
sudo ufw allow 5000
```

### Network Requirements

- **Same WiFi Network**: Mobile device and server must be on the same WiFi network
- **No VPN**: VPNs may interfere with local network access
- **Router Settings**: Some routers block device-to-device communication (AP isolation)

## Storage Alternatives (Future Considerations)

### For Production/Cloud Deployment:

1. **Database Options:**
   - **MongoDB**: Document-based, easy migration from JSON
   - **PostgreSQL**: Relational database, more structured
   - **SQLite**: File-based database, easy setup

2. **Image Storage Options:**
   - **Cloud Storage**: AWS S3, Google Cloud Storage, Azure Blob
   - **CDN**: Cloudflare, AWS CloudFront
   - **Image Hosting**: Cloudinary, Imgur API

3. **Benefits of Cloud Storage:**
   - Scalable across multiple servers
   - Better performance with CDN
   - Automatic backups
   - Access from anywhere

### Migration Path:

The current JSON file system can be easily migrated to a database:
- All data is in structured JSON format
- User isolation is already implemented
- Image paths can be migrated to cloud storage

## Troubleshooting

### Mobile device can't connect:

1. **Check WiFi Connection:**
   - Ensure both devices are on the same network
   - Try pinging the server IP from mobile

2. **Check Firewall:**
   - Allow Node.js/port 5000 through firewall
   - Disable firewall temporarily to test

3. **Check IP Address:**
   - Verify the server is showing the correct IP
   - Try accessing from another device on the network

4. **Check Router Settings:**
   - Disable AP isolation if enabled
   - Check if router blocks device-to-device communication

### Images not loading on mobile:

1. **Check Image URLs:**
   - In production build, images use relative URLs
   - Ensure server is serving static files correctly

2. **Check CORS:**
   - CORS is already configured
   - Should work automatically in production build

### Storage Issues:

1. **Disk Space:**
   - Monitor `server/uploads/` directory size
   - Implement cleanup for old/deleted images

2. **File Permissions:**
   - Ensure server has write permissions to `server/data/` and `server/uploads/`
   - Check file system permissions

## Production Deployment

For true mobile access from anywhere (not just local network):

### Cloud Hosting Options:

1. **Heroku**: Easy deployment, free tier available
2. **AWS EC2**: Full control, scalable
3. **DigitalOcean**: Simple VPS, affordable
4. **Railway**: Modern platform, easy setup
5. **Render**: Simple deployment, free tier

### Steps for Cloud Deployment:

1. **Prepare for production:**
   ```bash
   npm run build
   ```

2. **Set environment variables:**
   - `PORT`: Server port (usually set by hosting platform)
   - `JWT_SECRET`: Secret key for JWT tokens
   - `NODE_ENV`: Set to `production`

3. **Deploy:**
   - Push code to Git repository
   - Connect to hosting platform
   - Deploy and access via public URL

4. **Storage considerations:**
   - Use cloud storage for images (S3, Cloudinary)
   - Use database instead of JSON files
   - Implement backups

## Security Considerations

### Current Setup (Local Network):

- ✅ User authentication (JWT tokens)
- ✅ Password hashing (bcrypt)
- ✅ User data isolation
- ⚠️ Local network only (not exposed to internet)

### For Internet Access:

- 🔒 Use HTTPS (SSL certificates)
- 🔒 Strong JWT secret
- 🔒 Rate limiting
- 🔒 Input validation
- 🔒 SQL injection protection (if using database)
- 🔒 File upload validation (already implemented)

## Summary

### Single URL Mobile Access:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access from mobile:**
   - Use the network IP shown in server output
   - Example: `http://192.168.1.100:5000`
   - Single URL works for everything!

### Storage:

- **Current**: File-based (JSON + filesystem) - Perfect for single server
- **Future**: Database + Cloud Storage - For scalability and cloud deployment

The current storage system works perfectly for mobile access as long as all devices connect to the same server. For cloud deployment, consider migrating to database and cloud storage.

