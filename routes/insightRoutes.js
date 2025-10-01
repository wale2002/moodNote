// backend/routes/insightRoutes.js
const express = require("express");
const {
  getPatterns,
  getRecentInsights,
} = require("../controllers/insightController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/patterns", auth, getPatterns);
router.get("/recent", auth, getRecentInsights);

module.exports = router;
