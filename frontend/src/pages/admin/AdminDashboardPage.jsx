import { useEffect, useMemo, useState } from "react";
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

export default function AdminDashboardPage() {
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
        label: "المنتجات",
        value: products.length,
        icon: <MdInventory2 size={24} />,
      },
      {
        label: "الطلبات",
        value: orders.length,
        icon: <MdLocalMall size={24} />,
      },
      {
        label: "طلبات جديدة",
        value: orders.filter((order) => order.status === "pending").length,
        icon: <MdPendingActions size={24} />,
      },
      {
        label: "إجمالي المبيعات",
        value: formatCurrency(
          orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
        ),
        icon: <MdOutlinePayments size={24} />,
      },
    ],
    [orders, products.length]
  );

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    const response = await api.get("/products");
    setProducts(getProductsPayload(response));
  };

  const fetchOrders = async () => {
    const response = await api.get("/orders");
    setOrders(getOrdersPayload(response));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditProduct(null);
    setShowForm(false);
  };

  const handleMainImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      const response = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((currentValue) => ({
        ...currentValue,
        image: response.data?.data?.url || response.data?.url || "",
      }));
      toast.success("تم رفع الصورة الرئيسية");
    } catch {
      toast.error("تعذر رفع الصورة الرئيسية");
    } finally {
      setUploading(false);
    }
  };

  const handleExtraImagesUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("images", file));
      const response = await api.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const nextUrls = response.data?.data?.urls || response.data?.urls || [];

      setForm((currentValue) => ({
        ...currentValue,
        images: [...currentValue.images, ...nextUrls].slice(0, 5),
      }));
      toast.success("تم رفع الصور الإضافية");
    } catch {
      toast.error("تعذر رفع الصور الإضافية");
    } finally {
      setUploading(false);
    }
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
        toast.success("تم تحديث المنتج");
      } else {
        await api.post("/products", payload);
        toast.success("تمت إضافة المنتج");
      }

      resetForm();
      fetchProducts();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "تعذر حفظ المنتج.");
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
    if (!window.confirm("هل تريد حذف هذا المنتج؟")) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success("تم حذف المنتج");
      fetchProducts();
    } catch {
      toast.error("تعذر حذف المنتج");
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success("تم تحديث حالة الطلب");
      fetchOrders();
    } catch {
      toast.error("تعذر تحديث حالة الطلب");
    }
  };

  return (
    <div className="page">
      <section className="container section admin-page">
        <div className="section-heading section-heading--compact">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1>مراجعة المنتجات والطلبات من مكان واحد</h1>
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
            المنتجات
          </button>
          <button
            className={activeTab === "orders" ? "is-active" : ""}
            onClick={() => setActiveTab("orders")}
            type="button"
          >
            الطلبات
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
                <span>{showForm ? "إغلاق النموذج" : "إضافة منتج"}</span>
              </button>
            </div>

            {showForm ? (
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="admin-form__grid">
                  <label>
                    اسم المنتج
                    <input
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
                    الفئة
                    <input
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
                    السعر
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
                    المخزون
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
                    الوصف
                    <textarea
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
                    <span>الصورة الرئيسية</span>
                    <input accept="image/*" onChange={handleMainImageUpload} type="file" />
                    <div>
                      <MdCloudUpload size={20} />
                      <small>اختر صورة واضحة بحد أقصى 5MB</small>
                    </div>
                    {form.image ? (
                      <img alt="Main product" src={form.image} />
                    ) : null}
                  </label>

                  <label className="upload-card">
                    <span>صور إضافية</span>
                    <input
                      accept="image/*"
                      multiple
                      onChange={handleExtraImagesUpload}
                      type="file"
                    />
                    <div>
                      <MdCloudUpload size={20} />
                      <small>يمكنك إضافة حتى خمس صور</small>
                    </div>
                    {form.images.length > 0 ? (
                      <div className="upload-card__grid">
                        {form.images.map((image, index) => (
                          <div key={`${image}-${index}`} className="upload-card__thumb">
                            <img alt={`Extra ${index + 1}`} src={image} />
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
                              حذف
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
                    <span>{editProduct ? "حفظ التعديلات" : "إضافة المنتج"}</span>
                  </button>
                  <button className="button button--secondary" onClick={resetForm} type="button">
                    إلغاء
                  </button>
                </div>
              </form>
            ) : null}

            <div className="admin-table">
              <div className="admin-table__head">
                <span>المنتج</span>
                <span>الفئة</span>
                <span>السعر</span>
                <span>المخزون</span>
                <span>إجراءات</span>
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
                    <button className="icon-button icon-button--danger" onClick={() => handleDelete(product._id)} type="button">
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
              <span>العميل</span>
              <span>العنوان</span>
              <span>الإجمالي</span>
              <span>الحالة</span>
              <span>التحديث</span>
            </div>

            {orders.map((order) => (
              <article className="admin-table__row" key={order._id}>
                <span>{order.user?.name || "غير معروف"}</span>
                <span>{order.address}</span>
                <strong>{formatCurrency(order.total)}</strong>
                <span className={`status-pill status-pill--${order.status}`}>
                  {order.status}
                </span>
                <select
                  onChange={(event) => handleStatusChange(order._id, event.target.value)}
                  value={order.status}
                >
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
