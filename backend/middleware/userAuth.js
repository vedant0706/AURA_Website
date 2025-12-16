import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check cookie first (most secure - httpOnly)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2. Check Authorization header (Bearer or raw token)
    if (!token) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader) {
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.split(" ")[1];
        } else {
          token = authHeader;
        }
      }
    }

    // 3. Fallback: custom 'token' header
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    // Reject if no valid token found
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Extract userId (supports both userId and id)
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format - missing user ID",
      });
    }

    // Validate user exists in DB
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user data to request for downstream use
    req.userId = user._id;
    req.userEmail = user.email;
    req.userName = user.name;
    req.user = user;

    // Ensure req.body exists and inject userId (useful for APIs)
    req.body = req.body || {};
    req.body.userId = user._id;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

export default userAuth;