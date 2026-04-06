import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { cartCount } = useCart();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await api.post("/users/register", form);
      const { token, user } = response.data?.data || response.data;

      login(user, token);
      toast.success("تم إنشاء الحساب بنجاح");

      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo);
        return;
      }

      navigate(cartCount > 0 ? "/cart" : "/");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر إنشاء الحساب حاليًا."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-page__container">
        <section className="auth-card auth-card--accent">
          <span className="eyebrow eyebrow--solid">حساب جديد</span>
          <h1>واجهة تسجيل أنظف وأكثر وضوحًا</h1>
          <p>
            حسّنا الصفحة لتكون مناسبة للمستخدمين على الهواتف والشاشات الكبيرة مع
            تباين قوي ونصوص أوضح.
          </p>
          <ul className="auth-card__list">
            <li>حقول أقصر وأسهل في الفهم</li>
            <li>تجربة مناسبة للوضعين الفاتح والداكن</li>
            <li>توجيه تلقائي ذكي بعد التسجيل</li>
          </ul>
        </section>

        <section className="auth-card">
          <div className="section-heading section-heading--compact">
            <span className="eyebrow">إنشاء حساب</span>
            <h2>ابدأ الشراء بثقة</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              الاسم
              <input
                autoComplete="name"
                minLength={2}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    name: event.target.value,
                  }))
                }
                placeholder="الاسم الكامل"
                required
                type="text"
                value={form.name}
              />
            </label>

            <label>
              البريد الإلكتروني
              <input
                autoComplete="email"
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    email: event.target.value,
                  }))
                }
                placeholder="name@example.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label>
              كلمة المرور
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    password: event.target.value,
                  }))
                }
                placeholder="8 أحرف على الأقل"
                required
                type="password"
                value={form.password}
              />
            </label>

            <button className="button button--primary button--large" disabled={loading} type="submit">
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="auth-card__footer">
            لديك حساب بالفعل؟ <Link to="/login">سجل الدخول</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
