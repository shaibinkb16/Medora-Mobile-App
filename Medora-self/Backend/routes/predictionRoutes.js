const express = require("express");
const router = express.Router();
const { runPredictions } = require("../controllers/predictionController");

router.post("/predict", runPredictions);

module.exports = router;
