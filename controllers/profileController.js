// // backend/controllers/profileController.js
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");

// exports.editProfile = async (req, res) => {
//   const { name, email, password } = req.body;
//   try {
//     const user = await User.findById(req.user.id);
//     if (name) user.username = name; // Assuming username is name
//     if (email) user.email = email;
//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);
//     }
//     await user.save();
//     res.json({ msg: "Profile updated" });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// backend/controllers/profileController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.editProfile = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (name) user.username = name; // Assuming username is name
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();

    // Return updated user without password
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    res
      .status(200)
      .json({
        statusCode: 200,
        status: "success",
        data: userData,
        message: "Profile updated",
      });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
