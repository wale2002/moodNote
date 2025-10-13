// backend/models/MoodEntry.js
const mongoose = require("mongoose");

const MoodEntrySchema = new mongoose.Schema({
  mood: {
    type: String,
    enum: ["ecstatic", "happy", "stressed", "peaceful"],
    required: true,
  },
  value: { type: Number, min: 0, max: 3, required: true },
  timestamp: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("MoodEntry", MoodEntrySchema);
