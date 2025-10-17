// backend/routes/authRoutes.js
const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  changePassword,
  getMe,
  addUser,
  deleteUser,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.get("/me", auth, getMe);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/change-password", auth, changePassword);
router.post("/add-user", auth, addUser);
router.delete("/delete-user", auth, deleteUser);
module.exports = router;
