// backend/routes/moodRoutes.js
const express = require("express");
const {
  saveMood,
  getWeeklyTrends,
  getPieData,
  getPositiveDays,
  getIndividualMoodCounts,
  getMoodDistribution,
  getWeeklyMoodCounts,
} = require("../controllers/moodController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/save", auth, saveMood);
router.get("/trends", auth, getWeeklyTrends);
router.get("/mood-count", auth, getIndividualMoodCounts);
router.get("/mood-weekly", auth, getWeeklyMoodCounts);
router.get("/pie", auth, getPieData);
router.get("/moodnotecount", auth, getMoodDistribution);
router.get("/positive-days", auth, getPositiveDays);

module.exports = router;
