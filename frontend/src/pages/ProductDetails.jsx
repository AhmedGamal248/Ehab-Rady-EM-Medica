import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import {
  MdAddShoppingCart, MdVerified, MdLocalShipping,
  MdSecurity, MdSupportAgent, MdStar,
  MdChevronLeft, MdChevronRight, MdInventory
} from "react-icons/md";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const sliderRef = useRef(null);

 useEffect(() => {
  setLoading(true);
  setActiveImg(0);
  api.get(`/products/${id}`)
    .then((res) => {
      const product = res.data.data || res.data;
      setProduct(product);
      api.get(`/products?category=${product.category}`).then((r) => {
        const related = r.data.data?.data || r.data.data || r.data;
        setRelated(related.filter((p) => p._id !== id).slice(0, 6));
      });
      setLoading(false);
      window.scrollTo(0, 0);
    })
    .catch(() => navigate("/products"));
}, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`تم إضافة ${quantity} قطعة للسلة ✅`);
  };

  const scrollSlider = (dir) => {
    sliderRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={{
        width: "48px", height: "48px",
        border: "5px solid #e0f2fe",
        borderTopColor: "#0077b6",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .details-page {
          direction: rtl; font-family: Arial;
          background: #f8f9fa; min-height: 100vh;
        }

        /* Breadcrumb */
        .breadcrumb {
          background: #fff; padding: 1rem 2rem;
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.9rem; color: #6c757d;
          border-bottom: 1px solid #e9ecef;
        }
        .breadcrumb a { color: #0077b6; text-decoration: none; }

        /* Main */
        .product-main {
          max-width: 1200px; margin: 2rem auto;
          padding: 0 2rem;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 3rem; align-items: start;
        }

        /* Gallery */
        .product-img-wrapper {
          background: #fff; border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          position: relative; aspect-ratio: 1;
        }
        .product-img { width: 100%; height: 100%; object-fit: cover; }

        .product-verified {
          position: absolute; top: 1rem; right: 1rem;
          background: #0077b6; color: #fff;
          padding: 0.4rem 1rem; border-radius: 20px;
          font-size: 0.85rem;
          display: flex; align-items: center; gap: 0.4rem;
        }
        .product-stock-badge {
          position: absolute; top: 1rem; left: 1rem;
          padding: 0.4rem 1rem; border-radius: 20px;
          font-size: 0.85rem; font-weight: 600;
        }

        .thumbnails {
          display: flex; gap: 0.7rem;
          margin-top: 0.8rem; flex-wrap: wrap;
        }
        .thumb {
          width: 70px; height: 70px; object-fit: cover;
          border-radius: 8px; cursor: pointer;
          border: 2px solid #dee2e6;
          transition: border 0.2s, transform 0.2s;
        }
        .thumb:hover { transform: scale(1.05); }
        .thumb.active { border: 2px solid #0077b6; }

        /* Info */
        .product-info { display: flex; flex-direction: column; gap: 1.2rem; }

        .product-category {
          background: #e0f2fe; color: #0077b6;
          padding: 0.3rem 1rem; border-radius: 20px;
          font-size: 0.85rem; font-weight: 600;
          display: inline-block; width: fit-content;
        }

        .product-title {
          font-size: 2rem; font-weight: 800;
          color: #212529; line-height: 1.3;
        }

        .product-stars { display: flex; align-items: center; gap: 0.3rem; }

        .product-price-box {
          background: #f0f9ff; border: 2px solid #0077b6;
          border-radius: 16px; padding: 1.2rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .product-price { font-size: 2.5rem; font-weight: 800; color: #0077b6; }
        .product-price-label { color: #6c757d; font-size: 0.9rem; }

        .product-desc {
          color: #6c757d; line-height: 1.8; font-size: 0.95rem;
          background: #fff; padding: 1.2rem;
          border-radius: 12px; border: 1px solid #e9ecef;
        }

        /* Quantity */
        .qty-wrapper { display: flex; align-items: center; gap: 1rem; }
        .qty-label { font-weight: 700; color: #212529; }
        .qty-controls {
          display: flex; align-items: center;
          border: 2px solid #0077b6; border-radius: 10px; overflow: hidden;
        }
        .qty-btn {
          background: #0077b6; color: #fff; border: none;
          width: 40px; height: 40px; font-size: 1.2rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .qty-num { width: 50px; text-align: center; font-weight: 700; font-size: 1rem; }

        /* Add to Cart */
        .add-cart-btn {
          background: #0077b6; color: #fff; border: none;
          padding: 1rem 2rem; border-radius: 12px;
          font-size: 1.1rem; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.7rem;
          width: 100%; transition: background 0.2s;
        }
        .add-cart-btn:hover { background: #023e8a; }
        .add-cart-btn:disabled { background: #dee2e6; cursor: not-allowed; }

        /* Features */
        .product-features {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
        }
        .feature-item {
          background: #fff; border-radius: 12px;
          padding: 1rem; text-align: center; border: 1px solid #e9ecef;
        }
        .feature-item strong { font-size: 0.85rem; color: #212529; display: block; margin-top: 0.3rem; }
        .feature-item p { font-size: 0.8rem; color: #6c757d; margin-top: 0.2rem; }

        /* Slider */
        .slider-section {
          max-width: 1200px; margin: 3rem auto;
          padding: 0 2rem 2rem;
        }
        .slider-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 1.5rem;
        }
        .slider-title {
          font-size: 1.5rem; font-weight: 800; color: #212529;
          display: flex; align-items: center; gap: 0.7rem;
        }
        .slider-nav { display: flex; gap: 0.5rem; }
        .slider-nav-btn {
          background: #0077b6; color: #fff; border: none;
          width: 40px; height: 40px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .slider-nav-btn:hover { background: #023e8a; }

        .slider-track {
          display: flex; gap: 1.2rem;
          overflow-x: auto; scroll-snap-type: x mandatory;
          padding-bottom: 1rem; scrollbar-width: none;
        }
        .slider-track::-webkit-scrollbar { display: none; }

        .slider-card {
          min-width: 240px; background: #fff;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.07);
          border: 1px solid #e9ecef;
          scroll-snap-align: start; cursor: pointer;
          transition: transform 0.2s; flex-shrink: 0;
        }
        .slider-card:hover { transform: translateY(-4px); }
        .slider-card-img { width: 100%; height: 160px; object-fit: cover; }
        .slider-card-body { padding: 1rem; }
        .slider-card-cat {
          background: #e0f2fe; color: #0077b6;
          padding: 0.2rem 0.6rem; border-radius: 20px;
          font-size: 0.75rem; font-weight: 600;
        }
        .slider-card-name { font-weight: 700; color: #212529; margin: 0.5rem 0 0.3rem; font-size: 0.95rem; }
        .slider-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.8rem; }
        .slider-card-price { font-weight: 800; color: #0077b6; font-size: 1.1rem; }
        .slider-card-btn {
          background: #0077b6; color: #fff; border: none;
          padding: 0.4rem 0.8rem; border-radius: 8px;
          cursor: pointer; font-size: 0.85rem;
          display: flex; align-items: center; gap: 0.3rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .product-main { grid-template-columns: 1fr; padding: 0 1rem; gap: 1.5rem; }
          .product-title { font-size: 1.5rem; }
          .product-price { font-size: 2rem; }
          .slider-section { padding: 0 1rem 2rem; }
          .slider-card { min-width: 200px; }
          .breadcrumb { padding: 1rem; }
        }

        @media (max-width: 480px) {
          .product-features { grid-template-columns: 1fr; }
          .product-title { font-size: 1.3rem; }
          .thumb { width: 55px; height: 55px; }
        }
      `}</style>

      <div className="details-page">

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/">الرئيسية</a> ←
          <a href="/products">المنتجات</a> ←
          <span>{product.name}</span>
        </div>

        {/* Main */}
        <div className="product-main">

          {/* Gallery */}
          <div>
            <div className="product-img-wrapper">
<img src={allImages[activeImg]} alt={product.name} className="product-img" onError={(e) => { e.target.src = "https://via.placeholder.com/500"; }}/>              <div className="product-verified"><MdVerified size={16} /> معتمد</div>
              <div className="product-stock-badge" style={{
                background: product.stock > 0 ? "#d1fae5" : "#fee2e2",
                color: product.stock > 0 ? "#065f46" : "#991b1b",
              }}>
                {product.stock > 0 ? `متاح (${product.stock} قطعة)` : "نفد المخزون"}
              </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="thumbnails">
                {allImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`صورة ${i + 1}`}
                    className={`thumb ${activeImg === i ? "active" : ""}`}
                    onClick={() => setActiveImg(i)}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/70"; }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <span className="product-category">{product.category}</span>

            <h1 className="product-title">{product.name}</h1>

            <div className="product-stars">
              {[1,2,3,4,5].map((s) => (
                <MdStar key={s} size={22} color={s <= 4 ? "#f59e0b" : "#dee2e6"} />
              ))}
              <span style={{ color: "#6c757d", fontSize: "0.9rem", marginRight: "0.5rem" }}>
                (4.0) - 24 تقييم
              </span>
            </div>

            <div className="product-price-box">
              <div>
                <div className="product-price-label">السعر</div>
                <div className="product-price">
                  {product.price} <span style={{ fontSize: "1rem" }}>جنيه</span>
                </div>
              </div>
              <MdVerified size={40} color="#0077b6" />
            </div>

            <div className="product-desc">
              <strong style={{ display: "block", marginBottom: "0.5rem", color: "#212529" }}>الوصف:</strong>
              {product.description}
            </div>

            {product.stock > 0 && (
              <div className="qty-wrapper">
                <span className="qty-label">الكمية:</span>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className="qty-num">{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                </div>
                <span style={{ color: "#6c757d", fontSize: "0.85rem" }}>
                  الإجمالي: <strong style={{ color: "#0077b6" }}>{product.price * quantity} جنيه</strong>
                </span>
              </div>
            )}

            <button className="add-cart-btn" onClick={handleAddToCart} disabled={product.stock === 0}>
              <MdAddShoppingCart size={24} />
              {product.stock === 0 ? "نفد المخزون" : "أضف للسلة"}
            </button>

            <div className="product-features">
              <div className="feature-item">
                <MdLocalShipping size={28} color="#0077b6" />
                <strong>توصيل مجاني</strong>
                <p>لجميع المحافظات</p>
              </div>
              <div className="feature-item">
                <MdSecurity size={28} color="#0077b6" />
                <strong>ضمان الجودة</strong>
                <p>منتج أصلي معتمد</p>
              </div>
              <div className="feature-item">
                <MdSupportAgent size={28} color="#0077b6" />
                <strong>دعم فني</strong>
                <p>24/7 متاح</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Slider */}
        {related.length > 0 && (
          <div className="slider-section">
            <div className="slider-header">
              <h2 className="slider-title">
                <MdInventory size={28} color="#0077b6" /> منتجات مشابهة
              </h2>
              <div className="slider-nav">
                <button className="slider-nav-btn" onClick={() => scrollSlider(-1)}>
                  <MdChevronRight size={24} />
                </button>
                <button className="slider-nav-btn" onClick={() => scrollSlider(1)}>
                  <MdChevronLeft size={24} />
                </button>
              </div>
            </div>

            <div className="slider-track" ref={sliderRef}>
              {related.map((p) => (
                <div key={p._id} className="slider-card" onClick={() => navigate(`/products/${p._id}`)}>
                  <img src={p.image} alt={p.name} className="slider-card-img" />
                  <div className="slider-card-body">
                    <span className="slider-card-cat">{p.category}</span>
                    <h3 className="slider-card-name">{p.name}</h3>
                    <div className="slider-card-footer">
                      <span className="slider-card-price">{p.price} ج</span>
                      <button
                        className="slider-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                          toast.success("تم الإضافة ✅");
                        }}
                      >
                        <MdAddShoppingCart size={16} /> أضف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}