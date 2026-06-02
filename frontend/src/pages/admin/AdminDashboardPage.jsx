import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdCloudUpload,
  MdDelete,
  MdEdit,
  MdInventory2,
  MdLocalMall,
  MdOutlinePayments,
  MdPendingActions,
  MdSave,
  MdPhone,
  MdAccessTime,
  MdClose,
  MdCheckCircle,
  MdVisibility,
} from "react-icons/md";
import api from "../../services/api";
import { uploadImages } from "../../services/upload";
import { formatCurrency, getProductImage } from "../../utils/formatters";

/* ── Helpers ─────────────────────────────────────────────────── */
function getProductsPayload(res) {
  return res.data?.data?.data || res.data?.data || res.data || [];
}
function getOrdersPayload(res) {
  return res.data?.data || res.data || [];
}
function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}
function getApiError(err, fallback) {
  const errs = err.response?.data?.errors;
  if (Array.isArray(errs) && errs.length) return errs[0];
  return err.response?.data?.message || fallback;
}

/* ── Form state with useReducer ──────────────────────────────── */
const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
  images: [],
  colors: [],
};

function formReducer(state, action) {
  switch (action.type) {
    case "set":    return { ...state, [action.field]: action.value };
    case "reset":  return initialForm;
    case "load":   return { ...initialForm, ...action.payload };
    default:       return state;
  }
}

/* ── Confirm dialog hook ─────────────────────────────────────── */
function useConfirm() {
  const [pending, setPending] = useState(null);  // { message, resolve }
  const confirm = useCallback((message) => new Promise((resolve) => {
    setPending({ message, resolve });
  }), []);
  const handleResult = useCallback((result) => {
    pending?.resolve(result);
    setPending(null);
  }, [pending]);
  return { confirm, pending, handleResult };
}

/* ── Confirm Dialog component ────────────────────────────────── */
function ConfirmDialog({ pending, onResult }) {
  if (!pending) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm action"
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
      }}
    >
      <div style={{
        background: "var(--surface-solid)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-xl)",
        maxWidth: 400, width: "90%",
        padding: "28px 32px",
        display: "grid", gap: 20,
        animation: "dialogIn 0.22s cubic-bezier(0.22,1,0.36,1) both",
      }}>
        <p style={{ fontSize: "1rem", lineHeight: 1.65, color: "var(--text-primary)" }}>
          {pending.message}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="button button--secondary" onClick={() => onResult(false)} type="button">
            Cancel
          </button>
          <button
            className="button button--primary"
            onClick={() => onResult(true)}
            type="button"
            style={{ background: "var(--danger)", boxShadow: "none" }}
            autoFocus
          >
            <MdDelete size={16} aria-hidden="true" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Upload progress indicator ───────────────────────────────── */
function UploadOverlay({ active }) {
  if (!active) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, borderRadius: "inherit",
      background: "rgba(255,255,255,0.80)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 10, zIndex: 10,
    }}>
      <div className="spinner" style={{ width: 28, height: 28 }} role="status" aria-label="Uploading" />
      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Uploading…</span>
    </div>
  );
}

function OrderDetailsDialog({ order, loading, onClose, getStatusLabel }) {
  if (!order && !loading) return null;

  const items = Array.isArray(order?.items) ? order.items : [];
  const customerName = order?.user?.name || order?.fullName || "Unknown";
  const customerEmail = order?.user?.email || order?.email || "—";
  const phone = order?.mobileNumber || order?.phone || order?.user?.phone || "—";
  const shippingAddress = order?.address || "—";
  const shippingCost = Number(order?.shippingCost || 0);
  const subtotal = Number(order?.subtotal || 0);
  const total = Number(order?.total || 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Order details"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 520,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(6px)",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "var(--surface-solid)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-xl)",
          width: "min(980px, 100%)",
          maxHeight: "88vh",
          overflow: "auto",
          display: "grid",
          gap: 16,
          padding: "22px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <strong style={{ display: "block", fontSize: "1.1rem" }}>
              Order #{order?._id?.slice(-6) || "—"}
            </strong>
            {order?.createdAt && (
              <small style={{ color: "var(--text-secondary)" }}>
                {formatDate(order.createdAt)}
              </small>
            )}
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close order details">
            <MdClose size={18} aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <div className="state-card" aria-busy="true">
            <div className="spinner" role="status" />
            <p>Loading order details…</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 8 }}>
              <strong>Customer Information</strong>
              <div style={{ color: "var(--text-secondary)", display: "grid", gap: 4 }}>
                <span><strong style={{ color: "var(--text-primary)" }}>Name:</strong> {customerName}</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Email:</strong> {customerEmail}</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Phone:</strong> {phone}</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Address:</strong> {shippingAddress}</span>
                <span>
                  <strong style={{ color: "var(--text-primary)" }}>Status:</strong>{" "}
                  <span className={`status-pill status-pill--${order?.status || "pending"}`}>
                    {getStatusLabel(order?.status || "pending")}
                  </span>
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <strong>Items</strong>
              {items.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>No items found for this order.</p>
              ) : (
                items.map((item, index) => {
                  const itemQty = Number(item.quantity || 0);
                  const unitPrice = Number(item.price || 0);
                  const itemSubtotal = itemQty * unitPrice;
                  const itemImage = item.image || getProductImage(item.product || {});
                  return (
                    <article
                      key={`${item.product?._id || item.name}-${index}`}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-md)",
                        padding: 12,
                        display: "grid",
                        gap: 10,
                        gridTemplateColumns: "72px minmax(0,1fr)",
                        alignItems: "start",
                      }}
                    >
                      <img
                        src={itemImage}
                        alt={item.name || "Order item"}
                        width={72}
                        height={72}
                        style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover" }}
                      />
                      <div style={{ display: "grid", gap: 4 }}>
                        <strong>{item.name || item.product?.name || "Unnamed product"}</strong>
                        {item.color?.name && (
                          <span style={{ color: "var(--text-secondary)" }}>
                            Color: {item.color.name}
                          </span>
                        )}
                        <span style={{ color: "var(--text-secondary)" }}>Quantity: {itemQty}</span>
                        <span style={{ color: "var(--text-secondary)" }}>Unit Price: {formatCurrency(unitPrice)}</span>
                        <strong>Subtotal: {formatCurrency(itemSubtotal)}</strong>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "grid", gap: 6 }}>
              <span style={{ color: "var(--text-secondary)" }}>Subtotal: {formatCurrency(subtotal)}</span>
              <span style={{ color: "var(--text-secondary)" }}>Shipping: {formatCurrency(shippingCost)}</span>
              <strong>Total: {formatCurrency(total)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Stats Card ──────────────────────────────────────────────── */
function StatCard({ icon, value, label }) {
  return (
    <article className="admin-stat" aria-label={`${label}: ${value}`}>
      <span aria-hidden="true">{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </article>
  );
}

/* ── Product Form ────────────────────────────────────────────── */
function ProductForm({ form, dispatch, editProduct, uploading, setUploading, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const mainUploadRef = useRef(null);
  const extraUploadRef = useRef(null);
  const colorUploadRefs = useRef([]);

  const field = (name) => ({
    value: form[name],
    onChange: (e) => dispatch({ type: "set", field: name, value: e.target.value }),
  });

  const handleMainUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [url] = await uploadImages([file]);
      dispatch({ type: "set", field: "image", value: url });
      toast.success(t("adminDashboardPage.uploadMainSuccess"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("adminDashboardPage.uploadMainError"));
    } finally {
      setUploading(false);
      if (mainUploadRef.current) mainUploadRef.current.value = "";
    }
  };

  const handleExtraUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      dispatch({ type: "set", field: "images", value: [...form.images, ...urls].slice(0, 5) });
      toast.success(t("adminDashboardPage.uploadExtraSuccess"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("adminDashboardPage.uploadExtraError"));
    } finally {
      setUploading(false);
      if (extraUploadRef.current) extraUploadRef.current.value = "";
    }
  };

  const removeExtraImage = (idx) => {
    dispatch({ type: "set", field: "images", value: form.images.filter((_, i) => i !== idx) });
  };

  const addColor = () => {
    dispatch({
      type: "set",
      field: "colors",
      value: [...form.colors, { name: "", hex: "#000000", images: [] }],
    });
  };

  const updateColor = (index, fieldName, value) => {
    dispatch({
      type: "set",
      field: "colors",
      value: form.colors.map((color, colorIndex) =>
        colorIndex === index ? { ...color, [fieldName]: value } : color
      ),
    });
  };

  const removeColor = (index) => {
    dispatch({
      type: "set",
      field: "colors",
      value: form.colors.filter((_, colorIndex) => colorIndex !== index),
    });
  };

  const handleColorImagesUpload = (index) => async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      dispatch({
        type: "set",
        field: "colors",
        value: form.colors.map((color, colorIndex) =>
          colorIndex === index
            ? { ...color, images: [...(color.images || []), ...urls].slice(0, 10) }
            : color
        ),
      });
      toast.success(t("adminDashboardPage.uploadColorImagesSuccess"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("adminDashboardPage.uploadColorImagesError"));
    } finally {
      setUploading(false);
      if (colorUploadRefs.current[index]) colorUploadRefs.current[index].value = "";
    }
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    dispatch({
      type: "set",
      field: "colors",
      value: form.colors.map((color, index) =>
        index === colorIndex
          ? { ...color, images: (color.images || []).filter((_, idx) => idx !== imageIndex) }
          : color
      ),
    });
  };

  return (
    <form
      className="admin-form"
      onSubmit={onSubmit}
      aria-label={editProduct ? "Edit product" : "Add product"}
      noValidate
    >
      <div className="admin-form__grid">
        {/* Name */}
        <label htmlFor="af-name">
          {t("adminDashboardPage.productName")}
          <input id="af-name" required minLength={2} type="text" {...field("name")} aria-required="true" />
        </label>

        {/* Category */}
        <label htmlFor="af-cat">
          {t("common.category")}
          <input id="af-cat" required minLength={2} type="text" {...field("category")} aria-required="true" />
        </label>

        {/* Price */}
        <label htmlFor="af-price">
          {t("common.price")}
          <input id="af-price" required min={0} step="0.01" type="number" {...field("price")} aria-required="true" />
        </label>

        {/* Stock */}
        <label htmlFor="af-stock">
          {t("common.stock")}
          <input id="af-stock" required min={0} type="number" {...field("stock")} aria-required="true" />
        </label>

        {/* Description */}
        <label className="admin-form__full" htmlFor="af-desc">
          {t("common.description")}
          <textarea id="af-desc" required minLength={10} rows={4} {...field("description")} aria-required="true" />
        </label>

        {/* Main image upload */}
        <div className="upload-card" style={{ position: "relative" }}>
          <UploadOverlay active={uploading} />
          <span id="main-img-label">{t("adminDashboardPage.mainImage")}</span>
          <label
            htmlFor="af-main-img"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <MdCloudUpload size={20} aria-hidden="true" />
            <small>{t("adminDashboardPage.mainImageHelper")}</small>
          </label>
          <input
            id="af-main-img"
            ref={mainUploadRef}
            accept="image/*"
            aria-labelledby="main-img-label"
            onChange={handleMainUpload}
            type="file"
            disabled={uploading}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />
          {form.image && (
            <div style={{ position: "relative" }}>
              <img alt={t("adminDashboardPage.mainImageAlt")} src={form.image} />
              <button
                aria-label="Remove main image"
                onClick={() => dispatch({ type: "set", field: "image", value: "" })}
                type="button"
                style={{
                  position: "absolute", top: 8, right: 8,
                  background: "var(--danger)", border: 0,
                  borderRadius: "50%", color: "#fff",
                  width: 28, height: 28, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <MdClose size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Extra images upload */}
        <div className="upload-card" style={{ position: "relative" }}>
          <UploadOverlay active={uploading} />
          <span id="extra-img-label">{t("adminDashboardPage.extraImages")}</span>
          <label
            htmlFor="af-extra-imgs"
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
          >
            <MdCloudUpload size={20} aria-hidden="true" />
            <small>{t("adminDashboardPage.extraImagesHelper")}</small>
          </label>
          <input
            id="af-extra-imgs"
            ref={extraUploadRef}
            accept="image/*"
            aria-labelledby="extra-img-label"
            multiple
            onChange={handleExtraUpload}
            type="file"
            disabled={uploading || form.images.length >= 5}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />
          {form.images.length > 0 && (
            <div className="upload-card__grid">
              {form.images.map((img, idx) => (
                <div key={`${img}-${idx}`} className="upload-card__thumb">
                  <img
                    alt={t("adminDashboardPage.extraImageAlt", { index: idx + 1 })}
                    src={img}
                  />
                  <button
                    aria-label={`Remove extra image ${idx + 1}`}
                    onClick={() => removeExtraImage(idx)}
                    type="button"
                  >
                    {t("adminDashboardPage.delete")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-form__full color-variations">
          <div className="color-variations__header">
            <div>
              <strong>{t("adminDashboardPage.colorVariations")}</strong>
              <small>{t("adminDashboardPage.colorVariationsHelper")}</small>
            </div>
            <button className="button button--secondary" onClick={addColor} type="button">
              <MdAdd size={16} aria-hidden="true" />
              {t("adminDashboardPage.addColor")}
            </button>
          </div>

          {form.colors.length === 0 ? (
            <p>{t("adminDashboardPage.noColors")}</p>
          ) : (
            <div className="color-variations__list">
              {form.colors.map((color, colorIndex) => (
                <section className="color-variation" key={colorIndex}>
                  <div className="color-variation__fields">
                    <label htmlFor={`af-color-name-${colorIndex}`}>
                      {t("adminDashboardPage.colorName")}
                      <input
                        id={`af-color-name-${colorIndex}`}
                        onChange={(e) => updateColor(colorIndex, "name", e.target.value)}
                        required
                        type="text"
                        value={color.name}
                      />
                    </label>
                    <label htmlFor={`af-color-hex-${colorIndex}`}>
                      {t("adminDashboardPage.colorHex")}
                      <input
                        id={`af-color-hex-${colorIndex}`}
                        onChange={(e) => updateColor(colorIndex, "hex", e.target.value)}
                        required
                        type="color"
                        value={color.hex || "#000000"}
                      />
                    </label>
                    <button
                      aria-label={t("adminDashboardPage.removeColor")}
                      className="icon-button icon-button--danger"
                      onClick={() => removeColor(colorIndex)}
                      type="button"
                    >
                      <MdDelete size={18} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="upload-card" style={{ position: "relative" }}>
                    <UploadOverlay active={uploading} />
                    <span>{t("adminDashboardPage.colorImages")}</span>
                    <label
                      htmlFor={`af-color-images-${colorIndex}`}
                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <MdCloudUpload size={20} aria-hidden="true" />
                      <small>{t("adminDashboardPage.colorImagesHelper")}</small>
                    </label>
                    <input
                      id={`af-color-images-${colorIndex}`}
                      ref={(node) => { colorUploadRefs.current[colorIndex] = node; }}
                      accept="image/*"
                      multiple
                      onChange={handleColorImagesUpload(colorIndex)}
                      type="file"
                      disabled={uploading || (color.images || []).length >= 10}
                      style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
                    />
                    {(color.images || []).length > 0 && (
                      <div className="upload-card__grid">
                        {color.images.map((img, imageIndex) => (
                          <div key={`${img}-${imageIndex}`} className="upload-card__thumb">
                            <img alt={`${color.name || "Color"} ${imageIndex + 1}`} src={img} />
                            <button
                              onClick={() => removeColorImage(colorIndex, imageIndex)}
                              type="button"
                            >
                              {t("adminDashboardPage.delete")}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-actions">
        <button
          className="button button--primary"
          disabled={uploading}
          type="submit"
          aria-busy={uploading}
        >
          <MdSave size={18} aria-hidden="true" />
          <span>{editProduct ? t("adminDashboardPage.saveChanges") : t("adminDashboardPage.addProduct")}</span>
        </button>
        <button className="button button--secondary" onClick={onCancel} type="button">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(null); // orderId being saved
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const [form, dispatch] = useReducer(formReducer, initialForm);
  const { confirm, pending: confirmPending, handleResult: handleConfirmResult } = useConfirm();

  /* ── Data fetchers ── */
  const fetchProducts = useCallback(async () => {
    const res = await api.get("/products");
    return getProductsPayload(res);
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await api.get("/orders");
    return getOrdersPayload(res);
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    Promise.all([fetchProducts(), fetchOrders()])
      .then(([prods, ords]) => {
        if (ignore) return;
        setProducts(prods);
        setOrders(ords);
      })
      .catch(() => { if (!ignore) toast.error(t("adminDashboardPage.loadError")); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [fetchProducts, fetchOrders, t]);

  /* ── Stats ── */
  const stats = useMemo(() => [
    {
      label: t("adminDashboardPage.stats.products"),
      value: products.length,
      icon: <MdInventory2 size={24} aria-hidden="true" />,
    },
    {
      label: t("adminDashboardPage.stats.orders"),
      value: orders.length,
      icon: <MdLocalMall size={24} aria-hidden="true" />,
    },
    {
      label: t("adminDashboardPage.stats.newOrders"),
      value: orders.filter((o) => o.status === "pending").length,
      icon: <MdPendingActions size={24} aria-hidden="true" />,
    },
    {
      label: t("adminDashboardPage.stats.totalSales"),
      value: formatCurrency(orders.reduce((s, o) => s + Number(o.total || 0), 0)),
      icon: <MdOutlinePayments size={24} aria-hidden="true" />,
    },
  ], [orders, products.length, t]);

  /* ── Form handlers ── */
  const resetForm = useCallback(() => {
    dispatch({ type: "reset" });
    setEditProduct(null);
    setShowForm(false);
  }, []);

  const handleEdit = useCallback((product) => {
    setEditProduct(product);
    dispatch({
      type: "load",
      payload: {
        name: product.name,
        description: product.description,
        price: String(product.price),
        category: product.category,
        stock: String(product.stock),
        image: product.image || "",
        images: product.images || [],
        colors: product.colors || [],
      },
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      colors: form.colors
        .map((color) => ({
          name: color.name.trim(),
          hex: color.hex || "#000000",
          images: color.images || [],
        }))
        .filter((color) => color.name),
    };

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success(t("adminDashboardPage.productUpdated"));
      } else {
        await api.post("/products", payload);
        toast.success(t("adminDashboardPage.productAdded"));
      }
      resetForm();
      setProducts(await fetchProducts());
    } catch (err) {
      toast.error(getApiError(err, t("adminDashboardPage.saveError")));
    }
  }, [editProduct, fetchProducts, form, resetForm, t]);

  const handleDelete = useCallback(async (productId, productName) => {
    const ok = await confirm(
      `${t("adminDashboardPage.deleteConfirm")}\n\n"${productName}"`
    );
    if (!ok) return;
    try {
      await api.delete(`/products/${productId}`);
      toast.success(t("adminDashboardPage.productDeleted"));
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch {
      toast.error(t("adminDashboardPage.productDeleteError"));
    }
  }, [confirm, t]);

  const handleStatusChange = useCallback(async (orderId, status) => {
    setSavingStatus(orderId);
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success(t("adminDashboardPage.statusUpdated"));
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      toast.error(t("adminDashboardPage.statusUpdateError"));
    } finally {
      setSavingStatus(null);
    }
  }, [t]);

  const handleOpenOrderDetails = useCallback(async (orderId) => {
    setSelectedOrderId(orderId);
    setLoadingOrderDetails(true);
    setSelectedOrder(null);
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data?.data || res.data || null);
    } catch {
      toast.error("Unable to load order details");
    } finally {
      setLoadingOrderDetails(false);
    }
  }, []);

  const handleCloseOrderDetails = useCallback(() => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setLoadingOrderDetails(false);
  }, []);

  const getStatusLabel = (status) => t(`common.orderStatus.${status}`);

  /* ── Render ── */
  return (
    <div className="page">
      <ConfirmDialog pending={confirmPending} onResult={handleConfirmResult} />
      <OrderDetailsDialog
        order={selectedOrder}
        loading={loadingOrderDetails}
        onClose={handleCloseOrderDetails}
        getStatusLabel={getStatusLabel}
      />

      <section className="container section admin-page">
        <div className="section-heading section-heading--compact">
          <span className="eyebrow">{t("adminDashboardPage.eyebrow")}</span>
          <h1>{t("adminDashboardPage.title")}</h1>
        </div>

        {/* Stats */}
        <div className="admin-stats" role="list" aria-label="Dashboard statistics">
          {stats.map((s) => (
            <StatCard key={s.label} icon={s.icon} value={s.value} label={s.label} />
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs" role="tablist" aria-label="Dashboard sections">
          {["products", "orders"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "is-active" : ""}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              id={`tab-${tab}`}
              type="button"
            >
              {t(`adminDashboardPage.tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* ── Products panel ── */}
        <div
          id="panel-products"
          role="tabpanel"
          aria-labelledby="tab-products"
          hidden={activeTab !== "products"}
        >
          {activeTab === "products" && (
            <>
              <div className="admin-actions" style={{ marginBottom: 16 }}>
                <button
                  className="button button--primary"
                  onClick={() => {
                    if (showForm) { resetForm(); }
                    else { setShowForm(true); setEditProduct(null); dispatch({ type: "reset" }); }
                  }}
                  type="button"
                  aria-expanded={showForm}
                  aria-controls="product-form"
                >
                  {showForm ? <MdClose size={18} aria-hidden="true" /> : <MdAdd size={18} aria-hidden="true" />}
                  <span>{showForm ? t("adminDashboardPage.closeForm") : t("adminDashboardPage.openForm")}</span>
                </button>
              </div>

              {showForm && (
                <div id="product-form">
                  <ProductForm
                    form={form}
                    dispatch={dispatch}
                    editProduct={editProduct}
                    uploading={uploading}
                    setUploading={setUploading}
                    onSubmit={handleSubmit}
                    onCancel={resetForm}
                  />
                </div>
              )}

              {loading ? (
                <div className="state-card" aria-busy="true">
                  <div className="spinner" role="status" />
                  <p>Loading products…</p>
                </div>
              ) : (
                <div
                  className="admin-table"
                  role="table"
                  aria-label="Products table"
                  aria-rowcount={products.length + 1}
                >
                  <div className="admin-table__head" role="row">
                    <span role="columnheader">{t("adminDashboardPage.productTable.product")}</span>
                    <span role="columnheader">{t("adminDashboardPage.productTable.category")}</span>
                    <span role="columnheader">{t("adminDashboardPage.productTable.price")}</span>
                    <span role="columnheader">{t("adminDashboardPage.productTable.stock")}</span>
                    <span role="columnheader">{t("adminDashboardPage.productTable.actions")}</span>
                  </div>

                  {products.map((product, rowIdx) => (
                    <article
                      className="admin-table__row"
                      key={product._id}
                      role="row"
                      aria-rowindex={rowIdx + 2}
                    >
                      <div
                        className="admin-product"
                        role="cell"
                        data-label={t("adminDashboardPage.productTable.product")}
                      >
                        <img
                          alt={product.name}
                          src={getProductImage(product)}
                          loading="lazy"
                          width={60}
                          height={60}
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.description}</small>
                        </div>
                      </div>

                      <span
                        role="cell"
                        data-label={t("adminDashboardPage.productTable.category")}
                      >
                        {product.category}
                      </span>

                      <strong
                        role="cell"
                        data-label={t("adminDashboardPage.productTable.price")}
                      >
                        {formatCurrency(product.price)}
                      </strong>

                      <span
                        role="cell"
                        data-label={t("adminDashboardPage.productTable.stock")}
                        style={{ color: product.stock <= 0 ? "var(--danger)" : "inherit" }}
                      >
                        {product.stock <= 0 ? "Out of stock" : product.stock}
                      </span>

                      <div
                        className="admin-row__actions"
                        role="cell"
                        data-label={t("adminDashboardPage.productTable.actions")}
                      >
                        <button
                          aria-label={`Edit ${product.name}`}
                          className="icon-button"
                          onClick={() => handleEdit(product)}
                          type="button"
                        >
                          <MdEdit size={18} aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="icon-button icon-button--danger"
                          onClick={() => handleDelete(product._id, product.name)}
                          type="button"
                        >
                          <MdDelete size={18} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  ))}

                  {!loading && products.length === 0 && (
                    <div className="state-card" role="status" style={{ borderRadius: 0 }}>
                      <MdInventory2 size={34} aria-hidden="true" />
                      <p>No products yet.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Orders panel ── */}
        <div
          id="panel-orders"
          role="tabpanel"
          aria-labelledby="tab-orders"
          hidden={activeTab !== "orders"}
        >
          {activeTab === "orders" && (
            <div
              className="admin-table admin-table--orders"
              role="table"
              aria-label="Orders table"
              aria-rowcount={orders.length + 1}
            >
              <div className="admin-table__head" role="row">
                <span role="columnheader">{t("adminDashboardPage.ordersTable.customer")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.phone")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.address")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.date")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.total")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.status")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.update")}</span>
                <span role="columnheader">{t("adminDashboardPage.ordersTable.details")}</span>
              </div>

              {orders.map((order, rowIdx) => (
                <article
                  className="admin-table__row"
                  key={order._id}
                  role="row"
                  aria-rowindex={rowIdx + 2}
                >
                  <span
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.customer")}
                  >
                    {order.user?.name || order.fullName || t("adminDashboardPage.unknownCustomer")}
                  </span>

                  <span
                    className="admin-order__phone"
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.phone")}
                  >
                    <MdPhone size={14} aria-hidden="true" />
                    <span dir="ltr">{order.mobileNumber || order.phone || order.user?.phone || "—"}</span>
                  </span>

                  <span
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.address")}
                    style={{ fontSize: "0.88rem" }}
                  >
                    {order.address}
                  </span>

                  <span
                    className="admin-order__date"
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.date")}
                  >
                    <MdAccessTime size={14} aria-hidden="true" />
                    <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                  </span>

                  <strong
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.total")}
                  >
                    {formatCurrency(order.total)}
                  </strong>

                  <span
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.status")}
                  >
                    <span className={`status-pill status-pill--${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </span>

                  <div
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.update")}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <select
                      aria-label={`Update status for order by ${order.user?.name || order.fullName || "unknown"}`}
                      disabled={savingStatus === order._id}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--r-sm)",
                        color: "var(--text-primary)",
                        minHeight: 38,
                        padding: "0 10px",
                        flex: 1,
                        opacity: savingStatus === order._id ? 0.6 : 1,
                      }}
                      value={order.status}
                    >
                      {["pending", "confirmed", "delivered", "cancelled"].map((s) => (
                        <option key={s} value={s}>{getStatusLabel(s)}</option>
                      ))}
                    </select>
                    {savingStatus === order._id && (
                      <div
                        className="spinner"
                        style={{ width: 18, height: 18, borderWidth: 2, flexShrink: 0 }}
                        role="status"
                        aria-label="Saving"
                      />
                    )}
                  </div>

                  <div
                    role="cell"
                    data-label={t("adminDashboardPage.ordersTable.details")}
                  >
                    <button
                      className="button button--secondary button--sm"
                      type="button"
                      onClick={() => handleOpenOrderDetails(order._id)}
                      disabled={loadingOrderDetails && selectedOrderId === order._id}
                    >
                      <MdVisibility size={16} aria-hidden="true" />
                      <span>{t("adminDashboardPage.ordersTable.viewDetails")}</span>
                    </button>
                  </div>
                </article>
              ))}

              {!loading && orders.length === 0 && (
                <div className="state-card" role="status" style={{ borderRadius: 0 }}>
                  <MdLocalMall size={34} aria-hidden="true" />
                  <p>No orders yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
