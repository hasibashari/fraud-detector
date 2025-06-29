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


// Mapping kolom CSV ke kolom database
const MAPPER_CONFIG = {
    amount: ['transactionamount', 'amount', 'jumlah', 'nilai', "TransactionAmount"],
    timestamp: ['transactiondate', 'timestamp', 'waktu', "TransactionDate"],
    merchant: ['merchantid', 'merchant', "MerchantID"],
    location: ['location', "Location"],
    user_id: ['accountid', 'user_id', 'userid', "AccountID"],
    // tambahkan mapping lain jika perlu
};

function mapAndCleanRow(rawRow) {
    const cleanRow = {};
    const rawKeys = Object.keys(rawRow).reduce((acc, key) => {
        acc[key.toLowerCase().replace(/\s/g, '')] = rawRow[key];
        return acc;
    }, {});
    for (const targetField in MAPPER_CONFIG) {
        for (const sourceField of MAPPER_CONFIG[targetField]) {
            if (rawKeys[sourceField]) {
                cleanRow[targetField] = rawKeys[sourceField];
                break;
            }
        }
    }
    // Bersihkan amount
    if (cleanRow.amount) {
        let amountStr = String(cleanRow.amount).replace(/Rp|\s|\./g, '').replace(',', '.');
        cleanRow.amount = parseFloat(amountStr);
    }
    // Bersihkan timestamp
    if (cleanRow.timestamp) {
        cleanRow.timestamp = new Date(cleanRow.timestamp);
    }
    // merchant dan location biarkan string
    return cleanRow;
}

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
            .on('data', (rawRow) => {
                const cleanRow = mapAndCleanRow(rawRow);
                // Pastikan semua field wajib ada
                if (
                    typeof cleanRow.amount === 'number' && !isNaN(cleanRow.amount) &&
                    cleanRow.timestamp && cleanRow.merchant && cleanRow.location
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

/**
 * @route   DELETE /api/transactions/batch/:batchId
 * @desc    Menghapus satu batch beserta semua transaksinya
 * @access  Public
 */
router.delete('/batch/:batchId', async (req, res) => {
    const { batchId } = req.params;

    try {
        // prisma.$transaction memastikan kedua operasi ini harus berhasil.
        // Jika salah satu gagal, keduanya akan dibatalkan (rollback).
        // Ini menjaga konsistensi data.
        const [deletedTransactions, deletedBatch] = await prisma.$transaction([
            // 1. Hapus dulu semua transaksi yang memiliki uploadBatchId ini
            prisma.transaction.deleteMany({
                where: { uploadBatchId: batchId },
            }),
            // 2. Baru hapus batch induknya
            prisma.uploadBatch.delete({
                where: { id: batchId },
            }),
        ]);

        res.status(200).json({
            message: `Batch berhasil dihapus.`,
            deletedTransactionsCount: deletedTransactions.count,
            deletedBatchInfo: deletedBatch,
        });

    } catch (error) {
        // Tangani jika batch tidak ditemukan atau ada error lain
        if (error.code === 'P2025') { // Kode error Prisma untuk 'Record to delete does not exist.'
            return res.status(404).json({ message: 'Batch tidak ditemukan.' });
        }
        console.error("Error saat menghapus batch:", error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
});


/**
 * @route   GET /api/transactions/batch/:batchId
 * @desc    Ambil SEMUA transaksi (anomali dan normal) untuk satu batch
 * @access  Public
 */
router.get('/batch/:batchId', async (req, res) => {
    const { batchId } = req.params;

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                uploadBatchId: batchId,
            },
            orderBy: {
                timestamp: 'asc', // atau 'desc' sesuai kebutuhan
            },
        });

        if (transactions.length === 0) {
            return res.status(404).json({
                message: 'Tidak ada transaksi ditemukan untuk batch ini.',
            });
        }

        res.status(200).json(transactions);

    } catch (error) {
        console.error("Error saat mengambil transaksi batch:", error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server.',
            error: error.message,
        });
    }
});


module.exports = router;