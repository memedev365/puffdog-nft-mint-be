import mongoose from "mongoose";

const mintSchema = new mongoose.Schema(
  {
    hash: { type: String, require: true },
    wallet: { type: String, require: true },
    amount: { type: Number, require: true },
    count: { type: Number, require: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
    },
  }
);

export const MintModal = mongoose.model("mint", mintSchema);