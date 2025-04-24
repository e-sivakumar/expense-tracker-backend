import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    _id: String,
    userId: String,
    type: String,
    category: String,
    amount: Number,
    date: Date,
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: "transactions", versionKey: false }
);

// transactionSchema.index({ userId: 1, date: -1 }); // Index for fetching user's transactions, sorted by date descending
// transactionSchema.index({ userId: 1, type: 1, category: 1, date: -1 }); // Index for filtering and sorting

export const Transaction = mongoose.model("transaction", transactionSchema);
