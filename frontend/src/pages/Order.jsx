import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Order() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", phone: "" });
  const [loading, setLoading] = useState(false);

  // لو مفيش user يروح للـ login
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  const handleOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("السلة فاضية!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("لازم تسجل دخول الأول");
        navigate("/login");
        return;
      }

      await api.post("/orders", {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: form.address,
        phone: form.phone,
        total,
      });

      clearCart();
      toast.success("تم تأكيد طلبك بنجاح 🎉");
      navigate("/");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        toast.error("انتهت الجلسة، سجل دخول تاني");
        navigate("/login");
      } else {
        toast.error(err.response?.data?.message || "حصل خطأ في تأكيد الطلب");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: "2rem", direction: "rtl", maxWidth: "600px", margin: "0 auto" }}>
      <h2>إتمام الطلب</h2>

      <div style={styles.summary}>
        <h3>ملخص الطلب</h3>
        {cart.map((item) => (
          <div key={item._id} style={styles.item}>
            <span>{item.name}</span>
            <span>x{item.quantity}</span>
            <span>{item.price * item.quantity} جنيه</span>
          </div>
        ))}
        <hr />
        <strong>الإجمالي: {total} جنيه</strong>
      </div>

      <form onSubmit={handleOrder}>
        <input
          placeholder="العنوان بالتفصيل"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={styles.input}
          required
        />
        <input
          placeholder="رقم الموبايل"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? "جاري التأكيد..." : "تأكيد الطلب 🎉"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  summary: { background: "#f8f9fa", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem" },
  item: { display: "flex", justifyContent: "space-between", padding: "0.5rem 0" },
  input: { width: "100%", padding: "0.8rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ddd", fontSize: "1rem", boxSizing: "border-box" },
  btn: { width: "100%", padding: "0.8rem", background: "#0077b6", color: "white", border: "none", borderRadius: "4px", fontSize: "1rem", cursor: "pointer" },
};