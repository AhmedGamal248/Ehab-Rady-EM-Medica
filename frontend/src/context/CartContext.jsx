import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api from "../services/api";
import {
  getCartLineKey,
  normalizeCartItem,
  dispatchProductStockUpdates,
} from "../utils/cart";

const CartContext = createContext();
const CART_STORAGE_KEY = "cart";
const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const STOCK_ERROR_MESSAGE = "The requested quantity exceeds available stock.";

function getSingleProductPayload(response) {
  return response.data?.data || response.data;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const { items, savedAt } = JSON.parse(raw);
    if (!savedAt || Date.now() - savedAt > CART_TTL_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    if (!Array.isArray(items)) return [];
    return items.map(normalizeCartItem);
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
  const cartRef = useRef(cart);
  cartRef.current = cart;

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const refreshCartStock = useCallback(async () => {
    const productIds = [...new Set(cartRef.current.map((item) => item._id))];
    if (!productIds.length) return { ok: true };

    try {
      const responses = await Promise.all(
        productIds.map((productId) =>
          api.get(`/products/${productId}`, {
            params: { _ts: Date.now() },
          })
        )
      );

      const stockByProductId = new Map(
        responses.map((response, index) => {
          const product = getSingleProductPayload(response);
          return [productIds[index], Number(product?.stock) || 0];
        })
      );

      setCart((prev) =>
        prev.map((item) => ({
          ...item,
          stock: stockByProductId.get(item._id) ?? item.stock,
        }))
      );

      dispatchProductStockUpdates(
        [...stockByProductId.entries()].map(([productId, stock]) => ({
          productId,
          stock,
        }))
      );

      return { ok: true, stockByProductId };
    } catch {
      return { ok: false };
    }
  }, []);

  useEffect(() => {
    if (cartRef.current.length === 0) return;
    void refreshCartStock();
  }, [refreshCartStock]);

  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    const stock = Number(product.stock) || 0;
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const selectedColor = options.selectedColor;
    const lineKey = getCartLineKey(product._id, selectedColor);

    const existingLine = cart.find((item) => item.lineKey === lineKey);
    const nextQuantity = (existingLine?.quantity || 0) + safeQuantity;

    let projectedTotal = cart
      .filter((item) => item._id === product._id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (existingLine) {
      projectedTotal = projectedTotal - existingLine.quantity + nextQuantity;
    } else {
      projectedTotal += safeQuantity;
    }

    if (projectedTotal > stock) {
      return { ok: false, message: STOCK_ERROR_MESSAGE };
    }

    if (existingLine) {
      setCart((prev) =>
        prev.map((item) =>
          item.lineKey === lineKey
            ? {
                ...item,
                stock,
                quantity: nextQuantity,
                selectedColor: selectedColor || item.selectedColor,
              }
            : item
        )
      );
      return { ok: true };
    }

    const { _id, name, description, price, category, image, images, colors } = product;
    setCart((prev) => [
      ...prev,
      normalizeCartItem({
        _id,
        name,
        description,
        price,
        category,
        image,
        images,
        colors,
        stock,
        selectedColor,
        quantity: safeQuantity,
        lineKey,
      }),
    ]);
    return { ok: true };
  }, [cart]);

  const removeFromCart = useCallback(
    (lineKey) => setCart((prev) => prev.filter((item) => item.lineKey !== lineKey)),
    []
  );

  const updateQuantity = useCallback((lineKey, quantity) => {
    if (quantity < 1) {
      setCart((prev) => prev.filter((item) => item.lineKey !== lineKey));
      return { ok: true };
    }

    const targetLine = cart.find((item) => item.lineKey === lineKey);
    if (!targetLine) {
      return { ok: false, message: STOCK_ERROR_MESSAGE };
    }

    const stock = Number(targetLine.stock) || 0;
    const otherLinesQuantity = cart
      .filter((item) => item._id === targetLine._id && item.lineKey !== lineKey)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (otherLinesQuantity + quantity > stock) {
      return { ok: false, message: STOCK_ERROR_MESSAGE };
    }

    setCart((prev) =>
      prev.map((item) => (item.lineKey === lineKey ? { ...item, quantity } : item))
    );
    return { ok: true };
  }, [cart]);

  const clearCart = useCallback(() => setCart([]), []);

  const applyInventoryUpdates = useCallback((updates = []) => {
    if (!updates.length) return;

    const stockByProductId = new Map(
      updates.map((entry) => [String(entry.productId), Number(entry.stock) || 0])
    );

    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        stock: stockByProductId.get(String(item._id)) ?? item.stock,
      }))
    );

    dispatchProductStockUpdates(updates);
  }, []);

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
      refreshCartStock,
      applyInventoryUpdates,
    }),
    [
      addToCart,
      applyInventoryUpdates,
      cart,
      cartCount,
      clearCart,
      refreshCartStock,
      removeFromCart,
      total,
      updateQuantity,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
