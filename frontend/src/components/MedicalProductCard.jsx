import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdAddShoppingCart, MdVerifiedUser } from "react-icons/md";
import { useCart } from "../context/CartContext";
import {
  formatCurrency,
  getProductImage,
  handleProductImageError,
  truncateText,
} from "../utils/formatters";

function MedicalProductCard({ product }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addToCart(product);
    toast.success(t("productCard.addedSuccess"));
  };

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/products/${product._id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/products/${product._id}`);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="product-card__media">
        <img
          alt={product.name}
          className="product-card__image"
          decoding="async"
          loading="lazy"
          onError={handleProductImageError}
          src={getProductImage(product)}
          width={400}
          height={364}
        />
        <span className="product-card__badge">
          <MdVerifiedUser size={16} />
          {t("productCard.certified")}
        </span>
        {product.stock <= 0 ? (
          <span className="product-card__stock product-card__stock--empty">
            {t("productCard.outOfStock")}
          </span>
        ) : (
          <span className="product-card__stock">{t("productCard.available")}</span>
        )}
      </div>

      <div className="product-card__body">
        <span className="eyebrow">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{truncateText(product.description, 92)}</p>
      </div>

      <div className="product-card__footer">
        <strong>{formatCurrency(product.price)}</strong>
        <button
          className="button button--primary"
          disabled={product.stock <= 0}
          onClick={handleAddToCart}
          type="button"
        >
          <MdAddShoppingCart size={18} />
          <span>
            {product.stock <= 0 ? t("productCard.unavailable") : t("productCard.addToCart")}
          </span>
        </button>
      </div>
    </article>
  );
}

export default memo(MedicalProductCard);
