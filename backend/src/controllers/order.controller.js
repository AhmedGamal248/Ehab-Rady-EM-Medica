const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { success, error } = require("../utils/response");

const STOCK_ERROR_MESSAGE = "The requested quantity exceeds available stock.";

function calculateShippingCost(governorate) {
  return ["Cairo", "Giza"].includes(governorate) ? 60 : 100;
}

exports.createOrder = async (req, res, next) => {
  try {
    const quantityByProductId = new Map();
    const colorByProductId = new Map();

    req.body.items.forEach((item) => {
      const key = item.product.toString();
      const currentQuantity = quantityByProductId.get(key) || 0;
      quantityByProductId.set(key, currentQuantity + item.quantity);
      if (item.color && !colorByProductId.has(key)) {
        colorByProductId.set(key, item.color);
      }
    });

    const productIds = Array.from(quantityByProductId.keys());
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price stock image images category")
      .lean();

    if (products.length !== productIds.length) {
      return error(res, "One or more products were not found", 404);
    }

    const unavailableItems = [];
    const orderItems = [];
    let subtotal = 0;

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

      subtotal += product.price * quantity;
      orderItems.push({
        product: product._id,
        quantity,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || "",
        color: colorByProductId.get(productId),
      });
    });

    if (unavailableItems.length > 0) {
      return error(
        res,
        STOCK_ERROR_MESSAGE,
        400,
        unavailableItems
      );
    }

    const decrementedItems = [];
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      ).select("_id");

      if (!updatedProduct) {
        await Promise.all(
          decrementedItems.map((decrementedItem) =>
            Product.findByIdAndUpdate(decrementedItem.product, {
              $inc: { stock: decrementedItem.quantity },
            })
          )
        );

        return error(res, STOCK_ERROR_MESSAGE, 400);
      }

      decrementedItems.push(item);
    }

    const shippingCost = calculateShippingCost(req.body.governorate);
    const total = subtotal + shippingCost;
    const address = `${req.body.city}, ${req.body.governorate}`;

    let order;
    try {
      order = await Order.create({
        user: req.user?.id || null,
        items: orderItems,
        fullName: req.body.fullName,
        email: req.body.email || "",
        governorate: req.body.governorate,
        city: req.body.city,
        mobileNumber: req.body.mobileNumber,
        address,
        phone: req.body.mobileNumber,
        subtotal,
        shippingCost,
        total,
      });
    } catch (createErr) {
      await Promise.all(
        decrementedItems.map((decrementedItem) =>
          Product.findByIdAndUpdate(decrementedItem.product, {
            $inc: { stock: decrementedItem.quantity },
          })
        )
      );
      throw createErr;
    }

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

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name price image category colors")
      .lean();

    if (!order) {
      return error(res, "Order not found", 404);
    }

    success(res, order);
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
