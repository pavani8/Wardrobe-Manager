const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const {
  getUsers,
  saveUsers,
  getCategories,
  saveCategories,
  getAdminUsers,
  getPasswordResets,
  savePasswordResets
} = require('../utils/dataStore');
const { signToken } = require('../middleware/auth');
const { getPredefinedCategories } = require('../utils/configManager');
const { sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildUserResponse = (user, isAdmin = false, adminId = null) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  gender: user.gender || null,
  isAdmin,
  adminId
});

const createPredefinedCategories = (userId, gender) => {
  if (!gender || !['male', 'female', 'unisex'].includes(gender)) return 0;

  let categories = getCategories();
  if (!Array.isArray(categories)) categories = [];

  const predefined = getPredefinedCategories()[gender] || [];
  const existingNames = categories
    .filter((c) => c.userId === userId)
    .map((c) => c.name.toLowerCase());

  const baseTime = Date.now();
  const newCategories = [];

  predefined.forEach((cat, index) => {
    if (cat?.name && !existingNames.includes(cat.name.toLowerCase())) {
      newCategories.push({
        id: `${baseTime}-${index}-${Math.random().toString(36).slice(2, 11)}`,
        userId,
        name: cat.name,
        description: cat.description || '',
        gender,
        isPredefined: true,
        createdAt: new Date().toISOString()
      });
    }
  });

  if (newCategories.length > 0) {
    categories.push(...newCategories);
    saveCategories(categories);
  }
  return newCategories.length;
};

const findUserByUsername = (username) => {
  const users = getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
};

const findAdminByUsername = (username) => {
  const admins = getAdminUsers();
  return admins.find((a) => a.username.toLowerCase() === username.toLowerCase());
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const users = getUsers();

    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      gender: gender || null,
      authProvider: 'local',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const categoriesCount = createPredefinedCategories(newUser.id, gender);

    const token = signToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: false
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: buildUserResponse(newUser),
      categoriesInitialized: categoriesCount > 0
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Login with username + password
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = findAdminByUsername(username);
    if (admin) {
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = signToken({
        userId: admin.userId || admin.id,
        adminId: admin.id,
        username: admin.username,
        email: admin.email,
        isAdmin: true,
        role: admin.role
      });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: admin.userId || admin.id,
          username: admin.username,
          email: admin.email,
          isAdmin: true,
          adminId: admin.id,
          role: admin.role
        }
      });
    }

    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Please sign in with Google for this account' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admins = getAdminUsers();
    const adminLink = admins.find((a) => a.userId === user.id);
    const isAdmin = !!adminLink;

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      isAdmin,
      adminId: adminLink?.id || null,
      role: adminLink?.role || null
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        ...buildUserResponse(user, isAdmin, adminLink?.id || null),
        role: adminLink?.role || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Google Sign-In
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential required' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        error: 'Google Sign-In not configured. Set GOOGLE_CLIENT_ID in server .env'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let users = getUsers();
    let user = users.find((u) => u.email === email || u.googleId === googleId);

    if (!user) {
      let baseUsername = (name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
      let username = baseUsername;
      let counter = 1;
      while (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
        username = `${baseUsername}${counter++}`;
      }

      user = {
        id: Date.now().toString(),
        username,
        email,
        googleId,
        authProvider: 'google',
        password: null,
        gender: null,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = user.authProvider || 'google';
      saveUsers(users);
    }

    const admins = getAdminUsers();
    const adminLink = admins.find((a) => a.userId === user.id || a.email === user.email);
    const isAdmin = !!adminLink;

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      isAdmin,
      adminId: adminLink?.id || null
    });

    res.json({
      message: 'Google sign-in successful',
      token,
      user: {
        ...buildUserResponse(user, isAdmin, adminLink?.id || null),
        role: adminLink?.role || null
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// Forgot password - request OTP or email link
router.post('/forgot-password', async (req, res) => {
  try {
    const { username, method } = req.body;

    if (!username || !method) {
      return res.status(400).json({ error: 'Username and method (otp or email) are required' });
    }

    const user = findUserByUsername(username);
    if (!user) {
      return res.json({
        message: 'If the account exists, reset instructions have been sent.'
      });
    }

    if (!user.email) {
      return res.status(400).json({ error: 'No email on file for this account' });
    }

    let resets = getPasswordResets();
    resets = resets.filter((r) => r.userId !== user.id);

    if (method === 'otp') {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const hashedOtp = await bcrypt.hash(otp, 10);

      resets.push({
        id: Date.now().toString(),
        userId: user.id,
        type: 'otp',
        code: hashedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });
      savePasswordResets(resets);

      console.log(`\n========== OTP for ${user.username} ==========`);
      console.log(`OTP: ${otp} (expires in 10 minutes)`);
      console.log('=============================================\n');

      const response = {
        message: 'OTP sent. Check your email or server console in dev mode.',
        method: 'otp'
      };
      if (process.env.NODE_ENV !== 'production') {
        response.devOtp = otp;
      }
      return res.json(response);
    }

    if (method === 'email') {
      const token = crypto.randomBytes(32).toString('hex');
      resets.push({
        id: Date.now().toString(),
        userId: user.id,
        type: 'email',
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });
      savePasswordResets(resets);

      const baseUrl = process.env.CLIENT_URL || `http://localhost:3000`;
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      const emailResult = await sendPasswordResetEmail(user.email, resetLink);

      return res.json({
        message: emailResult.devMode
          ? 'Reset link generated (check server console in dev mode)'
          : 'Password reset link sent to your email',
        method: 'email',
        ...(emailResult.devMode && process.env.NODE_ENV !== 'production'
          ? { devResetLink: resetLink }
          : {})
      });
    }

    res.status(400).json({ error: 'Method must be otp or email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Reset password with OTP
router.post('/reset-password-otp', async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return res.status(400).json({ error: 'Username, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset request' });
    }

    const resets = getPasswordResets();
    const reset = resets.find(
      (r) => r.userId === user.id && r.type === 'otp' && new Date(r.expiresAt) > new Date()
    );

    if (!reset) {
      return res.status(400).json({ error: 'OTP expired or not found. Request a new one.' });
    }

    const valid = await bcrypt.compare(otp, reset.code);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    users[idx].password = await bcrypt.hash(newPassword, 10);
    saveUsers(users);

    savePasswordResets(resets.filter((r) => r.id !== reset.id));

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password with email token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const resets = getPasswordResets();
    const reset = resets.find(
      (r) => r.token === token && r.type === 'email' && new Date(r.expiresAt) > new Date()
    );

    if (!reset) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === reset.userId);
    if (idx === -1) {
      return res.status(400).json({ error: 'User not found' });
    }

    users[idx].password = await bcrypt.hash(newPassword, 10);
    saveUsers(users);
    savePasswordResets(resets.filter((r) => r.id !== reset.id));

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
