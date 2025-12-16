import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../../context/ShopContext.jsx";

const EmailVerify = () => {
  const { axiosInstance, isLoggedin, userData, getUserData } =
    useContext(ShopContext);

  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // Move to next input when a digit is entered
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Move to previous input on Backspace when field is empty
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Support pasting the full 6-digit OTP
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d{0,6}$/.test(paste)) {
      paste.split("").forEach((char, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = char;
        }
      });
      // Focus the last filled or next empty field
      const nextEmpty = paste.length < 6 ? paste.length : 5;
      inputRefs.current[nextEmpty]?.focus();
    }
  };

  // Submit OTP for verification
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const otpArray = inputRefs.current.map((input) => input.value.trim());
      const otp = otpArray.join("");

      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        toast.error("Please enter a valid 6-digit OTP");
        return;
      }

      // Send OTP using axiosInstance to ensure cookies are sent (critical for Vercel)
      const { data } = await axiosInstance.post(
        "/api/auth/verify-account",
        { otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Email verified successfully!");
        await getUserData(); 
        navigate("/");
      } else {
        toast.error(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Verification failed. Please try again."
      );
    }
  };

  // Redirect to home if user is already verified
  useEffect(() => {
    if (isLoggedin && userData?.isAccountVerified) {
      navigate("/");
    }
  }, [isLoggedin, userData, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      {/* OTP Verification Form */}
      <form
        onSubmit={onSubmitHandler}
        className="bg-white p-8 rounded-lg shadow-2xl shadow-black w-96 text-sm"
      >
        {/* Title */}
        <h1 className="text-black text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>

        {/* Instructions */}
        <p className="text-center mb-6 text-gray-700">
          Enter the 6-digit code sent to your email.
        </p>

        {/* OTP Input Fields */}
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
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="text-lg w-full py-3 bg-black text-white rounded-full cursor-pointer hover:bg-gray-900 transition-all hover:scale-105"
        >
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;