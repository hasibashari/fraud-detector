// =============================
// Import Library
// =============================
const express = require('express');
const router = express.Router();
const path = require('path');

// =============================
// Konfigurasi Path Dasar Halaman Frontend
// =============================
const basePath = path.join(__dirname, '../../frontend/pages');

// =============================
// ROUTE: Halaman Dashboard (Setelah Login)
// =============================
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(basePath, 'index.html'));
});

// =============================
// ROUTE: Halaman Login
// =============================
router.get('/login', (req, res) => {
  res.sendFile(path.join(basePath, 'login.html'));
});

// =============================
// ROUTE: Halaman Register
// =============================
router.get('/register', (req, res) => {
  res.sendFile(path.join(basePath, 'register.html'));
});

// =============================
// ROUTE: Halaman Auth Success (setelah login Google)
// =============================
router.get('/auth-success', (req, res) => {
  res.sendFile(path.join(basePath, 'auth-success.html'));
});

// =============================
// ROUTE: Halaman AI Chat
// =============================
router.get('/ai-chat', (req, res) => {
  res.sendFile(path.join(basePath, 'ai-chat.html'));
});

// =============================
// Export Router
// =============================
module.exports = router;
