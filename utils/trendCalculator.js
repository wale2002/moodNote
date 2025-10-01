// backend/utils/trendCalculator.js
const MoodEntry = require("../models/MoodEntry");
const Note = require("../models/Note");
const moment = require("moment"); // Assume moment is added to dependencies

exports.getWeeklyTrends = async (userId) => {
  const start = moment().startOf("week");
  const end = moment().endOf("week");
  const moods = await MoodEntry.find({
    user: userId,
    timestamp: { $gte: start, $lte: end },
  });

  const days = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  moods.forEach((m) => {
    const day = moment(m.timestamp).format("ddd").toLowerCase();
    days[day].push(m.value);
  });

  const trends = {};
  Object.keys(days).forEach((day) => {
    const avg = days[day].length
      ? days[day].reduce((a, b) => a + b, 0) / days[day].length
      : 0;
    trends[day] = avg;
  });
  return trends;
};

exports.getPieData = async (userId) => {
  const moods = await MoodEntry.find({ user: userId });
  const pie = { negative: 0, neutral: 0, positive: 0 };
  moods.forEach((m) => {
    if (m.value === 0) pie.negative++;
    else if (m.value === 1) pie.neutral++;
    else pie.positive++;
  });
  return pie;
};

exports.getPositiveDaysPercentage = async (userId) => {
  const moods = await MoodEntry.find({ user: userId });
  if (!moods.length) return { percentage: 0, text: "Start tracking" };

  const uniqueDays = [
    ...new Set(moods.map((m) => moment(m.timestamp).format("YYYY-MM-DD"))),
  ];
  const positiveDays = uniqueDays.filter((day) => {
    const dayMoods = moods.filter(
      (m) => moment(m.timestamp).format("YYYY-MM-DD") === day
    );
    const avg = dayMoods.reduce((sum, m) => sum + m.value, 0) / dayMoods.length;
    return avg > 1.5;
  }).length;

  const percentage = Math.round((positiveDays / uniqueDays.length) * 100);
  let text = "";
  if (percentage >= 80) text = "Great outlook";
  else if (percentage >= 50) text = "Balanced";
  else text = "Room for growth";

  return { percentage, text };
};

exports.getStreak = async (userId) => {
  const notes = await Note.find({ user: userId }).sort({ date: -1 });
  if (!notes.length) return 0;

  let streak = 1;
  let current = moment(notes[0].date).startOf("day");
  for (let i = 1; i < notes.length; i++) {
    const prev = moment(notes[i].date).startOf("day");
    if (current.diff(prev, "days") === 1) {
      streak++;
      current = prev;
    } else {
      break;
    }
  }
  return streak;
};

exports.getWeekProgress = async (userId) => {
  const start = moment().startOf("week");
  const end = moment().endOf("week");
  const notes = await Note.find({
    user: userId,
    date: { $gte: start, $lte: end },
  });
  const uniqueDays = new Set(
    notes.map((n) => moment(n.date).format("YYYY-MM-DD"))
  );
  return `${uniqueDays.size}/7`;
};

exports.getTodayCount = async (userId) => {
  const start = moment().startOf("day");
  const end = moment().endOf("day");
  return await Note.countDocuments({
    user: userId,
    date: { $gte: start, $lte: end },
  });
};

exports.getTotalCount = async (userId) => {
  return await Note.countDocuments({ user: userId });
};
