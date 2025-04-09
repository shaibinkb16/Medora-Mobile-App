const express = require("express");
const router = express.Router();
const { addOrUpdatePeriod, getPeriodHistory,updatePeriodStartDate } = require("../controllers/periodController");
const authMiddleware = require("../middleware/authMiddleware");

// In periodRoutes.js (backend)
router.get("/history", authMiddleware, getPeriodHistory); // Current path: /history
router.post("/", authMiddleware, addOrUpdatePeriod);      // Current path: /
router.post("/update", authMiddleware, updatePeriodStartDate); // Current path: /update


module.exports = router;
