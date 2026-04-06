import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MdDelete, MdShoppingCart, MdArrowBack, MdLocalShipping } from "react-icons/md";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      // احفظ إن المستخدم كان رايح للـ order
      localStorage.setItem("redirectAfterLogin", "/order");
      navigate("/login");
    } else {
      navigate("/order");
    }
  };

  if (cart.length === 0)
    return (
      <div style={styles.empty}>
        <MdShoppingCart size={80} color="#dee2e6" />
        <h2>السلة فاضية</h2>
        <p style={{ color: "#6c757d" }}>لم تضف أي منتجات بعد</p>
        <button onClick={() => navigate("/products")} style={styles.shopBtn}>
          تصفح المنتجات
        </button>
      </div>
    );

  return (
    <div style={{ direction: "rtl", fontFamily: "Arial", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={styles.container}>
        <h2 style={styles.title}><MdShoppingCart size={28} /> سلة التسوق</h2>

        <div style={styles.layout}>
          {/* Items */}
          <div style={styles.items}>
            {cart.map((item) => (
              <div key={item._id} style={styles.item}>
                <img src={item.image} alt={item.name} style={styles.img} />
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <span style={styles.itemCategory}>{item.category}</span>
                  <p style={styles.itemPrice}>{item.price} جنيه</p>
                </div>
                <div style={styles.controls}>
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qty}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={styles.qtyBtn}>+</button>
                </div>
                <div style={styles.itemTotal}>
                  <strong>{item.price * item.quantity} جنيه</strong>
                  <button onClick={() => removeFromCart(item._id)} style={styles.deleteBtn}>
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={styles.summary}>
            <h3 style={styles.summaryTitle}>ملخص الطلب</h3>
            <div style={styles.summaryRow}>
              <span>عدد المنتجات</span>
              <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>المجموع</span>
              <span>{total} جنيه</span>
            </div>
            <div style={styles.summaryRow}>
              <span><MdLocalShipping size={16} /> الشحن</span>
              <span style={{ color: "#10b981" }}>مجاني</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid #e9ecef", margin: "1rem 0" }} />
            <div style={{ ...styles.summaryRow, fontWeight: "800", fontSize: "1.2rem" }}>
              <span>الإجمالي</span>
              <span style={{ color: "#0077b6" }}>{total} جنيه</span>
            </div>
            <button onClick={handleCheckout} style={styles.orderBtn}>
              إتمام الطلب <MdArrowBack size={20} />
            </button>
            <button onClick={() => navigate("/products")} style={styles.continueBtn}>
              متابعة التسوق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  empty: { textAlign: "center", padding: "5rem 2rem", direction: "rtl" },
  shopBtn: { background: "#0077b6", color: "#fff", border: "none", padding: "0.8rem 2rem", borderRadius: "10px", cursor: "pointer", fontSize: "1rem", marginTop: "1rem" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  title: { display: "flex", alignItems: "center", gap: "0.7rem", fontSize: "1.8rem", fontWeight: "800", color: "#212529", marginBottom: "2rem" },
  layout: { display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem", alignItems: "start" },
  items: { display: "flex", flexDirection: "column", gap: "1rem" },
  item: { background: "#fff", borderRadius: "16px", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  img: { width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px" },
  itemInfo: { flex: 1 },
  itemName: { margin: "0 0 0.3rem", fontWeight: "700", color: "#212529" },
  itemCategory: { background: "#e0f2fe", color: "#0077b6", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem" },
  itemPrice: { margin: "0.5rem 0 0", color: "#6c757d" },
  controls: { display: "flex", alignItems: "center", gap: "0.8rem", background: "#f8f9fa", padding: "0.4rem 0.8rem", borderRadius: "10px" },
  qtyBtn: { background: "#0077b6", color: "#fff", border: "none", width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" },
  qty: { fontWeight: "700", minWidth: "20px", textAlign: "center" },
  itemTotal: { textAlign: "center" },
  deleteBtn: { background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "block", margin: "0.5rem auto 0" },
  summary: { background: "#fff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", position: "sticky", top: "80px" },
  summaryTitle: { fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.5rem", color: "#212529" },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: "0.8rem", color: "#6c757d" },
  orderBtn: { width: "100%", background: "#0077b6", color: "#fff", border: "none", padding: "1rem", borderRadius: "10px", cursor: "pointer", fontSize: "1rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" },
  continueBtn: { width: "100%", background: "#f8f9fa", color: "#0077b6", border: "2px solid #0077b6", padding: "0.8rem", borderRadius: "10px", cursor: "pointer", fontSize: "1rem", fontWeight: "700", marginTop: "0.8rem" },
};