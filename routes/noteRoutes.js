// backend/routes/noteRoutes.js
const express = require("express");
const {
  createNote,
  getNotes,
  getDailyPrompt,
  getTodayCount,
  getTotalCount,
  getStreak,
  getWeekProgress,
  saveMoodAndNote,
  getMoodsNote,
  getTotalStreaks,
  deleteAllNotesAndMoods,
} = require("../controllers/noteController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
router.delete("/notes-and-moods", auth, deleteAllNotesAndMoods);
router.get("/", auth, getNotes);
router.post("/", auth, createNote); // Changed from "/create" to "/" to match frontend POST /api/notes
router.get("/daily-prompt", auth, getDailyPrompt);
router.get("/today-count", auth, getTodayCount);
router.get("/total-count", auth, getTotalCount);
router.get("/total-streaks", auth, getTotalStreaks);
router.get("/streak", auth, getStreak);
router.get("/week-progress", auth, getWeekProgress);
router.get("/moods-note", auth, getMoodsNote); // Changed from "/mood-note" to "/moods-note" to match frontend
router.post("/mood-and-note", auth, saveMoodAndNote);
module.exports = router;
