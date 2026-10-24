const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getCategories, saveCategories, getDresses } = require('../utils/dataStore');
const { getPredefinedCategories } = require('../utils/configManager');

const router = express.Router();

// Get predefined categories (public endpoint for selection)
router.get('/predefined', (req, res) => {
  try {
    res.json(getPredefinedCategories());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize user categories from predefined categories (requires auth)
router.post('/initialize', authenticateToken, (req, res) => {
  try {
    const { gender } = req.body; // 'male', 'female', or 'unisex'
    
    if (!gender || !['male', 'female', 'unisex'].includes(gender)) {
      return res.status(400).json({ error: 'Valid gender is required (male, female, or unisex)' });
    }

    // Validate user ID
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Invalid user authentication' });
    }

    let categories = getCategories();
    
    // Ensure categories is an array
    if (!Array.isArray(categories)) {
      console.warn('Categories file was not an array, resetting...');
      categories = [];
    }

    const userCategories = categories.filter(c => c && c.userId === req.user.userId);
    
    // Get predefined categories for the selected gender
    const predefined = getPredefinedCategories()[gender] || [];
    
    if (!predefined || predefined.length === 0) {
      return res.status(400).json({ error: `No predefined categories found for gender: ${gender}` });
    }
    
    // Check which categories already exist
    const existingNames = userCategories.map(c => c && c.name ? c.name.toLowerCase() : '').filter(n => n);
    const newCategories = [];
    
    const baseTime = Date.now();
    predefined.forEach((cat, index) => {
      if (cat && cat.name && !existingNames.includes(cat.name.toLowerCase())) {
        // Generate unique ID for each category
        const uniqueId = `${baseTime}-${index}-${Math.random().toString(36).slice(2, 11)}`;
        newCategories.push({
          id: uniqueId,
          userId: req.user.userId,
          name: cat.name,
          description: cat.description || '',
          gender: gender,
          isPredefined: true,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    if (newCategories.length > 0) {
      categories.push(...newCategories);
      saveCategories(categories);
    }
    
    res.json({
      message: `Initialized ${newCategories.length} categories for ${gender}`,
      categories: newCategories,
      total: newCategories.length
    });
  } catch (error) {
    console.error('Error initializing categories:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to initialize categories',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// Get all categories for the user with dress counts
router.get('/', (req, res) => {
  try {
    const categories = getCategories();
    const dresses = getDresses();
    const userCategories = categories
      .filter(c => c.userId === req.user.userId)
      .map(cat => ({
        ...cat,
        dressCount: dresses.filter(
          d => d.userId === req.user.userId && d.categoryId === cat.id
        ).length
      }));
    res.json(userCategories);
  } catch (error) {
    console.error('Error getting categories:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to get categories',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Create a new category
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categories = getCategories();
    
    // Check if category already exists for this user
    const existingCategory = categories.find(
      c => c.userId === req.user.userId && c.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const newCategory = {
      id: Date.now().toString(),
      userId: req.user.userId,
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    saveCategories(categories);

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to create category',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update a category
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const categories = getCategories();
    const categoryIndex = categories.findIndex(
      c => c.id === id && c.userId === req.user.userId
    );

    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name) categories[categoryIndex].name = name;
    if (description !== undefined) categories[categoryIndex].description = description;

    saveCategories(categories);

    res.json(categories[categoryIndex]);
  } catch (error) {
    console.error('Error updating category:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to update category',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete a category
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const categories = getCategories();
    const categoryIndex = categories.findIndex(
      c => c.id === id && c.userId === req.user.userId
    );

    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    categories.splice(categoryIndex, 1);
    saveCategories(categories);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to delete category',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

