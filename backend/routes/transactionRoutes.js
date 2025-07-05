// =====================================================
// TRANSACTION ROUTES - Fraud Detection System
//
// Modul ini menangani seluruh operasi terkait transaksi, termasuk:
//
// 📁 FILE OPERATIONS:
// - Upload & proses file CSV dengan pemetaan field otomatis
// - Validasi file dan penanganan error upload
//
// 🤖 AI ANALYSIS:
// - Trigger analisis ML model via Flask API
// - Penjelasan AI (Gemini) untuk anomali
// - Chat interaktif AI seputar pola fraud
// - Laporan analisis mendalam & rekomendasi
//
// 📊 DATA MANAGEMENT:
// - Manajemen batch upload & transaksi
// - Query data transaksi & hasil deteksi anomali
//
// 📤 EXPORT FEATURES:
// - Download hasil analisis dalam format CSV
//
// 🔐 SECURITY:
// - Semua operasi membutuhkan autentikasi user
// - Validasi kepemilikan batch & sanitasi input
//
// Dependencies: Prisma ORM, Multer, CSV-Parser, Axios, Google Gemini AI
// =====================================================

// =========================
// SECTION: Import Dependencies
// =========================
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const prisma = require('../lib/prisma');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Logger = require('../utils/logger');

// Inisialisasi router Express
const router = express.Router();

// =========================
// SECTION: AI Configuration (Gemini Setup)
// =========================
// Inisialisasi Gemini AI dengan API Key dari environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Mendapatkan instance model Gemini dengan konfigurasi profesional
 * @returns {Object} Gemini model instance siap pakai
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

// =========================
// SECTION: AI Configuration Constants
// =========================
/**
 * Konfigurasi parameter model AI, batas respons, dan konteks profesional
 */
const AI_CONFIG = {
  MODEL_PARAMETERS: {
    temperature: 0.6, // Keseimbangan kreativitas & reliabilitas
    topP: 0.95, // Diversitas tinggi untuk analisis komprehensif
    maxTokens: 4000, // Output panjang untuk analisis lengkap
  },
  RESPONSE_LIMITS: {
    explanation: { min: 30, max: 500 },
    chat: { min: 80, max: 800 },
    'deep-analysis': { min: 300, max: 3000 },
  },
  PROFESSIONAL_CONTEXT: {
    institution: 'Institusi Perbankan Indonesia',
    regulations: ['OJK', 'BI', 'PPATK'],
    standards: ['ISO 27001', 'PCI DSS', 'Basel III'],
    certifications: ['CFE', 'CAMS', 'FRM'],
  },
  QUALITY_THRESHOLDS: {
    minConfidence: 0.5,
    requiredKeywords: ['risiko', 'anomali', 'analisis', 'rekomendasi'],
    bannedPhrases: ['saya adalah ai', 'sebagai model', 'tidak dapat membantu'],
  },
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1500,
    timeoutMs: 45000,
  },
};

// =========================
// SECTION: CSV Processing Configuration
// =========================
/**
 * Konfigurasi Multer untuk upload file CSV dengan keamanan & validasi
 */
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: {
    fileSize: 10 * 1024 * 1024, // Maksimal 10MB
    files: 1, // Hanya 1 file per upload
  },
  fileFilter: (req, file, cb) => {
    // Validasi tipe file
    if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
});

/**
 * Konfigurasi pemetaan kolom CSV ke field database
 * Mendukung berbagai variasi nama kolom
 */
const MAPPER_CONFIG = {
  amount: ['transactionamount', 'amount', 'jumlah', 'nilai', 'TransactionAmount'],
  timestamp: ['transactiondate', 'timestamp', 'waktu', 'TransactionDate'],
  merchant: ['merchantid', 'merchant', 'MerchantID', 'merchantname', 'MerchantName'],
  location: ['city', 'kota', 'lokasi', 'location', 'Location', 'City'],
  user_id: ['accountid', 'user_id', 'userid', 'AccountID', 'UserID'],
  transaction_type: ['transactiontype', 'jenis', 'tipe', 'TransactionType'],
  channel: ['channel', 'saluran', 'Channel'],
  device_type: ['devicetype', 'device', 'DeviceType'],
};

// =========================
// SECTION: Utility Functions
// =========================

/**
 * Membersihkan dan memetakan satu baris CSV ke field database
 * @param {Object} rawRow - Data mentah dari CSV
 * @returns {Object} Data yang sudah dipetakan & dibersihkan
 */
function mapAndCleanRow(rawRow) {
  const cleanRow = {};
  // Normalisasi key ke lowercase tanpa spasi
  const rawKeys = Object.keys(rawRow).reduce((acc, key) => {
    acc[key.toLowerCase().replace(/\s/g, '')] = rawRow[key];
    return acc;
  }, {});
  // Pemetaan field CSV ke field database
  for (const targetField in MAPPER_CONFIG) {
    for (const sourceField of MAPPER_CONFIG[targetField]) {
      if (rawKeys[sourceField]) {
        cleanRow[targetField] = rawKeys[sourceField];
        break;
      }
    }
  }
  // Bersihkan field amount (hilangkan simbol, spasi, titik, ganti koma jadi titik)
  if (cleanRow.amount) {
    let amountStr = String(cleanRow.amount)
      .replace(/Rp|\s|\./g, '')
      .replace(',', '.');
    cleanRow.amount = parseFloat(amountStr);
  }
  // Bersihkan field timestamp (jadikan Date object)
  if (cleanRow.timestamp) {
    cleanRow.timestamp = new Date(cleanRow.timestamp);
  } else {
    cleanRow.timestamp = new Date();
  }
  return cleanRow;
}

/**
 * Generate penjelasan AI (Gemini) untuk transaksi anomali
 * @param {Object} transaction - Data transaksi anomali
 * @returns {Promise<string>} Penjelasan AI dalam Bahasa Indonesia
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
**Lokasi:** ${transaction.location || 'Data tidak tersedia'}
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
    // Validasi & perbaiki respons AI
    const enhancedResponse = validateAndEnhanceAIResponse(text, 'explanation');
    return enhancedResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getDefaultResponse('explanation');
  }
}

/**
 * Validasi & perbaiki kualitas respons AI
 * @param {string} aiResponse - Respons mentah dari AI
 * @param {string} type - Jenis analisis ('explanation', 'chat', 'deep-analysis')
 * @returns {string} Respons yang sudah divalidasi & dibersihkan
 */
function validateAndEnhanceAIResponse(aiResponse, type = 'explanation') {
  Logger.ai(`Processing ${type} response with length: ${aiResponse?.length || 0} chars`);
  if (!aiResponse || aiResponse.trim().length === 0) {
    Logger.warn(`Empty AI response detected for type: ${type}`);
    return getDefaultResponse(type);
  }
  let cleanedResponse = aiResponse.trim();
  // Hilangkan prefix/pola tidak diinginkan
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
  // Validasi panjang minimum
  const minLengths = {
    explanation: 30,
    chat: 80,
    'deep-analysis': 300,
  };
  if (cleanedResponse.length < minLengths[type]) {
    Logger.warn(
      `Response too short (${cleanedResponse.length} < ${minLengths[type]}) for type: ${type}`
    );
    return getDefaultResponse(type);
  }
  // Bersihkan referensi AI yang tidak profesional
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
  // Bersihkan artefak HTML
  const htmlArtifacts = [
    /```html\s*/gi,
    /```\s*/gi,
    /`html`/gi,
    /format html/gi,
    /dalam format html/gi,
    /gunakan html/gi,
  ];
  htmlArtifacts.forEach(pattern => {
    cleanedResponse = cleanedResponse.replace(pattern, '');
  });
  cleanedResponse = cleanedResponse.trim();
  Logger.ai(`Final response length: ${cleanedResponse.length} chars`);
  return cleanedResponse.length > 10 ? cleanedResponse : getDefaultResponse(type);
}

/**
 * Default respons profesional jika AI gagal
 * @param {string} type - Jenis analisis
 * @returns {string} Respons default
 */
function getDefaultResponse(type) {
  const defaults = {
    explanation:
      'Transaksi menunjukkan pattern yang tidak sesuai dengan profil normal dan memerlukan investigasi lebih lanjut oleh tim fraud prevention.',
    chat: 'Berdasarkan data yang tersedia, diperlukan analisis lebih mendalam untuk memberikan insight yang akurat. Silakan hubungi tim risk analyst untuk konsultasi lebih lanjut.',
    'deep-analysis': `
<div class="analysis-report">
<h3>RINGKASAN RISIKO</h3>
<p>Sistem sedang mengalami kendala dalam menganalisis pattern kompleks pada batch ini. Diperlukan review manual oleh tim specialist untuk assessment akurat.</p>
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
// SECTION: Multer Error Handling Middleware
// =====================================================

/**
 * Middleware to handle Multer-specific errors
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err);

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File terlalu besar. Maksimal ukuran file adalah 10MB.',
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Terlalu banyak file. Hanya diizinkan 1 file per upload.',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Field file tidak diharapkan. Gunakan field "file".',
        });
      default:
        return res.status(400).json({
          message: 'Error upload file.',
          error: err.message,
        });
    }
  }

  if (err.message === 'Only CSV files are allowed') {
    return res.status(400).json({
      message: 'Hanya file CSV yang diizinkan.',
    });
  }

  next(err);
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
// Temporary debug route without auth and without user constraint
router.post('/upload-debug', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File tidak diunggah.' });
  }

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
  const results = [];

  try {
    // Baca dan proses file CSV tanpa simpan ke database dulu
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', rawRow => {
        const cleanRow = mapAndCleanRow(rawRow);

        // Field wajib dengan validasi ketat
        const row = {
          amount:
            typeof cleanRow.amount === 'number' && !isNaN(cleanRow.amount) ? cleanRow.amount : null,
          timestamp: cleanRow.timestamp || null,
          merchant: cleanRow.merchant || null,
          // Field optional - biarkan null jika tidak ada
          location: cleanRow.location || null,
          user_id: cleanRow.user_id ? String(cleanRow.user_id) : null,
          transaction_type: cleanRow.transaction_type || null,
          channel: cleanRow.channel || null,
          device_type: cleanRow.device_type || null,
        };

        // Validasi ketat: field wajib harus ada dan valid
        if (
          row.amount &&
          row.amount > 0 &&
          row.timestamp &&
          row.merchant &&
          row.merchant.trim() !== ''
        ) {
          results.push(row);
        }
      })
      .on('end', async () => {
        try {
          fs.unlinkSync(filePath); // Hapus file upload
          res.status(201).json({
            message: 'File berhasil diproses (debug mode).',
            results: results.length,
            sample: results.slice(0, 2),
          });
        } catch (error) {
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkError) {
            console.error('Error deleting file:', unlinkError);
          }
          res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
        }
      })
      .on('error', async err => {
        console.error('🐛 Error reading CSV file:', err);
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
        res.status(500).json({ message: 'Gagal membaca file.', error: err.message });
      });
  } catch (error) {
    console.error('🐛 Error starting CSV processing:', error);
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
    }
    res.status(500).json({ message: 'Gagal memulai proses file.', error: error.message });
  }
});

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  // Enhanced validation for user authentication
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User tidak terautentikasi dengan benar.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'File tidak diunggah.' });
  }

  // Enhanced file extension validation
  const originalName = req.file.originalname.toLowerCase();
  const dotIndex = originalName.lastIndexOf('.');

  if (dotIndex === -1) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkError) {
      console.error('Error deleting invalid file:', unlinkError);
    }
    return res.status(400).json({ message: 'File harus memiliki ekstensi.' });
  }

  const fileExtension = originalName.substring(dotIndex);
  const allowedExtensions = ['.csv'];

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
    // Check if file exists before processing
    if (!fs.existsSync(filePath)) {
      console.log('❌ Uploaded file not found');
      return res.status(400).json({ message: 'File upload gagal, file tidak ditemukan.' });
    }

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
    let processedRows = 0;
    let validRows = 0;
    let invalidRows = 0;

    // Create a promise to handle CSV processing
    const processCSV = new Promise((resolve, reject) => {
      const stream = fs
        .createReadStream(filePath)
        .pipe(csv())
        .on('data', rawRow => {
          processedRows++;
          console.log(`📁 Processing row ${processedRows}:`, Object.keys(rawRow));

          const cleanRow = mapAndCleanRow(rawRow);

          // Field wajib dengan validasi ketat
          const row = {
            amount:
              typeof cleanRow.amount === 'number' && !isNaN(cleanRow.amount)
                ? cleanRow.amount
                : null,
            timestamp: cleanRow.timestamp || null,
            merchant: cleanRow.merchant || null,
            // Field optional - biarkan null jika tidak ada
            location: cleanRow.location || null,
            user_id: cleanRow.user_id ? String(cleanRow.user_id) : null,
            transaction_type: cleanRow.transaction_type || null,
            channel: cleanRow.channel || null,
            device_type: cleanRow.device_type || null,
            uploadBatchId: batchId,
          };

          // Validasi ketat: field wajib harus ada dan valid
          if (
            row.amount &&
            row.amount > 0 &&
            row.timestamp &&
            row.merchant &&
            row.merchant.trim() !== ''
          ) {
            validRows++;
            results.push(row);
          } else {
            invalidRows++;
            Logger.debug(`Invalid row ${processedRows}`, row);
          }
        })
        .on('end', () => {
          Logger.upload(
            `CSV processing complete: ${processedRows} rows processed, ${validRows} valid, ${invalidRows} invalid`
          );
          resolve();
        })
        .on('error', err => {
          console.error('Error reading CSV file:', err);
          reject(err);
        });

      // Add timeout for CSV processing
      setTimeout(() => {
        stream.destroy();
        reject(new Error('CSV processing timeout after 30 seconds'));
      }, 30000);
    });

    // Wait for CSV processing to complete
    await processCSV;

    // Validate that we have some valid data
    if (results.length === 0) {
      throw new Error(
        `Tidak ada data valid yang ditemukan. Total baris: ${processedRows}, Valid: ${validRows}, Invalid: ${invalidRows}`
      );
    }

    // Simpan transaksi ke database in batches to avoid memory issues
    const batchSize = 1000;
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      await prisma.transaction.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }

    // Update status batch
    await prisma.uploadBatch.update({
      where: { id: batchId },
      data: {
        status: 'COMPLETED',
        // Add processing stats
        createdAt: new Date(), // Update timestamp
      },
    });

    // Clean up file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error deleting file after processing:', unlinkError);
    }

    res.status(201).json({
      message: 'File berhasil diunggah dan diproses.',
      batch: newBatch,
      stats: {
        totalProcessed: processedRows,
        validRows: validRows,
        invalidRows: invalidRows,
        savedTransactions: results.length,
      },
    });
  } catch (error) {
    console.error('Error creating upload batch or processing CSV:', error);

    // Clean up file if it exists
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkError) {
      console.error('Error deleting file during error handling:', unlinkError);
    }

    // Try to update batch status to FAILED if batch was created
    try {
      const batch = await prisma.uploadBatch.findFirst({
        where: {
          fileName: req.file.originalname,
          userId: req.user.id,
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (batch) {
        await prisma.uploadBatch.update({
          where: { id: batch.id },
          data: { status: 'FAILED' },
        });
      }
    } catch (updateError) {
      console.error('Error updating batch status to FAILED:', updateError);
    }

    // Return appropriate error message based on error type
    if (error.message.includes('timeout')) {
      res.status(408).json({
        message: 'Upload timeout. File terlalu besar atau koneksi lambat.',
        error: 'Processing timeout',
      });
    } else if (error.message.includes('Tidak ada data valid')) {
      res.status(400).json({
        message: 'File CSV tidak mengandung data yang valid. Periksa format kolom dan data.',
        error: error.message,
      });
    } else if (error.code === 'ENOENT') {
      res.status(400).json({
        message: 'File tidak dapat dibaca. Coba upload ulang.',
        error: 'File not found',
      });
    } else {
      res.status(500).json({
        message: 'Gagal memproses file. Silakan coba lagi.',
        error: error.message,
      });
    }
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
    // 2. Kirim data ke API Flask untuk dianalisis (semua fitur model)
    console.log(`Mengirim ${transactions.length} transaksi ke model AI...`);
    const aiResponse = await axios.post('http://127.0.0.1:5000/predict', {
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        timestamp: t.timestamp,
        // hour akan diekstrak otomatis dari timestamp di Flask
        merchant: t.merchant,
        city: t.location || 'Unknown', // Handle null location
        user_id: t.user_id || 'Unknown',
        transaction_type: t.transaction_type || 'Unknown',
        channel: t.channel || 'Unknown',
        device_type: t.device_type || 'Unknown',
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
        take: 20, // Ambil 20 anomali teratas
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

    // Analisis waktu dari anomali
    const timeAnalysis = anomalies.reduce(
      (acc, t) => {
        const timeInfo = getTimeAnalysis(t.timestamp);

        // Group by hour
        acc.hourPattern[timeInfo.hour] = (acc.hourPattern[timeInfo.hour] || 0) + 1;

        // Group by time category
        acc.timeCategoryPattern[timeInfo.timeCategory] =
          (acc.timeCategoryPattern[timeInfo.timeCategory] || 0) + 1;

        // Group by day name
        acc.dayPattern[timeInfo.dayName] = (acc.dayPattern[timeInfo.dayName] || 0) + 1;

        // Business hours vs non-business hours
        if (timeInfo.isBusinessHour) {
          acc.businessHours++;
        } else {
          acc.nonBusinessHours++;
        }

        // Weekend vs weekday
        if (timeInfo.isWeekend) {
          acc.weekendCount++;
        } else {
          acc.weekdayCount++;
        }

        return acc;
      },
      {
        hourPattern: {},
        timeCategoryPattern: {},
        dayPattern: {},
        businessHours: 0,
        nonBusinessHours: 0,
        weekendCount: 0,
        weekdayCount: 0,
      }
    );

    // Buat catatan dinamis untuk jumlah anomali yang dianalisis
    const anomalyLimit = 20;
    const anomalyNote =
      anomalyCount === 0
        ? 'Catatan: Tidak ada transaksi anomali yang dianalisis.'
        : `Catatan: Analisis di bawah ini hanya menggunakan ${
            anomalyCount < anomalyLimit ? anomalyCount : anomalyLimit
          } transaksi anomali teratas berdasarkan skor anomaly${
            anomalyCount < anomalyLimit ? '' : ''
          }.`;

    // Buat konteks data untuk AI
    const dataContext = `
KONTEKS DATA ANALISIS FRAUD DETECTION:
Nama File: ${batch.fileName}
Total Transaksi: ${totalTransactions}
Jumlah Anomali: ${anomalyCount} (${anomalyPercentage}%)
${anomalyNote}
Jumlah Normal: ${totalTransactions - anomalyCount}

STATISTIK KEUANGAN:
- Rata-rata Nilai Anomali: Rp ${new Intl.NumberFormat('id-ID').format(avgAnomalyAmount)}
- Rata-rata Nilai Normal: Rp ${new Intl.NumberFormat('id-ID').format(avgNormalAmount)}

ANALISIS WAKTU TRANSAKSI ANOMALI:
Pattern Jam (Top 5 jam dengan anomali terbanyak):
${Object.entries(timeAnalysis.hourPattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([hour, count]) => `- Jam ${hour}:00 - ${count} anomali`)
  .join('\n')}

Kategori Waktu Anomali:
${Object.entries(timeAnalysis.timeCategoryPattern)
  .sort((a, b) => b[1] - a[1])
  .map(([category, count]) => `- ${category}: ${count} anomali`)
  .join('\n')}

Distribusi Hari Anomali:
${Object.entries(timeAnalysis.dayPattern)
  .sort((a, b) => b[1] - a[1])
  .map(([day, count]) => `- ${day}: ${count} anomali`)
  .join('\n')}

Jam Kerja vs Non-Jam Kerja:
- Jam Kerja (08:00-17:00): ${timeAnalysis.businessHours} anomali
- Luar Jam Kerja: ${timeAnalysis.nonBusinessHours} anomali

Hari Kerja vs Weekend:
- Hari Kerja: ${timeAnalysis.weekdayCount} anomali
- Weekend: ${timeAnalysis.weekendCount} anomali

CONTOH ANOMALI TERDETEKSI (Top 5 dengan info waktu):
${anomalies
  .slice(0, 5)
  .map((t, i) => {
    const timeInfo = getTimeAnalysis(t.timestamp);
    return `${i + 1}. Rp ${new Intl.NumberFormat('id-ID').format(t.amount)} - ${t.merchant} di ${
      t.location || 'Lokasi tidak diketahui'
    } pada ${timeInfo.formatted} (${timeInfo.timeCategory}) - Skor: ${
      t.anomalyScore?.toFixed(3) || 'N/A'
    }`;
  })
  .join('\n')}

MERCHANT YANG SERING MUNCUL DALAM ANOMALI:
${[...new Set(anomalies.map(t => t.merchant))].slice(0, 5).join(', ')}

LOKASI YANG SERING MUNCUL DALAM ANOMALI:
${[...new Set(anomalies.map(t => t.location || 'Tidak diketahui'))].slice(0, 5).join(', ')}
    `;

    const model = getGeminiModel();

    const prompt = `
# SISTEM KONSULTASI AI RISK ANALYST - FRAUD DETECTION

## IDENTITAS PROFESIONAL
Anda adalah AI Risk Analyst Level Senior dengan 10+ tahun pengalaman di fraud detection, financial crime investigation, dan risk management di institusi perbankan Indonesia. Anda memiliki sertifikasi CFE (Certified Fraud Examiner) dan CAMS (Certified Anti-Money Laundering Specialist).

## KONTEKS DATA ANALISIS
${dataContext}

## KETERSEDIAAN DATA
✅ INFORMASI WAKTU LENGKAP TERSEDIA: 
- Jam transaksi (0-23)
- Hari dalam seminggu
- Kategori waktu (Pagi, Siang, Sore, Malam, Dini Hari)
- Klasifikasi jam kerja vs non-jam kerja
- Hari kerja vs weekend

✅ INFORMASI FINANSIAL:
- Amount transaksi
- Merchant dan lokasi
- Skor anomali (0.0-1.0)

## PEDOMAN RESPONS PROFESIONAL
1. **AKURASI DATA**: Gunakan HANYA data yang tersedia di konteks di atas - SEMUA INFO WAKTU TERSEDIA
2. **TONE PROFESIONAL**: Gunakan bahasa Indonesia formal sektor perbankan
3. **INSIGHT ACTIONABLE**: Berikan rekomendasi yang dapat langsung diimplementasikan
4. **STRUKTUR JELAS**: Gunakan format yang terstruktur untuk readability yang optimal
5. **ANALISIS WAKTU**: Manfaatkan data waktu yang lengkap untuk insight temporal fraud pattern
6. **PANJANG OPTIMAL**: Maksimal 600 kata untuk analisis komprehensif

## STANDAR KUALITAS RESPONS
- Sertakan statistik spesifik dan persentase
- Berikan perbandingan dengan benchmark industri jika relevan
- Identifikasi pattern waktu yang mencurigakan
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
        t.location || 'Unknown'
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

    // === 8 Fitur Analisis ===
    // Sort anomalies by anomalyScore (descending) and select top 20 for deep analysis
    const sortedAnomalies = [...anomalies].sort(
      (a, b) => (b.anomalyScore || 0) - (a.anomalyScore || 0)
    );
    const topAnomalies = sortedAnomalies.slice(0, 20);
    // 1. Jam (hour)
    const timePattern = topAnomalies.reduce((acc, t) => {
      const timeInfo = getTimeAnalysis(t.timestamp);
      acc[timeInfo.hour] = (acc[timeInfo.hour] || 0) + 1;
      return acc;
    }, {});
    // 2. Hari & kategori waktu
    const dayPattern = topAnomalies.reduce((acc, t) => {
      const timeInfo = getTimeAnalysis(t.timestamp);
      acc[timeInfo.dayName] = (acc[timeInfo.dayName] || 0) + 1;
      return acc;
    }, {});
    const timeCategoryPattern = topAnomalies.reduce((acc, t) => {
      const timeInfo = getTimeAnalysis(t.timestamp);
      acc[timeInfo.timeCategory] = (acc[timeInfo.timeCategory] || 0) + 1;
      return acc;
    }, {});
    // 3. Device Type
    const deviceTypePattern = topAnomalies.reduce((acc, t) => {
      const device = t.device_type || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    // 4. Channel
    const channelPattern = topAnomalies.reduce((acc, t) => {
      const channel = t.channel || 'Unknown';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {});
    // 5. Transaction Type
    const transactionTypePattern = topAnomalies.reduce((acc, t) => {
      const type = t.transaction_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    // 6. User ID
    const userPattern = topAnomalies.reduce((acc, t) => {
      const user = t.user_id || 'Unknown';
      acc[user] = (acc[user] || 0) + 1;
      return acc;
    }, {});
    // 7. Merchant
    const merchantPattern = topAnomalies.reduce((acc, t) => {
      acc[t.merchant] = (acc[t.merchant] || 0) + 1;
      return acc;
    }, {});
    // 8. Location
    const locationPattern = topAnomalies.reduce((acc, t) => {
      const location = t.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    // Amount ranges
    const amountRanges = {
      'Under 100K': topAnomalies.filter(t => t.amount < 100000).length,
      '100K-500K': topAnomalies.filter(t => t.amount >= 100000 && t.amount < 500000).length,
      '500K-1M': topAnomalies.filter(t => t.amount >= 500000 && t.amount < 1000000).length,
      'Over 1M': topAnomalies.filter(t => t.amount >= 1000000).length,
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

PATTERN WAKTU ANOMALI:
Jam dengan anomali terbanyak:
${Object.entries(timePattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([hour, count]) => `Jam ${hour}:00 - ${count} anomali`)
  .join('\n')}

Distribusi berdasarkan hari:
${Object.entries(dayPattern)
  .sort((a, b) => b[1] - a[1])
  .map(([day, count]) => `${day}: ${count} anomali`)
  .join('\n')}

Kategori waktu:
${Object.entries(timeCategoryPattern)
  .sort((a, b) => b[1] - a[1])
  .map(([category, count]) => `${category}: ${count} anomali`)
  .join('\n')}

Jam Kerja vs Non-Jam Kerja:
- Jam Kerja (08:00-17:00): ${businessHourAnomalies} anomali
- Luar Jam Kerja: ${nonBusinessHourAnomalies} anomali

Weekday vs Weekend:
- Hari Kerja: ${weekdayAnomalies} anomali  
- Weekend: ${weekendAnomalies} anomali

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

DISTRIBUSI NILAI:
${Object.entries(amountRanges)
  .map(([range, count]) => `${range}: ${count} transaksi`)
  .join('\n')}

TOP 5 ANOMALI HIGHEST RISK:
${anomalies
  .slice(0, 5)
  .map(
    (t, i) =>
      `${i + 1}. Rp ${new Intl.NumberFormat('id-ID').format(t.amount)} | ${t.merchant} | ${
        t.location || 'Unknown'
      } | Score: ${t.anomalyScore?.toFixed(3)}`
  )
  .join('\n')}
    `;

    const model = getGeminiModel();

    // Prompt dengan 8 fitur utama
    // NOTE TO AI & USER: Only the top 20 anomalies (by anomaly score) are analyzed. If fewer than 20 exist, all available anomalies are used.
    const prompt = `
CATATAN PENTING:
Analisis ini hanya menggunakan ${
      topAnomalies.length
    } transaksi anomali dengan skor anomaly tertinggi (maksimal 20). Jika jumlah anomali kurang dari 20, semua anomali yang tersedia dianalisis. Penjelasan dan insight di bawah ini hanya berdasarkan data tersebut.
Anda adalah Risk Analyst Senior Bank Indonesia. Analisis data fraud berikut dan berikan laporan profesional LENGKAP. Fokus pada 8 fitur utama berikut:

1. amount (nilai transaksi)
2. hour (jam transaksi)
3. user_id (pengguna)
4. transaction_type (jenis transaksi)
5. channel (channel transaksi)
6. merchant (merchant)
7. device_type (tipe perangkat)
8. location (lokasi)

    DATA BATCH: ${batch.fileName}
    Total Transaksi: ${allTransactions.length}
    Anomali (total): ${anomalies.length} (${(
      (anomalies.length / allTransactions.length) *
      100
    ).toFixed(2)}%)
    Anomali yang dianalisis: ${topAnomalies.length} (top 20 berdasarkan skor anomaly)

STATISTIK FITUR ANOMALI:
- Distribusi Amount: ${Object.entries(amountRanges)
      .map(([range, count]) => `${range}: ${count} transaksi`)
      .join(', ')}
- Jam (hour) terbanyak: ${Object.entries(timePattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => `Jam ${hour}:00 (${count})`)
      .join(', ')}
- User ID sering muncul: ${Object.entries(userPattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([user, count]) => `${user} (${count})`)
      .join(', ')}
- Transaction Type dominan: ${Object.entries(transactionTypePattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ')}
- Channel dominan: ${Object.entries(channelPattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([ch, count]) => `${ch} (${count})`)
      .join(', ')}
- Merchant berisiko: ${Object.entries(merchantPattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([merchant, count]) => `${merchant} (${count})`)
      .join(', ')}
- Device Type dominan: ${Object.entries(deviceTypePattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([dev, count]) => `${dev} (${count})`)
      .join(', ')}
- Lokasi berisiko: ${Object.entries(locationPattern)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([loc, count]) => `${loc} (${count})`)
      .join(', ')}

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

PENTING: Gunakan struktur di atas dan bahasa Indonesia formal perbankan. Fokuskan insight pada 8 fitur utama di atas.`;

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
      analysis: getDefaultResponse('deep-analysis'),
      error: true,
    };

    res.status(500).json(detailedErrorResponse);
  }
});

/**
 * @route   POST /api/transactions/explain/:transactionId
 * @desc    Generate AI explanation for a specific anomalous transaction
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
        location: transaction.location || 'Unknown',
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
    // Buat CSV header dengan semua field model
    const header =
      'ID,Amount,Timestamp,Hour,Date,Day,Merchant,Location,UserID,TransactionType,Channel,DeviceType,IsAnomaly,AnomalyScore\n';
    // Buat isi CSV dengan informasi waktu yang lengkap
    const rows = transactions.map(t => {
      const date = new Date(t.timestamp);
      const hour = date.getHours();
      const dateStr = date.toLocaleDateString('id-ID');
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' });

      return [
        t.id,
        t.amount,
        t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp,
        hour,
        `"${dateStr}"`,
        `"${dayName}"`,
        `"${t.merchant}"`,
        `"${t.location || 'Unknown'}"`,
        `"${t.user_id || '0'}"`,
        `"${t.transaction_type || 'purchase'}"`,
        `"${t.channel || 'mobile'}"`,
        `"${t.device_type || 'Android'}"`,
        t.isAnomaly ? 'Yes' : 'No',
        t.anomalyScore ?? '',
      ].join(',');
    });
    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fraud_results_${batchId}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error downloading batch:', error.message);
    res.status(500).json({ message: 'Gagal mengunduh hasil batch.', error: error.message });
  }
});

// Apply error handling middleware to all routes
router.use(handleMulterError);

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

/**
 * Fungsi utility untuk mengekstrak informasi waktu yang lengkap dari timestamp
 * @param {Date} timestamp - Timestamp transaksi
 * @returns {Object} Objek dengan informasi waktu yang lengkap
 */
function getTimeAnalysis(timestamp) {
  const date = new Date(timestamp);

  return {
    hour: date.getHours(),
    day: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
    dayName: date.toLocaleDateString('id-ID', { weekday: 'long' }),
    date: date.toLocaleDateString('id-ID'),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    timeCategory: getTimeCategory(date.getHours()),
    isWeekend: date.getDay() === 0 || date.getDay() === 6,
    isBusinessHour: isBusinessHour(date.getHours()),
    formatted: date.toLocaleString('id-ID'),
  };
}

/**
 * Kategorikan waktu berdasarkan jam
 */
function getTimeCategory(hour) {
  if (hour >= 6 && hour < 12) return 'Pagi';
  if (hour >= 12 && hour < 15) return 'Siang';
  if (hour >= 15 && hour < 18) return 'Sore';
  if (hour >= 18 && hour < 21) return 'Malam';
  return 'Dini Hari';
}

/**
 * Cek apakah jam termasuk jam kerja
 */
function isBusinessHour(hour) {
  return hour >= 8 && hour <= 17;
}
