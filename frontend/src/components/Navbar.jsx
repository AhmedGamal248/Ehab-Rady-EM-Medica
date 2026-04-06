import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  MdMedicalServices, MdShoppingCart, MdDashboard,
  MdLogin, MdLogout, MdPersonAdd, MdStorefront,
  MdPerson, MdMenu, MdClose
} from "react-icons/md";
import "../styles/responsive.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); setMenuOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon">
            <MdMedicalServices size={26} color="#0077b6" />
          </div>
          <div>
            <span className="logo-text">MedStore</span>
            <span className="logo-sub">للأدوات الطبية</span>
          </div>
        </Link>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
        </button>

        {/* Links */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>
            <MdStorefront size={18} /> المنتجات
          </Link>

          <Link to="/cart" className="nav-cart" onClick={() => setMenuOpen(false)}>
            <MdShoppingCart size={20} />
            {cart.length > 0 && <span className="nav-badge">{cart.length}</span>}
            السلة
          </Link>

          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="nav-admin" onClick={() => setMenuOpen(false)}>
                  <MdDashboard size={18} /> لوحة التحكم
                </Link>
              )}
              <div className="nav-user">
                <MdPerson size={18} />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="nav-logout">
                <MdLogout size={18} /> خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                <MdLogin size={18} /> دخول
              </Link>
              <Link to="/register" className="nav-register" onClick={() => setMenuOpen(false)}>
                <MdPersonAdd size={18} /> تسجيل مجاني
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}