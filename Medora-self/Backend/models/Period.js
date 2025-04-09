const mongoose = require("mongoose");

const PeriodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstPeriodDate: { type: Date, required: true },
  cycleLength: { type: Number, required: true },
  periodLength: { type: Number, required: true },
  history: [{ type: Date }],
  nextPeriodDate: { type: Date },
  notificationPreferences: {
    oneWeekBefore: { type: Boolean, default: true },
    threeDaysBefore: { type: Boolean, default: true },
    oneDayBefore: { type: Boolean, default: true },
    onStartDate: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model("Period", PeriodSchema);