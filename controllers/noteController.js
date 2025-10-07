// // backend/controllers/noteController.js
// const Note = require("../models/Note");
// const MoodEntry = require("../models/MoodEntry");
// const mongoose = require("mongoose");
// const { generatePrompt } = require("../utils/promptGenerator");
// const { mapMoodToValue } = require("../utils/moodMapper");
// const {
//   getStreak,
//   getWeekProgress,
//   getTodayCount,
//   getTotalCount,
// } = require("../utils/trendCalculator");
// // backend/controllers/noteController.js (add this export alongside createNote)

// exports.getNotes = async (req, res) => {
//   try {
//     const { limit = 10, page = 1 } = req.query; // Optional pagination
//     const skip = (page - 1) * limit;

//     const notes = await Note.find({ user: req.user.id })
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Note.countDocuments({ user: req.user.id });

//     res.json({
//       notes,
//       total,
//       pages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//     });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };
// exports.createNote = async (req, res) => {
//   const { content } = req.body;
//   try {
//     const note = new Note({ content, user: req.user.id });
//     await note.save();
//     res.json({ msg: "Note saved" });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.getDailyPrompt = (req, res) => {
//   const prompt = generatePrompt();
//   res.json({ prompt });
// };

// exports.getTodayCount = async (req, res) => {
//   try {
//     const count = await getTodayCount(req.user.id);
//     res.json({ count });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.getTotalCount = async (req, res) => {
//   try {
//     const count = await getTotalCount(req.user.id);
//     res.json({ count });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.getStreak = async (req, res) => {
//   try {
//     const streak = await getStreak(req.user.id);
//     res.json({ streak });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.getWeekProgress = async (req, res) => {
//   try {
//     const progress = await getWeekProgress(req.user.id);
//     res.json({ progress }); // e.g., '3/7'
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };
// // Assuming this is added to backend/controllers/noteController.js or similar
// exports.saveMoodAndNote = async (req, res) => {
//   const { mood, content } = req.body; // Expect both in the request body
//   const session = await mongoose.startSession(); // For transactions (requires MongoDB 4.0+ and replica set)
//   session.startTransaction();

//   try {
//     // Map mood to value (reuse your existing utility)
//     const value = mapMoodToValue(mood);

//     // Save mood entry
//     const moodEntry = new MoodEntry({ mood, value, user: req.user.id });
//     await moodEntry.save({ session });

//     // Save note entry
//     const note = new Note({ content, user: req.user.id });
//     await note.save({ session });

//     // Commit if both succeed
//     await session.commitTransaction();
//     session.endSession();

//     res.json({ msg: "Mood and note saved" });
//   } catch (err) {
//     // Rollback on error
//     await session.abortTransaction();
//     session.endSession();
//     console.error(err); // Log for debugging
//     res.status(500).send("Server error");
//   }
// };

// backend/controllers/noteController.js
const Note = require("../models/Note");
const MoodEntry = require("../models/MoodEntry");
const mongoose = require("mongoose");
const { generatePrompt } = require("../utils/promptGenerator");
const { mapMoodToValue } = require("../utils/moodMapper");
const {
  getStreak,
  getWeekProgress,
  getTodayCount,
  getTotalStreaks,
  getTotalCount,
  getWeeklyMoodCounts,
} = require("../utils/trendCalculator");
// backend/controllers/noteController.js (add this export alongside createNote)

exports.getNotes = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query; // Optional pagination
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: req.user.id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments({ user: req.user.id });

    const notesData = {
      notes,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    };

    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: notesData });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.createNote = async (req, res) => {
  const { content } = req.body;
  try {
    const note = new Note({ content, user: req.user.id });
    await note.save();
    res.status(201).json({
      statusCode: 201,
      status: "success",
      data: note,
      message: "Note saved",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getDailyPrompt = (req, res) => {
  try {
    const prompt = generatePrompt();
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { prompt } });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getTodayCount = async (req, res) => {
  try {
    const count = await getTodayCount(req.user.id);
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { count } });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getTotalCount = async (req, res) => {
  try {
    const count = await getTotalCount(req.user.id);
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { count } });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getStreak = async (req, res) => {
  try {
    const streak = await getStreak(req.user.id);
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { streak } });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
// utils/trendCalculator.js (add this function to the existing module exports)
exports.getTotalStreaks = async (req, res) => {
  try {
    const totalStreaks = await getTotalStreaks(req.user.id); // Fixed: now calls the correct imported function
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { totalStreaks } });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.getWeekProgress = async (req, res) => {
  try {
    const progress = await getWeekProgress(req.user.id);
    res
      .status(200)
      .json({ statusCode: 200, status: "success", data: { progress } }); // e.g., '3/7'
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
// Assuming this is added to backend/controllers/noteController.js or similar
exports.saveMoodAndNote = async (req, res) => {
  const { mood, content } = req.body; // Expect both in the request body
  const session = await mongoose.startSession(); // For transactions (requires MongoDB 4.0+ and replica set)
  session.startTransaction();

  try {
    // Normalize mood to lowercase to match enum and mapper
    const normalizedMood = mood.toLowerCase().trim();

    // Validate mood against enum
    const validMoods = ["ecstatic", "happy", "stressed", "peaceful"];
    if (!validMoods.includes(normalizedMood)) {
      throw new Error(
        `Invalid mood: ${mood}. Must be one of: ${validMoods.join(", ")}`
      );
    }

    // Map mood to value (reuse your existing utility)
    const value = mapMoodToValue(normalizedMood);

    // Save mood entry
    const moodEntry = new MoodEntry({
      mood: normalizedMood,
      value,
      user: req.user.id,
      timestamp: new Date(), // Explicitly set if needed
    });
    await moodEntry.save({ session });

    // Save note entry
    const note = new Note({
      content: content.trim(),
      user: req.user.id,
      date: new Date(), // Explicitly set if needed
    });
    await note.save({ session });

    // Commit if both succeed
    await session.commitTransaction();
    session.endSession();

    const responseData = { moodEntry, note };

    res.status(201).json({
      statusCode: 201,
      status: "success",
      data: responseData,
      message: "Mood and note saved",
    });
  } catch (err) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    console.error("Error in saveMoodAndNote:", err); // Enhanced logging
    res.status(500).json({
      statusCode: 500,
      status: "error",
      message: err.message || "Server error",
    });
  }
};
exports.getMoodsNote = async (req, res) => {
  try {
    const { limit = 10 } = req.query; // Optional limit for both moods and notes

    // Fetch recent moods
    const moods = await MoodEntry.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Fetch recent notes
    const notes = await Note.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    const data = {
      moods,
      notes,
    };

    res.status(200).json({ statusCode: 200, status: "success", data });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
