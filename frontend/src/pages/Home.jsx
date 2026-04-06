import { Link } from "react-router-dom";
import {
  MdMedicalServices, MdVerified, MdLocalShipping,
  MdSupportAgent, MdArrowForward,
} from "react-icons/md";

export default function Home() {
  const features = [
    { icon: <MdVerified size={32} color="#0077b6" />, title: "منتجات معتمدة", desc: "جميع منتجاتنا حاصلة على اعتماد وزارة الصحة وتخضع لأعلى معايير الجودة" },
    { icon: <MdLocalShipping size={32} color="#0077b6" />, title: "توصيل سريع", desc: "توصيل داخل القاهرة خلال 24 إلى 48 ساعة" },
    { icon: <MdSupportAgent size={32} color="#0077b6" />, title: "دعم متخصص", desc: "فريق متخصص من الصيادلة والأطباء لمساعدتك في اختيار المنتج المناسب" },
  ];

  const stats = [
    { number: "+100", label: "منتج طبي" },
    { number: "+10K", label: "عميل راضي" },
    { number: "24/7", label: "دعم فني" },
    { number: "100%", label: "منتجات أصلية" },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .home { direction: rtl; font-family: Arial; }

        /* ===== HERO ===== */
        .hero {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          padding: 4rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          width: 100%;
        }

        .hero-content { flex: 1; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0077b6;
          color: #fff;
          padding: 0.4rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: #212529;
          line-height: 1.3;
          margin-bottom: 1rem;
        }

        .hero-highlight { color: #0077b6; font-style: italic; }

        .hero-desc {
          color: #6c757d;
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        .hero-btns {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .hero-btn {
          background: #0077b6;
          color: #fff;
          padding: 0.9rem 1.8rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        .hero-btn2 {
          background: #fff;
          color: #0077b6;
          padding: 0.9rem 1.8rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          border: 2px solid #0077b6;
          font-size: 1rem;
          display: inline-flex;
          align-items: center;
        }

        .hero-img {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-img-inner {
          background: #fff;
          border-radius: 50%;
          width: 260px;
          height: 260px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(0,119,182,0.2);
        }

        /* ===== STATS ===== */
        .stats-section {
          background: #0077b6;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
        }

        .stat-item {
          padding: 2rem 3rem;
          text-align: center;
          border-left: 1px solid rgba(255,255,255,0.2);
          flex: 1;
          min-width: 120px;
        }

        .stat-number { color: #fff; font-size: 2rem; font-weight: 800; margin: 0; }
        .stat-label { color: #90e0ef; margin: 0.3rem 0 0; font-size: 0.9rem; }

        /* ===== FEATURES ===== */
        .features-section {
          padding: 5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header { text-align: center; margin-bottom: 3rem; }
        .section-title { font-size: 2rem; font-weight: 800; color: #212529; }
        .section-desc { color: #6c757d; font-size: 1rem; margin-top: 0.5rem; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .feature-card {
          background: #fff;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .feature-icon {
          background: #e0f2fe;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .feature-title { font-size: 1.1rem; font-weight: 700; color: #212529; margin-bottom: 0.8rem; }
        .feature-desc { color: #6c757d; line-height: 1.7; font-size: 0.9rem; }

        /* ===== CTA ===== */
        .cta {
          background: linear-gradient(135deg, #023e8a, #0077b6);
          padding: 5rem 2rem;
          text-align: center;
        }

        .cta-title { color: #fff; font-size: 2rem; font-weight: 800; margin-bottom: 1rem; }
        .cta-desc { color: #90e0ef; font-size: 1rem; margin-bottom: 2rem; }
        .cta-btn {
          background: #fff;
          color: #0077b6;
          padding: 1rem 2.5rem;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
        }

        /* ========================================
           TABLET
        ======================================== */
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-title { font-size: 2.2rem; }
        }

        /* ========================================
           MOBILE
        ======================================== */
        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            padding: 2.5rem 1.5rem;
            text-align: center;
          }

          .hero-img { display: none; }

          .hero-title { font-size: 2rem; }

          .hero-badge { font-size: 0.8rem; }

          .hero-desc {
            font-size: 0.95rem;
            max-width: 100%;
            margin: 0 auto 1.5rem;
          }

          .hero-btns {
            justify-content: center;
            flex-direction: column;
            align-items: center;
          }

          .hero-btn, .hero-btn2 {
            width: 100%;
            justify-content: center;
            padding: 0.9rem 1rem;
          }

          .stat-item { padding: 1.2rem 0.8rem; }
          .stat-number { font-size: 1.5rem; }

          .features-section { padding: 3rem 1rem; }
          .features-grid { grid-template-columns: 1fr; gap: 1rem; }

          .cta { padding: 3rem 1.5rem; }
          .cta-title { font-size: 1.5rem; }
          .cta-btn { width: 100%; justify-content: center; }
        }

        @media (max-width: 480px) {
          .hero-title { font-size: 1.7rem; }
        }
      `}</style>

      <div className="home">
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">
              <MdMedicalServices size={16} /> متجر أدوات طبية معتمد
            </div>
            <h1 className="hero-title">
              كل ما تحتاجه من <br />
              <span className="hero-highlight">أدوات طبية</span><br />
              في مكان واحد
            </h1>
            <p className="hero-desc">
              نوفر أحدث الأجهزة والأدوات الطبية بأعلى معايير الجودة وأفضل الأسعار،
              مع توصيل سريع لباب بيتك
            </p>
            <div className="hero-btns">
              <Link to="/products" className="hero-btn">
                تصفح المنتجات <MdArrowForward size={20} />
              </Link>
              <Link to="/register" className="hero-btn2">
                سجل مجاناً
              </Link>
            </div>
          </div>
          <div className="hero-img">
            <div className="hero-img-inner">
              <MdMedicalServices size={120} color="#0077b6" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-section">
          {stats.map((s, i) => (
            <div key={i} className="stat-item">
              <h3 className="stat-number">{s.number}</h3>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="features-section">
          <div className="section-header">
            <h2 className="section-title">لماذا تختار EM Medica</h2>
            <p className="section-desc">نلتزم بتقديم أفضل تجربة تسوق للأدوات الطبية</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <h2 className="cta-title">ابدأ التسوق الآن</h2>
          <p className="cta-desc">انضم لأكثر من 10,000 عميل يثقون في EM Medica</p>
          <Link to="/products" className="cta-btn">
            تصفح المنتجات <MdArrowForward size={20} />
          </Link>
        </section>
      </div>
    </>
  );
}