
import os

from flask import Flask, render_template, request, jsonify

from recommender import (
    predict_top_crops,
    train_model,
    get_feature_importance,
    get_crop_names,
    get_input_options,
    is_dataset_ready,
    is_model_ready,
    validate_prediction_input
)

from database import (
    initialize_database,
    save_recommendation,
    get_all_history,
    get_history_by_id,
    delete_history,
    clear_history,
    get_database_stats,
    sync_crop_catalog
)


# --------------------------------------------------
# FLASK CONFIGURATION

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
    static_url_path="/static"
)

app.config["JSON_SORT_KEYS"] = False


# --------------------------------------------------
# INITIALIZE DATABASE
# --------------------------------------------------

initialize_database()

if is_dataset_ready():
    try:
        sync_crop_catalog(get_crop_names())
    except (OSError, ValueError) as error:
        app.logger.warning("Unable to sync the crop catalog: %s", error)


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
        "message": "Crop Recommendation System backend is running.",
        "dataset_ready": is_dataset_ready(),
        "model_ready": is_model_ready()
    }), 200


@app.route("/api/options", methods=["GET"])
def recommendation_options():

    try:
        return jsonify({
            "status": "success",
            "options": get_input_options()
        }), 200
    except (FileNotFoundError, ValueError) as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 503


# --------------------------------------------------
# INPUT VALIDATION
# --------------------------------------------------

def validate_input(data):
    try:
        return validate_prediction_input(data), None
    except (TypeError, ValueError) as error:
        return None, str(error)


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

    debug_enabled = os.environ.get("FLASK_DEBUG", "").strip().lower() in {
        "1", "true", "yes"
    }

    app.run(
        host=os.environ.get("HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", "5000")),
        debug=debug_enabled
    )
