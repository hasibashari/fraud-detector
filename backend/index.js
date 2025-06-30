// =========================
// Import Library & Konfigurasi Awal
// =========================
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Memuat variabel dari .env

// =========================
// Import Route & Modul Internal
// =========================
const frontendRoutes = require('./routes/frontendRoutes');
const prisma = require('./lib/prisma');
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes');

// Passport setup untuk Google OAuth
require('./config/passport-setup');
const passport = require('passport');

// =========================
// Inisialisasi Express App
// =========================
const app = express();
const PORT = process.env.PORT || 3001;

// =========================
// Middleware Global
// =========================
app.use(cors()); // Mengizinkan request dari origin lain
app.use(bodyParser.json()); // Parsing body JSON
app.use(bodyParser.urlencoded({ extended: true })); // Parsing body URL-encoded
app.use(passport.initialize()); // Inisialisasi Passport

// =========================
// Static File Serving (Frontend)
// =========================
app.use('/css', express.static(__dirname + '/../frontend/css'));
app.use('/js', express.static(__dirname + '/../frontend/js'));
app.use('/pages', express.static(__dirname + '/../frontend/pages'));

// =========================
// Routing API & Auth
// =========================
app.use('/api/transactions', transactionRoutes); // Route transaksi
app.use('/auth', authRoutes); // Route autentikasi

// =========================
// Routing Utama (Frontend)
// =========================
// Redirect root ke halaman login
app.get('/', (req, res) => {
  res.redirect('/login');
});
app.use('/', frontendRoutes); // Route frontend lain

// =========================
// Route Testing & Koneksi
// =========================
// Route sederhana untuk testing API
app.get('/api', (req, res) => {
  res.send('Selamat datang di API Fraud Detector!');
});

// Route untuk cek koneksi Prisma ke database
app.get('/cek-prisma', async (req, res) => {
  try {
    // Query sederhana, misal cek jumlah data di tabel 'transaction'
    const count = await prisma.transaction.count();
    res.json({ status: 'OK', message: 'Prisma terhubung ke database', total: count });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Prisma gagal terhubung', error: error.message });
  }
});

// =========================
// Jalankan Server
// =========================
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
