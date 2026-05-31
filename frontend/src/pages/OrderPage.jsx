import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdLocalShipping } from "react-icons/md";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

export default function OrderPage() {
  const { t }      = useTranslation();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { cart, clearCart, total } = useCart();

  const [form, setForm]       = useState({ address: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  /* Redirect if not authenticated */
  useEffect(() => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/order");
      navigate("/login");
    }
  }, [navigate, user]);

  /* Guard against empty cart reaching this page */
  useEffect(() => {
    if (user && cart.length === 0) navigate("/cart");
  }, [cart.length, navigate, user]);

  const validate = () => {
    const e = {};
    if (form.address.trim().length < 10)
      e.address = "Please enter a full shipping address (at least 10 characters).";
    if (!form.phone.trim())
      e.phone = "Please enter a phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await api.post("/orders", {
        address: form.address.trim(),
        phone: form.phone.trim(),
        items: cart.map((item) => ({ product: item._id, quantity: item.quantity })),
      });
      clearCart();
      toast.success(t("orderPage.success"));
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || t("orderPage.error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page">
      
      <section className="container section order-layout">
        <div className="order-layout__grid">
          {/* ── Shipping form ── */}
          <form
            className="order-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Shipping details"
          >
            <label htmlFor="ord-address">
              {t("orderPage.addressLabel")}
              <textarea
                id="ord-address"
                aria-required="true"
                aria-invalid={!!errors.address}
                aria-describedby={errors.address ? "addr-err" : undefined}
                minLength={10}
                onChange={handleChange("address")}
                placeholder={t("orderPage.addressPlaceholder")}
                required
                rows={5}
                value={form.address}
              />
              {errors.address && (
                <span
                  id="addr-err"
                  role="alert"
                  style={{ color: "var(--danger)", fontSize: "0.84rem", fontWeight: 400 }}
                >
                  {errors.address}
                </span>
              )}
            </label>

            <label htmlFor="ord-phone">
              {t("orderPage.phoneLabel")}
              <input
                id="ord-phone"
                aria-required="true"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-err" : undefined}
                inputMode="tel"
                onChange={handleChange("phone")}
                placeholder={t("orderPage.phonePlaceholder")}
                required
                type="tel"
                value={form.phone}
              />
              {errors.phone && (
                <span
                  id="phone-err"
                  role="alert"
                  style={{ color: "var(--danger)", fontSize: "0.84rem", fontWeight: 400 }}
                >
                  {errors.phone}
                </span>
              )}
            </label>

            <button
              className="button button--primary button--large"
              disabled={loading}
              type="submit"
              style={{ width: "100%"  , marginTop: "30px"}}
              aria-busy={loading}
            >
              <MdLocalShipping size={18} aria-hidden="true" />
              {loading ? t("orderPage.loadingButton") : t("orderPage.submitButton")}
            </button>
          </form>

          {/* ── Order summary ── */}
          <aside className="summary-card" aria-label={t("orderPage.summaryTitle")}>
            <h2>{t("orderPage.summaryTitle")}</h2>
            <div className="summary-card__rows" role="list">
              {cart.map((item) => (
                <div key={item._id} role="listitem">
                  <span style={{ fontSize: "0.90rem" }}>
                    {t("orderPage.itemSummary", { name: item.name, quantity: item.quantity })}
                  </span>
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