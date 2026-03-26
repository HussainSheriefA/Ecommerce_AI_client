import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import "./LandingPage.css";

const heroSlides = [
  {
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400&q=90",
    eyebrow: "New Season · SS 2026",
    title: "Redefine\nYour World",
    sub: "Curated luxury for the discerning few",
    cta: "Shop Now",
  },
  {
    img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1400&q=90",
    eyebrow: "Exclusive Collection",
    title: "Crafted\nto Last",
    sub: "Timeless pieces from the world's finest houses",
    cta: "Explore",
  },
  {
    img: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1400&q=90",
    eyebrow: "Limited Editions",
    title: "Wear Your\nAmbition",
    sub: "Only the rarest make it here",
    cta: "Discover",
  },
];

const categories = ["All", "Watches", "Bags", "Apparel", "Shoes", "Accessories", "Fragrance", "Jewelry"];

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

export default function LandingPage({ products }) {
  const { addToCart, toggleWishlist, isWishlisted, cartCount } = useCart();
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedId, setAddedId] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity  = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  let filtered = products
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

  if (sortBy === "price-asc")  filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sortBy === "rating")     filtered = [...filtered].sort((a,b) => b.rating - a.rating);

  const slide = heroSlides[heroIdx];

  return (
    <div className="page-root">

      {/* ── TOPBAR ── */}
      <div className="topbar">
        <span>🚚 Free Express Delivery on Orders Over $500</span>
        <span>|</span>
        <span>✓ Authenticity Guaranteed on All Items</span>
        <span>|</span>
        <span>⭐ Members get 10% off — Join Free</span>
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav
        className="navbar"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
      >
        <div className="nav-left">
          <div className="nav-logo" onClick={() => navigate("/")}>VELUR</div>
          <div className="nav-search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search brands, products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="nav-right">
          <span className="nav-link">New Arrivals</span>
          <span className="nav-link">Sale</span>
          <span className="nav-link">Brands</span>
          <Link to="/cart" className="cart-btn">
            <span className="cart-icon">🛍</span>
            <span>Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            className="hero-bg"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ y: heroParallax }}
          >
            <img src={slide.img} alt="hero" />
            <div className="hero-overlay" />
          </motion.div>
        </AnimatePresence>

        <motion.div className="hero-content" style={{ opacity: heroOpacity }}>
          <motion.span
            className="hero-eyebrow"
            key={`eyebrow-${heroIdx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {slide.eyebrow}
          </motion.span>
          <motion.h1
            className="hero-title"
            key={`title-${heroIdx}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16,1,0.3,1] }}
          >
            {slide.title.split("\n").map((line,i) => <span key={i}>{line}<br/></span>)}
          </motion.h1>
          <motion.p
            className="hero-sub"
            key={`sub-${heroIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {slide.sub}
          </motion.p>
          <motion.div
            className="hero-btns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <button className="btn-hero-primary">{slide.cta} →</button>
            <button className="btn-hero-ghost">View Lookbook</button>
          </motion.div>
        </motion.div>

        {/* Slide dots */}
        <div className="hero-dots">
          {heroSlides.map((_,i) => (
            <button
              key={i}
              className={`hero-dot ${i === heroIdx ? "active" : ""}`}
              onClick={() => setHeroIdx(i)}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll">
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <div className="trust-bar">
        {[
          { icon: "🏅", label: "100% Authentic", desc: "Every item verified" },
          { icon: "🚀", label: "Express Delivery", desc: "2-day shipping available" },
          { icon: "↩️", label: "Easy Returns", desc: "30-day free returns" },
          { icon: "🔒", label: "Secure Payment", desc: "256-bit SSL encrypted" },
          { icon: "💎", label: "Expert Curation", desc: "Hand-selected by stylists" },
        ].map((b, i) => (
          <motion.div
            key={i}
            className="trust-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="trust-icon">{b.icon}</span>
            <div>
              <div className="trust-label">{b.label}</div>
              <div className="trust-desc">{b.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      <section className="cat-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Browse By</p>
            <h2 className="section-title">Categories</h2>
          </div>
        </div>
        <div className="cat-scroll">
          {categories.map(cat => (
            <motion.button
              key={cat}
              className={`cat-chip ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
              whileTap={{ scale: 0.95 }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="products-section">
        <div className="products-header">
          <div>
            <p className="section-eyebrow">
              {activeCategory === "All" ? "All Products" : activeCategory}
            </p>
            <h2 className="section-title">
              {filtered.length} {filtered.length === 1 ? "Item" : "Items"}
            </h2>
          </div>
          <div className="sort-row">
            <label>Sort by:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <motion.div className="product-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const discount = Math.round((1 - p.price / p.originalPrice) * 100);
              const wished = isWishlisted(p.id);
              return (
                <motion.div
                  key={p.id}
                  className="pcard"
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/product/${p.id}`} className="pcard-img-link">
                    <div className="pcard-img-wrap">
                      <img src={p.image} alt={p.name} />
                      <div className="pcard-img-overlay" />
                      {/* Badges */}
                      <div className="pcard-badges">
                        <span className={`pcard-badge badge-${p.badge.replace(/\s/g,"-").toLowerCase()}`}>
                          {p.badge}
                        </span>
                        {discount > 0 && (
                          <span className="pcard-badge badge-discount">−{discount}%</span>
                        )}
                      </div>
                      {/* Stock warning */}
                      {p.stock <= 3 && (
                        <div className="pcard-stock-warn">Only {p.stock} left!</div>
                      )}
                      {/* Wishlist */}
                      <button
                        className={`wishlist-btn ${wished ? "wished" : ""}`}
                        onClick={e => { e.preventDefault(); toggleWishlist(p); }}
                        title="Add to Wishlist"
                      >
                        {wished ? "♥" : "♡"}
                      </button>
                    </div>
                  </Link>

                  <div className="pcard-body">
                    <div className="pcard-brand">{p.brand}</div>
                    <Link to={`/product/${p.id}`} className="pcard-name-link">
                      <h3 className="pcard-name">{p.name}</h3>
                    </Link>
                    <StarRating rating={p.rating} />
                    <p className="pcard-reviews">({p.reviews.toLocaleString()} reviews)</p>
                    <p className="pcard-desc">{p.description.slice(0, 80)}…</p>

                    <div className="pcard-price-row">
                      <span className="pcard-price">${p.price.toLocaleString()}</span>
                      <span className="pcard-original">${p.originalPrice.toLocaleString()}</span>
                      <span className="pcard-save">Save ${(p.originalPrice - p.price).toLocaleString()}</span>
                    </div>

                    <div className="pcard-delivery">
                      🚚 Free delivery in {p.deliveryDays} day{p.deliveryDays > 1 ? "s" : ""}
                    </div>

                    <div className="pcard-actions">
                      <motion.button
                        className={`btn-add-cart ${addedId === p.id ? "added" : ""}`}
                        onClick={e => handleAddToCart(e, p)}
                        whileTap={{ scale: 0.97 }}
                      >
                        {addedId === p.id ? "✓ Added!" : "Add to Cart"}
                      </motion.button>
                      <Link to={`/product/${p.id}`} className="btn-view-detail">
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── BRAND STRIP ── */}
      <div className="brand-strip">
        <p className="bs-label">Authorized Retailer For</p>
        <div className="brand-list">
          {["ROLEX","HERMÈS","GUCCI","CARTIER","DIOR","VALENTINO","CHANEL","BALENCIAGA","VAN CLEEF"].map(b => (
            <span key={b} className="brand-name">{b}</span>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="ft-brand-col">
            <div className="ft-logo">VELUR</div>
            <p className="ft-tagline">The world's finest luxury goods,<br />curated and authenticated.</p>
            <div className="ft-socials">
              <span>IG</span><span>FB</span><span>TW</span><span>YT</span>
            </div>
          </div>
          <div className="ft-link-cols">
            {[
              { title: "Shop", links: ["New Arrivals","Best Sellers","Sale","Gift Cards"] },
              { title: "Support", links: ["Authentication","Shipping","Returns","Contact Us"] },
              { title: "Company", links: ["About","Careers","Press","Sustainability"] },
            ].map(col => (
              <div key={col.title} className="ft-col">
                <h4>{col.title}</h4>
                <ul>{col.links.map(l => <li key={l}>{l}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 VELUR Luxury. All Rights Reserved.</span>
          <div className="fb-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}