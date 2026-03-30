import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import "./LandingPage.css";

/* ─── CONSTANTS ─────────────────────────── */
const HERO_SLIDES = [
  { img:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600&q=90", eye:"New Season · SS 2026", lines:["Redefine","Your World"], sub:"Curated luxury for the discerning few", accent:"#c9a84c" },
  { img:"https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=90", eye:"Exclusive Archive", lines:["Crafted","to Last"], sub:"Timeless pieces from the world's finest houses", accent:"#6aada8" },
  { img:"https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1600&q=90", eye:"Limited Editions", lines:["Wear Your","Ambition"], sub:"Only the rarest make it here", accent:"#c4696a" },
];
const CATS = ["All","Watches","Bags","Apparel","Shoes","Accessories","Fragrance","Jewelry"];
const BADGE_CLASS = { "Best Seller":"b-gold","Limited":"b-violet","New Arrival":"b-green","Rare Find":"b-red","SS26":"b-blue","Trending":"b-orange","Icon":"b-purple","Timeless":"b-teal","Iconic":"b-pink" };
const MARQUEE = ["ROLEX","·","HERMÈS","·","GUCCI","·","CARTIER","·","DIOR","·","VALENTINO","·","CHANEL","·","BALENCIAGA","·","VAN CLEEF","·","AUDEMARS PIGUET","·","LOUBOUTIN","·","RAY-BAN","·"];

/* ─── MAGNETIC BUTTON HOOK ─────────────── */
function useMag(strength = 0.38) {
  const ref = useRef(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness:320, damping:22 });
  const sy = useSpring(my, { stiffness:320, damping:22 });
  const onMove = useCallback(e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width/2) * strength);
    my.set((e.clientY - r.top - r.height/2) * strength);
  }, [mx, my, strength]);
  const onLeave = useCallback(() => { mx.set(0); my.set(0); }, [mx, my]);
  return { ref, sx, sy, onMove, onLeave };
}

/* ─── 3D TILT HOOK ─────────────────────── */
function useTilt() {
  const ref = useRef(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness:220, damping:20 });
  const sry = useSpring(ry, { stiffness:220, damping:20 });
  const onMove = useCallback(e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -16);
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
  }, [rx, ry]);
  const onLeave = useCallback(() => { rx.set(0); ry.set(0); }, [rx, ry]);
  return { ref, srx, sry, onMove, onLeave };
}

/* ─── PARTICLE CANVAS ──────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let raf, W, H;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const N = 70;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-0.5)*0.28, vy: (Math.random()-0.5)*0.28,
      r: Math.random()*1.3+0.3, a: Math.random()*0.4+0.1,
    }));
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(201,168,76,${p.a})`; ctx.fill();
      });
      for (let i = 0; i < N; i++) for (let j = i+1; j < N; j++) {
        const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y, d = Math.hypot(dx,dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(201,168,76,${0.06*(1-d/120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="particle-canvas" />;
}

/* ─── FLOATING ORB ─────────────────────── */
function Orb({ color="#c9a84c", size=500, style={} }) {
  return (
    <motion.div className="orb" style={{ width:size, height:size,
      background:`radial-gradient(circle, ${color}1a 0%, transparent 70%)`, ...style }}
      animate={{ scale:[1,1.2,1], opacity:[0.5,0.9,0.5] }}
      transition={{ duration:8, repeat:Infinity, ease:"easeInOut" }}
    />
  );
}

/* ─── ANIMATED VIDEO BG ─────────────────── */
function VideoBg({ src, fallbackImg }) {
  const vRef = useRef(null);
  useEffect(() => { if (vRef.current) vRef.current.play().catch(() => {}); }, []);
  return (
    <div className="video-bg-wrap">
      {src ? (
        <video ref={vRef} className="video-bg" autoPlay muted loop playsInline poster={fallbackImg}>
          <source src={src} type="video/mp4"/>
          <img src={fallbackImg} alt="bg" className="video-bg"/>
        </video>
      ) : (
        <img src={fallbackImg} alt="bg" className="video-bg"/>
      )}
    </div>
  );
}

/* ─── TOAST ─────────────────────────────── */
function Toast({ msg, type }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.div className={`toast toast-${type}`}
          initial={{ y:80, opacity:0, scale:0.88 }}
          animate={{ y:0, opacity:1, scale:1 }}
          exit={{ y:80, opacity:0, scale:0.88 }}
          transition={{ type:"spring", stiffness:400, damping:26 }}
        >
          <motion.span className="toast-icon"
            animate={{ rotate:[0,360] }} transition={{ duration:0.5 }}>
            {type === "success" ? "✓" : "ℹ"}
          </motion.span>
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── MAGNETIC BUTTON ───────────────────── */
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

/* ─── STARS ─────────────────────────────── */
function Stars({ rating }) {
  return (
    <div className="stars-row">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "star on" : "star"}>★</span>
      ))}
      <span className="star-num">{rating.toFixed(1)}</span>
    </div>
  );
}

/* ─── COUNT-UP ──────────────────────────── */
function CountUp({ to, prefix="", suffix="" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null), done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const s = performance.now();
        const tick = n => {
          const t = Math.min((n-s)/1800, 1), ease = 1-Math.pow(1-t,4);
          setV(Math.round(ease*to));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold:0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{v.toLocaleString()}{suffix}</span>;
}

/* ─── PRODUCT CARD ──────────────────────── */
function PCard({ p, i }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { ref, srx, sry, onMove, onLeave } = useTilt();
  const [adding, setAdding] = useState(false);
  const wished = isWishlisted(p.id);
  const disc = Math.round((1-p.price/p.originalPrice)*100);

  const add = e => {
    e.preventDefault(); e.stopPropagation();
    if (adding) return;
    setAdding(true); addToCart(p);
    setTimeout(() => setAdding(false), 1700);
  };

  return (
    <motion.article ref={ref} className="pcard"
      style={{ rotateX:srx, rotateY:sry, transformPerspective:1000 }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      layout
      initial={{ opacity:0, y:55, scale:0.94 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, scale:0.91, y:24 }}
      transition={{ duration:0.55, delay:i*0.06 }}
    >
      {/* Glow halo */}
      <div className="pcard-halo" style={{ background:`radial-gradient(circle, ${p.color}30 0%, transparent 68%)` }}/>

      {/* Image area */}
      <Link to={`/product/${p.id}`} className="pcard-img-link">
        <div className="pcard-img-box">
          <motion.img src={p.image} alt={p.name} className="pcard-img" whileHover={{ scale:1.1 }} transition={{ duration:0.8 }}/>
          <div className="pcard-gradient"/>

          {/* Shimmer sweep */}
          <div className="pcard-shimmer"/>

          {/* Badges */}
          <div className="pcard-badges-row">
            <span className={`pbadge ${BADGE_CLASS[p.badge]||"b-gold"}`}>{p.badge}</span>
            {disc > 0 && <span className="pbadge b-disc">−{disc}%</span>}
            {p.isNew && <span className="pbadge b-new">NEW</span>}
          </div>

          {/* Low stock */}
          {p.stock <= 3 && (
            <motion.div className="low-stock" animate={{ opacity:[1,0.55,1] }} transition={{ duration:1.5, repeat:Infinity }}>
              ⚡ Only {p.stock} left
            </motion.div>
          )}

          {/* Wishlist */}
          <motion.button className={`wish-btn ${wished?"on":""}`}
            onClick={e => { e.preventDefault(); toggleWishlist(p); }}
            whileHover={{ scale:1.28 }} whileTap={{ scale:0.82 }}>
            <motion.span animate={{ scale:wished?[1,1.6,1]:1 }} transition={{ duration:0.35 }}>
              {wished ? "♥" : "♡"}
            </motion.span>
          </motion.button>

          {/* Quick-add overlay */}
          <motion.div className="quick-overlay"
            initial={{ opacity:0, y:12 }}
            whileHover={{ opacity:1, y:0 }}
            transition={{ duration:0.28 }}>
            <MBtn className={`quick-btn ${adding?"ok":""}`} onClick={add}>
              {adding ? "✓ Added!" : "+ Quick Add"}
            </MBtn>
          </motion.div>
        </div>
      </Link>

      {/* Info area */}
      <div className="pcard-body">
        <div className="pcard-brand">{p.brand}</div>
        <Link to={`/product/${p.id}`}>
          <h3 className="pcard-name">{p.name}</h3>
        </Link>
        <Stars rating={p.rating}/>
        <p className="pcard-rev">({p.reviews.toLocaleString()} verified reviews)</p>
        <p className="pcard-desc">{p.description.slice(0, 78)}…</p>

        <div className="pcard-price-line">
          <span className="pcard-price">${p.price.toLocaleString()}</span>
          <span className="pcard-orig">${p.originalPrice.toLocaleString()}</span>
          {disc > 0 && <span className="pcard-save-pill">Save {disc}%</span>}
        </div>

        <div className="pcard-delivery">
          <motion.span className="dot-pulse" animate={{ scale:[1,1.5,1], opacity:[1,0.4,1] }} transition={{ duration:1.8, repeat:Infinity }}/>
          Free delivery in {p.deliveryDays} day{p.deliveryDays > 1 ? "s" : ""}
        </div>

        <div className="pcard-foot">
          <MBtn className={`btn-bag ${adding?"done":""}`} onClick={add}>
            <AnimatePresence mode="wait">
              {adding
                ? <motion.span key="y" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}>✓ Added</motion.span>
                : <motion.span key="n" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}>Add to Bag</motion.span>
              }
            </AnimatePresence>
          </MBtn>
          <Link to={`/product/${p.id}`} className="btn-arrow-link">
            <motion.span whileHover={{ x:4 }}>→</motion.span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── MAIN PAGE ─────────────────────────── */
export default function LandingPage({ products: propProducts }) {
  const { cartCount, toastMsg, toastType } = useCart();
  const navigate = useNavigate();
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [navScrolled, setNavScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState(propProducts || []);
  const [isLoading, setIsLoading] = useState(!propProducts);
  const { scrollY } = useScroll();
  const pY = useTransform(scrollY, [0,700], [0,160]);
  const pO = useTransform(scrollY, [0,500], [1,0]);

  // Fetch products from API if not provided as props
  useEffect(() => {
    if (!propProducts || propProducts.length === 0) {
      fetchProducts();
    }
  }, [propProducts]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { productAPI } = await import('../services/api');
      const response = await productAPI.getAll({ limit: 100 });
      if (response.success && response.data.products) {
        // Transform backend products to match frontend format
        const transformedProducts = response.data.products.map(p => ({
          id: p._id,
          name: p.name,
          shortName: p.shortName || p.name,
          price: p.price,
          originalPrice: p.originalPrice || p.price,
          category: p.category,
          brand: p.brand,
          image: p.image,
          images: p.images || [p.image],
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          badge: p.badge,
          stock: p.stock || 0,
          description: p.description,
          features: p.features || [],
          specs: p.specs || {},
          isNew: p.badge === 'New Arrival',
          isTrending: p.badge === 'Best Seller',
          color: '#c9a84c'
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i+1)%HERO_SLIDES.length), 5800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const u = scrollY.on("change", v => setNavScrolled(v > 60));
    return u;
  }, [scrollY]);

  let filtered = products
    .filter(p => activeCat === "All" || p.category === activeCat)
    .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()));

  if (sortBy === "price-asc")  filtered = [...filtered].sort((a,b) => a.price-b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a,b) => b.price-a.price);
  if (sortBy === "rating")     filtered = [...filtered].sort((a,b) => b.rating-a.rating);
  if (sortBy === "new")        filtered = [...filtered].filter(p => p.isNew).concat(filtered.filter(p => !p.isNew));

  const slide = HERO_SLIDES[heroIdx];

  return (
    <div className="root">
      <Particles/>
      <Toast msg={toastMsg} type={toastType}/>

      {/* Floating orbs */}
      <Orb color="#c9a84c" size={700} style={{ position:"fixed",top:"-8%",right:"-14%",zIndex:0,pointerEvents:"none" }}/>
      <Orb color="#6aada8" size={480} style={{ position:"fixed",bottom:"10%",left:"-12%",zIndex:0,pointerEvents:"none" }}/>
      <Orb color="#c4696a" size={320} style={{ position:"fixed",top:"45%",left:"35%",zIndex:0,pointerEvents:"none" }}/>

      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div className="topbar-scroller">
          {Array(4).fill(["🚚 Free Express Delivery Over $500","·","✓ 100% Authenticity Guaranteed","·","⭐ Members Save 10% — Join Free","·","↩️ 30-Day Free Returns","·"]).flat().map((t,i) => (
            <span key={i} className={t==="·" ? "tb-dot":"tb-item"}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav className={`navbar ${navScrolled?"scrolled":""}`}
        initial={{ y:-90 }} animate={{ y:0 }} transition={{ duration:0.85, ease:[0.16,1,0.3,1] }}>
        <div className="nav-l">
          <motion.div className="nav-logo" onClick={() => navigate("/")} whileHover={{ letterSpacing:"14px" }} transition={{ duration:0.4 }}>
            VELUR
          </motion.div>
          <ul className="nav-links">
            {["New Arrivals","Collections","Brands","Sale","Journal"].map(l => (
              <motion.li key={l} whileHover={{ y:-2 }} className="nl">
                <span>{l}</span><span className="nl-line"/>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="nav-r">
          <motion.button className="nav-icon" onClick={() => setShowSearch(s => !s)} whileHover={{ scale:1.15, background:"rgba(201,168,76,0.12)" }} whileTap={{ scale:0.88 }}>
            {showSearch ? "✕" : "⌕"}
          </motion.button>
          <motion.button className="nav-icon" onClick={() => navigate("/login")} whileHover={{ scale:1.15, background:"rgba(201,168,76,0.12)" }} whileTap={{ scale:0.88 }}>
            👤
          </motion.button>
          <motion.button className="nav-icon" whileHover={{ scale:1.15, background:"rgba(201,168,76,0.12)" }} whileTap={{ scale:0.88 }}>
            ♡
          </motion.button>
          <MBtn className="nav-bag" onClick={() => navigate("/cart")}>
            🛍 Bag
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span key={cartCount} className="bag-bubble" initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}>
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </MBtn>
          <motion.button className="hamburger" onClick={() => setMenuOpen(m => !m)} whileHover={{ scale:1.08 }} whileTap={{ scale:0.9 }}>
            {menuOpen ? "✕" : "☰"}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu" initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ type:"spring", damping:28, stiffness:250 }}>
            <div className="mm-logo">VELUR</div>
            {["New Arrivals","Collections","Brands","Sale","Journal","Cart","Account"].map((l,i) => (
              <motion.div key={l} className="mm-link" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.06 }}>
                {l}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search panel */}
      <AnimatePresence>
        {showSearch && (
          <motion.div className="search-panel" initial={{ opacity:0,y:-20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-20 }}>
            <div className="sp-row">
              <span className="sp-icon">⌕</span>
              <input autoFocus type="text" placeholder="Search brands, products, categories…"
                value={query} onChange={e => setQuery(e.target.value)} className="sp-input"/>
              {query && <motion.button className="sp-clear" onClick={() => setQuery("")} whileTap={{ scale:0.9 }}>✕</motion.button>}
            </div>
            {query && <div className="sp-hint">{filtered.length} result{filtered.length!==1?"s":""} for "{query}"</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="hero">
        <AnimatePresence mode="wait">
          <motion.div key={heroIdx} className="hero-media" style={{ y:pY }}
            initial={{ opacity:0, scale:1.08 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
            transition={{ duration:1.4 }}>
            <VideoBg fallbackImg={slide.img}/>
            <div className="hero-overlay"/>
            <div className="hero-tint" style={{ background:slide.accent+"18" }}/>
            {/* animated grid lines */}
            <div className="hero-grid-lines">
              {Array.from({length:6}).map((_,i) => <div key={i} className="hgl"/>)}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div className="hero-content" style={{ opacity:pO }}>
          <AnimatePresence mode="wait">
            <motion.div key={`hc${heroIdx}`} className="hero-inner">
              <motion.div className="hero-eye" initial={{ opacity:0,x:-30 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.3 }}>
                <span className="eye-dot" style={{ background:slide.accent }}/>
                <motion.span animate={{ color:[slide.accent,"#fff",slide.accent] }} transition={{ duration:3, repeat:Infinity }}>
                  {slide.eye}
                </motion.span>
              </motion.div>

              <div className="hero-title-stack">
                {slide.lines.map((line,i) => (
                  <div key={i} className="hero-title-clip">
                    <motion.h1 className="hero-title"
                      initial={{ y:"100%", opacity:0 }} animate={{ y:0, opacity:1 }}
                      transition={{ delay:0.45+i*0.2, duration:1, ease:[0.16,1,0.3,1] }}>
                      {i===1 ? <em style={{ color:slide.accent }}>{line}</em> : line}
                    </motion.h1>
                  </div>
                ))}
              </div>

              <motion.p className="hero-sub" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}>
                {slide.sub}
              </motion.p>

              <motion.div className="hero-ctas" initial={{ opacity:0,y:22 }} animate={{ opacity:1,y:0 }} transition={{ delay:1.3 }}>
                <MBtn className="btn-primary" onClick={() => document.querySelector(".products-section")?.scrollIntoView({ behavior:"smooth" })}>
                  <span>Shop Collection</span><span className="cta-arrow">→</span>
                </MBtn>
                <MBtn className="btn-ghost">View Lookbook</MBtn>
              </motion.div>

              {/* Live indicator */}
              <motion.div className="live-badge" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.6 }}>
                <motion.span className="live-dot" animate={{ scale:[1,1.5,1], opacity:[1,0.4,1] }} transition={{ duration:1.5, repeat:Infinity }}/>
                {products.length} items in stock · Updated live
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide controls */}
        <div className="hero-controls">
          <div className="hero-dots">
            {HERO_SLIDES.map((_,i) => (
              <motion.button key={i} className={`hdot ${i===heroIdx?"active":""}`}
                onClick={() => setHeroIdx(i)} whileHover={{ scale:1.4 }}
                style={i===heroIdx?{background:slide.accent,width:28}:undefined}/>
            ))}
          </div>
          <span className="hero-idx">
            <motion.span key={heroIdx} initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} style={{ color:slide.accent }}>
              {String(heroIdx+1).padStart(2,"0")}
            </motion.span>
            &ensp;/&ensp;{String(HERO_SLIDES.length).padStart(2,"0")}
          </span>
        </div>

        <motion.div className="scroll-cue" animate={{ y:[0,12,0] }} transition={{ duration:2, repeat:Infinity }}>
          <div className="sc-bar" style={{ background:`linear-gradient(to bottom,${slide.accent},transparent)` }}/>
          <span>Scroll</span>
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="mq-bar">
        <div className="mq-track">
          {Array(3).fill(MARQUEE).flat().map((t,i) => (
            <span key={i} className={t==="·"?"mq-sep":"mq-brand"}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats-section">
        {[
          { to:50000, label:"Happy Clients", suffix:"+" },
          { to:12,    label:"Global Houses", suffix:"+" },
          { to:99,    label:"Auth. Rate",    suffix:"%" },
          { to:4,     label:"Avg Delivery",  suffix:" Days" },
        ].map((s,i) => (
          <motion.div key={i} className="stat-card"
            initial={{ opacity:0,y:30 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
            whileHover={{ y:-6, boxShadow:"0 20px 50px rgba(201,168,76,0.12)" }}>
            <div className="stat-val"><CountUp to={s.to} suffix={s.suffix}/></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-bar"><motion.div className="stat-fill" initial={{ width:0 }} whileInView={{ width:"100%" }} viewport={{ once:true }} transition={{ delay:0.6+i*0.1, duration:1.3 }}/></div>
          </motion.div>
        ))}
      </section>

      {/* ── TRUST BAR ── */}
      <div className="trust-bar">
        {[
          { icon:"🏅", t:"100% Authentic",   d:"Expert verified" },
          { icon:"🚀", t:"Express Delivery",  d:"2-day shipping" },
          { icon:"↩️", t:"Easy Returns",      d:"30-day free" },
          { icon:"🔒", t:"Secure Payment",    d:"SSL encrypted" },
          { icon:"💎", t:"Hand Curated",      d:"By our stylists" },
          { icon:"📞", t:"24/7 Concierge",    d:"Always here" },
        ].map((b,i) => (
          <motion.div key={i} className="trust-item"
            initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
            whileHover={{ y:-5, background:"rgba(201,168,76,0.06)", borderColor:"rgba(201,168,76,0.3)" }}>
            <motion.span className="trust-icon" whileHover={{ scale:1.4, rotate:10 }}>{b.icon}</motion.span>
            <div><div className="trust-t">{b.t}</div><div className="trust-d">{b.d}</div></div>
          </motion.div>
        ))}
      </div>

      {/* ── FEATURED BANNER ── */}
      <motion.section className="feat-banner"
        initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
        <div className="fb-media">
          <motion.img src="https://images.unsplash.com/photo-1518544801976-3e1889b9c2c4?w=1400&q=85"
            alt="" className="fb-img" whileHover={{ scale:1.04 }} transition={{ duration:1 }}/>
          <div className="fb-grad"/>
        </div>
        <div className="fb-info">
          <motion.span className="fb-eye" initial={{ opacity:0,x:-20 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}>
            Featured · Watch Collection
          </motion.span>
          <motion.h2 className="fb-title" initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.2 }}>
            The Art of<br/><em>Swiss Time</em>
          </motion.h2>
          <motion.p className="fb-body" initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.35 }}>
            From Rolex to Audemars Piguet — every timepiece tells a story of uncompromising precision and obsessive craft.
          </motion.p>
          <motion.div initial={{ opacity:0,y:16 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:0.55 }}>
            <MBtn className="btn-primary" onClick={() => { setActiveCat("Watches"); document.querySelector(".products-section")?.scrollIntoView({ behavior:"smooth" }); }}>
              <span>Explore Watches</span><span className="cta-arrow">→</span>
            </MBtn>
          </motion.div>
          <div className="fb-price-tag">From $185</div>
        </div>
      </motion.section>

      {/* ── PRODUCTS ── */}
      <section className="products-section">
        <motion.div className="products-hdr" initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}>
          <div>
            <p className="section-eye">The Edit · {new Date().getFullYear()}</p>
            <h2 className="section-title">Premium Collection</h2>
          </div>
          <div className="hdr-controls">
            <div className="sort-wrap">
              <span className="sort-label">Sort:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-sel">
                <option value="featured">Featured</option>
                <option value="new">Newest</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <span className="item-count">{filtered.length} items</span>
          </div>
        </motion.div>

        {/* Category pills */}
        <div className="cat-row">
          {CATS.map((c,i) => (
            <motion.button key={c} className={`cat-chip ${activeCat===c?"active":""}`}
              onClick={() => setActiveCat(c)}
              initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.04 }}
              whileHover={{ y:-3 }} whileTap={{ scale:0.94 }}>
              {c}
              {activeCat===c && <motion.span className="chip-dot" layoutId="cdot"/>}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div className="pgrid" layout>
              {filtered.map((p,i) => <PCard key={p.id} p={p} i={i}/>)}
            </motion.div>
          ) : (
            <motion.div className="empty-state" initial={{ opacity:0 }} animate={{ opacity:1 }}>
              <span className="empty-icon">🔍</span>
              <h3>No results found</h3>
              <p>Try a different category or search term</p>
              <MBtn className="btn-ghost" onClick={() => { setActiveCat("All"); setQuery(""); }}>Clear Filters</MBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── BRAND WALL ── */}
      <section className="brand-wall">
        <p className="section-eye" style={{ textAlign:"center",marginBottom:28 }}>Authorized Retailer For</p>
        <div className="brand-grid">
          {["ROLEX","HERMÈS","GUCCI","CARTIER","DIOR","VALENTINO","CHANEL","BALENCIAGA","VAN CLEEF","AUDEMARS PIGUET","LOUBOUTIN","RAY-BAN"].map((b,i) => (
            <motion.div key={b} className="brand-tile"
              initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:i*0.05 }}
              whileHover={{ background:"rgba(201,168,76,0.08)", borderColor:"rgba(201,168,76,0.35)", y:-4, color:"#c9a84c" }}>
              {b}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="nl-section">
        <Orb color="#c9a84c" size={600} style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none" }}/>
        <motion.div className="nl-box" initial={{ opacity:0,y:40 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}>
          <span className="section-eye">Exclusive Access</span>
          <h2 className="nl-title">Join the Inner Circle</h2>
          <p className="nl-sub">Members receive early access to drops, private sales, and stylist consultation — all free.</p>
          <div className="nl-form">
            <input type="email" placeholder="Your email address" className="nl-input"/>
            <MBtn className="btn-primary nl-btn"><span>Join Free</span><span className="cta-arrow">→</span></MBtn>
          </div>
          <p className="nl-fine">No spam. Unsubscribe anytime. Your data is safe with us.</p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="ft-brand">
            <div className="ft-logo">VELUR</div>
            <p className="ft-tag">The world's finest luxury goods,<br/>curated and authenticated since 1994.</p>
            <div className="ft-socials">
              {["IG","TW","YT","LI"].map(s => (
                <motion.span key={s} className="social-dot"
                  whileHover={{ scale:1.2, background:"#c9a84c", color:"#080808", borderColor:"#c9a84c" }}>
                  {s}
                </motion.span>
              ))}
            </div>
            <div className="ft-payments">
              {["VISA","MC","AMEX","PayPal","Apple Pay"].map(p => (
                <span key={p} className="pay-pill">{p}</span>
              ))}
            </div>
          </div>

          {[
            { h:"Shop",    links:["New Arrivals","Best Sellers","Watches","Bags","Jewelry","Sale"] },
            { h:"Support", links:["Authentication","Shipping","Returns","Size Guide","Contact Us","FAQ"] },
            { h:"Company", links:["About VELUR","Careers","Press","Sustainability","Partners","Terms"] },
          ].map(col => (
            <div key={col.h} className="ft-col">
              <h4 className="ft-col-h">{col.h}</h4>
              <ul>
                {col.links.map(l => (
                  <motion.li key={l} className="ft-link" whileHover={{ x:5, color:"#c9a84c" }}>{l}</motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VELUR Maison de Luxe. All Rights Reserved.</span>
          <div className="fb-legal">
            {["Privacy Policy","Cookie Settings","Accessibility","Sitemap"].map(l => (
              <motion.span key={l} className="fbl" whileHover={{ color:"#c9a84c" }}>{l}</motion.span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}