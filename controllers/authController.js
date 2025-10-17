const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailSender");
const crypto = require("crypto");

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

    // Generate JWT token (same payload as signup)
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;

        // Return user data without password + token
        const userData = {
          id: user.id,
          email: user.email,
          username: user.username,
        };

        res.status(200).json({
          statusCode: 200,
          status: "success",
          data: { ...userData, token }, // Include token in data
          message: "Login successful",
        });
      }
    );
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
// exports.addUser = async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({
//       statusCode: 400,
//       status: "error",
//       message: "Email is required",
//     });
//   }

//   try {
//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({
//         statusCode: 400,
//         status: "error",
//         message: "User already exists",
//       });
//     }

//     // Generate username from email prefix
//     const username = email.split("@")[0];

//     // Generate random password (8 characters for simplicity; improve in production)
//     const randomPassword = crypto.randomBytes(4).toString("hex");

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(randomPassword, salt);

//     // Create new user
//     user = new User({ email, username, password: hashedPassword });
//     await user.save();

//     // Generate view token (JWT) for accessing notes
//     const viewToken = jwt.sign(
//       { user: { id: user.id } },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" } // Token valid for 7 days; adjust as needed
//     );
//     const viewLink = `https://mood-note-front.vercel.app/notes/view/${viewToken}`;

//     // Send email with credentials and view link
//     const credentialsEmail = `
//       Welcome to Mood Notes!

//       Your account has been created.
//       Username: ${username}
//       Email: ${email}
//       Temporary Password: ${randomPassword}

//       View your notes here: ${viewLink}

//       Please login and change your password.
//     `;
//     await sendEmail(
//       email,
//       "Welcome to Mood Notes - Your Account",
//       credentialsEmail
//     );

//     res.status(201).json({
//       statusCode: 201,
//       status: "success",
//       data: { id: user.id, email: user.email, username: user.username },
//       message: "User added successfully and credentials sent via email",
//     });
//   } catch (err) {
//     console.error("Error adding user:", err);
//     res.status(500).json({
//       statusCode: 500,
//       status: "error",
//       message: "Server error",
//     });
//   }
// };
exports.addUser = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      statusCode: 400,
      status: "error",
      message: "Email is required",
    });
  }

  try {
    // Optional: Check for existing view-only user
    let viewOnlyUser = await User.findOne({ email });
    if (viewOnlyUser && viewOnlyUser.isViewOnly) {
      return res.status(400).json({
        statusCode: 400,
        status: "error",
        message: "Email already shared with",
      });
    }

    // Generate username from email prefix
    const username = email.split("@")[0];

    // Create view-only user for tracking (no password)
    viewOnlyUser = new User({
      email,
      username,
      isViewOnly: true,
    });
    await viewOnlyUser.save();
    console.log("View-only tracking user created:", viewOnlyUser.id);

    // Generate token using OWNER's ID (from auth middleware)
    const ownerId = req.user.id;
    if (!ownerId) {
      return res.status(401).json({
        statusCode: 401,
        status: "error",
        message: "Owner not authenticated",
      });
    }
    console.log("Token generated for owner ID:", ownerId); // Debug: Confirm owner's ID

    const viewToken = jwt.sign(
      { user: { id: ownerId } }, // Embeds owner's ID
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const viewLink = `https://mood-note-front.vercel.app/notes/view/${viewToken}`;

    // Send email to recipient (link shows owner's data)
    const welcomeEmail = `
      Someone has shared their Mood Notes with you!

      View their notes and moods here: ${viewLink}

      This link expires in 7 days.
    `;
    await sendEmail(email, "Shared Mood Notes Access", welcomeEmail);

    res.status(201).json({
      statusCode: 201,
      status: "success",
      data: {
        ownerId, // Debug: Matches the ID that should have data
        sharedEmail: email,
        viewToken, // Use this to test /notes/view/<viewToken>
        viewLink,
      },
      message: "Sharing link sent via email",
    });
  } catch (err) {
    console.error("Error in addUser:", err);
    res.status(500).json({
      statusCode: 500,
      status: "error",
      message: "Server error",
    });
  }
};
// Delete user endpoint - DELETE /auth/delete-user?email=example@email.com
// Or body { email }
// backend/controllers/authController.js
exports.deleteUser = async (req, res) => {
  const { email } = req.body || req.query;
  if (!email) {
    return res.status(400).json({
      statusCode: 400,
      status: "error",
      message: "Email is required",
    });
  }

  try {
    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: "error",
        message: "User not found",
      });
    }

    // Send deletion confirmation email
    const deletionEmail = `
      Dear ${user.username},
      
      Your Mood Notes account has been deleted.
      Email: ${email}
      
      If this was not requested by you, please contact support.
    `;
    await sendEmail(email, "Mood Notes Account Deletion", deletionEmail);

    res.status(200).json({
      statusCode: 200,
      status: "success",
      data: { id: user.id, email: user.email },
      message: "User deleted successfully and confirmation email sent",
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({
      statusCode: 500,
      status: "error",
      message: "Server error",
    });
  }
};
