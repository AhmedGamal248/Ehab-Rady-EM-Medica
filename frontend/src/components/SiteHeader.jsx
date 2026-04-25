import { useState } from "react";
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
  const currentLanguage = i18n.resolvedLanguage === "ar" ? "ar" : "en";

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const handleLanguageToggle = () => {
    const nextLanguage = currentLanguage === "en" ? "ar" : "en";
    setMenuOpen(false);
    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark">
            <img alt={t("header.brandAlt")} className="brand__logo" src="/web-logo.png" />
          </span>
          <span>
            <strong className="brand__name">EM Medica</strong>
            <span className="brand__tagline">{t("header.brandTagline")}</span>
          </span>
        </Link>

        <button
          aria-controls="main-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
          className="site-header__menu-toggle"
          onClick={() => setMenuOpen((currentValue) => !currentValue)}
          type="button"
        >
          {menuOpen ? <HiOutlineXMark size={22} /> : <MdMenu size={22} />}
        </button>

        <nav
          className={`site-header__nav ${menuOpen ? "is-open" : ""}`}
          id="main-navigation"
        >
          <NavLink className="site-link" onClick={handleCloseMenu} to="/products">
            <MdStorefront size={18} />
            <span>{t("common.products")}</span>
          </NavLink>

          <NavLink className="site-link site-link--cart" onClick={handleCloseMenu} to="/cart">
            <MdShoppingCart size={18} />
            <span>{t("common.cart")}</span>
            {cartCount > 0 ? (
              <span
                aria-label={t("header.cartCount", { count: cartCount })}
                className="cart-pill"
              >
                {cartCount}
              </span>
            ) : null}
          </NavLink>

          {user?.role === "admin" ? (
            <NavLink className="site-link" onClick={handleCloseMenu} to="/admin">
              <MdDashboard size={18} />
              <span>{t("header.dashboard")}</span>
            </NavLink>
          ) : null}

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
            <MdLanguage size={18} />
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
            {isDarkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
          </button>

          {user ? (
            <>
              <div className="site-user">
                <MdPerson size={18} />
                <span>{user.name}</span>
              </div>
              <button className="site-link site-link--ghost" onClick={handleLogout} type="button">
                <MdLogout size={18} />
                <span>{t("header.logout")}</span>
              </button>
            </>
          ) : (
            <>
              <NavLink className="site-link" onClick={handleCloseMenu} to="/login">
                <MdLogin size={18} />
                <span>{t("header.login")}</span>
              </NavLink>
              <NavLink
                className="site-link site-link--primary"
                onClick={handleCloseMenu}
                to="/register"
              >
                <MdPersonAdd size={18} />
                <span>{t("header.register")}</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
