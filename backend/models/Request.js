import { model, Schema } from "mongoose";

const requestSchema = new Schema({
  landId: {
    type: Schema.Types.ObjectId,
    ref: "Land",
    required: true
  },

  buyerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  sellerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model("Request", requestSchema);