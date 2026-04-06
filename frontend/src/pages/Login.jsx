import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/users/login", form);
      const { token, user } = res.data.data || res.data;
      login(user, token);
      toast.success("أهلاً بيك! ✅");

      // لو كان رايح لصفحة معينة قبل الـ login
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "الإيميل أو الباسورد غلط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>تسجيل الدخول</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="الإيميل" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} required />
          <input placeholder="الباسورد" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} required />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>
        <p>مش عندك حساب؟ <Link to="/register">سجل دلوقتي</Link></p>
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