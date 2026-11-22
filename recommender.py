
import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "Crop_recommendation.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_model.pkl")

FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]

TARGET = "label"


# --------------------------------------------------
# DATA LOADING
# --------------------------------------------------

def load_dataset():
    """Load and validate the crop recommendation dataset."""

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    data = pd.read_csv(DATASET_PATH)

    # Remove accidental whitespace from column names
    data.columns = data.columns.str.strip()

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        column for column in required_columns
        if column not in data.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns in dataset: {missing_columns}"
        )

    # Select only the columns needed for this model
    data = data[required_columns].copy()

    # Convert numerical features to numeric values
    for column in FEATURES:
        data[column] = pd.to_numeric(
            data[column], errors="coerce"
        )

    # Remove missing or invalid rows
    data.dropna(inplace=True)

    # Remove rows without a crop label
    data = data[
        data[TARGET].astype(str).str.strip() != ""
    ]

    # Ensure labels are strings
    data[TARGET] = data[TARGET].astype(str).str.strip()

    if data.empty:
        raise ValueError("Dataset contains no valid rows.")

    return data


# --------------------------------------------------
# MODEL TRAINING
# --------------------------------------------------

def train_model():
    """Train, evaluate and save the Random Forest model."""

    data = load_dataset()

    X = data[FEATURES]
    y = data[TARGET]

    if y.nunique() < 2:
        raise ValueError(
            "Training requires at least two crop classes."
        )

    # Split dataset into training and testing data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Create Random Forest model
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1
    )

    # Train model
    model.fit(X_train, y_train)

    # Evaluate model on test data
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    report = classification_report(
        y_test,
        y_pred,
        zero_division=0
    )

    matrix = confusion_matrix(
        y_test,
        y_pred,
        labels=model.classes_
    )

    # Save trained model
    os.makedirs(MODEL_DIR, exist_ok=True)

    model_artifact = {
        "model": model,
        "features": FEATURES,
        "classes": list(model.classes_),
        "accuracy": float(accuracy)
    }

    joblib.dump(model_artifact, MODEL_PATH)

    print("\n========== MODEL TRAINING ==========")
    print(f"Dataset rows: {len(data)}")
    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")
    print(f"Number of crops: {y.nunique()}")
    print(f"Accuracy: {accuracy:.4f}")

    print("\nClassification Report:")
    print(report)

    print("\nConfusion Matrix:")
    print(matrix)

    print("\nModel saved to:")
    print(MODEL_PATH)

    return {
        "accuracy": accuracy,
        "report": report,
        "confusion_matrix": matrix,
        "model": model
    }


# --------------------------------------------------
# LOAD SAVED MODEL
# --------------------------------------------------

def load_model():
    """Load a previously trained model."""

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Trained model not found. "
            "Run train_model() first."
        )

    artifact = joblib.load(MODEL_PATH)

    return artifact["model"]


# --------------------------------------------------
# CROP PREDICTION
# --------------------------------------------------

def predict_top_crops(input_data, top_n=3):
    """
    Predict the most likely crop labels.

    input_data must be a dictionary containing:
    N, P, K, temperature, humidity, ph and rainfall.

    Returns a list of crops ranked by model probability.
    """

    model = load_model()

    # Validate input features
    missing_features = [
        feature for feature in FEATURES
        if feature not in input_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing input features: {missing_features}"
        )

    # Build input dataframe in the correct order
    input_df = pd.DataFrame(
        [[input_data[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    # Validate numeric values
    for column in FEATURES:
        input_df[column] = pd.to_numeric(
            input_df[column], errors="raise"
        )

    if input_df.isnull().any().any():
        raise ValueError(
            "Input values cannot be empty."
        )

    # Get prediction probabilities
    probabilities = model.predict_proba(input_df)[0]

    classes = model.classes_

    # Sort predictions by probability
    ranked_indices = probabilities.argsort()[::-1]

    top_n = max(1, min(int(top_n), len(classes)))

    results = []

    for index in ranked_indices[:top_n]:
        results.append({
            "crop": str(classes[index]),
            "probability": round(
                float(probabilities[index]) * 100, 2
            )
        })

    return results


# --------------------------------------------------
# FEATURE IMPORTANCE
# --------------------------------------------------

def get_feature_importance():
    """Return model feature importance values."""

    model = load_model()

    importance = model.feature_importances_

    result = []

    for feature, value in zip(FEATURES, importance):
        result.append({
            "feature": feature,
            "importance": round(float(value), 4)
        })

    result.sort(
        key=lambda item: item["importance"],
        reverse=True
    )

    return result


# --------------------------------------------------
# TESTING
# --------------------------------------------------

if __name__ == "__main__":

    # Train and evaluate model
    train_model()

    # Example prediction
    sample_input = {
        "N": 90,
        "P": 42,
        "K": 43,
        "temperature": 25.5,
        "humidity": 80,
        "ph": 6.5,
        "rainfall": 200
    }

    print("\n========== SAMPLE PREDICTION ==========")

    recommendations = predict_top_crops(
        sample_input,
        top_n=3
    )

    for rank, item in enumerate(recommendations, start=1):
        print(
            f"{rank}. {item['crop']} - "
            f"{item['probability']}%"
        )

    print("\n========== FEATURE IMPORTANCE ==========")

    for item in get_feature_importance():
        print(
            f"{item['feature']}: "
            f"{item['importance']}"
        )
