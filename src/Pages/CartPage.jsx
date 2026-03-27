import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function MBtn({ children, className, onClick }) {
  const { ref, sx, sy, onMove, onLeave } = useMag();
  return (
    <motion.button ref={ref} className={`mbt ${className||""}`}
      style={{ x:sx, y:sy }} onMouseMove={onMove} onMouseLeave={onLeave}
      onClick={onClick} whileTap={{ scale:0.94 }}>
      {children}
    </motion.button>
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

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, toastMsg, toastType } = useCart();
  const navigate = useNavigate();
  const [promoVal, setPromoVal] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(false);

  const tax = cartTotal * 0.1;
  const shipping = cartTotal >= 500 ? 0 : 25;
  const promoDisc = promoApplied ? cartTotal * 0.08 : 0;
  const total = cartTotal + tax + shipping - promoDisc;

  const applyPromo = () => {
    if (promoVal.toUpperCase() === "VELUR10") { setPromoApplied(true); setPromoError(""); }
    else { setPromoError("Invalid promo code. Try VELUR10"); }
  };

  if (cart.length === 0) return (
    <div className="root">
      <Toast msg={toastMsg} type={toastType}/>
      <motion.nav className="navbar scrolled" initial={{ y:-80 }} animate={{ y:0 }} transition={{ duration:0.8 }}>
        <div className="nav-l"><div className="nav-logo" onClick={() => navigate("/")}>VELUR</div></div>
        <div className="nav-r"><MBtn className="btn-ghost" onClick={() => navigate("/")}>← Continue Shopping</MBtn></div>
      </motion.nav>
      <div className="empty-cart-page">
        <motion.div className="ec-inner" initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.6 }}>
          <motion.span className="ec-icon" animate={{ rotate:[0,-10,10,-10,0] }} transition={{ duration:0.6, delay:0.5 }}>🛍</motion.span>
          <h2>Your bag is empty</h2>
          <p>You haven't added any items yet. Let's fix that.</p>
          <MBtn className="btn-primary" onClick={() => navigate("/")}>
            <span>Start Shopping</span><span className="cta-arrow">→</span>
          </MBtn>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="root">
      <Toast msg={toastMsg} type={toastType}/>

      {/* NAV */}
      <motion.nav className="navbar scrolled" initial={{ y:-80 }} animate={{ y:0 }} transition={{ duration:0.8 }}>
        <div className="nav-l"><div className="nav-logo" onClick={() => navigate("/")}>VELUR</div></div>
        <div className="nav-r">
          <MBtn className="btn-ghost" onClick={() => navigate("/")}>← Continue Shopping</MBtn>
        </div>
      </motion.nav>

      <div className="cart-container">
        <motion.h1 className="cart-title" initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }}>
          Shopping Bag <span className="cart-count-label">({cartCount} item{cartCount!==1?"s":""})</span>
        </motion.h1>

        {/* Progress bar */}
        <div className="checkout-progress">
          {["Bag","Details","Payment","Confirmed"].map((s,i) => (
            <div key={s} className={`cp-step ${i===0?"active":""}`}>
              <div className="cp-circle">{i===0?<motion.span animate={{ scale:[1,1.2,1] }} transition={{ duration:1.5, repeat:Infinity }}>{i+1}</motion.span>:i+1}</div>
              <span>{s}</span>
              {i<3 && <div className="cp-line"/>}
            </div>
          ))}
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items-col">
            <AnimatePresence>
              {cart.map(item => {
                const disc = Math.round((1-item.price/item.originalPrice)*100);
                return (
                  <motion.div key={item.id} className="cart-item"
                    initial={{ opacity:0,x:-24 }} animate={{ opacity:1,x:0 }}
                    exit={{ opacity:0,x:30,height:0,marginBottom:0,padding:0 }}
                    transition={{ duration:0.38 }} layout>
                    <div className="ci-img-box">
                      <img src={item.image} alt={item.name}/>
                      {disc>0 && <span className="ci-disc">−{disc}%</span>}
                    </div>
                    <div className="ci-details">
                      <div className="ci-brand">{item.brand}</div>
                      <h3 className="ci-name"><Link to={`/product/${item.id}`}>{item.name}</Link></h3>
                      <p className="ci-desc">{item.description?.slice(0,72)}…</p>
                      <div className="ci-delivery">🚚 Free delivery in {item.deliveryDays} day{item.deliveryDays>1?"s":""}</div>
                      <div className="ci-controls">
                        <div className="qty-ctrl">
                          <motion.button onClick={() => updateQuantity(item.id,item.qty-1)} whileHover={{ background:"rgba(201,168,76,0.15)" }} whileTap={{ scale:0.88 }}>−</motion.button>
                          <span>{item.qty}</span>
                          <motion.button onClick={() => updateQuantity(item.id,item.qty+1)} whileHover={{ background:"rgba(201,168,76,0.15)" }} whileTap={{ scale:0.88 }}>+</motion.button>
                        </div>
                        <motion.button className="ci-remove" onClick={() => removeFromCart(item.id)} whileHover={{ color:"#e05c5c" }} whileTap={{ scale:0.9 }}>🗑 Remove</motion.button>
                        <motion.button className="ci-save" whileHover={{ color:"#c9a84c" }} whileTap={{ scale:0.9 }}>♡ Save</motion.button>
                        <Link to={`/product/${item.id}`} className="ci-view">View Details →</Link>
                      </div>
                    </div>
                    <div className="ci-price-col">
                      <div className="ci-total">${(item.price*item.qty).toLocaleString()}</div>
                      <div className="ci-unit">${item.price.toLocaleString()} each</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Promo */}
            <motion.div className="promo-box" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}>
              <span className="promo-label">🏷 Promo Code</span>
              <div className="promo-row">
                <input type="text" placeholder='Try "VELUR10"' value={promoVal}
                  onChange={e => setPromoVal(e.target.value)} className="promo-input"
                  disabled={promoApplied}/>
                <MBtn className={`btn-promo ${promoApplied?"applied":""}`} onClick={applyPromo}>
                  {promoApplied ? "✓ Applied" : "Apply"}
                </MBtn>
              </div>
              {promoError && <p className="promo-err">{promoError}</p>}
              {promoApplied && <p className="promo-ok">🎉 VELUR10 applied — 8% off your order!</p>}
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div className="order-summary" initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
            <h3 className="os-title">Order Summary</h3>

            <div className="os-rows">
              <div className="os-row"><span>Subtotal ({cartCount} items)</span><span>${cartTotal.toLocaleString()}</span></div>
              <div className="os-row"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="os-row"><span>Shipping</span><span>{shipping===0?<span className="free-tag">FREE</span>:`$${shipping}`}</span></div>
              {promoApplied && <div className="os-row promo-row-saved"><span>Promo (VELUR10)</span><span className="saved">−${promoDisc.toFixed(2)}</span></div>}
              {shipping>0 && <div className="os-ship-note">Add ${(500-cartTotal).toFixed(0)} more for free shipping</div>}
            </div>

            <div className="os-divider"/>
            <div className="os-total"><span>Total</span><span>${total.toLocaleString(undefined,{minimumFractionDigits:2})}</span></div>

            {/* Free shipping progress */}
            {cartTotal < 500 && (
              <div className="ship-progress">
                <div className="sp-bar"><motion.div className="sp-fill" style={{ width:`${(cartTotal/500)*100}%` }}/></div>
                <p>${(500-cartTotal).toFixed(0)} away from free shipping</p>
              </div>
            )}

            <MBtn className="btn-checkout-main" onClick={() => setCheckoutStep(true)}>
              <span>Proceed to Checkout</span><span className="cta-arrow">→</span>
            </MBtn>

            <div className="os-secure">🔒 Secure Checkout · SSL Encrypted</div>

            <div className="os-payments">
              {["VISA","MC","AMEX","PayPal","Apple Pay","Google Pay"].map(p => (
                <span key={p} className="pay-pill">{p}</span>
              ))}
            </div>

            <div className="os-trust-list">
              {["✓ 100% Authenticity Guaranteed","✓ Free Returns within 30 Days","✓ Expert Packing & Insurance"].map(t => (
                <div key={t} className="os-trust-item">{t}</div>
              ))}
            </div>

            {/* Recently saved */}
            <div className="os-contact">
              <span>📞</span>
              <div><strong>Need help?</strong><p>Chat with our luxury concierge</p></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Checkout modal */}
      <AnimatePresence>
        {checkoutStep && (
          <motion.div className="checkout-modal-bg" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setCheckoutStep(false)}>
            <motion.div className="checkout-modal" initial={{ scale:0.88,opacity:0 }} animate={{ scale:1,opacity:1 }}
              exit={{ scale:0.88,opacity:0 }} transition={{ type:"spring",damping:26 }}
              onClick={e => e.stopPropagation()}>
              <div className="cm-icon">🎉</div>
              <h2>Ready to Complete Your Order?</h2>
              <p>Your {cartCount} item{cartCount!==1?"s":""} total to <strong>${total.toLocaleString(undefined,{minimumFractionDigits:2})}</strong>.<br/>This would connect to your payment gateway.</p>
              <div className="cm-btns">
                <MBtn className="btn-primary" onClick={() => setCheckoutStep(false)}>Complete Purchase →</MBtn>
                <MBtn className="btn-ghost" onClick={() => setCheckoutStep(false)}>Continue Shopping</MBtn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer" style={{ marginTop:80 }}>
        <div className="footer-bottom" style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:32 }}>
          <span>© {new Date().getFullYear()} VELUR Maison de Luxe. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}