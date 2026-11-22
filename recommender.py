
import os
import math
import joblib
import pandas as pd
from functools import lru_cache

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "Crop recommendation dataset.csv"
)
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "crop_model_v2.pkl")

CATEGORICAL_FEATURES = [
    "soil",
    "season",
    "water_source"
]

NUMERICAL_FEATURES = [
    "waterrequired"
]

FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES

TARGET = "crops"


def normalize_category(value):
    """Normalize whitespace and casing in dataset category values."""

    return " ".join(
        str(value).replace("\u00a0", " ").split()
    ).casefold()


# --------------------------------------------------
# DATA LOADING
# --------------------------------------------------

@lru_cache(maxsize=1)
def load_dataset():
    """Load and validate the new crop recommendation dataset."""

    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    data = pd.read_csv(DATASET_PATH)

    # Normalize column names
    data.columns = (
        data.columns
        .str.strip()
        .str.lower()
    )

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        column for column in required_columns
        if column not in data.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns in dataset: {missing_columns}"
        )

    # Select required columns only
    data = data[required_columns].copy()

    # Normalize categories, including non-breaking spaces in soil names.
    for column in CATEGORICAL_FEATURES:
        data[column] = (
            data[column]
            .astype("string")
            .str.replace("\u00a0", " ", regex=False)
            .str.replace(r"\s+", " ", regex=True)
            .str.strip()
            .str.casefold()
        )

    # Convert crop water requirement to a number.
    data["waterrequired"] = pd.to_numeric(
        data["waterrequired"],
        errors="coerce"
    )

    # Clean target labels
    data[TARGET] = (
        data[TARGET]
        .astype("string")
        .str.strip()
    )

    # Remove invalid rows
    data.dropna(inplace=True)

    # Remove empty values
    for column in FEATURES + [TARGET]:
        data = data[
            data[column].astype(str).str.strip() != ""
        ]

    # Water requirement is measured in millimetres per crop cycle.
    data = data[
        data["waterrequired"] >= 0
    ]

    if data.empty:
        raise ValueError(
            "Dataset contains no valid rows."
        )

    if data[TARGET].nunique() < 2:
        raise ValueError(
            "Dataset must contain at least two crop classes."
        )

    return data


# --------------------------------------------------
# DATASET INFORMATION
# --------------------------------------------------

def get_crop_names():
    """Return available crop labels."""

    data = load_dataset()

    return sorted(
        data[TARGET].unique().tolist()
    )


def get_input_options():
    """Return supported select values and the water input range."""

    data = load_dataset()

    return {
        feature: sorted(data[feature].unique().tolist())
        for feature in CATEGORICAL_FEATURES
    } | {
        "waterrequired": {
            "min": float(data["waterrequired"].min()),
            "max": float(data["waterrequired"].max())
        }
    }


def is_dataset_ready():
    """Check if dataset exists."""

    return os.path.isfile(DATASET_PATH)


def is_model_ready():
    """Check if trained model exists."""

    return os.path.isfile(MODEL_PATH)


# --------------------------------------------------
# MODEL PIPELINE
# --------------------------------------------------

def create_model_pipeline():

    preprocessing = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                CATEGORICAL_FEATURES
            ),
            (
                "numerical",
                "passthrough",
                NUMERICAL_FEATURES
            )
        ]
    )

    classifier = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline([
        ("preprocessing", preprocessing),
        ("classifier", classifier)
    ])

    return pipeline


# --------------------------------------------------
# MODEL TRAINING
# --------------------------------------------------

def train_model():
    """Train, evaluate and save the crop recommendation model."""

    data = load_dataset()

    X = data[FEATURES]
    y = data[TARGET]

    # Ensure every class has sufficient samples
    class_counts = y.value_counts()

    insufficient_classes = class_counts[
        class_counts < 2
    ]

    if not insufficient_classes.empty:
        raise ValueError(
            "Each crop class requires at least "
            "2 samples for stratified training."
        )

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    # Create pipeline
    pipeline = create_model_pipeline()

    # Train model
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    report = classification_report(
        y_test,
        y_pred,
        zero_division=0
    )

    matrix = confusion_matrix(
        y_test,
        y_pred,
        labels=pipeline.classes_
    )

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)

    model_artifact = {
        "model": pipeline,
        "features": FEATURES,
        "target": TARGET,
        "classes": list(pipeline.classes_),
        "accuracy": float(accuracy)
    }

    joblib.dump(
        model_artifact,
        MODEL_PATH
    )

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
        "model": pipeline
    }


# --------------------------------------------------
# LOAD SAVED MODEL
# --------------------------------------------------

def load_model():
    """Load the saved pipeline."""

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Trained model not found. "
            "Run train_model() first."
        )

    artifact = joblib.load(MODEL_PATH)

    if (
        not isinstance(artifact, dict)
        or artifact.get("features") != FEATURES
        or artifact.get("target") != TARGET
    ):
        raise FileNotFoundError(
            "The saved model uses an older data schema. "
            "Run python recommender.py to retrain it."
        )

    return artifact["model"]


# --------------------------------------------------
# INPUT VALIDATION
# --------------------------------------------------

def validate_prediction_input(input_data):

    if not isinstance(input_data, dict):
        raise ValueError(
            "Input must be a dictionary."
        )

    missing_features = [
        feature for feature in FEATURES
        if feature not in input_data
    ]

    if missing_features:
        raise ValueError(
            f"Missing input features: {missing_features}"
        )

    validated_data = {}

    dataset = load_dataset()

    for feature in CATEGORICAL_FEATURES:

        value = input_data[feature]

        if value is None or str(value).strip() == "":
            raise ValueError(
                f"{feature} cannot be empty."
            )

        normalized_value = normalize_category(value)
        allowed_values = set(dataset[feature].unique())

        if normalized_value not in allowed_values:
            raise ValueError(
                f"Choose a supported {feature.replace('_', ' ')} value."
            )

        validated_data[feature] = normalized_value

    water_value = input_data["waterrequired"]

    if isinstance(water_value, bool):
        raise ValueError(
            "Water requirement must be a number."
        )

    try:
        water_value = float(water_value)
    except (TypeError, ValueError) as error:
        raise ValueError(
            "Water requirement must be a number."
        ) from error

    if not math.isfinite(water_value):
        raise ValueError(
            "Water requirement must be a finite number."
        )

    min_water = float(dataset["waterrequired"].min())
    max_water = float(dataset["waterrequired"].max())

    if not min_water <= water_value <= max_water:
        raise ValueError(
            f"Water requirement must be between {min_water:g} "
            f"and {max_water:g} mm."
        )

    validated_data["waterrequired"] = water_value

    return validated_data


# --------------------------------------------------
# CROP PREDICTION
# --------------------------------------------------

def predict_top_crops(input_data, top_n=3):
    """
    Predict crop classes using:

    soil
    season
    water_source
    waterrequired
    """

    model = load_model()

    validated_data = validate_prediction_input(
        input_data
    )

    input_df = pd.DataFrame(
        [validated_data],
        columns=FEATURES
    )

    # Generate probabilities
    probabilities = model.predict_proba(
        input_df
    )[0]

    classes = model.classes_

    # Rank crop predictions
    ranked_indices = probabilities.argsort()[::-1]

    top_n = max(
        1,
        min(int(top_n), len(classes))
    )

    results = []

    for index in ranked_indices[:top_n]:

        results.append({
            "crop": str(classes[index]),
            "probability": round(
                float(probabilities[index]) * 100,
                2
            )
        })

    return results


# --------------------------------------------------
# FEATURE IMPORTANCE
# --------------------------------------------------

def get_feature_importance():
    """Return importance of encoded model features."""

    model = load_model()

    preprocessing = model.named_steps[
        "preprocessing"
    ]

    classifier = model.named_steps[
        "classifier"
    ]

    encoded_features = (
        preprocessing.get_feature_names_out()
    )

    importance_values = (
        classifier.feature_importances_
    )

    result = []

    for feature, value in zip(
        encoded_features,
        importance_values
    ):

        result.append({
            "feature": str(feature),
            "importance": round(
                float(value),
                4
            )
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

    # Train model
    train_model()

    # Example input
    sample_input = {
        "soil": "black soil",
        "season": "kharif",
        "water_source": "irrigated",
        "waterrequired": 850
    }

    print("\n========== SAMPLE PREDICTION ==========")

    recommendations = predict_top_crops(
        sample_input,
        top_n=3
    )

    for rank, item in enumerate(
        recommendations,
        start=1
    ):

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
