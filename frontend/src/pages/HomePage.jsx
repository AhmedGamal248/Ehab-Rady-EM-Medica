import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  MdLocalShipping,
  MdMedicalServices,
  MdOutlineFactCheck,
  MdSupportAgent,
} from "react-icons/md";

const trustIcons = [
  <MdOutlineFactCheck key="fact-check" size={24} />,
  <MdLocalShipping key="shipping" size={24} />,
  <MdSupportAgent key="support" size={24} />,
];

export default function HomePage() {
  const { t } = useTranslation();
  const trustHighlights = t("homePage.trustHighlights", { returnObjects: true });
  const metrics = t("homePage.metrics", { returnObjects: true });
  const heroCategories = t("homePage.heroCategories", { returnObjects: true });

  return (
    <div className="page page--home">
      <section className="hero-section">
        <div className="container hero-section__inner">
          <div className="hero-section__content">
            <span className="eyebrow eyebrow--solid">
              <MdMedicalServices size={16} />
            </span>
            <h1>{t("homePage.heroTitle")}</h1>

            <div className="hero-section__actions">
              <Link className="button button--primary button--large" to="/products">
                {t("homePage.heroBrowseProducts")}
              </Link>
              <Link className="button button--secondary button--large" to="/register">
                {t("homePage.heroCreateAccount")}
              </Link>
            </div>
            <div className="hero-section__trust-row">
              <span>{t("homePage.pricingClarity")}</span>
            </div>
          </div>

          <div className="hero-section__panel">
            <div className="hero-panel">
              <div className="hero-panel__top">
                <span className="eyebrow">{t("homePage.readyToBuy")}</span>
                <strong>{t("homePage.equipmentTitle")}</strong>
              </div>
              <div className="hero-panel__grid">
                {heroCategories.map((item) => (
                  <div key={item} className="hero-panel__chip">
                    {item}
                  </div>
                ))}
              </div>
              <div className="hero-panel__note" />
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-strip">
        <div className="container metrics-strip__grid">
          {metrics.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-heading">
          <span className="eyebrow">{t("homePage.whyEyebrow")}</span>
          <h2>{t("homePage.whyTitle")}</h2>
          <p>{t("homePage.whyDescription")}</p>
        </div>

        <div className="feature-grid">
          {trustHighlights.map((item, index) => (
            <article key={item.title} className="feature-card">
              <span className="feature-card__icon">{trustIcons[index]}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="cta-banner">
          <div>
            <span className="eyebrow eyebrow--solid">{t("homePage.ctaEyebrow")}</span>
            <h2>{t("homePage.ctaTitle")}</h2>
          </div>
          <Link className="button button--primary" to="/products">
            {t("homePage.ctaButton")}
          </Link>
        </div>
      </section>
    </div>
  );
}
