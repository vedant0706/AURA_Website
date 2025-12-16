import React, { useContext, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets.js";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/ShopContext.jsx";
import { MdOutlineMail } from "react-icons/md";

const ResetPassword = () => {
  const { backendUrl } = useContext(ShopContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);

  const inputRefs = useRef([]);

  // Auto-focus next field on input
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Paste full OTP support
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d{0,6}$/.test(paste)) {
      paste.split("").forEach((char, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = char;
        }
      });
      const nextIndex = Math.min(paste.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 1: Send reset OTP to email
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-reset-otp`,
        { email }
      );

      if (data.success) {
        toast.success(data.message || "OTP sent to your email");
        setIsEmailSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  // Step 2: Submit OTP
  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value.trim());
    const enteredOtp = otpArray.join("");

    if (enteredOtp.length !== 6 || !/^\d{6}$/.test(enteredOtp)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtp(enteredOtp);
    setIsOtpSubmitted(true);
  };

  // Step 3: Submit new password
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/reset-password`,
        { email, otp, newPassword }
      );

      if (data.success) {
        toast.success(data.message || "Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* Step 1: Enter Email */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-white p-8 rounded-lg shadow-2xl shadow-black w-96 text-sm"
        >
          <h1 className="text-black text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-gray-700">
            Enter your registered email address.
          </p>

          <div className="mb-4 flex items-center gap-3 w-full px-4 py-3 rounded-full bg-black">
            <MdOutlineMail className="text-white text-xl" />
            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent outline-none text-white flex-1 text-md placeholder-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="text-lg w-full py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-all hover:scale-105"
          >
            Send OTP
          </button>
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {isEmailSent && !isOtpSubmitted && (
        <form
          onSubmit={onSubmitOTP}
          className="bg-white p-8 rounded-lg shadow-2xl shadow-black/20 w-96 text-sm"
        >
          <h1 className="text-black text-2xl font-semibold text-center mb-4">
            Enter OTP
          </h1>
          <p className="text-center mb-6 text-gray-700">
            Check your email for the 6-digit code
          </p>

          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  type="text"
                  maxLength="1"
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                  className="w-12 h-12 bg-black text-white text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
          </div>

          <button
            type="submit"
            className="text-lg w-full py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-all hover:scale-105"
          >
            Verify OTP
          </button>
        </form>
      )}

      {/* Step 3: Set New Password */}
      {isOtpSubmitted && isEmailSent && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-white p-8 rounded-lg shadow-2xl shadow-black/20 w-96 text-sm"
        >
          <h1 className="text-black text-2xl font-semibold text-center mb-4">
            Set New Password
          </h1>
          <p className="text-center mb-6 text-gray-700">
            Enter your new password below
          </p>

          <div className="mb-4 flex items-center gap-3 w-full px-4 py-3 rounded-full bg-black">
            <img src={assets.lock_icon} alt="Lock" className="w-5 h-5" />
            <input
              type="password"
              placeholder="New Password"
              className="bg-transparent outline-none text-white flex-1 placeholder-gray-300"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="text-lg w-full py-3 bg-black text-white rounded-full hover:bg-gray-900 transition-all hover:scale-105"
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;