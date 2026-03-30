import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cartAPI } from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [, setIsLoading] = useState(false);

  // Load cart from backend when user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      if (response.success && response.data.cart) {
        // Transform backend cart to frontend format
        const backendCart = response.data.cart.items.map(item => ({
          id: item.product._id,
          name: item.product.name,
          shortName: item.product.shortName || item.product.name,
          price: item.price,
          image: item.product.image,
          qty: item.quantity,
          itemId: item._id // Keep track of cart item ID for updates
        }));
        setCart(backendCart);
      }
    } catch (error) {
      console.error('Failed to load cart:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = useCallback((msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 2800);
  }, []);

  const addToCart = useCallback(
    async (product, qty = 1) => {
      const token = localStorage.getItem('token');
      
      // Update local state immediately for UI responsiveness
      setCart((prev) => {
        const exists = prev.find((i) => i.id === product.id);
        if (exists)
          return prev.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + qty } : i
          );
        return [...prev, { ...product, qty }];
      });

      showToast(`${product.shortName || product.name} added to bag ✓`);

      // Sync with backend if user is logged in
      if (token) {
        try {
          await cartAPI.addItem(product.id || product._id, qty);
        } catch (error) {
          console.error('Failed to sync cart with backend:', error.message);
        }
      }
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    async (id) => {
      const token = localStorage.getItem('token');
      const cartItem = cart.find(item => item.id === id);
      
      setCart((prev) => prev.filter((i) => i.id !== id));
      showToast("Item removed from bag", "info");

      // Sync with backend if user is logged in
      if (token && cartItem?.itemId) {
        try {
          await cartAPI.removeItem(cartItem.itemId);
        } catch (error) {
          console.error('Failed to remove from backend cart:', error.message);
        }
      }
    },
    [showToast, cart]
  );

  const updateQuantity = useCallback(
    async (id, qty) => {
      if (qty <= 0) {
        removeFromCart(id);
        return;
      }

      const token = localStorage.getItem('token');
      const cartItem = cart.find(item => item.id === id);

      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty } : i))
      );

      // Sync with backend if user is logged in
      if (token && cartItem?.itemId) {
        try {
          await cartAPI.updateItem(cartItem.itemId, qty);
        } catch (error) {
          console.error('Failed to update backend cart:', error.message);
        }
      }
    },
    [removeFromCart, cart]
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