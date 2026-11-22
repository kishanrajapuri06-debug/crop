
document.addEventListener("DOMContentLoaded", () => {
    const recommendSection = document.querySelector("#recommend");

    if (!recommendSection) return;

    // Create the recommendation form dynamically
    const formContainer = document.createElement("div");
    formContainer.id = "recommendation-form-container";

    formContainer.innerHTML = `
        <form id="crop-form" style="
            max-width: 700px;
            margin: 30px auto;
            text-align: left;
        ">

            <h3 style="margin-bottom: 20px;">
                Enter Agricultural Parameters
            </h3>

            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 15px;
            ">

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

            <button type="submit" id="submit-btn"
                style="margin-top: 25px;">
                Analyze & Recommend Crops →
            </button>

        </form>

        <div id="recommendation-result"
            style="margin-top: 30px;">
        </div>
    `;

    recommendSection.appendChild(formContainer);

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

            card.style.cssText = `
                padding: 20px;
                margin: 15px 0;
                border-radius: 12px;
                background: #f0f7f0;
                border: 1px solid #d5e8d5;
                text-align: left;
            `;

            const cropName = document.createElement("h4");
            cropName.textContent = `${index + 1}. ${item.crop}`;

            const score = document.createElement("p");
            score.textContent =
                `Model probability score: ${item.probability}%`;

            const note = document.createElement("p");
            note.textContent =
                "This score reflects the model's output, not a guaranteed crop suitability or yield probability.";

            note.style.cssText = `
                font-size: 13px;
                color: #555;
                margin-top: 8px;
            `;

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
