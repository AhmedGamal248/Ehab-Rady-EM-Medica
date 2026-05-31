import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { MdFilterList, MdInventory2, MdSearch, MdSort } from "react-icons/md";
import api from "../services/api";
import MedicalProductCard from "../components/MedicalProductCard";
import SkeletonProductCard from "../components/SkeletonProductCard";

function getProductsPayload(res) {
  return res.data?.data?.data || res.data?.data || res.data || [];
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort]         = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const deferredSearch = useDeferredValue(search);
  const isStale = search !== deferredSearch;

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api.get("/products")
      .then((res) => {
        if (ignore) return;
        startTransition(() => setProducts(getProductsPayload(res)));
      })
      .catch(() => {
        if (!ignore) setError(t("productsPage.loadError"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [t]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    let result = products.filter((p) => {
      const matchCat  = category ? p.category === category : true;
      const matchText = q
        ? `${p.name} ${p.description}`.toLowerCase().includes(q)
        : true;
      return matchCat && matchText;
    });
    if (sort === "price-asc")  result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [category, deferredSearch, products, sort]);

  return (
    <div className="page">
     

      <section className="container section">
        {/* ── Filters ── */}
        <div className="filter-panel" role="search" aria-label="Filter products">
          <label className="input-shell">
            <MdSearch size={20} aria-hidden="true" />
            <input
              aria-label={t("productsPage.searchPlaceholder")}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("productsPage.searchPlaceholder")}
              type="search"
              value={search}
            />
          </label>

          <label className="input-shell">
            <MdFilterList size={20} aria-hidden="true" />
            <select
              aria-label={t("productsPage.allCategories")}
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="">{t("productsPage.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="input-shell">
            <MdSort size={20} aria-hidden="true" />
            <select
              aria-label={t("productsPage.sortDefault")}
              onChange={(e) => setSort(e.target.value)}
              value={sort}
            >
              <option value="">{t("productsPage.sortDefault")}</option>
              <option value="price-asc">{t("productsPage.sortPriceAsc")}</option>
              <option value="price-desc">{t("productsPage.sortPriceDesc")}</option>
            </select>
          </label>
        </div>

        {/* ── Results header ── */}
        <div className="section-heading section-heading--inline">
          <div>
            <span className="eyebrow">{t("productsPage.resultsEyebrow")}</span>
            <h3 aria-live="polite" aria-atomic="true">
              {!loading && t("productsPage.availableCount", { count: filteredProducts.length })}
            </h3>
          </div>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="product-grid" aria-label="Loading products" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="state-card state-card--error" role="alert">
            <p>{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="state-card" role="status">
            <MdInventory2 size={38} aria-hidden="true" />
            <p>{t("productsPage.empty")}</p>
          </div>
        ) : (
          <div
            className="product-grid"
            style={{ opacity: isStale ? 0.6 : 1, transition: "opacity 0.2s ease" }}
            aria-label="Products"
          >
            {filteredProducts.map((p) => (
              <MedicalProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}