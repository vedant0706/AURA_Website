import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateCart,
    userData,
    isLoggedin,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);

  // Transform cartItems object into array for easier rendering
  useEffect(() => {
    if (!products || products.length === 0) {
      setCartData([]);
      return;
    }

    const tempData = [];
    for (const productId in cartItems) {
      for (const size in cartItems[productId]) {
        if (cartItems[productId][size] > 0) {
          tempData.push({
            _id: productId,
            size,
            quantity: cartItems[productId][size],
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems, products]);

  // Handle quantity input change (only update on valid number >= 1)
  const handleQuantityChange = (e, productId, size) => {
    const value = e.target.value;

    // Allow empty input temporarily (user typing)
    if (value === "") return;

    const newQuantity = Number(value);

    // Prevent 0 or negative values
    if (isNaN(newQuantity) || newQuantity < 1) return;

    updateCart(productId, size, newQuantity);
  };

  // Proceed to checkout with authentication & verification checks
  const handlePlaceOrder = () => {
    if (!isLoggedin) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    if (userData && !userData.isAccountVerified) {
      toast.error("Please verify your email before placing an order");
      navigate("/email-verify");
      return;
    }

    navigate("/place-order");
  };

  return (
    <div className="border-t pt-14 min-h-screen">
      {/* Page Title */}
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {/* Cart Items List */}
      <div>
        {cartData.length === 0 ? (
          <p className="text-center text-gray-500 py-10 text-lg">
            Your cart is empty
          </p>
        ) : (
          cartData.map((item) => {
            const productData = products.find((p) => p._id === item._id);

            if (!productData) return null;

            return (
              <div
                key={`${item._id}-${item.size}`}
                className="py-6 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4 last:border-b-0"
              >
                {/* Product Info */}
                <div className="flex items-start gap-6">
                  <img
                    className="w-16 sm:w-20 rounded-md"
                    src={productData.image[0]}
                    alt={productData.name}
                  />
                  <div>
                    <p className="text-xs sm:text-lg font-medium leading-tight">
                      {productData.name}
                    </p>
                    <div className="flex items-center gap-5 mt-2 text-sm">
                      <p className="font-semibold">
                        {currency}
                        {productData.price}
                      </p>
                      <p className="px-3 py-1 border bg-slate-50 rounded text-xs sm:text-sm">
                        Size: {item.size}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity Input */}
                <input
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                  onChange={(e) => handleQuantityChange(e, item._id, item.size)}
                  className="border rounded px-2 py-1 w-16 sm:w-20 text-center focus:outline-none focus:ring-2 focus:ring-black/20"
                />

                {/* Remove Item */}
                <img
                  onClick={() => updateCart(item._id, item.size, 0)}
                  src={assets.bin_icon}
                  className="w-5 sm:w-6 cursor-pointer hover:opacity-70 transition-opacity"
                  alt="Remove item"
                />
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout */}
      {cartData.length > 0 && (
        <div className="flex justify-end my-20">
          <div className="w-full sm:w-[450px]">
            <CartTotal />
            <div className="w-full text-end mt-8">
              <button
                onClick={handlePlaceOrder}
                className="bg-black text-white text-sm font-medium px-10 py-4 hover:bg-gray-900 transition-all hover:scale-105"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;