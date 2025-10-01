// backend/controllers/moodController.js
const MoodEntry = require("../models/MoodEntry");
const {
  getWeeklyTrends,
  getPieData,
  getPositiveDaysPercentage,
} = require("../utils/trendCalculator");
const { mapMoodToValue, categorizeMood } = require("../utils/moodMapper");

exports.saveMood = async (req, res) => {
  const { mood } = req.body; // mood: 'ecstatic', 'happy', 'stressed', 'peaceful'
  try {
    const value = mapMoodToValue(mood);
    const entry = new MoodEntry({ mood, value, user: req.user.id });
    await entry.save();
    res.json({ msg: "Mood saved" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getWeeklyTrends = async (req, res) => {
  try {
    const trends = await getWeeklyTrends(req.user.id);
    res.json(trends); // { mon: avg, tue: avg, ... } on 0-3 scale
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getPieData = async (req, res) => {
  try {
    const pie = await getPieData(req.user.id);
    res.json(pie); // { negative: count, neutral: count, positive: count }
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getPositiveDays = async (req, res) => {
  try {
    const { percentage, text } = await getPositiveDaysPercentage(req.user.id);
    res.json({ percentage, text }); // e.g., 80, 'Great outlook'
  } catch (err) {
    res.status(500).send("Server error");
  }
};
