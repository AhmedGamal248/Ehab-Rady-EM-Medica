const Product = require("../models/product.model");
const cache = require("../config/cache");
const { success, error } = require("../utils/response");
const { paginate, paginateResponse } = require("../utils/pagination");




exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      page = 1,
      limit = 12,
      sort = "-createdAt",
      minPrice,
      maxPrice,
    } = req.query;

    // Cache key
    const cacheKey = `products_${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);
    if (cached) return success(res, cached, "تم جلب المنتجات من الكاش ⚡");

    // Build filter
    let filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const { skip, limit: lim } = paginate(page, limit);
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(lim)
        .lean(),
    ]);

    const result = paginateResponse(products, total, page, lim);

    // Save to cache
    cache.set(cacheKey, result);

    success(res, result);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const cacheKey = `product_${req.params.id}`;
    const cached = cache.get(cacheKey);
    if (cached) return success(res, cached);

    const product = await Product.findById(req.params.id).lean();
    if (!product) return error(res, "Product not found", 404);

    cache.set(cacheKey, product);
    success(res, product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    cache.flushAll();
    success(res, product, "Product created successfully", 201);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!product) return error(res, "Product not found", 404);
    cache.flushAll();
    success(res, product, "Product updated successfully");
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return error(res, "Product not found", 404);
    cache.flushAll();
    success(res, null, "Product deleted successfully");
  } catch (err) {
    next(err);
  }
};
