// Import library yang dibutuhkan
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); // Memuat variabel dari .env
const frontendRoutes = require('./routes/frontendRoutes');

// Import Prisma Client
const prisma = require('./lib/prisma');
const transactionRoutes = require('./routes/transaction');
const authRoutes = require('./routes/authRoutes'); // Tambahkan ini

// Import Passport setup untuk Google OAuth
require('./config/passport-setup'); // Tambahkan ini
const passport = require('passport'); // Tambahkan ini

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3001;

// Gunakan middleware
app.use(cors()); // Mengizinkan request dari origin lain
app.use(bodyParser.json()); // Mem-parsing body request JSON
app.use(bodyParser.urlencoded({ extended: true })); // Mem-parsing body request URL-encoded

// Initialize Passport (untuk Google OAuth)
app.use(passport.initialize());

// Gunakan route untuk frontend
app.use('/css', express.static(__dirname + '/../frontend/css'));
app.use('/js', express.static(__dirname + '/../frontend/js'));
app.use('/pages', express.static(__dirname + '/../frontend/pages'));

// Gunakan route untuk transaksi
app.use('/api/transactions', transactionRoutes);
// Gunakan route untuk auth
app.use('/auth', authRoutes); // Tambahkan ini
// Gunakan route untuk frontend
app.use('/', frontendRoutes);

// Definisikan route sederhana untuk testing
app.get('/api', (req, res) => {
  res.send('Selamat datang di API Fraud Detector!');
});

// route untuk cek koneksi Prisma
app.get('/cek-prisma', async (req, res) => {
  try {
    // Query sederhana, misal cek jumlah data di tabel 'transaction'
    // Ganti 'transaction' dengan nama tabel yang ada di schema.prisma kamu
    const count = await prisma.transaction.count();
    res.json({ status: 'OK', message: 'Prisma terhubung ke database', total: count });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'ERROR', message: 'Prisma gagal terhubung', error: error.message });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
