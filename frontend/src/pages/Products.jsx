import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import { MdSearch, MdFilterList, MdInventory2 } from "react-icons/md";
import "../styles/responsive.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  api.get("/products").then((res) => {
    setProducts(res.data.data?.data || res.data.data || res.data);
    setLoading(false);
  });
}, []);

  const categories = [...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category ? p.category === category : true;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ direction: "rtl", fontFamily: "Arial", minHeight: "100vh", background: "#f8f9fa" }}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <MdInventory2 size={32} /> منتجاتنا الطبية
          </h1>
          <p style={styles.subtitle}>اكتشف مجموعتنا الواسعة من الأدوات الطبية المعتمدة</p>
        </div>
      </div>

      <div style={styles.container}>
        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <MdSearch size={22} color="#6c757d" />
            <input
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterBox}>
            <MdFilterList size={22} color="#6c757d" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.select}
            >
              <option value="">كل الفئات</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p style={styles.resultsCount}>
          {filtered.length} منتج متاح
        </p>

        {/* Products Grid */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>جاري التحميل...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>
            <MdInventory2 size={60} color="#dee2e6" />
            <p>مفيش منتجات تطابق البحث</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtered.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { background: "linear-gradient(135deg, #023e8a, #0077b6)", padding: "3rem 2rem" },
  headerContent: { maxWidth: "1200px", margin: "0 auto" },
  title: { color: "#fff", fontSize: "2rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.8rem", margin: 0 },
  subtitle: { color: "#90e0ef", marginTop: "0.5rem" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "2rem" },
  filters: { display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" },
  searchBox: { display: "flex", alignItems: "center", gap: "0.7rem", background: "#fff", padding: "0.7rem 1rem", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flex: 1, minWidth: "250px" },
  searchInput: { border: "none", outline: "none", fontSize: "1rem", width: "100%", background: "transparent" },
  filterBox: { display: "flex", alignItems: "center", gap: "0.7rem", background: "#fff", padding: "0.7rem 1rem", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  select: { border: "none", outline: "none", fontSize: "1rem", background: "transparent", cursor: "pointer" },
  resultsCount: { color: "#6c757d", marginBottom: "1.5rem", fontSize: "0.95rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" },
  loading: { textAlign: "center", padding: "4rem", color: "#6c757d" },
  spinner: { width: "40px", height: "40px", border: "4px solid #e9ecef", borderTop: "4px solid #0077b6", borderRadius: "50%", margin: "0 auto 1rem", animation: "spin 1s linear infinite" },
  empty: { textAlign: "center", padding: "4rem", color: "#6c757d" },
};