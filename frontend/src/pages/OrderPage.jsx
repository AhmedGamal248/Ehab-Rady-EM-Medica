import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdCheckCircle, MdInfo, MdLocalShipping } from "react-icons/md";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

function getShippingCost(governorate) {
  if (!governorate) return 0;
  return ["Cairo", "Giza"].includes(governorate) ? 60 : 100;
}

function isValidEgyptianMobile(value) {
  const normalized = value.replace(/[\s-]/g, "");
  return /^(?:\+?20|0)?1[0125]\d{8}$/.test(normalized);
}

export default function OrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart, total } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    governorate: "",
    city: "",
    mobileNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const shippingCost = useMemo(
    () => getShippingCost(form.governorate),
    [form.governorate]
  );
  const finalTotal = total + shippingCost;

  useEffect(() => {
    if (!confirmedOrder && cart.length === 0) navigate("/cart");
  }, [cart.length, confirmedOrder, navigate]);

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = t("orderPage.fullNameRequired");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = t("orderPage.emailInvalid");
    }
    if (!form.governorate) nextErrors.governorate = t("orderPage.governorateRequired");
    if (!form.city.trim()) nextErrors.city = t("orderPage.cityRequired");
    if (!form.mobileNumber.trim()) {
      nextErrors.mobileNumber = t("orderPage.mobileRequired");
    } else if (!isValidEgyptianMobile(form.mobileNumber)) {
      nextErrors.mobileNumber = t("orderPage.mobileInvalid");
    }

    const overStockItem = cart.find((item) => item.quantity > (Number(item.stock) || 0));
    if (overStockItem) {
      nextErrors.cart = t("cartPage.stockExceeded");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setErrors((prev) => ({ ...prev, [field]: undefined, cart: undefined }));
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await api.post("/orders", {
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        mobileNumber: form.mobileNumber.trim(),
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity,
          color: item.selectedColor
            ? { name: item.selectedColor.name, hex: item.selectedColor.hex || "" }
            : undefined,
        })),
      });

      clearCart();
      setConfirmedOrder(response.data?.data || response.data);
      toast.success(t("orderPage.success"));
    } catch (err) {
      const msg = err.response?.data?.message || t("orderPage.error");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="page">
        <section className="container section">
          <div className="state-card">
            <MdCheckCircle size={46} />
            <h1>{t("orderPage.confirmationTitle")}</h1>
            <p>{t("orderPage.confirmationDescription")}</p>
            <strong>{formatCurrency(confirmedOrder.total)}</strong>
            <button
              className="button button--primary"
              onClick={() => navigate("/products")}
              type="button"
            >
              {t("common.continueShopping")}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="container section order-layout">
        <div className="order-layout__grid">
          <form
            className="order-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Checkout details"
          >
            <label htmlFor="ord-full-name">
              {t("orderPage.fullNameLabel")}
              <input
                id="ord-full-name"
                aria-required="true"
                aria-invalid={!!errors.fullName}
                onChange={handleChange("fullName")}
                placeholder={t("orderPage.fullNamePlaceholder")}
                required
                type="text"
                value={form.fullName}
              />
              {errors.fullName && <span className="field-error" role="alert">{errors.fullName}</span>}
            </label>

            <label htmlFor="ord-email">
              {t("orderPage.emailLabel")}
              <input
                id="ord-email"
                aria-invalid={!!errors.email}
                inputMode="email"
                onChange={handleChange("email")}
                placeholder={t("orderPage.emailPlaceholder")}
                type="email"
                value={form.email}
              />
              {errors.email && <span className="field-error" role="alert">{errors.email}</span>}
            </label>

            <label htmlFor="ord-governorate">
              {t("orderPage.governorateLabel")}
              <select
                id="ord-governorate"
                aria-required="true"
                aria-invalid={!!errors.governorate}
                onChange={handleChange("governorate")}
                required
                value={form.governorate}
              >
                <option value="">{t("orderPage.governoratePlaceholder")}</option>
                {GOVERNORATES.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
              {errors.governorate && <span className="field-error" role="alert">{errors.governorate}</span>}
            </label>

            <label htmlFor="ord-city">
              {t("orderPage.cityLabel")}
              <input
                id="ord-city"
                aria-required="true"
                aria-invalid={!!errors.city}
                onChange={handleChange("city")}
                placeholder={t("orderPage.cityPlaceholder")}
                required
                type="text"
                value={form.city}
              />
              {errors.city && <span className="field-error" role="alert">{errors.city}</span>}
            </label>

            <label htmlFor="ord-mobile">
              {t("orderPage.mobileLabel")}
              <input
                id="ord-mobile"
                aria-required="true"
                aria-invalid={!!errors.mobileNumber}
                inputMode="tel"
                onChange={handleChange("mobileNumber")}
                placeholder={t("orderPage.mobilePlaceholder")}
                required
                type="tel"
                value={form.mobileNumber}
              />
              {errors.mobileNumber && <span className="field-error" role="alert">{errors.mobileNumber}</span>}
            </label>

            <div className="checkout-notice">
              <MdInfo size={18} aria-hidden="true" />
              <span>{t("orderPage.deliveryNotice")}</span>
            </div>

            {errors.cart && <span className="field-error" role="alert">{errors.cart}</span>}

            <button
              className="button button--primary button--large"
              disabled={loading}
              type="submit"
              style={{ width: "100%", marginTop: "18px" }}
              aria-busy={loading}
            >
              <MdLocalShipping size={18} aria-hidden="true" />
              {loading ? t("orderPage.loadingButton") : t("orderPage.submitButton")}
            </button>
          </form>

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
              <div>
                <span>{t("cartPage.subtotal")}</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div>
                <span>{t("common.shipping")}</span>
                <strong>{shippingCost ? formatCurrency(shippingCost) : t("orderPage.selectGovernorate")}</strong>
              </div>
            </div>
            <div className="summary-card__total">
              <span>{t("common.finalTotal")}</span>
              <strong>{formatCurrency(finalTotal)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
