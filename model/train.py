# model/train.py

# 1. Import Library
import os
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import logging

# 2. Konfigurasi Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)

# 3. Muat Dataset
script_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(script_dir, 'data', 'unsupervised_train.csv')
try:
    df = pd.read_csv(data_path)
    logging.info(f"Dataset berhasil dimuat dari {data_path}")
    logging.info(f"Jumlah record: {len(df)}")
    logging.info(f"Kolom yang tersedia: {list(df.columns)}")
except FileNotFoundError:
    logging.error(
        f"File {data_path} tidak ditemukan. Pastikan file ada di folder 'data'.")
    exit(1)
except Exception as e:
    logging.error(f"Error saat membaca file CSV: {e}")
    exit(1)

# 4. Validasi Data
if 'amount' not in df.columns:
    logging.error("Kolom 'amount' tidak ditemukan di dataset.")
    exit(1)
if df.empty:
    logging.error("Dataset kosong.")
    exit(1)
if not pd.api.types.is_numeric_dtype(df['amount']):
    logging.error("Kolom 'amount' harus bertipe numerik.")
    exit(1)
if (df['amount'] < 0).any():
    logging.warning("Terdapat nilai negatif pada kolom 'amount'.")

# 5. Pilih Fitur
features = df[['amount']]
logging.info(
    f"Fitur yang digunakan untuk training: {features.columns.tolist()}")

# 6. Inisialisasi dan Latih Model
model = IsolationForest(n_estimators=100, contamination=0.25, random_state=42)
model.fit(features)
logging.info("Model berhasil dilatih.")

# 7. Simpan Model
model_filename = os.path.join(script_dir, 'isolation_forest_model.joblib')
try:
    joblib.dump(model, model_filename)
    logging.info(f"Model telah disimpan ke dalam file: {model_filename}")
except Exception as e:
    logging.error(f"Gagal menyimpan model: {e}")
    exit(1)

logging.info("Proses training selesai.")
