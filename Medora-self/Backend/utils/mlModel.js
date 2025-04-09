// Backend/utils/mlModel.js
function classifySeverity(value, type) {
    if (value === null || value === undefined) return "N/A";

    switch (type) {
        case "bloodSugar":
            if (value < 70) return "Low";
            if (value >= 70 && value <= 140) return "Normal";
            if (value > 140 && value <= 200) return "High";
            return "Critical";

        case "bloodPressure":
            if (value < 90) return "Low";
            if (value >= 90 && value <= 120) return "Normal";
            if (value > 120 && value <= 180) return "High";
            return "Critical";

        case "cholesterol":
            if (value < 150) return "Low";
            if (value >= 150 && value <= 200) return "Normal";
            if (value > 200 && value <= 250) return "High";
            return "Critical";

        default:
            return "N/A";
    }
}

module.exports = { classifySeverity };
