import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.jsx";
import { toast } from "react-toastify";
import axios from "axios";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const {
    backendUrl,
    setShowSearch,
    userData,
    setUserData,
    getCartCount,
    isLoggedin,
    setIsLoggedin,
  } = useContext(ShopContext);

  // Send verification OTP and redirect to verification page
  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`
      );

      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Logout user: clear state and redirect to login
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate("/login");
        toast.success("Logged out successfully");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      {/* Logo */}
      <Link to="/">
        <img src={assets.nav1_logo} className="w-32" alt="AURA Logo" />
      </Link>

      {/* Desktop Navigation */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        <NavLink to="/" className="flex flex-col items-center gap-1">
          <p>HOME</p>
        </NavLink>
        <NavLink to="/collection" className="flex flex-col items-center gap-1">
          <p>COLLECTION</p>
        </NavLink>
        <NavLink to="/about" className="flex flex-col items-center gap-1">
          <p>ABOUT</p>
        </NavLink>
        <NavLink to="/contact" className="flex flex-col items-center gap-1">
          <p>CONTACT</p>
        </NavLink>
      </ul>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        {/* Search Icon */}
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className="w-5 cursor-pointer"
          alt="Search"
        />

        {/* Profile Dropdown */}
        <div className="group relative">
          <img
            onClick={() => setProfileDropdown(!profileDropdown)}
            src={assets.profile_icon}
            className="w-5 cursor-pointer"
            alt="Profile"
          />

          {/* Dropdown Menu */}
          <div
            className={`${
              profileDropdown ? "block" : "hidden"
            } group-hover:block absolute right-0 pt-4 z-50`}
          >
            <div className="flex flex-col gap-2 w-40 py-3 px-5 bg-slate-100 text-gray-600 rounded shadow-lg">
              {isLoggedin ? (
                <>
                  {/* Show only if email not verified */}
                  {userData && !userData.isAccountVerified && (
                    <p
                      onClick={() => {
                        sendVerificationOtp();
                        setProfileDropdown(false);
                      }}
                      className="cursor-pointer hover:text-black transition-colors"
                    >
                      Verify Email
                    </p>
                  )}

                  <p
                    onClick={() => {
                      navigate("/orders");
                      setProfileDropdown(false);
                    }}
                    className="cursor-pointer hover:text-black transition-colors"
                  >
                    Orders
                  </p>

                  <p
                    onClick={() => {
                      logout();
                      setProfileDropdown(false);
                    }}
                    className="cursor-pointer hover:text-black transition-colors"
                  >
                    Logout
                  </p>
                </>
              ) : (
                <p
                  onClick={() => {
                    navigate("/login");
                    setProfileDropdown(false);
                  }}
                  className="cursor-pointer hover:text-black transition-colors"
                >
                  Login
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cart with Item Count Badge */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Mobile Menu Toggle */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />
      </div>

      {/* Mobile Sidebar Menu */}
      <div
        className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-50 ${
          visible ? "w-full" : "w-0"
        }`}
      >
        <div className="flex flex-col text-gray-600">
          {/* Back Button */}
          <div
            onClick={() => setVisible(false)}
            className="flex items-center gap-4 p-3 cursor-pointer"
          >
            <img
              src={assets.dropdown_icon}
              className="h-4 rotate-180"
              alt="Back"
            />
            <p>Back</p>
          </div>

          {/* Mobile Nav Links */}
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border-t"
            to="/"
          >
            HOME
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border-t"
            to="/collection"
          >
            COLLECTION
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border-t"
            to="/about"
          >
            ABOUT
          </NavLink>
          <NavLink
            onClick={() => setVisible(false)}
            className="py-2 pl-6 border-t border-b"
            to="/contact"
          >
            CONTACT
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;