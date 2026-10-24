const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { getDresses, saveDresses, getCategories } = require('../utils/dataStore');
const {
  getPredefinedColors,
  getPredefinedTags,
  getPredefinedSeasons,
  getPredefinedOccasions
} = require('../utils/configManager');
const { getUserTags } = require('../utils/dataStore');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get predefined colors and tags (for frontend dropdowns)
router.get('/predefined/data', (req, res) => {
  try {
    const customTags = getUserTags()
      .filter((t) => t.userId === req.user.userId)
      .map((t) => t.name);

    res.json({
      colors: getPredefinedColors(),
      tags: [...new Set([...getPredefinedTags(), ...customTags])],
      seasons: getPredefinedSeasons(),
      occasions: getPredefinedOccasions()
    });
  } catch (error) {
    console.error('Error getting predefined data:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to get predefined data',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', req.user.userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dress-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for multiple file uploads (bulk upload)
const uploadMultiple = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 50 }, // 10MB per file, max 50 files
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all dresses for the user with optional filters
router.get('/', (req, res) => {
  try {
    const { categoryId, color, season, occasion, tag, search } = req.query;
    const dresses = getDresses();
    let userDresses = dresses.filter(d => d.userId === req.user.userId);

    if (categoryId) {
      userDresses = userDresses.filter(d => d.categoryId === categoryId);
    }
    if (color) {
      userDresses = userDresses.filter(d => d.color === color);
    }
    if (season) {
      userDresses = userDresses.filter(d => d.season === season);
    }
    if (occasion) {
      userDresses = userDresses.filter(d => d.occasion === occasion);
    }
    if (tag) {
      userDresses = userDresses.filter(
        d => Array.isArray(d.tags) && d.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }
    if (search) {
      const q = search.toLowerCase();
      userDresses = userDresses.filter(
        d =>
          (d.name && d.name.toLowerCase().includes(q)) ||
          (d.description && d.description.toLowerCase().includes(q))
      );
    }

    res.json(userDresses);
  } catch (error) {
    console.error('Error getting dresses:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to get dresses',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get a single dress
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const dresses = getDresses();
    const dress = dresses.find(d => d.id === id && d.userId === req.user.userId);

    if (!dress) {
      return res.status(404).json({ error: 'Dress not found' });
    }

    res.json(dress);
  } catch (error) {
    console.error('Error getting dress:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to get dress',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create a new dress (with image upload)
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { name, description, categoryId, color, season, occasion, tags } = req.body;

    // Only categoryId is mandatory
    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Verify category exists and belongs to user
    const categories = getCategories();
    const category = categories.find(
      c => c.id === categoryId && c.userId === req.user.userId
    );

    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const dresses = getDresses();
    
    // Handle image upload (optional)
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.user.userId}/${req.file.filename}`;
    }

    // Parse tags if provided (can be string, JSON string, or array)
    let parsedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(tags);
          if (Array.isArray(parsed)) {
            parsedTags = parsed;
          } else {
            // If not JSON array, treat as comma-separated string
            parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } catch (e) {
          // Not JSON, treat as comma-separated string
          parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags.filter(tag => tag);
      }
    }

    const newDress = {
      id: Date.now().toString(),
      userId: req.user.userId,
      name: name || 'Untitled Dress',
      description: description || '',
      categoryId,
      categoryName: category.name,
      imageUrl: imageUrl || '',
      color: color || '',
      season: season || '',
      occasion: occasion || '',
      tags: parsedTags,
      createdAt: new Date().toISOString()
    };

    dresses.push(newDress);
    saveDresses(dresses);

    res.status(201).json(newDress);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update a dress
router.put('/:id', upload.single('image'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, color, season, occasion, tags } = req.body;

    const dresses = getDresses();
    const dressIndex = dresses.findIndex(
      d => d.id === id && d.userId === req.user.userId
    );

    if (dressIndex === -1) {
      return res.status(404).json({ error: 'Dress not found' });
    }

    // Update fields (all optional except categoryId if provided)
    if (name !== undefined) dresses[dressIndex].name = name;
    if (description !== undefined) dresses[dressIndex].description = description;
    if (color !== undefined) dresses[dressIndex].color = color;
    if (season !== undefined) dresses[dressIndex].season = season;
    if (occasion !== undefined) dresses[dressIndex].occasion = occasion;

    // Update tags if provided
    if (tags !== undefined) {
      let parsedTags = [];
      if (tags) {
        if (typeof tags === 'string') {
          // Try to parse as JSON first
          try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) {
              parsedTags = parsed;
            } else {
              // If not JSON array, treat as comma-separated string
              parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }
          } catch (e) {
            // Not JSON, treat as comma-separated string
            parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        } else if (Array.isArray(tags)) {
          parsedTags = tags.filter(tag => tag);
        }
      }
      dresses[dressIndex].tags = parsedTags;
    }

    // Update category if provided
    if (categoryId) {
      const categories = getCategories();
      const category = categories.find(
        c => c.id === categoryId && c.userId === req.user.userId
      );

      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      dresses[dressIndex].categoryId = categoryId;
      dresses[dressIndex].categoryName = category.name;
    }

    // Update image if provided
    if (req.file) {
      // Delete old image if it exists
      if (dresses[dressIndex].imageUrl) {
        const oldImagePath = path.join(__dirname, '..', dresses[dressIndex].imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      dresses[dressIndex].imageUrl = `/uploads/${req.user.userId}/${req.file.filename}`;
    }

    saveDresses(dresses);

    res.json(dresses[dressIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Delete a dress
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const dresses = getDresses();
    const dressIndex = dresses.findIndex(
      d => d.id === id && d.userId === req.user.userId
    );

    if (dressIndex === -1) {
      return res.status(404).json({ error: 'Dress not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', dresses[dressIndex].imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    dresses.splice(dressIndex, 1);
    saveDresses(dresses);

    res.json({ message: 'Dress deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk upload dresses (multiple images under one category)
router.post('/bulk', uploadMultiple.array('images', 50), (req, res) => {
  try {
    const { categoryId, defaultColor, defaultSeason, defaultOccasion, defaultTags } = req.body;

    // Only categoryId is mandatory for bulk upload
    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    // Verify category exists and belongs to user
    const categories = getCategories();
    const category = categories.find(
      c => c.id === categoryId && c.userId === req.user.userId
    );

    if (!category) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const dresses = getDresses();
    const newDresses = [];

    // Parse tags if provided
    let parsedTags = [];
    if (defaultTags) {
      try {
        const parsed = JSON.parse(defaultTags);
        if (Array.isArray(parsed)) {
          parsedTags = parsed;
        } else if (typeof parsed === 'string') {
          parsedTags = parsed.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      } catch (e) {
        if (typeof defaultTags === 'string') {
          parsedTags = defaultTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }
    }

    // Process each uploaded file
    req.files.forEach((file, index) => {
      const imageUrl = `/uploads/${req.user.userId}/${file.filename}`;
      const baseTime = Date.now();
      
      const newDress = {
        id: `${baseTime}-${index}-${Math.random().toString(36).slice(2, 11)}`,
        userId: req.user.userId,
        name: `Dress ${index + 1}`, // Default name, user can edit later
        description: '',
        categoryId,
        categoryName: category.name,
        imageUrl,
        color: defaultColor || '',
        season: defaultSeason || '',
        occasion: defaultOccasion || '',
        tags: parsedTags,
        createdAt: new Date().toISOString()
      };

      newDresses.push(newDress);
    });

    // Add all new dresses to the database
    dresses.push(...newDresses);
    saveDresses(dresses);

    res.status(201).json({
      message: `Successfully uploaded ${newDresses.length} dresses`,
      count: newDresses.length,
      dresses: newDresses
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

module.exports = router;

