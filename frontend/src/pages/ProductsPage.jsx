import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MdFilterList, MdInventory2, MdSearch } from "react-icons/md";
import api from "../services/api";
import MedicalProductCard from "../components/MedicalProductCard";

function getProductsPayload(response) {
  return response.data?.data?.data || response.data?.data || response.data || [];
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/products");
        const nextProducts = getProductsPayload(response);

        if (!ignore) {
          startTransition(() => {
            setProducts(nextProducts);
          });
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            requestError.response?.data?.message || "تعذر تحميل المنتجات حاليًا."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category ? product.category === category : true;
      const matchesSearch = normalizedSearch
        ? `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [category, deferredSearch, products]);

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--solid">الكتالوج الطبي</span>
          <h1>تصفح المنتجات الطبية بسهولة وابدأ من الفئة المناسبة</h1>
          <p>
            استخدم البحث والتصفية للوصول بسرعة إلى المنتج المطلوب مع بطاقات أوضح
            ومعلومات أسهل في المسح.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="filter-panel">
          <label className="input-shell">
            <MdSearch size={20} />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم المنتج أو الوصف"
              type="search"
              value={search}
            />
          </label>

          <label className="input-shell input-shell--select">
            <MdFilterList size={20} />
            <select
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="">كل الفئات</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="section-heading section-heading--inline">
          <div>
            <span className="eyebrow">نتائج البحث</span>
            <h2>{filteredProducts.length} منتج متاح</h2>
          </div>
        </div>

        {loading ? (
          <div className="state-card">
            <div className="spinner" />
            <p>جاري تحميل المنتجات...</p>
          </div>
        ) : error ? (
          <div className="state-card state-card--error">
            <p>{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="state-card">
            <MdInventory2 size={38} />
            <p>لم نجد منتجات تطابق هذه المعايير.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <MedicalProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
