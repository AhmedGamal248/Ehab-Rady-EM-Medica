import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { MdDelete, MdLocalShipping, MdShoppingCart } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  formatCurrency,
  getProductImage,
  handleProductImageError,
} from "../utils/formatters";

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartCount, removeFromCart, total, updateQuantity } = useCart();

  const handleCheckout = () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/order");
      navigate("/login");
      return;
    }

    navigate("/order");
  };

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="container section">
          <div className="state-card">
            <MdShoppingCart size={42} />
            <h2>{t("cartPage.emptyTitle")}</h2>
            <p>{t("cartPage.emptyDescription")}</p>
            <button
              className="button button--primary"
              onClick={() => navigate("/products")}
              type="button"
            >
              {t("common.browseProducts")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--solid">{t("cartPage.heroEyebrow")}</span>
          <h1>{t("cartPage.heroTitle")}</h1>
          <p>{t("cartPage.heroDescription")}</p>
        </div>
      </section>

      <section className="container section cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item._id}>
              <img
                alt={item.name}
                onError={handleProductImageError}
                src={getProductImage(item)}
              />

              <div className="cart-item__info">
                <span className="eyebrow">{item.category}</span>
                <h2>{item.name}</h2>
                <p>{formatCurrency(item.price)}</p>
              </div>

              <div className="cart-item__actions">
                <div className="stepper">
                  <button
                    aria-label={t("cartPage.decreaseQuantity")}
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    aria-label={t("cartPage.increaseQuantity")}
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
                <button
                  aria-label={t("cartPage.removeItem")}
                  className="icon-button"
                  onClick={() => removeFromCart(item._id)}
                  type="button"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <h2>{t("cartPage.summaryTitle")}</h2>
          <div className="summary-card__rows">
            <div>
              <span>{t("cartPage.itemsCount")}</span>
              <strong>{cartCount}</strong>
            </div>
            <div>
              <span>{t("cartPage.subtotal")}</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div>
              <span>
                <MdLocalShipping size={16} />
                {t("common.shipping")}
              </span>
              <strong>{t("common.free")}</strong>
            </div>
          </div>

          <div className="summary-card__total">
            <span>{t("common.finalTotal")}</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <button
            className="button button--primary button--large"
            onClick={handleCheckout}
            type="button"
          >
            {t("cartPage.checkout")}
          </button>
          <button
            className="button button--secondary"
            onClick={() => navigate("/products")}
            type="button"
          >
            {t("common.continueShopping")}
          </button>
        </aside>
      </section>
    </div>
  );
}
