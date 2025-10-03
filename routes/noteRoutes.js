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
} = require("../controllers/noteController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/", auth, getNotes);
router.post("/create", auth, createNote);
router.get("/daily-prompt", auth, getDailyPrompt);
router.get("/today-count", auth, getTodayCount);
router.get("/total-count", auth, getTotalCount);
router.get("/streak", auth, getStreak);
router.get("/week-progress", auth, getWeekProgress);
router.get("/mood-note", auth, getMoodsNote);
router.post("/mood-and-note", auth, saveMoodAndNote);
module.exports = router;
