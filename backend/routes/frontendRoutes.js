// =========================
// Import Library
// =========================
const express = require('express');
const router = express.Router();
const path = require('path');

// =========================
// Konfigurasi Path Dasar Halaman Frontend
// =========================
const basePath = path.join(__dirname, '../../frontend/pages');

// =========================
// ROUTE: Halaman Dashboard (Setelah Login)
// =========================
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(basePath, 'index.html'));
});

// =========================
// ROUTE: Halaman Login
// =========================
router.get('/login', (req, res) => {
  res.sendFile(path.join(basePath, 'login.html'));
});

// =========================
// ROUTE: Halaman Register
// =========================
router.get('/register', (req, res) => {
  res.sendFile(path.join(basePath, 'register.html'));
});

// =========================
// ROUTE: Halaman Auth Success (setelah login Google)
// =========================
router.get('/auth-success', (req, res) => {
  res.sendFile(path.join(basePath, 'auth-success.html'));
});

// =========================
// ROUTE: Halaman AI Chat
// =========================
router.get('/ai-chat', (req, res) => {
  res.sendFile(path.join(basePath, 'ai-chat.html'));
});

// =========================
// API: Logout
// =========================
router.post('/api/logout', (req, res) => {
  // Untuk JWT-based authentication, logout berarti:
  // 1. Clear cookies di client side (dilakukan di frontend)
  // 2. Optional: Blacklist token (untuk keamanan ekstra)

  try {
    // Clear any potential cookies
    res.clearCookie('connect.sid');
    res.clearCookie('token');
    res.clearCookie('jwt');

    // Logout berhasil - pada JWT, token akan invalid saat expire
    // atau client menghapus token dari localStorage
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
});

// =========================
// Export Router
// =========================
module.exports = router;
