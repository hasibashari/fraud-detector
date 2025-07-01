# Fraud Detection System

**🎯 Production-Ready AI-based Anomaly Detection System for Financial Fraud Prevention**

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D%203.8-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TensorFlow](https://img.shields.io/badge/tensorflow-%3E%3D%202.15.0-orange.svg)
![Google AI](https://img.shields.io/badge/Google%20Gemini-AI%20Powered-green.svg)
![Security](https://img.shields.io/badge/security-Enterprise%20Level-red.svg)
![Testing](https://img.shields.io/badge/testing-Comprehensive-green.svg)

> **⚡ Quick Start**: Clone repo → Setup .env (include GEMINI_API_KEY) → `./start-dev.sh` → Open http://localhost:3001

> **� FINAL RELEASE v2.1**: Complete enterprise-grade fraud detection system with advanced AI capabilities, comprehensive testing, and production-ready architecture

> **✨ Highlights**: Hybrid AI approach (Custom ML + Google Gemini), Interactive AI Chat, Real-time analysis, Enterprise security, Modern responsive design

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

## 📋 Deskripsi

**Fraud Detection System** adalah aplikasi web full-stack berbasis AI yang dirancang secara enterprise-grade untuk mendeteksi transaksi keuangan yang mencurigakan menggunakan teknik machine learning dan AI terdepan. Sistem ini mengintegrasikan custom autoencoder neural network dengan Google Gemini AI untuk memberikan analisis fraud yang komprehensif dan actionable insights.

### ✨ Fitur Utama - Enterprise Grade

- **🔐 Enterprise Authentication**: Sistem login/register dengan JWT dan Google OAuth 2.0 + enterprise security
- **👤 Advanced User Management**: Manajemen pengguna dengan bcrypt hashing dan role-based access
- **🤖 Hybrid AI Detection**: Custom autoencoder + Google Gemini 2.5 Flash untuk deteksi dan analisis
- **🧠 Interactive AI Analyst**: Chat real-time dengan AI fraud analyst untuk konsultasi mendalam
- **💼 Professional AI Chat**: Dedicated AI interface dengan context-aware responses
- **📊 Intelligent Batch Processing**: Upload dan analisis CSV dengan advanced field mapping
- **📈 Real-time Analysis**: Analisis transaksi instant dengan komunikasi Flask API
- **🎯 Dynamic Risk Scoring**: Threshold adaptif dengan 95th percentile + custom risk metrics
- **💾 Enterprise Database**: PostgreSQL dengan Prisma ORM untuk data integrity dan performance
- **🖥️ Modern Responsive UI**: Tailwind CSS dengan modular architecture dan mobile optimization
- **🔄 Production APIs**: 25+ RESTful endpoints dengan comprehensive middleware protection
- **🌐 Seamless OAuth**: Google integration dengan scope management dan security best practices
- **📱 Cross-Platform**: Optimized untuk desktop, tablet, dan mobile devices
- **🛡️ Enterprise Security**: Multi-layer security dengan input validation, CORS, dan data encryption
- **📊 Advanced Analytics**: Deep analysis reports dengan pattern recognition dan recommendations
- **🔍 Smart Monitoring**: Automated fraud pattern detection dengan actionable alerts
- **⚡ High Performance**: Optimized queries, caching, dan efficient data processing
- **🧪 Quality Assurance**: Comprehensive testing suite dengan 5 testing scripts
- **🚀 Production Ready**: Environment validation, graceful shutdown, dan deployment optimization

### ✨ Fitur Utama

- **🔐 User Authentication**: Sistem login/register dengan JWT dan Google OAuth 2.0
- **👤 User Management**: Manajemen pengguna dengan hashing password (bcrypt)
- **🤖 AI-Powered Detection**: Menggunakan autoencoder neural network untuk deteksi anomali
- **🧠 Google Gemini AI Integration**: Penjelasan anomali berbasis AI dengan Google Gemini 2.5 Flash
- **� AI Chat Interface**: Chat langsung dengan AI analyst untuk konsultasi fraud detection
- **�📊 Batch Processing**: Upload dan analisis file CSV dalam batch per user
- **📈 Real-time Analysis**: Analisis transaksi secara real-time dengan komunikasi Flask API
- **🎯 Dynamic Threshold**: Threshold deteksi yang adaptif berdasarkan distribusi data (95th percentile)
- **💾 Database Integration**: Penyimpanan data relasional menggunakan PostgreSQL dengan Prisma ORM
- **🖥️ Modern Web Interface**: Interface web responsive dengan Tailwind CSS + modular architecture
- **🔄 RESTful API**: API yang komprehensif dengan middleware proteksi
- **🌐 OAuth Integration**: Login dengan Google untuk kemudahan akses
- **📱 Responsive Design**: Optimized untuk desktop dan mobile devices

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Model      │    │  Google Gemini  │
│ (HTML/JS/CSS)   │◄──►│   (Node.js)     │◄──►│   (Python)      │◄──►│      API        │
│                 │    │                 │    │                 │    │                 │
│ • Auth Pages    │    │ • JWT Auth      │    │ • Autoencoder   │    │ • AI Chat       │
│ • Upload UI     │    │ • REST API      │    │ • Preprocessing │    │ • Explanations  │
│ • AI Chat       │    │ • File Handler  │    │ • Prediction    │    │ • Smart Analysis│
│ • Results View  │    │ • User Session  │    │ • Flask API     │    │ • NLP Features  │
│ • User Mgmt     │    │ • Middleware    │    │ • Health Check  │    │                 │
│ • OAuth Flow    │    │ • Gemini Proxy  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       │                 │
                       │ • Users         │
                       │ • Transactions  │
                       │ • Upload Batches│
                       │ • AI Explanations│
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
- **Google Generative AI**: Integration dengan Google Gemini API
- **Body-Parser**: Enhanced request parsing
- **Dotenv**: Environment variables management

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
- **Tailwind CSS**: Utility-first CSS framework untuk responsive design
- **Font Awesome**: Comprehensive icon library
- **Google Fonts (Inter)**: Modern typography
- **Fetch API**: Modern HTTP client untuk browser
- **Modular Architecture**: Component-based frontend organization

### AI & Intelligence

- **Google Gemini 2.5 Flash**: Advanced AI untuk fraud explanation dan chat
- **Custom Autoencoder**: Specialized model untuk anomaly detection
- **Hybrid AI Approach**: Kombinasi ML model + LLM untuk comprehensive analysis
- **Real-time AI Processing**: Instant fraud analysis dan explanation

### Authentication & Security

- **JWT (JSON Web Tokens)**: Stateless authentication
- **Google OAuth 2.0**: Third-party authentication
- **bcrypt**: Password hashing dengan salt
- **Middleware Protection**: Route-level security

## 📁 Struktur Proyek

```
fraud-detector/
├── backend/                    # Backend Node.js application
│   ├── index.js               # Main server file dengan auth setup + environment validation
│   ├── package.json           # Dependencies dengan Google AI + auth packages
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
│   │   ├── transactionRoutes.js # Protected transaction routes + Gemini integration
│   │   └── frontendRoutes.js # Frontend page routes
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema dengan User model + AI explanation field
│   │   └── migrations/       # Database migrations (6 total migrations)
│   ├── generated/
│   │   └── prisma/          # Auto-generated Prisma client
│   └── uploads/              # Temporary file storage (user-specific)
│
├── frontend/                  # Frontend web application (MODULAR TAILWIND ARCHITECTURE)
│   ├── pages/                # HTML pages with Tailwind CSS
│   │   ├── index.html        # Dashboard page
│   │   ├── ai-chat.html      # AI Chat interface (NEW - Gemini integration)
│   │   ├── login.html        # Login page
│   │   ├── register.html     # Registration page
│   │   └── auth-success.html # OAuth success page
│   ├── css/                  # Modular stylesheets
│   │   └── main.css          # Global Tailwind customizations + fraud-specific colors
│   ├── js/                   # Modular JavaScript
│   │   ├── main.js           # Global utilities and API configuration
│   │   ├── config.js         # Centralized configuration management
│   │   ├── tailwind-config.js # Tailwind CSS configuration
│   │   ├── index.js          # Dashboard page logic
│   │   ├── ai-chat.js        # AI Chat page logic (NEW)
│   │   └── auth.js           # Authentication logic
│
├── model/                     # AI/ML Python components
│   ├── app.py                # Flask API server dengan health check + comprehensive logging
│   ├── train.py              # Model training script
│   ├── requirements.txt      # Python dependencies (8 packages)
│   ├── autoencoder_model.keras # Trained model file
│   ├── preprocessor_pipeline.joblib # Data preprocessor
│   └── data/                 # Training datasets (3 sample files)
│       ├── transactions_realistic_multi_feature.csv
│       ├── bank_transactions_data_2.csv
│       └── transactions_large.csv
│
├── start-dev.sh              # Development startup script dengan dependency checks
├── test-api.sh               # API endpoint testing script
├── test-frontend.sh          # Frontend testing script
├── test-routes.sh            # Route testing script
├── test-system.sh            # System integration testing
├── LICENSE                   # MIT License (Hasib Ashari)
├── .gitignore               # Git ignore rules untuk security
└── README.md                # Comprehensive documentation (this file)
```

> **🎯 New Modular Frontend Architecture**: Frontend menggunakan Tailwind CSS dengan arsitektur modular untuk better maintainability dan performance. Setiap halaman memiliki dedicated file dengan global utilities yang ter-centralized.
>
> **🆕 AI Chat & Google Gemini Integration**
>
> - **AI Chat Interface**: Halaman dedicated untuk berinteraksi langsung dengan AI fraud analyst (`ai-chat.html`, `ai-chat.js`)
> - **Google Gemini 2.5 Flash**: Integrasi penuh dengan Gemini API untuk fraud explanation dan real-time chat
> - **Smart Fraud Analysis**: Setiap anomali yang terdeteksi otomatis mendapat penjelasan detail dari Gemini AI
> - **Enhanced User Experience**: Interface modern dengan Tailwind CSS + responsive design
>
> **💡 Development Features:**
>
> - **Automated Setup**: Script `start-dev.sh` untuk setup environment otomatis
> - **Comprehensive Testing**: 5 testing scripts untuk berbagai aspek sistem
> - **Environment Validation**: Backend memvalidasi semua required environment variables
> - **Modular Configuration**: Centralized config management di frontend
> - **Production Ready**: Enhanced error handling + logging system

## 🚀 Instalasi dan Setup

### Prasyarat

- Node.js (>= 16.0.0)
- Python (>= 3.8)
- PostgreSQL (>= 12)
- npm atau yarn
- Google Developer Console account (untuk OAuth)
- Google AI Studio account (untuk Gemini API key)

### 1. Clone Repository

```bash
git clone <repository-url>
cd fraud-detector
```

### 2. Quick Setup dengan Automated Script

```bash
# Menggunakan automated setup script (RECOMMENDED)
chmod +x start-dev.sh
./start-dev.sh

# Script akan otomatis:
# - Check dependencies (Node.js, Python, PostgreSQL)
# - Install backend dependencies
# - Setup Python virtual environment
# - Start services secara berurutan
```

### 3. Manual Setup (Alternative)

#### Backend Setup

```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi berikut:
```

#### Environment Variables (.env)

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fraud_detection"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Authentication (generate random string)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-very-long-and-random"

# Google OAuth Configuration (dari Google Developer Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini AI Configuration (dari Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key-here"

# AI Model Configuration
AI_MODEL_URL=http://localhost:5000
```

> **🔑 Important**: System akan melakukan validasi otomatis untuk semua environment variables yang required. Jika ada yang missing, server tidak akan start dan akan menampilkan error message yang clear.

#### Database Setup

```bash
# Generate Prisma client dan jalankan migrations
npx prisma migrate dev
npx prisma generate

# Verify database connection
npx prisma studio  # Optional: untuk melihat database via web interface
```

### 4. Setup Google APIs

#### Google OAuth Setup

1. Buka [Google Developer Console](https://console.developers.google.com/)
2. Buat project baru atau pilih existing project
3. Enable Google+ API dan Google OAuth 2.0
4. Buat OAuth 2.0 credentials
5. Set authorized redirect URIs: `http://localhost:3001/auth/google/callback`
6. Copy Client ID dan Secret ke file .env

#### Google Gemini API Setup

1. Buka [Google AI Studio](https://aistudio.google.com/)
2. Sign in dengan Google account
3. Create new API key
4. Copy API key ke .env file sebagai `GEMINI_API_KEY`
5. Verify API access dengan test request

### 5. Setup AI Model

```bash
cd model

# Install Python dependencies dari requirements.txt
pip install -r requirements.txt

# Atau manual install:
pip install flask==3.0.0 flask-cors==4.0.0 pandas==2.1.4 numpy==1.24.3 scikit-learn==1.3.2 tensorflow==2.15.0 joblib==1.3.2

# Train model (opsional - model sudah terlatih)
python train.py

# Start AI service
python app.py
```

### 6. Start Backend Server

```bash
cd backend
npm start
# atau untuk development dengan auto-reload
npm run dev
```

### 7. Testing & Verification

```bash
# Test semua endpoints
./test-api.sh

# Test frontend functionality
./test-frontend.sh

# Test system integration
./test-system.sh
```

### 8. Akses Aplikasi

- **Main Dashboard**: `http://localhost:3001` (akan redirect ke login jika belum authenticate)
- **AI Chat Interface**: `http://localhost:3001/ai-chat` (setelah login)
- **Direct Pages**:
  - Login: `http://localhost:3001/login`
  - Register: `http://localhost:3001/register`
  - Dashboard: `http://localhost:3001/dashboard`
- **API Health Check**: `http://localhost:3001/api` dan `http://localhost:5000/health`

### 9. Logout

1. Klik tombol logout untuk keluar dari sistem
2. JWT token akan dihapus dari browser
3. Akan redirect kembali ke halaman login

### 10. Quick Development Tips

```bash
# Monitor logs dari semua services
tail -f backend/logs/* model/logs/*  # if log files exist

# Quick restart setelah code changes
npm run dev  # Backend auto-reload dengan nodemon
python app.py  # Restart AI model manually

# Database reset jika diperlukan
npx prisma migrate reset --force
npx prisma db push
```

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
  aiExplanation String?  @db.Text // Penjelasan anomali dari Google Gemini AI
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

#### 6. AI Chat with Gemini

```http
POST /api/ai-chat
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "message": "Explain the recent anomalies detected in my account",
  "context": "fraud_analysis"
}

Response:
{
  "message": "AI analysis of your fraud patterns...",
  "suggestions": ["Check merchant verification", "Review location patterns"],
  "timestamp": "2025-07-01T10:00:00Z"
}
```

#### 7. Get Fraud Explanation

```http
GET /api/transactions/explanation/:transactionId
Authorization: Bearer <token>

Response:
{
  "transactionId": "transaction-id",
  "explanation": "This transaction is flagged as anomalous because...",
  "riskFactors": ["unusual_amount", "new_merchant", "odd_timing"],
  "severity": "high"
}
```

#### 8. Delete Batch

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

### AI Model Endpoints

#### Health Check

```http
GET http://localhost:5000/health

Response:
{
  "status": "healthy",
  "model_status": "loaded",
  "message": "Fraud Detection AI Service is running"
}
```

#### Predict Anomalies

```http
POST http://localhost:5000/predict
Content-Type: application/json

Body:
{
  "transactions": [
    {
      "id": "1",
      "amount": 100.5,
      "timestamp": "2025-07-01T14:30:00Z",
      "merchant": "Amazon",
      "location": "Online"
    }
  ]
}

Response:
{
  "results": [
    {
      "id": "1",
      "is_anomaly": false,
      "anomaly_score": 0.23,
      "risk_level": "low"
    }
  ],
  "threshold": 0.85,
  "model_info": "AutoEncoder v2.0"
}
```

#### Test Format

```http
GET http://localhost:5000/test-format

Response:
{
  "sample_format": {
    "transactions": [
      {
        "id": "example",
        "amount": 150.0,
        "timestamp": "2025-07-01T12:00:00Z",
        "merchant": "Store Name",
        "location": "City"
      }
    ]
  }
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

### 6. AI Chat Interface (NEW)

1. **Akses AI Chat**: Setelah login, klik menu "AI Chat" atau langsung ke `/ai-chat`
2. **Interactive Consultation**: Chat langsung dengan AI fraud analyst untuk:
   - Konsultasi tentang pola transaksi mencurigakan
   - Penjelasan detail tentang hasil deteksi fraud
   - Rekomendasi tindakan pencegahan
   - Analisis trend fraud di akun Anda
3. **Real-time Responses**: Powered by Google Gemini 2.5 Flash untuk response yang cepat dan accurate
4. **Context-Aware**: AI memahami context dari data transaksi dan history fraud detection

### 7. Enhanced Fraud Analysis

1. **Automatic AI Explanation**: Setiap anomali yang terdeteksi otomatis mendapat penjelasan dari Gemini AI
2. **Smart Risk Assessment**: AI menganalisis berbagai faktor risiko dan memberikan scoring yang comprehensive
3. **Actionable Insights**: Tidak hanya mendeteksi, tapi juga memberikan saran konkret untuk mitigation

## ⚙️ Konfigurasi

#### Environment Variables (.env)

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fraud_detection"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Authentication (generate random string)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-very-long-and-random"

# Google OAuth Configuration (dari Google Developer Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini AI Configuration (dari Google AI Studio) - REQUIRED
GEMINI_API_KEY="your-gemini-api-key-here"

# AI Model Configuration
AI_MODEL_URL=http://localhost:5000
```

> **⚠️ Environment Validation**: Backend akan melakukan validasi otomatis untuk semua required environment variables saat startup. Jika `GEMINI_API_KEY` atau variable lain hilang, server akan menampilkan error dan tidak akan start.

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

### 5. AI Model Testing (Enhanced)

```bash
# Test AI Model Health
curl http://localhost:5000/health

# Test AI Model Format
curl http://localhost:5000/test-format

# Test AI Prediction dengan sample data
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"transactions":[{"id":"1","amount":1500.00,"merchant":"Unknown","location":"Remote","timestamp":"2025-07-01T10:00:00Z"}]}'

# Test Google Gemini Integration (backend)
curl -X POST http://localhost:3001/api/ai-chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain fraud patterns","context":"fraud_analysis"}'
```

### 6. Automated Testing Scripts

```bash
# Test semua API endpoints
./test-api.sh

# Test frontend functionality dan configuration
./test-frontend.sh

# Test routes accessibility
./test-routes.sh

# Comprehensive system integration test
./test-system.sh
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

---

## 🎉 PROJECT COMPLETION ACKNOWLEDGMENT

**STATUS: PRODUCTION READY ✅**

Fraud Detection System telah berhasil dikembangkan hingga tahap production-ready dengan semua fitur enterprise-grade yang direncanakan. Sistem ini mendemonstrasikan implementasi teknologi terdepan dalam fraud detection, AI integration, dan modern web development.

### 💎 Final Achievement Summary

✅ **Complete Full-Stack Application** - Dari database hingga AI integration  
✅ **Enterprise-Grade Security** - Multi-layer protection dengan best practices  
✅ **Advanced AI Capabilities** - Hybrid approach dengan cutting-edge technology  
✅ **Production-Ready Architecture** - Scalable, maintainable, dan optimized  
✅ **Comprehensive Testing** - Quality assurance dengan automated testing  
✅ **Professional Documentation** - Detailed guides untuk development dan deployment  
✅ **Modern User Experience** - Responsive design dengan intuitive interface  
✅ **Real-time Processing** - Instant fraud detection dan analysis

### 🙏 Development Team Credits

Terima kasih kepada semua yang telah berkontribusi dalam pengembangan sistem fraud detection yang comprehensive ini:

- **AI/ML Engineering**: Custom autoencoder development, Gemini API integration, dan advanced fraud analytics
- **Backend Development**: Node.js architecture, API design, database optimization, dan security implementation
- **Frontend Development**: Modern UI/UX dengan Tailwind CSS, responsive design, dan user experience optimization
- **DevOps & Testing**: Automated setup scripts, comprehensive testing suites, dan production deployment optimization
- **Technical Documentation**: Detailed documentation, API guides, dan development best practices

**Made with ❤️ for BI Hackathon 2025 - Powered by Advanced AI Technology**

_"Revolutionizing fraud detection through the seamless integration of machine learning, artificial intelligence, and modern web technologies"_

---

© 2025 Hasib Ashari. Licensed under MIT License. Enterprise-grade fraud detection solution for financial institutions.
