import { MdMedicalServices, MdPhone, MdEmail, MdLocationOn } from "react-icons/md";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTwitter } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      <style>{`
        .footer { background: #0d1b2a; color: #fff; margin-top: 4rem; direction: rtl; font-family: Arial; }

        .footer-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
        }

        .footer-col { display: flex; flex-direction: column; gap: 1rem; }

        .footer-logo { display: flex; align-items: center; gap: 0.8rem; }
        .footer-logo-icon { background: #e0f2fe; padding: 0.5rem; border-radius: 10px; display: flex; }
        .footer-logo-text { display: block; font-weight: 800; font-size: 1.2rem; color: #fff; }
        .footer-logo-sub { display: block; font-size: 0.7rem; color: #90e0ef; }

        .footer-desc { color: #adb5bd; line-height: 1.8; font-size: 0.9rem; }

        .footer-socials { display: flex; gap: 0.7rem; margin-top: 0.5rem; flex-wrap: wrap; }

        .social-btn {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          text-decoration: none; color: #fff;
          transition: transform 0.2s;
        }
        .social-btn:hover { transform: translateY(-3px); }
        .social-fb { background: #1877f2; }
        .social-ig { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
        .social-wa { background: #25d366; }
        .social-tw { background: #1da1f2; }

        .footer-col-title {
          font-size: 1rem; font-weight: 700; color: #fff;
          padding-bottom: 0.8rem;
          border-bottom: 2px solid #0077b6;
          margin-bottom: 0.5rem;
        }

        .footer-links { display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-link { color: #adb5bd; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .footer-link:hover { color: #90e0ef; }

        .footer-contact { display: flex; flex-direction: column; gap: 0.8rem; }
        .footer-contact-item { display: flex; align-items: center; gap: 0.8rem; color: #adb5bd; font-size: 0.9rem; }
        .footer-contact-icon { background: #1a2e3f; padding: 0.5rem; border-radius: 8px; display: flex; }

        .footer-hours {
          background: #1a2e3f; padding: 1rem; border-radius: 10px;
          border-right: 3px solid #0077b6; margin-top: 0.5rem;
        }
        .footer-hours h5 { color: #90e0ef; margin-bottom: 0.5rem; font-size: 0.9rem; }
        .footer-hours p { color: #adb5bd; font-size: 0.85rem; margin: 0.2rem 0; }

        .footer-bottom { border-top: 1px solid #1a2e3f; padding: 1.2rem 2rem; }
        .footer-bottom-content {
          max-width: 1200px; margin: 0 auto;
          display: flex; justify-content: space-between;
          align-items: center; flex-wrap: wrap; gap: 1rem;
        }
        .footer-copyright { color: #6c757d; font-size: 0.85rem; }
        .footer-bottom-links { display: flex; gap: 1rem; align-items: center; }
        .footer-bottom-link { color: #6c757d; text-decoration: none; font-size: 0.85rem; }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .footer-wrapper {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding: 2.5rem 1.5rem 1.5rem;
          }

          .footer-col:first-child {
            grid-column: span 2;
          }

          .footer-socials { justify-content: flex-start; }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .footer-wrapper {
            grid-template-columns: 1fr;
            padding: 2rem 1.2rem 1rem;
          }

          .footer-col:first-child { grid-column: span 1; }

          .footer-socials { justify-content: center; }

          .footer-logo { justify-content: center; }
          .footer-desc { text-align: center; }

          .footer-col-title { text-align: center; }
          .footer-links { align-items: center; }
          .footer-contact-item { justify-content: center; }

          .footer-hours { text-align: center; border-right: none; border-top: 3px solid #0077b6; }
        }
      `}</style>

      <footer className="footer">
        <div className="footer-wrapper">

          {/* Logo & Description */}
          <div className="footer-col">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <MdMedicalServices size={24} color="#0077b6" />
              </div>
              <div>
                <span className="footer-logo-text">MedStore</span>
                <span className="footer-logo-sub">للأدوات الطبية</span>
              </div>
            </div>
            <p className="footer-desc">
              متجرك الأول للأدوات الطبية المعتمدة. نوفر أحدث المنتجات بأعلى معايير الجودة وأفضل الأسعار.
            </p>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn social-fb">
                <FaFacebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn social-ig">
                <FaInstagram size={18} />
              </a>
              <a href="https://wa.me/201000000000" target="_blank" rel="noreferrer" className="social-btn social-wa">
                <FaWhatsapp size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn social-tw">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">روابط سريعة</h4>
            <div className="footer-links">
              {[
                { label: "الرئيسية", to: "/" },
                { label: "المنتجات", to: "/products" },
                { label: "سلة التسوق", to: "/cart" },
                { label: "تسجيل الدخول", to: "/login" },
                { label: "إنشاء حساب", to: "/register" },
              ].map((link, i) => (
                <Link key={i} to={link.to} className="footer-link">← {link.label}</Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">الفئات</h4>
            <div className="footer-links">
              {["أجهزة قياس", "أدوات جراحية", "معدات مستشفيات", "مستلزمات تمريض", "أجهزة تشخيص"].map((cat, i) => (
                <Link key={i} to="/products" className="footer-link">← {cat}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">تواصل معنا</h4>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <div className="footer-contact-icon"><MdPhone size={16} color="#0077b6" /></div>
                <span>01000000000+</span>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon"><MdEmail size={16} color="#0077b6" /></div>
                <span>info@medstore.com</span>
              </div>
              <div className="footer-contact-item">
                <div className="footer-contact-icon"><MdLocationOn size={16} color="#0077b6" /></div>
                <span>القاهرة، مصر</span>
              </div>
            </div>
            <div className="footer-hours">
              <h5>ساعات العمل</h5>
              <p>السبت - الخميس</p>
              <p>9 صباحاً - 10 مساءً</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">© 2026 MedStore - جميع الحقوق محفوظة</p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">سياسة الخصوصية</a>
              <span style={{ color: "#6c757d" }}>|</span>
              <a href="#" className="footer-bottom-link">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}