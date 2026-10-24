const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUserTags, saveUserTags } = require('../utils/dataStore');
const {
  getPredefinedTags,
  getPredefinedColors,
  getPredefinedSeasons,
  getPredefinedOccasions
} = require('../utils/configManager');

const router = express.Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const allTags = getUserTags();
    const userTags = allTags.filter((t) => t.userId === req.user.userId);
    const globalTags = getPredefinedTags();

    res.json({
      predefined: globalTags,
      custom: userTags.map((t) => t.name),
      all: [...new Set([...globalTags, ...userTags.map((t) => t.name)])]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    const tagName = name.trim();
    const globalTags = getPredefinedTags();
    if (globalTags.some((t) => t.toLowerCase() === tagName.toLowerCase())) {
      return res.status(400).json({ error: 'Tag already exists in predefined tags' });
    }

    const allTags = getUserTags();
    const exists = allTags.find(
      (t) => t.userId === req.user.userId && t.name.toLowerCase() === tagName.toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    const newTag = {
      id: Date.now().toString(),
      userId: req.user.userId,
      name: tagName,
      createdAt: new Date().toISOString()
    };

    allTags.push(newTag);
    saveUserTags(allTags);

    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    let allTags = getUserTags();
    const idx = allTags.findIndex(
      (t) => t.id === req.params.id && t.userId === req.user.userId
    );
    if (idx === -1) return res.status(404).json({ error: 'Tag not found' });

    allTags.splice(idx, 1);
    saveUserTags(allTags);
    res.json({ message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/filter-options', (req, res) => {
  try {
    const allTags = getUserTags();
    const userCustom = allTags
      .filter((t) => t.userId === req.user.userId)
      .map((t) => t.name);

    res.json({
      colors: getPredefinedColors(),
      seasons: getPredefinedSeasons(),
      occasions: getPredefinedOccasions(),
      tags: [...new Set([...getPredefinedTags(), ...userCustom])]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
