import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/formatters";

export default function OrderPage() {
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
      toast.error("السلة فارغة حاليًا.");
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
      toast.success("تم تأكيد الطلب بنجاح");
      navigate("/");
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر تأكيد الطلب حاليًا."
      );
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
          <span className="eyebrow">إتمام الطلب</span>
          <h1>أكمل بيانات الشحن وراجع الملخص النهائي</h1>
        </div>

        <div className="order-layout__grid">
          <form className="order-form" onSubmit={handleSubmit}>
            <label>
              عنوان الشحن
              <textarea
                minLength={10}
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    address: event.target.value,
                  }))
                }
                placeholder="اكتب العنوان بالتفصيل"
                required
                rows={5}
                value={form.address}
              />
            </label>

            <label>
              رقم الهاتف
              <input
                onChange={(event) =>
                  setForm((currentValue) => ({
                    ...currentValue,
                    phone: event.target.value,
                  }))
                }
                placeholder="+20 100 000 0000"
                required
                type="tel"
                value={form.phone}
              />
            </label>

            <button className="button button--primary button--large" disabled={loading} type="submit">
              {loading ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
            </button>
          </form>

          <aside className="summary-card">
            <h2>ملخص السلة</h2>
            <div className="summary-card__rows">
              {cart.map((item) => (
                <div key={item._id}>
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="summary-card__total">
              <span>الإجمالي</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
