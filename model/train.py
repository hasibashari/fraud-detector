# =========================
# Import Library
# =========================
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.callbacks import EarlyStopping
import joblib
import os

# =========================
# Path & Validasi Data
# =========================
DATA_PATH = os.path.join("data", "transactions_realistic_multi_feature.csv")

# Cek apakah file data ada
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"File data tidak ditemukan: {DATA_PATH}")

# =========================
# 1. Load & Siapkan Data
# =========================
data = pd.read_csv(DATA_PATH)
data['TransactionDate'] = pd.to_datetime(data['TransactionDate'])
data['hour'] = data['TransactionDate'].dt.hour
data = data.rename(columns={
    'TransactionAmount': 'amount',
    'AccountID': 'user_id',
    'MerchantID': 'merchant',
    'Location': 'location'
})

# =========================
# 2. Pilih Fitur
# =========================
selected_features = ['amount', 'user_id', 'hour', 'merchant', 'location']
X = data[selected_features]
y_true = data['is_true_anomaly']

# =========================
# 3. Preprocessing Pipeline
# =========================
numerical = ['amount', 'user_id', 'hour']
categorical = ['merchant', 'location']

preprocessor = ColumnTransformer([
    ('num', StandardScaler(), numerical),
    ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical)
])

X_processed = preprocessor.fit_transform(X)

# =========================
# 4. Split Data (Train: hanya data normal)
# =========================
y_true_array = y_true.to_numpy()
X_train = X_processed[y_true_array == 0]  # Hanya data normal untuk training
del y_true_array  # Bebaskan memori
X_test = X_processed  # Semua data untuk evaluasi

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
early_stop = EarlyStopping(monitor="loss", patience=5, restore_best_weights=True)
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
