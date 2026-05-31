import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function RegisterPage() {
  const { t }       = useTranslation();
  const navigate    = useNavigate();
  const { login }   = useAuth();
  const { cartCount } = useCart();

  const [form, setForm]         = useState({ name: "", email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [fieldError, setFieldError] = useState("");

  const handleChange = (field) => (e) => {
    setFieldError("");
    setForm((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setFieldError(t("registerPage.passwordPlaceholder"));
      return;
    }

    try {
      setLoading(true);
      setFieldError("");
      const res = await api.post("/users/register", form);
      const { token, user } = res.data?.data || res.data;

      login(user, token);
      toast.success(t("registerPage.success"));

      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
        return;
      }
      navigate(cartCount > 0 ? "/cart" : "/");
    } catch (err) {
      const msg = err.response?.data?.message || t("registerPage.error");
      setFieldError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-page__container">
        <section className="auth-card" aria-label="Registration form">
          <div className="section-heading section-heading--compact">
            <span style={{fontSize: "2.78rem" ,textAlign: "center"}} className="eyebrow">{t("registerPage.sectionEyebrow")}</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="reg-name">
              {t("registerPage.nameLabel")}
              <input
                id="reg-name"
                autoComplete="name"
                minLength={2}
                onChange={handleChange("name")}
                placeholder={t("registerPage.namePlaceholder")}
                required
                type="text"
                value={form.name}
                aria-required="true"
              />
            </label>

            <label htmlFor="reg-email">
              {t("registerPage.emailLabel")}
              <input
                id="reg-email"
                autoComplete="email"
                inputMode="email"
                onChange={handleChange("email")}
                placeholder={t("registerPage.emailPlaceholder")}
                required
                type="email"
                value={form.email}
                aria-required="true"
              />
            </label>

            <label htmlFor="reg-password">
              {t("registerPage.passwordLabel")}
              <input
                id="reg-password"
                autoComplete="new-password"
                minLength={8}
                onChange={handleChange("password")}
                placeholder={t("registerPage.passwordPlaceholder")}
                required
                type="password"
                value={form.password}
                aria-required="true"
                aria-describedby="password-hint"
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
              {loading ? t("registerPage.loadingButton") : t("registerPage.submitButton")}
            </button>
          </form>

          <p className="auth-card__footer">
            {t("registerPage.footerText")}{" "}
            <Link to="/login">{t("registerPage.footerLink")}</Link>
          </p>
        </section>
      </div>
    </div>
  );
}