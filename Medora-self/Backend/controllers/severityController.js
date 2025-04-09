const axios = require("axios");
const OCRResult = require("../models/OCRResult");
const Notification = require("../models/Notification");

exports.getSeverityPrediction = async (req, res) => {
  try {
    // Fetch latest OCR data for the user
    const latestOCRData = await OCRResult.findOne({ userId: req.user.userId }).sort({ createdAt: -1 });
    console.log(latestOCRData);

    if (!latestOCRData) {
      return res.status(404).json({ error: "No health data available" });
    }

    const { bloodSugar, bloodPressure, cholesterol } = latestOCRData.extractedMetrics || {};

    if (!bloodSugar || !bloodPressure || !cholesterol) {
      return res.status(400).json({ error: "Incomplete health data" });
    }

    // Send data to ML API for severity prediction
    const response = await axios.post("http://192.168.162.200:5001/predict", {
      blood_sugar: bloodSugar,
      systolic_bp: bloodPressure.systolic,
      diastolic_bp: bloodPressure.diastolic,
      cholesterol: cholesterol,
    });

    const severity = response.data.severity;

    // Create a notification if severity is High or Critical
    if (severity === "High" || severity === "Critical") {
      const notification = await Notification.create({
        userId: req.user.userId,
        title: `Health Alert: ${severity} Risk`,
        message: `⚠️ Your health risk level is ${severity}. Please consult a doctor immediately.`,
        role: "user", // Optional, depending on your logic
        // severity, // Optional: Only if you added it in your schema
      });

      console.log("Notification created:", notification);
    }

    res.json({ severity });
  } catch (error) {
    console.error("Severity Prediction Error:", error.message);
    res.status(500).json({ error: "Failed to predict severity" });
  }
};