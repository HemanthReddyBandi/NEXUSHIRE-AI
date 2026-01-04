import mongoose from "mongoose";

const hrSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  hrIdDocument: {
    type: String, // file path
    required: true
  },
  role: {
    type: String,
    default: "hr"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("HR", hrSchema);
