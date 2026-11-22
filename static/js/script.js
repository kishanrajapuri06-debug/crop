
document.addEventListener("DOMContentLoaded", () => {
    const recommendSection = document.querySelector("#recommend");
    const recommendationPanel = recommendSection?.querySelector(
        ".recommendation-panel"
    );
    const modelStatus = document.querySelector("#model-status");

    if (modelStatus) {
        fetch("/api/health")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Health check failed.");
                }
                return response.json();
            })
            .then((health) => {
                if (health.model_ready) {
                    modelStatus.textContent = "The recommendation model is ready.";
                    modelStatus.dataset.state = "ready";
                } else {
                    modelStatus.textContent =
                        "The model is not trained yet. Run `python recommender.py` before requesting recommendations.";
                    modelStatus.dataset.state = "error";
                }
            })
            .catch(() => {
                modelStatus.textContent =
                    "Could not check model readiness. Make sure the Flask server is running.";
                modelStatus.dataset.state = "error";
            });
    }

    if (!recommendSection || !recommendationPanel) return;

    // Create the recommendation form dynamically
    const formContainer = document.createElement("div");
    formContainer.id = "recommendation-form-container";

    formContainer.innerHTML = `
        <form id="crop-form">

            <h3>
                Enter Agricultural Parameters
            </h3>

            <div class="crop-form-grid">

                <div class="form-group">
                    <label for="N">Nitrogen (N)</label>
                    <input type="number" id="N" name="N"
                        step="any" min="0" required>
                </div>

                <div class="form-group">
                    <label for="P">Phosphorus (P)</label>
                    <input type="number" id="P" name="P"
                        step="any" min="0" required>
                </div>

                <div class="form-group">
                    <label for="K">Potassium (K)</label>
                    <input type="number" id="K" name="K"
                        step="any" min="0" required>
                </div>

                <div class="form-group">
                    <label for="temperature">Temperature (°C)</label>
                    <input type="number" id="temperature"
                        name="temperature" step="any"
                        min="-50" max="70" required>
                </div>

                <div class="form-group">
                    <label for="humidity">Humidity (%)</label>
                    <input type="number" id="humidity"
                        name="humidity" step="any"
                        min="0" max="100" required>
                </div>

                <div class="form-group">
                    <label for="ph">Soil pH</label>
                    <input type="number" id="ph"
                        name="ph" step="any"
                        min="0" max="14" required>
                </div>

                <div class="form-group">
                    <label for="rainfall">Rainfall (mm)</label>
                    <input type="number" id="rainfall"
                        name="rainfall" step="any"
                        min="0" required>
                </div>

            </div>

            <button type="submit" id="submit-btn">
                Analyze & Recommend Crops →
            </button>

        </form>

        <div id="recommendation-result"></div>
    `;

    recommendationPanel.appendChild(formContainer);

    // Initially hide the form
    formContainer.style.display = "none";

    // Connect the existing HTML button
    window.startRecommendation = function () {
        formContainer.style.display = "block";

        formContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    // Handle form submission
    const cropForm = document.querySelector("#crop-form");

    cropForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = document.querySelector("#submit-btn");
        const resultContainer = document.querySelector("#recommendation-result");

        const inputData = {
            N: Number(document.querySelector("#N").value),
            P: Number(document.querySelector("#P").value),
            K: Number(document.querySelector("#K").value),
            temperature: Number(
                document.querySelector("#temperature").value
            ),
            humidity: Number(
                document.querySelector("#humidity").value
            ),
            ph: Number(document.querySelector("#ph").value),
            rainfall: Number(
                document.querySelector("#rainfall").value
            )
        };

        submitButton.disabled = true;
        submitButton.textContent = "Analyzing conditions...";

        resultContainer.replaceChildren();

        const loadingMessage = document.createElement("p");
        loadingMessage.textContent = "Analyzing your agricultural data...";
        resultContainer.appendChild(loadingMessage);

        try {
            const response = await fetch("/api/recommend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(inputData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Recommendation request failed."
                );
            }

            displayRecommendations(data.recommendations);

        } catch (error) {

            resultContainer.replaceChildren();

            const errorMessage = document.createElement("p");
            errorMessage.textContent = error.message;
            errorMessage.style.color = "red";

            resultContainer.appendChild(errorMessage);

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "Analyze & Recommend Crops →";
        }
    });


    // Display recommendations
    function displayRecommendations(recommendations) {

        const resultContainer = document.querySelector(
            "#recommendation-result"
        );

        resultContainer.replaceChildren();

        const heading = document.createElement("h3");
        heading.textContent = "Recommended Crops";
        resultContainer.appendChild(heading);

        if (!recommendations || recommendations.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No recommendations were returned.";
            resultContainer.appendChild(message);
            return;
        }

        recommendations.forEach((item, index) => {

            const card = document.createElement("div");

            card.className = "recommendation-card";

            const cropName = document.createElement("h4");
            cropName.textContent = `${index + 1}. ${item.crop}`;

            const score = document.createElement("p");
            score.textContent =
                `Model probability score: ${item.probability}%`;

            const note = document.createElement("p");
            note.textContent =
                "This score reflects the model's output, not a guaranteed crop suitability or yield probability.";

            note.className = "recommendation-note";

            card.appendChild(cropName);
            card.appendChild(score);
            card.appendChild(note);

            resultContainer.appendChild(card);
        });

        resultContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

});
