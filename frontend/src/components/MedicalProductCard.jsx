import { memo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdAddShoppingCart } from "react-icons/md";
import { useCart } from "../context/CartContext";
import ColorSelectModal from "./ColorSelectModal";
import { getStockMessage, getStockTier } from "../utils/stockMessages";
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
  const [showColorModal, setShowColorModal] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const availableColors = (product?.colors || []).filter((c) => c.name);

  const handleOpenProduct = useCallback(() => {
    navigate(`/products/${product._id}`);
  }, [navigate, product._id]);

  const performAddToCart = useCallback(
    (selectedColor) => {
      const result = addToCart(product, 1, { selectedColor });
      if (!result.ok) {
        toast.error(result.message || t("cartPage.stockExceeded"));
        setShowColorModal(false);
        return;
      }
      toast.success(t("productCard.addedSuccess"));
      setShowColorModal(false);
    },
    [addToCart, product, t]
  );

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation();
      if (isOutOfStock) return;

      // If product has colors, show modal
      if (availableColors.length > 0) {
        setShowColorModal(true);
        return;
      }

      // If no colors, add directly
      performAddToCart(undefined);
    },
    [isOutOfStock, availableColors.length, performAddToCart]
  );

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

          {(() => {
            const tier = getStockTier(product.stock);
            const message = getStockMessage(product.stock, t);
            return (
              <span
                className={`product-card__stock product-card__stock--${tier}`}
                aria-label={message}
              >
                {message}
              </span>
            );
          })()}
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

      <ColorSelectModal
        product={product}
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        onConfirm={(selectedColor) => performAddToCart(selectedColor)}
      />
    </article>
  );
}

export default memo(MedicalProductCard);
