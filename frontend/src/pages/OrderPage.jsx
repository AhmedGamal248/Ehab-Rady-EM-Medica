import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

export default function OrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, total } = useCart();
  const [form, setForm] = useState({ address: "", phone: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/order");
      navigate("/login");
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      toast.error(t("orderPage.emptyCartError"));
      return;
    }

    try {
      setLoading(true);
      await api.post("/orders", {
        address: form.address,
        phone: form.phone,
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      toast.success(t("orderPage.success"));
      navigate("/");
    } catch {
      toast.error(t("orderPage.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <section className="container section order-layout">
        <div className="section-heading section-heading--compact">
          <span className="eyebrow">{t("orderPage.eyebrow")}</span>
          <h1>{t("orderPage.title")}</h1>
        </div>

        <div className="order-layout__grid">
          <form className="order-form" onSubmit={handleSubmit}>
            <label>
              {t("orderPage.addressLabel")}
              <textarea
                minLength={10}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    address: event.target.value,
                  }))
                }
                placeholder={t("orderPage.addressPlaceholder")}
                required
                rows={5}
                value={form.address}
              />
            </label>

            <label>
              {t("orderPage.phoneLabel")}
              <input
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    phone: event.target.value,
                  }))
                }
                placeholder={t("orderPage.phonePlaceholder")}
                required
                type="tel"
                value={form.phone}
              />
            </label>

            <button
              className="button button--primary button--large"
              disabled={loading}
              type="submit"
            >
              {loading ? t("orderPage.loadingButton") : t("orderPage.submitButton")}
            </button>
          </form>

          <aside className="summary-card">
            <h2>{t("orderPage.summaryTitle")}</h2>
            <div className="summary-card__rows">
              {cart.map((item) => (
                <div key={item._id}>
                  <span>{t("orderPage.itemSummary", { name: item.name, quantity: item.quantity })}</span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="summary-card__total">
              <span>{t("common.total")}</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
