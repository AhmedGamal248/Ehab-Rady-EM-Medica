const Order = require("../models/order.model");
const Product = require("../models/product.model");
const cache = require("../config/cache");
const { success, error } = require("../utils/response");

const STOCK_ERROR_MESSAGE = "The requested quantity exceeds available stock.";
const CANCELLED_STATUSES = new Set(["cancelled"]);
const ACTIVE_STATUSES = new Set(["pending", "confirmed", "delivered"]);

function calculateShippingCost(governorate) {
  return ["Cairo", "Giza"].includes(governorate) ? 60 : 100;
}

function normalizeColor(color) {
  if (!color?.name) return undefined;
  return {
    name: color.name.trim(),
    hex: color.hex || "",
  };
}

function resolveItemImage(product, color) {
  if (color?.name && Array.isArray(product.colors)) {
    const variant = product.colors.find(
      (entry) => entry.name?.trim().toLowerCase() === color.name.trim().toLowerCase()
    );
    if (variant?.images?.[0]) return variant.images[0];
  }
  return product.image || product.images?.[0] || "";
}

function getProductIdFromItem(item) {
  return item.product?._id?.toString() || item.product.toString();
}

function aggregateQuantitiesByProduct(items) {
  const totals = new Map();
  items.forEach((item) => {
    const productId = getProductIdFromItem(item);
    totals.set(productId, (totals.get(productId) || 0) + item.quantity);
  });
  return totals;
}

async function decrementStock(quantityByProductId) {
  const decremented = [];

  for (const [productId, quantity] of quantityByProductId.entries()) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    ).select("_id stock");

    if (!updatedProduct) {
      await Promise.all(
        decremented.map((entry) =>
          Product.findByIdAndUpdate(entry.product, {
            $inc: { stock: entry.quantity },
          })
        )
      );
      return { ok: false, decremented: [] };
    }

    decremented.push({ product: productId, quantity });
  }

  return { ok: true, decremented };
}

async function restoreStock(items) {
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    )
  );
}

async function getInventorySnapshot(productIds) {
  const products = await Product.find({ _id: { $in: productIds } })
    .select("_id stock")
    .lean();
  return products.map((product) => ({
    productId: product._id.toString(),
    stock: product.stock,
  }));
}

exports.createOrder = async (req, res, next) => {
  try {
    const requestItems = req.body.items.map((item) => ({
      product: item.product.toString(),
      quantity: item.quantity,
      color: normalizeColor(item.color),
    }));

    const quantityByProductId = aggregateQuantitiesByProduct(requestItems);
    const productIds = Array.from(quantityByProductId.keys());

    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price stock image images category colors")
      .lean();

    if (products.length !== productIds.length) {
      return error(res, "One or more products were not found", 404);
    }

    const productsById = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    const unavailableItems = [];
    for (const [productId, requestedQuantity] of quantityByProductId.entries()) {
      const product = productsById.get(productId);
      if (product.stock < requestedQuantity) {
        unavailableItems.push({
          productId,
          name: product.name,
          availableStock: product.stock,
          requestedQuantity,
        });
      }
    }

    if (unavailableItems.length > 0) {
      return error(res, STOCK_ERROR_MESSAGE, 400, unavailableItems);
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of requestItems) {
      const product = productsById.get(item.product);
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        name: product.name,
        price: product.price,
        image: resolveItemImage(product, item.color),
        color: item.color,
      });
    }

    const stockResult = await decrementStock(quantityByProductId);
    if (!stockResult.ok) {
      return error(res, STOCK_ERROR_MESSAGE, 400);
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
      await restoreStock(stockResult.decremented);
      throw createErr;
    }

    cache.flushAll();

    const createdOrder = await Order.findById(order._id)
      .populate("items.product", "name price image category stock")
      .lean();

    const inventoryUpdates = await getInventorySnapshot(productIds);

    success(
      res,
      { order: createdOrder, inventoryUpdates },
      "Order created successfully",
      201
    );
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
    const existingOrder = await Order.findById(req.params.id).lean();
    if (!existingOrder) {
      return error(res, "Order not found", 404);
    }

    const previousStatus = existingOrder.status;
    const nextStatus = req.body.status;

    const wasCancelled = CANCELLED_STATUSES.has(previousStatus);
    const willBeCancelled = CANCELLED_STATUSES.has(nextStatus);

    if (!wasCancelled && willBeCancelled) {
      await restoreStock(existingOrder.items);
      cache.flushAll();
    } else if (wasCancelled && ACTIVE_STATUSES.has(nextStatus)) {
      const quantityByProductId = aggregateQuantitiesByProduct(existingOrder.items);
      const stockResult = await decrementStock(quantityByProductId);
      if (!stockResult.ok) {
        return error(res, STOCK_ERROR_MESSAGE, 400);
      }
      cache.flushAll();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: nextStatus },
      { new: true, runValidators: true }
    );

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("items.product", "name price image category stock")
      .lean();

    success(res, updatedOrder, "Order status updated successfully");
  } catch (err) {
    next(err);
  }
};
