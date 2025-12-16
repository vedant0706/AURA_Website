import React, { useContext, useState, useEffect } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");

  const {
    isLoggedin,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    axiosInstance,
    currentUserId,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  // Delivery address form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedin) {
      toast.error("Please login to place an order");
      navigate("/login");
    }
  }, [isLoggedin, navigate]);

  // Handle input changes
  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Initialize Razorpay payment
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "AURA E-commerce",
      description: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axiosInstance.post(
            "/api/order/verifyRazorpay",
            response
          );
          if (data.success) {
            setCartItems({});
            toast.success("Payment successful! Order placed.");
            navigate("/orders");
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Payment verification failed"
          );
        }
      },
      theme: { color: "#000000" },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!isLoggedin) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    try {
      // Build order items from cart
      const orderItems = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            const itemInfo = structuredClone(
              products.find((p) => p._id === productId)
            );
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = cartItems[productId][size];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      if (orderItems.length === 0) {
        toast.error("Your cart is empty");
        navigate("/cart");
        return;
      }

      const orderData = {
        userId: currentUserId,
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      // Handle payment method
      switch (method) {
        case "cod": {
          const response = await axiosInstance.post(
            "/api/order/place",
            orderData
          );
          if (response.data.success) {
            setCartItems({});
            toast.success("Order placed successfully!");
            navigate("/orders");
          } else {
            toast.error(response.data.message || "Order failed");
          }
          break;
        }

        case "razorpay": {
          const response = await axiosInstance.post(
            "/api/order/razorpay",
            orderData
          );
          if (response.data.success) {
            initPay(response.data.order);
          } else {
            toast.error(response.data.message || "Payment failed");
          }
          break;
        }

        default:
          break;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Order placement failed"
        );
      }
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col lg:flex-row justify-between gap-8 pt-5 lg:pt-14 min-h-[80vh] border-t"
    >
      {/* Delivery Information Form */}
      <div className="flex flex-col gap-6 w-full lg:max-w-[500px]">
        <div className="text-2xl">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            name="firstName"
            value={formData.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
            className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <input
            required
            name="lastName"
            value={formData.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
            className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>

        <input
          required
          name="email"
          value={formData.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email address"
          className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
        />
        <input
          required
          name="street"
          value={formData.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street address"
          className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            name="city"
            value={formData.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
            className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <input
            required
            name="state"
            value={formData.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State / Province"
            className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            name="zipcode"
            value={formData.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="ZIP code"
            className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          />
          <input
            required
            name="country"
            value={formData.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
            className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>

        <input
          required
          name="phone"
          value={formData.phone}
          onChange={onChangeHandler}
          type="tel"
          placeholder="Phone number"
          className="border border-gray-300 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      {/* Order Summary & Payment */}
      <div className="flex flex-col gap-8 w-full lg:w-auto">
        <div className="min-w-[320px] lg:min-w-[400px]">
          <CartTotal />
        </div>

        {/* Payment Method Selection */}
        <div>
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            {/* Razorpay */}
            <div
              onClick={() => setMethod("razorpay")}
              className={`flex items-center gap-4 border-2 rounded-md p-4 cursor-pointer transition-all ${
                method === "razorpay" ? "border-black" : "border-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  method === "razorpay"
                    ? "bg-black border-black"
                    : "border-gray-400"
                }`}
              />
              <img src={assets.razorpay_logo} className="h-6" alt="Razorpay" />
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => setMethod("cod")}
              className={`flex items-center gap-4 border-2 rounded-md p-4 cursor-pointer transition-all ${
                method === "cod" ? "border-black" : "border-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  method === "cod" ? "bg-black border-black" : "border-gray-400"
                }`}
              />
              <p className="text-sm font-medium text-gray-700">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          {/* Place Order Button */}
          <div className="text-end mt-8">
            <button
              type="submit"
              className="bg-black text-white px-12 py-4 text-sm font-medium rounded-md hover:bg-gray-900 transition-all hover:scale-105"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;