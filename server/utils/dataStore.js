const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');
const categoriesFile = path.join(dataDir, 'categories.json');
const dressesFile = path.join(dataDir, 'dresses.json');
const adminUsersFile = path.join(dataDir, 'adminUsers.json');
const commentsFile = path.join(dataDir, 'comments.json');
const userTagsFile = path.join(dataDir, 'userTags.json');
const passwordResetsFile = path.join(dataDir, 'passwordResets.json');

const ensureFilesExist = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const files = [
    [usersFile, []],
    [categoriesFile, []],
    [dressesFile, []],
    [adminUsersFile, []],
    [commentsFile, []],
    [userTagsFile, []],
    [passwordResetsFile, []]
  ];
  files.forEach(([file, defaultValue]) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
    }
  });
};

const readJson = (file) => {
  ensureFilesExist();
  try {
    const data = fs.readFileSync(file, 'utf8');
    if (!data || data.trim() === '') return [];
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    fs.writeFileSync(file, JSON.stringify([], null, 2));
    return [];
  }
};

const writeJson = (file, data) => {
  ensureFilesExist();
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

const getUsers = () => readJson(usersFile);
const saveUsers = (users) => writeJson(usersFile, users);

const getCategories = () => readJson(categoriesFile);
const saveCategories = (categories) => writeJson(categoriesFile, categories);

const getDresses = () => readJson(dressesFile);
const saveDresses = (dresses) => writeJson(dressesFile, dresses);

const getAdminUsers = () => readJson(adminUsersFile);
const saveAdminUsers = (admins) => writeJson(adminUsersFile, admins);

const getComments = () => readJson(commentsFile);
const saveComments = (comments) => writeJson(commentsFile, comments);

const getUserTags = () => readJson(userTagsFile);
const saveUserTags = (tags) => writeJson(userTagsFile, tags);

const getPasswordResets = () => readJson(passwordResetsFile);
const savePasswordResets = (resets) => writeJson(passwordResetsFile, resets);

module.exports = {
  getUsers,
  saveUsers,
  getCategories,
  saveCategories,
  getDresses,
  saveDresses,
  getAdminUsers,
  saveAdminUsers,
  getComments,
  saveComments,
  getUserTags,
  saveUserTags,
  getPasswordResets,
  savePasswordResets,
  ensureFilesExist
};
