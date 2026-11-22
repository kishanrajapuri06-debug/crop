
const translations = {
    en: {
        brand_subtitle: "Crop planning, made clearer",
        nav_how: "How it works",
        nav_planner: "Crop planner",
        nav_history: "Recent results",
        language_label: "Language",
        open_planner: "Open crop planner",

        hero_eyebrow: "FIELD DATA TO CROP IDEAS",
        hero_title: "Plan your next crop with more confidence.",
        hero_description: "Explore crop options from the project's agricultural dataset using soil type, season, water source, and water requirement.",
        hero_button: "Build a recommendation",
        hero_link: "See how it works",

        metric_crops: "crop options",
        metric_inputs: "field inputs",
        metric_predictions: "saved predictions",

        art_title: "Grounded in your inputs",
        art_subtitle: "Soil · season · water",
        art_caption: "A starting point for better questions",

        intro_kicker: "A SIMPLE FIELD GUIDE",
        intro_title: "Useful crop ideas start with the conditions you know.",
        intro_description: "Choose the soil, growing season, and water source for your field, then enter the crop water requirement to compare the patterns represented in the training data.",

        step1_title: "Describe your field",
        step1_description: "Select supported values from the dataset so the model sees inputs it was trained to recognize.",
        step2_title: "Review crop matches",
        step2_description: "See up to three crop labels ranked by the model's probability scores.",
        step3_title: "Keep a record",
        step3_description: "Your recommendations are saved locally in the app's SQLite history for later reference.",

        planner_kicker: "SMART HARVEST PLANNER",
        planner_title: "Explore crop options",
        planner_description: "Use the conditions you have. The available soil and season choices come directly from the project dataset.",

        form_title: "Field conditions",
        form_description: "Complete all four inputs to get a ranked list.",

        soil_label: "Soil type",
        soil_loading: "Loading soil types…",
        soil_help: "Choose the closest soil description.",

        season_label: "Growing season",
        season_loading: "Loading seasons…",
        season_help: "Use the season that matches your planting plan.",

        water_source_label: "Water source",
        water_loading: "Loading water sources…",
        water_source_help: "Select rainfed or irrigated conditions.",

        water_required_label: "Water requirement",
        water_placeholder: "e.g. 850",
        water_range_help: "Use a value within the dataset's supported range.",

        form_note: "Model scores describe similarity to training patterns. They do not guarantee yield or suitability.",
        submit_button: "Get crop ideas",

        results_kicker: "YOUR RESULTS",
        results_title: "Recommended crops",

        engine_title: "Recommendation engine",
        model_checking: "Checking dataset and model…",
        train_button: "Train model",
        dataset_label: "Dataset",
        checking: "Checking",
        available_crops: "Available crops",

        importance_title: "What shapes predictions?",
        importance_description: "The model's strongest encoded features from training.",
        importance_loading: "Loading feature importance…",

        history_kicker: "LOCAL APP HISTORY",
        history_title: "Recent recommendations",
        history_description: "Saved on this app instance. The newest records appear first.",
        history_loading: "Loading saved recommendations…",

        footer_brand: "Field decisions, thoughtfully explored",
        footer_description: "Use recommendations alongside local knowledge, soil testing, and agricultural guidance.",
        back_to_top: "Back to top ↑",
        footer_tag: "Crop planning support"
    },

    kn: {
        brand_subtitle: "ಸುಲಭ ಬೆಳೆ ಯೋಜನೆ",
        nav_how: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
        nav_planner: "ಬೆಳೆ ಯೋಜನೆ",
        nav_history: "ಇತ್ತೀಚಿನ ಫಲಿತಾಂಶಗಳು",
        language_label: "ಭಾಷೆ",
        open_planner: "ಬೆಳೆ ಯೋಜನೆ ತೆರೆಯಿರಿ",

        hero_eyebrow: "ಕೃಷಿ ಮಾಹಿತಿಯಿಂದ ಬೆಳೆ ಸಲಹೆ",
        hero_title: "ಹೆಚ್ಚಿನ ವಿಶ್ವಾಸದಿಂದ ನಿಮ್ಮ ಮುಂದಿನ ಬೆಳೆಯನ್ನು ಯೋಜಿಸಿ.",
        hero_description: "ಮಣ್ಣಿನ ಪ್ರಕಾರ, ಋತು, ನೀರಿನ ಮೂಲ ಮತ್ತು ನೀರಿನ ಅವಶ್ಯಕತೆಯ ಆಧಾರದ ಮೇಲೆ ಬೆಳೆ ಆಯ್ಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        hero_button: "ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಿರಿ",
        hero_link: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",

        metric_crops: "ಬೆಳೆ ಆಯ್ಕೆಗಳು",
        metric_inputs: "ಕೃಷಿ ಮಾಹಿತಿ",
        metric_predictions: "ಉಳಿಸಿದ ಸಲಹೆಗಳು",

        art_title: "ನಿಮ್ಮ ಕೃಷಿ ಮಾಹಿತಿಯ ಆಧಾರದಲ್ಲಿ",
        art_subtitle: "ಮಣ್ಣು · ಋತು · ನೀರು",
        art_caption: "ಉತ್ತಮ ಕೃಷಿ ನಿರ್ಧಾರಗಳಿಗೆ ಒಂದು ಆರಂಭ",

        intro_kicker: "ಸರಳ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ",
        intro_title: "ನಿಮಗೆ ತಿಳಿದಿರುವ ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಳಿಂದ ಉತ್ತಮ ಬೆಳೆ ಆಯ್ಕೆಗಳು ಆರಂಭವಾಗುತ್ತವೆ.",
        intro_description: "ನಿಮ್ಮ ಹೊಲದ ಮಣ್ಣು, ಬೆಳೆಯುವ ಋತು ಮತ್ತು ನೀರಿನ ಮೂಲವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನಂತರ ನೀರಿನ ಅವಶ್ಯಕತೆಯನ್ನು ನಮೂದಿಸಿ.",

        step1_title: "ನಿಮ್ಮ ಹೊಲದ ವಿವರ ನೀಡಿ",
        step1_description: "ಮಾದರಿಯು ಗುರುತಿಸಬಲ್ಲ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        step2_title: "ಬೆಳೆ ಸಲಹೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
        step2_description: "ಮಾದರಿಯ ಅಂಕಗಳ ಆಧಾರದ ಮೇಲೆ ಮೂರು ಬೆಳೆ ಆಯ್ಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        step3_title: "ಸಲಹೆಗಳನ್ನು ಉಳಿಸಿಕೊಳ್ಳಿ",
        step3_description: "ನಿಮ್ಮ ಬೆಳೆ ಸಲಹೆಗಳನ್ನು ನಂತರ ಪರಿಶೀಲಿಸಲು ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ.",

        planner_kicker: "ಸ್ಮಾರ್ಟ್ ಹಾರ್ವೆಸ್ಟ್ ಬೆಳೆ ಯೋಜನೆ",
        planner_title: "ಬೆಳೆ ಆಯ್ಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
        planner_description: "ನಿಮಗೆ ತಿಳಿದಿರುವ ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಬಳಸಿ. ಮಣ್ಣು ಮತ್ತು ಋತುವಿನ ಆಯ್ಕೆಗಳು ಯೋಜನೆಯ ಡೇಟಾಸೆಟ್‌ನಿಂದ ಲಭ್ಯವಿವೆ.",

        form_title: "ಹೊಲದ ಪರಿಸ್ಥಿತಿಗಳು",
        form_description: "ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಲು ಎಲ್ಲಾ ನಾಲ್ಕು ಮಾಹಿತಿಗಳನ್ನು ನಮೂದಿಸಿ.",

        soil_label: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
        soil_loading: "ಮಣ್ಣಿನ ಪ್ರಕಾರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
        soil_help: "ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಹೊಂದುವ ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

        season_label: "ಬೆಳೆಯುವ ಋತು",
        season_loading: "ಋತುಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
        season_help: "ನಿಮ್ಮ ಬೆಳೆ ಯೋಜನೆಗೆ ಹೊಂದುವ ಋತುವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

        water_source_label: "ನೀರಿನ ಮೂಲ",
        water_loading: "ನೀರಿನ ಮೂಲಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",
        water_source_help: "ಮಳೆ ಅಥವಾ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

        water_required_label: "ನೀರಿನ ಅವಶ್ಯಕತೆ",
        water_placeholder: "ಉದಾ. 850",
        water_range_help: "ಡೇಟಾಸೆಟ್‌ನಲ್ಲಿ ಅನುಮತಿಸಲಾದ ಮೌಲ್ಯವನ್ನು ನಮೂದಿಸಿ.",

        form_note: "ಮಾದರಿಯ ಅಂಕಗಳು ತರಬೇತಿ ಮಾಹಿತಿಯೊಂದಿಗಿನ ಸಾಮ್ಯತೆಯನ್ನು ಸೂಚಿಸುತ್ತವೆ. ಇವು ಇಳುವರಿ ಅಥವಾ ಬೆಳೆಯ ಸೂಕ್ತತೆಯನ್ನು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ.",
        submit_button: "ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಿರಿ",

        results_kicker: "ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳು",
        results_title: "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು",

        engine_title: "ಬೆಳೆ ಶಿಫಾರಸು ವ್ಯವಸ್ಥೆ",
        model_checking: "ಡೇಟಾಸೆಟ್ ಮತ್ತು ಮಾದರಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
        train_button: "ಮಾದರಿಯನ್ನು ತರಬೇತಿ ಮಾಡಿ",
        dataset_label: "ಡೇಟಾಸೆಟ್",
        checking: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ",
        available_crops: "ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳು",

        importance_title: "ಸಲಹೆಯನ್ನು ಯಾವುದು ನಿರ್ಧರಿಸುತ್ತದೆ?",
        importance_description: "ತರಬೇತಿಯ ಸಮಯದಲ್ಲಿ ಮಾದರಿಗೆ ಪ್ರಮುಖವಾಗಿರುವ ಮಾಹಿತಿಗಳು.",
        importance_loading: "ಮಾಹಿತಿಯ ಪ್ರಾಮುಖ್ಯತೆಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",

        history_kicker: "ಅಪ್ಲಿಕೇಶನ್ ಇತಿಹಾಸ",
        history_title: "ಇತ್ತೀಚಿನ ಬೆಳೆ ಸಲಹೆಗಳು",
        history_description: "ಈ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ. ಹೊಸ ಸಲಹೆಗಳು ಮೊದಲು ಕಾಣಿಸುತ್ತವೆ.",
        history_loading: "ಉಳಿಸಿದ ಸಲಹೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…",

        footer_brand: "ವಿವೇಕಪೂರ್ಣ ಕೃಷಿ ನಿರ್ಧಾರಗಳಿಗೆ",
        footer_description: "ಬೆಳೆ ಸಲಹೆಗಳ ಜೊತೆಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಜ್ಞಾನ, ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಕೃಷಿ ತಜ್ಞರ ಮಾರ್ಗದರ್ಶನವನ್ನು ಬಳಸಿ.",
        back_to_top: "ಮೇಲಕ್ಕೆ ಹಿಂತಿರುಗಿ ↑",
        footer_tag: "ಬೆಳೆ ಯೋಜನೆ ಸಹಾಯ"
    },

    hi: {
        brand_subtitle: "आसान फसल योजना",
        nav_how: "यह कैसे काम करता है",
        nav_planner: "फसल योजना",
        nav_history: "हाल के परिणाम",
        language_label: "भाषा",
        open_planner: "फसल योजना खोलें",

        hero_eyebrow: "खेती की जानकारी से फसल सुझाव",
        hero_title: "अधिक विश्वास के साथ अपनी अगली फसल की योजना बनाएं।",
        hero_description: "मिट्टी, मौसम, पानी के स्रोत और पानी की आवश्यकता के आधार पर फसल विकल्प देखें।",
        hero_button: "फसल सुझाव प्राप्त करें",
        hero_link: "यह कैसे काम करता है",

        metric_crops: "फसल विकल्प",
        metric_inputs: "खेती की जानकारी",
        metric_predictions: "सहेजे गए सुझाव",

        art_title: "आपकी जानकारी पर आधारित",
        art_subtitle: "मिट्टी · मौसम · पानी",
        art_caption: "बेहतर कृषि निर्णयों की शुरुआत",

        intro_kicker: "एक सरल कृषि मार्गदर्शिका",
        intro_title: "अच्छे फसल विकल्प आपकी खेती की परिस्थितियों को समझने से शुरू होते हैं।",
        intro_description: "अपने खेत की मिट्टी, मौसम और पानी का स्रोत चुनें। फिर पानी की आवश्यकता दर्ज करें।",

        step1_title: "अपने खेत का विवरण दें",
        step1_description: "डेटासेट में उपलब्ध जानकारी चुनें, जिसे मॉडल पहचानना सीख चुका है।",
        step2_title: "फसल सुझाव देखें",
        step2_description: "मॉडल के स्कोर के आधार पर तीन फसल विकल्प देखें।",
        step3_title: "रिकॉर्ड सुरक्षित रखें",
        step3_description: "आपके फसल सुझाव भविष्य में देखने के लिए ऐप में सुरक्षित रखे जाते हैं।",

        planner_kicker: "स्मार्ट हार्वेस्ट फसल योजना",
        planner_title: "फसल विकल्प देखें",
        planner_description: "उपलब्ध खेती की जानकारी का उपयोग करें। मिट्टी और मौसम के विकल्प परियोजना के डेटासेट से लिए गए हैं।",

        form_title: "खेत की परिस्थितियां",
        form_description: "फसल सुझाव प्राप्त करने के लिए सभी चार जानकारी भरें।",

        soil_label: "मिट्टी का प्रकार",
        soil_loading: "मिट्टी के प्रकार लोड हो रहे हैं…",
        soil_help: "अपने खेत के लिए उपयुक्त मिट्टी का प्रकार चुनें।",

        season_label: "फसल का मौसम",
        season_loading: "मौसम लोड हो रहे हैं…",
        season_help: "अपनी खेती की योजना के अनुसार मौसम चुनें।",

        water_source_label: "पानी का स्रोत",
        water_loading: "पानी के स्रोत लोड हो रहे हैं…",
        water_source_help: "वर्षा आधारित या सिंचाई की स्थिति चुनें।",

        water_required_label: "पानी की आवश्यकता",
        water_placeholder: "उदाहरण: 850",
        water_range_help: "डेटासेट की निर्धारित सीमा के भीतर मान दर्ज करें।",

        form_note: "मॉडल स्कोर प्रशिक्षण डेटा से समानता दर्शाते हैं। वे फसल की पैदावार या उपयुक्तता की गारंटी नहीं देते।",
        submit_button: "फसल सुझाव प्राप्त करें",

        results_kicker: "आपके परिणाम",
        results_title: "अनुशंसित फसलें",

        engine_title: "फसल सुझाव प्रणाली",
        model_checking: "डेटासेट और मॉडल की जांच हो रही है…",
        train_button: "मॉडल को प्रशिक्षित करें",
        dataset_label: "डेटासेट",
        checking: "जांच हो रही है",
        available_crops: "उपलब्ध फसलें",

        importance_title: "सुझाव किन बातों पर आधारित हैं?",
        importance_description: "प्रशिक्षण के दौरान मॉडल के लिए सबसे महत्वपूर्ण जानकारी।",
        importance_loading: "फीचर महत्व लोड हो रहा है…",

        history_kicker: "ऐप का इतिहास",
        history_title: "हाल के फसल सुझाव",
        history_description: "इस ऐप में सुरक्षित किए गए सुझाव। नए सुझाव पहले दिखाई देते हैं।",
        history_loading: "सहेजे गए सुझाव लोड हो रहे हैं…",

        footer_brand: "सोच-समझकर खेती के निर्णय",
        footer_description: "फसल सुझावों के साथ स्थानीय कृषि ज्ञान, मिट्टी की जांच और कृषि विशेषज्ञों की सलाह का उपयोग करें।",
        back_to_top: "ऊपर वापस जाएं ↑",
        footer_tag: "फसल योजना सहायता"
    }
};


function applyLanguage(language) {
    const selected = translations[language] || translations.en;

    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;

        if (selected[key] !== undefined) {
            element.textContent = selected[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.dataset.i18nPlaceholder;

        if (selected[key] !== undefined) {
            element.placeholder = selected[key];
        }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(element => {
        const key = element.dataset.i18nTitle;

        if (selected[key] !== undefined) {
            element.title = selected[key];
        }
    });

    localStorage.setItem("smartharvest_language", language);
}


document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("language-selector");

    if (!selector) return;

    const savedLanguage = localStorage.getItem("smartharvest_language") || "en";

    selector.value = savedLanguage;

    applyLanguage(savedLanguage);

    selector.addEventListener("change", () => {
        applyLanguage(selector.value);
    });
});
