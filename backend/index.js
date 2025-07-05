// =========================
// Import Library & Konfigurasi Awal
// =========================
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Memuat variabel dari .env

// =========================
// Validasi Environment Variables
// =========================
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ All required environment variables are present.');

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
app.use(express.json()); // Built-in JSON parsing (Express 5+)
app.use(express.urlencoded({ extended: true })); // Built-in URL-encoded parsing
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
// API: Logout
// =========================
app.post('/api/logout', (req, res) => {
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
// Routing Utama (Frontend)
// =========================
// Redirect root ke halaman yang sesuai
app.get('/', (req, res) => {
  // Untuk root path, langsung redirect ke dashboard
  // Auth verification akan dilakukan di frontend
  res.redirect('/dashboard');
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
    res
      .status(500)
      .json({ status: 'ERROR', message: 'Prisma gagal terhubung', error: error.message });
  }
});

// =========================
// Jalankan Server
// =========================
const server = app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📊 Dashboard tersedia di http://localhost:${PORT}/dashboard`);
  console.log(`🔐 Login di http://localhost:${PORT}/login`);
});

// =========================
// Graceful Shutdown Handling
// =========================
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed.');

    // Close Prisma connection
    prisma
      .$disconnect()
      .then(() => {
        console.log('✅ Database connection closed.');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Error closing database connection:', err);
        process.exit(1);
      });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}
