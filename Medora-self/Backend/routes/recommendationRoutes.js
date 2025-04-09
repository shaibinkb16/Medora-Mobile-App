const express = require("express");
const { getAIRecommendations } = require("../controllers/recommendationController");
const { getLatestOCRMetrics } = require("../controllers/recordsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All GET routes
router.get("/latest-ocr", authMiddleware, getLatestOCRMetrics);
router.get("/ai-recommendations", authMiddleware, getAIRecommendations);
router.get("/gemini-recommendations", authMiddleware, getAIRecommendations); // ✅ Fixed to GET

module.exports = router;