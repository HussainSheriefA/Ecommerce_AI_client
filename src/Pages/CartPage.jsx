import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import "./LandingPage.css";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  const tax      = cartTotal * 0.1;
  const shipping = cartTotal >= 500 ? 0 : 25;
  const total    = cartTotal + tax + shipping;

  if (cart.length === 0) return (
    <div className="page-root">
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate("/")}>VELUR</div>
        </div>
        <div className="nav-right">
          <Link to="/" className="nav-link">← Continue Shopping</Link>
        </div>
      </nav>
      <div className="empty-cart">
        <div className="empty-icon">🛍</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn-hero-primary">Start Shopping →</Link>
      </div>
    </div>
  );

  return (
    <div className="page-root">
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate("/")}>VELUR</div>
        </div>
        <div className="nav-right">
          <Link to="/" className="nav-link">← Continue Shopping</Link>
        </div>
      </nav>

      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart <span>({cartCount} items)</span></h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items-col">
            <AnimatePresence>
              {cart.map(item => {
                const itemTotal = item.price * item.qty;
                const discount  = Math.round((1 - item.price / item.originalPrice) * 100);
                return (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.35 }}
                    layout
                  >
                    <div className="ci-img">
                      <img src={item.image} alt={item.name} />
                      {discount > 0 && <span className="ci-discount">−{discount}%</span>}
                    </div>
                    <div className="ci-details">
                      <span className="ci-brand">{item.brand}</span>
                      <h3 className="ci-name">
                        <Link to={`/product/${item.id}`}>{item.name}</Link>
                      </h3>
                      <p className="ci-desc">{item.description?.slice(0,80)}…</p>
                      <div className="ci-delivery">🚚 Free delivery in {item.deliveryDays} days</div>
                      <div className="ci-controls">
                        <div className="qty-control">
                          <button onClick={() => updateQuantity(item.id, item.qty - 1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                        </div>
                        <button className="ci-remove" onClick={() => removeFromCart(item.id)}>
                          🗑 Remove
                        </button>
                        <button className="ci-save">♡ Save for Later</button>
                      </div>
                    </div>
                    <div className="ci-price-col">
                      <div className="ci-item-total">${itemTotal.toLocaleString()}</div>
                      <div className="ci-unit">
                        ${item.price.toLocaleString()} each
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Promo */}
            <div className="promo-box">
              <input type="text" placeholder="Enter promo code" className="promo-input" />
              <button className="promo-btn">Apply</button>
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            className="order-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>Order Summary</h3>
            <div className="os-row">
              <span>Subtotal ({cartCount} items)</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="os-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="os-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="free-ship">FREE</span> : `$${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <div className="ship-note">
                Add ${(500 - cartTotal).toFixed(0)} more for free shipping
              </div>
            )}
            <div className="os-divider" />
            <div className="os-total">
              <span>Total</span>
              <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <button className="btn-checkout">
              Proceed to Checkout →
            </button>
            <div className="os-secure">
              🔒 Secure Checkout · SSL Encrypted
            </div>
            <div className="os-payments">
              <span>VISA</span><span>MC</span><span>AMEX</span><span>PayPal</span><span>Apple Pay</span>
            </div>
            <div className="os-trust">
              <span>✓ Authenticity Guaranteed</span>
              <span>✓ Free Returns</span>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="footer" style={{ marginTop: "80px" }}>
        <div className="footer-bottom">
          <span>© 2026 VELUR Luxury. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}