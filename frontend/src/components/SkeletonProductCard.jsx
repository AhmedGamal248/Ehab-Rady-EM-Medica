export default function SkeletonProductCard() {
  return (
    <article className="product-card skeleton-card" aria-hidden="true">
      <div className="product-card__media">
        <div className="skeleton skeleton--image" style={{ aspectRatio: '1.1' }} />
      </div>
      <div className="product-card__body">
        <div className="skeleton skeleton--text" style={{ width: '40%', height: 14 }} />
        <div className="skeleton skeleton--text" style={{ width: '80%', height: 18 }} />
        <div className="skeleton skeleton--text" style={{ width: '100%', height: 14 }} />
      </div>
      <div className="product-card__footer">
        <div className="skeleton skeleton--text" style={{ width: '30%', height: 20 }} />
        <div className="skeleton skeleton--button" style={{ width: '50%', height: 42 }} />
      </div>
    </article>
  );
}
