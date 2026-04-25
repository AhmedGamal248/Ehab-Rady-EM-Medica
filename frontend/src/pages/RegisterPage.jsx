import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { cartCount } = useCart();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const introPoints = t("registerPage.introPoints", { returnObjects: true });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await api.post("/users/register", form);
      const { token, user } = response.data?.data || response.data;

      login(user, token);
      toast.success(t("registerPage.success"));

      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo);
        return;
      }

      navigate(cartCount > 0 ? "/cart" : "/");
    } catch {
      toast.error(t("registerPage.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-page__container">
        <section className="auth-card auth-card--accent">
          <span className="eyebrow eyebrow--solid">{t("registerPage.introEyebrow")}</span>
          <h1>{t("registerPage.introTitle")}</h1>
          <p>{t("registerPage.introDescription")}</p>
          <ul className="auth-card__list">
            {introPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="auth-card">
          <div className="section-heading section-heading--compact">
            <span className="eyebrow">{t("registerPage.sectionEyebrow")}</span>
            <h2>{t("registerPage.sectionTitle")}</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              {t("registerPage.nameLabel")}
              <input
                autoComplete="name"
                minLength={2}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    name: event.target.value,
                  }))
                }
                placeholder={t("registerPage.namePlaceholder")}
                required
                type="text"
                value={form.name}
              />
            </label>

            <label>
              {t("registerPage.emailLabel")}
              <input
                autoComplete="email"
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    email: event.target.value,
                  }))
                }
                placeholder={t("registerPage.emailPlaceholder")}
                required
                type="email"
                value={form.email}
              />
            </label>

            <label>
              {t("registerPage.passwordLabel")}
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    password: event.target.value,
                  }))
                }
                placeholder={t("registerPage.passwordPlaceholder")}
                required
                type="password"
                value={form.password}
              />
            </label>

            <button
              className="button button--primary button--large"
              disabled={loading}
              type="submit"
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
