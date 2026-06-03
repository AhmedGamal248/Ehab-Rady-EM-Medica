import { memo, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdAddShoppingCart } from "react-icons/md";
import { useCart } from "../context/CartContext";
import { getStockMessage, getStockTier } from "../utils/stockMessages";
import {
  formatCurrency,
  getProductImage,
  handleProductImageError,
  truncateText,
} from "../utils/formatters";

/**
 * MedicalProductCard — Concept A: Inline Color Swatches
 *
 * Color selection happens directly inside the card via swatch buttons.
 * No modal or sheet is opened. The selected color name is shown beneath
 * the swatches. Overflow colors (> MAX_VISIBLE) are hidden behind a "+N" pill.
 *
 * Behavior matrix:
 *  • 0 colors  → footer renders normally, "Add to cart" adds directly
 *  • 1 color   → no swatches shown, adds directly with that color
 *  • 2–N colors → swatches shown, first color pre-selected
 */

const MAX_VISIBLE = 5; // swatches shown before "+N" overflow pill

function MedicalProductCard({ product }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const addBtnRef = useRef(null);

  const availableColors = (product?.colors || []).filter((c) => c.name);
  const hasSwatches = availableColors.length > 1;

  // Default to first color so "Add to cart" always has something selected
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const visibleColors = showAll
    ? availableColors
    : availableColors.slice(0, MAX_VISIBLE);
  const overflowCount = availableColors.length - MAX_VISIBLE;

  const handleOpenProduct = useCallback(() => {
    navigate(`/products/${product._id}`);
  }, [navigate, product._id]);

  const handleSwatchClick = useCallback((e, index) => {
    e.stopPropagation(); // don't navigate to PDP
    setSelectedIndex(index);
  }, []);

  const handleShowAll = useCallback((e) => {
    e.stopPropagation();
    setShowAll(true);
  }, []);

  const handleAddToCart = useCallback(
    (e) => {
      e.stopPropagation();
      if (isOutOfStock) return;

      const selectedColor =
        availableColors.length === 0
          ? undefined
          : availableColors[selectedIndex];

      const result = addToCart(product, 1, { selectedColor });
      if (!result.ok) {
        toast.error(result.message || t("cartPage.stockExceeded"));
        return;
      }
      toast.success(t("productCard.addedSuccess"));
    },
    [isOutOfStock, availableColors, selectedIndex, addToCart, product, t]
  );

  const selectedColor = availableColors[selectedIndex];

  return (
    <article className="product-card" aria-label={product.name}>
      {/* ── Clickable area → PDP ──────────────────────────────────────────── */}
      <button
        className="product-card__open"
        onClick={handleOpenProduct}
        type="button"
        aria-label={`${t("common.products")} — ${product.name}`}
      >
        {/* Image */}
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

          {/* Stock badge */}
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

        {/* Text body */}
        <span className="product-card__body">
          <span className="eyebrow">{product.category}</span>
          <h3>{product.name}</h3>
          <p>{truncateText(product.description, 92)}</p>
        </span>
      </button>

      {/* ── Inline color swatches ─────────────────────────────────────────── */}
      {hasSwatches && (
        <div className="product-card__swatches" role="group" aria-label={t("colorModal.title")}>
          <div className="product-card__swatch-row">
            {visibleColors.map((color, i) => (
              <button
                key={`${color.name}-${color.hex}-${i}`}
                className={`product-card__swatch ${selectedIndex === i ? "is-active" : ""}`}
                onClick={(e) => handleSwatchClick(e, i)}
                type="button"
                aria-label={t("productDetailsPage.selectColor", { color: color.name })}
                aria-pressed={selectedIndex === i}
                title={color.name}
              >
                <span
                  className="product-card__swatch-dot"
                  style={{ background: color.hex || "transparent" }}
                  aria-hidden="true"
                />
              </button>
            ))}

            {/* Overflow pill — only shown when not yet expanded */}
            {!showAll && overflowCount > 0 && (
              <button
                className="product-card__swatch-overflow"
                onClick={handleShowAll}
                type="button"
                aria-label={t("productCard.showMoreColors", { count: overflowCount })}
              >
                +{overflowCount}
              </button>
            )}
          </div>

          {/* Selected color name */}
          <span className="product-card__swatch-label" aria-live="polite">
            {selectedColor?.name}
          </span>
        </div>
      )}

      {/* ── Footer: price + add-to-cart ───────────────────────────────────── */}
      <div className="product-card__footer">
        <strong aria-label={`${t("common.price")}: ${formatCurrency(product.price)}`}>
          {formatCurrency(product.price)}
        </strong>
        <button
          ref={addBtnRef}
          className="button button--primary"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          type="button"
          aria-label={
            isOutOfStock
              ? t("productCard.unavailable")
              : `${t("productCard.addToCart")} — ${product.name}${selectedColor ? ` (${selectedColor.name})` : ""}`
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