// backend/models/Note.js
const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Note", NoteSchema);
