// backend/routes/transaction.js
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const prisma = require('../lib/prisma');
const axios = require('axios');

const router = express.Router();

// Konfigurasi Multer untuk menyimpan file di folder 'uploads/'
const upload = multer({ dest: 'uploads/' });

/**
 * @route   POST /transactions/upload
 * @desc    Upload file CSV transaksi
 * @access  Public
 */
// Endpoint UPLOAD (dengan modifikasi respons)
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'File tidak diunggah.' });

    const filePath = req.file.path;

    try {
        const newBatch = await prisma.uploadBatch.create({
            data: { fileName: req.file.originalname, status: 'PENDING' },
        });
        const batchId = newBatch.id;

        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Basic validation
                if (data.amount && data.timestamp && data.merchant && data.location) {
                    results.push({
                        amount: parseFloat(data.amount),
                        timestamp: new Date(data.timestamp),
                        merchant: data.merchant,
                        location: data.location,
                        uploadBatchId: batchId, // update sesuai schema.prisma baru
                    });
                }
            })
            .on('end', async () => {
                try {
                    await prisma.transaction.createMany({ data: results, skipDuplicates: true });
                    await prisma.uploadBatch.update({ where: { id: batchId }, data: { status: 'COMPLETED' } });
                    fs.unlinkSync(filePath);
                    res.status(201).json({ message: 'File berhasil diunggah.', batch: newBatch });
                } catch (error) {
                    try { fs.unlinkSync(filePath); } catch { }
                    res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
                }
            })
            .on('error', (err) => {
                try { fs.unlinkSync(filePath); } catch { }
                res.status(500).json({ message: 'Gagal membaca file.', error: err.message });
            });
    } catch (error) {
        try { fs.unlinkSync(filePath); } catch { }
        res.status(500).json({ message: 'Gagal memproses file.', error: error.message });
    }
});

/**
 * @route   POST /api/transactions/analyze/:batchId
 * @desc    Memicu analisis AI untuk satu batch
 * @access  Public
 */
router.post('/analyze/:batchId', async (req, res) => {
    const { batchId } = req.params;

    try {
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
            transactions: transactions.map(t => ({ id: t.id, amount: t.amount })),
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
        console.error("Error saat analisis:", error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});


/**
 * @route   GET /api/transactions/anomalies/:batchId
 * @desc    Ambil semua transaksi anomali untuk satu batch
 * @access  Public
 */
router.get('/anomalies/:batchId', async (req, res) => {
    const { batchId } = req.params;

    try {
        const anomalies = await prisma.transaction.findMany({
            where: {
                uploadBatchId: batchId,
                isAnomaly: true, // Hanya ambil yang ditandai sebagai anomali
            },
            orderBy: {
                anomalyScore: 'asc', // Urutkan dari skor terendah (paling anomali)
            },
        });

        if (anomalies.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada anomali yang ditemukan untuk batch ini.',
            });
        }

        res.status(200).json(anomalies);

    } catch (error) {
        console.error("Error saat mengambil anomali:", error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server.',
            error: error.message,
        });
    }
});

/**
 * @route   GET /api/transactions/batches
 * @desc    Ambil semua batch upload yang pernah ada
 * @access  Public
 */
router.get('/batches', async (req, res) => {
    try {
        const batches = await prisma.uploadBatch.findMany({
            orderBy: {
                createdAt: 'desc', // Tampilkan yang terbaru di atas
            },
        });
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data batch.', error: error.message });
    }
});

module.exports = router;