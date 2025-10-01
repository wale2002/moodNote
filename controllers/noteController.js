// backend/controllers/noteController.js
const Note = require("../models/Note");
const { generatePrompt } = require("../utils/promptGenerator");
const {
  getStreak,
  getWeekProgress,
  getTodayCount,
  getTotalCount,
} = require("../utils/trendCalculator");

exports.createNote = async (req, res) => {
  const { content } = req.body;
  try {
    const note = new Note({ content, user: req.user.id });
    await note.save();
    res.json({ msg: "Note saved" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getDailyPrompt = (req, res) => {
  const prompt = generatePrompt();
  res.json({ prompt });
};

exports.getTodayCount = async (req, res) => {
  try {
    const count = await getTodayCount(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getTotalCount = async (req, res) => {
  try {
    const count = await getTotalCount(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getStreak = async (req, res) => {
  try {
    const streak = await getStreak(req.user.id);
    res.json({ streak });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getWeekProgress = async (req, res) => {
  try {
    const progress = await getWeekProgress(req.user.id);
    res.json({ progress }); // e.g., '3/7'
  } catch (err) {
    res.status(500).send("Server error");
  }
};
