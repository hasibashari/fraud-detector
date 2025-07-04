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

        # Add missing fields with defaults if they don't exist
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
        # Handle missing values dengan nilai yang bermakna untuk model
        if 'city' not in df.columns:
            if 'location' in df.columns:
                df['city'] = df['location']
                logging.info("Mapped location to city")
            else:
                df['city'] = 'Unknown'
                logging.info("Added default city field (Unknown)")

        # Handle missing values untuk field optional
        df['user_id'] = df['user_id'].fillna('Unknown')
        df['transaction_type'] = df['transaction_type'].fillna('Unknown')
        df['channel'] = df['channel'].fillna('Unknown')
        df['device_type'] = df['device_type'].fillna('Unknown')
        df['city'] = df['city'].fillna('Unknown')

        # Clean and convert user_id to numeric format (optional, OneHotEncoder can handle string)
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

        # Fitur yang digunakan sesuai dengan train.py
        required_features = ['amount', 'hour', 'user_id',
                             'transaction_type', 'channel', 'merchant', 'device_type', 'city']
        missing_cols = set(required_features) - set(df.columns)
        if missing_cols:
            logging.error(f"Missing required columns: {missing_cols}")
            return jsonify({'error': f"Data harus memiliki kolom: {list(missing_cols)}"}), 400

        # Store original timestamps for output
        original_timestamps = df.get('timestamp', None)

        # Transformasi fitur sesuai dengan yang digunakan di train.py
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
        threshold = np.percentile(errors, 96)
        is_anomaly = errors > threshold

        logging.info(
            f"Reconstruction errors - min: {errors.min():.6f}, max: {errors.max():.6f}, mean: {errors.mean():.6f}")
        logging.info(f"Dynamic threshold: {threshold:.6f}")
        logging.info(
            f"Anomalies detected: {is_anomaly.sum()}/{len(is_anomaly)}")

        results = []
        for i in range(len(df)):
            timestamp_value = original_timestamps.iloc[i] if original_timestamps is not None else None
            results.append({
                'id': str(df.iloc[i].get('id', i)),
                'timestamp': str(timestamp_value) if timestamp_value is not None else None,
                'merchant': str(df.iloc[i].get('merchant', '')),
                'location': str(df.iloc[i].get('city', '')),
                'amount': float(df.iloc[i]['amount']),
                'hour': int(df.iloc[i].get('hour', 12)),
                'user_id': str(df.iloc[i].get('user_id', 0)),
                'transaction_type': str(df.iloc[i].get('transaction_type', '')),
                'channel': str(df.iloc[i].get('channel', '')),
                'device_type': str(df.iloc[i].get('device_type', '')),
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
            "features_used": ["amount", "hour", "user_id", "transaction_type", "channel", "merchant", "device_type", "city"],
            "preprocessing": "StandardScaler for [amount, hour], OneHotEncoder for [user_id, transaction_type, channel, merchant, device_type, city]",
            "model_type": "AutoEncoder for anomaly detection",
            "threshold": "Dynamic threshold based on 95th percentile of reconstruction errors",
            "trained_on": "Normal transactions only (is_true_anomaly == 0)"
        },
        "output_format": {
            "id": "Transaction ID",
            "timestamp": "Original timestamp if provided",
            "merchant": "Merchant name",
            "location": "City",
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
