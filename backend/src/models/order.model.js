const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, required: true, min: 1 },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    color: {
      name: { type: String, trim: true, maxlength: 50 },
      hex: { type: String, trim: true, maxlength: 9 },
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, "Order items are required"],
    },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 255, default: "" },
    governorate: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    mobileNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ mobileNumber: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
