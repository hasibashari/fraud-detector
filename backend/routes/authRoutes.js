// =============================
// Import Library & Modul
// =============================
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport'); // Untuk Google OAuth
const jwt = require('jsonwebtoken'); // Untuk membuat JWT

// =============================
// Route Autentikasi Manual (Register & Login)
// =============================
// Register user baru
router.post('/register', authController.register);
// Login user
router.post('/login', authController.login);
// Mendapatkan data user yang sedang login (dilindungi token)
router.get('/me', protect, authController.getMe);

// =============================
// Route Autentikasi Google OAuth
// =============================
// Memulai proses login dengan Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'], // Minta akses ke profil dan email pengguna
  })
);

// Callback setelah autentikasi Google berhasil/gagal
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // User berhasil diautentikasi oleh Google.
    // 'req.user' sekarang berisi data user dari database kita (disediakan oleh passport)

    // Buat JWT untuk user ini
    const payload = {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect ke halaman sukses di frontend, kirim token via query param
    res.redirect(`http://localhost:3001/auth-success?token=${token}`);
  }
);

// =============================
// Export Router
// =============================
module.exports = router;
