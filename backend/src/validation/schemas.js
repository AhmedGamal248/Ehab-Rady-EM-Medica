const Joi = require("joi");

const objectId = Joi.string().trim().hex().length(24);
const imageField = Joi.string().trim().max(2048).allow("");
const egyptianGovernorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];
const egyptianMobileSchema = Joi.string()
  .trim()
  .custom((value, helpers) => {
    const normalized = value.replace(/[\s-]/g, "");
    if (!/^(?:\+?20|0)?1[0125]\d{8}$/.test(normalized)) {
      return helpers.error("string.pattern.base");
    }

    return normalized;
  }, "Egyptian mobile validation")
  .required()
  .messages({
    "string.pattern.base": "mobile number must be a valid Egyptian mobile number",
  });
const colorSchema = Joi.object({
  name: Joi.string().trim().min(1).max(50).required(),
  hex: Joi.string()
    .trim()
    .pattern(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
    .required()
    .messages({
      "string.pattern.base": "color hex must be a valid hex color",
    }),
  images: Joi.array().items(imageField).max(10).default([]),
});

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
  colors: Joi.array().items(colorSchema).max(20).default([]),
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200),
  description: Joi.string().trim().min(10).max(2000),
  price: Joi.number().min(0).max(1000000),
  image: imageField,
  images: Joi.array().items(imageField).max(5),
  category: Joi.string().trim().min(2).max(120),
  stock: Joi.number().integer().min(0).max(100000),
  colors: Joi.array().items(colorSchema).max(20),
}).min(1);

const orderCreateSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().email().lowercase().max(255).allow("").optional(),
  governorate: Joi.string()
    .trim()
    .valid(...egyptianGovernorates)
    .required(),
  city: Joi.string().trim().min(2).max(120).required(),
  mobileNumber: egyptianMobileSchema,
  items: Joi.array()
    .items(
      Joi.object({
        product: objectId.required(),
        quantity: Joi.number().integer().min(1).max(99).required(),
        color: Joi.object({
          name: Joi.string().trim().min(1).max(50).required(),
          hex: Joi.string().trim().max(9).allow(""),
        }).optional(),
      })
    )
    .min(1)
    .required(),
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
  egyptianGovernorates,
};
