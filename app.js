// backend/app.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" })); // Adjust for frontend
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const moodRoutes = require("./routes/moodRoutes");
const noteRoutes = require("./routes/noteRoutes");
const profileRoutes = require("./routes/profileRoutes");
const insightRoutes = require("./routes/insightRoutes");

app.use("/auth", authRoutes);
app.use("/moods", moodRoutes);
app.use("/notes", noteRoutes);
app.use("/profile", profileRoutes);
app.use("/insights", insightRoutes);

module.exports = app;
