const bcrypt = require('bcryptjs');
const { getAdminUsers, saveAdminUsers, ensureFilesExist } = require('./dataStore');

const seedDefaultAdmin = async () => {
  ensureFilesExist();
  const admins = getAdminUsers();

  if (admins.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const defaultAdmin = {
      id: 'admin-' + Date.now(),
      username: 'superadmin',
      email: 'admin@wardrobe.local',
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date().toISOString()
    };
    admins.push(defaultAdmin);
    saveAdminUsers(admins);
    console.log('Default super admin created: username=superadmin, password=admin123');
  }
};

module.exports = { seedDefaultAdmin };
