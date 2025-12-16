import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";

const CartTotal = () => {
  const { currency, delivery_fee, getCartAmount } = useContext(ShopContext);

  return (
    <div className="w-full">
      {/* Section Title */}
      <div className="text-2xl">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      {/* Cart Pricing Breakdown */}
      <div className="flex flex-col gap-2 mt-2 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>
            {currency} {getCartAmount()}.00
          </p>
        </div>
        <hr />

        {/* Shipping Fee */}
        <div className="flex justify-between">
          <p>Shipping Fee</p>
          <p>
            {currency} {delivery_fee}.00
          </p>
        </div>
        <hr />

        {/* Final Total */}
        <div className="flex justify-between">
          <b>Total</b>
          <b>
            {currency}{" "}
            {/* Show 0 if cart empty, otherwise subtotal + delivery */}
            {getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}.00
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;