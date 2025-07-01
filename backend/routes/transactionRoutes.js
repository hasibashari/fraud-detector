// =====================================================
// TRANSACTION ROUTES - Fraud Detection System
//
// This module handles all transaction-related operations including:
//
// 📁 FILE OPERATIONS:
// - CSV file upload and processing with field mapping
// - File validation and error handling
//
// 🤖 AI ANALYSIS:
// - Trigger ML model analysis via Flask API
// - Generate AI explanations using Google Gemini
// - Interactive AI chat about fraud patterns
// - Deep analysis reports with recommendations
//
// 📊 DATA MANAGEMENT:
// - Batch creation and management
// - Anomaly detection results retrieval
// - Transaction data querying with security controls
//
// 📤 EXPORT FEATURES:
// - CSV download of analysis results
// - Filtered data export capabilities
//
// 🔐 SECURITY:
// - User authentication required for all operations
// - Batch ownership verification
// - Input validation and sanitization
//
// Dependencies: Prisma ORM, Multer, CSV-Parser, Axios, Google Gemini AI
// =====================================================

// =====================================================
// SECTION: Import Dependencies
// =====================================================
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const prisma = require('../lib/prisma');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// =====================================================
// SECTION: AI Configuration (Global Gemini Setup)
// =====================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Gemini model instance - centralized for consistency
 * @returns {Object} Gemini model instance
 */
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// =====================================================
// SECTION: CSV Processing Configuration
// =====================================================

/**
 * Multer configuration for file uploads
 * Files are temporarily stored in 'uploads/' directory
 */
const upload = multer({ dest: 'uploads/' });

/**
 * CSV column mapping configuration
 * Maps various CSV column names to standardized database fields
 * Supports multiple naming conventions for flexibility
 */
const MAPPER_CONFIG = {
  amount: ['transactionamount', 'amount', 'jumlah', 'nilai', 'TransactionAmount'],
  timestamp: ['transactiondate', 'timestamp', 'waktu', 'TransactionDate'],
  merchant: ['merchantid', 'merchant', 'MerchantID'],
  location: ['location', 'Location'],
  user_id: ['accountid', 'user_id', 'userid', 'AccountID'],
};

// =====================================================
// SECTION: Utility Functions
// =====================================================

/**
 * Maps and cleans a single CSV row to database fields
 * @param {Object} rawRow - Raw CSV row data
 * @returns {Object} Cleaned and mapped row data
 */
function mapAndCleanRow(rawRow) {
  const cleanRow = {};

  // Normalize keys to lowercase without spaces
  const rawKeys = Object.keys(rawRow).reduce((acc, key) => {
    acc[key.toLowerCase().replace(/\s/g, '')] = rawRow[key];
    return acc;
  }, {});

  // Map CSV fields to database fields using configuration
  for (const targetField in MAPPER_CONFIG) {
    for (const sourceField of MAPPER_CONFIG[targetField]) {
      if (rawKeys[sourceField]) {
        cleanRow[targetField] = rawKeys[sourceField];
        break;
      }
    }
  }

  // Clean amount field (remove currency symbols, spaces, dots; replace comma with dot)
  if (cleanRow.amount) {
    let amountStr = String(cleanRow.amount)
      .replace(/Rp|\s|\./g, '')
      .replace(',', '.');
    cleanRow.amount = parseFloat(amountStr);
  }

  // Clean timestamp field (convert to Date object)
  if (cleanRow.timestamp) {
    cleanRow.timestamp = new Date(cleanRow.timestamp);
  }

  return cleanRow;
}

/**
 * Generates AI explanation for anomalous transactions using Gemini
 * @param {Object} transaction - Transaction data with anomaly information
 * @returns {Promise<string>} AI-generated explanation in Indonesian
 */
async function getGeminiExplanation(transaction) {
  try {
    const model = getGeminiModel();

    const prompt = `
Peran: Anda adalah analis risiko keuangan senior di sebuah bank di Indonesia.
Tugas: Analis junior saya (sebuah model machine learning) telah menandai sebuah transaksi sebagai anomali. Lihat data mentahnya dan tulis ringkasan analisis dalam SATU KALIMAT singkat dan jelas dalam Bahasa Indonesia untuk menjelaskan mengapa transaksi ini patut dicurigai.
Batasan: Hanya berikan satu kalimat penjelasan tersebut. Jangan ada kalimat pembuka atau penutup.

Data Transaksi yang Mencurigakan:
- Jumlah Transaksi: Rp ${new Intl.NumberFormat('id-ID').format(transaction.amount)}
- Waktu Transaksi: ${new Date(transaction.timestamp).toLocaleString('id-ID')}
- Merchant: ${transaction.merchant}
- Lokasi: ${transaction.location}
- Skor Anomali: ${transaction.anomalyScore?.toFixed(3) || 'N/A'}

Analisis berdasarkan pattern umum fraud detection:
- Nilai transaksi yang tidak biasa
- Waktu transaksi yang mencurigakan
- Merchant atau lokasi yang berisiko
- Kombinasi faktor-faktor di atas
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Gagal mendapatkan analisis dari AI.';
  }
}

// =====================================================
// SECTION: File Upload & Processing Routes
// =====================================================

/**
 * @route   POST /api/transactions/upload
 * @desc    Upload and process CSV transaction file
 * @access  Private (requires authentication)
 * @param   {file} file - CSV file containing transaction data
 * @returns {Object} Upload batch information
 */
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File tidak diunggah.' });

  // Validasi format file
  const allowedExtensions = ['.csv'];
  const fileExtension = req.file.originalname
    .toLowerCase()
    .substring(req.file.originalname.lastIndexOf('.'));

  if (!allowedExtensions.includes(fileExtension)) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting invalid file:', unlinkError);
    }
    return res
      .status(400)
      .json({ message: 'Format file tidak didukung. Hanya file CSV yang diizinkan.' });
  }

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
          console.error('Error processing CSV file:', error);
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }

          // Update batch status to FAILED
          try {
            await prisma.uploadBatch.update({
              where: { id: batchId },
              data: { status: 'FAILED' },
            });
          } catch (updateError) {
            console.error('Error updating batch status:', updateError);
          }

          res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
        }
      })
      .on('error', async err => {
        console.error('Error reading CSV file:', err);
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }

        // Update batch status to FAILED
        try {
          await prisma.uploadBatch.update({
            where: { id: batchId },
            data: { status: 'FAILED' },
          });
        } catch (updateError) {
          console.error('Error updating batch status:', updateError);
        }

        res.status(500).json({ message: 'Gagal membaca file.', error: err.message });
      });
  } catch (error) {
    console.error('Error creating upload batch:', error);
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
    }
    res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
  }
});

// =====================================================
// SECTION: AI Analysis Routes
// =====================================================

/**
 * @route   POST /api/transactions/analyze/:batchId
 * @desc    Trigger AI analysis for a specific batch
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch to analyze
 * @returns {Object} Analysis results with anomaly scores
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
    console.error('Error during analysis:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

// =====================================================
// SECTION: Data Retrieval Routes
// =====================================================

/**
 * @route   GET /api/transactions/anomalies/:batchId
 * @desc    Get all anomalous transactions for a specific batch
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch
 * @returns {Object} List of anomalies with statistics
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
    console.error('Error retrieving anomalies:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

/**
 * @route   GET /api/transactions/batches
 * @desc    Get all upload batches for the authenticated user
 * @access  Private (requires authentication)
 * @returns {Array} List of batches with transaction counts and anomaly statistics
 */
router.get('/batches', protect, async (req, res) => {
  try {
    const batches = await prisma.uploadBatch.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        _count: {
          select: { transactions: true },
        },
      },
    });

    // Ambil jumlah anomali untuk setiap batch
    const batchIds = batches.map(b => b.id);
    const anomalyCounts = await prisma.transaction.groupBy({
      by: ['uploadBatchId'],
      where: { uploadBatchId: { in: batchIds }, isAnomaly: true },
      _count: { id: true },
    });
    // Mapping batchId ke jumlah anomali
    const anomalyMap = {};
    anomalyCounts.forEach(a => {
      anomalyMap[a.uploadBatchId] = a._count.id;
    });
    // Tambahkan field anomalies ke setiap batch
    const batchesWithAnomalies = batches.map(b => ({
      ...b,
      anomalies: anomalyMap[b.id] || 0,
    }));

    res.status(200).json(batchesWithAnomalies);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data batch.', error: error.message });
  }
});

// =====================================================
// SECTION: Batch Management Routes
// =====================================================

/**
 * @route   DELETE /api/transactions/batch/:batchId
 * @desc    Delete a batch and all its transactions
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch to delete
 * @returns {Object} Deletion confirmation with statistics
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
    console.error('Error deleting batch:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
});

/**
 * @route   GET /api/transactions/batch/:batchId
 * @desc    Get all transactions (both normal and anomalous) for a batch
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch
 * @returns {Array} List of all transactions in the batch
 */
router.get('/batch/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;
  try {
    // Verify batch ownership before returning transactions
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { uploadBatchId: batchId },
      orderBy: { timestamp: 'asc' },
    });

    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Tidak ada transaksi ditemukan untuk batch ini.' });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error retrieving batch transactions:', error.message);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
  }
});

// =====================================================
// SECTION: User Information Routes
// =====================================================

/**
 * @route   GET /api/transactions/me
 * @desc    Get current authenticated user information
 * @access  Private (requires authentication)
 * @returns {Object} Current user data
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

// =====================================================
// SECTION: AI-Powered Interactive Features
// =====================================================

/**
 * @route   POST /api/transactions/chat/:batchId
 * @desc    Interactive AI chat about analyzed batch data
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch to discuss
 * @param   {string} question - User's question about the data
 * @returns {Object} AI response with context and insights
 */
router.post('/chat/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;
  const { question } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ message: 'Pertanyaan tidak boleh kosong.' });
  }

  try {
    // Pastikan batch milik user yang login
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }

    // Ambil statistik batch
    const [totalTransactions, anomalies, normalTransactions] = await Promise.all([
      prisma.transaction.count({ where: { uploadBatchId: batchId } }),
      prisma.transaction.findMany({
        where: { uploadBatchId: batchId, isAnomaly: true },
        orderBy: { anomalyScore: 'desc' },
        take: 10, // Ambil 10 anomali teratas
      }),
      prisma.transaction.findMany({
        where: { uploadBatchId: batchId, isAnomaly: false },
        take: 5, // Ambil 5 transaksi normal sebagai konteks
      }),
    ]);

    // Hitung statistik
    const anomalyCount = anomalies.length;
    const anomalyPercentage =
      totalTransactions > 0 ? ((anomalyCount / totalTransactions) * 100).toFixed(2) : 0;

    // Hitung rata-rata amount untuk anomali dan normal
    const avgAnomalyAmount =
      anomalies.length > 0 ? anomalies.reduce((sum, t) => sum + t.amount, 0) / anomalies.length : 0;

    const avgNormalAmount =
      normalTransactions.length > 0
        ? normalTransactions.reduce((sum, t) => sum + t.amount, 0) / normalTransactions.length
        : 0;

    // Buat konteks data untuk AI
    const dataContext = `
KONTEKS DATA ANALISIS FRAUD DETECTION:
Nama File: ${batch.fileName}
Total Transaksi: ${totalTransactions}
Jumlah Anomali: ${anomalyCount} (${anomalyPercentage}%)
Jumlah Normal: ${totalTransactions - anomalyCount}

STATISTIK KEUANGAN:
- Rata-rata Nilai Anomali: Rp ${new Intl.NumberFormat('id-ID').format(avgAnomalyAmount)}
- Rata-rata Nilai Normal: Rp ${new Intl.NumberFormat('id-ID').format(avgNormalAmount)}

CONTOH ANOMALI TERDETEKSI (Top 5):
${anomalies
  .slice(0, 5)
  .map(
    (t, i) =>
      `${i + 1}. Rp ${new Intl.NumberFormat('id-ID').format(t.amount)} - ${t.merchant} di ${
        t.location
      } (Skor: ${t.anomalyScore?.toFixed(3) || 'N/A'})`
  )
  .join('\n')}

MERCHANT YANG SERING MUNCUL DALAM ANOMALI:
${[...new Set(anomalies.map(t => t.merchant))].slice(0, 5).join(', ')}

LOKASI YANG SERING MUNCUL DALAM ANOMALI:
${[...new Set(anomalies.map(t => t.location))].slice(0, 5).join(', ')}
    `;

    const model = getGeminiModel();

    const prompt = `
Peran: Anda adalah AI Risk Analyst senior di bank yang ahli dalam fraud detection dan analisis data keuangan.

KONTEKS DATA:
${dataContext}

INSTRUKSI:
1. Jawab pertanyaan user dengan data yang tersedia di atas
2. Berikan insight mendalam dan analisis yang actionable
3. Gunakan bahasa Indonesia yang profesional
4. Sertakan angka dan statistik yang relevan
5. Berikan rekomendasi praktis jika diminta
6. Jika pertanyaan di luar konteks data, arahkan kembali ke analisis fraud detection

PERTANYAAN USER: ${question}

JAWABAN (maksimal 500 kata):`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiAnswer = response.text().trim();

    res.status(200).json({
      question: question,
      answer: aiAnswer,
      batchInfo: {
        fileName: batch.fileName,
        totalTransactions,
        anomalyCount,
        anomalyPercentage: `${anomalyPercentage}%`,
      },
    });
  } catch (error) {
    console.error('Error in AI chat:', error.message);
    res.status(500).json({
      message: 'Gagal berkomunikasi dengan AI analyst.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/transactions/deep-analysis/:batchId
 * @desc    Generate comprehensive automated analysis of fraud patterns
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch to analyze deeply
 * @returns {Object} Detailed analysis report with patterns and recommendations
 */
router.post('/deep-analysis/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;

  try {
    // Pastikan batch milik user yang login
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });

    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }

    // Ambil semua data untuk analisis mendalam
    const [allTransactions, anomalies] = await Promise.all([
      prisma.transaction.findMany({ where: { uploadBatchId: batchId } }),
      prisma.transaction.findMany({
        where: { uploadBatchId: batchId, isAnomaly: true },
        orderBy: { anomalyScore: 'desc' },
      }),
    ]);

    console.log(`Deep Analysis Debug - Batch ${batchId}:`);
    console.log(`- Total transactions: ${allTransactions.length}`);
    console.log(`- Anomalies found: ${anomalies.length}`);
    console.log(
      `- Sample transaction:`,
      allTransactions[0]
        ? {
            id: allTransactions[0].id,
            isAnomaly: allTransactions[0].isAnomaly,
            anomalyScore: allTransactions[0].anomalyScore,
          }
        : 'No transactions'
    );

    if (allTransactions.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data transaksi untuk dianalisis.' });
    }

    // Jika tidak ada anomali yang terdeteksi, beri notifikasi
    if (anomalies.length === 0) {
      const noAnomalyAnalysis = `
ANALISIS MENDALAM FRAUD DETECTION - ${batch.fileName}

## STATUS: BATCH BELUM DIANALISIS ATAU TIDAK ADA ANOMALI

OVERVIEW:
- Total Transaksi: ${allTransactions.length}
- Anomali Terdeteksi: 0 (0.00%)
- Status: Batch ini mungkin belum dianalisis dengan AI model

NEXT STEPS:
1. Jalankan analisis AI terlebih dahulu pada batch ini
2. Setelah analisis AI selesai, coba lagi deep analysis
3. Jika sudah dianalisis dan tidak ada anomali, berarti data bersih

SAMPLE DATA:
${allTransactions
  .slice(0, 3)
  .map(
    (t, i) =>
      `${i + 1}. Rp ${new Intl.NumberFormat('id-ID').format(t.amount)} | ${t.merchant} | ${
        t.location
      }`
  )
  .join('\n')}
      `;

      return res.status(200).json({
        batchInfo: {
          fileName: batch.fileName,
          totalTransactions: allTransactions.length,
          anomalyCount: 0,
          riskLevel: 'BELUM DIANALISIS',
        },
        patterns: {
          timePattern: {},
          merchantPattern: {},
          locationPattern: {},
          amountRanges: {},
        },
        analysis: noAnomalyAnalysis,
        needsAnalysis: true,
      });
    }

    // Analisis pattern waktu
    const timePattern = anomalies.reduce((acc, t) => {
      const hour = new Date(t.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Analisis merchant dan lokasi
    const merchantPattern = anomalies.reduce((acc, t) => {
      acc[t.merchant] = (acc[t.merchant] || 0) + 1;
      return acc;
    }, {});

    const locationPattern = anomalies.reduce((acc, t) => {
      acc[t.location] = (acc[t.location] || 0) + 1;
      return acc;
    }, {});

    // Analisis amount ranges
    const amountRanges = {
      'Under 100K': anomalies.filter(t => t.amount < 100000).length,
      '100K-500K': anomalies.filter(t => t.amount >= 100000 && t.amount < 500000).length,
      '500K-1M': anomalies.filter(t => t.amount >= 500000 && t.amount < 1000000).length,
      'Over 1M': anomalies.filter(t => t.amount >= 1000000).length,
    };

    const analysisData = `
ANALISIS MENDALAM FRAUD DETECTION - ${batch.fileName}

OVERVIEW:
- Total Transaksi: ${allTransactions.length}
- Anomali Terdeteksi: ${anomalies.length} (${(
      (anomalies.length / allTransactions.length) *
      100
    ).toFixed(2)}%)
- Tingkat Risiko: ${
      anomalies.length / allTransactions.length > 0.1
        ? 'TINGGI'
        : anomalies.length / allTransactions.length > 0.05
        ? 'SEDANG'
        : 'RENDAH'
    }

PATTERN WAKTU ANOMALI (per jam):
${Object.entries(timePattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([hour, count]) => `Jam ${hour}:00 - ${count} anomali`)
  .join('\n')}

TOP MERCHANT BERISIKO:
${Object.entries(merchantPattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([merchant, count]) => `${merchant}: ${count} anomali`)
  .join('\n')}

TOP LOKASI BERISIKO:
${Object.entries(locationPattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([location, count]) => `${location}: ${count} anomali`)
  .join('\n')}

DISTRIBUSI AMOUNT ANOMALI:
${Object.entries(amountRanges)
  .map(([range, count]) => `${range}: ${count} transaksi`)
  .join('\n')}

TOP 5 ANOMALI HIGHEST RISK:
${anomalies
  .slice(0, 5)
  .map(
    (t, i) =>
      `${i + 1}. Rp ${new Intl.NumberFormat('id-ID').format(t.amount)} | ${t.merchant} | ${
        t.location
      } | Score: ${t.anomalyScore?.toFixed(3)}`
  )
  .join('\n')}
    `;

    const model = getGeminiModel();

    const prompt = `
Peran: Anda adalah Senior Risk Analyst yang mengkhususkan diri dalam fraud detection dan financial crime investigation.

TUGAS: Berikan analisis mendalam dan rekomendasi aksi berdasarkan data berikut:

${analysisData}

BERIKAN ANALISIS DALAM FORMAT BERIKUT:

## EXECUTIVE SUMMARY
[Ringkasan kondisi risiko dalam 2-3 kalimat]

## KEY FINDINGS
[3-5 temuan utama yang paling penting]

## RISK ASSESSMENT
[Evaluasi tingkat risiko dan dampak potensial]

## PATTERN ANALYSIS
[Analisis pattern fraud yang terdeteksi]

## IMMEDIATE ACTIONS
[Rekomendasi tindakan segera yang harus diambil]

## MONITORING RECOMMENDATIONS
[Saran monitoring lanjutan]

Gunakan bahasa Indonesia profesional dan berikan insight yang actionable untuk risk management team.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const deepAnalysis = response.text().trim();

    res.status(200).json({
      batchInfo: {
        fileName: batch.fileName,
        totalTransactions: allTransactions.length,
        anomalyCount: anomalies.length,
        riskLevel:
          anomalies.length / allTransactions.length > 0.1
            ? 'TINGGI'
            : anomalies.length / allTransactions.length > 0.05
            ? 'SEDANG'
            : 'RENDAH',
      },
      patterns: {
        timePattern,
        merchantPattern,
        locationPattern,
        amountRanges,
      },
      analysis: deepAnalysis,
    });
  } catch (error) {
    console.error('Error in deep analysis:', error.message);
    res.status(500).json({
      message: 'Gagal melakukan analisis mendalam.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/transactions/explain/:transactionId
 * @desc    Get AI explanation for a specific anomalous transaction
 * @access  Private (requires authentication)
 * @param   {string} transactionId - ID of the transaction to explain
 * @returns {Object} Transaction details with AI-generated explanation
 */
router.post('/explain/:transactionId', protect, async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Ambil transaksi yang diminta
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        uploadBatch: { userId: req.user.id }, // Pastikan milik user yang login
      },
      include: {
        uploadBatch: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaksi tidak ditemukan atau tidak memiliki akses.',
      });
    }

    if (!transaction.isAnomaly) {
      return res.status(400).json({
        message: 'Transaksi ini bukan anomali, tidak memerlukan penjelasan.',
      });
    }

    // Update transaction dengan penjelasan Gemini jika belum ada
    let explanation = transaction.geminiExplanation;

    if (!explanation) {
      // Generate penjelasan baru
      explanation = await getGeminiExplanation(transaction);

      // Simpan ke database
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { geminiExplanation: explanation },
      });
    }

    res.status(200).json({
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        merchant: transaction.merchant,
        location: transaction.location,
        anomalyScore: transaction.anomalyScore,
        isAnomaly: transaction.isAnomaly,
      },
      explanation: explanation,
      batchInfo: {
        fileName: transaction.uploadBatch.fileName,
        createdAt: transaction.uploadBatch.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting explanation:', error.message);
    res.status(500).json({
      message: 'Gagal mendapatkan penjelasan AI.',
      error: error.message,
    });
  }
});

// =====================================================
// SECTION: Export & Download Routes
// =====================================================

/**
 * @route   GET /api/transactions/download/:batchId
 * @desc    Download batch results in CSV format
 * @access  Private (requires authentication)
 * @param   {string} batchId - ID of the batch to download
 * @returns {file} CSV file with transaction data and analysis results
 */
router.get('/download/:batchId', protect, async (req, res) => {
  const { batchId } = req.params;
  try {
    // Pastikan batch milik user yang login
    const batch = await prisma.uploadBatch.findFirst({
      where: { id: batchId, userId: req.user.id },
    });
    if (!batch) {
      return res.status(404).json({ message: 'Batch tidak ditemukan atau tidak memiliki akses.' });
    }
    // Ambil semua transaksi batch
    const transactions = await prisma.transaction.findMany({
      where: { uploadBatchId: batchId },
      orderBy: { timestamp: 'asc' },
    });
    if (!transactions.length) {
      return res.status(404).json({ message: 'Tidak ada transaksi untuk batch ini.' });
    }
    // Buat CSV header
    const header = 'ID,Amount,Timestamp,Merchant,Location,IsAnomaly,AnomalyScore\n';
    // Buat isi CSV
    const rows = transactions.map(t =>
      [
        t.id,
        t.amount,
        t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp,
        `"${t.merchant}"`,
        `"${t.location}"`,
        t.isAnomaly ? 'Yes' : 'No',
        t.anomalyScore ?? '',
      ].join(',')
    );
    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fraud_results_${batchId}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error downloading batch:', error.message);
    res.status(500).json({ message: 'Gagal mengunduh hasil batch.', error: error.message });
  }
});

// =====================================================
// SECTION: Module Export
// =====================================================
module.exports = router;
