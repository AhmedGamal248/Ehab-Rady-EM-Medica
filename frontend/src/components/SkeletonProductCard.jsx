export default function SkeletonProductCard() {
  return (
    <article
      className="product-card"
      aria-hidden="true"
      aria-label="Loading product"
      style={{ pointerEvents: "none" }}
    >
      {/* Image */}
      <div className="product-card__media">
        <div
          className="skeleton skeleton--image"
          style={{ aspectRatio: "4/3" }}
        />
      </div>

      {/* Body */}
      <div className="product-card__body" style={{ gap: 8 }}>
        <div className="skeleton skeleton--text" style={{ width: "38%", height: 12 }} />
        <div className="skeleton skeleton--text" style={{ width: "85%", height: 18 }} />
        <div className="skeleton skeleton--text" style={{ width: "100%", height: 12 }} />
        <div className="skeleton skeleton--text" style={{ width: "70%", height: 12 }} />
      </div>

      {/* Swatch row placeholder — matches the inline swatch layout */}
      <div className="product-card__swatches" aria-hidden="true">
        <div className="product-card__swatch-row">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="skeleton"
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
        <div className="skeleton skeleton--text" style={{ width: "45%", height: 10 }} />
      </div>

      {/* Footer */}
      <div className="product-card__footer" style={{ gap: 8 }}>
        <div className="skeleton skeleton--text" style={{ width: "32%", height: 20 }} />
        <div className="skeleton skeleton--button" style={{ width: "52%", height: 38 }} />
      </div>
    </article>
  );
}