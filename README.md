# Fraud Detection System

**🎯 AI-Powered Financial Fraud Detection System**

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-green.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)
![Python](https://img.shields.io/badge/python-%3E%3D%203.8-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Security](https://img.shields.io/badge/security-Enhanced-blue.svg)

> **⚡ Quick Start**: Clone → Setup .env → `./start-dev.sh` → Open http://localhost:3001
>
> **🎓 Learning Project**: Advanced fraud detection system built for BI-OJK 2025 Hackathon
>
> **✅ Recently Updated**: Enhanced security, improved authentication flow, and optimized AI integration (July 2025)

## 📚 Table of Contents

- [📋 Deskripsi Project](#-deskripsi-project)
- [✨ Fitur Utama & Key Features](#-fitur-utama--key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack & Tools](#️-tech-stack--tools)
- [📁 Project Structure](#-project-structure)
- [🚀 Installation & Setup Guide](#-installation--setup-guide)
- [📊 Database Schema](#-database-schema)
- [🔗 API Documentation](#-api-documentation)
- [🤖 AI Model Details](#-ai-model-details)
- [💡 Usage Guide (Cara Penggunaan)](#-usage-guide-cara-penggunaan)
- [⚙️ Configuration Setup](#️-configuration-setup)
- [🧪 Testing & Validation](#-testing--validation)
- [🛡️ Security Features](#️-security-features)
- [🔧 Troubleshooting Guide](#-troubleshooting-guide)
- [📈 Performance & Optimization](#-performance--optimization)
- [🤝 Contributing](#-contributing)
- [🚀 Deployment Guide](#-deployment-guide)
- [📧 Contact & Support](#-contact--support)
- [🔄 Version History & Development Roadmap](#-version-history--development-roadmap)

---

## 📋 Deskripsi Project

**Fraud Detection System** adalah aplikasi web full-stack berbasis AI yang dirancang untuk mendeteksi transaksi keuangan mencurigakan menggunakan teknik machine learning dan kecerdasan buatan. Sistem ini mengintegrasikan custom autoencoder neural network dengan Google Gemini AI untuk memberikan analisis kecurangan (fraud analysis) serta penjelasan anomali (anomaly explanation) yang lebih mendalam.

**🎓 Learning Project**: Ini adalah proyek pembelajaran yang dikembangkan dengan bantuan AI coding partners untuk mengeksplorasi teknologi AI, machine learning, dan pengembangan web modern. Selain sebagai sarana pembelajaran, proyek ini juga disiapkan secara serius untuk mengikuti Hackathon BI-OJK 2025 (tema: Fraud Detection & Risk Mitigation) sebagai bagian dari kontribusi nyata dalam membangun solusi teknologi berbasis data dan keamanan.

### ✨ Fitur Utama & Key Features

**🔐 Enhanced Authentication & Security**

- **Multi-Layer Authentication**: JWT-based system with Google OAuth 2.0 integration
- **Secure Password Management**: bcrypt hashing with proper salt rounds
- **Smart OAuth Handling**: Seamless integration between manual and Google authentication
- **Session Management**: Secure token-based sessions with automatic expiration
- **User Isolation**: Complete data separation between users for privacy

**🤖 Advanced AI-Powered Detection**

- **Custom Neural Network**: Autoencoder-based anomaly detection for fraud patterns
- **Google Gemini Integration**: AI-powered explanations for detected anomalies
- **Real-time Analysis**: Instant fraud detection through Flask API integration
- **Intelligent Chat Interface**: Interactive AI consultant for fraud analysis
- **Dynamic Threshold**: Adaptive detection sensitivity based on data patterns

**📊 Smart Data Management**

- **Flexible CSV Processing**: Automatic column mapping for various CSV formats
- **Batch Processing System**: User-specific batch management with full lifecycle tracking
- **Database Optimization**: PostgreSQL with Prisma ORM for reliable data storage
- **Export Capabilities**: Comprehensive CSV export with filtering options
- **Data Validation**: Robust input validation and error handling

**🎯 Modern User Experience**

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Intuitive Dashboard**: Clean, professional interface for fraud analysis
- **Real-time Feedback**: Live progress indicators and status updates
- **Advanced Filtering**: Multi-criteria filtering and sorting capabilities
- **Accessibility**: WCAG-compliant design for inclusive user experience

## 🏗️ System Architecture

### High-Level Architecture Overview

> **Penjelasan Arsitektur Sistem:**
>
> Fraud Detection System mengadopsi arsitektur multi-layer yang dirancang untuk memisahkan tanggung jawab, meningkatkan keamanan, serta mempermudah proses pengembangan dan pembelajaran. Setiap layer memiliki fungsi spesifik dan saling terintegrasi secara modular untuk memastikan skalabilitas dan maintainability.
>
> 1. **Client & Presentation Layer:**
>
>    - Pengguna (web atau mobile) berinteraksi melalui antarmuka modern yang dibangun dengan Tailwind CSS dan JavaScript. Seluruh aktivitas mulai dari login, unggah file, analisis transaksi, hingga percakapan AI dilakukan melalui UI yang responsif dan aman.
>
> 2. **Frontend Layer:**
>
>    - Berfungsi sebagai jembatan antara pengguna dan backend. Layer ini mengelola state aplikasi, melakukan validasi input, serta mengirimkan permintaan ke API backend. Struktur modular pada frontend memudahkan pemeliharaan dan penambahan fitur baru.
>
> 3. **Backend/API Layer:**
>
>    - Backend dikembangkan menggunakan Express.js dan Prisma ORM. Layer ini menangani logika bisnis utama seperti autentikasi (JWT & Google OAuth), manajemen data, proteksi endpoint, serta komunikasi dengan layanan AI. Middleware digunakan untuk validasi, logging, dan pengamanan (rate limiting, CORS, dll).
>
> 4. **AI/ML Service Layer:**
>
>    - Layanan AI/ML berjalan terpisah (Python Flask) untuk deteksi anomali menggunakan autoencoder neural network. Backend berkomunikasi dengan service ini via REST API. Untuk penjelasan anomali, backend meneruskan permintaan ke Google Gemini API melalui AI service.
>
> 5. **Data & Storage Layer:**
>
>    - Semua data transaksi, user, dan hasil analisis disimpan di PostgreSQL (via Prisma ORM). File upload (CSV, model, log) disimpan di file storage terpisah. Skema database dirancang untuk integritas data dan efisiensi query.
>
> 6. **External Services:**
>    - Google OAuth digunakan untuk third-party authentication, memastikan user management yang aman dan mudah. Google Gemini API diintegrasikan untuk memberikan penjelasan AI yang kontekstual dan mendalam atas hasil deteksi anomali.
>
> **Alur Data & Keamanan:**
>
> - Setiap request dari client divalidasi di frontend dan backend.
> - Autentikasi dilakukan via JWT atau Google OAuth, memastikan hanya user terotorisasi yang dapat mengakses data.
> - Data transaksi diupload, diproses, dan dianalisis secara batch, dengan hasil anomaly detection dan AI explanation yang tersimpan di database.
> - Semua komunikasi antar layer menggunakan protokol aman (HTTPS/REST), dan environment variable digunakan untuk menjaga kerahasiaan credential.
>
> **Manfaat Desain Modular:**
>
> - Memudahkan debugging, scaling, dan pengembangan fitur baru.
> - Setiap layer dapat di-upgrade atau diganti tanpa mengganggu sistem lain.
> - Cocok untuk pembelajaran, eksplorasi teknologi, dan pengembangan profesional.
>
> Diagram berikut menggambarkan alur utama komunikasi antar layer dan layanan eksternal:

```mermaid
%% 🎨 Colorful, Emoji-enhanced System Architecture Diagram
flowchart TB
    subgraph CLIENT_SIDE["🧑‍💻 Client Side"]
        CLIENT["🌐 User (Web/Mobile)"]
    end
    subgraph PRESENTATION["🎨 Frontend (Tailwind CSS, JS)"]
        UI["🖥️ UI Pages (Login, Register, Dashboard, AI Chat)"]
        UPLOAD["📤 CSV Upload Module"]
        CHAT["🤖 AI Chat Module"]
        RESULT["📊 Results Table & Export"]
    end
    subgraph BACKEND["🛠️ Backend (Express.js, Prisma, Middleware)"]
        API["🔗 REST API Layer"]
        AUTH["🔐 Auth Controller (JWT, OAuth)"]
        ROUTES["🛣️ Routes (auth, transaction, frontend)"]
        MIDDLEWARE["🛡️ Security Middleware"]
        BATCH["📦 Batch Processor"]
        FILES["📁 File Upload Handler"]
        LOGGER["📝 Logger"]
        ORM["🗄️ Prisma ORM"]
    end
    subgraph AI_ML["🤖 AI/ML Service (Flask, TensorFlow, Gemini)"]
        FLASK["🌟 Flask API"]
        MODEL["🧠 Autoencoder Model"]
        PREPROC["🧹 Preprocessing Pipeline"]
        GEMINI_PROXY["✨ Gemini Proxy"]
    end
    subgraph DATA["💾 Data Layer"]
        DB["🗃️ PostgreSQL Database"]
        STORAGE["🗂️ File Storage"]
    end
    subgraph EXTERNAL["🌍 External Services"]
        OAUTH["🔑 Google OAuth"]
        GEMINI["🌈 Google Gemini API"]
    end

    CLIENT -->|HTTP/HTTPS| UI
    UI --> UPLOAD
    UI --> CHAT
    UI --> RESULT
    UI -->|REST API| API
    UPLOAD -->|CSV File| API
    CHAT -->|User Query| API
    RESULT -->|Export| API

    API --> ROUTES
    ROUTES --> AUTH
    ROUTES --> BATCH
    ROUTES --> FILES
    ROUTES -->|AI/ML| GEMINI_PROXY
    ROUTES -->|DB| ORM
    ROUTES -->|File| FILES
    ROUTES -->|Logger| LOGGER
    AUTH --> MIDDLEWARE
    BATCH --> MIDDLEWARE
    FILES --> MIDDLEWARE
    MIDDLEWARE --> API
    ORM --> DB
    FILES --> STORAGE

    GEMINI_PROXY --> FLASK
    FLASK --> MODEL
    FLASK --> PREPROC
    FLASK --> GEMINI
    GEMINI_PROXY --> GEMINI

    AUTH --> OAUTH
    OAUTH -->|Token| AUTH

    DB <--> STORAGE

    %% Styling: Colorful for better clarity
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#0d47a1;
    classDef frontend fill:#fffde7,stroke:#fbc02d,stroke-width:2px,color:#f57c00;
    classDef backend fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#1b5e20;
    classDef ai fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#880e4f;
    classDef data fill:#ede7f6,stroke:#512da8,stroke-width:2px,color:#311b92;
    classDef external fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,color:#4a148c;
    class CLIENT,CLIENT_SIDE client;
    class UI,UPLOAD,CHAT,RESULT,PRESENTATION frontend;
    class API,AUTH,ROUTES,MIDDLEWARE,BATCH,FILES,LOGGER,ORM,BACKEND backend;
    class FLASK,MODEL,PREPROC,GEMINI_PROXY,AI_ML ai;
    class DB,STORAGE,DATA data;
    class OAUTH,GEMINI,EXTERNAL external;
```

**Ringkasan Layer (Textual Summary):**

- **Client Layer:** Web & mobile browser
- **Frontend Layer:** Tailwind CSS, Vanilla JS, modular UI (auth, upload, chat, results)
- **Backend Layer:** Express.js API, Prisma ORM, middleware security, file uploads
- **AI/ML Layer:** Python Flask API, autoencoder model, Google Gemini integration
- **Data Layer:** PostgreSQL database, file storage
- **External Services:** Google OAuth, Google Gemini API

> **Lihat diagram komponen dan data flow di bawah untuk detail visual arsitektur.**

### Detailed Component Architecture

```
🌐 PRESENTATION LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Frontend (Vanilla JS + Tailwind CSS)                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ Auth Pages  │ │ Upload UI   │ │ AI Chat     │ │ Results View│                │
│  │ • Login     │ │ • CSV Upload│ │ • Real-time │ │ • Tables    │                │
│  │ • Register  │ │ • Progress  │ │ • Gemini AI │ │ • Filtering │                │
│  │ • OAuth     │ │ • Validation│ │ • Explain   │ │ • Export    │                │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                    HTTPS/REST API
                                        │
🚀 APPLICATION LAYER                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Backend Services (Node.js + Express)                                           │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │ Authentication  │    │ Transaction API │    │ AI Integration  │              │
│  │ • JWT Tokens    │    │ • File Upload   │    │ • Gemini Proxy  │              │
│  │ • Session Mgmt  │    │ • CSV Parser    │    │ • Chat Engine   │              │
│  │ • OAuth Handler │    │ • Validation    │    │ • Explanations  │              │
│  │ • User Context  │    │ • Batch Process │    │ • NLP Features  │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│                                  │                       │                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ Security Middleware & Route Protection                                  │    │
│  │ • CORS Policy • Rate Limiting • Input Validation • Error Handling       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                          │                                │
                    API Calls                        HTTP Requests
                          │                                │
🤖 AI/ML LAYER            ▼                                ▼
┌─────────────────────────────────────┐    ┌─────────────────────────────────┐
│  Machine Learning Service (Python)  │    │     External AI Services        │
│                                     │    │                                 │
│       ┌─────────────────┐           │    │    ┌─────────────────┐          │
│       │ Fraud Detection │           │    │    │ Google Gemini   │          │
│       │ • Autoencoder   │           │    │    │ • Chat API      │          │
│       │ • Deep Learning │           │    │    │ • NLP Engine    │          │
│       │ • Anomaly Score │           │    │    │ • Explanations  │          │
│       │ • Threshold     │           │    │    │ • Smart Analysis│          │
│       └─────────────────┘           │    │    └─────────────────┘          │
│                                     │    │                                 │
│      ┌─────────────────┐            │    │    ┌─────────────────┐          │
│      │ Data Processing │            │    │    │ OAuth Provider  │          │
│      │ • Preprocessing │            │    │    │ • Google OAuth  │          │
│      │ • Normalization │            │    │    │ • User Profile  │          │
│      │ • Feature Eng   │            │    │    │ • Secure Auth   │          │
│      │ • Validation    │            │    │    └─────────────────┘          │
│      └─────────────────┘            │    └─────────────────────────────────┘
└─────────────────────────────────────┘
                    │
              Model Persistence
                    │
🗄️ DATA LAYER       ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│  Database & Storage (PostgreSQL + Prisma ORM)                                  │
│                                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │   Users     │ │Transactions │ │ UploadBatch │ │AIExplanation│               │
│  │ • ID        │ │ • Amount    │ │ • BatchID   │ │ • Query     │               │
│  │ • Email     │ │ • Type      │ │ • UserID    │ │ • Response  │               │
│  │ • Provider  │ │ • Merchant  │ │ • Status    │ │ • Timestamp │               │
│  │ • Profile   │ │ • Fraud     │ │ • Results   │ │ • Context   │               │
│  │ • Sessions  │ │ • Score     │ │ • Created   │ │ • Metadata  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ File Storage System                                                     │   │
│  │ • CSV Uploads • Model Artifacts • Training Data • Logs & Backups        │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
📊 DATA FLOW DIAGRAM
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  1. USER UPLOAD           2. PROCESSING            3. AI ANALYSIS               │
│  ┌─────────────┐         ┌─────────────┐          ┌─────────────┐               │
│  │ 📄 CSV File │────────►│ 🔍 Validate │────────►│ 🤖 ML Model │               │
│  │ • Drag&Drop │         │ • Parse     │          │ • Preprocess│               │
│  │ • Progress  │         │ • Schema    │          │ • Predict   │               │
│  │ • Preview   │         │ • Store     │          │ • Score     │               │
│  └─────────────┘         └─────────────┘          └─────────────┘               │
│                                                           │                     │
│  4. RESULTS               5. AI EXPLANATION      ◄────────┘                     │
│  ┌─────────────┐         ┌─────────────┐                                        │
│  │ 📋 Results  │◄────────│ 💬 Gemini  │                                        │
│  │ • Tables    │         │ • Explain   │                                        │
│  │ • Filter    │         │ • Context   │                                        │
│  │ • Export    │         │ • Insights  │                                        │
│  └─────────────┘         └─────────────┘                                        │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack & Tools

### Backend Development (Node.js)

- **Express.js**: Web framework untuk server
- **Prisma**: Database ORM dengan generated client
- **PostgreSQL**: Database relational
- **JWT (jsonwebtoken)**: Token-based authentication system
- **bcryptjs**: Password hashing dan security
- **Passport.js**: Authentication middleware dengan Google OAuth
- **Multer**: File upload handling
- **CSV-Parser**: CSV file processing
- **Axios**: HTTP client untuk komunikasi dengan AI model
- **CORS**: Cross-origin resource sharing
- **Google Generative AI**: Integration dengan Google Gemini API

### AI Model Development (Python)

- **TensorFlow/Keras**: Neural network framework untuk autoencoder model
- **Flask**: Web API framework untuk AI service
- **Flask-CORS**: CORS support untuk Flask API
- **Pandas**: Data manipulation dan analysis
- **NumPy**: Numerical computing untuk array operations
- **Scikit-learn**: Preprocessing utilities (StandardScaler, OneHotEncoder)
- **Joblib**: Model serialization dan loading

### Frontend Development

- **HTML5/CSS3**: Modern markup dan styling
- **JavaScript (Vanilla)**: Client-side logic dan DOM manipulation
- **Tailwind CSS**: Utility-first CSS framework untuk responsive design
- **Font Awesome**: Icon library untuk UI components
- **Google Fonts (Inter)**: Typography system
- **Fetch API**: HTTP client untuk browser communication

### AI & Intelligence Services

- **Google Gemini**: AI untuk fraud explanation dan intelligent chat
- **Custom Autoencoder**: Model untuk anomaly detection
- **Hybrid AI Approach**: Kombinasi ML model + LLM technology

### Authentication & Security Implementation

- **JWT (JSON Web Tokens)**: Stateless authentication system
- **Google OAuth 2.0**: Third-party authentication provider
- **bcrypt**: Password hashing dengan salt untuk security
- **Middleware Protection**: Route-level security implementation

## 📁 Project Structure

```
fraud-detector/
├── backend/                # Node.js backend (API, auth, DB, AI integration)
│   ├── config/             # Passport & config files
│   ├── controllers/        # Controller logic (auth, etc)
│   ├── generated/          # (IGNORED) Prisma generated client (do not commit)
│   ├── lib/                # Prisma client config
│   ├── middleware/         # JWT & security middleware
│   ├── prisma/             # Prisma schema & migrations
│   ├── routes/             # Express route handlers
│   ├── uploads/            # Temp file storage (auto-cleaned)
│   ├── utils/              # Logger & utilities
│   ├── index.js            # Main server entrypoint
│   ├── package.json        # Backend dependencies
│   └── ...
│
├── frontend/               # Frontend (HTML, JS, CSS)
│   ├── css/                # Tailwind customizations
│   ├── js/                 # Modular JS (auth, chat, dashboard, etc)
│   └── pages/              # HTML pages (login, register, dashboard, chat)
│
├── model/                  # Python AI/ML service
│   ├── app.py              # Flask API server
│   ├── autoencoder_model.keras   # Trained model
│   ├── preprocessor_pipeline.joblib # Preprocessing pipeline
│   ├── requirements.txt    # Python dependencies
│   ├── train.py            # Model training script
│   ├── data/               # Sample/test datasets
│   ├── __pycache__/        # (IGNORED) Python bytecode
│   └── venv/               # (IGNORED) Python virtualenv
│
├── start-dev.sh            # Dev startup script (all-in-one)
├── test-frontend.sh        # Frontend test script
├── test-routes.sh          # API route test script
├── test-system.sh          # System integration test
├── LICENSE                 # MIT License
├── .gitignore              # Ignore rules (see below)
└── README.md               # Documentation (this file)
```

> **Note:**
>
> - Folder `backend/generated/`, `model/__pycache__/`, dan `model/venv/` **harus di-ignore** di VCS (lihat `.gitignore`).
> - Folder `uploads/` hanya untuk file sementara dan akan kosong jika tidak ada upload aktif.
> - Tidak ada file duplikat/tidak relevan di repo ini.

### .gitignore (penting)

Tambahkan/cek baris berikut di `.gitignore`:

```
backend/generated/
model/__pycache__/
model/venv/
node_modules/
*.log
uploads/
```

---

> **🎯 Modern Frontend Architecture**: Frontend menggunakan Tailwind CSS dengan arsitektur modular untuk maintainability dan responsive design.
>
> **🤖 AI Integration**:
>
> - **AI Chat Interface**: Halaman untuk berinteraksi dengan AI fraud analyst (`ai-chat.html`, `ai-chat.js`)
> - **Google Gemini Integration**: Integrasi dengan Gemini API untuk fraud explanation dan chat
> - **Fraud Analysis**: Setiap anomali yang terdeteksi bisa mendapat penjelasan dari AI
> - **Modern Interface**: Interface responsive dengan Tailwind CSS
>
> **💡 Development Features:**
>
> - **Automated Setup**: Script `start-dev.sh` untuk setup environment
> - **Testing Scripts**: 4 testing scripts untuk berbagai aspek sistem
> - **Environment Validation**: Backend memvalidasi required environment variables
> - **Modular Configuration**: Centralized config management di frontend

## 🚀 Installation & Setup Guide

### Prerequisites (Prasyarat)

- Node.js (>= 16.0.0)
- Python (>= 3.8)
- PostgreSQL (>= 12)
- npm atau yarn package manager
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

# Script akan otomatis melakukan:
# - Check dependencies (Node.js, Python, PostgreSQL)
# - Install backend dependencies
# - Setup Python virtual environment
# - Start services secara sequential
```

### 3. Manual Setup (Alternative Method)

#### Backend Setup

```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan configuration berikut:
```

#### Environment Variables (.env Configuration)

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

> **🔑 Important Note**: System akan melakukan automatic validation untuk semua required environment variables. Jika ada yang missing, server tidak akan start dan akan menampilkan clear error message.

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
6. Copy Client ID dan Secret ke .env file

#### Google Gemini API Setup

1. Buka [Google AI Studio](https://aistudio.google.com/)
2. Sign in dengan Google account
3. Create new API key
4. Copy API key ke .env file sebagai `GEMINI_API_KEY`
5. Verify API access dengan test request

### 5. AI Model Setup

```bash
cd model

# Install Python dependencies dari requirements.txt
pip install -r requirements.txt

# Atau manual install packages:
pip install flask==3.0.0 flask-cors==4.0.0 pandas==2.1.4 numpy==1.24.3 scikit-learn==1.3.2 tensorflow==2.15.0 joblib==1.3.2

# Train model (optional - model sudah terlatih)
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

### 8. Access Application

- **Main Dashboard**: `http://localhost:3001` (akan redirect ke login jika belum authenticated)
- **AI Chat Interface**: `http://localhost:3001/ai-chat` (setelah login)
- **Direct Page Access**:
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

### **Enhanced User Model**

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String
  password      String?       // Optional for OAuth users - Enhanced Security
  googleId      String?       @unique
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  uploadBatches UploadBatch[]
}
```

**Key Improvements:**

- **Flexible Password Field**: Optional password field properly handles OAuth users
- **Enhanced Security**: Proper separation between manual and OAuth authentication methods
- **Data Integrity**: Improved relationships and constraints for data consistency

### **UploadBatch Model**

```prisma
model UploadBatch {
  id           String        @id @default(cuid())
  fileName     String        // Original uploaded file name
  status       BatchStatus   @default(PENDING) // PENDING, COMPLETED, FAILED
  createdAt    DateTime      @default(now())
  userId       String        // User ownership for data isolation
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[] // One-to-Many relationship with transactions
}
```

### **Transaction Model**

```prisma
model Transaction {
  id                String       @id @default(cuid())
  amount            Float        // Transaction amount
  timestamp         DateTime     // Transaction timestamp (optimized for time analysis)
  merchant          String       // Merchant name
  location          String?      // Transaction location (optional)
  user_id           String?      // User ID from CSV (optional)
  transaction_type  String?      // Transaction type (optional)
  channel           String?      // Transaction channel (optional)
  device_type       String?      // Device type (optional)
  isAnomaly         Boolean?     @default(false) // AI anomaly detection result
  anomalyScore      Float?       // Risk score from AI model (0.0 - 1.0)
  geminiExplanation String?      // AI explanation from Google Gemini
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  uploadBatchId     String?      // Batch relationship
  UploadBatch       UploadBatch? @relation(fields: [uploadBatchId], references: [id])
}
```

**Enhanced Features:**

- **Flexible Schema**: Optional fields support various CSV formats
- **Optimized Time Analysis**: Direct timestamp usage for accurate time-based fraud detection
- **AI Integration**: Built-in support for anomaly scores and explanations
- **Comprehensive Data**: Support for additional transaction metadata

### **BatchStatus Enum**

```prisma
enum BatchStatus {
  PENDING   // Upload completed, awaiting analysis
  COMPLETED // Analysis completed successfully
  FAILED    // Error during processing
}
```

**Status Flow:**

- **PENDING**: File uploaded and parsed, ready for AI analysis
- **COMPLETED**: All transactions analyzed, results available
- **FAILED**: Processing encountered errors, requires manual review

## 🔧 **RECENT IMPROVEMENTS & FIXES (July 2025)**

### **✅ Security Enhancements**

**Enhanced Authentication System:**

- **Fixed OAuth Password Handling**: Properly handle null passwords for Google OAuth users
- **Improved Password Validation**: Added minimum password length requirement (6 characters)
- **Secure Schema Updates**: Made password field optional for OAuth users in database schema
- **Better Error Messages**: Clear differentiation between OAuth and manual login errors

**API Security Improvements:**

- **Proper Logout Implementation**: Fixed logout endpoint registration and functionality
- **Token Validation**: Simplified and more secure JWT token verification
- **Route Protection**: Enhanced middleware protection for sensitive endpoints
- **Input Sanitization**: Improved validation for all user inputs

### **🛠️ Code Quality & Consistency**

**Codebase Cleanup:**

- **Removed Duplicate Code**: Eliminated redundant documentation blocks in route files
- **Consistent Error Handling**: Standardized error responses across all API endpoints
- **Improved Code Organization**: Better separation of concerns and modular structure
- **Environment Validation**: Automatic validation of required environment variables on startup

**Performance Optimizations:**

- **Simplified Route Logic**: Streamlined authentication flow for better performance
- **Memory Management**: Optimized file processing and database queries
- **API Response Time**: Faster response times through code optimization

### **🔄 Database & Schema Updates**

**Schema Improvements:**

- **Flexible User Model**: Updated User schema to properly support both OAuth and manual registration
- **Better Relationships**: Optimized foreign key relationships for data integrity
- **Migration Consistency**: Clean migration history without unnecessary field changes

### **🎯 User Experience Enhancements**

**Frontend Improvements:**

- **Better Feedback**: Enhanced user feedback for login/logout operations
- **Error Handling**: More informative error messages for users
- **Seamless Navigation**: Improved flow between authentication states

---

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
```

#### 3. Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

#### 4. Google OAuth

```http
GET /auth/google
# Redirects to Google OAuth consent screen

GET /auth/google/callback
# Google callback URL, redirects to frontend with token
```

### Transaction Endpoints (Protected Routes)

**Note**: Semua endpoint ini membutuhkan `Authorization: Bearer <token>` header

#### 1. Upload CSV File

```http
POST /api/transactions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- file: CSV file
```

#### 2. Analyze Batch

```http
POST /api/transactions/analyze/:batchId
Authorization: Bearer <token>
```

#### 3. Get User's Batches

```http
GET /api/transactions/batches
Authorization: Bearer <token>
```

#### 4. Get Anomalies from Batch

```http
GET /api/transactions/anomalies/:batchId
Authorization: Bearer <token>
```

#### 5. AI Chat with Batch Context

```http
POST /api/transactions/chat/:batchId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "question": "Explain the anomalies in this batch"
}
```

#### 6. Deep Analysis

```http
POST /api/transactions/deep-analysis/:batchId
Authorization: Bearer <token>
```

#### 7. Get Transaction Explanation

```http
POST /api/transactions/explain/:transactionId
Authorization: Bearer <token>
```

#### 8. Download Results (CSV)

```http
GET /api/transactions/download/:batchId
Authorization: Bearer <token>
```

#### 9. Delete Batch

```http
DELETE /api/transactions/batch/:batchId
Authorization: Bearer <token>
```

### AI Model Endpoints

#### Health Check

```http
GET http://localhost:5000/health
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
```

## 🤖 AI Model Details

### **Model Architecture**

- **Type**: Autoencoder Neural Network (TensorFlow/Keras)
- **Purpose**: Unsupervised anomaly detection for financial transactions
- **Core Features**: [amount, hour, user_id, transaction_type, channel, merchant, device_type, location]
- **Preprocessing Pipeline**: StandardScaler + OneHotEncoder with automatic data handling
- **Dynamic Threshold**: Adaptive anomaly detection sensitivity based on data patterns
- **Model Format**: Keras (.keras) with Joblib preprocessing pipeline

### **Data Processing Features**

- **Automatic Field Mapping**: Smart column mapping for various CSV formats
- **Missing Data Handling**: Automatic default values for missing fields
- **Currency Detection**: Automatic USD to IDR conversion based on amount ranges
- **Scale Optimization**: Automatic scaling for large transaction amounts
- **Time Extraction**: Smart hour extraction from timestamp fields

### **Supported Data Formats**

#### **Flexible CSV Input Format:**

```csv
TransactionAmount,TransactionDate,MerchantID,Location,AccountID,TransactionType,Channel,DeviceType
100.50,2025-06-30T14:30:00Z,Amazon,Online,123,purchase,mobile,Android
25.00,2025-06-30T15:45:00Z,Starbucks,New York,456,purchase,web,iOS
1500.00,2025-06-30T16:00:00Z,ATM,Jakarta,789,withdrawal,atm,ATM
```

#### **API Prediction Format:**

```json
{
  "transactions": [
    {
      "id": "1",
      "amount": 100.5,
      "timestamp": "2025-06-30T14:30:00Z",
      "merchant": "Amazon",
      "location": "Online",
      "user_id": "123",
      "transaction_type": "purchase",
      "channel": "mobile",
      "device_type": "Android"
    },
    {
      "id": "2", 
      "amount": 25.00,
      "timestamp": "2025-06-30T15:45:00Z",
      "merchant": "Starbucks",
      "location": "New York",
      "user_id": "456",
      "transaction_type": "purchase",
      "channel": "web", 
      "device_type": "iOS"
    }
  ]
}
```

### **AI Model Endpoints**

#### **Health Check**

```http
GET http://localhost:5000/health

Response:
{
  "status": "healthy",
  "model_status": "loaded",
  "message": "Fraud Detection AI Service is running"
}
```

#### **Predict Anomalies**

```http
POST http://localhost:5000/predict
Content-Type: application/json

Body: {JSON format above}
```

#### **Test Format & Sample Data**

```http
GET http://localhost:5000/test-format

Response: Sample data format with examples
```

### **Model Features & Capabilities**

**Enhanced Processing:**
- **Smart Preprocessing**: Automatic handling of missing fields with intelligent defaults
- **Multi-Currency Support**: Automatic USD to IDR conversion based on amount analysis
- **Flexible Schema**: Supports various CSV formats with automatic column mapping
- **Time Intelligence**: Extracts hour information from timestamps for temporal analysis
- **Scale Adaptation**: Automatic scaling for different transaction amount ranges

**Anomaly Detection:**
- **Unsupervised Learning**: No need for labeled fraud data
- **Dynamic Thresholds**: Adapts to data distribution patterns
- **Real-time Processing**: Fast inference for immediate fraud detection
- **Comprehensive Scoring**: Anomaly scores from 0.0 (normal) to 1.0 (highly suspicious)

## 💡 Usage Guide (Cara Penggunaan)

### 1. Registration & Login

#### Manual Registration

1. Buka aplikasi di browser (`http://localhost:3001`)
2. Klik "Register" pada halaman login
3. Isi form registrasi (nama, email, password)
4. Klik "Register" - akan redirect ke halaman login

#### Manual Login

1. Masukkan email dan password yang telah didaftarkan
2. Klik "Login"
3. Akan mendapat JWT token dan redirect ke dashboard

#### Login dengan Google OAuth

1. Klik "Login dengan Google" pada halaman login
2. Pilih akun Google Anda
3. Berikan permission yang diminta
4. Akan otomatis membuat akun dan login ke dashboard

### 2. Upload Transaction Data

1. Setelah login, Anda akan masuk ke dashboard utama
2. Pada section "Unggah File Transaksi Baru":
   - Klik "Choose File" dan pilih file CSV
   - Pastikan format CSV sesuai dengan template
   - Klik "Unggah File"
3. File akan diprocess dan muncul di tabel "Dashboard Batch Upload"
4. Status akan berubah dari PENDING ke COMPLETED

### 3. Transaction Analysis

1. Pada tabel batch, cari batch yang ingin dianalisis
2. Klik tombol "▶️ Analisis" pada baris batch tersebut
3. System akan mengirim data ke AI model untuk processing
4. Tunggu hingga muncul pesan "Analisis selesai"
5. Process ini akan mengupdate database dengan hasil anomali

### 4. View Detection Results

1. Setelah analysis selesai, klik tombol "📄 Lihat Hasil"
2. Anomali akan ditampilkan di tabel "Hasil Deteksi Anomali"
3. Setiap anomali menunjukkan:
   - Timestamp transaksi
   - Jumlah transaksi (dalam Rupiah)
   - Merchant dan lokasi
   - Skor anomali (semakin tinggi = semakin mencurigakan)
4. **Filtering & Sorting**: Gunakan filter dropdown dan klik header kolom untuk sorting
5. **Export**: Klik tombol "Export" untuk download hasil dalam format CSV

### 5. Batch Management

1. **Melihat History**: Semua batch upload Anda tersimpan per user
2. **Menghapus Batch**: Klik tombol "🗑️ Hapus" untuk menghapus batch
   - Konfirmasi akan muncul sebelum penghapusan
   - Semua transaksi dalam batch juga akan terhapus
3. **Filter per User**: Hanya batch milik user yang login yang ditampilkan

### 6. AI Chat Interface

1. **Access AI Chat**: Setelah login, klik menu "AI Chat" atau langsung ke `/ai-chat`
2. **Interactive Consultation**: Chat dengan AI untuk:
   - Konsultasi tentang pola transaksi mencurigakan
   - Penjelasan detail tentang hasil deteksi fraud
   - Analisis batch yang sudah diupload
3. **Context-Aware**: AI memahami context dari data batch yang dipilih
4. **Batch Selection**: Pilih batch yang ingin didiskusikan dari dropdown

### 7. Enhanced Fraud Analysis

1. **Automatic AI Explanation**: Setiap anomali yang terdeteksi bisa mendapat penjelasan dari Gemini AI
2. **Deep Analysis**: Fitur analisis mendalam untuk batch tertentu
3. **Results Export**: Download hasil analisis dalam format CSV untuk reporting

## ⚙️ Configuration Setup

#### Environment Variables (.env Configuration)

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

> **⚠️ Environment Validation**: Backend akan melakukan automatic validation untuk semua required environment variables saat startup. Jika `GEMINI_API_KEY` atau variable lain hilang, server akan menampilkan error dan tidak akan start.

### **Enhanced CSV Column Mapping**

System mendukung berbagai format kolom CSV dengan intelligent automatic mapping:

```javascript
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
```

**Enhanced Features:**
- **Multi-language Support**: Supports both English and Indonesian column headers
- **Case Insensitive**: Automatic normalization of column names
- **Flexible Mapping**: Multiple variations for each field type
- **Auto-completion**: Missing fields are automatically filled with intelligent defaults

### **Enhanced CSV Format Support**

#### **Format 1: Complete English Headers**

```csv
TransactionAmount,TransactionDate,MerchantID,Location,AccountID,TransactionType,Channel,DeviceType
100.50,2025-06-30T14:30:00Z,Amazon,Online,123,purchase,mobile,Android
25.00,2025-06-30T15:45:00Z,Starbucks,New York,456,purchase,web,iOS
1500.00,2025-06-30T16:00:00Z,ATM,Jakarta,789,withdrawal,atm,ATM
```

#### **Format 2: Indonesian Headers**

```csv
jumlah,waktu,merchant,lokasi,userid,jenis,saluran,device
100500,2025-06-30 14:30:00,Amazon,Online,123,purchase,mobile,Android
25000,2025-06-30 15:45:00,Starbucks,New York,456,purchase,web,iOS
1500000,2025-06-30 16:00:00,ATM,Jakarta,789,withdrawal,atm,ATM
```

#### **Format 3: Minimal Required Fields**

```csv
amount,timestamp,merchant
100.50,2025-06-30T14:30:00Z,Amazon
25.00,2025-06-30T15:45:00Z,Starbucks
1500.00,2025-06-30T16:00:00Z,ATM
```

**Automatic Processing Features:**
- **Smart Defaults**: Missing optional fields are filled with intelligent defaults
- **Currency Detection**: Automatic USD to IDR conversion based on amount analysis
- **Time Processing**: Hour extraction from timestamp for temporal analysis
- **Data Validation**: Comprehensive validation and cleaning before AI processing

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
   - `profile`: Access nama dan foto profil
   - `email`: Access alamat email

## 🧪 Testing & Validation

### Automated Testing Scripts

Project ini menyediakan beberapa script testing untuk memverifikasi functionality:

```bash
# Test semua API endpoints
./test-system.sh

# Test frontend functionality
./test-frontend.sh

# Test routes accessibility
./test-routes.sh
```

> **Note**: Scripts ini adalah basic testing tools untuk development, bukan comprehensive automated test suite.

### Manual Testing

#### Authentication Testing

```bash
# Test Registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass"}'

# Test Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

#### File Upload Testing

```bash
# Test CSV Upload (dengan token)
curl -X POST http://localhost:3001/api/transactions/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@sample_transactions.csv"
```

#### AI Model Testing

```bash
# Test AI Model Health
curl http://localhost:5000/health

# Test AI Prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"transactions":[{"id":"1","amount":1500.00,"merchant":"Unknown","location":"Remote","timestamp":"2025-07-01T10:00:00Z"}]}'
```

### **Enhanced Sample Test Data**

**Available Test Datasets in `model/data/`:**

- **`transactions_realistic_multi_feature.csv`** - Comprehensive dataset with all supported features
- **`bank_transactions_data_2.csv`** - Banking transaction data with fraud patterns
- **`transactions_large.csv`** - Large dataset for performance testing
- **`transactions_normal_only.csv`** - Clean dataset for baseline training

**Test Data Features:**
- **Multi-currency Support**: Both USD and IDR transaction examples
- **Complete Field Coverage**: All optional and required fields included
- **Realistic Patterns**: Based on actual banking transaction patterns
- **Anomaly Examples**: Pre-labeled suspicious transactions for validation
- **Time Diversity**: Various time patterns for temporal analysis

**Sample Test API Call:**

```bash
# Test with enhanced transaction data
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [
      {
        "id": "1",
        "amount": 1500000,
        "timestamp": "2025-07-01T02:30:00Z",
        "merchant": "Unknown ATM",
        "location": "Remote Location",
        "user_id": "suspicious_user",
        "transaction_type": "withdrawal",
        "channel": "atm",
        "device_type": "ATM"
      }
    ]
  }'
```

## 🛡️ Security Features

### **Enhanced Authentication Security**

- **Multi-Method Authentication**: Seamless support for both manual registration and Google OAuth 2.0
- **Secure Password Management**: bcrypt hashing with proper salt rounds for manual accounts
- **Smart OAuth Handling**: Proper handling of null passwords for OAuth-only users
- **JWT Token Security**: Stateless authentication with configurable expiration (1 hour default)
- **Session Management**: Secure token validation and automatic cleanup
- **User Data Isolation**: Complete separation of user data with ownership verification

### **API & Data Security**

- **Comprehensive Route Protection**: JWT middleware protection for all sensitive endpoints
- **Input Validation & Sanitization**: Robust validation for all user inputs and file uploads
- **SQL Injection Prevention**: Prisma ORM provides automatic protection against SQL attacks
- **File Upload Security**: Strict validation of file types, sizes, and content
- **Error Handling**: Secure error responses that don't expose sensitive system information
- **CORS Configuration**: Properly configured cross-origin resource sharing policies

### **Application Security**

- **Environment Variable Protection**: Secure handling of sensitive configuration data
- **Database Security**: Optimized schema with proper relationships and constraints
- **Access Control**: User-based access control for all data operations and batch management
- **Audit Trail**: Comprehensive logging for security monitoring and debugging

## 📈 Performance & Optimization

### **System Performance**

- **Optimized Backend Architecture**: Streamlined Express.js server with efficient middleware stack
- **Database Performance**: PostgreSQL with Prisma ORM for optimized queries and connection pooling
- **Async Processing**: Non-blocking asynchronous operations for file uploads and AI analysis
- **Memory Management**: Efficient memory usage for CSV processing and large datasets
- **API Response Optimization**: Fast response times through optimized route handlers and caching

### **AI Model Performance**

- **Model Efficiency**: Lightweight autoencoder model for real-time fraud detection
- **Preprocessing Pipeline**: Optimized data preprocessing for consistent model input
- **Batch Processing**: Efficient handling of multiple transactions in single API calls
- **Dynamic Thresholding**: Adaptive anomaly detection thresholds based on data distribution

### **Frontend Optimization**

- **Responsive Design**: Mobile-first approach with Tailwind CSS for optimal loading
- **Modular JavaScript**: Organized code structure for better maintainability and performance
- **Efficient API Calls**: Optimized frontend-backend communication with proper error handling
- **User Experience**: Fast loading times and smooth interactions across all devices

## 🔧 Troubleshooting Guide

### Common Issues

#### 1. **Authentication Issues** (Recently Fixed)

```bash
# OAuth Login Issues
Error: "This account was created with Google. Please use Google login."
Solution: Use Google OAuth button instead of manual login for OAuth accounts

# Password validation error
Error: "Password must be at least 6 characters long"
Solution: Ensure password meets minimum requirements for manual registration

# JWT Token expired
Error: "Not authorized, token failed"
Solution: Re-login to get a new token (tokens expire after 1 hour)

# Google OAuth configuration
Error: "Error 400: redirect_uri_mismatch"
Solution: Verify Google Console redirect URI settings
Required: http://localhost:3001/auth/google/callback
```

#### 2. **Database Connection Issues**

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

# Schema issues after updates
Error: "Invalid `prisma.user.create()` invocation"
Solution:
npx prisma migrate reset
npx prisma db push
npx prisma generate
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
pip install -r requirements.txt

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

### Development Tips

#### Database Reset

```bash
# Reset database if needed
npx prisma migrate reset
npx prisma db push
```

#### Debug Mode

```bash
# Enable debug logs
NODE_ENV=development

# Python debug mode
export FLASK_DEBUG=1
python app.py
```

## 🤝 Contributing

We welcome contributions from developers at all skill levels! This project serves as an excellent learning opportunity for those interested in AI, fraud detection, and modern web development.

### **How to Contribute**

1. **Fork** this repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our coding standards
4. **Test thoroughly** using our testing scripts
5. **Commit** with clear messages: `git commit -am 'Add: brief description of your feature'`
6. **Push** to your fork: `git push origin feature/your-feature-name`
7. **Open a Pull Request** with detailed description

### **Contribution Guidelines**

**Code Quality:**

- Follow existing code structure and naming conventions
- Write clear, self-documenting code with appropriate comments
- Ensure all new features include proper error handling
- Test your changes thoroughly before submitting

**Documentation:**

- Update README.md if your changes affect user experience
- Add inline code comments for complex logic
- Update API documentation for new endpoints
- Include examples for new features

**Security:**

- Follow security best practices for authentication and data handling
- Validate all user inputs properly
- Never commit sensitive information (API keys, passwords, etc.)
- Test for common security vulnerabilities

### **Areas for Contribution**

- **🔐 Security Enhancements**: Multi-factor authentication, advanced session management
- **🤖 AI Improvements**: Enhanced ML models, better anomaly detection algorithms
- **🎨 UI/UX**: Improved user interface, better accessibility features
- **📊 Analytics**: Advanced reporting, data visualization improvements
- **🧪 Testing**: Comprehensive test coverage, automated testing pipelines
- **📱 Mobile**: Progressive Web App features, mobile optimization

**Questions?** Open an [Issue](https://github.com/hasib-ashari/fraud-detector/issues) for discussion!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE), allowing for both commercial and non-commercial use with proper attribution.

---

## 👥 Development Team

### **Solo Developer with AI Coding Partners**

Sistem Deteksi Fraud ini merupakan pendekatan modern dalam software development, yang menggabungkan keahlian manusia (human expertise) dengan bantuan AI mutakhir (cutting-edge AI assistance) untuk membangun aplikasi yang robust dan siap digunakan di lingkungan produksi (production-ready application).

#### 👨‍💻 **Lead Developer**
3. **Make your changes** following our coding standards
4. **Test thoroughly** using our testing scripts
5. **Commit** with clear messages: `git commit -am 'Add: brief description of your feature'`
6. **Push** to your fork: `git push origin feature/your-feature-name`
7. **Open a Pull Request** with detailed description

### **Contribution Guidelines**

**Code Quality:**

- Follow existing code structure and naming conventions
- Write clear, self-documenting code with appropriate comments
- Ensure all new features include proper error handling
- Test your changes thoroughly before submitting

**Documentation:**

- Update README.md if your changes affect user experience
- Add inline code comments for complex logic
- Update API documentation for new endpoints
- Include examples for new features

**Security:**

- Follow security best practices for authentication and data handling
- Validate all user inputs properly
- Never commit sensitive information (API keys, passwords, etc.)
- Test for common security vulnerabilities

### **Areas for Contribution**

- **🔐 Security Enhancements**: Multi-factor authentication, advanced session management
- **🤖 AI Improvements**: Enhanced ML models, better anomaly detection algorithms
- **🎨 UI/UX**: Improved user interface, better accessibility features
- **📊 Analytics**: Advanced reporting, data visualization improvements
- **🧪 Testing**: Comprehensive test coverage, automated testing pipelines
- **📱 Mobile**: Progressive Web App features, mobile optimization

**Questions?** Open an [Issue](https://github.com/hasib-ashari/fraud-detector/issues) for discussion!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE), allowing for both commercial and non-commercial use with proper attribution.

---

## 👥 Development Team

### **Solo Developer with AI Coding Partners**

Sistem Deteksi Fraud ini merupakan pendekatan modern dalam software development, yang menggabungkan keahlian manusia (human expertise) dengan bantuan AI mutakhir (cutting-edge AI assistance) untuk membangun aplikasi yang robust dan siap digunakan di lingkungan produksi (production-ready application).

#### 👨‍💻 **Lead Developer**

**Hasib Ashari** - Full-Stack Developer & AI/ML Engineer

- **System Architecture**: Designed scalable, modular architecture with proper separation of concerns
- **Backend Development**: Node.js, Express.js, Prisma ORM, PostgreSQL integration
- **Frontend Development**: Responsive UI with Tailwind CSS and modern JavaScript
- **AI/ML Integration**: TensorFlow autoencoder models and Google Gemini API integration
- **Security Implementation**: JWT authentication, OAuth integration, and data protection
- **DevOps & Testing**: Development environment setup and comprehensive testing strategies

#### 🤖 **AI Development Partners**

**Primary AI Coding Assistants:**

- **GitHub Copilot** - Real-time code completion, intelligent suggestions, and pair programming support
- **Google Gemini** - Advanced problem solving, architecture planning, and code optimization
- **ChatGPT** - Complex logic implementation, debugging assistance, and technical consultation
- **Claude** - Code review, security auditing, and comprehensive documentation support

### **AI-Enhanced Development Process**

**Collaborative Development Areas:**

- **🔧 Code Generation**: Automated boilerplate creation, API endpoint development, and database query optimization
- **🐛 Debugging & Testing**: Intelligent error analysis, solution recommendations, and comprehensive test case generation
- **📚 Technical Documentation**: Professional documentation writing, API reference creation, and user guide development
- **🏗️ Architecture Design**: System design decisions, technology selection, and scalability planning
- **🔐 Security Implementation**: Vulnerability assessment, security best practices, and compliance guidance
- **⚡ Performance Optimization**: Code efficiency analysis, database optimization, and system performance tuning

### **Development Methodology**

**Modern AI-Assisted Workflow:**

1. **🎯 Planning Phase**: Collaborative architecture design and requirement analysis
2. **💻 Implementation**: Pair programming with AI assistance for optimal code quality
3. **🧪 Quality Assurance**: Automated testing strategies and comprehensive validation
4. **📖 Documentation**: Professional technical writing with AI-enhanced clarity
5. **🔧 Optimization**: Performance tuning and security hardening
6. **🚀 Deployment**: Production readiness validation and deployment strategies

### **🏆 Project Achievements**

**Technical Excellence:**

- ✅ **Complete Full-Stack System**: Modern fraud detection platform with end-to-end functionality
- ✅ **Advanced AI Integration**: Custom ML models combined with Google Gemini AI for comprehensive analysis
- ✅ **Enterprise-Grade Security**: Multi-layer authentication, data protection, and secure API design
- ✅ **Scalable Architecture**: Modular design ready for production deployment and scaling
- ✅ **Production-Ready Code**: Clean, maintainable codebase with comprehensive error handling
- ✅ **Comprehensive Testing**: Robust testing suite and validation workflows

**Innovation Highlights:**

- **Human-AI Collaboration**: Demonstrated effective partnership between human expertise and AI assistance
- **Modern Tech Stack**: Integration of cutting-edge technologies in a cohesive, working system
- **Learning Platform**: Excellent foundation for understanding modern web development and AI integration
- **Industry Application**: Real-world applicability for financial fraud detection and risk management

### **🎓 Educational Impact**

This project serves as a comprehensive learning resource for:

- **Full-Stack Development**: Modern web application development with Node.js and React-style frontends
- **AI Integration**: Practical implementation of machine learning models and AI APIs
- **Security Best Practices**: Authentication, authorization, and data protection in web applications
- **Database Design**: Relational database modeling and ORM usage
- **DevOps Practices**: Development environment setup, testing, and deployment strategies

---

> **💡 Learning Journey**: Proyek ini menunjukkan integrasi AI-assisted development ke dalam alur kerja modern software engineering, yang mempercepat siklus pengembangan (development cycles) tanpa menghilangkan kontrol manusia dalam pengambilan keputusan, debugging, dan perancangan arsitektur (architectural design).
>
> **🚀 Future Ready**: Sistem ini dibangun dengan pendekatan modular, scalable, dan maintainable, sehingga dapat menjadi baseline yang andal untuk use case deteksi fraud secara real-time, serta siap untuk deployment lintas environment di dunia nyata.

---
