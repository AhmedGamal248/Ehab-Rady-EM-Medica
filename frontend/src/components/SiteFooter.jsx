import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  MdAccessTimeFilled,
  MdEmail,
  MdMedicalServices,
  MdPhoneInTalk,
  MdPlace,
} from "react-icons/md";

export default function SiteFooter() {
  const { t } = useTranslation();
  const categories = t("footer.categories", { returnObjects: true });
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <span className="brand__mark">
            <MdMedicalServices size={22} />
          </span>
          <div>
            <h2>EM Medica</h2>
            {/* <p>{t("footer.brandDescription")}</p> */}
          </div>
        </div>

        {/* <div>
          <h3 className="site-footer__title">{t("footer.categoriesTitle")}</h3>
          <div className="site-footer__links">
            {categories.map((category) => (
              <Link key={category} to="/products">
                {category}
              </Link>
            ))}
          </div>
        </div> */}

        <div>
          <h3 className="site-footer__title">{t("footer.contactTitle")}</h3>
          <div className="site-footer__contact">
            <p>
              <MdPhoneInTalk size={18} />
              <span dir="ltr">+20 100 000 0000</span>
            </p>
            <p>
              <MdEmail size={18} />
              <span>info@medstore.com</span>
            </p>
            <p>
              <MdPlace size={18} />
              <span>{t("footer.city")}</span>
            </p>
            <p>
              <MdAccessTimeFilled size={18} />
              <span>{t("footer.workingHours")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>{t("footer.copyright", { year })}</p>
        <div className="site-footer__meta">
          <span>{t("footer.privacy")}</span>
          <span>{t("footer.support")}</span>
          <span>{t("footer.delivery")}</span>
        </div>
      </div>
    </footer>
  );
}
