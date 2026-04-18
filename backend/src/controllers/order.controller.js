const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { success, error } = require("../utils/response");

exports.createOrder = async (req, res, next) => {
  try {
    const quantityByProductId = new Map();

    req.body.items.forEach((item) => {
      const key = item.product.toString();
      const currentQuantity = quantityByProductId.get(key) || 0;
      quantityByProductId.set(key, currentQuantity + item.quantity);
    });

    const productIds = Array.from(quantityByProductId.keys());

    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price stock image category")
      .lean();

    if (products.length !== productIds.length) {
      return error(res, "One or more products were not found", 404);
    }

    const unavailableItems = [];
    const orderItems = [];
    let total = 0;

    products.forEach((product) => {
      const productId = product._id.toString();
      const quantity = quantityByProductId.get(productId);

      if (product.stock < quantity) {
        unavailableItems.push({
          productId,
          name: product.name,
          availableStock: product.stock,
          requestedQuantity: quantity,
        });
        return;
      }

      total += product.price * quantity;
      orderItems.push({
        product: product._id,
        quantity,
        name: product.name,
        price: product.price,
      });
    });

    if (unavailableItems.length > 0) {
      return error(
        res,
        "Some items are no longer available in the requested quantity",
        400,
        unavailableItems
      );
    }

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      address: req.body.address,
      phone: req.body.phone,
      total,
    });

    const createdOrder = await Order.findById(order._id)
      .populate("items.product", "name price image category")
      .lean();

    success(res, createdOrder, "Order created successfully", 201);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price image category")
      .lean();

    success(res, orders);
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "name price image category")
      .lean();

    success(res, orders);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return error(res, "Order not found", 404);
    }

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name price image category")
      .lean();

    success(res, updatedOrder, "Order status updated successfully");
  } catch (err) {
    next(err);
  }
};
