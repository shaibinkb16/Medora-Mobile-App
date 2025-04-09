const express = require("express");
const { getSeverityPrediction } = require("../controllers/severityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Endpoint to predict severity
router.get("/predict", authMiddleware, getSeverityPrediction);

module.exports = router;
