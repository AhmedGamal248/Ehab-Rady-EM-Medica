import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdAddShoppingCart } from "react-icons/md";
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

  const isOutOfStock = product.stock <= 0;

  const handleOpenProduct = useCallback(() => {
    navigate(`/products/${product._id}`);
  }, [navigate, product._id]);

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
    toast.success(t("productCard.addedSuccess"));
  }, [addToCart, isOutOfStock, product, t]);

  return (
    <article className="product-card" aria-label={product.name}>
      <button
        className="product-card__open"
        onClick={handleOpenProduct}
        type="button"
        aria-label={`${t("common.products")} — ${product.name}`}
      >
        <span className="product-card__media">
          <img
            alt={product.name}
            className="product-card__image"
            decoding="async"
            loading="lazy"
            onError={handleProductImageError}
            src={getProductImage(product)}
            width={400}
            height={300}
          />

          {isOutOfStock ? (
            <span
              className="product-card__stock product-card__stock--empty"
              aria-label={t("productCard.outOfStock")}
            >
              {t("productCard.outOfStock")}
            </span>
          ) : (
            <span
              className="product-card__stock"
              aria-label={t("productCard.available")}
            >
              {t("productCard.available")}
            </span>
          )}
        </span>

        <span className="product-card__body">
          <span className="eyebrow">{product.category}</span>
          <h3>{product.name}</h3>
          <p>{truncateText(product.description, 92)}</p>
        </span>
      </button>

      <div className="product-card__footer">
        <strong aria-label={`${t("common.price")}: ${formatCurrency(product.price)}`}>
          {formatCurrency(product.price)}
        </strong>
        <button
          className="button button--primary"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          type="button"
          aria-label={
            isOutOfStock
              ? t("productCard.unavailable")
              : `${t("productCard.addToCart")} — ${product.name}`
          }
        >
          <MdAddShoppingCart size={16} aria-hidden="true" />
          <span>
            {isOutOfStock
              ? t("productCard.unavailable")
              : t("productCard.addToCart")}
          </span>
        </button>
      </div>
    </article>
  );
}

export default memo(MedicalProductCard);