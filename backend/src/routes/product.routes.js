const express = require("express");
const router = express.Router();
const {
  getAllProducts, getProduct, createProduct, updateProduct, deleteProduct,
} = require("../controllers/product.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");
const {
  paginationQuerySchema,
  idParamSchema,
  productCreateSchema,
  productUpdateSchema,
} = require("../validation/schemas");

router.get("/", validate(paginationQuerySchema, "query"), getAllProducts);
router.get("/:id", validate(idParamSchema, "params"), getProduct);
router.post("/", auth, admin, validate(productCreateSchema), createProduct);
router.put(
  "/:id",
  auth,
  admin,
  validate(idParamSchema, "params"),
  validate(productUpdateSchema),
  updateProduct
);
router.delete("/:id", auth, admin, validate(idParamSchema, "params"), deleteProduct);

module.exports = router;
