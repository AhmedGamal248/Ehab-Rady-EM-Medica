import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await api.post("/users/login", form);
      const { token, user } = response.data?.data || response.data;

      login(user, token);
      toast.success("تم تسجيل الدخول بنجاح");

      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo);
      } else {
        navigate("/");
      }
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر تسجيل الدخول بهذه البيانات."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-page__container">
        <section className="auth-card auth-card--accent">
          <span className="eyebrow eyebrow--solid">أهلاً بك مجددًا</span>
          <h1>تسجيل دخول سريع وواضح</h1>
          <p>
            أبقينا الصفحة بسيطة ومريحة بصريًا حتى تتم عملية الدخول بسرعة وبدون
            تشتيت.
          </p>
          <ul className="auth-card__list">
            <li>ألوان متباينة وواضحة</li>
            <li>حقول أكبر وأسهل على الجوال</li>
            <li>رسائل خطأ ونجاح مباشرة</li>
          </ul>
        </section>

        <section className="auth-card">
          <div className="section-heading section-heading--compact">
            <span className="eyebrow">تسجيل الدخول</span>
            <h2>ابدأ من هنا</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                minLength={8}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    password: event.target.value,
                  }))
                }
                placeholder="********"
                required
                type="password"
                value={form.password}
              />
            </label>

            <button className="button button--primary button--large" disabled={loading} type="submit">
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <p className="auth-card__footer">
            لا تملك حسابًا؟ <Link to="/register">أنشئ حسابًا جديدًا</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
