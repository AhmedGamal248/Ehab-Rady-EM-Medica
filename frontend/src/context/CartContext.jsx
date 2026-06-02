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
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STOCK_ERROR_MESSAGE = "The requested quantity exceeds available stock.";

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const { items, savedAt } = JSON.parse(raw);
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
    // localStorage can fail in private mode or when quota is exceeded.
  }
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    const stock = Number(product.stock) || 0;
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const exists = cart.find((item) => item._id === product._id);
    const nextQuantity = (exists?.quantity || 0) + safeQuantity;

    if (nextQuantity > stock) {
      return { ok: false, message: STOCK_ERROR_MESSAGE };
    }

    if (exists) {
      setCart((prev) =>
        prev.map((item) =>
          item._id === product._id
            ? {
                ...item,
                stock,
                quantity: nextQuantity,
                selectedColor: options.selectedColor || item.selectedColor,
              }
            : item
        )
      );
      return { ok: true };
    }

    const { _id, name, description, price, category, image, images, colors } = product;
    setCart((prev) => [
      ...prev,
      {
        _id,
        name,
        description,
        price,
        category,
        image,
        images,
        colors,
        stock,
        selectedColor: options.selectedColor,
        quantity: safeQuantity,
      },
    ]);
    return { ok: true };
  }, [cart]);

  const removeFromCart = useCallback(
    (id) => setCart((prev) => prev.filter((item) => item._id !== id)),
    []
  );

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item._id !== id));
      return { ok: true };
    }

    const item = cart.find((cartItem) => cartItem._id === id);
    const stock = Number(item?.stock) || 0;

    if (quantity > stock) {
      return { ok: false, message: STOCK_ERROR_MESSAGE };
    }

    setCart((prev) =>
      prev.map((cartItem) => (cartItem._id === id ? { ...cartItem, quantity } : cartItem))
    );
    return { ok: true };
  }, [cart]);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(() => cart.length, [cart]);

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
