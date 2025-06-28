document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api/transactions';

    // Elemen UI
    const uploadBtn = document.getElementById('uploadBtn');
    const csvFileInput = document.getElementById('csvFile');
    const uploadStatus = document.getElementById('uploadStatus');
    const batchBody = document.getElementById('batchBody');
    const resultsBody = document.getElementById('resultsBody');
    const resultStatus = document.getElementById('resultStatus');

    // --- FUNGSI UTAMA ---

    // 1. Fungsi untuk mengambil dan menampilkan semua batch
    async function fetchAndDisplayBatches() {
        try {
            const res = await fetch(`${API_BASE_URL}/batches`);
            const batches = await res.json();
            batchBody.innerHTML = ''; // Kosongkan tabel
            batches.forEach(batch => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${batch.id}</td>
                    <td>${batch.fileName}</td>
                    <td>${new Date(batch.createdAt).toLocaleString('id-ID')}</td>
                    <td>
                        <button class="analyze-btn" data-batchid="${batch.id}">▶️ Analisis</button>
                        <button class="results-btn" data-batchid="${batch.id}">📄 Lihat Hasil</button>
                    </td>
                `;
                batchBody.appendChild(row);
            });
        } catch (error) {
            batchBody.innerHTML = `<tr><td colspan="4">Gagal memuat data batch.</td></tr>`;
        }
    }

    // 2. Fungsi untuk menangani proses upload
    async function handleUpload() {
        const file = csvFileInput.files[0];
        if (!file) {
            uploadStatus.textContent = 'Pilih file terlebih dahulu.';
            return;
        }
        uploadStatus.textContent = 'Mengunggah...';

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            uploadStatus.textContent = `Sukses! File "${file.name}" telah diunggah.`;
            csvFileInput.value = ''; // Reset input file
            fetchAndDisplayBatches(); // Refresh daftar batch
        } catch (error) {
            uploadStatus.textContent = `Error: ${error.message}`;
        }
    }

    // 3. Fungsi untuk menangani klik tombol di tabel batch
    async function handleBatchTableClick(event) {
        const target = event.target;
        const batchId = target.dataset.batchid;

        if (!batchId) return;

        // Jika tombol "Analisis" ditekan
        if (target.classList.contains('analyze-btn')) {
            resultStatus.textContent = `Menganalisis Batch ID: ${batchId}...`;
            resultsBody.innerHTML = '';
            try {
                const res = await fetch(`${API_BASE_URL}/analyze/${batchId}`, { method: 'POST' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                resultStatus.textContent = `Analisis untuk Batch ID: ${batchId} selesai. Klik "Lihat Hasil".`;
            } catch (error) {
                resultStatus.textContent = `Error analisis: ${error.message}`;
            }
        }

        // Jika tombol "Lihat Hasil" ditekan
        if (target.classList.contains('results-btn')) {
            resultStatus.textContent = `Mengambil hasil untuk Batch ID: ${batchId}...`;
            try {
                const res = await fetch(`${API_BASE_URL}/anomalies/${batchId}`);
                if (res.status === 404) {
                    resultStatus.textContent = 'Tidak ada anomali yang ditemukan untuk batch ini.';
                    resultsBody.innerHTML = '';
                    return;
                }
                const anomalies = await res.json();
                if (!res.ok) throw new Error(anomalies.message);

                resultStatus.textContent = `Menampilkan ${anomalies.length} anomali.`;
                displayAnomalies(anomalies);
            } catch (error) {
                resultStatus.textContent = `Error mengambil hasil: ${error.message}`;
            }
        }
    }

    // Fungsi untuk menampilkan hasil anomali di tabel bawah
    function displayAnomalies(anomalies) {
        resultsBody.innerHTML = '';
        anomalies.forEach(anomaly => {
            const row = document.createElement('tr');
            row.className = 'anomaly-row';
            row.innerHTML = `
                <td>${new Date(anomaly.timestamp).toLocaleString('id-ID')}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(anomaly.amount)}</td>
                <td>${anomaly.merchant}</td>
                <td>${anomaly.location}</td>
                <td>${anomaly.anomalyScore.toFixed(4)}</td>
            `;
            resultsBody.appendChild(row);
        });
    }

    // --- EVENT LISTENERS ---
    uploadBtn.addEventListener('click', handleUpload);
    batchBody.addEventListener('click', handleBatchTableClick); // Satu event listener untuk semua tombol di tabel

    // Muat daftar batch saat halaman pertama kali dibuka
    fetchAndDisplayBatches();
});