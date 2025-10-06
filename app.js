// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "https://fifthlab-collaboration.onrender.com",
  "http://localhost:3000",
  "http://localhost:8080",
  "http://localhost:2212",
  "http://localhost:2213",
  "https://mood-note-front.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new AppError(`CORS policy: Origin ${origin} not allowed`, 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
); // Adjust for frontend
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const noteRoutes = require("./routes/noteRoutes");
const profileRoutes = require("./routes/profileRoutes");
const insightRoutes = require("./routes/insightRoutes");
const MoodEntry = require("./models/MoodEntry"); // Ensure this import exists
const protect = require("./middleware/authMiddleware");
// Add this route after other mood routes
app.get("/moods", protect, async (req, res) => {
  try {
    const moods = await MoodEntry.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(moods);
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.use("/auth", authRoutes);
app.use("/moods", moodRoutes);
app.use("/notes", noteRoutes);
app.use("/profile", profileRoutes);
app.use("/insights", insightRoutes);

module.exports = app;
