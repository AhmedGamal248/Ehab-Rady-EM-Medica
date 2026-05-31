import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { MdHome, MdSearchOff } from "react-icons/md";

export default function NotFoundPage() {
  const { t }      = useTranslation();
  const { pathname } = useLocation();

  /* Set document title so screen readers announce the 404 */
  useEffect(() => {
    document.title = `404 — ${t("notFoundPage.title")} | EM Medica`;
    return () => { document.title = "EM Medica"; };
  }, [t]);

  return (
    <div className="page auth-page" role="main">
      <div className="container">
        <div
          className="state-card state-card--error"
          style={{ maxWidth: 480, margin: "0 auto" }}
          role="status"
          aria-label={`404 — ${t("notFoundPage.title")}`}
        >
          <MdSearchOff
            size={52}
            aria-hidden="true"
            style={{ color: "var(--primary)", opacity: 0.75 }}
          />

          <h1
            style={{
              fontSize: "3.5rem",
              fontFamily: "Manrope, Cairo, sans-serif",
              color: "var(--primary)",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            404
          </h1>

          <h2 style={{ fontSize: "1.15rem" }}>{t("notFoundPage.title")}</h2>

          <p style={{ textAlign: "center", maxWidth: 340 }}>
            {t("notFoundPage.description")}
          </p>

          {/* Show attempted path in dev */}
          {import.meta.env.DEV && (
            <code
              style={{
                background: "var(--bg-strong)",
                borderRadius: "var(--r-sm)",
                color: "var(--text-secondary)",
                fontSize: "0.78rem",
                padding: "6px 12px",
              }}
            >
              {pathname}
            </code>
          )}

          <Link className="button button--primary button--large" to="/">
            <MdHome size={20} aria-hidden="true" />
            {t("notFoundPage.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}