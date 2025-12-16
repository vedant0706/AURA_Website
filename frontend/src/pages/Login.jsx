import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext.jsx";

const Login = () => {
  const navigate = useNavigate();

  const { axiosInstance, handleLoginSuccess, handleRegistrationSuccess } =
    useContext(ShopContext);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const config = { withCredentials: true };

      if (state === "Sign Up") {
        // Register new user
        const { data } = await axiosInstance.post(
          "/api/auth/register",
          { name, email, password },
          config
        );

        if (data.success) {
          await handleRegistrationSuccess();
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        // Login existing user
        const { data } = await axiosInstance.post(
          "/api/auth/login",
          { email, password },
          config
        );

        if (data.success) {
          await handleLoginSuccess();
        } else {
          toast.error(data.message || "Invalid credentials");
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 bg-gray-50">
      {/* Auth Card */}
      <div className="bg-white p-10 rounded-xl shadow-2xl shadow-black w-full max-w-md text-sm">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {state === "Sign Up"
            ? "Join AURA and start shopping"
            : "Login to continue shopping"}
        </p>

        {/* Form */}
        <form onSubmit={onSubmitHandler} className="space-y-5">
          {/* Name Field - Only in Sign Up */}
          {state === "Sign Up" && (
            <div className="flex items-center gap-4 w-full px-5 py-3.5 rounded-full bg-black text-white">
              <img src={assets.person_icon} alt="Name" className="w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-transparent outline-none flex-1 placeholder-gray-400"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="flex items-center gap-4 w-full px-5 py-3.5 rounded-full bg-black text-white">
            <img src={assets.mail_icon} alt="Email" className="w-5 h-5" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent outline-none flex-1 placeholder-gray-400"
            />
          </div>

          {/* Password Field */}
          <div className="flex items-center gap-4 w-full px-5 py-3.5 rounded-full bg-black text-white">
            <img src={assets.lock_icon} alt="Password" className="w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="bg-transparent outline-none flex-1 placeholder-gray-400"
            />
          </div>

          {/* Forgot Password Link */}
          {state === "Login" && (
            <p className="text-right -mt-2">
              <span
                onClick={() => navigate("/reset-password")}
                className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer font-medium hover:underline"
              >
                Forgot Password?
              </span>
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-black text-white text-lg font-semibold rounded-full hover:bg-gray-900 transition-all hover:scale-105"
          >
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Toggle between Login / Sign Up */}
        <div className="text-center mt-6 text-gray-700">
          {state === "Sign Up" ? (
            <p className="text-sm">
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm">
              New to AURA?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-blue-600 font-medium cursor-pointer hover:underline"
              >
                Create an account
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;