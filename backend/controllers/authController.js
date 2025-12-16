import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodeMailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  LOGIN_SUCCESS_TEMPLATE,
  LOGOUT_SUCCESS_TEMPLATE,
  EMAIL_VERIFIED_SUCCESS_TEMPLATE,
} from "../config/emailTemplates.js";

// ================= IST DATE & TIME HELPER =================
// Always returns the correct current Indian time (IST)
const getCurrentIST = () => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const parts = formatter.formatToParts(new Date());

  const time = `${parts.find(p => p.type === "hour").value}:${parts.find(p => p.type === "minute").value} ${parts.find(p => p.type === "dayPeriod").value}`;
  const date = `${parts.find(p => p.type === "day").value} ${parts.find(p => p.type === "month").value} ${parts.find(p => p.type === "year").value}`;

  return { time, date };
};
// =========================================================

// Get current logged-in user data (excludes password)
export const getUserData = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Register new user + set JWT cookie + send welcome email
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    const mailOptions = {
      from: `"AURA E-Commerce" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Welcome to AURA E-commerce Platform",
      text: `Welcome to AURA E-commerce website, Your current account has been created with email id: ${email}`,
    };

    transporter.sendMail(mailOptions).catch(() => {});

    return res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// User login + set cookie + send login alert email (IST FIXED)
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Generate IST time right before sending email
    const { time, date } = getCurrentIST();

    const loginMailOptions = {
      from: `"AURA E-Commerce" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Login Notification - AURA E-commerce",
      html: LOGIN_SUCCESS_TEMPLATE
        .replace("{{email}}", "AURA E-Commerce")
        .replace("{{time}}", time)
        .replace("{{date}}", date),
    };

    transporter.sendMail(loginMailOptions).catch(() => {});

    return res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Logout + clear cookie + send logout alert email (IST FIXED)
export const logout = async (req, res) => {
  try {
    let userEmail = null;
    const token = req.cookies?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("email");
        userEmail = user?.email;
      } catch {}
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    if (userEmail) {
      const { time, date } = getCurrentIST();

      const logoutMailOptions = {
        from: `"AURA E-Commerce" <${process.env.SENDER_EMAIL}>`,
        to: userEmail,
        subject: "Logout Notification - AURA E-commerce",
        html: LOGOUT_SUCCESS_TEMPLATE
          .replace("{{email}}", "AURA E-Commerce")
          .replace("{{time}}", time)
          .replace("{{date}}", date),
      };

      transporter.sendMail(logoutMailOptions).catch(() => {});
    }

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Send OTP for email verification (24hr expiry)
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "Not authenticated" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already Verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: `"AURA E-Commerce" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };

    await transporter.sendMail(mailOption);
    res.json({ success: true, message: "Verification OTP sent on Email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Verify email using OTP
export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const userId = req.userId;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp !== otp || user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Invalid or Expired OTP" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    const verificationMailOptions = {
      from: `"AURA E-Commerce" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Email Verified Successfully - AURA E-commerce",
      html: EMAIL_VERIFIED_SUCCESS_TEMPLATE.replace("{{email}}", user.email),
    };

    transporter.sendMail(verificationMailOptions).catch(() => {});

    return res.json({ success: true, message: "Email Verified Successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Check if user is authenticated via JWT cookie
export const isAuthenticated = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.json({ success: false, message: "Invalid token" });
    }

    await userModel.findById(decoded.userId).select("-password");

    return res.json({ success: true, message: "Authenticated", userId: decoded.userId });
  } catch (error) {
    return res.json({ success: false, message: "Invalid or expired token" });
  }
};

// Send password reset OTP (15min expiry)
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email is required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: `"AURA E-Commerce" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email),
    };

    await transporter.sendMail(mailOption);
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Reset password using valid OTP
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Email, OTP and new password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.resetOtp !== otp || user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "Invalid or Expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Hardcoded admin login using env credentials
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
