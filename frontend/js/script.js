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
      console.log('Fetching batches from:', `${API_BASE_URL}/batches`);
      const res = await fetch(`${API_BASE_URL}/batches`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const batches = await res.json();
      console.log('Fetched batches:', batches);

      batchBody.innerHTML = '';

      if (!Array.isArray(batches) || batches.length === 0) {
        batchBody.innerHTML = `<tr><td colspan="4">Tidak ada batch yang ditemukan.</td></tr>`;
        return;
      }

      batches.forEach(batch => {
        const row = document.createElement('tr');
        row.dataset.batchId = batch.id; // Tambahkan ID ke elemen <tr>
        row.innerHTML = `
                    <td>${batch.id}</td>
                    <td>${batch.fileName}</td>
                    <td>${new Date(batch.createdAt).toLocaleString('id-ID')}</td>
                    <td class="actions">
                        <button class="analyze-btn" data-batchid="${batch.id}">▶️ Analisis</button>
                        <button class="results-btn" data-batchid="${
                          batch.id
                        }">📄 Lihat Hasil</button>
                        <button class="delete-btn" data-batchid="${batch.id}">🗑️ Hapus</button>
                    </td>
                `;
        batchBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error fetching batches:', error);
      batchBody.innerHTML = `<tr><td colspan="4">Gagal memuat data batch: ${error.message}</td></tr>`;
    }
  }

  // 2. Fungsi untuk menangani proses upload
  async function handleUpload() {
    const file = csvFileInput.files[0];
    if (!file) {
      uploadStatus.textContent = 'Pilih file terlebih dahulu.';
      return;
    }

    // Validasi tipe file
    if (!file.name.toLowerCase().endsWith('.csv')) {
      uploadStatus.textContent = 'Error: Hanya file CSV yang diperbolehkan.';
      return;
    }

    uploadStatus.textContent = 'Mengunggah...';
    console.log('Starting upload for file:', file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending request to:', `${API_BASE_URL}/upload`);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      // Cek content type response
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await res.text();
        console.error('Non-JSON response:', responseText);
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}`);
      }

      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        throw new Error(data.message || `HTTP ${res.status}: ${data.error || 'Unknown error'}`);
      }

      uploadStatus.textContent = `Sukses! File "${file.name}" telah diunggah.`;
      csvFileInput.value = ''; // Reset input file
      fetchAndDisplayBatches(); // Refresh daftar batch
    } catch (error) {
      console.error('Upload error:', error);
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
          document.getElementById('anomalySummary').innerHTML = '';
          return;
        }
        const responseData = await res.json();
        if (!res.ok) throw new Error(responseData.message);

        // Cek apakah responseData adalah array atau objek
        let anomalies = responseData;
        let totalTransaksi = 0;
        if (Array.isArray(responseData)) {
          anomalies = responseData;
        } else if (responseData && Array.isArray(responseData.anomalies)) {
          anomalies = responseData.anomalies;
          totalTransaksi = responseData.totalTransaksi || 0;
        }

        resultStatus.textContent = `Menampilkan ${anomalies.length} anomali.`;
        displayAnomalies(anomalies, totalTransaksi);
      } catch (error) {
        resultStatus.textContent = `Error mengambil hasil: ${error.message}`;
      }
    }

    // Jika tombol "Hapus" ditekan
    if (target.classList.contains('delete-btn')) {
      if (confirm('Apakah Anda yakin ingin menghapus batch ini?')) {
        try {
          // Perbaiki endpoint: gunakan 'batch' bukan 'batches'
          const res = await fetch(`${API_BASE_URL}/batch/${batchId}`, { method: 'DELETE' });
          if (!res.ok) {
            // Coba ambil pesan error dari JSON, jika gagal fallback ke text
            let errorMsg = 'Gagal menghapus batch.';
            try {
              const data = await res.json();
              errorMsg = data.message || errorMsg;
            } catch {
              const text = await res.text();
              errorMsg = text || errorMsg;
            }
            throw new Error(errorMsg);
          }
          fetchAndDisplayBatches();
          resultsBody.innerHTML = '';
          resultStatus.textContent = 'Batch berhasil dihapus.';
        } catch (error) {
          resultStatus.textContent = `Error menghapus batch: ${error.message}`;
        }
      }
    }
  }

  // --- FUNGSI TAMBAHAN UNTUK SUMMARY DAN SORT ---

  // Variabel global untuk data anomaly dan sort
  let currentAnomalies = [];
  let currentSort = { key: null, asc: true };

  // Fungsi untuk menampilkan summary anomaly
  function showAnomalySummary(anomalies, totalTransaksi) {
    const summaryDiv = document.getElementById('anomalySummary');
    if (!anomalies || anomalies.length === 0) {
      summaryDiv.innerHTML = '';
      return;
    }
    const jumlahAnomali = anomalies.length;
    let tingkat = '';
    let transaksiText = '?';
    if (totalTransaksi && totalTransaksi > 0) {
      tingkat = `(Tingkat Anomali: <strong>${((jumlahAnomali / totalTransaksi) * 100).toFixed(
        2
      )}%</strong>).`;
      transaksiText = totalTransaksi;
    } else {
      tingkat = '<span class="text-secondary">(Total transaksi tidak diketahui)</span>';
    }
    summaryDiv.innerHTML = `
            <div class="status-box status-info" style="display:block;">
                <strong>Ditemukan ${jumlahAnomali} anomali</strong> dari <strong>${transaksiText} transaksi</strong> yang dianalisis<br>
                ${tingkat}<br>
                Menampilkan transaksi paling mencurigakan di atas.
            </div>
        `;
  }

  // Fungsi sort utilitas
  function sortAnomalies(anomalies, key, asc = true) {
    console.log(`Sorting by ${key}, ascending: ${asc}`);

    return anomalies.slice().sort((a, b) => {
      let vA, vB;

      // Map frontend sort key ke property data backend
      switch (key) {
        case 'waktu':
          vA = a.timestamp ? new Date(a.timestamp) : new Date(0);
          vB = b.timestamp ? new Date(b.timestamp) : new Date(0);
          break;
        case 'nominal':
          vA = parseFloat(a.amount) || 0;
          vB = parseFloat(b.amount) || 0;
          break;
        case 'merchant':
          vA = (a.merchant || '').toString();
          vB = (b.merchant || '').toString();
          break;
        case 'lokasi':
          vA = (a.location || '').toString();
          vB = (b.location || '').toString();
          break;
        case 'skor':
          vA = parseFloat(a.anomalyScore) || 0;
          vB = parseFloat(b.anomalyScore) || 0;
          break;
        default:
          vA = a[key] || '';
          vB = b[key] || '';
      }

      // Handle string comparison (case-insensitive)
      if (typeof vA === 'string' && typeof vB === 'string') {
        vA = vA.toLowerCase();
        vB = vB.toLowerCase();
      }

      // Debug log untuk troubleshooting
      if (key === 'waktu') {
        console.log(`Comparing dates: ${vA} vs ${vB}`);
      }

      // Comparison logic
      if (vA < vB) return asc ? -1 : 1;
      if (vA > vB) return asc ? 1 : -1;
      return 0;
    });
  }

  // Event handler untuk sort header
  function handleSortClick(e) {
    const th = e.target.closest('th.sortable');
    if (!th) return;
    const key = th.dataset.sort;
    if (!key) return;

    console.log(`Clicked sort on: ${key}, current sort:`, currentSort);

    // Toggle asc/desc jika klik kolom yang sama
    if (currentSort.key === key) {
      currentSort.asc = !currentSort.asc;
      console.log(`Toggled direction for ${key}, now asc: ${currentSort.asc}`);
    } else {
      currentSort.key = key;
      // Default untuk kolom baru: descending untuk skor/nominal, ascending untuk lainnya
      if (key === 'skor' || key === 'nominal') {
        currentSort.asc = false; // descending (nilai tinggi di atas)
      } else {
        currentSort.asc = true; // ascending (A-Z, waktu lama ke baru)
      }
      console.log(`New sort column ${key}, asc: ${currentSort.asc}`);
    }
    renderAnomalyTable();
    updateSortIcons();
  }

  // Fungsi untuk menambahkan event listener pada header tabel
  function addSortEventListeners() {
    document.querySelectorAll('#resultsTable th.sortable').forEach(th => {
      th.removeEventListener('click', handleSortClick); // Remove existing listeners
      th.addEventListener('click', handleSortClick);
    });
  }

  function updateSortIcons() {
    document.querySelectorAll('#resultsTable th.sortable').forEach(th => {
      const icon = th.querySelector('.sort-icon');
      if (!icon) return;

      th.classList.remove('sorted-asc', 'sorted-desc'); // Remove previous sort classes

      if (th.dataset.sort === currentSort.key) {
        if (currentSort.asc) {
          icon.innerHTML = '<i class="fa fa-caret-up text-primary"></i>';
          th.classList.add('sorted-asc');
        } else {
          icon.innerHTML = '<i class="fa fa-caret-down text-primary"></i>';
          th.classList.add('sorted-desc');
        }
      } else {
        icon.innerHTML = '<i class="fa fa-sort text-muted"></i>';
      }
    });
    console.log(`Updated sort icons, active: ${currentSort.key} (asc: ${currentSort.asc})`);
  }

  // Render ulang tabel anomaly sesuai sort
  function renderAnomalyTable() {
    if (!currentAnomalies) return;
    let sorted = currentAnomalies;
    if (currentSort.key) {
      sorted = sortAnomalies(currentAnomalies, currentSort.key, currentSort.asc);
    }
    resultsBody.innerHTML = '';
    sorted.forEach(anomaly => {
      const row = document.createElement('tr');
      row.className = 'anomaly-row';
      row.innerHTML = `
                <td>${new Date(anomaly.timestamp).toLocaleString('id-ID')}</td>
                <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                  anomaly.amount
                )}</td>
                <td>${anomaly.merchant}</td>
                <td>${anomaly.location}</td>
                <td>${anomaly.anomalyScore.toFixed(4)}</td>
            `;
      resultsBody.appendChild(row);
    });
  }

  // --- MODIFIKASI FUNGSI displayAnomalies ---
  function displayAnomalies(anomalies, totalTransaksi) {
    currentAnomalies = anomalies || [];

    // Reset sort state when displaying new data
    currentSort = { key: null, asc: true };

    showAnomalySummary(currentAnomalies, totalTransaksi);
    renderAnomalyTable();
    updateSortIcons();
    addSortEventListeners(); // Tambahkan event listener setelah tabel dirender

    console.log(`Displayed ${currentAnomalies.length} anomalies`);
  }

  // --- EVENT LISTENERS ---
  uploadBtn.addEventListener('click', handleUpload);
  batchBody.addEventListener('click', handleBatchTableClick); // Satu event listener untuk semua tombol di tabel

  // Muat daftar batch saat halaman pertama kali dibuka
  fetchAndDisplayBatches();
});
