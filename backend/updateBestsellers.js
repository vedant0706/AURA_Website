import mongoose from "mongoose";
import productModel from "./models/productModel.js";
import dotenv from "dotenv";

dotenv.config();

const updateBestsellers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Fetch all products
    const products = await productModel.find({});
    console.log(`Found ${products.length} products to check`);

    let updatedCount = 0;

    // Normalize bestseller field name
    for (let product of products) {
      let needsSave = false;

      // Handle old camelCase field
      if (product.BestSeller !== undefined) {
        product.bestseller = product.BestSeller;
        product.BestSeller = undefined; // Remove old field
        needsSave = true;
      }
      // Handle inconsistent lowercase
      else if (product.bestSeller !== undefined) {
        product.bestseller = product.bestSeller;
        product.bestSeller = undefined; // Remove old field
        needsSave = true;
      }

      if (needsSave) {
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete: ${updatedCount} products updated`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
};

// Run the migration
updateBestsellers();