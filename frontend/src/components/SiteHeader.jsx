import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  MdDarkMode,
  MdDashboard,
  MdLanguage,
  MdLightMode,
  MdLogin,
  MdLogout,
  MdMenu,
  MdPerson,
  MdPersonAdd,
  MdShoppingCart,
  MdStorefront,
} from "react-icons/md";
import { HiOutlineXMark } from "react-icons/hi2";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

export default function SiteHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const currentLanguage = i18n.resolvedLanguage === "ar" ? "ar" : "en";

  /* Close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (
        navRef.current && !navRef.current.contains(e.target) &&
        toggleRef.current && !toggleRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  /* Close menu on Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [menuOpen]);

  /* Lock body scroll when menu is open on mobile */
  useEffect(() => {
    if (window.innerWidth > 860) return;
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleCloseMenu = () => setMenuOpen(false);

  const handleLanguageToggle = () => {
    const next = currentLanguage === "en" ? "ar" : "en";
    setMenuOpen(false);
    void i18n.changeLanguage(next);
  };

  return (
    <header className="site-header" role="banner">
      <div className="container site-header__inner">
        <Link className="brand" to="/" aria-label="EM Medica — home">
          <span className="brand__mark" aria-hidden="true">
            <img
              alt=""
              className="brand__logo"
              src="/web-logo.png"
              width={80}
              height={80}
              fetchPriority="high"
              decoding="async"
            />
          </span>
          <span>
            <strong className="brand__name">EM Medica</strong>
          </span>
        </Link>

        <button
          ref={toggleRef}
          aria-controls="main-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
          className="site-header__menu-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          type="button"
        >
          {menuOpen ? <HiOutlineXMark size={22} /> : <MdMenu size={22} />}
        </button>

        <nav
          ref={navRef}
          className={`site-header__nav${menuOpen ? " is-open" : ""}`}
          id="main-navigation"
          role="navigation"
          aria-label={t("common.products")}
        >
          <NavLink className="site-link" onClick={handleCloseMenu} to="/products">
            <MdStorefront size={18} aria-hidden="true" />
            <span>{t("common.products")}</span>
          </NavLink>

          <NavLink className="site-link site-link--cart" onClick={handleCloseMenu} to="/cart">
            <MdShoppingCart size={18} aria-hidden="true" />
            <span>{t("common.cart")}</span>
            {cartCount > 0 && (
              <span
                aria-label={t("header.cartCount", { count: cartCount })}
                className="cart-pill"
                aria-live="polite"
              >
                {cartCount}
              </span>
            )}
          </NavLink>

          {user?.role === "admin" && (
            <NavLink className="site-link" onClick={handleCloseMenu} to="/admin">
              <MdDashboard size={18} aria-hidden="true" />
              <span>{t("header.dashboard")}</span>
            </NavLink>
          )}

          <button
            aria-label={
              currentLanguage === "en"
                ? t("header.switchToArabic")
                : t("header.switchToEnglish")
            }
            className="theme-toggle"
            onClick={handleLanguageToggle}
            type="button"
          >
            <MdLanguage size={18} aria-hidden="true" />
            <span>
              {currentLanguage === "en"
                ? t("header.arabicLabel")
                : t("header.englishLabel")}
            </span>
          </button>

          <button
            aria-label={
              isDarkMode
                ? t("header.switchToLightMode")
                : t("header.switchToDarkMode")
            }
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            {isDarkMode
              ? <MdLightMode size={18} aria-hidden="true" />
              : <MdDarkMode size={18} aria-hidden="true" />}
          </button>

          {user ? (
            <>
              <div className="site-user" aria-label={`${t("header.loggedInAs") || "Logged in as"} ${user.name}`}>
                <MdPerson size={18} aria-hidden="true" />
                <span>{user.name}</span>
              </div>
              <button
                className="site-link site-link--ghost"
                onClick={handleLogout}
                type="button"
              >
                <MdLogout size={18} aria-hidden="true" />
                <span>{t("header.logout")}</span>
              </button>
            </>
          ) : (
            <>
              <NavLink className="site-link" onClick={handleCloseMenu} to="/login">
                <MdLogin size={18} aria-hidden="true" />
                <span>{t("header.login")}</span>
              </NavLink>
              <NavLink
                className="site-link"
                onClick={handleCloseMenu}
                to="/register"
              >
                <MdPersonAdd size={18} aria-hidden="true" />
                <span>{t("header.register")}</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}