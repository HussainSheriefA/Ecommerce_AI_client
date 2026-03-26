import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion } from "framer-motion";
import "./LandingPage.css";

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "star filled" : "star"}>★</span>
      ))}
      <span className="rating-num">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ProductPage({ products }) {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isWishlisted, cartCount } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(p => p.id === parseInt(id));
  const related = products.filter(p => p.id !== product?.id && p.category === product?.category).slice(0, 4);

  if (!product) return (
    <div className="not-found">
      <h2>Product not found</h2>
      <Link to="/">← Back to Store</Link>
    </div>
  );

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const wished = isWishlisted(product.id);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="page-root">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate("/")}>VELUR</div>
        </div>
        <div className="nav-right">
          <Link to="/" className="nav-link">← Back</Link>
          <Link to="/cart" className="cart-btn">
            🛍 Cart <span className="cart-badge">{cartCount}</span>
          </Link>
        </div>
      </nav>

      <div className="pp-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> › <span>{product.category}</span> › <span>{product.name}</span>
        </div>

        <div className="pp-layout">
          {/* Image */}
          <motion.div
            className="pp-img-col"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="pp-img-wrap">
              <img src={product.image} alt={product.name} />
              {discount > 0 && <span className="pp-discount-badge">−{discount}%</span>}
              <span className={`pp-badge-label badge-${product.badge.replace(/\s/g,"-").toLowerCase()}`}>
                {product.badge}
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            className="pp-detail-col"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="pp-brand">{product.brand}</div>
            <h1 className="pp-name">{product.name}</h1>

            <div className="pp-rating-row">
              <StarRating rating={product.rating} />
              <span className="pp-review-count">{product.reviews.toLocaleString()} customer reviews</span>
            </div>

            <div className="pp-price-block">
              <span className="pp-price">${product.price.toLocaleString()}</span>
              <span className="pp-original">${product.originalPrice.toLocaleString()}</span>
              <span className="pp-save">You save: ${(product.originalPrice - product.price).toLocaleString()} ({discount}%)</span>
            </div>

            <p className="pp-description">{product.description}</p>

            <div className="pp-features">
              <h4>Key Features</h4>
              <ul>
                {product.features.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <span className="feature-check">✓</span> {f}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="pp-delivery-box">
              <div className="db-row">
                <span>🚚</span>
                <div>
                  <strong>Free Express Delivery</strong>
                  <p>Arrives in {product.deliveryDays} business day{product.deliveryDays > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="db-row">
                <span>↩️</span>
                <div>
                  <strong>Free 30-Day Returns</strong>
                  <p>Hassle-free return policy</p>
                </div>
              </div>
              <div className="db-row">
                <span>🏅</span>
                <div>
                  <strong>Authenticity Guaranteed</strong>
                  <p>Every item verified by experts</p>
                </div>
              </div>
            </div>

            {product.stock <= 3 && (
              <div className="pp-stock-warn">
                ⚠️ Only {product.stock} left in stock — order soon!
              </div>
            )}

            <div className="pp-qty-row">
              <label>Quantity:</label>
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>

            <div className="pp-action-row">
              <motion.button
                className={`btn-pp-cart ${added ? "added" : ""}`}
                onClick={handleAdd}
                whileTap={{ scale: 0.97 }}
              >
                {added ? "✓ Added to Cart!" : "Add to Cart"}
              </motion.button>
              <button
                className={`btn-pp-wish ${wished ? "wished" : ""}`}
                onClick={() => toggleWishlist(product)}
              >
                {wished ? "♥ Wishlisted" : "♡ Wishlist"}
              </button>
            </div>

            <Link to="/cart" className="btn-pp-checkout">
              Proceed to Checkout →
            </Link>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="related-section">
            <h3 className="related-title">You May Also Like</h3>
            <div className="related-grid">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  className="related-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/product/${p.id}`}>
                    <div className="rc-img">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <div className="rc-body">
                      <span className="rc-brand">{p.brand}</span>
                      <p className="rc-name">{p.name}</p>
                      <p className="rc-price">${p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="footer" style={{ marginTop: "60px" }}>
        <div className="footer-bottom">
          <span>© 2026 VELUR Luxury. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}