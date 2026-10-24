const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const dressRoutes = require('./routes/dresses');
const adminRoutes = require('./routes/admin');
const commentRoutes = require('./routes/comments');
const tagRoutes = require('./routes/tags');
const { seedDefaultAdmin } = require('./utils/seedAdmin');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

seedDefaultAdmin();

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dresses', dressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/tags', tagRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
}

function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ interface: name, address: iface.address });
      }
    }
  }
  return addresses;
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

app.listen(PORT, HOST, () => {
  console.log(`\n========================================`);
  console.log(`   WARDROBE MANAGER SERVER`);
  console.log(`========================================`);
  console.log(`Server is running on port ${PORT}`);
  console.log(`\nAccess the application at:`);
  console.log(`  Local:   http://localhost:${PORT}`);

  const networkIPs = getNetworkIPs();
  if (networkIPs.length > 0) {
    console.log(`\nNetwork Access (for mobile devices):`);
    networkIPs.forEach(ip => {
      console.log(`  http://${ip.address}:${PORT}`);
    });
    console.log(`\nOn mobile: connect to same WiFi and use network URL above`);
  }
  console.log(`========================================\n`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  }
  process.exit(1);
});
