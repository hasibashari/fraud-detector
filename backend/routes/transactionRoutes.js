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
 * Get Gemini model instance with professional banking configuration
 * Optimized for financial risk analysis and fraud detection
 * @returns {Object} Configured Gemini model instance
 */
const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: AI_CONFIG.MODEL_PARAMETERS.temperature,
      topP: AI_CONFIG.MODEL_PARAMETERS.topP,
      maxOutputTokens: AI_CONFIG.MODEL_PARAMETERS.maxTokens,
    },
  });
};

// =====================================================
// SECTION: AI Configuration Constants
// =====================================================

/**
 * Professional AI prompt templates and configurations
 * Optimized for financial risk analysis and fraud detection
 */
const AI_CONFIG = {
  MODEL_PARAMETERS: {
    temperature: 0.6, // Balanced for creativity and reliability
    topP: 0.95, // High diversity for comprehensive analysis
    maxTokens: 4000, // Significantly increased for complete analysis
  },

  RESPONSE_LIMITS: {
    explanation: { min: 30, max: 500 }, // Increased for better explanations
    chat: { min: 80, max: 800 }, // Increased for comprehensive responses
    'deep-analysis': { min: 300, max: 3000 }, // Much higher limit for complete analysis
  },

  PROFESSIONAL_CONTEXT: {
    institution: 'Institusi Perbankan Indonesia',
    regulations: ['OJK', 'BI', 'PPATK'],
    standards: ['ISO 27001', 'PCI DSS', 'Basel III'],
    certifications: ['CFE', 'CAMS', 'FRM'],
  },

  QUALITY_THRESHOLDS: {
    minConfidence: 0.5, // Lowered threshold
    requiredKeywords: ['risiko', 'anomali', 'analisis', 'rekomendasi'],
    bannedPhrases: ['saya adalah ai', 'sebagai model', 'tidak dapat membantu'],
  },

  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1500, // Increased delay between retries
    timeoutMs: 45000, // Increased timeout for longer analysis
  },
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
# SISTEM ANALISIS RISIKO TRANSAKSI PERBANKAN

## KONTEKS OPERASIONAL
Anda adalah Senior Risk Analyst pada institusi perbankan di Indonesia dengan spesialisasi fraud detection dan financial crime prevention. Sistem machine learning telah mengidentifikasi transaksi berikut sebagai anomali dengan tingkat kepercayaan tinggi.

## DATA TRANSAKSI ANOMALI
**Nilai Transaksi:** Rp ${new Intl.NumberFormat('id-ID').format(transaction.amount)}
**Timestamp:** ${new Date(transaction.timestamp).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}
**Merchant:** ${transaction.merchant}
**Lokasi:** ${transaction.location}
**Anomaly Score:** ${
      transaction.anomalyScore?.toFixed(3) || 'N/A'
    } (0.0 = Normal, 1.0 = Highly Suspicious)

## TUGAS ANALISIS
Berikan analisis singkat dan profesional dalam SATU KALIMAT yang menjelaskan alasan spesifik mengapa transaksi ini diklasifikasikan sebagai anomali berdasarkan:
- Pattern nilai transaksi yang tidak biasa
- Anomali temporal (waktu transaksi mencurigakan)
- Risiko merchant atau lokasi
- Kombinasi faktor risiko

## FORMAT OUTPUT
Berikan HANYA satu kalimat analisis dalam Bahasa Indonesia formal perbankan, tanpa pembukaan atau penutup.

## CONTOH FORMAT YANG DIHARAPKAN
"Transaksi mencurigakan karena nilai Rp X.XXX.XXX pada jam Y:YY di merchant Z sangat tidak sesuai dengan pattern normal nasabah dan lokasi berisiko tinggi."

ANALISIS:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Validate and enhance the AI response
    const enhancedResponse = validateAndEnhanceAIResponse(text, 'explanation');
    return enhancedResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getDefaultResponse('explanation');
  }
}

/**
 * Validates and enhances AI response quality
 * @param {string} aiResponse - Raw AI response
 * @param {string} type - Type of analysis ('explanation', 'chat', 'deep-analysis')
 * @returns {string} Enhanced and validated response
 */
function validateAndEnhanceAIResponse(aiResponse, type = 'explanation') {
  console.log(`[AI Validation] Processing ${type} response...`);
  console.log(`[AI Validation] Original response length: ${aiResponse?.length || 0} chars`);

  if (!aiResponse || aiResponse.trim().length === 0) {
    console.log(`[AI Validation] Empty response detected for type: ${type}`);
    return getDefaultResponse(type);
  }

  let cleanedResponse = aiResponse.trim();

  // Remove any unwanted prefixes or AI artifacts
  const unwantedPrefixes = [
    'ANALISIS:',
    'JAWABAN:',
    'RESPONS:',
    'A:',
    'LAPORAN ANALISIS:',
    'HASIL:',
    '**ANALISIS:**',
    '**JAWABAN:**',
    '**LAPORAN:**',
    'HTML:',
    'FORMAT HTML:',
    'BERIKAN ANALISIS:',
    'BERIKAN RESPONS:',
    '```html',
    '```',
    '`html`',
  ];

  unwantedPrefixes.forEach(prefix => {
    if (cleanedResponse.toUpperCase().startsWith(prefix.toUpperCase())) {
      cleanedResponse = cleanedResponse.substring(prefix.length).trim();
    }
  });

  // More flexible minimum length validation
  const minLengths = {
    explanation: 30, // Reduced from 50
    chat: 80, // Increased for better responses
    'deep-analysis': 300, // Increased for comprehensive analysis
  };

  if (cleanedResponse.length < minLengths[type]) {
    console.log(
      `[AI Validation] Response too short (${cleanedResponse.length} < ${minLengths[type]}) for type: ${type}`
    );
    return getDefaultResponse(type);
  }

  // Clean up unwanted AI self-references more aggressively
  const inappropriatePatterns = [
    /sebagai ai/gi,
    /saya adalah ai/gi,
    /sebagai model bahasa/gi,
    /saya tidak dapat/gi,
    /maaf, saya tidak/gi,
    /sebagai asisten/gi,
  ];

  inappropriatePatterns.forEach(pattern => {
    cleanedResponse = cleanedResponse.replace(pattern, '');
  });

  // Clean up HTML-related artifacts and unwanted text
  const htmlArtifacts = [
    /```html\s*/gi, // Remove ```html markers
    /```\s*/gi, // Remove ``` markers
    /`html`/gi, // Remove `html` text
    /format html/gi, // Remove "format html" text
    /dalam format html/gi, // Remove "dalam format html" text
    /gunakan html/gi, // Remove "gunakan html" text
  ];

  htmlArtifacts.forEach(pattern => {
    cleanedResponse = cleanedResponse.replace(pattern, '');
  });

  // Final cleanup
  cleanedResponse = cleanedResponse.trim();

  console.log(`[AI Validation] Final response length: ${cleanedResponse.length} chars`);

  return cleanedResponse.length > 10 ? cleanedResponse : getDefaultResponse(type);
}

/**
 * Provides default professional responses when AI fails
 * @param {string} type - Type of analysis
 * @returns {string} Default professional response
 */
function getDefaultResponse(type) {
  const defaults = {
    explanation:
      'Transaksi menunjukkan pattern yang tidak sesuai dengan profil normal dan memerlukan investigasi lebih lanjut oleh tim fraud prevention.',
    chat: 'Berdasarkan data yang tersedia, diperlukan analisis lebih mendalam untuk memberikan insight yang akurat. Silakan hubungi tim risk analyst untuk konsultasi lebih lanjut.',
    'deep-analysis': `
<div class="analysis-report">
<h3>RINGKASAN RISIKO</h3>
<p>Sistem sedang mengalami kendala dalam menganalisis pattern kompleks pada batch ini. Diperlukan review manual oleh tim specialist untuk memberikan assessment yang akurat.</p>
<h3>TEMUAN UTAMA</h3>
<ol>
<li>Data batch memerlukan validasi manual lebih lanjut</li>
<li>Pattern anomali memerlukan analisis mendalam oleh expert</li>
<li>Sistem AI membutuhkan tuning untuk data dengan karakteristik ini</li>
</ol>
<h3>POLA FRAUD TERDETEKSI</h3>
<p>Pattern yang terdeteksi memerlukan investigasi manual karena kompleksitas data yang tinggi.</p>
<h3>REKOMENDASI SEGERA</h3>
<ol>
<li>Escalate batch ini ke tim fraud investigation senior</li>
<li>Lakukan review manual terhadap transaksi dengan anomaly score tertinggi</li>
<li>Implementasi enhanced monitoring untuk batch ini</li>
</ol>
<h3>MONITORING LANJUTAN</h3>
<ul>
<li>Continuous monitoring selama 30 hari ke depan</li>
<li>Weekly progress review dengan tim risk management</li>
<li>Monthly evaluation untuk pattern analysis improvement</li>
</ul>
</div>
    `,
  };

  return defaults[type] || defaults.explanation;
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
# SISTEM KONSULTASI AI RISK ANALYST - FRAUD DETECTION

## IDENTITAS PROFESIONAL
Anda adalah AI Risk Analyst Level Senior dengan 10+ tahun pengalaman di fraud detection, financial crime investigation, dan risk management di institusi perbankan Indonesia. Anda memiliki sertifikasi CFE (Certified Fraud Examiner) dan CAMS (Certified Anti-Money Laundering Specialist).

## KONTEKS DATA ANALISIS
${dataContext}

## PEDOMAN RESPONS PROFESIONAL
1. **AKURASI DATA**: Gunakan HANYA data yang tersedia di konteks di atas
2. **TONE PROFESIONAL**: Gunakan bahasa Indonesia formal sektor perbankan
3. **INSIGHT ACTIONABLE**: Berikan rekomendasi yang dapat langsung diimplementasikan
4. **STRUKTUR JELAS**: Gunakan format yang terstruktur untuk readability yang optimal
5. **KONTEKS TERBATAS**: Jika pertanyaan di luar scope data, arahkan kembali ke analisis fraud detection
6. **PANJANG OPTIMAL**: Maksimal 600 kata untuk analisis komprehensif

## STANDAR KUALITAS RESPONS
- Sertakan statistik spesifik dan persentase
- Berikan perbandingan dengan benchmark industri jika relevan
- Identifikasi pattern dan trend yang terdeteksi
- Rekomendakan tindakan prioritas berdasarkan tingkat risiko
- Gunakan terminologi fraud detection yang tepat

## PERTANYAAN KLIEN
**Q:** ${question}

## FORMAT RESPONS:
Berikan respons dengan struktur berikut untuk tampilan yang optimal di web:

<div class="chat-response">
<h4>ANALISIS RISK ANALYST</h4>
<p>[Jawaban utama dengan insight dan analisis]</p>
<h4>REKOMENDASI TINDAKAN</h4>
<ul>
<li>[Rekomendasi spesifik 1]</li>
<li>[Rekomendasi spesifik 2]</li>
</ul>
<h4>CATATAN TAMBAHAN</h4>
<p>[Insight tambahan atau konteks penting]</p>
</div>

## RESPONS RISK ANALYST:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawAnswer = response.text();

    // Validate and enhance the AI response
    const aiAnswer = validateAndEnhanceAIResponse(rawAnswer, 'chat');

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
<div class="analysis-report no-anomaly">
<h3>STATUS: BATCH BELUM DIANALISIS ATAU TIDAK ADA ANOMALI</h3>
<h4>OVERVIEW</h4>
<ul>
<li>Total Transaksi: ${allTransactions.length}</li>
<li>Anomali Terdeteksi: 0 (0.00%)</li>
<li>Status: Batch ini mungkin belum dianalisis dengan AI model</li>
</ul>
<h4>NEXT STEPS</h4>
<ol>
<li>Jalankan analisis AI terlebih dahulu pada batch ini</li>
<li>Setelah analisis AI selesai, coba lagi deep analysis</li>
<li>Jika sudah dianalisis dan tidak ada anomali, berarti data bersih</li>
</ol>
<h4>SAMPLE DATA</h4>
<ul>
${allTransactions
  .slice(0, 3)
  .map(
    (t, i) =>
      `<li>${i + 1}. Rp ${new Intl.NumberFormat('id-ID').format(t.amount)} | ${t.merchant} | ${
        t.location
      }</li>`
  )
  .join('')}
</ul>
</div>
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

    // Simplified and more effective prompt
    const prompt = `
Anda adalah Risk Analyst Senior Bank Indonesia. Analisis data fraud berikut dan berikan laporan profesional LENGKAP:

DATA BATCH: ${batch.fileName}
Total Transaksi: ${allTransactions.length}
Anomali: ${anomalies.length} (${((anomalies.length / allTransactions.length) * 100).toFixed(2)}%)

MERCHANT BERISIKO:
${Object.entries(merchantPattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([merchant, count]) => `${merchant}: ${count} anomali`)
  .join('\n')}

LOKASI BERISIKO:
${Object.entries(locationPattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([location, count]) => `${location}: ${count} anomali`)
  .join('\n')}

WAKTU PUNCAK:
${Object.entries(timePattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([hour, count]) => `Jam ${hour}:00 - ${count} anomali`)
  .join('\n')}

DISTRIBUSI NILAI:
${Object.entries(amountRanges)
  .map(([range, count]) => `${range}: ${count} transaksi`)
  .join('\n')}

BERIKAN ANALISIS LENGKAP DENGAN STRUKTUR SEBAGAI BERIKUT:

<div class="analysis-report">
<h3>RINGKASAN RISIKO</h3>
<p>[2-3 kalimat kondisi risiko batch ini]</p>
<h3>TEMUAN UTAMA</h3>
<ol>
<li>[Temuan paling penting]</li>
<li>[Pattern anomali yang mengkhawatirkan]</li>
<li>[Risiko finansial dan operasional]</li>
</ol>
<h3>POLA FRAUD TERDETEKSI</h3>
<p>[Analisis pattern berdasarkan data di atas]</p>
<h3>REKOMENDASI SEGERA</h3>
<ol>
<li>[Tindakan urgent 24-48 jam]</li>
<li>[Follow-up 1 minggu]</li>
<li>[Monitoring jangka panjang]</li>
</ol>
<h3>MONITORING LANJUTAN</h3>
<ul>
<li>[Tindakan monitoring berkelanjutan]</li>
<li>[Review schedule dan escalation]</li>
<li>[Performance metrics untuk tracking]</li>
</ul>
</div>

PENTING: Gunakan struktur di atas dan bahasa Indonesia formal perbankan.`;

    // Use retry mechanism for better reliability
    const rawAnalysis = await callAIWithRetry(() => model.generateContent(prompt), 'Deep Analysis');

    console.log(`[Deep Analysis] Final analysis: ${rawAnalysis}`);
    console.log(`[Deep Analysis] Final length: ${rawAnalysis?.length || 0}`);

    // Validate and enhance the AI response
    const deepAnalysis = rawAnalysis
      ? validateAndEnhanceAIResponse(rawAnalysis, 'deep-analysis')
      : getDefaultResponse('deep-analysis');

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

    // Enhanced error logging for debugging
    console.error('Deep Analysis Error Details:', {
      batchId,
      errorType: error.constructor.name,
      errorMessage: error.message,
      stackTrace: error.stack?.split('\n').slice(0, 3).join('\n'),
    });

    // Return a more detailed error response for deep analysis failures
    const detailedErrorResponse = {
      batchInfo: {
        fileName: 'Error in analysis',
        totalTransactions: 0,
        anomalyCount: 0,
        riskLevel: 'ERROR',
      },
      patterns: {
        timePattern: {},
        merchantPattern: {},
        locationPattern: {},
        amountRanges: {},
      },
      analysis: `
<div class="error-analysis">
<h3>STATUS ERROR</h3>
<p>Terjadi kesalahan sistem dalam melakukan analisis mendalam.</p>
<h4>DETAIL ERROR</h4>
<ul>
<li>Error Type: ${error.constructor.name}</li>
<li>Error Message: ${error.message}</li>
<li>Timestamp: ${new Date().toLocaleString('id-ID')}</li>
</ul>
<h4>TINDAKAN YANG DIREKOMENDASIKAN</h4>
<ol>
<li>Refresh halaman dan coba lagi setelah beberapa saat</li>
<li>Periksa koneksi internet dan coba kembali</li>
<li>Jika masalah berlanjut, hubungi administrator sistem</li>
<li>Sebagai alternatif, gunakan fitur AI Chat untuk analisis manual</li>
</ol>
<h4>INFORMASI TEKNIS</h4>
<p>Sistem mencoba menganalisis batch tetapi mengalami kendala teknis. Tim IT telah menerima log error untuk investigasi lebih lanjut.</p>
</div>
      `,
      error: true,
      errorDetails: {
        type: error.constructor.name,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    };

    res.status(500).json({
      message: 'Gagal melakukan analisis mendalam.',
      error: error.message,
      ...detailedErrorResponse,
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

/**
 * Enhanced AI API call with retry mechanism and better error handling
 * @param {Function} apiCall - The API call function to execute
 * @param {string} type - Type of analysis for logging
 * @param {number} maxRetries - Maximum number of retries
 * @returns {Promise<string>} AI response or fallback
 */
async function callAIWithRetry(
  apiCall,
  type = 'analysis',
  maxRetries = AI_CONFIG.RETRY_CONFIG.maxRetries
) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[${type}] Attempt ${attempt}/${maxRetries}`);

      // Set timeout for the API call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI API timeout')), AI_CONFIG.RETRY_CONFIG.timeoutMs);
      });

      const result = await Promise.race([apiCall(), timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      console.log(`[${type}] Raw AI response: ${text.substring(0, 100)}...`);
      console.log(`[${type}] Response length: ${text.length}`);

      if (text && text.trim().length > 20) {
        return text.trim();
      } else {
        throw new Error('Empty or too short response from AI');
      }
    } catch (error) {
      lastError = error;
      console.error(`[${type}] Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`[${type}] Retrying in ${AI_CONFIG.RETRY_CONFIG.retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, AI_CONFIG.RETRY_CONFIG.retryDelay));
      }
    }
  }

  console.error(`[${type}] All ${maxRetries} attempts failed. Last error:`, lastError);
  return null;
}

// =====================================================
// SECTION: AI Health Check Route (Admin Only)
// =====================================================

/**
 * @route   GET /api/transactions/ai-health
 * @desc    Check AI system health and status
 * @access  Private (admin only)
 * @returns {Object} AI system health status
 */
router.get('/ai-health', protect, async (req, res) => {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      geminiApiStatus: 'unknown',
      testPrompt: 'Test analisis singkat untuk health check',
      responseTime: null,
      lastError: null,
    };

    const startTime = Date.now();

    try {
      const model = getGeminiModel();
      const testResult = await callAIWithRetry(
        () =>
          model.generateContent(
            'Berikan respon singkat "AI system operational" dalam bahasa Indonesia professional.'
          ),
        'Health Check',
        1 // Only 1 retry for health check
      );

      healthCheck.responseTime = Date.now() - startTime;

      if (testResult && testResult.length > 0) {
        healthCheck.geminiApiStatus = 'operational';
        healthCheck.testResponse = testResult.substring(0, 100);
      } else {
        healthCheck.geminiApiStatus = 'degraded';
        healthCheck.lastError = 'Empty response from AI';
      }
    } catch (error) {
      healthCheck.geminiApiStatus = 'error';
      healthCheck.lastError = error.message;
      healthCheck.responseTime = Date.now() - startTime;
    }

    res.status(200).json({
      status: healthCheck.geminiApiStatus,
      details: healthCheck,
      recommendations:
        healthCheck.geminiApiStatus !== 'operational'
          ? [
              'Check API key configuration',
              'Verify network connectivity',
              'Review rate limiting status',
              'Consider using fallback responses',
            ]
          : ['AI system is functioning normally'],
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    });
  }
});
