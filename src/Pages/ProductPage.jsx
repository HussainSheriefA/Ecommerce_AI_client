import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import "./LandingPage.css";

function useMag() {
  const ref = React.useRef(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx,{stiffness:320,damping:22});
  const sy = useSpring(my,{stiffness:320,damping:22});
  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX-r.left-r.width/2)*0.38);
    my.set((e.clientY-r.top-r.height/2)*0.38);
  };
  const onLeave = () => { mx.set(0); my.set(0); };
  return { ref, sx, sy, onMove, onLeave };
}

function MBtn({ children, className, onClick, style={} }) {
  const { ref, sx, sy, onMove, onLeave } = useMag();
  return (
    <motion.button ref={ref} className={`mbt ${className||""}`}
      style={{ x:sx, y:sy, ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      onClick={onClick} whileTap={{ scale:0.94 }}>
      {children}
    </motion.button>
  );
}

function Stars({ rating }) {
  return (
    <div className="stars-row">
      {[1,2,3,4,5].map(i => <span key={i} className={i<=Math.round(rating)?"star on":"star"}>★</span>)}
      <span className="star-num">{rating.toFixed(1)}</span>
    </div>
  );
}

function Toast({ msg, type }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div className={`toast toast-${type}`}
          initial={{ y:80,opacity:0,scale:0.88 }} animate={{ y:0,opacity:1,scale:1 }}
          exit={{ y:80,opacity:0,scale:0.88 }} transition={{ type:"spring",stiffness:400,damping:26 }}>
          <span className="toast-icon">✓</span>{msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProductPage({ products }) {
  const { id } = useParams();
  const { addToCart, toggleWishlist, isWishlisted, cartCount, toastMsg, toastType } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("desc");
  const [navScrolled, setNavScrolled] = useState(false);

  const product = products.find(p => p.id === parseInt(id));
  const related = products.filter(p => p.id !== product?.id && p.category === product?.category).slice(0, 4);

  useEffect(() => {
    setActiveImg(0); setQty(1);
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [id]);

  if (!product) return (
    <div className="root not-found-page">
      <div className="nf-inner"><span className="nf-icon">🔍</span><h2>Product not found</h2><Link to="/" className="btn-primary mbt">← Back to Store</Link></div>
    </div>
  );

  const disc = Math.round((1 - product.price / product.originalPrice) * 100);
  const wished = isWishlisted(product.id);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true); setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="root">
      <Toast msg={toastMsg} type={toastType}/>

      {/* NAV */}
      <motion.nav className={`navbar ${navScrolled?"scrolled":""}`}
        initial={{ y:-80 }} animate={{ y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}>
        <div className="nav-l">
          <motion.div className="nav-logo" onClick={() => navigate("/")} whileHover={{ letterSpacing:"14px" }} transition={{ duration:0.4 }}>VELUR</motion.div>
        </div>
        <div className="nav-r">
          <MBtn className="btn-ghost nav-back" onClick={() => navigate("/")}>← Back</MBtn>
          <MBtn className="nav-bag" onClick={() => navigate("/cart")}>
            🛍 Bag {cartCount > 0 && <span className="bag-bubble">{cartCount}</span>}
          </MBtn>
        </div>
      </motion.nav>

      {/* BREADCRUMB */}
      <div className="pp-breadcrumb">
        <Link to="/">Home</Link> <span>›</span>
        <span className="bc-cat">{product.category}</span> <span>›</span>
        <span className="bc-cur">{product.name}</span>
      </div>

      {/* LAYOUT */}
      <div className="pp-layout">
        {/* LEFT: Images */}
        <motion.div className="pp-img-col" initial={{ opacity:0,x:-50 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.75 }}>
          <div className="pp-main-img-wrap">
            <AnimatePresence mode="wait">
              <motion.img key={activeImg} src={product.images[activeImg]} alt={product.name} className="pp-main-img"
                initial={{ opacity:0, scale:1.05 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                transition={{ duration:0.45 }}/>
            </AnimatePresence>
            {disc > 0 && <span className="pp-disc-badge">−{disc}%</span>}
            <span className={`pp-badge-label b-${product.badge.replace(/\s/g,"-").toLowerCase()}`}>{product.badge}</span>

            {/* Zoom hint */}
            <div className="pp-zoom-hint">🔍 Hover to explore</div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="pp-thumbs">
              {product.images.map((img,i) => (
                <motion.div key={i} className={`pp-thumb ${i===activeImg?"active":""}`}
                  onClick={() => setActiveImg(i)} whileHover={{ scale:1.06 }} whileTap={{ scale:0.94 }}>
                  <img src={img} alt={`${product.name} ${i+1}`}/>
                  {i===activeImg && <motion.div className="thumb-ring" layoutId="thumbRing"/>}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* RIGHT: Details */}
        <motion.div className="pp-detail-col" initial={{ opacity:0,x:50 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.75, delay:0.1 }}>
          <div className="pp-brand">{product.brand}</div>
          <h1 className="pp-name">{product.name}</h1>

          <div className="pp-rating-row">
            <Stars rating={product.rating}/>
            <span className="pp-rev-count">{product.reviews.toLocaleString()} customer reviews</span>
            <span className="pp-ques">Q&A</span>
          </div>

          {/* Price block */}
          <motion.div className="pp-price-box"
            initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3 }}>
            <span className="pp-price">${product.price.toLocaleString()}</span>
            <span className="pp-orig-price">${product.originalPrice.toLocaleString()}</span>
            {disc > 0 && (
              <motion.span className="pp-save-badge" animate={{ scale:[1,1.06,1] }} transition={{ duration:2, repeat:Infinity }}>
                Save {disc}%
              </motion.span>
            )}
            <div className="pp-price-note">Inclusive of all taxes · Free authentication included</div>
          </motion.div>

          {/* Tabs */}
          <div className="pp-tabs">
            {["desc","features","specs"].map(tab => (
              <motion.button key={tab} className={`pp-tab ${activeTab===tab?"active":""}`}
                onClick={() => setActiveTab(tab)} whileHover={{ y:-2 }} whileTap={{ scale:0.95 }}>
                {tab==="desc"?"Description":tab==="features"?"Features":"Specifications"}
                {activeTab===tab && <motion.div className="tab-line" layoutId="tabLine"/>}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab==="desc" && (
              <motion.p key="desc" className="pp-desc" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                {product.description}
              </motion.p>
            )}
            {activeTab==="features" && (
              <motion.ul key="feat" className="pp-features" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                {product.features.map((f,i) => (
                  <motion.li key={i} initial={{ opacity:0,x:-14 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.07 }}>
                    <span className="feat-check">✓</span>{f}
                  </motion.li>
                ))}
              </motion.ul>
            )}
            {activeTab==="specs" && (
              <motion.div key="specs" className="pp-specs" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                {Object.entries(product.specs).map(([k,v],i) => (
                  <motion.div key={k} className="spec-row" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.06 }}>
                    <span className="spec-k">{k}</span><span className="spec-v">{v}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Delivery box */}
          <div className="pp-delivery-box">
            {[
              { icon:"🚚", t:`Free Express Delivery — ${product.deliveryDays} business day${product.deliveryDays>1?"s":""}`, d:"Tracked and insured shipping" },
              { icon:"↩️", t:"Free 30-Day Returns", d:"Hassle-free return policy" },
              { icon:"🏅", t:"Authenticity Guaranteed", d:"Every item certified by our experts" },
              { icon:"💳", t:"Secure Checkout", d:"256-bit SSL encrypted payment" },
            ].map((row,i) => (
              <motion.div key={i} className="del-row" initial={{ opacity:0,x:-12 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.2+i*0.08 }}>
                <span className="del-icon">{row.icon}</span>
                <div><strong>{row.t}</strong><p>{row.d}</p></div>
              </motion.div>
            ))}
          </div>

          {/* Stock warning */}
          {product.stock <= 3 && (
            <motion.div className="pp-stock-warn" animate={{ opacity:[1,0.6,1] }} transition={{ duration:1.6, repeat:Infinity }}>
              ⚡ Only {product.stock} left in stock — order soon!
            </motion.div>
          )}

          {/* Qty selector */}
          <div className="pp-qty-row">
            <span className="qty-label">Quantity</span>
            <div className="qty-ctrl">
              <motion.button onClick={() => setQty(q => Math.max(1,q-1))} whileHover={{ background:"rgba(201,168,76,0.15)" }} whileTap={{ scale:0.88 }}>−</motion.button>
              <span>{qty}</span>
              <motion.button onClick={() => setQty(q => Math.min(product.stock,q+1))} whileHover={{ background:"rgba(201,168,76,0.15)" }} whileTap={{ scale:0.88 }}>+</motion.button>
            </div>
            <span className="qty-avail">{product.stock} available</span>
          </div>

          {/* Actions */}
          <div className="pp-actions">
            <MBtn className={`btn-primary pp-add ${added?"done":""}`} onClick={handleAdd}>
              <AnimatePresence mode="wait">
                {added
                  ? <motion.span key="ok" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}>✓ Added to Bag!</motion.span>
                  : <motion.span key="add" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}>Add to Bag</motion.span>
                }
              </AnimatePresence>
            </MBtn>
            <MBtn className={`btn-wish ${wished?"on":""}`} onClick={() => toggleWishlist(product)}>
              <motion.span animate={{ scale:wished?[1,1.4,1]:1 }} transition={{ duration:0.3 }}>
                {wished ? "♥ Wishlisted" : "♡ Wishlist"}
              </motion.span>
            </MBtn>
          </div>
          <MBtn className="btn-checkout-now" onClick={() => { addToCart(product, qty); navigate("/cart"); }}>
            Buy Now — Checkout →
          </MBtn>
        </motion.div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="related-section">
          <h3 className="related-title">You May Also Like</h3>
          <div className="related-grid">
            {related.map((p,i) => (
              <motion.div key={p.id} className="related-card"
                initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                whileHover={{ y:-6, boxShadow:"0 20px 50px rgba(0,0,0,0.6)" }}>
                <Link to={`/product/${p.id}`}>
                  <div className="rc-img-box">
                    <motion.img src={p.image} alt={p.name} whileHover={{ scale:1.08 }} transition={{ duration:0.6 }}/>
                  </div>
                  <div className="rc-body">
                    <span className="rc-brand">{p.brand}</span>
                    <p className="rc-name">{p.name}</p>
                    <div className="rc-bottom">
                      <span className="rc-price">${p.price.toLocaleString()}</span>
                      <Stars rating={p.rating}/>
                    </div>
                  </div>
                </Link>
                <MBtn className="btn-bag rc-add" onClick={e => { e.preventDefault(); addToCart(p); }}>Add to Bag</MBtn>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer" style={{ marginTop:80 }}>
        <div className="footer-bottom" style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:32 }}>
          <span>© {new Date().getFullYear()} VELUR Maison de Luxe. All Rights Reserved.</span>
          <div className="fb-legal">
            {["Privacy","Terms","Accessibility"].map(l => (
              <motion.span key={l} className="fbl" whileHover={{ color:"#c9a84c" }}>{l}</motion.span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}