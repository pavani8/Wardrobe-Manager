const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getUsers,
  saveUsers,
  getAdminUsers,
  saveAdminUsers,
  getComments,
  saveComments
} = require('../utils/dataStore');
const { getConfig, saveConfig } = require('../utils/configManager');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', (req, res) => {
  try {
    const users = getUsers();
    const comments = getComments();
    const unread = comments.filter((c) => !c.read).length;

    res.json({
      totalUsers: users.length,
      totalComments: comments.length,
      unreadComments: unread
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Users management
router.get('/users', (req, res) => {
  try {
    const users = getUsers().map(({ password, ...u }) => u);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    let users = getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return res.status(404).json({ error: 'User not found' });

    users.splice(idx, 1);
    saveUsers(users);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users/:id/promote', (req, res) => {
  try {
    const { id } = req.params;
    const user = getUsers().find((u) => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let admins = getAdminUsers();
    if (admins.find((a) => a.userId === id)) {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    admins.push({
      id: 'admin-' + Date.now(),
      userId: id,
      username: user.username,
      email: user.email,
      password: null,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    saveAdminUsers(admins);
    res.json({ message: 'User promoted to admin' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin users master table
router.get('/admin-users', (req, res) => {
  try {
    const admins = getAdminUsers().map(({ password, ...a }) => a);
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin-users', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    const admins = getAdminUsers();
    if (admins.find((a) => a.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: 'Admin username already exists' });
    }

    const newAdmin = {
      id: 'admin-' + Date.now(),
      userId: null,
      username,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || 'admin',
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);
    saveAdminUsers(admins);
    const { password: _, ...safe } = newAdmin;
    res.status(201).json(safe);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/admin-users/:id', (req, res) => {
  try {
    const { id } = req.params;
    let admins = getAdminUsers();
    if (admins.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin' });
    }
    admins = admins.filter((a) => a.id !== id);
    saveAdminUsers(admins);
    res.json({ message: 'Admin removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// App config (predefined categories, colors, seasons, occasions, tags)
router.get('/config', (req, res) => {
  try {
    res.json(getConfig());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/config', (req, res) => {
  try {
    const { categories, colors, tags, seasons, occasions } = req.body;
    const current = getConfig();

    const updated = {
      categories: categories ?? current.categories,
      colors: colors ?? current.colors,
      tags: tags ?? current.tags,
      seasons: seasons ?? current.seasons,
      occasions: occasions ?? current.occasions
    };

    saveConfig(updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Comments inbox
router.get('/comments', (req, res) => {
  try {
    const comments = getComments();
    const users = getUsers();
    const enriched = comments.map((c) => {
      const user = users.find((u) => u.id === c.userId);
      return {
        ...c,
        username: user?.username || 'Unknown'
      };
    });
    enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/comments/:id/read', (req, res) => {
  try {
    const comments = getComments();
    const idx = comments.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Comment not found' });

    comments[idx].read = true;
    comments[idx].readAt = new Date().toISOString();
    saveComments(comments);
    res.json(comments[idx]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/comments/:id', (req, res) => {
  try {
    let comments = getComments();
    comments = comments.filter((c) => c.id !== req.params.id);
    saveComments(comments);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
