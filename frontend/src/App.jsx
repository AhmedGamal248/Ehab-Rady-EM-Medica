import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import FloatingCart from "./components/FloatingCart";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const OrderPage = lazy(() => import("./pages/OrderPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function RouteFallback() {
  const { t } = useTranslation();

  return (
    <div className="page">
      <div className="container section">
        <div className="state-card">
          <div className="spinner" />
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
              <SiteHeader />
              <main className="app-shell__content">
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route element={<HomePage />} path="/" />
                    <Route element={<ProductsPage />} path="/products" />
                    <Route element={<ProductDetailsPage />} path="/products/:id" />
                    <Route element={<CartPage />} path="/cart" />
                    <Route element={<LoginPage />} path="/login" />
                    <Route element={<RegisterPage />} path="/register" />
                    <Route
                      element={
                        <ProtectedRoute>
                          <OrderPage />
                        </ProtectedRoute>
                      }
                      path="/order"
                    />
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
              </main>
              <SiteFooter />
            </div>
            <FloatingCart />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  boxShadow: "var(--shadow-soft)",
                },
              }}
            />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}