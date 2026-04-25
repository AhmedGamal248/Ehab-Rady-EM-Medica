const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");
const {
  idParamSchema,
  orderCreateSchema,
  orderStatusSchema,
} = require("../validation/schemas");

router.post("/", auth, validate(orderCreateSchema), createOrder);
router.get("/my", auth, getMyOrders);
router.get("/", auth, admin, getAllOrders);
router.get("/:id", auth, admin, validate(idParamSchema, "params"), getOrderById);
router.put(
  "/:id",
  auth,
  admin,
  validate(idParamSchema, "params"),
  validate(orderStatusSchema),
  updateOrderStatus
);
router.patch(
  "/:id/status",
  auth,
  admin,
  validate(idParamSchema, "params"),
  validate(orderStatusSchema),
  updateOrderStatus
);

module.exports = router;
