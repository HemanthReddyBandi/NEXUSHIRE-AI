import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hrIdFile: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
