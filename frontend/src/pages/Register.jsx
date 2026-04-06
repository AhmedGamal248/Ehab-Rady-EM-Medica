import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/users/register", form);
     // بعد التسجيل بنجاح استبدل الجزء ده:
        const { token, user } = res.data.data || res.data;
        login(user, token);
        toast.success("تم التسجيل بنجاح ✅");

        const redirect = localStorage.getItem("redirectAfterLogin");
        if (redirect) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirect);
        } else if (cart.length > 0) {
          navigate("/cart");
        } else {
          navigate("/");
        }
      // لو كان في منتجات في السلة يروح للـ cart
      if (cart.length > 0) {
        navigate("/cart");
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "حصل خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>إنشاء حساب جديد</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} required />
          <input placeholder="الإيميل" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} required />
          <input placeholder="الباسورد" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} required />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>
        <p>عندك حساب؟ <Link to="/login">سجل دخول</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", direction: "rtl" },
  card: { background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" },
  input: { width: "100%", padding: "0.8rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ddd", fontSize: "1rem", boxSizing: "border-box" },
  btn: { width: "100%", padding: "0.8rem", background: "#0077b6", color: "white", border: "none", borderRadius: "4px", fontSize: "1rem", cursor: "pointer" },
};