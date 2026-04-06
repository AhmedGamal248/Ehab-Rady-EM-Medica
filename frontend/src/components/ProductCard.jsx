import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MdAddShoppingCart, MdVerified } from "react-icons/md";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success("تم الإضافة للسلة ✅");
  };

  return (
    <div style={styles.card} onClick={() => navigate(`/products/${product._id}`)}>
      <div style={styles.imgWrapper}>
        <img src={product.image} alt={product.name} style={styles.img} />
        {product.stock === 0 && <div style={styles.outOfStock}>نفد المخزون</div>}
        <div style={styles.verifiedBadge}>
          <MdVerified size={14} /> معتمد
        </div>
      </div>
      <div style={styles.body}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.name}>{product.name}</h3>
        <p style={styles.desc}>{product.description?.slice(0, 60)}...</p>
        <div style={styles.footer}>
          <div>
            <span style={styles.price}>{product.price}</span>
            <span style={styles.currency}> جنيه</span>
          </div>
          <button
            onClick={handleAdd}
            style={{ ...styles.btn, ...(product.stock === 0 ? styles.btnDisabled : {}) }}
            disabled={product.stock === 0}
          >
            <MdAddShoppingCart size={18} /> أضف
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.07)", border: "1px solid #e9ecef", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
  imgWrapper: { position: "relative", height: "180px", overflow: "hidden", background: "#f8f9fa" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  outOfStock: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  verifiedBadge: { position: "absolute", top: "0.7rem", right: "0.7rem", background: "#0077b6", color: "#fff", padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.2rem" },
  body: { padding: "1.2rem" },
  category: { background: "#e0f2fe", color: "#0077b6", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" },
  name: { margin: "0.7rem 0 0.4rem", fontSize: "1rem", fontWeight: "700", color: "#212529" },
  desc: { color: "#6c757d", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1rem" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: "1.3rem", fontWeight: "800", color: "#0077b6" },
  currency: { fontSize: "0.85rem", color: "#6c757d" },
  btn: { background: "#0077b6", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "600", fontSize: "0.9rem" },
  btnDisabled: { background: "#dee2e6", cursor: "not-allowed" },
};