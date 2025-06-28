import os
import logging

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    import joblib
    import pandas as pd
    import numpy as np
except ImportError as e:
    print(f"Dependency error: {e}. Please install required packages with:")
    print("pip install flask flask-cors pandas numpy scikit-learn joblib")
    exit(1)

# 1. Konfigurasi Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)

# 2. Inisialisasi Flask
app = Flask(__name__)
CORS(app)

# 3. Muat Model
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'isolation_forest_model.joblib')

try:
    model = joblib.load(model_path)
    logging.info("Model AI berhasil dimuat.")
except FileNotFoundError:
    logging.error(
        f"File model tidak ditemukan! Pastikan '{model_path}' ada. Jalankan train.py terlebih dahulu.")
    model = None


@app.route('/health', methods=['GET'])
def health_check():
    model_status = "loaded" if model is not None else "not_loaded"
    return jsonify({
        'status': 'healthy',
        'model_status': model_status,
        'message': 'Fraud Detection AI Service is running'
    })


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model tidak tersedia. Jalankan train.py terlebih dahulu.'}), 500

    try:
        json_data = request.get_json()
        if not json_data or 'transactions' not in json_data:
            return jsonify({'error': 'Format data tidak valid. Harus memiliki field "transactions".'}), 400

        transactions = json_data['transactions']
        if not isinstance(transactions, list) or len(transactions) == 0:
            return jsonify({'error': 'Field "transactions" harus berupa list dan tidak boleh kosong.'}), 400

        df = pd.DataFrame(transactions)
        # --- Validasi kolom wajib ---
        required_cols = ['amount', 'timestamp', 'merchant', 'location']
        for col in required_cols:
            if col not in df.columns:
                return jsonify({'error': f"Data harus memiliki kolom '{col}'"}), 400

        # --- Validasi numerik pada amount ---
        if not pd.api.types.is_numeric_dtype(df['amount']):
            try:
                df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
                if df['amount'].isnull().any():
                    return jsonify({'error': "Semua nilai 'amount' harus berupa angka yang valid"}), 400
            except:
                return jsonify({'error': "Tidak dapat mengkonversi 'amount' ke format numerik"}), 400

        # --- Prediksi anomaly ---
        amounts = df[['amount']]
        predictions = model.predict(amounts)
        scores = model.decision_function(amounts)

        # --- Susun hasil prediksi, sertakan field input penting ---
        results = []
        for i in range(len(df)):
            results.append({
                'id': df.iloc[i].get('id', i),
                'timestamp': df.iloc[i].get('timestamp', None),
                'merchant': df.iloc[i].get('merchant', None),
                'location': df.iloc[i].get('location', None),
                'amount': float(df.iloc[i]['amount']),
                'isAnomaly': bool(predictions[i] == -1),
                'anomalyScore': float(scores[i])
            })

        logging.info(
            f"Berhasil memproses {len(results)} transaksi untuk prediksi.")
        return jsonify(results)

    except Exception as e:
        logging.error(f"Error dalam prediksi: {str(e)}")
        return jsonify({'error': f'Terjadi kesalahan saat memproses data: {str(e)}'}), 500


def main():
    port = int(os.environ.get("PORT", 5000))
    debug = bool(os.environ.get("DEBUG", True))
    app.run(port=port, debug=debug)


if __name__ == '__main__':
    main()
