// backend/controllers/insightController.js
const MoodEntry = require("../models/MoodEntry");
const Note = require("../models/Note");
const { getWeeklyTrends } = require("../utils/trendCalculator"); // Reuse for best days

// Simple logic for insights, can be expanded with AI/ML later
exports.getPatterns = async (req, res) => {
  try {
    const trends = await getWeeklyTrends(req.user.id);
    const bestDay = Object.keys(trends).reduce((a, b) =>
      trends[a] > trends[b] ? a : b
    );
    const bestDayInsight = `${
      bestDay.charAt(0).toUpperCase() + bestDay.slice(1)
    }s are your happiest`;
    const bestDayDesc =
      "Based on your mood entries, you tend to feel better on these days.";

    // Evening reflecting: assume most notes in evening
    const notes = await Note.find({ user: req.user.id });
    const hours = notes.map((n) => n.date.getHours());
    const eveningCount = hours.filter((h) => h >= 18).length;
    const eveningInsight =
      eveningCount > notes.length / 2
        ? "You reflect most in the evenings"
        : "You reflect throughout the day";
    const eveningDesc = "Evening reflection helps process the day's events.";

    res.json({
      bestDays: { insight: bestDayInsight, description: bestDayDesc },
      eveningReflecting: { insight: eveningInsight, description: eveningDesc },
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

exports.getRecentInsights = async (req, res) => {
  try {
    // Positive mood trend
    const recentMoods = await MoodEntry.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(7);
    const avg =
      recentMoods.reduce((sum, m) => sum + m.value, 0) / recentMoods.length;
    const positiveTrend =
      avg > 1.5 ? "Positive mood trend" : "Room for improvement";
    const positiveDesc = "Your recent moods show an upward trend. Keep it up!";

    // Consistency win
    const notes = await Note.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(7);
    const consistency =
      notes.length >= 5 ? "Consistency win" : "Build your habit";
    const consistencyDesc =
      "You've been consistent with your entries this week.";

    // Self-awareness
    const moods = await MoodEntry.find({ user: req.user.id });
    const uniqueMoods = new Set(moods.map((m) => m.mood));
    const selfAwareness =
      uniqueMoods.size > 2 ? "Growing self-awareness" : "Explore more emotions";
    const selfAwarenessDesc = "You're recognizing a variety of emotions.";

    res.json({
      positiveTrend: { insight: positiveTrend, description: positiveDesc },
      consistency: { insight: consistency, description: consistencyDesc },
      selfAwareness: { insight: selfAwareness, description: selfAwarenessDesc },
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
