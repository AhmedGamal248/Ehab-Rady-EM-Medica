import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MdEmail, MdPhoneInTalk, MdPlace, MdStorefront } from "react-icons/md";

export default function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container site-footer__grid">

        {/* Brand */}
        <div className="site-footer__brand">
          <Link to="/" aria-label="EM Medica — home" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span className="brand__mark" style={{ height: 64, width: 64, borderRadius: 14, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                alt=""
                src="/web-logo.png"
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                style={{ objectFit: "contain" }}
              />
            </span>
          </Link>
          <div>
            <h2 style={{ color: "#fff", fontSize: "1.15rem", fontWeight: 800, marginBottom: 6 }}>
              EM Medica
            </h2>
          </div>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer navigation">
          <h3 className="site-footer__title">{t("common.products")}</h3>
          <div className="site-footer__links">
            <Link to="/products">
              <MdStorefront size={16} aria-hidden="true" />
              {t("common.products")}
            </Link>
            <Link to="/cart">
              <MdStorefront size={16} aria-hidden="true" style={{ opacity: 0 }} />
              {t("common.cart")}
            </Link>
          </div>
        </nav>

        {/* Contact */}
        <address style={{ fontStyle: "normal" }}>
          <h3 className="site-footer__title">{t("footer.contactTitle")}</h3>
          <div className="site-footer__contact">
            <p>
              <MdPhoneInTalk size={17} aria-hidden="true" />
              <a
                href="tel:01055200312"
                dir="ltr"
                style={{ color: "inherit" }}
                aria-label="Call us: 010 55200 312"
              >
                010 55200 312
              </a>
            </p>
            <p>
              <MdEmail size={17} aria-hidden="true" />
              <a
                href="mailto:em@emmedica.com"
                style={{ color: "inherit" }}
                aria-label="Email us at em@emmedica.com"
              >
                em@emmedica.com
              </a>
            </p>
            <p>
              <MdPlace size={17} aria-hidden="true" />
              <span>{t("footer.city")}</span>
            </p>
          </div>
        </address>
      </div>

      <div className="container site-footer__bottom">
        <p>{t("footer.copyright", { year })}</p>
        <div className="site-footer__meta" aria-label="Footer policies">
          <span>{t("footer.privacy")}</span>
          <span>{t("footer.support")}</span>
          <span>{t("footer.delivery")}</span>
        </div>
      </div>
    </footer>
  );
}