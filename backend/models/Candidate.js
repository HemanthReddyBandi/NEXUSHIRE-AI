import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "candidate"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Candidate", candidateSchema);
