# Fraud Detection System

**AI-based Anomaly Detection System for Financial Fraud Prevention**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D%203.8-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Deskripsi

Sistem Deteksi Fraud adalah aplikasi web berbasis AI yang dirancang untuk mendeteksi transaksi keuangan yang mencurigakan menggunakan teknik machine learning autoencoder. Sistem ini dapat menganalisis data transaksi dalam format CSV dan mengidentifikasi pola anomali yang berpotensi menunjukkan aktivitas penipuan.

### ✨ Fitur Utama

-  **🤖 AI-Powered Detection**: Menggunakan autoencoder neural network untuk deteksi anomali
-  **📊 Batch Processing**: Upload dan analisis file CSV dalam batch
-  **📈 Real-time Analysis**: Analisis transaksi secara real-time
-  **🎯 Dynamic Threshold**: Threshold deteksi yang adaptif berdasarkan distribusi data
-  **💾 Database Integration**: Penyimpanan data menggunakan PostgreSQL dengan Prisma ORM
-  **🖥️ Web Interface**: Interface web yang user-friendly
-  **🔄 RESTful API**: API yang komprehensif untuk integrasi

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Model      │
│   (HTML/JS)     │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Upload UI     │    │ • REST API      │    │ • Autoencoder   │
│ • Results View  │    │ • File Handler  │    │ • Preprocessing │
│ • Batch Mgmt    │    │ • Database      │    │ • Prediction    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       │                 │
                       │ • Transactions  │
                       │ • Upload Batches│
                       └─────────────────┘
```

## 🛠️ Teknologi yang Digunakan

### Backend (Node.js)

-  **Express.js**: Web framework
-  **Prisma**: Database ORM
-  **PostgreSQL**: Database
-  **Multer**: File upload handling
-  **CSV-Parser**: CSV file processing
-  **Axios**: HTTP client untuk komunikasi dengan AI model

### AI Model (Python)

-  **TensorFlow/Keras**: Neural network framework
-  **Flask**: Web API framework
-  **Pandas**: Data manipulation
-  **NumPy**: Numerical computing
-  **Scikit-learn**: Preprocessing utilities
-  **Joblib**: Model serialization

### Frontend

-  **HTML5/CSS3**: Markup dan styling
-  **JavaScript (Vanilla)**: Client-side logic
-  **Bootstrap 5**: UI framework
-  **Font Awesome**: Icons

## 📁 Struktur Proyek

```
fraud-detector/
├── backend/                    # Backend Node.js application
│   ├── index.js               # Main server file
│   ├── package.json           # Dependencies
│   ├── lib/
│   │   └── prisma.js         # Prisma client configuration
│   ├── routes/
│   │   ├── transaction.js    # Transaction routes
│   │   └── frontendRoutes.js # Frontend routes
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   └── uploads/              # Temporary file storage
│
├── frontend/                  # Frontend web application
│   ├── pages/
│   │   └── index.html        # Main page
│   ├── css/
│   │   └── style.css         # Custom styles
│   └── js/
│       └── script.js         # Frontend JavaScript
│
├── model/                     # AI/ML Python components
│   ├── app.py                # Flask API server
│   ├── train.py              # Model training script
│   ├── autoencoder_model.keras # Trained model
│   ├── preprocessor_pipeline.joblib # Data preprocessor
│   └── data/                 # Training datasets
│
└── README.md                 # Dokumentasi proyek
```

## 🚀 Instalasi dan Setup

### Prasyarat

-  Node.js (>= 16.0.0)
-  Python (>= 3.8)
-  PostgreSQL (>= 12)
-  npm atau yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd fraud-detector
```

### 2. Setup Backend

```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi database Anda

# Setup database
npx prisma migrate dev
npx prisma generate
```

### 3. Setup AI Model

```bash
cd model
pip install -r requirements.txt

# Train model (opsional - model sudah terlatih)
python train.py

# Start AI service
python app.py
```

### 4. Start Backend Server

```bash
cd backend
npm start
# atau untuk development
npm run dev
```

### 5. Akses Aplikasi

Buka browser dan akses: `http://localhost:3000`

## 📊 Database Schema

### Transaction Model

```prisma
model Transaction {
  id            String   @id @default(cuid())
  amount        Float    // Jumlah transaksi
  timestamp     DateTime // Waktu transaksi
  merchant      String   // Nama merchant
  location      String   // Lokasi transaksi
  isAnomaly     Boolean? @default(false) // Status anomali
  anomalyScore  Float?   // Skor anomali dari AI
  uploadBatchId String?  // Relasi ke batch upload
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### UploadBatch Model

```prisma
model UploadBatch {
  id           String        @id @default(cuid())
  fileName     String        // Nama file yang diupload
  status       BatchStatus   @default(PENDING)
  createdAt    DateTime      @default(now())
  transactions Transaction[] // Relasi ke transaksi
}
```

## 🔗 API Documentation

### Base URL

```
http://localhost:3000/api/transactions
```

### Endpoints

#### 1. Upload CSV File

```http
POST /upload
Content-Type: multipart/form-data

Body:
- file: CSV file

Response:
{
  "message": "File berhasil diunggah.",
  "batch": {
    "id": "batch-id",
    "fileName": "filename.csv",
    "status": "COMPLETED"
  }
}
```

#### 2. Analyze Batch

```http
POST /analyze/:batchId

Response:
{
  "message": "Analisis berhasil diselesaikan.",
  "batchId": "batch-id",
  "results": [...]
}
```

#### 3. Get Anomalies

```http
GET /anomalies/:batchId

Response:
[
  {
    "id": "transaction-id",
    "amount": 1500.00,
    "timestamp": "2025-06-30T10:00:00Z",
    "merchant": "Unknown Merchant",
    "location": "Remote",
    "isAnomaly": true,
    "anomalyScore": 0.8542
  }
]
```

#### 4. Get All Batches

```http
GET /batches

Response:
[
  {
    "id": "batch-id",
    "fileName": "transactions.csv",
    "status": "COMPLETED",
    "createdAt": "2025-06-30T10:00:00Z"
  }
]
```

#### 5. Delete Batch

```http
DELETE /batch/:batchId

Response:
{
  "message": "Batch berhasil dihapus.",
  "deletedTransactionsCount": 150,
  "deletedBatchInfo": {...}
}
```

## 🤖 AI Model Details

### Model Architecture

-  **Type**: Autoencoder Neural Network
-  **Purpose**: Unsupervised anomaly detection
-  **Features**: [amount, user_id, hour, merchant, location]
-  **Preprocessing**: StandardScaler + OneHotEncoder
-  **Threshold**: Dynamic (95th percentile)

### Data Format

#### Input CSV Format:

```csv
TransactionAmount,TransactionDate,MerchantID,Location,AccountID
100.50,2025-06-30T14:30:00Z,Amazon,Online,123
25.00,2025-06-30T15:45:00Z,Starbucks,New York,456
```

#### API Prediction Format:

```json
{
   "transactions": [
      {
         "id": "1",
         "amount": 100.5,
         "timestamp": "2025-06-30T14:30:00Z",
         "merchant": "Amazon",
         "location": "Online"
      }
   ]
}
```

### Model Endpoints

#### Health Check

```http
GET http://localhost:5000/health
```

#### Predict Anomalies

```http
POST http://localhost:5000/predict
Content-Type: application/json
```

#### Test Format

```http
GET http://localhost:5000/test-format
```

## 💡 Cara Penggunaan

### 1. Upload Data Transaksi

1. Buka aplikasi di browser
2. Klik "Choose File" dan pilih file CSV
3. Klik "Unggah File"
4. File akan diproses dan muncul di tabel batch

### 2. Analisis Transaksi

1. Pada tabel batch, klik tombol "▶️ Analisis"
2. Sistem akan mengirim data ke AI model
3. Tunggu hingga analisis selesai

### 3. Lihat Hasil

1. Klik tombol "📄 Lihat Hasil"
2. Anomali akan ditampilkan di tabel bawah
3. Setiap anomali menunjukkan skor risiko

### 4. Kelola Batch

1. Gunakan tombol "🗑️ Hapus" untuk menghapus batch
2. Semua transaksi dalam batch juga akan terhapus

## ⚙️ Konfigurasi

### Environment Variables (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fraud_detection"

# Server
PORT=3000
NODE_ENV=development

# AI Model
AI_MODEL_URL=http://localhost:5000
```

### CSV Column Mapping

Sistem mendukung berbagai format kolom CSV:

```javascript
const MAPPER_CONFIG = {
   amount: ["transactionamount", "amount", "jumlah", "TransactionAmount"],
   timestamp: ["transactiondate", "timestamp", "waktu", "TransactionDate"],
   merchant: ["merchantid", "merchant", "MerchantID"],
   location: ["location", "Location"],
   user_id: ["accountid", "user_id", "userid", "AccountID"],
};
```

## 🧪 Testing

### Manual Testing

1. **Upload Test**: Upload file CSV sample
2. **Analysis Test**: Jalankan analisis pada batch
3. **API Test**: Test endpoints menggunakan Postman/curl

### Sample Data

File sample tersedia di `model/data/`:

-  `transactions_realistic_multi_feature.csv`
-  `bank_transactions_data_2.csv`

## 🛡️ Security Considerations

-  **File Validation**: Hanya file CSV yang diperbolehkan
-  **Input Sanitization**: Data input dibersihkan sebelum processing
-  **Error Handling**: Error handling yang komprehensif
-  **CORS**: Konfigurasi CORS untuk web security

## 📈 Performance & Scalability

-  **Batch Processing**: Mendukung file CSV berukuran besar
-  **Database Indexing**: Index pada kolom yang sering diquery
-  **Async Processing**: Processing asinkron untuk performa optimal
-  **Memory Management**: Efficient memory usage untuk large datasets

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error

```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify connection string in .env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

#### 2. AI Model Not Loading

```bash
# Check if model files exist
ls model/*.keras model/*.joblib

# Retrain model if needed
cd model && python train.py
```

#### 3. CSV Upload Fails

-  Pastikan format CSV sesuai
-  Check column headers mapping
-  Verify file size tidak terlalu besar

#### 4. Port Already in Use

```bash
# Kill process on port 3000
sudo kill -9 $(sudo lsof -t -i:3000)

# Or change port in .env
PORT=3001
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📄 License

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 👥 Team

-  **Backend Developer**: Express.js, Prisma, Database Design
-  **AI/ML Engineer**: TensorFlow, Model Training, API Development
-  **Frontend Developer**: HTML/CSS/JS, UI/UX Design

## 📧 Contact

Untuk pertanyaan atau dukungan, silakan hubungi:

-  Email: team@frauddetection.com
-  GitHub Issues: [Create Issue](https://github.com/username/fraud-detector/issues)

---

**Made with ❤️ for BI Hackathon 2025**
