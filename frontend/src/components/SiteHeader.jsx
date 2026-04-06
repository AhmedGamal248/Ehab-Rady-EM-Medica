import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  MdDarkMode,
  MdDashboard,
  MdLightMode,
  MdLogin,
  MdLogout,
  MdMedicalServices,
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand" to="/">
          <span className="brand__mark">
            <MdMedicalServices size={24} />
          </span>
          <span>
            <strong className="brand__name">MedStore</strong>
            <span className="brand__tagline">متجر موثوق للمستلزمات الطبية</span>
          </span>
        </Link>

        <button
          aria-controls="main-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
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
            <span>المنتجات</span>
          </NavLink>

          <NavLink className="site-link site-link--cart" onClick={handleCloseMenu} to="/cart">
            <MdShoppingCart size={18} />
            <span>السلة</span>
            {cartCount > 0 ? (
              <span aria-label={`${cartCount} عناصر في السلة`} className="cart-pill">
                {cartCount}
              </span>
            ) : null}
          </NavLink>

          {user?.role === "admin" ? (
            <NavLink className="site-link" onClick={handleCloseMenu} to="/admin">
              <MdDashboard size={18} />
              <span>لوحة التحكم</span>
            </NavLink>
          ) : null}

          <button
            aria-label={isDarkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            {isDarkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
            <span>{isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}</span>
          </button>

          {user ? (
            <>
              <div className="site-user">
                <MdPerson size={18} />
                <span>{user.name}</span>
              </div>
              <button className="site-link site-link--ghost" onClick={handleLogout} type="button">
                <MdLogout size={18} />
                <span>تسجيل الخروج</span>
              </button>
            </>
          ) : (
            <>
              <NavLink className="site-link" onClick={handleCloseMenu} to="/login">
                <MdLogin size={18} />
                <span>تسجيل الدخول</span>
              </NavLink>
              <NavLink
                className="site-link site-link--primary"
                onClick={handleCloseMenu}
                to="/register"
              >
                <MdPersonAdd size={18} />
                <span>إنشاء حساب</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
