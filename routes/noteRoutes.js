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

module.exports = router;
