import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext();
const CART_STORAGE_KEY = "cart";
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/* ── Persist helpers ─────────────────────────────────────────── */
function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const { items, savedAt } = JSON.parse(raw);
    // Expire stale cart after TTL
    if (!savedAt || Date.now() - savedAt > CART_TTL_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items, savedAt: Date.now() })
    );
  } catch {
    // localStorage quota exceeded — silently fail
  }
}

/* ── Provider ────────────────────────────────────────────────── */
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart);

  /* Persist on every change */
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item._id === product._id);
      if (exists) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Only persist fields we actually need — strips Three.js objects, refs, etc.
      const { _id, name, description, price, category, image, images, stock } = product;
      return [...prev, { _id, name, description, price, category, image, images, stock, quantity }];
    });
  }, []);

  const removeFromCart = useCallback(
    (id) => setCart((prev) => prev.filter((item) => item._id !== id)),
    []
  );

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item._id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === id ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      cartCount,
      total,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [addToCart, cart, cartCount, clearCart, removeFromCart, total, updateQuantity]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);