# Fraud Detection System

**AI-based Anomaly Detection System for Financial Fraud Prevention**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D%203.8-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **⚡ Quick Start**: Clone repo → Setup .env → `npm install` → `python app.py` → `npm start` → Open http://localhost:3001

## 📚 Table of Contents

- [📋 Deskripsi](#-deskripsi)
- [✨ Fitur Utama](#-fitur-utama)
- [🏗️ Arsitektur Sistem](#️-arsitektur-sistem)
- [🛠️ Teknologi yang Digunakan](#️-teknologi-yang-digunakan)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🚀 Instalasi dan Setup](#-instalasi-dan-setup)
- [📊 Database Schema](#-database-schema)
- [🔗 API Documentation](#-api-documentation)
- [🤖 AI Model Details](#-ai-model-details)
- [💡 Cara Penggunaan](#-cara-penggunaan)
- [⚙️ Konfigurasi](#️-konfigurasi)
- [🧪 Testing](#-testing)
- [🛡️ Security](#️-security-considerations)
- [🔧 Troubleshooting](#-troubleshooting)
- [📈 Performance](#-performance--scalability)
- [🤝 Contributing](#-contributing)
- [🚀 Deployment](#-deployment-guide)
- [📧 Contact & Support](#-contact--support)

---

## �📋 Deskripsi

Sistem Deteksi Fraud adalah aplikasi web full-stack berbasis AI yang dirancang untuk mendeteksi transaksi keuangan yang mencurigakan menggunakan teknik machine learning autoencoder. Sistem ini dilengkapi dengan autentikasi pengguna yang lengkap, manajemen batch upload, dan dapat menganalisis data transaksi dalam format CSV untuk mengidentifikasi pola anomali yang berpotensi menunjukkan aktivitas penipuan.

### ✨ Fitur Utama

- **🔐 User Authentication**: Sistem login/register dengan JWT dan Google OAuth 2.0
- **👤 User Management**: Manajemen pengguna dengan hashing password (bcrypt)
- **🤖 AI-Powered Detection**: Menggunakan autoencoder neural network untuk deteksi anomali
- **📊 Batch Processing**: Upload dan analisis file CSV dalam batch per user
- **📈 Real-time Analysis**: Analisis transaksi secara real-time dengan komunikasi Flask API
- **🎯 Dynamic Threshold**: Threshold deteksi yang adaptif berdasarkan distribusi data (95th percentile)
- **💾 Database Integration**: Penyimpanan data relasional menggunakan PostgreSQL dengan Prisma ORM
- **🖥️ Modern Web Interface**: Interface web responsive dengan Bootstrap 5
- **🔄 RESTful API**: API yang komprehensif dengan middleware proteksi
- **🌐 OAuth Integration**: Login dengan Google untuk kemudahan akses

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Model      │
│   (HTML/JS)     │◄──►│   (Node.js)     │◄──►│   (Python)      │
│                 │    │                 │    │                 │
│ • Auth Pages    │    │ • JWT Auth      │    │ • Autoencoder   │
│ • Upload UI     │    │ • REST API      │    │ • Preprocessing │
│ • Results View  │    │ • File Handler  │    │ • Prediction    │
│ • User Mgmt     │    │ • User Session  │    │ • Flask API     │
│ • OAuth Flow    │    │ • Middleware    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       │                 │
                       │ • Users         │
                       │ • Transactions  │
                       │ • Upload Batches│
                       │ • User Relations│
                       └─────────────────┘
```

## 🛠️ Teknologi yang Digunakan

### Backend (Node.js)

- **Express.js**: Web framework
- **Prisma**: Database ORM dengan generated client
- **PostgreSQL**: Database relasional
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing dan security
- **Passport.js**: Authentication middleware dengan Google OAuth
- **Multer**: File upload handling
- **CSV-Parser**: CSV file processing
- **Axios**: HTTP client untuk komunikasi dengan AI model
- **CORS**: Cross-origin resource sharing

### AI Model (Python)

- **TensorFlow/Keras**: Neural network framework untuk autoencoder
- **Flask**: Lightweight web API framework
- **Flask-CORS**: CORS support untuk Flask
- **Pandas**: Data manipulation dan analysis
- **NumPy**: Numerical computing
- **Scikit-learn**: Preprocessing utilities (StandardScaler, OneHotEncoder)
- **Joblib**: Model serialization dan loading

### Frontend

- **HTML5/CSS3**: Modern markup dan styling
- **JavaScript (Vanilla)**: Client-side logic dan DOM manipulation
- **Bootstrap 5**: Modern CSS framework untuk responsive design
- **Font Awesome**: Comprehensive icon library
- **Fetch API**: Modern HTTP client untuk browser

### Authentication & Security

- **JWT (JSON Web Tokens)**: Stateless authentication
- **Google OAuth 2.0**: Third-party authentication
- **bcrypt**: Password hashing dengan salt
- **Middleware Protection**: Route-level security

## 📁 Struktur Proyek

```
fraud-detector/
├── backend/                    # Backend Node.js application
│   ├── index.js               # Main server file dengan auth setup
│   ├── package.json           # Dependencies dengan auth packages
│   ├── lib/
│   │   └── prisma.js         # Prisma client configuration
│   ├── controllers/
│   │   └── authController.js # Authentication logic (register/login)
│   ├── middleware/
│   │   └── authMiddleware.js # JWT protection middleware
│   ├── config/
│   │   └── passport-setup.js # Google OAuth configuration
│   ├── routes/
│   │   ├── authRoutes.js     # Authentication routes
│   │   ├── transactionRoutes.js # Protected transaction routes
│   │   └── frontendRoutes.js # Frontend page routes
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema dengan User model
│   │   └── migrations/       # Database migrations
│   └── uploads/              # Temporary file storage
│
├── frontend/                  # Frontend web application
│   ├── pages/
│   │   ├── login.html        # Login page
│   │   ├── register.html     # Registration page
│   │   ├── auth-success.html # OAuth success page
│   │   └── index.html        # Main dashboard (protected)
│   ├── css/
│   │   └── style.css         # Custom styles
│   └── js/
│       ├── authApp.js        # Authentication JavaScript
│       └── script.js         # Main dashboard JavaScript
│
├── model/                     # AI/ML Python components
│   ├── app.py                # Flask API server
│   ├── train.py              # Model training script
│   ├── autoencoder_model.keras # Trained model file
│   ├── preprocessor_pipeline.joblib # Data preprocessor
│   └── data/                 # Training datasets
│
└── README.md                 # Comprehensive documentation
```

## 🚀 Instalasi dan Setup

### Prasyarat

- Node.js (>= 16.0.0)
- Python (>= 3.8)
- PostgreSQL (>= 12)
- npm atau yarn
- Google Developer Console account (untuk OAuth)

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
# Edit .env dengan konfigurasi berikut:
```

#### Environment Variables (.env)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fraud_detection"

# Server
PORT=3001
NODE_ENV=development

# JWT Secret (generate random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Google OAuth (dari Google Developer Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Model
AI_MODEL_URL=http://localhost:5000
```

#### Database Setup

```bash
# Generate Prisma client dan jalankan migrations
npx prisma migrate dev
npx prisma generate
```

### 3. Setup AI Model

```bash
cd ../model

# Install Python dependencies
pip install flask flask-cors pandas numpy scikit-learn joblib tensorflow

# Train model (opsional - model sudah terlatih)
python train.py

# Start AI service
python app.py
```

### 4. Setup Google OAuth (Opsional)

1. Buka [Google Developer Console](https://console.developers.google.com/)
2. Buat project baru atau pilih existing project
3. Enable Google+ API
4. Buat OAuth 2.0 credentials
5. Set authorized redirect URIs: `http://localhost:3001/auth/google/callback`
6. Copy Client ID dan Secret ke file .env

### 5. Start Backend Server

```bash
cd ../backend
npm start
# atau untuk development dengan auto-reload
npm run dev
```

### 6. Akses Aplikasi

- Buka browser dan akses: `http://localhost:3001`
- Akan redirect ke halaman login
- Register akun baru atau login dengan Google

## 📊 Database Schema

### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // Hashed dengan bcrypt
  googleId  String?  @unique // Optional untuk Google OAuth
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relasi: User memiliki banyak upload batches
  uploadBatches UploadBatch[]
}
```

### UploadBatch Model

```prisma
model UploadBatch {
  id           String        @id @default(cuid())
  fileName     String        // Nama file yang diupload
  status       BatchStatus   @default(PENDING) // PENDING, COMPLETED, FAILED
  createdAt    DateTime      @default(now())

  // Relasi dengan User (Many-to-One)
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Relasi: Batch memiliki banyak transaksi (One-to-Many)
  transactions Transaction[]
}
```

### Transaction Model

```prisma
model Transaction {
  id            String   @id @default(cuid())
  amount        Float    // Jumlah transaksi
  timestamp     DateTime // Waktu transaksi
  merchant      String   // Nama merchant
  location      String   // Lokasi transaksi
  isAnomaly     Boolean? @default(false) // Status anomali dari AI
  anomalyScore  Float?   // Skor risiko dari model AI (0.0 - 1.0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relasi dengan UploadBatch (Many-to-One)
  UploadBatch   UploadBatch? @relation(fields: [uploadBatchId], references: [id])
  uploadBatchId String?
}
```

### BatchStatus Enum

```prisma
enum BatchStatus {
  PENDING   // Upload selesai, belum dianalisis
  COMPLETED // Analisis selesai
  FAILED    // Error saat processing
}
```

## 🔗 API Documentation

### Base URL

```
http://localhost:3001
```

### Authentication Endpoints

#### 1. Register User

```http
POST /auth/register
Content-Type: application/json

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-06-30T10:00:00Z"
  }
}
```

#### 2. Login User

```http
POST /auth/login
Content-Type: application/json

Body:
{
  "email": "john@example.com",
  "password": "securepassword"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get Current User

```http
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "id": "user-id",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-06-30T10:00:00Z"
}
```

#### 4. Google OAuth

```http
GET /auth/google
# Redirects to Google OAuth consent screen

GET /auth/google/callback
# Google callback URL, redirects to frontend with token
```

### Transaction Endpoints (Protected)

**Note**: Semua endpoint ini membutuhkan `Authorization: Bearer <token>` header

#### 1. Upload CSV File

```http
POST /api/transactions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: CSV file

Response:
{
  "message": "File berhasil diunggah.",
  "batch": {
    "id": "batch-id",
    "fileName": "transactions.csv",
    "status": "COMPLETED",
    "userId": "user-id"
  }
}
```

#### 2. Analyze Batch

```http
POST /api/transactions/analyze/:batchId
Authorization: Bearer <token>

Response:
{
  "message": "Analisis berhasil diselesaikan.",
  "batchId": "batch-id",
  "results": [...]
}
```

#### 3. Get User's Batches

```http
GET /api/transactions/batches
Authorization: Bearer <token>

Response:
[
  {
    "id": "batch-id",
    "fileName": "transactions.csv",
    "status": "COMPLETED",
    "createdAt": "2025-06-30T10:00:00Z",
    "userId": "user-id"
  }
]
```

#### 4. Get Anomalies from Batch

```http
GET /api/transactions/anomalies/:batchId
Authorization: Bearer <token>

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

#### 5. Delete Batch

```http
DELETE /api/transactions/batch/:batchId
Authorization: Bearer <token>

Response:
{
  "message": "Batch berhasil dihapus.",
  "deletedTransactionsCount": 150,
  "deletedBatchInfo": {...}
}
```

## 🤖 AI Model Details

### Model Architecture

- **Type**: Autoencoder Neural Network
- **Purpose**: Unsupervised anomaly detection
- **Features**: [amount, user_id, hour, merchant, location]
- **Preprocessing**: StandardScaler + OneHotEncoder
- **Threshold**: Dynamic (95th percentile)

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

### 1. Registrasi dan Login

#### Registrasi Manual

1. Buka aplikasi di browser (`http://localhost:3001`)
2. Klik "Register" pada halaman login
3. Isi form registrasi (nama, email, password)
4. Klik "Register" - akan redirect ke halaman login

#### Login Manual

1. Masukkan email dan password yang telah didaftarkan
2. Klik "Login"
3. Akan mendapat JWT token dan redirect ke dashboard

#### Login dengan Google OAuth

1. Klik "Login dengan Google" pada halaman login
2. Pilih akun Google Anda
3. Berikan permission yang diminta
4. Akan otomatis membuat akun dan login ke dashboard

### 2. Upload Data Transaksi

1. Setelah login, Anda akan masuk ke dashboard utama
2. Pada section "Unggah File Transaksi Baru":
   - Klik "Choose File" dan pilih file CSV
   - Pastikan format CSV sesuai dengan template
   - Klik "Unggah File"
3. File akan diproses dan muncul di tabel "Dashboard Batch Upload"
4. Status akan berubah dari PENDING ke COMPLETED

### 3. Analisis Transaksi

1. Pada tabel batch, cari batch yang ingin dianalisis
2. Klik tombol "▶️ Analisis" pada baris batch tersebut
3. Sistem akan mengirim data ke AI model untuk processing
4. Tunggu hingga muncul pesan "Analisis selesai"
5. Proses ini akan mengupdate database dengan hasil anomali

### 4. Melihat Hasil Deteksi

1. Setelah analisis selesai, klik tombol "📄 Lihat Hasil"
2. Anomali akan ditampilkan di tabel "Hasil Deteksi Anomali"
3. Setiap anomali menunjukkan:
   - Timestamp transaksi
   - Jumlah transaksi (dalam Rupiah)
   - Merchant dan lokasi
   - Skor anomali (semakin tinggi = semakin mencurigakan)

### 5. Manajemen Batch

1. **Melihat History**: Semua batch upload Anda tersimpan per user
2. **Menghapus Batch**: Klik tombol "🗑️ Hapus" untuk menghapus batch
   - Konfirmasi akan muncul sebelum penghapusan
   - Semua transaksi dalam batch juga akan terhapus
3. **Filter per User**: Hanya batch milik user yang login yang ditampilkan

### 6. Logout

1. Klik tombol logout untuk keluar dari sistem
2. JWT token akan dihapus dari browser
3. Akan redirect kembali ke halaman login

## ⚙️ Konfigurasi

### Environment Variables (.env)

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fraud_detection"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-here-make-it-very-long-and-random"

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Model Configuration
AI_MODEL_URL=http://localhost:5000
```

### CSV Column Mapping

Sistem mendukung berbagai format kolom CSV dengan mapping otomatis:

```javascript
const MAPPER_CONFIG = {
  amount: ['transactionamount', 'amount', 'jumlah', 'nilai', 'TransactionAmount'],
  timestamp: ['transactiondate', 'timestamp', 'waktu', 'TransactionDate'],
  merchant: ['merchantid', 'merchant', 'MerchantID'],
  location: ['location', 'Location'],
  user_id: ['accountid', 'user_id', 'userid', 'AccountID'],
};
```

### Supported CSV Formats

#### Format 1: English Headers

```csv
TransactionAmount,TransactionDate,MerchantID,Location,AccountID
100.50,2025-06-30T14:30:00Z,Amazon,Online,123
25.00,2025-06-30T15:45:00Z,Starbucks,New York,456
```

#### Format 2: Indonesian Headers

```csv
jumlah,waktu,merchant,Location,userid
100500,2025-06-30 14:30:00,Amazon,Online,123
25000,2025-06-30 15:45:00,Starbucks,New York,456
```

### Security Configuration

#### Password Requirements

- Minimum 6 karakter
- Akan di-hash menggunakan bcrypt dengan salt rounds 10
- Stored securely di database

#### JWT Configuration

- Token expires dalam 1 jam
- Payload berisi: id, email, name
- Secret key harus random dan panjang

#### Google OAuth Setup

1. **Google Developer Console**:
   - Buat project baru
   - Enable Google+ API
   - Buat OAuth 2.0 credentials
2. **Authorized URLs**:

   - Origin: `http://localhost:3001`
   - Redirect URI: `http://localhost:3001/auth/google/callback`

3. **Scopes yang diminta**:
   - `profile`: Akses nama dan foto profil
   - `email`: Akses alamat email

## 🧪 Testing

<details>
<summary><strong>Click to expand testing guide</strong></summary>

### 1. Authentication Testing

#### Manual Registration/Login

```bash
# Test Registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass"}'

# Test Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test Protected Route
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Google OAuth Testing

1. Buka `http://localhost:3001/auth/google` di browser
2. Login dengan akun Google
3. Verify redirect ke `auth-success.html` dengan token

### 2. File Upload Testing

```bash
# Test CSV Upload (dengan token)
curl -X POST http://localhost:3001/api/transactions/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sample_transactions.csv"
```

### 3. API Integration Testing

```bash
# Test Get User Batches
curl -X GET http://localhost:3001/api/transactions/batches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Analyze Batch
curl -X POST http://localhost:3001/api/transactions/analyze/BATCH_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test Get Anomalies
curl -X GET http://localhost:3001/api/transactions/anomalies/BATCH_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. AI Model Testing

```bash
# Test AI Model Health
curl http://localhost:5000/health

# Test AI Model Format
curl http://localhost:5000/test-format

# Test AI Prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"transactions":[{"id":"1","amount":1500.00,"merchant":"Unknown","location":"Remote"}]}'
```

### Sample Test Data

File sample tersedia di `model/data/`:

- `transactions_realistic_multi_feature.csv` - Dataset realistis dengan berbagai fitur
- `bank_transactions_data_2.csv` - Data transaksi bank
- `transactions_large.csv` - Dataset besar untuk testing performa

### Test Scenarios

#### Positive Test Cases

1. ✅ User registration dengan data valid
2. ✅ Login dengan credentials yang benar
3. ✅ Google OAuth flow lengkap
4. ✅ Upload CSV dengan format yang benar
5. ✅ Analisis batch dengan data normal
6. ✅ Deteksi anomali pada transaksi mencurigakan

#### Negative Test Cases

1. ❌ Registration dengan email yang sudah ada
2. ❌ Login dengan password salah
3. ❌ Akses protected route tanpa token
4. ❌ Upload file non-CSV
5. ❌ Analisis batch yang tidak ada
6. ❌ Akses batch milik user lain

</details>

## 🛡️ Security Considerations

### Authentication Security

- **JWT Tokens**: Stateless authentication dengan expiration (1 jam)
- **Password Hashing**: bcrypt dengan salt rounds 10 untuk keamanan password
- **Google OAuth**: Third-party authentication dengan scope terbatas
- **Route Protection**: Middleware JWT untuk semua protected endpoints
- **User Isolation**: Setiap user hanya dapat mengakses data miliknya

### Data Security

- **Input Validation**: Validasi file CSV dan data input
- **SQL Injection Prevention**: Prisma ORM memberikan protection otomatis
- **File Upload Security**: Validasi tipe file dan temporary storage
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Sensitive data disimpan di .env

### API Security

- **Rate Limiting**: Perlu diimplementasi untuk production
- **HTTPS**: Disarankan untuk production deployment
- **Input Sanitization**: Data cleaning sebelum database storage
- **Error Handling**: Comprehensive error handling tanpa data exposure
- **Authorization**: User-based data access control

### Database Security

- **Connection Security**: Encrypted database connections
- **User Separation**: Data isolation per user dengan foreign keys
- **Cascade Deletion**: Automatic cleanup saat user dihapus
- **Data Types**: Proper typing untuk semua fields
- **Indexes**: Performance optimization tanpa security compromise

## 📈 Performance & Scalability

- **Batch Processing**: Mendukung file CSV berukuran besar
- **Database Indexing**: Index pada kolom yang sering diquery
- **Async Processing**: Processing asinkron untuk performa optimal
- **Memory Management**: Efficient memory usage untuk large datasets

## 🔧 Troubleshooting

<details>
<summary><strong>Click to expand troubleshooting guide</strong></summary>

### Common Issues

#### 1. Authentication Issues

```bash
# JWT Token expired
Error: "Not authorized, token failed"
Solution: Login ulang untuk mendapat token baru

# Google OAuth error
Error: "Error 400: redirect_uri_mismatch"
Solution: Periksa Google Console redirect URI settings
Pastikan: http://localhost:3001/auth/google/callback

# User already exists
Error: "User already exists"
Solution: Gunakan email lain atau login dengan akun existing
```

#### 2. Database Connection Errors

```bash
# PostgreSQL not running
Error: "getaddrinfo ENOTFOUND localhost"
Solution:
sudo systemctl start postgresql
sudo systemctl status postgresql

# Wrong connection string
Error: "password authentication failed"
Solution: Verify .env DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Missing database
Error: "database does not exist"
Solution: Create database manually
sudo -u postgres createdb fraud_detection
```

#### 3. AI Model Issues

```bash
# Model files missing
Error: "Gagal memuat model"
Solution:
cd model
python train.py  # Retrain model
ls *.keras *.joblib  # Verify files exist

# Python dependencies
Error: "ModuleNotFoundError: No module named 'tensorflow'"
Solution:
pip install tensorflow flask flask-cors pandas numpy scikit-learn joblib

# AI service not running
Error: "connect ECONNREFUSED 127.0.0.1:5000"
Solution:
cd model && python app.py
```

#### 4. File Upload Issues

```bash
# File format error
Error: "Hanya file CSV yang diperbolehkan"
Solution: Pastikan file berekstensi .csv dan format benar

# CSV parsing error
Error: "Gagal memproses file"
Solution:
- Check CSV column headers sesuai mapping
- Pastikan encoding UTF-8
- Verify data types (amount harus numeric)

# Large file timeout
Error: Request timeout
Solution: Increase upload limits atau bagi file menjadi chunks kecil
```

#### 5. Port Issues

```bash
# Port already in use - Backend
Error: "listen EADDRINUSE :::3001"
Solution:
sudo kill -9 $(sudo lsof -t -i:3001)
# Or change PORT in .env

# Port already in use - AI Model
Error: "Address already in use: 5000"
Solution:
sudo kill -9 $(sudo lsof -t -i:5000)
# Or change port in model/app.py
```

#### 6. Frontend Issues

```bash
# CORS error
Error: "blocked by CORS policy"
Solution: Verify backend CORS configuration allows frontend origin

# Token not found
Error: "No token found"
Solution: Check localStorage atau login ulang

# API endpoint error
Error: "404 Not Found"
Solution: Verify API base URL di frontend (http://localhost:3001)
```

### Performance Issues

#### Slow CSV Processing

- **Cause**: File terlalu besar
- **Solution**:
  - Bagi file menjadi chunks < 10MB
  - Implement streaming processing
  - Add progress indicators

#### Slow AI Prediction

- **Cause**: Model loading atau data preprocessing
- **Solution**:
  - Keep AI service running (don't restart)
  - Optimize preprocessing pipeline
  - Consider model quantization

#### Database Query Slow

- **Cause**: Missing indexes atau large datasets
- **Solution**:
  - Add database indexes
  - Implement pagination
  - Optimize Prisma queries

### Development Tips

#### Hot Reload Setup

```bash
# Backend with nodemon
npm run dev

# AI model with auto-reload
pip install watchdog
# Add file watching to app.py
```

#### Debug Mode

```bash
# Enable debug logs
NODE_ENV=development
DEBUG=true

# Python debug mode
export FLASK_DEBUG=1
python app.py
```

#### Database Reset

```bash
# Reset database if needed
npx prisma migrate reset
npx prisma db push
```

</details>

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📄 License

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## 👥 Development Team

- **Full-Stack Developer**: Express.js, Prisma, Database Design, Authentication System
- **AI/ML Engineer**: TensorFlow, Autoencoder Training, Flask API Development
- **Frontend Developer**: HTML/CSS/JS, Bootstrap UI/UX, OAuth Integration
- **DevOps Engineer**: Database Management, System Architecture, Deployment

## � Deployment Guide

### Production Deployment Checklist

#### Environment Setup

- [ ] Setup production PostgreSQL database
- [ ] Configure production environment variables
- [ ] Setup Google OAuth production credentials
- [ ] Generate secure JWT secrets
- [ ] Configure HTTPS certificates

#### Backend Deployment

```bash
# Production build
npm install --production
npm run build  # if build script exists

# Environment variables
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret-very-long"
GOOGLE_CLIENT_ID="production-client-id"
GOOGLE_CLIENT_SECRET="production-secret"
```

#### AI Model Deployment

```bash
# Production Python setup
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Docker deployment (recommended)
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

#### Database Migration

```bash
# Production migration
npx prisma migrate deploy
npx prisma generate
```

## 📊 System Metrics & Monitoring

### Key Performance Indicators

- **Response Time**: API endpoints < 500ms
- **Throughput**: Support 100+ concurrent users
- **Accuracy**: AI model detection rate > 90%
- **Uptime**: 99.9% availability target

### Monitoring Setup

```bash
# Add logging middleware
npm install winston morgan

# Health check endpoints
GET /health
GET /api/health
GET /auth/health
```

## 📧 Contact & Support

### Technical Support

Untuk pertanyaan teknis atau dukungan:

- **Email**: tech@frauddetection.com
- **GitHub Issues**: [Create Issue](https://github.com/username/fraud-detector/issues)
- **Documentation**: [Wiki Pages](https://github.com/username/fraud-detector/wiki)

### Business Inquiries

- **Email**: business@frauddetection.com
- **LinkedIn**: [Company Page](https://linkedin.com/company/fraud-detector)

### Community

- **Discord**: [Join Community](https://discord.gg/fraud-detector)
- **Stack Overflow**: Tag `fraud-detection-ai`

## 🔄 Version History

### v1.0.0 (Current)

- ✅ Complete authentication system (JWT + Google OAuth)
- ✅ User management dengan database relational
- ✅ AI-powered anomaly detection
- ✅ Batch processing system
- ✅ Modern responsive web interface
- ✅ Protected API endpoints
- ✅ Comprehensive error handling

### Roadmap v2.0.0

- 🔄 Real-time notifications
- 🔄 Advanced analytics dashboard
- 🔄 Multi-model AI ensemble
- 🔄 API rate limiting
- 🔄 Advanced user roles
- 🔄 Export functionality
- 🔄 Mobile responsive optimization

---

**Made with ❤️ for BI Hackathon 2025**

_"Detecting fraud with the power of AI and modern web technologies"_
