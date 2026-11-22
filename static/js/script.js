document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#crop-form");
    const submitButton = document.querySelector("#submit-button");
    const formStatus = document.querySelector("#form-status");
    const modelStatus = document.querySelector("#model-status");
    const statusLight = document.querySelector("#status-light");
    const datasetStatus = document.querySelector("#dataset-status");
    const trainButton = document.querySelector("#train-model-button");
    const resultsSection = document.querySelector("#results-section");
    const recommendationList = document.querySelector("#recommendation-list");
    const resultCount = document.querySelector("#result-count");

    const selects = {
        soil: document.querySelector("#soil"),
        season: document.querySelector("#season"),
        water_source: document.querySelector("#water_source")
    };

    const readiness = { dataset: false, model: false, options: false };

    function setStatus(element, message, state = "") {
        if (!element) return;
        element.textContent = message;
        element.dataset.state = state;
    }

    async function requestJson(url, options = {}) {
        const response = await fetch(url, options);
        let payload = {};

        try {
            payload = await response.json();
        } catch {
            // Keep the request error useful if a proxy or server returns HTML.
        }

        if (!response.ok) {
            throw new Error(
                payload.message || `Request failed (${response.status}).`
            );
        }

        return payload;
    }

    function updateSubmitState() {
        submitButton.disabled = !(
            readiness.dataset && readiness.model && readiness.options
        );
    }

    function displayLabel(value) {
        return String(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function fillSelect(select, values, prompt) {
        select.replaceChildren(new Option(prompt, ""));

        values.forEach((value) => {
            select.add(new Option(displayLabel(value), value));
        });

        select.disabled = values.length === 0;
    }

    async function loadOptions() {
        try {
            const payload = await requestJson("/api/options");
            const options = payload.options || {};

            fillSelect(selects.soil, options.soil || [], "Select soil type");
            fillSelect(selects.season, options.season || [], "Select season");
            fillSelect(
                selects.water_source,
                options.water_source || [],
                "Select water source"
            );

            const waterInput = document.querySelector("#waterrequired");
            const waterRange = options.waterrequired || {};

            if (Number.isFinite(Number(waterRange.min))) {
                waterInput.min = waterRange.min;
            }
            if (Number.isFinite(Number(waterRange.max))) {
                waterInput.max = waterRange.max;
            }

            if (waterRange.min !== undefined && waterRange.max !== undefined) {
                document.querySelector("#water-range-help").textContent =
                    `Enter a value from ${Number(waterRange.min).toLocaleString()} to ${Number(waterRange.max).toLocaleString()} mm.`;
            }

            readiness.options = true;
        } catch (error) {
            setStatus(formStatus, error.message, "error");
            Object.values(selects).forEach((select) => {
                select.disabled = true;
            });
        }

        updateSubmitState();
    }

    async function loadHealth() {
        try {
            const health = await requestJson("/api/health");
            readiness.dataset = Boolean(health.dataset_ready);
            readiness.model = Boolean(health.model_ready);

            datasetStatus.textContent = readiness.dataset ? "Ready" : "Missing";
            statusLight.dataset.state = readiness.model ? "ready" : "error";

            if (!readiness.dataset) {
                setStatus(
                    modelStatus,
                    "The crop dataset is missing. Add the project CSV and restart the app.",
                    "error"
                );
            } else if (!readiness.model) {
                setStatus(
                    modelStatus,
                    "The model needs training before recommendations can be made.",
                    "error"
                );
            } else {
                setStatus(modelStatus, "The model is trained and ready.", "ready");
            }

            trainButton.hidden = !readiness.dataset || readiness.model;
        } catch (error) {
            readiness.dataset = false;
            readiness.model = false;
            datasetStatus.textContent = "Unavailable";
            statusLight.dataset.state = "error";
            setStatus(
                modelStatus,
                "Could not reach the Flask service. Start the app and reload this page.",
                "error"
            );
            trainButton.hidden = true;
        }

        updateSubmitState();
    }

    function renderRecommendations(recommendations) {
        recommendationList.replaceChildren();

        if (!Array.isArray(recommendations) || recommendations.length === 0) {
            const empty = document.createElement("p");
            empty.className = "muted-item";
            empty.textContent = "No crop suggestions were returned.";
            recommendationList.append(empty);
            resultCount.textContent = "0 crops";
            resultsSection.hidden = false;
            return;
        }

        recommendations.forEach((item, index) => {
            const card = document.createElement("article");
            card.className = "recommendation-card";

            const rank = document.createElement("span");
            rank.className = "recommendation-rank";
            rank.textContent = String(index + 1).padStart(2, "0");
            rank.setAttribute("aria-label", `Rank ${index + 1}`);

            const crop = document.createElement("div");
            const name = document.createElement("h4");
            name.textContent = item.crop || "Crop option";
            const note = document.createElement("p");
            note.textContent = "Based on the selected field conditions";
            crop.append(name, note);

            const scoreWrap = document.createElement("div");
            scoreWrap.className = "score-wrap";
            const score = document.createElement("strong");
            const probability = Number(item.probability);
            score.textContent = Number.isFinite(probability)
                ? `${probability.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
                : "—";
            const scoreLabel = document.createElement("span");
            scoreLabel.textContent = "model score";
            scoreWrap.append(score, scoreLabel);

            card.append(rank, crop, scoreWrap);
            recommendationList.append(card);
        });

        resultCount.textContent = `${recommendations.length} ${recommendations.length === 1 ? "crop" : "crops"}`;
        resultsSection.hidden = false;
        resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function formatFeatureName(rawName) {
        const encodedName = String(rawName).split("__").slice(1).join("__");
        const knownLabels = [
            ["soil_", "Soil · "],
            ["season_", "Season · "],
            ["water_source_", "Water source · "],
            ["waterrequired", "Water requirement"]
        ];
        const match = knownLabels.find(([prefix]) => encodedName.startsWith(prefix));

        if (!match) return displayLabel(encodedName || rawName);
        return `${match[1]}${displayLabel(encodedName.slice(match[0].length))}`;
    }

    async function loadFeatureImportance() {
        const list = document.querySelector("#importance-list");

        try {
            const payload = await requestJson("/api/feature-importance");
            const features = (payload.feature_importance || []).slice(0, 5);
            list.replaceChildren();

            if (features.length === 0) {
                const item = document.createElement("li");
                item.className = "muted-item";
                item.textContent = "No feature details are available.";
                list.append(item);
                return;
            }

            features.forEach((feature) => {
                const item = document.createElement("li");
                item.className = "importance-item";

                const label = document.createElement("div");
                label.className = "importance-label";
                const name = document.createElement("span");
                name.textContent = formatFeatureName(feature.feature);
                const value = Number(feature.importance);
                const percentage = Number.isFinite(value) ? value * 100 : 0;
                const amount = document.createElement("strong");
                amount.textContent = `${percentage.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
                label.append(name, amount);

                const track = document.createElement("div");
                track.className = "importance-track";
                track.setAttribute("role", "img");
                track.setAttribute(
                    "aria-label",
                    `${name.textContent}: ${amount.textContent} importance`
                );
                const fill = document.createElement("div");
                fill.className = "importance-fill";
                fill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
                track.append(fill);

                item.append(label, track);
                list.append(item);
            });
        } catch {
            list.replaceChildren();
            const item = document.createElement("li");
            item.className = "muted-item";
            item.textContent = "Train the model to view its feature importance.";
            list.append(item);
        }
    }

    function renderHistory(records) {
        const list = document.querySelector("#history-list");
        list.replaceChildren();

        if (!Array.isArray(records) || records.length === 0) {
            const empty = document.createElement("p");
            empty.className = "muted-item";
            empty.textContent = "No recommendations saved yet. Your first result will appear here.";
            list.append(empty);
            return;
        }

        records.slice(0, 3).forEach((record) => {
            const card = document.createElement("article");
            card.className = "history-card";

            const top = document.createElement("div");
            top.className = "history-card-top";
            const time = document.createElement("time");
            const parsedDate = new Date(record.created_at);
            if (!Number.isNaN(parsedDate.getTime())) {
                time.dateTime = parsedDate.toISOString();
                time.textContent = new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short"
                }).format(parsedDate);
            } else {
                time.textContent = "Saved recommendation";
            }

            const input = record.input_data || {};
            const season = document.createElement("span");
            season.className = "history-season";
            season.textContent = input.season ? displayLabel(input.season) : "Past result";
            top.append(time, season);

            const firstCrop = Array.isArray(record.recommended_crops)
                ? record.recommended_crops[0]
                : null;
            const heading = document.createElement("h3");
            heading.textContent = firstCrop?.crop || "Crop recommendation";

            const details = document.createElement("p");
            const soil = input.soil ? displayLabel(input.soil) : "soil unavailable";
            const source = input.water_source
                ? displayLabel(input.water_source)
                : "water source unavailable";
            const water = Number(input.waterrequired);
            const waterText = Number.isFinite(water)
                ? `${water.toLocaleString()} mm`
                : "water amount unavailable";
            details.textContent = `${soil} · ${source} · ${waterText}`;

            card.append(top, heading, details);
            list.append(card);
        });
    }

    async function loadHistory() {
        const list = document.querySelector("#history-list");

        try {
            const payload = await requestJson("/api/history?limit=3");
            renderHistory(payload.history || []);
        } catch {
            list.replaceChildren();
            const item = document.createElement("p");
            item.className = "muted-item";
            item.textContent = "Saved recommendations could not be loaded.";
            list.append(item);
        }
    }

    async function loadStats() {
        try {
            const payload = await requestJson("/api/stats");
            const stats = payload.statistics || {};
            const cropCount = Number(stats.total_crops);
            const recommendationCount = Number(stats.total_recommendations);
            const cropText = Number.isFinite(cropCount)
                ? cropCount.toLocaleString()
                : "—";
            document.querySelector("#crop-count").textContent = cropText;
            document.querySelector("#side-crop-count").textContent = cropText;
            document.querySelector("#recommendation-count").textContent =
                Number.isFinite(recommendationCount)
                    ? recommendationCount.toLocaleString()
                    : "—";
        } catch {
            document.querySelector("#crop-count").textContent = "—";
            document.querySelector("#side-crop-count").textContent = "—";
            document.querySelector("#recommendation-count").textContent = "—";
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        setStatus(formStatus, "", "");

        if (!form.reportValidity()) return;

        const formData = new FormData(form);
        const inputData = {
            soil: formData.get("soil"),
            season: formData.get("season"),
            water_source: formData.get("water_source"),
            waterrequired: Number(formData.get("waterrequired"))
        };

        submitButton.disabled = true;
        submitButton.textContent = "Finding crop ideas…";
        setStatus(formStatus, "Comparing your field conditions with the training data…");

        try {
            const payload = await requestJson("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(inputData)
            });

            renderRecommendations(payload.recommendations || []);
            setStatus(formStatus, "Your recommendation was saved to local history.", "success");
            await Promise.all([loadHistory(), loadStats()]);
        } catch (error) {
            resultsSection.hidden = true;
            setStatus(formStatus, error.message, "error");
        } finally {
            submitButton.textContent = "Get crop ideas →";
            updateSubmitState();
        }
    });

    trainButton.addEventListener("click", async () => {
        trainButton.disabled = true;
        trainButton.textContent = "Training model…";
        setStatus(modelStatus, "Training from the project dataset. This can take a little while…");

        try {
            const payload = await requestJson("/api/train", { method: "POST" });
            readiness.model = true;
            setStatus(
                modelStatus,
                `Model trained and ready · holdout accuracy ${(Number(payload.accuracy) * 100).toFixed(1)}%.`,
                "ready"
            );
            statusLight.dataset.state = "ready";
            trainButton.hidden = true;
            await Promise.all([loadFeatureImportance(), loadHealth()]);
        } catch (error) {
            setStatus(modelStatus, error.message, "error");
            trainButton.hidden = false;
        } finally {
            trainButton.disabled = false;
            trainButton.textContent = "Train model";
            updateSubmitState();
        }
    });

    loadOptions();
    loadHealth();
    loadStats();
    loadHistory();
    loadFeatureImportance();
});
