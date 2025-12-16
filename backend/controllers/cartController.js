import userModel from "../models/userModel.js";

/**
 * Add item to user's cart
 * - Supports multiple sizes per product
 * - Increments quantity if same item+size already exists
 */
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, size } = req.body;

    // Fetch user and get current cart (cartData is an object)
    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {}; // Ensure cart exists

    // Initialize item entry if not present
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    // Initialize size entry or increment quantity
    if (cartData[itemId][size]) {
      cartData[itemId][size] += 1;
    } else {
      cartData[itemId][size] = 1;
    }

    // Save updated cart back to user document
    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added to Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Update quantity of a specific item+size in cart
 * - quantity = 0 will effectively remove it (frontend should handle deletion)
 */
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    // Update specific size quantity
    if (cartData[itemId] && cartData[itemId][size] !== undefined) {
      cartData[itemId][size] = quantity;

      // Optional: Clean up empty sizes/items (keeps cart clean)
      if (quantity <= 0) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/**
 * Get full cart data for a user
 * - Returns structured cart: { itemId: { size: quantity } }
 */
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId);
    const cartData = userData.cartData || {}; // Return empty object if no cart

    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addToCart, updateCart, getUserCart };