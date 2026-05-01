import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MdAddShoppingCart,
  MdChevronLeft,
  MdChevronRight,
  MdInventory2,
  MdLocalShipping,
  MdSecurity,
  MdSupportAgent,
  MdVerifiedUser,
} from "react-icons/md";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import {
  formatCurrency,
  getProductImage,
  getProductImageFull,
  handleProductImageError,
  optimizeCloudinaryUrl,
} from "../utils/formatters";

function getSingleProductPayload(response) {
  return response.data?.data || response.data;
}

function getProductsPayload(response) {
  return response.data?.data?.data || response.data?.data || response.data || [];
}

export default function ProductDetailsPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const sliderRef = useRef(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    let ignore = false;

    async function fetchProductDetails() {
      try {
        setLoading(true);
        setError("");
        setActiveImageIndex(0);

        const productResponse = await api.get(`/products/${id}`);
        const nextProduct = getSingleProductPayload(productResponse);

        if (ignore) {
          return;
        }

        setProduct(nextProduct);
        setQuantity(1);

        if (nextProduct?.category) {
          const relatedResponse = await api.get(
            `/products?category=${encodeURIComponent(nextProduct.category)}`
          );

          if (!ignore) {
            const nextRelatedProducts = getProductsPayload(relatedResponse)
              .filter((item) => item._id !== id)
              .slice(0, 6);

            setRelatedProducts(nextRelatedProducts);
          }
        } else {
          setRelatedProducts([]);
        }
      } catch {
        if (!ignore) {
          setError(t("productDetailsPage.loadError"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void fetchProductDetails();

    return () => {
      ignore = true;
    };
  }, [id, t]);

  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    return [product.image, ...(product.images || [])].filter(Boolean);
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(t("productDetailsPage.addedSuccess", { count: quantity }));
  };

  const scrollSlider = (direction) => {
    sliderRef.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  const previousDirection = isRtl ? 1 : -1;
  const nextDirection = isRtl ? -1 : 1;

  if (loading) {
    return (
      <div className="page">
        <div className="container section">
          <div className="state-card">
            <div className="spinner" />
            <p>{t("productDetailsPage.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page">
        <div className="container section">
          <div className="state-card state-card--error">
            <p>{error || t("productDetailsPage.notFound")}</p>
            <button
              className="button button--primary"
              onClick={() => navigate("/products")}
              type="button"
            >
              {t("productDetailsPage.backToProducts")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container breadcrumb">
        <Link to="/">{t("common.home")}</Link>
        <span>/</span>
        <Link to="/products">{t("common.products")}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="container section product-details">
        <div className="product-details__gallery">
          <div className="product-details__main-image">
            <img
              alt={product.name}
              onError={handleProductImageError}
              src={optimizeCloudinaryUrl(images[activeImageIndex], 800) || getProductImageFull(product)}
              width={600}
              height={600}
              fetchPriority="high"
            />
            <span className="product-details__verified">
              <MdVerifiedUser size={16} />
              {t("productDetailsPage.verified")}
            </span>
            <span
              className={`product-details__availability ${
                product.stock > 0 ? "is-available" : "is-unavailable"
              }`}
            >
              {product.stock > 0
                ? t("productDetailsPage.availableWithCount", { count: product.stock })
                : t("productDetailsPage.unavailable")}
            </span>
          </div>

          {images.length > 1 ? (
            <div className="product-details__thumbnails">
              {images.map((image, index) => (
                <button
                  className={`product-details__thumbnail ${
                    activeImageIndex === index ? "is-active" : ""
                  }`}
                  key={image}
                  onClick={() => setActiveImageIndex(index)}
                  type="button"
                >
                  <img
                    alt={t("productDetailsPage.thumbnailAlt", {
                      name: product.name,
                      index: index + 1,
                    })}
                    onError={handleProductImageError}
                    src={optimizeCloudinaryUrl(image, 100)}
                    width={84}
                    height={84}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-details__content">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-details__description">{product.description}</p>

          <div className="product-details__price-card">
            <div>
              <span>{t("productDetailsPage.finalPrice")}</span>
              <strong>{formatCurrency(product.price)}</strong>
            </div>
            <MdVerifiedUser size={32} />
          </div>

          <div className="product-details__quantity">
            <span>{t("productDetailsPage.quantity")}</span>
            <div>
              <button
                aria-label={t("productDetailsPage.decreaseQuantity")}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                type="button"
              >
                -
              </button>
              <strong>{quantity}</strong>
              <button
                aria-label={t("productDetailsPage.increaseQuantity")}
                onClick={() =>
                  setQuantity((value) => Math.min(product.stock || 1, value + 1))
                }
                type="button"
              >
                +
              </button>
            </div>
          </div>

          <button
            className="button button--primary button--large"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            type="button"
          >
            <MdAddShoppingCart size={20} />
            <span>
              {product.stock <= 0
                ? t("productDetailsPage.productUnavailable")
                : t("productDetailsPage.addToCartTotal", {
                    price: formatCurrency(product.price * quantity),
                  })}
            </span>
          </button>

          <div className="feature-grid feature-grid--compact">
            <article className="feature-card feature-card--compact">
              <span className="feature-card__icon">
                <MdLocalShipping size={20} />
              </span>
              <h3>{t("productDetailsPage.shippingTitle")}</h3>
              <p>{t("productDetailsPage.shippingDescription")}</p>
            </article>
            <article className="feature-card feature-card--compact">
              <span className="feature-card__icon">
                <MdSecurity size={20} />
              </span>
              <h3>{t("productDetailsPage.trustTitle")}</h3>
              <p>{t("productDetailsPage.trustDescription")}</p>
            </article>
            <article className="feature-card feature-card--compact">
              <span className="feature-card__icon">
                <MdSupportAgent size={20} />
              </span>
              <h3>{t("productDetailsPage.supportTitle")}</h3>
              <p>{t("productDetailsPage.supportDescription")}</p>
            </article>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="container section">
          <div className="section-heading section-heading--inline">
            <div>
              <span className="eyebrow">{t("productDetailsPage.relatedEyebrow")}</span>
              <h2>{t("productDetailsPage.relatedTitle")}</h2>
            </div>
            <div className="slider-actions">
              <button onClick={() => scrollSlider(previousDirection)} type="button">
                {isRtl ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
              </button>
              <button onClick={() => scrollSlider(nextDirection)} type="button">
                {isRtl ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
              </button>
            </div>
          </div>

          <div className="related-products" ref={sliderRef}>
            {relatedProducts.map((item) => (
              <button
                className="related-product"
                key={item._id}
                onClick={() => navigate(`/products/${item._id}`)}
                type="button"
              >
                <img
                  alt={item.name}
                  onError={handleProductImageError}
                  src={getProductImage(item)}
                  width={84}
                  height={84}
                  loading="lazy"
                />
                <div>
                  <span className="eyebrow">{item.category}</span>
                  <strong>{item.name}</strong>
                  <small>{formatCurrency(item.price)}</small>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="container section">
          <div className="state-card">
            <MdInventory2 size={34} />
            <p>{t("productDetailsPage.noRelated")}</p>
          </div>
        </section>
      )}
    </div>
  );
}
