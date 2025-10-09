// backend/utils/trendCalculator.js (updated with ObjectId conversion for aggregation and minor fixes)
const MoodEntry = require("../models/MoodEntry");
const Note = require("../models/Note");
const mongoose = require("mongoose"); // Add this import for ObjectId
const moment = require("moment"); // Ensure 'moment' is installed: npm install moment

exports.getTotalStreaks = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId for aggregation match
    const result = await Note.aggregate([
      { $match: { user: userObjectId } }, // Now correctly matches ObjectId
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d", // Group by date (YYYY-MM-DD)
              date: "$date", // Use the 'date' field from Note schema
            },
          },
        },
      },
      { $count: "totalDays" }, // Count unique days with notes
    ]);
    return result[0]?.totalDays || 0;
  } catch (error) {
    console.error("Error calculating total streaks:", error);
    throw error;
  }
};

exports.getWeeklyTrends = async (userId) => {
  const start = moment().startOf("week");
  const end = moment().endOf("week");
  const userObjectId = new mongoose.Types.ObjectId(userId); // Add conversion for consistency
  const moods = await MoodEntry.find({
    user: userObjectId,
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
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const moods = await MoodEntry.find({ user: userObjectId });
  const pie = { negative: 0, neutral: 0, positive: 0 };
  moods.forEach((m) => {
    if (m.value === 0) pie.negative++;
    else if (m.value === 1) pie.neutral++;
    else pie.positive++;
  });
  return pie;
};

// Update in backend/utils/trendCalculator.js
exports.getPositiveDaysPercentage = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Reuse the aggregation logic from getIndividualMoodCounts
  const counts = await MoodEntry.aggregate([
    { $match: { user: userObjectId } },
    { $group: { _id: "$mood", count: { $sum: 1 } } },
  ]);

  const moodCounts = {
    ecstatic: 0,
    happy: 0,
    stressed: 0,
    peaceful: 0,
  };

  counts.forEach((c) => {
    if (moodCounts.hasOwnProperty(c._id)) {
      moodCounts[c._id] = c.count;
    }
  });

  const totalMoods = Object.values(moodCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  if (totalMoods === 0) return { percentage: 0, text: "Start tracking" };

  // Positive moods: ecstatic (3) + happy (2)
  const positiveMoods = moodCounts.ecstatic + moodCounts.happy;
  const percentage = Math.round((positiveMoods / totalMoods) * 100);

  let text = "";
  if (percentage >= 80) text = "Great outlook";
  else if (percentage >= 50) text = "Balanced";
  else text = "Room for growth";

  return { percentage, text };
};
// exports.getPositiveDaysPercentage = async (userId) => {
//   const userObjectId = new mongoose.Types.ObjectId(userId);
//   const moods = await MoodEntry.find({ user: userObjectId });
//   if (!moods.length) return { percentage: 0, text: "Start tracking" };

//   // Optional: Rolling window for recency (ignores data >30 days old)
//   const thirtyDaysAgo = moment().subtract(30, "days").startOf("day");
//   const recentMoods = moods.filter((m) => moment(m.timestamp) >= thirtyDaysAgo);

//   if (!recentMoods.length)
//     return { percentage: 0, text: "Start tracking recent moods" };

//   // Optimize: Group by day upfront
//   const moodsByDay = recentMoods.reduce((acc, m) => {
//     const day = moment(m.timestamp).format("YYYY-MM-DD");
//     if (!acc[day]) acc[day] = [];
//     acc[day].push(m.value);
//     return acc;
//   }, {});

//   const uniqueDays = Object.keys(moodsByDay);
//   const MIN_DAYS = 3; // Lowered for quicker feedback

//   if (uniqueDays.length < MIN_DAYS) {
//     return {
//       percentage: 0,
//       text: `Track more days to see stats (have ${uniqueDays.length})`,
//     };
//   }

//   const positiveDays = uniqueDays.filter((day) => {
//     const values = moodsByDay[day];
//     const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
//     return avg >= 1.5; // Changed to >= for borderline days
//   }).length;

//   const percentage = Math.round((positiveDays / uniqueDays.length) * 100);
//   let text = "";
//   if (percentage >= 80) text = "Great outlook";
//   else if (percentage >= 50) text = "Balanced";
//   else text = "Room for growth";

//   // Disclaimer for small samples
//   if (uniqueDays.length < 7) text += ` (based on ${uniqueDays.length} days)`;

//   return { percentage, text };
// };

exports.getStreak = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId); // Add for consistency (though find handles strings)
  const notes = await Note.find({ user: userObjectId }).sort({ date: -1 });
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
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const notes = await Note.find({
    user: userObjectId,
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
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return await Note.countDocuments({
    user: userObjectId,
    date: { $gte: start, $lte: end },
  });
};

exports.getTotalCount = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return await Note.countDocuments({ user: userObjectId });
};

exports.getMoodDistribution = async (userId) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch all mood entries and notes
    const moods = await MoodEntry.find({ user: userObjectId }).lean();
    const notes = await Note.find({ user: userObjectId }).lean();

    // Create a map of date strings to note counts
    const noteCounts = {};
    notes.forEach((n) => {
      const dateStr = moment(n.date).format("YYYY-MM-DD");
      noteCounts[dateStr] = (noteCounts[dateStr] || 0) + 1;
    });

    // Collect unique days per mood
    const moodDays = {
      ecstatic: new Set(),
      happy: new Set(),
      stressed: new Set(),
      peaceful: new Set(),
    };

    moods.forEach((m) => {
      const dateStr = moment(m.timestamp).format("YYYY-MM-DD");
      const mood = m.mood;
      if (moodDays[mood]) {
        moodDays[mood].add(dateStr);
      }
    });

    // Calculate mood counts and associated note counts
    const distribution = {
      ecstatic: { moodCount: 0, noteCount: 0 },
      happy: { moodCount: 0, noteCount: 0 },
      stressed: { moodCount: 0, noteCount: 0 },
      peaceful: { moodCount: 0, noteCount: 0 },
    };

    Object.keys(moodDays).forEach((mood) => {
      distribution[mood].moodCount = moods.filter(
        (m) => m.mood === mood
      ).length;
      moodDays[mood].forEach((dateStr) => {
        distribution[mood].noteCount += noteCounts[dateStr] || 0;
      });
    });

    return distribution;
  } catch (error) {
    console.error("Error calculating mood distribution:", error);
    throw error;
  }
};
// backend/utils/trendCalculator.js (renamed getWeeklyTrends to getWeeklyMoodCounts)
exports.getWeeklyMoodCounts = async (userId) => {
  const start = moment().startOf("week");
  const end = moment().endOf("week");
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const moods = await MoodEntry.find({
    user: userObjectId,
    timestamp: { $gte: start, $lte: end },
  });

  const days = {
    mon: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
    tue: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
    wed: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
    thu: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
    fri: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
    sat: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
    sun: { ecstatic: 0, happy: 0, stressed: 0, peaceful: 0 },
  };

  moods.forEach((m) => {
    const day = moment(m.timestamp).format("ddd").toLowerCase();
    if (days[day]) {
      days[day][m.mood]++;
    }
  });

  // Optionally add total count per day if needed (up to 8 as mentioned)
  Object.keys(days).forEach((day) => {
    const total = Object.values(days[day]).reduce((a, b) => a + b, 0);
    days[day].total = total;
  });

  return days;
};
