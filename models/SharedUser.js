// models/SharedUser.js
const mongoose = require("mongoose");

const sharedUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Prevents adding the same email multiple times. Remove this line to allow multiples (e.g., re-sharing with new tokens).
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // References the sharing owner's User ID
    },
    viewToken: {
      type: String,
      required: true, // The JWT token for view access
    },
    expiresAt: {
      type: Date,
      required: true, // Token expiry date
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  }
);

// Optional: Index for faster queries on ownerId + email
sharedUserSchema.index({ ownerId: 1, email: 1 });

module.exports = mongoose.model("SharedUser", sharedUserSchema);
