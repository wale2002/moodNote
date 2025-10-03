// // backend/controllers/authController.js
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const { sendEmail } = require("../utils/emailSender");

// exports.signup = async (req, res) => {
//   const { email, username, password } = req.body;
//   try {
//     let user = await User.findOne({ $or: [{ email }, { username }] });
//     if (user) return res.status(400).json({ msg: "User already exists" });

//     user = new User({ email, username, password });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     await user.save();

//     const payload = { user: { id: user.id } };
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.login = async (req, res) => {
//   const { identifier, password } = req.body;
//   try {
//     let user = await User.findOne({
//       $or: [{ email: identifier }, { username: identifier }],
//     });
//     if (!user) return res.status(400).json({ msg: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

//     const payload = { user: { id: user.id } };
//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       }
//     );
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     const resetToken = jwt.sign(
//       { user: { id: user.id } },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );
//     const resetLink = `http://yourfrontend.com/reset/${resetToken}`; // Adjust URL as needed
//     await sendEmail(
//       email,
//       "Password Reset",
//       `Click here to reset: ${resetLink}`
//     );

//     res.json({ msg: "Reset email sent" });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// exports.changePassword = async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   try {
//     const user = await User.findById(req.user.id);
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) return res.status(400).json({ msg: "Invalid old password" });

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     await user.save();

//     res.json({ msg: "Password changed" });
//   } catch (err) {
//     res.status(500).send("Server error");
//   }
// };

// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailSender");

exports.signup = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user)
      return res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "User already exists",
      });

    user = new User({ email, username, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          statusCode: 201,
          status: "success",
          data: { token },
          message: "User created successfully",
        });
      }
    );
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  try {
    let user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user)
      return res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Invalid credentials",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Invalid credentials",
      });

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: userData,
      message: "Login successful",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ statusCode: 400, status: "error", message: "User not found" });

    const resetToken = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const resetLink = `http://yourfrontend.com/reset/${resetToken}`; // Adjust URL as needed
    await sendEmail(
      email,
      "Password Reset",
      `Click here to reset: ${resetLink}`
    );

    res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Reset email sent",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Invalid old password",
      });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "Password changed",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
// backend/controllers/authController.js (add this export alongside existing ones)

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res
        .status(404)
        .json({ statusCode: 404, status: "error", message: "User not found" });
    }

    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        // Add other fields if needed (e.g., createdAt)
      },
      message: "User details fetched successfully",
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, status: "error", message: "Server error" });
  }
};
