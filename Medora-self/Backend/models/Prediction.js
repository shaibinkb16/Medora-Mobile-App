const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
    recordId: { type: mongoose.Schema.Types.ObjectId, ref: "Record", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bloodSugar: { type: String, default: "N/A" },
    bloodPressure: { type: String, default: "N/A" },
    cholesterol: { type: String, default: "N/A" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Prediction", predictionSchema);
