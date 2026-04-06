import { Link } from "react-router-dom";
import {
  MdLocalShipping,
  MdMedicalServices,
  MdOutlineFactCheck,
  MdSupportAgent,
} from "react-icons/md";

const trustHighlights = [
  {
    title: "منتجات موثوقة",
    description: "منتجات مختارة بعناية لعيادات، صيدليات، ومستخدمين أفراد.",
    icon: <MdOutlineFactCheck size={24} />,
  },
  {
    title: "شحن سريع",
    description: "توصيل منظم داخل القاهرة  مع متابعة واضحة للطلبات.",
    icon: <MdLocalShipping size={24} />,
  },
  {
    title: "دعم متخصص",
    description: "فريق يرد بسرعة ويساعدك على اختيار المنتج الأنسب لاحتياجك.",
    icon: <MdSupportAgent size={24} />,
  },
];

const metrics = [
  { value: "100+", label: "منتج طبي" },
  { value: "10K+", label: "عميل راضٍ" },
  { value: "24/7", label: "قنوات دعم" },
  { value: "99%", label: "طلبات مكتملة" },
];

export default function HomePage() {
  return (
    <div className="page page--home">
      <section className="hero-section">
        <div className="container hero-section__inner">
          <div className="hero-section__content">
            <span className="eyebrow eyebrow--solid">
              <MdMedicalServices size={16} />
            </span>
            <h1>منتجات طبية واضحة وموثوقة بتجربة شراء مريحة وسريعة</h1>
            
            <div className="hero-section__actions">
              <Link className="button button--primary button--large" to="/products">
                تصفح المنتجات
              </Link>
              <Link className="button button--secondary button--large" to="/register">
                إنشاء حساب جديد
              </Link>
            </div>
            <div className="hero-section__trust-row">
              <span>وضوح في الأسعار</span>
      
            </div>
          </div>

          <div className="hero-section__panel">
            <div className="hero-panel">
              <div className="hero-panel__top">
                <span className="eyebrow">جاهز للشراء</span>
                <strong>معدات واستهلاكات طبية</strong>
              </div>
              <div className="hero-panel__grid">
                {["أجهزة قياس", "تعقيم", "جراحة", "تمريض"].map((item) => (
                  <div key={item} className="hero-panel__chip">
                    {item}
                  </div>
                ))}
              </div>
              <div className="hero-panel__note">
               
              </div>
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
          <span className="eyebrow">لماذا التحديث الجديد</span>
          <h2>واجهة أكثر وضوحًا وملائمة للمتجر الطبي</h2>
          <p>
            ركزنا على التباين، سهولة القراءة، وتقليل الفوضى البصرية حتى تظهر
            المنتجات والمعلومات المهمة بشكل أفضل.
          </p>
        </div>

        <div className="feature-grid">
          {trustHighlights.map((item) => (
            <article key={item.title} className="feature-card">
              <span className="feature-card__icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="cta-banner">
          <div>
            <span className="eyebrow eyebrow--solid">جاهز للانطلاق</span>
            <h2>ابدأ التصفح الآن واختر ما يناسب احتياجك الطبي بثقة</h2>
          </div>
          <Link className="button button--primary" to="/products">
            مشاهدة الكتالوج
          </Link>
        </div>
      </section>
    </div>
  );
}
