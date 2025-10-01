// backend/routes/profileRoutes.js
const express = require("express");
const { editProfile } = require("../controllers/profileController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.put("/edit", auth, editProfile);

module.exports = router;
