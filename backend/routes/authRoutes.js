// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport'); // Aktifkan kembali
const jwt = require('jsonwebtoken');

// Definisikan route untuk POST /auth/register
router.post('/register', authController.register);
// Definisikan route untuk POST /auth/login
router.post('/login', authController.login);
// Definisikan route untuk GET /auth/me yang dilindungi oleh middleware 'protect'
router.get('/me', protect, authController.getMe);

// Route untuk memulai autentikasi Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'], // Minta akses ke profil dan email pengguna
  })
);

// Route callback setelah user login di Google
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

module.exports = router;
