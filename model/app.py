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
            return jsonify({'error': 'Format data tidak valid. Harus memiliki field \"transactions\".'}), 400

        transactions = json_data['transactions']
        logging.info(
            f"Number of transactions received: {len(transactions) if isinstance(transactions, list) else 'Not a list'}")

        if not isinstance(transactions, list):
            logging.error("'transactions' field is not a list")
            return jsonify({'error': 'Field \"transactions\" harus berupa list.'}), 400

        if len(transactions) == 0:
            logging.error("Empty transactions list")
            return jsonify({'error': 'Field \"transactions\" tidak boleh kosong.'}), 400

        df = pd.DataFrame(transactions)
        logging.info(f"DataFrame columns: {list(df.columns)}")

        # Add missing fields with defaults if they don't exist
        if 'user_id' not in df.columns:
            df['user_id'] = 0  # Default user_id sebagai integer
            logging.info("Added default user_id field (0)")

        if 'hour' not in df.columns:
            # Extract hour from timestamp if available
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
                    df['hour'] = 12  # Default ke jam 12
                    logging.warning(
                        f"Could not extract hour from timestamp ({e}), using default value 12")
            else:
                df['hour'] = 12  # Default ke jam 12
                logging.info(
                    "No timestamp field found, added default hour field (12)")

        # Add default values for merchant and location if missing
        if 'merchant' not in df.columns:
            df['merchant'] = 'Unknown'
            logging.info("Added default merchant field (Unknown)")

        if 'location' not in df.columns:
            df['location'] = 'Unknown'
            logging.info("Added default location field (Unknown)")

        # Clean and convert user_id to numeric format
        if 'user_id' in df.columns:
            # Convert user_id to numeric, use hash for string values
            def convert_user_id(user_id):
                if pd.isna(user_id) or user_id == '' or user_id is None:
                    return 0
                try:
                    # Try to convert to int first
                    return int(float(str(user_id)))
                except (ValueError, TypeError):
                    # If string, use hash to convert to numeric
                    # Keep it reasonable size
                    return abs(hash(str(user_id))) % 1000000

            df['user_id'] = df['user_id'].apply(convert_user_id)
            logging.info(
                f"Converted user_id to numeric. Sample values: {df['user_id'].head().tolist()}")

        # Fitur yang digunakan sesuai dengan train.py
        required_features = ['amount', 'user_id',
                             'hour', 'merchant', 'location']
        missing_cols = set(required_features) - set(df.columns)
        if missing_cols:
            logging.error(f"Missing required columns: {missing_cols}")
            return jsonify({'error': f"Data harus memiliki kolom: {list(missing_cols)}"}), 400

        # Store original timestamps for output
        original_timestamps = df.get('timestamp', None)

        # Transformasi fitur sesuai dengan yang digunakan di train.py
        try:
            # Pilih fitur yang sama dengan train.py
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
        # Prediksi menggunakan autoencoder
        reconstructed = autoencoder.predict(X)

        # Hitung reconstruction error
        errors = np.mean(np.square(X - reconstructed), axis=1)

        # Gunakan threshold dinamis berdasarkan percentile 95
        threshold = np.percentile(errors, 95)
        is_anomaly = errors > threshold

        logging.info(
            f"Reconstruction errors - min: {errors.min():.6f}, max: {errors.max():.6f}, mean: {errors.mean():.6f}")
        logging.info(f"Dynamic threshold: {threshold:.6f}")
        logging.info(
            f"Anomalies detected: {is_anomaly.sum()}/{len(is_anomaly)}")

        results = []
        for i in range(len(df)):
            # Use original timestamp if available, otherwise use the ID-based index
            timestamp_value = original_timestamps.iloc[i] if original_timestamps is not None else None

            results.append({
                'id': str(df.iloc[i].get('id', i)),
                'timestamp': str(timestamp_value) if timestamp_value is not None else None,
                'merchant': str(df.iloc[i].get('merchant', '')),
                'location': str(df.iloc[i].get('location', '')),
                'amount': float(df.iloc[i]['amount']),
                'hour': int(df.iloc[i].get('hour', 12)),
                'user_id': int(df.iloc[i].get('user_id', 0)),
                'isAnomaly': bool(is_anomaly[i]),
                'anomalyScore': float(errors[i])
            })

        logging.info(
            f"Berhasil memproses {len(results)} transaksi untuk prediksi.")
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
                "timestamp": "2025-06-29T14:30:00Z",  # Optional, untuk output saja
                "user_id": 123,  # Bisa string atau number
                "hour": 14,  # 0-23, akan diekstrak dari timestamp jika tidak ada
                "merchant": "Amazon",
                "location": "Online"
            },
            {
                "id": "2",
                "amount": 25.00,
                "timestamp": "2025-06-29T15:45:00Z",  # Optional
                "user_id": "user456",  # String akan dikonversi ke hash
                "hour": 15,
                "merchant": "Starbucks",
                "location": "New York"
            },
            {
                "id": "3",
                "amount": 1500.00,  # High amount - potential anomaly
                "user_id": 789,
                "merchant": "Unknown",
                "location": "Unknown"
                # hour akan default ke 12 jika tidak ada timestamp
            }
        ]
    }

    return jsonify({
        "message": "Sample data format for /predict endpoint",
        "sample_data": sample_data,
        "required_fields": ["amount"],
        "auto_generated_fields": ["user_id", "hour", "merchant", "location"],
        "optional_fields": ["id", "timestamp"],
        "field_details": {
            "amount": "Numeric value (e.g., 100.50) - REQUIRED",
            "user_id": "Numeric or string identifier. Missing -> 0, String -> hash conversion",
            "hour": "Integer 0-23. Missing -> extracted from timestamp or default 12",
            "merchant": "String identifier. Missing -> 'Unknown'",
            "location": "String location. Missing -> 'Unknown'",
            "timestamp": "Optional ISO format string for output reference and hour extraction",
            "id": "Optional transaction ID for reference"
        },
        "model_info": {
            "features_used": ["amount", "user_id", "hour", "merchant", "location"],
            "preprocessing": "StandardScaler for [amount, user_id, hour], OneHotEncoder for [merchant, location]",
            "model_type": "AutoEncoder for anomaly detection",
            "threshold": "Dynamic threshold based on 95th percentile of reconstruction errors",
            "trained_on": "Normal transactions only (is_true_anomaly == 0)"
        },
        "output_format": {
            "id": "Transaction ID",
            "timestamp": "Original timestamp if provided",
            "merchant": "Merchant name",
            "location": "Location",
            "amount": "Transaction amount",
            "hour": "Hour of transaction",
            "user_id": "Processed user ID",
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
