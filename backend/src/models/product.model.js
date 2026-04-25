const mongoose = require("mongoose");

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    hex: { type: String, required: true, trim: true, maxlength: 9 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true, default: "" },
    images: [{ type: String, trim: true }],
    category: { type: String, required: true, trim: true, maxlength: 120 },
    stock: { type: Number, default: 0, min: 0 },
    colors: { type: [colorSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ stock: 1 });

module.exports = mongoose.model("Product", productSchema);
