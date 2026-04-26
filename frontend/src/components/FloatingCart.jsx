import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { MdShoppingCart } from "react-icons/md";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, total } = useCart();

  if (cartCount === 0 || location.pathname === "/cart") return null;

  return (
    <button
      className="floating-cart"
      onClick={() => navigate("/cart")}
      type="button"
      aria-label={t("header.cartCount", { count: cartCount })}
    >
      <MdShoppingCart size={22} />
      <span className="floating-cart__count">{cartCount}</span>
    </button>
  );
}