import { useEffect, useMemo, useState } from "react";
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
} from "react-icons/md";
import api from "../../services/api";
import { uploadImages } from "../../services/upload";
import { formatCurrency, getProductImage } from "../../utils/formatters";

function getProductsPayload(response) {
  return response.data?.data?.data || response.data?.data || response.data || [];
}

function getOrdersPayload(response) {
  return response.data?.data || response.data || [];
}

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  image: "",
  images: [],
};

function getRequestErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors[0];
  }

  return error.response?.data?.message || fallbackMessage;
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [uploading, setUploading] = useState(false);

  const stats = useMemo(
    () => [
      {
        label: t("adminDashboardPage.stats.products"),
        value: products.length,
        icon: <MdInventory2 size={24} />,
      },
      {
        label: t("adminDashboardPage.stats.orders"),
        value: orders.length,
        icon: <MdLocalMall size={24} />,
      },
      {
        label: t("adminDashboardPage.stats.newOrders"),
        value: orders.filter((order) => order.status === "pending").length,
        icon: <MdPendingActions size={24} />,
      },
      {
        label: t("adminDashboardPage.stats.totalSales"),
        value: formatCurrency(
          orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
        ),
        icon: <MdOutlinePayments size={24} />,
      },
    ],
    [orders, products.length, t]
  );

  const fetchProducts = async () => {
    const response = await api.get("/products");
    return getProductsPayload(response);
  };

  const fetchOrders = async () => {
    const response = await api.get("/orders");
    return getOrdersPayload(response);
  };

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [nextProducts, nextOrders] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
        ]);

        if (ignore) {
          return;
        }

        setProducts(nextProducts);
        setOrders(nextOrders);
      } catch {
        if (!ignore) {
          toast.error(t("adminDashboardPage.loadError"));
        }
      }
    };

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [t]);

  const resetForm = () => {
    setForm(initialForm);
    setEditProduct(null);
    setShowForm(false);
  };

  const uploadSelectedImages = async (files) => {
    setUploading(true);

    try {
      return await uploadImages(files);
    } finally {
      setUploading(false);
    }
  };

  const handleMainImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const [imageUrl] = await uploadSelectedImages([file]);

      setForm((currentValue) => ({
        ...currentValue,
        image: imageUrl,
      }));
      toast.success(t("adminDashboardPage.uploadMainSuccess"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("adminDashboardPage.uploadMainError"));
      event.target.value = "";
      return;
    }

    event.target.value = "";
  };

  const handleExtraImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      const nextUrls = await uploadSelectedImages(files);

      setForm((currentValue) => ({
        ...currentValue,
        images: [...currentValue.images, ...nextUrls].slice(0, 5),
      }));
      toast.success(t("adminDashboardPage.uploadExtraSuccess"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("adminDashboardPage.uploadExtraError"));
      event.target.value = "";
      return;
    }

    event.target.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
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
    } catch (error) {
      toast.error(getRequestErrorMessage(error, t("adminDashboardPage.saveError")));
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      image: product.image || "",
      images: product.images || [],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t("adminDashboardPage.deleteConfirm"))) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success(t("adminDashboardPage.productDeleted"));
      setProducts(await fetchProducts());
    } catch {
      toast.error(t("adminDashboardPage.productDeleteError"));
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success(t("adminDashboardPage.statusUpdated"));
      setOrders(await fetchOrders());
    } catch {
      toast.error(t("adminDashboardPage.statusUpdateError"));
    }
  };

  const getStatusLabel = (status) => t(`common.orderStatus.${status}`);

  return (
    <div className="page">
      <section className="container section admin-page">
        <div className="section-heading section-heading--compact">
          <span className="eyebrow">{t("adminDashboardPage.eyebrow")}</span>
          <h1>{t("adminDashboardPage.title")}</h1>
        </div>

        <div className="admin-stats">
          {stats.map((item) => (
            <article key={item.label} className="admin-stat">
              <span>{item.icon}</span>
              <strong>{item.value}</strong>
              <small>{item.label}</small>
            </article>
          ))}
        </div>

        <div className="admin-tabs">
          <button
            className={activeTab === "products" ? "is-active" : ""}
            onClick={() => setActiveTab("products")}
            type="button"
          >
            {t("adminDashboardPage.tabs.products")}
          </button>
          <button
            className={activeTab === "orders" ? "is-active" : ""}
            onClick={() => setActiveTab("orders")}
            type="button"
          >
            {t("adminDashboardPage.tabs.orders")}
          </button>
        </div>

        {activeTab === "products" ? (
          <>
            <div className="admin-actions">
              <button
                className="button button--primary"
                onClick={() => {
                  if (showForm) {
                    resetForm();
                  } else {
                    setShowForm(true);
                    setEditProduct(null);
                    setForm(initialForm);
                  }
                }}
                type="button"
              >
                <MdAdd size={18} />
                <span>
                  {showForm
                    ? t("adminDashboardPage.closeForm")
                    : t("adminDashboardPage.openForm")}
                </span>
              </button>
            </div>

            {showForm ? (
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__grid">
                  <label>
                    {t("adminDashboardPage.productName")}
                    <input
                      minLength={2}
                      onChange={(event) =>
                        setForm((currentValue) => ({
                          ...currentValue,
                          name: event.target.value,
                        }))
                      }
                      required
                      type="text"
                      value={form.name}
                    />
                  </label>

                  <label>
                    {t("common.category")}
                    <input
                      minLength={2}
                      onChange={(event) =>
                        setForm((currentValue) => ({
                          ...currentValue,
                          category: event.target.value,
                        }))
                      }
                      required
                      type="text"
                      value={form.category}
                    />
                  </label>

                  <label>
                    {t("common.price")}
                    <input
                      min={0}
                      onChange={(event) =>
                        setForm((currentValue) => ({
                          ...currentValue,
                          price: event.target.value,
                        }))
                      }
                      required
                      type="number"
                      value={form.price}
                    />
                  </label>

                  <label>
                    {t("common.stock")}
                    <input
                      min={0}
                      onChange={(event) =>
                        setForm((currentValue) => ({
                          ...currentValue,
                          stock: event.target.value,
                        }))
                      }
                      required
                      type="number"
                      value={form.stock}
                    />
                  </label>

                  <label className="admin-form__full">
                    {t("common.description")}
                    <textarea
                      minLength={10}
                      onChange={(event) =>
                        setForm((currentValue) => ({
                          ...currentValue,
                          description: event.target.value,
                        }))
                      }
                      required
                      rows={4}
                      value={form.description}
                    />
                  </label>

                  <label className="upload-card">
                    <span>{t("adminDashboardPage.mainImage")}</span>
                    <input accept="image/*" onChange={handleMainImageUpload} type="file" />
                    <div>
                      <MdCloudUpload size={20} />
                      <small>{t("adminDashboardPage.mainImageHelper")}</small>
                    </div>
                    {form.image ? (
                      <img alt={t("adminDashboardPage.mainImageAlt")} src={form.image} />
                    ) : null}
                  </label>

                  <label className="upload-card">
                    <span>{t("adminDashboardPage.extraImages")}</span>
                    <input
                      accept="image/*"
                      multiple
                      onChange={handleExtraImagesUpload}
                      type="file"
                    />
                    <div>
                      <MdCloudUpload size={20} />
                      <small>{t("adminDashboardPage.extraImagesHelper")}</small>
                    </div>
                    {form.images.length > 0 ? (
                      <div className="upload-card__grid">
                        {form.images.map((image, index) => (
                          <div key={`${image}-${index}`} className="upload-card__thumb">
                            <img
                              alt={t("adminDashboardPage.extraImageAlt", { index: index + 1 })}
                              src={image}
                            />
                            <button
                              onClick={() =>
                                setForm((currentValue) => ({
                                  ...currentValue,
                                  images: currentValue.images.filter(
                                    (_, imageIndex) => imageIndex !== index
                                  ),
                                }))
                              }
                              type="button"
                            >
                              {t("adminDashboardPage.delete")}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </label>
                </div>

                <div className="admin-actions">
                  <button
                    className="button button--primary"
                    disabled={uploading}
                    type="submit"
                  >
                    <MdSave size={18} />
                    <span>
                      {editProduct
                        ? t("adminDashboardPage.saveChanges")
                        : t("adminDashboardPage.addProduct")}
                    </span>
                  </button>
                  <button className="button button--secondary" onClick={resetForm} type="button">
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            ) : null}

            <div className="admin-table">
              <div className="admin-table__head">
                <span>{t("adminDashboardPage.productTable.product")}</span>
                <span>{t("adminDashboardPage.productTable.category")}</span>
                <span>{t("adminDashboardPage.productTable.price")}</span>
                <span>{t("adminDashboardPage.productTable.stock")}</span>
                <span>{t("adminDashboardPage.productTable.actions")}</span>
              </div>

              {products.map((product) => (
                <article className="admin-table__row" key={product._id}>
                  <div className="admin-product">
                    <img alt={product.name} src={getProductImage(product)} />
                    <div>
                      <strong>{product.name}</strong>
                      <small>{product.description}</small>
                    </div>
                  </div>
                  <span>{product.category}</span>
                  <strong>{formatCurrency(product.price)}</strong>
                  <span>{product.stock}</span>
                  <div className="admin-row__actions">
                    <button className="icon-button" onClick={() => handleEdit(product)} type="button">
                      <MdEdit size={18} />
                    </button>
                    <button
                      className="icon-button icon-button--danger"
                      onClick={() => handleDelete(product._id)}
                      type="button"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-table">
            <div className="admin-table__head">
              <span>{t("adminDashboardPage.ordersTable.customer")}</span>
              <span>{t("adminDashboardPage.ordersTable.address")}</span>
              <span>{t("adminDashboardPage.ordersTable.total")}</span>
              <span>{t("adminDashboardPage.ordersTable.status")}</span>
              <span>{t("adminDashboardPage.ordersTable.update")}</span>
            </div>

            {orders.map((order) => (
              <article className="admin-table__row" key={order._id}>
                <span>{order.user?.name || t("adminDashboardPage.unknownCustomer")}</span>
                <span>{order.address}</span>
                <strong>{formatCurrency(order.total)}</strong>
                <span className={`status-pill status-pill--${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
                <select
                  onChange={(event) => handleStatusChange(order._id, event.target.value)}
                  value={order.status}
                >
                  <option value="pending">{getStatusLabel("pending")}</option>
                  <option value="confirmed">{getStatusLabel("confirmed")}</option>
                  <option value="delivered">{getStatusLabel("delivered")}</option>
                  <option value="cancelled">{getStatusLabel("cancelled")}</option>
                </select>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
