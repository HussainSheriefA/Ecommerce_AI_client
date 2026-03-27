import React, { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");

  const showToast = useCallback((msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const addToCart = useCallback(
    (product, qty = 1) => {
      setCart((prev) => {
        const exists = prev.find((i) => i.id === product.id);
        if (exists)
          return prev.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + qty } : i
          );
        return [...prev, { ...product, qty }];
      });

      showToast(`${product.shortName || product.name} added to bag ✓`);
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (id) => {
      setCart((prev) => prev.filter((i) => i.id !== id));
      showToast("Item removed from bag", "info");
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (id, qty) => {
      if (qty <= 0) {
        removeFromCart(id);
        return;
      }

      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty } : i))
      );
    },
    [removeFromCart] // ✅ FIXED: added dependency
  );

  const toggleWishlist = useCallback(
    (product) => {
      setWishlist((prev) => {
        const exists = prev.find((i) => i.id === product.id);

        if (exists) {
          showToast("Removed from wishlist", "info");
          return prev.filter((i) => i.id !== product.id);
        }

        showToast(`${product.shortName || product.name} wishlisted ♥`);
        return [...prev, product];
      });
    },
    [showToast]
  );

  const addRecentlyViewed = useCallback((product) => {
    setRecentlyViewed((prev) =>
      [product, ...prev.filter((p) => p.id !== product.id)].slice(0, 8)
    );
  }, []);

  const isWishlisted = (id) => wishlist.some((i) => i.id === id);
  const cartCount = cart.reduce((t, i) => t + i.qty, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
        recentlyViewed,
        addRecentlyViewed,
        cartCount,
        cartTotal,
        toastMsg,
        toastType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);