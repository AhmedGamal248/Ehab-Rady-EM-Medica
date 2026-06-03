import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdDelete, MdLocalShipping, MdShoppingCart } from "react-icons/md";
import { useCart } from "../context/CartContext";
import { getStockMessage } from "../utils/stockMessages";
import {
  formatCurrency,
  getProductImage,
  handleProductImageError,
} from "../utils/formatters";

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, cartCount, removeFromCart, total, updateQuantity } = useCart();

  const handleCheckout = () => {
    navigate("/order");
  };

  const handleUpdateQuantity = (lineKey, quantity) => {
    const result = updateQuantity(lineKey, quantity);
    if (!result?.ok) {
      toast.error(result.message || t("cartPage.stockExceeded"));
    }
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
    
      <section className="container section cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item.lineKey}>
              <img
                alt={item.name}
                onError={handleProductImageError}
                src={getProductImage(item)}
              />

              <div className="cart-item__info">
                <span className="eyebrow">{item.category}</span>
                <h2>{item.name}</h2>
                {item.selectedColor?.name && (
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                    {t("productDetailsPage.colors")}: {item.selectedColor.name}
                  </p>
                )}
                <p>{formatCurrency(item.price)}</p>
                <small>{getStockMessage(item.stock || 0, t)}</small>
              </div>

              <div className="cart-item__actions">
                <div className="stepper">
                  <button
                    aria-label={t("cartPage.decreaseQuantity")}
                    onClick={() => handleUpdateQuantity(item.lineKey, item.quantity - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    aria-label={t("cartPage.increaseQuantity")}
                    onClick={() => handleUpdateQuantity(item.lineKey, item.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
                <button
                  aria-label={t("cartPage.removeItem")}
                  className="icon-button"
                  onClick={() => removeFromCart(item.lineKey)}
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
