# =========================
# Import Library & Setup Logging
# =========================
import os
import logging
import joblib

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    from tensorflow import keras
    import numpy as np
    import pandas as pd
except ImportError as e:
    print(f"Dependency error: {e}. Please install required packages with:")
    print("pip install flask flask-cors pandas numpy scikit-learn joblib")
    exit(1)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)

# =========================
# Inisialisasi Flask App & CORS
# =========================
app = Flask(__name__)
CORS(app)

# =========================
# Load Model & Preprocessor
# =========================
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'autoencoder_model.keras')
preprocessor_path = os.path.join(script_dir, 'preprocessor_pipeline.joblib')
try:
    autoencoder = keras.models.load_model(model_path, compile=False)
    logging.info("AutoEncoder berhasil dimuat.")
except Exception as e:
    logging.error(f"Gagal memuat model: {e}")
    autoencoder = None

try:
    preprocessor = joblib.load(preprocessor_path)
    logging.info("Preprocessor berhasil dimuat.")
except Exception as e:
    logging.error(f"Gagal memuat preprocessor: {e}")
    preprocessor = None

# =========================
# Endpoint Health Check
# =========================


@app.route('/health', methods=['GET'])
def health_check():
    model_status = "loaded" if autoencoder is not None else "not_loaded"
    return jsonify({
        'status': 'healthy',
        'model_status': model_status,
        'message': 'Fraud Detection AI Service is running'
    })

# =========================
# Endpoint Prediksi Anomali
# =========================


@app.route('/predict', methods=['POST'])
def predict():
    if autoencoder is None or preprocessor is None:
        logging.error("Model atau preprocessor tidak tersedia")
        return jsonify({'error': 'Model atau preprocessor tidak tersedia. Jalankan train.py terlebih dahulu.'}), 500

    try:
        json_data = request.get_json()
        logging.info(f"Received data: {json_data}")

        if not json_data:
            logging.error("No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400

        if 'transactions' not in json_data:
            logging.error("Missing 'transactions' field in JSON data")
            return jsonify({'error': 'Format data tidak valid. Harus memiliki field "transactions".'}), 400

        transactions = json_data['transactions']
        logging.info(
            f"Number of transactions received: {len(transactions) if isinstance(transactions, list) else 'Not a list'}")

        if not isinstance(transactions, list):
            logging.error("'transactions' field is not a list")
            return jsonify({'error': 'Field "transactions" harus berupa list.'}), 400

        if len(transactions) == 0:
            logging.error("Empty transactions list")
            return jsonify({'error': 'Field "transactions" tidak boleh kosong.'}), 400

        df = pd.DataFrame(transactions)
        logging.info(f"DataFrame columns: {list(df.columns)}")

        # =========================
        # Tambahkan field yang hilang dengan nilai default jika tidak ada di data input
        # =========================
        if 'user_id' not in df.columns:
            df['user_id'] = 0
            logging.info("Added default user_id field (0)")
        if 'hour' not in df.columns:
            if 'timestamp' in df.columns:
                try:
                    temp_timestamps = pd.to_datetime(
                        df['timestamp'], errors='coerce')
                    if temp_timestamps.isna().any():
                        logging.warning(
                            "Some timestamps could not be parsed, using default hour for invalid entries")
                    df['hour'] = temp_timestamps.dt.hour.fillna(12).astype(int)
                    logging.info(
                        f"Extracted hour from timestamp. Sample hours: {df['hour'].head().tolist()}")
                except Exception as e:
                    df['hour'] = 12
                    logging.warning(
                        f"Could not extract hour from timestamp ({e}), using default value 12")
            else:
                df['hour'] = 12
                logging.info(
                    "No timestamp field found, added default hour field (12)")
        else:
            df['hour'] = pd.to_numeric(
                df['hour'], errors='coerce').fillna(12).astype(int)
            df['hour'] = df['hour'].clip(0, 23)
            logging.info(
                f"Using provided hour values. Sample hours: {df['hour'].head().tolist()}")

        # Add default values for all required fields if missing
        if 'transaction_type' not in df.columns:
            df['transaction_type'] = 'purchase'
            logging.info("Added default transaction_type field (purchase)")
        if 'channel' not in df.columns:
            df['channel'] = 'mobile'
            logging.info("Added default channel field (mobile)")
        if 'merchant' not in df.columns:
            df['merchant'] = 'Unknown'
            logging.info("Added default merchant field (Unknown)")
        if 'device_type' not in df.columns:
            df['device_type'] = 'Android'
            logging.info("Added default device_type field (Android)")
        # =========================
        # Handle missing values untuk field yang wajib (required) dan optional
        # =========================
        if 'location' not in df.columns:
            df['location'] = 'Unknown'
            logging.info("Added default location field (Unknown)")

        # Handle missing values untuk field optional
        df['user_id'] = df['user_id'].fillna('Unknown')
        df['transaction_type'] = df['transaction_type'].fillna('Unknown')
        df['channel'] = df['channel'].fillna('Unknown')
        df['device_type'] = df['device_type'].fillna('Unknown')
        df['location'] = df['location'].fillna('Unknown')

        # =========================
        # Bersihkan dan konversi user_id ke format numerik jika memungkinkan
        # (OneHotEncoder bisa handle string, tapi lebih baik konsisten)
        # =========================
        def convert_user_id(user_id):
            if pd.isna(user_id) or user_id == '' or user_id is None:
                return 0
            try:
                return int(float(str(user_id)))
            except (ValueError, TypeError):
                return str(user_id)
        df['user_id'] = df['user_id'].apply(convert_user_id)
        logging.info(
            f"Processed user_id. Sample values: {df['user_id'].head().tolist()}")

        # =========================
        # Daftar fitur yang digunakan harus sama persis dengan saat training
        # =========================
        required_features = ['amount', 'hour', 'user_id',
                             'transaction_type', 'channel', 'merchant', 'device_type', 'location']
        missing_cols = set(required_features) - set(df.columns)
        if missing_cols:
            logging.error(f"Missing required columns: {missing_cols}")
            return jsonify({'error': f"Data harus memiliki kolom: {list(missing_cols)}"}), 400

        # =========================
        # Analisis distribusi data asli sebelum preprocessing
        # Untuk debugging: cek range, mean, std, dan unique values
        # =========================
        logging.info("=== ORIGINAL DATA ANALYSIS ===")
        for feature in required_features:
            if feature in ['amount', 'hour']:  # Numeric features
                values = df[feature].astype(float)
                logging.info(
                    f"{feature} - min: {values.min():.2f}, max: {values.max():.2f}, mean: {values.mean():.2f}, std: {values.std():.2f}")
            else:  # Categorical features
                unique_vals = df[feature].unique()
                logging.info(
                    f"{feature} - unique values: {len(unique_vals)}, samples: {list(unique_vals[:5])}")

        # =========================
        # Deteksi otomatis skala amount dan mata uang
        # Jika amount sangat besar, lakukan scaling
        # Jika amount kemungkinan USD, konversi ke IDR
        # =========================
        amount_mean = df['amount'].mean()
        if amount_mean > 2000000:  # If average amount > 2M, likely needs scaling
            logging.warning(
                f"Amount values seem very large (mean: {amount_mean:.0f}). This might cause high reconstruction errors.")
            logging.warning(
                "Applying automatic scaling: dividing amount by 1000 to match training data scale.")
            # Apply automatic scaling
            df['amount'] = df['amount'] / 1000  # Scale down by 1000x
            logging.info(
                f"Applied automatic scaling. New amount mean: {df['amount'].mean():.2f}")
        elif amount_mean > 1000000:  # Warning but no scaling for 1M-2M range
            logging.warning(
                f"Amount values are large (mean: {amount_mean:.0f}). Monitor for high reconstruction errors.")
            logging.info(
                "No automatic scaling applied (amount < 2M threshold).")
        # Deteksi mata uang berdasarkan range amount
        if amount_mean < 100000:  # Kemungkinan USD jika rata-rata < 100K
            logging.warning(
                f"Amount values appear to be in USD (mean: {amount_mean:.0f}). Converting to IDR.")
            # Konversi USD ke IDR (kurs sekitar 16.000)
            usd_to_idr_rate = 16000
            df['amount'] = df['amount'] * usd_to_idr_rate
            logging.info(
                f"Converted USD to IDR. New amount mean: {df['amount'].mean():.0f} IDR")
        elif amount_mean > 2000000:  # Warning jika > 2M IDR
            logging.warning(
                f"Amount values sangat besar (mean: {amount_mean:.0f}). Ini bisa menyebabkan kesalahan rekonstruksi yang tinggi.")
            logging.info(
                "Pertimbangkan untuk menyesuaikan threshold deteksi anomali.")

        # =========================
        # Simpan timestamp asli untuk output (jika ada)
        # =========================
        original_timestamps = df.get('timestamp', None)

        # =========================
        # Transformasi fitur sesuai pipeline training (preprocessing)
        # =========================
        try:
            X_features = df[required_features]
            logging.info(
                f"Data types before preprocessing: {X_features.dtypes.to_dict()}")
            logging.info(
                f"Sample data before preprocessing:\n{X_features.head()}")
            X = preprocessor.transform(X_features)
            X = np.asarray(X).astype(np.float32)
            logging.info(f"Data shape after preprocessing: {X.shape}")
        except Exception as e:
            logging.error(f"Preprocessing error: {str(e)}")
            return jsonify({'error': f"Gagal memproses data dengan preprocessor: {str(e)}"}), 500

        reconstructed = autoencoder.predict(X)
        errors = np.mean(np.square(X - reconstructed), axis=1)

        # =========================
        # Logging detail hasil preprocessing dan error rekonstruksi
        # Untuk debugging dan analisis performa model
        # =========================
        logging.info("=== DEBUGGING ANALYSIS ===")
        logging.info(f"Input data shape: {X.shape}")
        logging.info(f"First 5 samples of preprocessed data:\n{X[:5]}")
        logging.info(f"Data range - min: {X.min():.6f}, max: {X.max():.6f}")

        # Analysis of reconstruction errors
        logging.info(f"Reconstruction errors statistics:")
        logging.info(f"  Min: {errors.min():.6f}")
        logging.info(f"  Max: {errors.max():.6f}")
        logging.info(f"  Mean: {errors.mean():.6f}")
        logging.info(f"  Median: {np.median(errors):.6f}")
        logging.info(f"  Std: {errors.std():.6f}")
        logging.info(f"  25th percentile: {np.percentile(errors, 25):.6f}")
        logging.info(f"  75th percentile: {np.percentile(errors, 75):.6f}")
        logging.info(f"  95th percentile: {np.percentile(errors, 95):.6f}")
        logging.info(f"  99th percentile: {np.percentile(errors, 99):.6f}")

        # Sample of individual errors
        logging.info(f"First 10 reconstruction errors: {errors[:10]}")

        # =========================
        # Ambil threshold dari threshold.json (hasil training/validasi)
        # Jika threshold terlalu ketat, otomatis switch ke dynamic threshold (percentile)
        # =========================
        import json
        threshold_path = os.path.join(script_dir, 'threshold.json')
        try:
            with open(threshold_path, 'r') as f:
                threshold_data = json.load(f)
                static_threshold = float(
                    threshold_data.get('threshold', 0.005))
        except Exception as e:
            logging.warning(
                f"Gagal membaca threshold.json, menggunakan default threshold 0.005. Error: {e}")
            static_threshold = 0.005

        # Check if static threshold results in too many anomalies (> 50%)
        static_anomalies = (errors > static_threshold).sum()
        static_anomaly_rate = static_anomalies / len(errors)

        if static_anomaly_rate > 0.5:  # If > 50% anomalies, use dynamic threshold
            # 95th percentile = ~5% anomalies
            dynamic_threshold = np.percentile(errors, 95)
            threshold = dynamic_threshold
            logging.warning(
                f"Static threshold ({static_threshold:.6f}) would mark {static_anomaly_rate*100:.1f}% as anomalies.")
            logging.warning(
                f"Using dynamic threshold (95th percentile): {threshold:.6f}")
        else:
            threshold = static_threshold
            logging.info(
                f"Using static threshold from threshold.json: {threshold:.6f}")

        is_anomaly = errors > threshold

        # =========================
        # Analisis threshold dan distribusi error untuk evaluasi deteksi anomali
        # =========================
        logging.info("=== THRESHOLD ANALYSIS ===")
        logging.info(f"Loaded threshold: {threshold:.6f}")
        logging.info(
            f"Errors above threshold: {(errors > threshold).sum()}/{len(errors)} ({100*(errors > threshold).sum()/len(errors):.1f}%)")
        logging.info(
            f"Errors below threshold: {(errors <= threshold).sum()}/{len(errors)} ({100*(errors <= threshold).sum()/len(errors):.1f}%)")

        # =========================
        # Bandingkan hasil deteksi anomali dengan threshold dinamis (percentile)
        # =========================
        dynamic_95 = np.percentile(errors, 95)
        dynamic_97 = np.percentile(errors, 97)
        dynamic_99 = np.percentile(errors, 99)
        logging.info(
            f"If using 95th percentile threshold ({dynamic_95:.6f}): {(errors > dynamic_95).sum()}/{len(errors)} anomalies")
        logging.info(
            f"If using 97th percentile threshold ({dynamic_97:.6f}): {(errors > dynamic_97).sum()}/{len(errors)} anomalies")
        logging.info(
            f"If using 99th percentile threshold ({dynamic_99:.6f}): {(errors > dynamic_99).sum()}/{len(errors)} anomalies")

        logging.info(
            f"Reconstruction errors - min: {errors.min():.6f}, max: {errors.max():.6f}, mean: {errors.mean():.6f}")
        logging.info(f"Loaded threshold from threshold.json: {threshold:.6f}")
        logging.info(
            f"Anomalies detected: {is_anomaly.sum()}/{len(is_anomaly)}")

        # =========================
        # Susun hasil prediksi untuk setiap transaksi
        # =========================
        for i in range(len(df)):
            timestamp_value = original_timestamps.iloc[i] if original_timestamps is not None else None
            results.append({
                'id': str(df.iloc[i].get('id', i)),
                'timestamp': str(timestamp_value) if timestamp_value is not None else None,
                'merchant': str(df.iloc[i].get('merchant', '')),
                'location': str(df.iloc[i].get('location', '')),
                'amount': float(df.iloc[i]['amount']),
                'hour': int(df.iloc[i].get('hour', 12)),
                'user_id': str(df.iloc[i].get('user_id', 0)),
                'transaction_type': str(df.iloc[i].get('transaction_type', '')),
                'channel': str(df.iloc[i].get('channel', '')),
                'device_type': str(df.iloc[i].get('device_type', '')),
                'isAnomaly': bool(is_anomaly[i]),
                'anomalyScore': float(errors[i])
            })

        # =========================
        # Logging akhir: jumlah transaksi yang berhasil diproses
        # =========================
        # =========================
        # Return hasil prediksi dalam format JSON
        # =========================
        return jsonify(results)

    except Exception as e:
        logging.error(f"Error dalam prediksi: {str(e)}")
        return jsonify({'error': f'Terjadi kesalahan saat memproses data: {str(e)}'}), 500

# =========================
# Endpoint Contoh Format Data
# =========================


@app.route('/test-format', methods=['GET'])
def test_format():
    """Endpoint to show the expected data format for predictions"""
    sample_data = {
        "transactions": [
            {
                "id": "1",
                "amount": 100.50,
                "timestamp": "2025-06-29T14:30:00Z",
                "user_id": 123,
                "hour": 14,
                "transaction_type": "purchase",
                "channel": "mobile",
                "merchant": "Amazon",
                "device_type": "Android",
                "city": "Jakarta"
            },
            {
                "id": "2",
                "amount": 25.00,
                "timestamp": "2025-06-29T15:45:00Z",
                "user_id": "user456",
                "hour": 15,
                "transaction_type": "transfer",
                "channel": "web",
                "merchant": "Starbucks",
                "device_type": "iOS",
                "city": "New York"
            },
            {
                "id": "3",
                "amount": 1500.00,
                "user_id": 789,
                "transaction_type": "withdrawal",
                "channel": "atm",
                "merchant": "Unknown",
                "device_type": "ATM",
                "city": "Unknown"
            }
        ]
    }

    return jsonify({
        "message": "Sample data format for /predict endpoint",
        "sample_data": sample_data,
        "required_fields": ["amount", "timestamp", "merchant"],
        "optional_fields": ["user_id", "transaction_type", "channel", "device_type", "city"],
        "field_details": {
            "amount": "Numeric value (e.g., 100.50) - REQUIRED",
            "timestamp": "ISO timestamp string - REQUIRED",
            "merchant": "String nama merchant - REQUIRED",
            "user_id": "String user ID. Missing -> 'Unknown'",
            "transaction_type": "String jenis transaksi. Missing -> 'Unknown'",
            "channel": "String channel transaksi. Missing -> 'Unknown'",
            "device_type": "String tipe device. Missing -> 'Unknown'",
            "city": "String city. Missing -> 'Unknown'",
            "device_type": "String, e.g., Android/iOS/ATM. Missing -> 'Android'",
            "city": "String city. Missing -> 'Unknown'",
            "timestamp": "Optional ISO format string for output reference and hour extraction",
            "id": "Optional transaction ID for reference"
        },
        "model_info": {
            "features_used": ["amount", "hour", "user_id", "transaction_type", "channel", "merchant", "device_type", "location"],
            "preprocessing": "StandardScaler for [amount, hour], OneHotEncoder for [user_id, transaction_type, channel, merchant, device_type, location]",
            "model_type": "AutoEncoder for anomaly detection",
            "threshold": "Dynamic threshold based on error distribution",
            "trained_on": "Normal transactions only (is_true_anomaly == 0)"
        },
        "output_format": {
            "id": "Transaction ID",
            "timestamp": "Original timestamp if provided",
            "merchant": "Merchant name",
            "location": "Location/City",
            "amount": "Transaction amount",
            "hour": "Hour of transaction",
            "user_id": "Processed user ID",
            "transaction_type": "Transaction type",
            "channel": "Channel",
            "device_type": "Device type",
            "isAnomaly": "Boolean - true if anomalous",
            "anomalyScore": "Float - reconstruction error score"
        }
    })

# =========================
# Main Entrypoint
# =========================


def main():
    port = int(os.environ.get("PORT", 5000))
    debug = bool(os.environ.get("DEBUG", True))
    app.run(port=port, debug=debug)


if __name__ == '__main__':
    main()
