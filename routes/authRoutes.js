// backend/routes/authRoutes.js
const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  changePassword,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/change-password", auth, changePassword);

module.exports = router;
