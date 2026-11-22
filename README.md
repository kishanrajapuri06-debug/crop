# SmartHarvest Crop Recommendation

SmartHarvest is a Flask app that recommends up to three crops from soil and climate inputs. It trains a Random Forest classifier from `Crop_recommendation.csv` and stores submitted recommendation history in SQLite.

The dataset contains 2,200 rows across 22 crop labels. The displayed scores are model probabilities; they are not guarantees of suitability, yield, or profit.

## Run locally

Use Python 3.14 (the project was prepared with Python 3.14.7).

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python recommender.py
python app.py
```

`python recommender.py` trains and saves `models/crop_model.pkl`. The Flask app then starts at `http://127.0.0.1:5000`. It creates `database/crops.db` on first start and syncs the crop catalog from the CSV. Generated model, database, environment, and cache files are ignored by Git.

The server defaults to `127.0.0.1:5000` with debug mode disabled. Set `HOST`, `PORT`, or `FLASK_DEBUG=1` to override those defaults during local development.

## Project files

- `app.py` — Flask pages and JSON API
- `recommender.py` — dataset validation, model training, prediction, feature importance
- `database.py` — SQLite history and crop catalog
- `Crop_recommendation.csv` — model training data
- `templates/index.html` — landing page and recommendation form shell
- `static/css/style.css` — responsive page and form styles
- `static/js/script.js` — form behavior and API integration

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server, dataset, and model readiness |
| `POST` | `/api/recommend` | Validate inputs, return top three crops, and save history |
| `GET` | `/api/history?limit=100` | List recent recommendation history |
| `GET` | `/api/history/<id>` | Read one history record |
| `DELETE` | `/api/history/<id>` | Delete one history record |
| `DELETE` | `/api/history` | Clear recommendation history |
| `GET` | `/api/stats` | Return history and crop catalog counts |
| `GET` | `/api/feature-importance` | Return trained model feature importances |
| `POST` | `/api/train` | Train or retrain the model |

Recommendation request body:

```json
{
  "N": 90,
  "P": 42,
  "K": 43,
  "temperature": 20.9,
  "humidity": 82,
  "ph": 6.5,
  "rainfall": 203
}
```

If the model is missing, train it with `python recommender.py` or send `POST /api/train`. The health endpoint reports `model_ready: false` until the artifact exists.
