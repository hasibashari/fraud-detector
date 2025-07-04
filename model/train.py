# =========================
# Import Library
# =========================
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import os

# =========================
# Path & Validasi Data
# =========================
DATA_PATH = os.path.join("data", "transactions_realistic_full.csv")
# DATA_PATH = "/content/transactions_realistic_full.csv"

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"File data tidak ditemukan: {DATA_PATH}")

# =========================
# 1. Load & Siapkan Data
# =========================
data = pd.read_csv(DATA_PATH)
if 'Timestamp' in data.columns:
    data['Timestamp'] = pd.to_datetime(data['Timestamp'])
    data['hour'] = data['Timestamp'].dt.hour

# Pastikan penamaan kolom selaras dengan fitur yang digunakan
data = data.rename(columns={
    'TransactionAmount': 'amount',
    'UserID': 'user_id',
    'MerchantName': 'merchant',
    'TransactionType': 'transaction_type',
    'Channel': 'channel',
    'DeviceType': 'device_type',
    'City': 'location'
    # 'Location': 'location'  # kolom Location tidak ada di dataset kamu, gunakan City
})

# =========================
# 2. Pilih 8 Fitur Internasional
# =========================
selected_features = [
    'amount',            # 1. Transaction Amount (numeric)
    # 2. Transaction Hour (numeric, hasil ekstrak dari Timestamp)
    'hour',
    'user_id',           # 3. User ID (categorical/numeric)
    'transaction_type',  # 4. Transaction Type (categorical)
    'channel',           # 5. Channel (categorical)
    'merchant',          # 6. Merchant Name/ID (categorical)
    'device_type',       # 7. Device Type (categorical)
    # 8. City (categorical; gunakan 'city' sesuai kolom di dataset)
    'city'
]

# Pastikan semua fitur tersedia
for feat in selected_features:
    if feat not in data.columns:
        raise ValueError(f"Fitur '{feat}' tidak ditemukan di data!")

X = data[selected_features]
# Deteksi nama label anomali yang sesuai (IsAnomaly di hasil generator, is_true_anomaly di versi lain)
y_true = data['is_true_anomaly'] if 'is_true_anomaly' in data.columns else data['IsAnomaly']

# =========================
# 3. Preprocessing Pipeline
# =========================
numerical = ['amount', 'hour']
categorical = ['user_id', 'transaction_type',
               'channel', 'merchant', 'device_type', 'city']

preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numerical),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical)
])

X_processed = preprocessor.fit_transform(X)

# =========================
# 4. Split Data (Train: hanya data normal)
# =========================
y_true_array = y_true.to_numpy()
X_train = X_processed[y_true_array == 0]  # Only normal data for training
X_test = X_processed  # All data for evaluation

# =========================
# 5. Arsitektur AutoEncoder
# =========================
input_dim = X_train.shape[1]
input_layer = Input(shape=(input_dim,))
encoded = Dense(32, activation="relu")(input_layer)
encoded = Dense(16, activation="relu")(encoded)
bottleneck = Dense(8, activation="relu")(encoded)
decoded = Dense(16, activation="relu")(bottleneck)
decoded = Dense(32, activation="relu")(decoded)
output_layer = Dense(input_dim, activation="linear")(decoded)

autoencoder = Model(inputs=input_layer, outputs=output_layer)
autoencoder.compile(optimizer="adam", loss="mse")

# =========================
# 6. Training Model
# =========================
early_stop = EarlyStopping(monitor="loss", patience=5,
                           restore_best_weights=True)
autoencoder.fit(
    X_train, X_train,
    epochs=50,
    batch_size=256,
    shuffle=True,
    validation_split=0.1,
    callbacks=[early_stop],
    verbose=1
)

# =========================
# 7. Simpan Model & Preprocessor
# =========================
autoencoder.save("autoencoder_model.keras")
joblib.dump(preprocessor, "preprocessor_pipeline.joblib")
