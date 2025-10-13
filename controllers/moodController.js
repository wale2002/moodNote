// backend/controllers/moodController.js
const MoodEntry = require("../models/MoodEntry");
const mongoose = require("mongoose");
const {
  getWeeklyTrends,
  getPieData,
  getWeeklyMoodCounts,
  getPositiveDaysPercentage,
  getMoodDistribution,
} = require("../utils/trendCalculator");
const { mapMoodToValue, categorizeMood } = require("../utils/moodMapper");

exports.saveMood = async (req, res) => {
  const { mood } = req.body; // mood: 'ecstatic', 'happy', 'stressed', 'peaceful'
  try {
    const value = mapMoodToValue(mood);
    const entry = new MoodEntry({ mood, value, user: req.user.id });
    await entry.save();

    res.status(201).json({
      statusCode: 201,
      status: "success",
      data: entry,
      message: "Mood saved",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getWeeklyTrends = async (req, res) => {
  try {
    const trends = await getWeeklyTrends(req.user.id);
    res.status(200).json({ statusCode: 200, status: "success", data: trends }); // { mon: avg, tue: avg, ... } on 0-3 scale
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
exports.getWeeklyMoodCounts = async (req, res) => {
  try {
    const trends = await getWeeklyMoodCounts(req.user.id);
    res.status(200).json({ statusCode: 200, status: "success", data: trends }); // { mon: {ecstatic: count, happy: count, stressed: count, peaceful: count, total: count}, ... }
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getPieData = async (req, res) => {
  try {
    const pie = await getPieData(req.user.id);
    res.status(200).json({ statusCode: 200, status: "success", data: pie }); // { negative: count, neutral: count, positive: count }
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getPositiveDays = async (req, res) => {
  try {
    const { percentage, text } = await getPositiveDaysPercentage(req.user.id);
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { percentage, text } }); // e.g., 80, 'Great outlook'
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
exports.getIndividualMoodCounts = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const counts = await MoodEntry.aggregate([
      { $match: { user: userObjectId } },
      { $group: { _id: "$mood", count: { $sum: 1 } } },
    ]);

    const moodCounts = {
      ecstatic: 0,
      happy: 0,
      sad: 0,
      peaceful: 0,
    };

    counts.forEach((c) => {
      if (moodCounts.hasOwnProperty(c._id)) {
        moodCounts[c._id] = c.count;
      }
    });

    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: moodCounts,
      message: "Individual mood counts retrieved",
    });
  } catch (err) {
    console.error("Error retrieving individual mood counts:", err);
    res.status(500).json({
      statusCode: 500,
      status: "error",
      message: "Server error",
    });
  }
};

exports.getMoodEntriesByType = async (req, res) => {
  const { mood } = req.params; // Expected moods: ecstatic, happy, stressed, peaceful
  const validMoods = ["ecstatic", "happy", "sad", "peaceful"];

  if (!validMoods.includes(mood)) {
    return res.status(400).json({
      statusCode: 400,
      status: "error",
      message: "Invalid mood type",
    });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const entries = await MoodEntry.find({ user: userObjectId, mood })
      .sort({ timestamp: -1 })
      .limit(50); // Limit to recent 50 entries for performance

    const count = entries.length;

    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: { mood, count, entries },
      message: `Entries for ${mood} retrieved`,
    });
  } catch (err) {
    console.error(`Error retrieving entries for mood ${mood}:`, err);
    res.status(500).json({
      statusCode: 500,
      status: "error",
      message: "Server error",
    });
  }
};
exports.getMoodDistribution = async (req, res) => {
  try {
    const distribution = await getMoodDistribution(req.user.id);
    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: distribution,
      message: "Mood distribution with note counts retrieved",
    });
  } catch (err) {
    console.error("Error retrieving mood distribution:", err);
    res.status(500).json({
      statusCode: 500,
      status: "error",
      message: "Server error",
    });
  }
};
