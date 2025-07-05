import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout, BatchNormalization, LeakyReLU
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import os


# =========================
# 1. Path & Validasi Data
# =========================
DATA_PATH = "./data/transactions_normal_only.csv"
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"File data tidak ditemukan: {DATA_PATH}")

# =========================
# 2. Load Data & Feature Engineering
# =========================
data = pd.read_csv(DATA_PATH)
# Ekstrak jam dari timestamp jika ada
if 'Timestamp' in data.columns:
    data['Timestamp'] = pd.to_datetime(data['Timestamp'])
    data['hour'] = data['Timestamp'].dt.hour

# Rename kolom agar konsisten dengan pipeline prediksi
data = data.rename(columns={
    'TransactionAmount': 'amount',
    'UserID': 'user_id',
    'MerchantName': 'merchant',
    'TransactionType': 'transaction_type',
    'Channel': 'channel',
    'DeviceType': 'device_type',
    'City': 'location'
})

# =========================
# 3. Validasi Fitur yang Digunakan
# =========================
selected_features = [
    'amount', 'hour', 'user_id', 'transaction_type', 'channel', 'merchant', 'device_type', 'location'
]
for feat in selected_features:
    if feat not in data.columns:
        raise ValueError(f"Fitur '{feat}' tidak ditemukan di data!")

X = data[selected_features]
y_true = data['is_true_anomaly'] if 'is_true_anomaly' in data.columns else data['IsAnomaly']

# --- Preprocessing Pipeline
numerical = ['amount', 'hour']
categorical = ['user_id', 'transaction_type',
               'channel', 'merchant', 'device_type', 'location']

preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numerical),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical)
])

X_processed = preprocessor.fit_transform(X)

# --- Split Data
y_true_array = y_true.to_numpy()
X_train = X_processed[y_true_array == 0]
X_test = X_processed

# --- Improved Autoencoder Architecture
input_dim = X_train.shape[1]
input_layer = Input(shape=(input_dim,))
x = Dense(64)(input_layer)
x = BatchNormalization()(x)
x = LeakyReLU()(x)
x = Dropout(0.2)(x)
x = Dense(32)(x)
x = BatchNormalization()(x)
x = LeakyReLU()(x)
x = Dropout(0.1)(x)
x = Dense(16, activation="relu")(x)
bottleneck = Dense(8, activation="relu")(x)
x = Dense(16, activation="relu")(bottleneck)
x = Dense(32)(x)
x = BatchNormalization()(x)
x = LeakyReLU()(x)
x = Dense(64, activation="relu")(x)
output_layer = Dense(input_dim, activation="linear")(x)

autoencoder = Model(inputs=input_layer, outputs=output_layer)
autoencoder.compile(optimizer="adam", loss="mse")

# --- Training Model
early_stop = EarlyStopping(monitor="loss", patience=8,
                           restore_best_weights=True)
autoencoder.fit(
    X_train, X_train,
    epochs=100,               # Lebih banyak epoch, early stopping tetap menjaga overfit
    batch_size=128,           # Batch size lebih kecil bisa membantu konvergensi
    shuffle=True,
    validation_split=0.1,
    callbacks=[early_stop],
    verbose=1
)

# --- Save Model & Preprocessor
autoencoder.save("autoencoder_model.keras")
joblib.dump(preprocessor, "preprocessor_pipeline.joblib")
