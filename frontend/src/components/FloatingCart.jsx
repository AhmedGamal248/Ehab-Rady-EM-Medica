import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { MdShoppingCart } from "react-icons/md";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const { t }        = useTranslation();
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const { cartCount } = useCart();

  // Hidden on cart/order pages or when cart is empty
  if (cartCount === 0 || pathname === "/cart" || pathname === "/order") return null;

  return (
    <button
      className="floating-cart"
      onClick={() => navigate("/cart")}
      type="button"
      aria-label={t("header.cartCount", { count: cartCount })}
      aria-live="polite"
    >
      <MdShoppingCart size={22} aria-hidden="true" />
      <span className="floating-cart__count" aria-hidden="true">
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    </button>
  );
}