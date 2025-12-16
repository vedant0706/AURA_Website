import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import authRouter from "./routes/authRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();

await connectDB();
await connectCloudinary();

app.use(cookieParser());

// Dynamic CORS configuration — supports dev, production & custom URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://aurawebsite-eight.vercel.app",
  "https://aura-website-2z55.vercel.app",
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "token"],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req, res) => res.send("API is Working"));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// 404 handler — for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler — catches all unhandled errors
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;