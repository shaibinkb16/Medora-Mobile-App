/* const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createReminder,
  getUserReminders,
  deleteReminder,
  getUpcomingReminders,
  getScheduledReminders
} = require("../controllers/reminderController");

router.post("/", authMiddleware, createReminder);
router.get("/", authMiddleware, getUserReminders);
router.get("/upcoming", authMiddleware, getUpcomingReminders);
router.get("/scheduled", authMiddleware, getScheduledReminders);
router.delete("/:id", authMiddleware, deleteReminder);

module.exports = router;
 */



const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware); // All routes below need authentication

router.get('/', reminderController.getReminders);
router.post('/', reminderController.createReminder);
router.put('/:id', reminderController.updateReminder);
router.delete('/:id', reminderController.deleteReminder);
router.get('/upcoming', authMiddleware, reminderController.getUpcomingReminders);


module.exports = router;
 