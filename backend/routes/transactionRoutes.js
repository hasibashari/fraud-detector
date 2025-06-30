// =========================
// Import Library & Modul
// =========================
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const prisma = require('../lib/prisma');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// =========================
// Konfigurasi Upload & Mapping CSV
// =========================
// Konfigurasi Multer untuk menyimpan file di folder 'uploads/'
const upload = multer({ dest: 'uploads/' });

// Mapping kolom CSV ke kolom database
const MAPPER_CONFIG = {
  amount: ['transactionamount', 'amount', 'jumlah', 'nilai', 'TransactionAmount'],
  timestamp: ['transactiondate', 'timestamp', 'waktu', 'TransactionDate'],
  merchant: ['merchantid', 'merchant', 'MerchantID'],
  location: ['location', 'Location'],
  user_id: ['accountid', 'user_id', 'userid', 'AccountID'],
  // tambahkan mapping lain jika perlu
};

// Fungsi untuk mapping dan membersihkan data per baris CSV
function mapAndCleanRow(rawRow) {
  const cleanRow = {};
  // Normalisasi key agar lowercase dan tanpa spasi
  const rawKeys = Object.keys(rawRow).reduce((acc, key) => {
    acc[key.toLowerCase().replace(/\s/g, '')] = rawRow[key];
    return acc;
  }, {});
  // Mapping field dari CSV ke field database
  for (const targetField in MAPPER_CONFIG) {
    for (const sourceField of MAPPER_CONFIG[targetField]) {
      if (rawKeys[sourceField]) {
        cleanRow[targetField] = rawKeys[sourceField];
        break;
      }
    }
  }
  // Bersihkan amount (hilangkan Rp, spasi, titik, ganti koma jadi titik)
  if (cleanRow.amount) {
    let amountStr = String(cleanRow.amount)
      .replace(/Rp|\s|\./g, '')
      .replace(',', '.');
    cleanRow.amount = parseFloat(amountStr);
  }
  // Bersihkan timestamp (ubah ke Date)
  if (cleanRow.timestamp) {
    cleanRow.timestamp = new Date(cleanRow.timestamp);
  }
  // merchant dan location biarkan string
  return cleanRow;
}

// =========================
// ROUTE: Upload Transaksi CSV
// =========================
/**
 * @route   POST /transactions/upload
 * @desc    Upload file CSV transaksi
 * @access  Private (butuh token)
 */
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File tidak diunggah.' });
  const filePath = req.file.path;
  try {
    // Buat batch upload baru
    const newBatch = await prisma.uploadBatch.create({
      data: {
        fileName: req.file.originalname,
        status: 'PENDING',
        userId: req.user.id, // User yang login
      },
    });
    const batchId = newBatch.id;
    const results = [];
    // Baca dan proses file CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', rawRow => {
        const cleanRow = mapAndCleanRow(rawRow);
        // Pastikan semua field wajib ada
        if (
          typeof cleanRow.amount === 'number' &&
          !isNaN(cleanRow.amount) &&
          cleanRow.timestamp &&
          cleanRow.merchant &&
          cleanRow.location
        ) {
          results.push({
            amount: cleanRow.amount,
            timestamp: cleanRow.timestamp,
            merchant: cleanRow.merchant,
            location: cleanRow.location,
            uploadBatchId: batchId,
          });
        }
      })
      .on('end', async () => {
        try {
          // Simpan transaksi ke database
          await prisma.transaction.createMany({ data: results, skipDuplicates: true });
          // Update status batch
          await prisma.uploadBatch.update({
            where: { id: batchId },
            data: { status: 'COMPLETED' },
          });
          fs.unlinkSync(filePath); // Hapus file upload
          res.status(201).json({ message: 'File berhasil diunggah.', batch: newBatch });
        } catch (error) {
          try { fs.unlinkSync(filePath); } catch {}
          res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
        }
      })
      .on('error', err => {
        try { fs.unlinkSync(filePath); } catch {}
        res.status(500).json({ message: 'Gagal membaca file.', error: err.message });
      });
  } catch (error) {
    try { fs.unlinkSync(filePath); } catch {}
    res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
  }
});

// =========================
// ROUTE: Analisis AI Batch Transaksi
// =========================
/**
 * @route   POST /api/transactions/analyze/:batchId
 * @desc    Memicu analisis AI untuk satu batch milik user yang login
 * @access  Private
 */
router.post('/analyze/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;
  try {
    // Pastikan batch milik user yang login
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });
    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }
    // 1. Ambil transaksi dari DB untuk batch ini
    const transactions = await prisma.transaction.findMany({
      where: { uploadBatchId: batchId },
    });
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Tidak ada transaksi untuk batch ID ini.' });
    }
    // 2. Kirim data ke API Flask untuk dianalisis
    console.log(`Mengirim ${transactions.length} transaksi ke model AI...`);
    const aiResponse = await axios.post('http://127.0.0.1:5000/predict', {
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        timestamp: t.timestamp,
        merchant: t.merchant,
        location: t.location,
        // user_id and hour will be generated automatically by the Flask API
      })),
    });
    const analysisResults = aiResponse.data;
    // 3. Update setiap transaksi di DB dengan hasil analisis
    for (const result of analysisResults) {
      await prisma.transaction.update({
        where: { id: result.id },
        data: {
          isAnomaly: result.isAnomaly,
          anomalyScore: result.anomalyScore,
        },
      });
    }
    res.status(200).json({
      message: 'Analisis berhasil diselesaikan.',
      batchId: batchId,
      results: analysisResults,
    });
  } catch (error) {
    console.error('Error saat analisis:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

// =========================
// ROUTE: Ambil Anomali Batch
// =========================
/**
 * @route   GET /api/transactions/anomalies/:batchId
 * @desc    Ambil semua transaksi anomali untuk satu batch milik user yang login
 * @access  Private
 */
router.get('/anomalies/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;
  try {
    // Pastikan batch milik user yang login
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });
    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }
    // Ambil total transaksi untuk batch ini
    const totalTransaksi = await prisma.transaction.count({
      where: { uploadBatchId: batchId },
    });
    // Ambil transaksi anomali
    const anomalies = await prisma.transaction.findMany({
      where: { uploadBatchId: batchId, isAnomaly: true }, // Hanya anomali
      orderBy: { anomalyScore: 'desc' }, // Urutkan dari skor tertinggi
    });
    if (anomalies.length === 0) {
      return res.status(404).json({ message: 'Tidak ada anomali yang ditemukan untuk batch ini.' });
    }
    // Kirim objek dengan anomalies dan totalTransaksi
    res.status(200).json({
      anomalies: anomalies,
      totalTransaksi: totalTransaksi,
      jumlahAnomali: anomalies.length,
    });
  } catch (error) {
    console.error('Error saat mengambil anomali:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

// =========================
// ROUTE: Ambil Semua Batch User
// =========================
/**
 * @route   GET /api/transactions/batches
 * @desc    Ambil semua batch upload yang pernah ada untuk user yang login
 * @access  Private
 */
router.get('/batches', protect, async (req, res) => {
  try {
    const batches = await prisma.uploadBatch.findMany({
      where: { userId: req.user.id }, // Filter berdasarkan user yang login
      orderBy: { createdAt: 'desc' }, // Tampilkan yang terbaru di atas
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data batch.', error: error.message });
  }
});

// =========================
// ROUTE: Hapus Batch & Transaksi
// =========================
/**
 * @route   DELETE /api/transactions/batch/:batchId
 * @desc    Menghapus satu batch beserta semua transaksinya (hanya milik user yang login)
 * @access  Private
 */
router.delete('/batch/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;
  try {
    // Pastikan batch milik user yang login
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });
    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }
    // prisma.$transaction memastikan kedua operasi ini harus berhasil (atomic)
    const [deletedTransactions, deletedBatch] = await prisma.$transaction([
      // 1. Hapus semua transaksi batch ini
      prisma.transaction.deleteMany({ where: { uploadBatchId: batchId } }),
      // 2. Hapus batch induknya
      prisma.uploadBatch.delete({ where: { id: batchId } }),
    ]);
    res.status(200).json({
      message: `Batch berhasil dihapus.`,
      deletedTransactionsCount: deletedTransactions.count,
      deletedBatchInfo: deletedBatch,
    });
  } catch (error) {
    // Tangani jika batch tidak ditemukan atau ada error lain
    if (error.code === 'P2025') {
      // Kode error Prisma untuk 'Record to delete does not exist.'
      return res.status(404).json({ message: 'Batch tidak ditemukan.' });
    }
    console.error('Error saat menghapus batch:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// =========================
// ROUTE: Ambil Semua Transaksi Batch
// =========================
/**
 * @route   GET /api/transactions/batch/:batchId
 * @desc    Ambil SEMUA transaksi (anomali dan normal) untuk satu batch
 * @access  Public
 */
router.get('/batch/:batchId', async (req, res) => {
  const { batchId } = req.params;
  try {
    const transactions = await prisma.transaction.findMany({
      where: { uploadBatchId: batchId },
      orderBy: { timestamp: 'asc' }, // atau 'desc' sesuai kebutuhan
    });
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Tidak ada transaksi ditemukan untuk batch ini.' });
    }
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error saat mengambil transaksi batch:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

// =========================
// ROUTE: Info User Login
// =========================
/**
 * @route   GET /api/transactions/me
 * @desc    Mendapatkan informasi user yang sedang login
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      message: 'User data retrieved successfully',
      user: req.user,
    });
  } catch (error) {
    console.error('Error getting user data:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

// =========================
// Export Router
// =========================
module.exports = router;
