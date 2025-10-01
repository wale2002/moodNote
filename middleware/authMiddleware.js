// backend/middleware/authMiddleware.js (Updated)
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("authMiddleware: No token provided");
    return res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "No token provided",
      data: { user: null },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Fixed: Extract the nested 'user' object
    next();
  } catch (error) {
    console.log("authMiddleware: Invalid token", { error: error.message });
    return res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Invalid token",
      data: { user: null },
    });
  }
};

module.exports = auth;
