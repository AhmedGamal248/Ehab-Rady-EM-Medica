import { Link } from "react-router-dom";
import {
  MdAccessTimeFilled,
  MdEmail,
  MdMedicalServices,
  MdPhoneInTalk,
  MdPlace,
} from "react-icons/md";

const quickLinks = [
  { label: "الرئيسية", to: "/" },
  { label: "المنتجات", to: "/products" },
  { label: "السلة", to: "/cart" },
  { label: "إنشاء حساب", to: "/register" },
];

const categories = [
  "أجهزة قياس",
  "أدوات جراحية",
  "مستلزمات تمريض",
  "مستلزمات تعقيم",
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <span className="brand__mark">
            <MdMedicalServices size={22} />
          </span>
          <div>
            <h2>MedStore</h2>
            <p>
              منصة احترافية لبيع المستلزمات والأجهزة الطبية مع تجربة شراء واضحة
              وآمنة ومناسبة للعيادات والمراكز والمرضى.
            </p>
          </div>
        </div>

        <div>
          <h3 className="site-footer__title">روابط سريعة</h3>
          <div className="site-footer__links">
            {quickLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="site-footer__title">فئات شائعة</h3>
          <div className="site-footer__links">
            {categories.map((category) => (
              <Link key={category} to="/products">
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="site-footer__title">معلومات التواصل</h3>
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
              <span>القاهرة، مصر</span>
            </p>
            <p>
              <MdAccessTimeFilled size={18} />
              <span>السبت إلى الخميس، 9 صباحًا حتى 10 مساءً</span>
            </p>
          </div>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>© 2026 MedStore. جميع الحقوق محفوظة.</p>
        <div className="site-footer__meta">
          <span>سياسة خصوصية واضحة</span>
          <span>دعم سريع</span>
          <span>توصيل موثوق</span>
        </div>
      </div>
    </footer>
  );
}
