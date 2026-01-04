import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/nexushire")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
