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

function getProductsPayload(response) {
  return response.data?.data?.data || response.data?.data || response.data || [];
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
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
      } catch {
        if (!ignore) {
          setError(t("productsPage.loadError"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      ignore = true;
    };
  }, [t]);

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesCategory = category ? product.category === category : true;
      const matchesSearch = normalizedSearch
        ? `${product.name} ${product.description}`.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesCategory && matchesSearch;
    });

    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [category, deferredSearch, products, sort]);

  return (
    <div className="page">
      <section className="page-hero">
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--solid">{t("productsPage.heroEyebrow")}</span>
          <h1>{t("productsPage.heroTitle")}</h1>
          {/* <p>{t("productsPage.heroDescription")}</p> */}
        </div>
      </section>

      <section className="container section">
        <div className="filter-panel">
          <label className="input-shell">
            <MdSearch size={20} />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("productsPage.searchPlaceholder")}
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
              <option value="">{t("productsPage.allCategories")}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="input-shell input-shell--select">
            <MdSort size={20} />
            <select onChange={(event) => setSort(event.target.value)} value={sort}>
              <option value="">{t("productsPage.sortDefault")}</option>
              <option value="price-asc">{t("productsPage.sortPriceAsc")}</option>
              <option value="price-desc">{t("productsPage.sortPriceDesc")}</option>
            </select>
          </label>
        </div>

        <div className="section-heading section-heading--inline">
          <div>
            <span className="eyebrow">{t("productsPage.resultsEyebrow")}</span>
            <h3>{t("productsPage.availableCount", { count: filteredProducts.length })}</h3>
          </div>
        </div>

        {loading ? (
          <div className="state-card">
            <div className="spinner" />
            <p>{t("productsPage.loading")}</p>
          </div>
        ) : error ? (
          <div className="state-card state-card--error">
            <p>{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="state-card">
            <MdInventory2 size={38} />
            <p>{t("productsPage.empty")}</p>
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