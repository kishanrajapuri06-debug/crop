# SmartHarvest Crop Recommendation

SmartHarvest is a Flask app that ranks up to three crop labels from the project's agricultural dataset. The form uses soil type, growing season, water source, and crop water requirement. The Random Forest model learns from `Crop recommendation dataset.csv`; recommendation history is stored locally in SQLite.

The dataset includes many crop labels and field records. Scores are model probabilities based on the supplied dataset, not guarantees of suitability, yield, or profit. Use the results alongside local agricultural knowledge and soil testing.

## Run locally

Use Python 3.14 (the project was prepared with Python 3.14.7).

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python recommender.py
python app.py
```

`python recommender.py` trains and saves `models/crop_model_v2.pkl`. The Flask app then starts at `http://127.0.0.1:5000`. It creates `database/crops.db` on first start and syncs the crop catalog from the dataset. Generated model, database, environment, and cache files are ignored by Git.

The server defaults to `127.0.0.1:5000` with debug mode disabled. Set `HOST`, `PORT`, or `FLASK_DEBUG=1` to override those defaults during local development.

## Project files

- `app.py` - Flask page and JSON API routes
- `recommender.py` - dataset loading, model training, prediction, and feature importance
- `database.py` - SQLite recommendation history and crop catalog
- `Crop recommendation dataset.csv` - model training data
- `templates/index.html` - SmartHarvest page and field input form
- `static/css/style.css` - responsive page and form styles
- `static/js/script.js` - dynamic dataset options, form requests, results, and history

## Recommendation inputs

The soil, season, and water-source choices are loaded from the dataset at `/api/options`. The water requirement field uses the minimum and maximum values found in the dataset. The API accepts normalized values with this shape:

```json
{
  "soil": "black soil",
  "season": "kharif",
  "water_source": "irrigated",
  "waterrequired": 850
}
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server, dataset, and model readiness |
| `GET` | `/api/options` | Supported input choices and water range |
| `POST` | `/api/recommend` | Validate inputs, return up to three crops, and save history |
| `GET` | `/api/history?limit=100` | List recent recommendation history |
| `GET` | `/api/history/<id>` | Read one history record |
| `DELETE` | `/api/history/<id>` | Delete one history record |
| `DELETE` | `/api/history` | Clear recommendation history |
| `GET` | `/api/stats` | Return history and crop catalog counts |
| `GET` | `/api/feature-importance` | Return trained model feature importance |
| `POST` | `/api/train` | Train or retrain the model |

If the model is missing, use `python recommender.py` or send `POST /api/train`. The health endpoint reports `model_ready: false` until the model artifact exists. The page exposes a training action when it detects that the dataset is available but the model is not.
