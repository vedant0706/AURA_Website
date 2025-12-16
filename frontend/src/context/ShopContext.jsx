import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create ShopContext for global state management
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const navigate = useNavigate();
  const currency = "₹ ";
  const delivery_fee = 50;

  const backendUrl =
    import.meta.env.MODE === "production"
      ? ""
      : import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Axios instance for all API calls (withCredentials for cookies)
  const axiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor (can add auth tokens if needed in future)
  axiosInstance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor (can handle global errors like token expiry)
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Check auth status on load or after login/register
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const { data } = await axiosInstance.get("/api/auth/is-auth", {
        withCredentials: true,
      });

      if (data.success) {
        setIsLoggedin(true);
        await getUserData();
      } else {
        setIsLoggedin(false);
        setUserData(null);
        setCurrentUserId(null);
      }
    } catch (error) {
      setIsLoggedin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile data after auth
  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/auth/data", {
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.userData);
        setCurrentUserId(data.userData._id);
        await getUserCart();
      } else {
        toast.error(data.message);
      }
    } catch (error) {}
  };

  // Handle successful registration: check auth & redirect
  const handleRegistrationSuccess = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    await checkAuthStatus();

    toast.success("Registration Successful");
    navigate("/");
  };

  // Handle successful login: check auth & redirect
  const handleLoginSuccess = async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    await checkAuthStatus();

    toast.success("Login successful!");
    navigate("/");
  };

  // Logout user: clear state & redirect
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");

      setIsLoggedin(false);
      setUserData(null);
      setCurrentUserId(null);

      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  // Check if user is admin
  const isAdmin = userData?.role === "admin";

  // Add item to cart (local + backend if logged in)
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    setCartItems(cartData);

    if (isLoggedin) {
      try {
        const { data } = await axiosInstance.post("/api/cart/add", {
          itemId,
          size,
        });
        if (data.success) {
          toast.success("Added to cart");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add to cart");

        // Revert on error
        setCartItems(cartItems);
      }
    } else {
      toast.info("Please login to save your cart");
    }
  };

  // Update cart item quantity (local + backend if logged in)
  const updateCart = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    if (quantity === 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

    if (isLoggedin) {
      try {
        await axiosInstance.post("/api/cart/update", {
          itemId,
          size,
          quantity,
        });
      } catch (error) {
        toast.error("Failed to update cart");
        // Revert on error
        setCartItems(cartItems);
      }
    }
  };

  // Calculate total cart item count
  const getCartCount = () => {
    let total = 0;
    for (const items in cartItems) {
      for (const size in cartItems[items]) {
        try {
          if (cartItems[items][size] > 0) {
            total += cartItems[items][size];
          }
        } catch (error) {}
      }
    }
    return total;
  };

  // Calculate total cart amount (subtotal, without delivery)
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (product) {
        for (const size in cartItems[id]) {
          try {
            if (cartItems[id][size] > 0) {
              totalAmount += product.price * cartItems[id][size];
            }
          } catch (error) {}
        }
      }
    }
    return totalAmount;
  };

  // Fetch all products from backend
  const getProductsData = async () => {
    try {
      const { data } = await axiosInstance.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products");
    }
  };

  // Fetch user's saved cart from backend
  const getUserCart = async () => {
    if (!isLoggedin) return;

    try {
      const { data } = await axiosInstance.post("/api/cart/get");
      if (data.success) {
        setCartItems(data.cartData);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load cart");
    }
  };

  // Initial load: fetch products & check auth
  useEffect(() => {
    getProductsData();
    checkAuthStatus();
  }, []);

  // Context value object — all states & functions
  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    updateCart,
    getCartAmount,
    getCartCount,
    backendUrl,
    getUserCart,
    getProductsData,

    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    currentUserId,
    handleLoginSuccess,
    handleRegistrationSuccess,
    handleLogout,
    checkAuthStatus,
    getUserData,
    isAdmin,
    axiosInstance,
    isLoading,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;