import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MdHome, MdSearchOff } from "react-icons/md";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="page auth-page">
      <div className="container">
        <div className="state-card" style={{ maxWidth: 480, margin: "0 auto" }}>
          <MdSearchOff size={52} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: "3rem", fontFamily: "Manrope, Cairo, sans-serif", color: "var(--primary)" }}>
            404
          </h1>
          <h2>{t("notFoundPage.title")}</h2>
          <p>{t("notFoundPage.description")}</p>
          <Link className="button button--primary button--large" to="/">
            <MdHome size={20} />
            {t("notFoundPage.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}