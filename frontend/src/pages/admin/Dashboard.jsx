import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  MdDashboard, MdInventory, MdShoppingCart, MdAdd,
  MdEdit, MdDelete, MdClose, MdSave, MdPending,
  MdAttachMoney, MdCloudUpload, MdImage
} from "react-icons/md";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", price: "",
    category: "", stock: "", image: "", images: [],
  });

  useEffect(() => { fetchProducts(); fetchOrders(); }, []);

 const fetchProducts = async () => {
  const res = await api.get("/products");
  setProducts(res.data.data?.data || res.data.data || res.data);
};

const fetchOrders = async () => {
  const res = await api.get("/orders");
  setOrders(res.data.data || res.data);
};

  // رفع الصورة الرئيسية
  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image: res.data.url }));
      toast.success("تم رفع الصورة الرئيسية ✅");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  // رفع صور إضافية
  const handleExtraImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      const res = await api.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, ...res.data.urls] }));
      toast.success(`تم رفع ${res.data.urls.length} صورة ✅`);
    } catch {
      toast.error("فشل رفع الصور");
    } finally {
      setUploading(false);
    }
  };

  const removeExtraImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, form);
        toast.success("تم تعديل المنتج ✅");
      } else {
        await api.post("/products", form);
        toast.success("تم إضافة المنتج ✅");
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "حصل خطأ");
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
      images: product.images || [],
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("متأكد إنك عايز تحذف المنتج؟")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("تم الحذف ✅");
      fetchProducts();
    } catch {
      toast.error("حصل خطأ في الحذف");
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success("تم تحديث الحالة ✅");
      fetchOrders();
    } catch {
      toast.error("حصل خطأ");
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "", stock: "", image: "", images: [] });
    setEditProduct(null);
    setShowForm(false);
  };

  const statusColor = { pending: "#f59e0b", confirmed: "#3b82f6", delivered: "#10b981", cancelled: "#ef4444" };
  const statusLabel = { pending: "قيد الانتظار", confirmed: "مؤكد", delivered: "تم التوصيل", cancelled: "ملغي" };

  return (
    <>
      <style>{`
        .dashboard { padding: 2rem; direction: rtl; font-family: Arial; background: #f8f9fa; min-height: 100vh; }
        .dash-title { font-size: 1.8rem; font-weight: 800; color: #0077b6; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.7rem; }

        .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: linear-gradient(135deg, #0077b6, #023e8a); color: white; padding: 1.5rem; border-radius: 16px; text-align: center; }
        .stat-card h3 { font-size: 2rem; margin: 0.5rem 0 0; }
        .stat-card p { opacity: 0.8; margin: 0; }

        .dash-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .dash-tab { padding: 0.7rem 1.5rem; border: 2px solid #0077b6; border-radius: 8px; background: white; color: #0077b6; cursor: pointer; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
        .dash-tab.active { background: #0077b6; color: white; }

        .add-btn { background: #0077b6; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
        .cancel-btn { background: #ef4444; color: white; border: none; padding: 0.7rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }

        /* Form */
        .product-form { background: white; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .form-input { padding: 0.8rem; border-radius: 8px; border: 1.5px solid #dee2e6; font-size: 1rem; width: 100%; box-sizing: border-box; outline: none; transition: border 0.2s; }
        .form-input:focus { border-color: #0077b6; }
        .form-label { font-weight: 700; color: #212529; margin-bottom: 0.4rem; display: block; font-size: 0.9rem; }
        .span-2 { grid-column: span 2; }

        /* Upload Areas */
        .upload-area {
          border: 2px dashed #0077b6; border-radius: 12px;
          padding: 1.5rem; text-align: center; cursor: pointer;
          background: #f0f9ff; transition: background 0.2s;
          position: relative;
        }
        .upload-area:hover { background: #e0f2fe; }
        .upload-area input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
        .upload-area p { color: #0077b6; font-weight: 600; margin: 0.5rem 0 0; font-size: 0.9rem; }
        .upload-area small { color: #6c757d; }

        /* Image Previews */
        .main-img-preview { position: relative; margin-top: 0.8rem; }
        .main-img-preview img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; border: 2px solid #0077b6; }
        .main-img-label { position: absolute; bottom: 0.5rem; right: 0.5rem; background: #0077b6; color: white; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; }

        .extra-imgs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.7rem; margin-top: 0.8rem; }
        .extra-img-item { position: relative; }
        .extra-img-item img { width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1.5px solid #dee2e6; }
        .extra-img-remove {
          position: absolute; top: -8px; left: -8px;
          background: #ef4444; color: white; border: none;
          width: 22px; height: 22px; border-radius: 50%;
          cursor: pointer; font-size: 0.8rem;
          display: flex; align-items: center; justify-content: center;
        }

        /* Table */
        .dash-table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .dash-table th { background: #0077b6; color: white; padding: 1rem; text-align: right; }
        .dash-table td { padding: 0.8rem 1rem; border-bottom: 1px solid #f1f3f5; }
        .dash-table tr:hover td { background: #f8f9fa; }
        .product-thumb { width: 55px; height: 55px; object-fit: cover; border-radius: 8px; border: 1.5px solid #dee2e6; }
        .edit-btn { background: #f59e0b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; margin-left: 0.4rem; display: inline-flex; align-items: center; gap: 0.3rem; }
        .delete-btn { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; }
        .status-badge { color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.82rem; font-weight: 600; }
        .status-select { padding: 0.4rem; border-radius: 6px; border: 1.5px solid #dee2e6; }

        @media (max-width: 768px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
          .dashboard { padding: 1rem; }
        }
      `}</style>

      <div className="dashboard">
        <h2 className="dash-title"><MdDashboard size={30} /> لوحة تحكم الأدمن</h2>

        {/* Stats */}
        <div className="dash-stats">
          <div className="stat-card"><MdInventory size={28} /><h3>{products.length}</h3><p>المنتجات</p></div>
          <div className="stat-card"><MdShoppingCart size={28} /><h3>{orders.length}</h3><p>الطلبات</p></div>
          <div className="stat-card"><MdPending size={28} /><h3>{orders.filter(o => o.status === "pending").length}</h3><p>طلبات جديدة</p></div>
          <div className="stat-card"><MdAttachMoney size={28} /><h3>{orders.reduce((s, o) => s + o.total, 0)}</h3><p>إجمالي المبيعات</p></div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
            <MdInventory size={18} /> المنتجات
          </button>
          <button className={`dash-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
            <MdShoppingCart size={18} /> الطلبات
          </button>
        </div>

        {activeTab === "products" && (
          <div>
<button className="add-btn" onClick={() => {
  if (showForm) {
    resetForm();
  } else {
    setEditProduct(null);
    setForm({ name: "", description: "", price: "", category: "", stock: "", image: "", images: [] });
    setShowForm(true);
  }
}}>              {showForm ? <><MdClose size={18} /> إلغاء</> : <><MdAdd size={18} /> إضافة منتج جديد</>}
            </button>

            {/* Form */}
            {showForm && (
              <div className="product-form">
                <h3 style={{ marginBottom: "1.5rem", color: "#212529" }}>
                  {editProduct ? "✏️ تعديل المنتج" : "➕ إضافة منتج جديد"}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div>
                      <label className="form-label">اسم المنتج</label>
                      <input className="form-input" placeholder="مثلاً: سماعة طبية" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">الفئة</label>
                      <input className="form-input" placeholder="مثلاً: أجهزة قياس" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">السعر (جنيه)</label>
                      <input className="form-input" type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div>
                      <label className="form-label">الكمية في المخزن</label>
                      <input className="form-input" type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                    </div>
                    <div className="span-2">
                      <label className="form-label">الوصف</label>
                      <textarea className="form-input" placeholder="وصف المنتج..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ height: "90px", resize: "vertical" }} required />
                    </div>

                    {/* Main Image Upload */}
                    <div>
                      <label className="form-label"><MdImage size={16} /> الصورة الرئيسية</label>
                      <div className="upload-area">
                        <input type="file" accept="image/*" onChange={handleMainImageUpload} />
                        <MdCloudUpload size={36} color="#0077b6" />
                        <p>اضغط لاختيار الصورة الرئيسية</p>
                        <small>JPG, PNG, WEBP - حد أقصى 5MB</small>
                      </div>
                      {form.image && (
                        <div className="main-img-preview">
                          <img src={form.image} alt="main" />
                          <span className="main-img-label">الصورة الرئيسية</span>
                        </div>
                      )}
                    </div>

                    {/* Extra Images Upload */}
                    <div>
                      <label className="form-label"><MdImage size={16} /> صور إضافية (حد أقصى 5)</label>
                      <div className="upload-area">
                        <input type="file" accept="image/*" multiple onChange={handleExtraImagesUpload} disabled={form.images.length >= 5} />
                        <MdCloudUpload size={36} color="#0077b6" />
                        <p>اضغط لاختيار صور إضافية</p>
                        <small>يمكنك اختيار أكثر من صورة في نفس الوقت</small>
                      </div>
                      {form.images.length > 0 && (
                        <div className="extra-imgs-grid">
                          {form.images.map((img, i) => (
                            <div key={i} className="extra-img-item">
                              <img src={img} alt={`extra-${i}`} />
                              <button type="button" className="extra-img-remove" onClick={() => removeExtraImage(i)}>
                                <MdClose size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {uploading && <p style={{ color: "#0077b6", textAlign: "center" }}>⏳ جاري رفع الصور...</p>}

                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button type="submit" className="add-btn" disabled={uploading}>
                      <MdSave size={18} /> {editProduct ? "حفظ التعديلات" : "إضافة المنتج"}
                    </button>
                    <button type="button" className="cancel-btn" onClick={resetForm}>
                      <MdClose size={18} /> إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <table className="dash-table">
              <thead>
                <tr>
                  <th>الصورة</th><th>الاسم</th><th>الفئة</th>
                  <th>السعر</th><th>المخزن</th><th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td><img src={p.image} alt={p.name} className="product-thumb" /></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category}</td>
                    <td style={{ color: "#0077b6", fontWeight: 700 }}>{p.price} ج</td>
                    <td><span style={{ color: p.stock === 0 ? "#ef4444" : "#10b981", fontWeight: 600 }}>{p.stock === 0 ? "نفد" : p.stock}</span></td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(p)}><MdEdit size={15} /> تعديل</button>
                      <button className="delete-btn" onClick={() => handleDelete(p._id)}><MdDelete size={15} /> حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <table className="dash-table">
            <thead>
              <tr><th>العميل</th><th>العنوان</th><th>الإجمالي</th><th>الحالة</th><th>تغيير الحالة</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.user?.name || "مجهول"}</td>
                  <td>{order.address}</td>
                  <td style={{ fontWeight: 700, color: "#0077b6" }}>{order.total} ج</td>
                  <td><span className="status-badge" style={{ background: statusColor[order.status] }}>{statusLabel[order.status]}</span></td>
                  <td>
                    <select className="status-select" value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">مؤكد</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}