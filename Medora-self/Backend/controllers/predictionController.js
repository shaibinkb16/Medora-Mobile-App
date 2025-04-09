const Record = require("../models/Record");
const Prediction = require("../models/Prediction");
const OCRResult = require("../models/OCRResult");
const { classifySeverity } = require("../config/mlModel");
const { pushNotification } = require("../utils/notificationHelper");

exports.runPredictions = async () => {
  try {
    console.log("🚀 Running Prediction for Latest OCR Data...");

    // Fetch the latest OCR data that hasn't been processed
    const latestOCRData = await OCRResult.findOne({
      recordId: { $nin: await Prediction.distinct("recordId") },
    }).sort({ createdAt: -1 });

    if (!latestOCRData) {
      console.log("⚠️ No new OCR data found for prediction.");
      return { message: "No new OCR data found." };
    }

    const { recordId, userId, extractedMetrics } = latestOCRData;

    console.log("📊 Extracted Metrics from OCR:", extractedMetrics);

    // Extract necessary metrics
    const { bloodSugar, bloodPressure, cholesterol } = extractedMetrics;

    console.log("📊 Metrics Used for Prediction:", { bloodSugar, bloodPressure, cholesterol });

    // Predict severity for available metrics
    const severity = classifySeverity({
      bloodSugar: bloodSugar ?? undefined,
      bloodPressure: bloodPressure ?? undefined,
      cholesterol: cholesterol ?? undefined,
    });

    // Create prediction entry
    const predictionData = {
      recordId,
      userId,
      createdAt: new Date(),
      ...severity,
    };

    // Save prediction to database
    await new Prediction(predictionData).save();
    console.log(`✅ Prediction Saved for Record: ${recordId}`);

    // Send notifications for high/low severity levels
    if (severity.bloodPressure && ["High", "Low"].includes(severity.bloodPressure)) {
      await pushNotification(userId, "Blood Pressure Alert", `Your blood pressure is ${severity.bloodPressure}. Please consult a doctor.`);
    }
    if (severity.bloodSugar && ["High", "Low"].includes(severity.bloodSugar)) {
      await pushNotification(userId, "Blood Sugar Alert", `Your blood sugar is ${severity.bloodSugar}. Monitor your diet.`);
    }
    if (severity.cholesterol && severity.cholesterol === "High") {
      await pushNotification(userId, "Cholesterol Alert", `Your cholesterol level is high. Consider a healthier diet.`);
    }

    console.log("🎯 Prediction Completed.");

    return { message: "Prediction completed successfully.", severity };
  } catch (error) {
    console.error("❌ Prediction Error:", error);
    return { error: "Internal server error" };
  }
};


