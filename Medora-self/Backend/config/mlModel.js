const classifySeverity = (metrics) => {
    const results = {
        bloodSugar: "Normal",
        bloodPressure: "Normal",
        cholesterol: "Normal"
    };

    // Blood Sugar Classification
    if (metrics.bloodSugar) {
        if (metrics.bloodSugar < 70) results.bloodSugar = "Low";
        else if (metrics.bloodSugar >= 180) results.bloodSugar = "High";
    }

    // Blood Pressure Classification
    if (metrics.bloodPressure) {
        const [systolic, diastolic] = metrics.bloodPressure.split('/').map(Number);
        if (systolic < 90 || diastolic < 60) results.bloodPressure = "Low";
        else if (systolic >= 140 || diastolic >= 90) results.bloodPressure = "High";
    }

    // Cholesterol Classification
    if (metrics.cholesterol) {
        if (metrics.cholesterol >= 240) results.cholesterol = "High";
    }

    return results;
};

module.exports = { classifySeverity };