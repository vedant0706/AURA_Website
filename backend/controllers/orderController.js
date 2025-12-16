import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const currency = "inr";
const deliveryCharge = 50;

// Razorpay instance — created once and reused (best practice)
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Place order with Cash on Delivery (COD)
 * - Creates order, clears user cart, returns order ID
 */
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Validate cart and address
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    // Create new order (COD)
    const orderData = {
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Clear user's cart after successful order
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed", orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Place order with Razorpay (Online Payment)
 * - Creates order in DB first, then generates Razorpay order
 */
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Save order in DB first (payment pending)
    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Create Razorpay order (amount in paise)
    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    // Razorpay callback — must use traditional function
    razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        return res.json({ success: false, message: error.message || "Razorpay error" });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Verify Razorpay payment after success
 * - Checks payment status and marks order as paid + clears cart
 */
const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id } = req.body;

    // Fetch order details from Razorpay
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      // Mark payment as successful and clear cart
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get all orders (Admin only)
 */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get orders for logged-in user
 * - Flexible userId source for different auth methods
 */
const userOrders = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const orders = await orderModel.find({ userId });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update order status (Admin only)
 * - Used for processing, shipping, delivered, etc.
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  verifyRazorpay,
  placeOrder,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};