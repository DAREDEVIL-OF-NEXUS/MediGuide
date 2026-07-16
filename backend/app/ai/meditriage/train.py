import os
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def train_meditriage_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "dataset.csv")
    model_path = os.path.join(base_dir, "model.pkl")
    features_path = os.path.join(base_dir, "features.pkl")

    print("Loading dataset from:", dataset_path)
    df = pd.read_csv(dataset_path)

    # Identify symptom columns
    sym_cols = [c for c in df.columns if c.lower().startswith("symptom")]

    # Clean symptom text: strip, lowercase, replace spaces with underscore
    for c in sym_cols:
        df[c] = df[c].astype(str).str.strip().str.lower().str.replace(" ", "_")

    # Replace 'nan' strings (from astype str) with empty
    df[sym_cols] = df[sym_cols].replace("nan", "")

    # Target
    y = df["Disease"].astype(str).str.strip()

    # Features: symptom columns only
    X_raw = df[sym_cols]

    # One-hot encode the symptom categories
    X = pd.get_dummies(X_raw)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training RandomForestClassifier...")
    # Train
    model = RandomForestClassifier(n_estimators=300, random_state=42)
    model.fit(X_train, y_train)

    # Save model + feature names
    joblib.dump(model, model_path)
    joblib.dump(X.columns.tolist(), features_path)

    print("✅ MediTriage Model trained successfully!")
    print("Features extracted:", len(X.columns))

if __name__ == "__main__":
    train_meditriage_model()
