import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      updateQuantity(product.id, exists.qty + 1);
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(cart.map((item) => item.id === id ? { ...item, qty } : item));
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item.id === product.id);
    if (exists) setWishlist(wishlist.filter((item) => item.id !== product.id));
    else setWishlist([...wishlist, product]);
  };

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const cartCount = cart.reduce((t, item) => t + item.qty, 0);
  const cartTotal = cart.reduce((t, item) => t + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, updateQuantity, removeFromCart,
      wishlist, toggleWishlist, isWishlisted,
      cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);