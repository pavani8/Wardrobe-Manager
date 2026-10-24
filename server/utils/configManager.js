const fs = require('fs');
const path = require('path');
const { PREDEFINED_CATEGORIES, PREDEFINED_COLORS, PREDEFINED_TAGS } = require('./predefinedData');

const configFile = path.join(__dirname, '..', 'data', 'appConfig.json');

const DEFAULT_SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
const DEFAULT_OCCASIONS = ['Casual', 'Formal', 'Party', 'Work', 'Sport', 'Wedding', 'Other'];

const getDefaultConfig = () => ({
  categories: PREDEFINED_CATEGORIES,
  colors: [...PREDEFINED_COLORS],
  tags: [...PREDEFINED_TAGS],
  seasons: [...DEFAULT_SEASONS],
  occasions: [...DEFAULT_OCCASIONS]
});

const ensureConfig = () => {
  const dataDir = path.dirname(configFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify(getDefaultConfig(), null, 2));
  }
};

const getConfig = () => {
  ensureConfig();
  try {
    const data = fs.readFileSync(configFile, 'utf8');
    const parsed = JSON.parse(data);
    return { ...getDefaultConfig(), ...parsed };
  } catch (error) {
    console.error('Error reading app config:', error);
    const defaults = getDefaultConfig();
    fs.writeFileSync(configFile, JSON.stringify(defaults, null, 2));
    return defaults;
  }
};

const saveConfig = (config) => {
  ensureConfig();
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf8');
};

const getPredefinedCategories = () => getConfig().categories;
const getPredefinedColors = () => getConfig().colors;
const getPredefinedTags = () => getConfig().tags;
const getPredefinedSeasons = () => getConfig().seasons;
const getPredefinedOccasions = () => getConfig().occasions;

module.exports = {
  getConfig,
  saveConfig,
  getDefaultConfig,
  getPredefinedCategories,
  getPredefinedColors,
  getPredefinedTags,
  getPredefinedSeasons,
  getPredefinedOccasions
};
