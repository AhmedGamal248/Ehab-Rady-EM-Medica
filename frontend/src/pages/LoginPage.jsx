import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const introPoints = t("loginPage.introPoints", { returnObjects: true });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await api.post("/users/login", form);
      const { token, user } = response.data?.data || response.data;

      login(user, token);
      toast.success(t("loginPage.success"));

      const redirectTo = localStorage.getItem("redirectAfterLogin");
      if (redirectTo) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectTo);
      } else {
        navigate("/");
      }
    } catch {
      toast.error(t("loginPage.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="container auth-page__container">

        <section className="auth-card">
          <div className="section-heading section-heading--compact">
            <span className="eyebrow">{t("loginPage.sectionEyebrow")}</span>
            <h2>{t("loginPage.sectionTitle")}</h2>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              {t("loginPage.emailLabel")}
              <input
                autoComplete="email"
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    email: event.target.value,
                  }))
                }
                placeholder={t("loginPage.emailPlaceholder")}
                required
                type="email"
                value={form.email}
              />
            </label>

            <label>
              {t("loginPage.passwordLabel")}
              <input
                autoComplete="current-password"
                minLength={8}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    password: event.target.value,
                  }))
                }
                placeholder={t("loginPage.passwordPlaceholder")}
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
              {loading ? t("loginPage.loadingButton") : t("loginPage.submitButton")}
            </button>
          </form>

          <p className="auth-card__footer">
            {t("loginPage.footerText")} <Link to="/register">{t("loginPage.footerLink")}</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
