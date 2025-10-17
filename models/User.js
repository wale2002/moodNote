// // backend/models/User.js
// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// module.exports = mongoose.model("User", UserSchema);

// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Made optional for view-only users
    isViewOnly: { type: Boolean, default: false }, // Optional flag for view-only access
  },
  {
    timestamps: true, // Adds createdAt/updatedAt if needed
  }
);

module.exports = mongoose.model("User", UserSchema);
