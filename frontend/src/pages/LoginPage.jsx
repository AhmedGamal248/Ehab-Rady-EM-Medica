import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { t }     = useTranslation();
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const handleChange = (field) => (e) => {
    setFieldError("");
    setForm((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setFieldError(t("loginPage.error"));
      return;
    }

    try {
      setLoading(true);
      setFieldError("");
      const res = await api.post("/users/login", form);
      const { token, user } = res.data?.data || res.data;

      login(user, token);
      toast.success(t("loginPage.success"));

      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (err) {
      const msg = err.response?.data?.message || t("loginPage.error");
      setFieldError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-page__container">
        <section className="auth-card" aria-label="Login form">
          <div className="section-heading section-heading--compact">
            <span style={{fontSize: "2.78rem"}} className="eyebrow">{t("loginPage.sectionEyebrow")}</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="login-email">
              {t("loginPage.emailLabel")}
              <input
                id="login-email"
                autoComplete="email"
                inputMode="email"
                onChange={handleChange("email")}
                placeholder={t("loginPage.emailPlaceholder")}
                required
                type="email"
                value={form.email}
                aria-required="true"
              />
            </label>

            <label htmlFor="login-password">
              {t("loginPage.passwordLabel")}
              <input
                id="login-password"
                autoComplete="current-password"
                minLength={8}
                onChange={handleChange("password")}
                placeholder={t("loginPage.passwordPlaceholder")}
                required
                type="password"
                value={form.password}
                aria-required="true"
              />
            </label>

            {fieldError && (
              <p
                role="alert"
                style={{
                  color: "var(--danger)",
                  fontSize: "0.88rem",
                  padding: "10px 14px",
                  background: "rgba(212,37,37,0.08)",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid rgba(212,37,37,0.2)",
                }}
              >
                {fieldError}
              </p>
            )}

            <button
              className="button button--primary button--large"
              disabled={loading}
              type="submit"
              style={{ width: "100%" }}
              aria-busy={loading}
            >
              {loading ? t("loginPage.loadingButton") : t("loginPage.submitButton")}
            </button>
          </form>

          <p className="auth-card__footer">
            {t("loginPage.footerText")}{" "}
            <Link to="/register">{t("loginPage.footerLink")}</Link>
          </p>
        </section>
      </div>
    </div>
  );
}