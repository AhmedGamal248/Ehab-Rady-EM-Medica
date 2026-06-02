import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider }  from "./context/AuthContext";
import { CartProvider }  from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary   from "./components/ErrorBoundary";
import ProtectedRoute  from "./components/ProtectedRoute";
import ScrollToTop     from "./components/ScrollToTop";
import SiteFooter      from "./components/SiteFooter";
import SiteHeader      from "./components/SiteHeader";
import FloatingCart    from "./components/FloatingCart";

/* Lazy-loaded routes */
const HomePage           = lazy(() => import("./pages/HomePage"));
const ProductsPage       = lazy(() => import("./pages/ProductsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage           = lazy(() => import("./pages/CartPage"));
const LoginPage          = lazy(() => import("./pages/LoginPage"));
const RegisterPage       = lazy(() => import("./pages/RegisterPage"));
const OrderPage          = lazy(() => import("./pages/OrderPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const NotFoundPage       = lazy(() => import("./pages/NotFoundPage"));

function RouteFallback() {
  const { t } = useTranslation();
  return (
    <div className="page">
      <div className="container section">
        <div className="state-card" aria-busy="true">
          <div className="spinner" role="status" aria-label={t("common.loadingPage")} />
          <p>{t("common.loadingPage")}</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="app-shell">
              {/* Skip-to-content for keyboard/screen-reader users */}
              <a
                href="#main-content"
                style={{
                  position: "absolute",
                  top: -999,
                  left: 0,
                  zIndex: 9999,
                  background: "var(--primary)",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "0 0 var(--r-sm) var(--r-sm)",
                  fontWeight: 700,
                  fontSize: "0.90rem",
                  transition: "top 0.1s",
                }}
                onFocus={(e) => { e.currentTarget.style.top = "0"; }}
                onBlur={(e) => { e.currentTarget.style.top = "-999px"; }}
              >
                Skip to main content
              </a>
              <SiteHeader />
              <main className="app-shell__content" id="main-content">
                <ErrorBoundary>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route element={<HomePage />}           path="/" />
                      <Route element={<ProductsPage />}       path="/products" />
                      <Route element={<ProductDetailsPage />} path="/products/:id" />
                      <Route element={<CartPage />}           path="/cart" />
                      <Route element={<LoginPage />}          path="/login" />
                      <Route element={<RegisterPage />}       path="/register" />
                      <Route element={<OrderPage />} path="/order" />
                      <Route
                        element={
                          <ProtectedRoute adminOnly>
                            <AdminDashboardPage />
                          </ProtectedRoute>
                        }
                        path="/admin"
                      />
                      <Route element={<NotFoundPage />} path="*" />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
              <SiteFooter />
            </div>
            <FloatingCart />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background:  "var(--surface-solid)",
                  border:      "1px solid var(--border)",
                  color:       "var(--text-primary)",
                  boxShadow:   "var(--shadow-lg)",
                  borderRadius:"var(--r-md)",
                  fontSize:    "0.92rem",
                  padding:     "12px 18px",
                },
                success: {
                  duration: 1000,
                  iconTheme: { primary: "var(--success)", secondary: "#fff" },
                },
                error: {
                  duration: 5000,
                  iconTheme: { primary: "var(--danger)", secondary: "#fff" },
                },
              }}
            />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
