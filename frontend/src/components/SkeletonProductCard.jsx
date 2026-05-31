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
        <div className="skeleton skeleton--text" style={{ width: "70%",  height: 12 }} />
      </div>

      {/* Footer */}
      <div className="product-card__footer" style={{ gap: 8 }}>
        <div className="skeleton skeleton--text"   style={{ width: "32%", height: 20 }} />
        <div className="skeleton skeleton--button" style={{ width: "52%", height: 38 }} />
      </div>
    </article>
  );
}