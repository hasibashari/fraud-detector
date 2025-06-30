const express = require('express');
const router = express.Router();
const path = require('path');

const basePath = path.join(__dirname, '../../frontend/pages');

// Route to serve the dashboard page
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(basePath, 'index.html'));
});

// Route
router.get('/login', (req, res) => {
  res.sendFile(path.join(basePath, 'login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(basePath, 'register.html'));
});

router.get('/auth-success', (req, res) => {
  res.sendFile(path.join(basePath, 'auth-success.html'));
});

module.exports = router;
