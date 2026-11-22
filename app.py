
from flask import Flask, render_template, request, jsonify

import math

from recommender import (
    predict_top_crops,
    train_model,
    load_model,
    get_feature_importance
)

from database import (
    initialize_database,
    save_recommendation,
    get_all_history,
    get_history_by_id,
    delete_history,
    clear_history,
    get_database_stats
)


# --------------------------------------------------
# FLASK CONFIGURATION
# --------------------------------------------------

app = Flask(__name__)

app.config["JSON_SORT_KEYS"] = False


# --------------------------------------------------
# INITIALIZE DATABASE
# --------------------------------------------------

initialize_database()


# --------------------------------------------------
# HOME ROUTE
# --------------------------------------------------

@app.route("/")
def home():
    return render_template("index.html")


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():

    return jsonify({
        "status": "success",
        "message": "Crop Recommendation System backend is running."
    }), 200


# --------------------------------------------------
# INPUT VALIDATION
# --------------------------------------------------

REQUIRED_FEATURES = [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
]


def validate_input(data):

    if not isinstance(data, dict):
        return None, "Request must contain a JSON object."

    missing_features = [
        feature for feature in REQUIRED_FEATURES
        if feature not in data
    ]

    if missing_features:
        return None, (
            "Missing features: "
            + ", ".join(missing_features)
        )

    validated_data = {}

    try:
        for feature in REQUIRED_FEATURES:

            value = data[feature]

            if isinstance(value, bool):
                return None, f"{feature} must be numeric."

            value = float(value)

            if not math.isfinite(value):
                return None, f"{feature} must be a finite number."

            validated_data[feature] = value

    except (TypeError, ValueError):
        return None, "All input features must be numeric."

    # Basic domain validation
    if any(
        validated_data[feature] < 0
        for feature in ["N", "P", "K", "rainfall"]
    ):
        return None, "N, P, K and rainfall cannot be negative."

    if not 0 <= validated_data["ph"] <= 14:
        return None, "Soil pH must be between 0 and 14."

    if not 0 <= validated_data["humidity"] <= 100:
        return None, "Humidity must be between 0 and 100."

    if not -50 <= validated_data["temperature"] <= 70:
        return None, "Temperature is outside the supported input range."

    return validated_data, None


# --------------------------------------------------
# CROP RECOMMENDATION API
# --------------------------------------------------

@app.route("/api/recommend", methods=["POST"])
def recommend_crop():

    try:

        data = request.get_json(silent=True)

        validated_data, error = validate_input(data)

        if error:
            return jsonify({
                "status": "error",
                "message": error
            }), 400

        # Get top crop predictions
        recommendations = predict_top_crops(
            validated_data,
            top_n=3
        )

        # Save input and predictions
        record_id = save_recommendation(
            validated_data,
            recommendations
        )

        return jsonify({
            "status": "success",
            "message": "Crop recommendations generated successfully.",
            "record_id": record_id,
            "input": validated_data,
            "recommendations": recommendations
        }), 200

    except FileNotFoundError as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 503

    except Exception as error:

        app.logger.exception("Recommendation error")

        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred during recommendation."
        }), 500


# --------------------------------------------------
# RECOMMENDATION HISTORY API
# --------------------------------------------------

@app.route("/api/history", methods=["GET"])
def history():

    try:

        limit = request.args.get("limit", default=100, type=int)

        if limit is None or limit < 1:
            return jsonify({
                "status": "error",
                "message": "Limit must be a positive integer."
            }), 400

        limit = min(limit, 500)

        records = get_all_history(limit=limit)

        return jsonify({
            "status": "success",
            "count": len(records),
            "history": records
        }), 200

    except Exception:

        app.logger.exception("History retrieval error")

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve history."
        }), 500


# --------------------------------------------------
# GET HISTORY BY ID
# --------------------------------------------------

@app.route("/api/history/<int:record_id>", methods=["GET"])
def history_detail(record_id):

    try:

        record = get_history_by_id(record_id)

        if record is None:
            return jsonify({
                "status": "error",
                "message": "History record not found."
            }), 404

        return jsonify({
            "status": "success",
            "history": record
        }), 200

    except Exception:

        app.logger.exception("History detail error")

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve history record."
        }), 500


# --------------------------------------------------
# DELETE HISTORY RECORD
# --------------------------------------------------

@app.route("/api/history/<int:record_id>", methods=["DELETE"])
def delete_history_record(record_id):

    try:

        deleted = delete_history(record_id)

        if not deleted:
            return jsonify({
                "status": "error",
                "message": "History record not found."
            }), 404

        return jsonify({
            "status": "success",
            "message": "History record deleted."
        }), 200

    except Exception:

        app.logger.exception("History deletion error")

        return jsonify({
            "status": "error",
            "message": "Unable to delete history record."
        }), 500


# --------------------------------------------------
# CLEAR HISTORY
# --------------------------------------------------

@app.route("/api/history", methods=["DELETE"])
def clear_all_history():

    try:

        clear_history()

        return jsonify({
            "status": "success",
            "message": "Recommendation history cleared."
        }), 200

    except Exception:

        app.logger.exception("History clearing error")

        return jsonify({
            "status": "error",
            "message": "Unable to clear recommendation history."
        }), 500


# --------------------------------------------------
# APPLICATION STATISTICS
# --------------------------------------------------

@app.route("/api/stats", methods=["GET"])
def stats():

    try:

        statistics = get_database_stats()

        return jsonify({
            "status": "success",
            "statistics": statistics
        }), 200

    except Exception:

        app.logger.exception("Statistics error")

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve statistics."
        }), 500


# --------------------------------------------------
# MODEL FEATURE IMPORTANCE
# --------------------------------------------------

@app.route("/api/feature-importance", methods=["GET"])
def feature_importance():

    try:

        importance = get_feature_importance()

        return jsonify({
            "status": "success",
            "feature_importance": importance
        }), 200

    except FileNotFoundError as error:

        return jsonify({
            "status": "error",
            "message": str(error)
        }), 503

    except Exception:

        app.logger.exception("Feature importance error")

        return jsonify({
            "status": "error",
            "message": "Unable to retrieve feature importance."
        }), 500


# --------------------------------------------------
# MODEL TRAINING API
# --------------------------------------------------

@app.route("/api/train", methods=["POST"])
def train_model_api():

    try:

        result = train_model()

        return jsonify({
            "status": "success",
            "message": "Model trained successfully.",
            "accuracy": float(result["accuracy"])
        }), 200

    except Exception:

        app.logger.exception("Model training error")

        return jsonify({
            "status": "error",
            "message": "Model training failed."
        }), 500


# --------------------------------------------------
# RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
