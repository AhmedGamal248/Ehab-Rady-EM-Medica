const Joi = require("joi");

const objectId = Joi.string().trim().hex().length(24);
const imageField = Joi.string().trim().max(2048).allow("");

const paginationQuerySchema = Joi.object({
  search: Joi.string().trim().max(120),
  category: Joi.string().trim().max(120),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(48).default(12),
  sort: Joi.string()
    .trim()
    .valid("createdAt", "-createdAt", "price", "-price", "name", "-name")
    .default("-createdAt"),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
})
  .custom((value, helpers) => {
    if (
      value.minPrice !== undefined &&
      value.maxPrice !== undefined &&
      value.minPrice > value.maxPrice
    ) {
      return helpers.error("any.invalid");
    }

    return value;
  }, "price range validation")
  .messages({
    "any.invalid": "minPrice cannot be greater than maxPrice",
  });

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().lowercase().max(255).required(),
  password: Joi.string().min(8).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().max(255).required(),
  password: Joi.string().min(8).max(128).required(),
});

const productCreateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  price: Joi.number().min(0).max(1000000).required(),
  image: imageField,
  images: Joi.array().items(imageField).max(5).default([]),
  category: Joi.string().trim().min(2).max(120).required(),
  stock: Joi.number().integer().min(0).max(100000).default(0),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().min(10).max(2000),
  price: Joi.number().min(0).max(1000000),
  image: imageField,
  images: Joi.array().items(imageField).max(5),
  category: Joi.string().trim().min(2).max(120),
  stock: Joi.number().integer().min(0).max(100000),
}).min(1);

const orderCreateSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: objectId.required(),
        quantity: Joi.number().integer().min(1).max(99).required(),
      })
    )
    .min(1)
    .required(),
  address: Joi.string().trim().min(10).max(500).required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{8,20}$/)
    .required()
    .messages({
      "string.pattern.base": "phone must contain a valid phone number",
    }),
});

const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "delivered", "cancelled")
    .required(),
});

module.exports = {
  paginationQuerySchema,
  idParamSchema,
  registerSchema,
  loginSchema,
  productCreateSchema,
  productUpdateSchema,
  orderCreateSchema,
  orderStatusSchema,
};
