import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import ProductPage from "./Pages/ProductPage";
import CartPage from "./Pages/CartPage";
import LoginPage from "./Pages/LoginPage";
import SignupPage from "./Pages/SignupPage";
import ProfilePage from "./Pages/ProfilePage";
import { CartProvider } from "./context/CartContext";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page or clear your browser cache.</p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
          <details style={{ marginTop: '20px' }}>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export const products = [
  {
    id:1, name:"Rolex Submariner Date", shortName:"Submariner", price:9500, originalPrice:11200,
    image:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%232F4F4F'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3ESubmariner%3C/text%3E%3C/svg%3E",
    images:["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%232F4F4F'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3ESubmariner%3C/text%3E%3C/svg%3E","data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%2300647C'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3EWatch+1%3C/text%3E%3C/svg%3E","data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%232C5F2D'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3EWatch+2%3C/text%3E%3C/svg%3E"],
    category:"Watches", brand:"Rolex", rating:4.9, reviews:2841, badge:"Best Seller",
    description:"The Submariner Date is the reference among divers' watches. Waterproof to a depth of 300 metres, with the iconic unidirectional rotatable bezel in black ceramic.",
    features:["Swiss Automatic Movement","300m Water Resistance","Oystersteel Case","Cerachrom Ceramic Bezel","Sapphire Crystal","72hr Power Reserve"],
    specs:{"Case Size":"41mm","Movement":"Calibre 3235","Crystal":"Sapphire","Water Resistance":"300m","Bracelet":"Oyster"},
    stock:3, deliveryDays:2, isNew:false, isTrending:true, color:"#c9a84c",
  },
  {
    id:2, name:"Audemars Piguet Royal Oak", shortName:"Royal Oak", price:24500, originalPrice:28000,
    image:"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%233D2C8D'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3ERoyal+Oak%3C/text%3E%3C/svg%3E",
    images:["data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%233D2C8D'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3ERoyal+Oak%3C/text%3E%3C/svg%3E","data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='%238F6DA3'/%3E%3Ctext x='400' y='420' fill='%23FFFFFF' font-size='48' font-family='Arial' text-anchor='middle'%3ERoyal+Oak+Alt%3C/text%3E%3C/svg%3E"],
    category:"Watches", brand:"Audemars Piguet", rating:4.8, reviews:1203, badge:"Limited",
    description:"The Royal Oak Selfwinding is one of the most iconic luxury sports watches ever created. Its distinctive octagonal bezel and integrated bracelet changed watchmaking forever.",
    features:["Calibre 4302 Movement","50m Water Resistance","Stainless Steel","Tapisserie Dial","Integrated Bracelet","Self-Winding"],
    specs:{"Case Size":"41mm","Movement":"Calibre 4302","Crystal":"Sapphire","Water Resistance":"50m","Bracelet":"Integrated SS"},
    stock:1, deliveryDays:3, isNew:false, isTrending:false, color:"#e8c97a",
  },
  {
    id:3, name:"Hermès Birkin 30", shortName:"Birkin 30", price:18900, originalPrice:20500,
    image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90",
    images:["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90"],
    category:"Bags", brand:"Hermès", rating:5.0, reviews:987, badge:"Rare Find",
    description:"The world's most coveted handbag. Each Birkin requires 18–25 hours to handcraft from the finest Togo leather by a single artisan.",
    features:["Togo Leather","Palladium Hardware","Hand-stitched","Lock & Keys Included","Certificate of Authenticity","Dust Bag"],
    specs:{"Size":"30cm","Leather":"Togo","Hardware":"Palladium","Closure":"Toggle","Origin":"France"},
    stock:1, deliveryDays:5, isNew:false, isTrending:true, color:"#c4696a",
  },
  {
    id:4, name:"Gucci Ophidia Structured Tote", shortName:"Ophidia Tote", price:3200, originalPrice:3800,
    image:"https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90",
    images:["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90"],
    category:"Bags", brand:"Gucci", rating:4.7, reviews:5621, badge:"New Arrival",
    description:"The Ophidia Structured Tote in supreme canvas with leather trim, Double G hardware closure, suede interior lining, and removable shoulder strap.",
    features:["GG Supreme Canvas","Leather Trim","Double G Hardware","Suede Interior","Removable Strap","Dust Bag"],
    specs:{"Size":"40x32x16cm","Material":"GG Supreme","Closure":"Magnetic Snap","Lining":"Suede","Origin":"Italy"},
    stock:8, deliveryDays:2, isNew:true, isTrending:false, color:"#6aada8",
  },
  {
    id:5, name:"Valentino Noir Evening Gown", shortName:"Noir Gown", price:4800, originalPrice:6200,
    image:"https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=90",
    images:["https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=90","https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=800&q=90"],
    category:"Apparel", brand:"Valentino", rating:4.6, reviews:832, badge:"SS26",
    description:"A masterpiece of Italian haute couture. Floor-length silk crepe with hand-applied embellishments and a structured boned bodice. Made in Rome.",
    features:["100% Silk Crepe","Hand-applied Beading","Boned Bodice","Floor Length","Dry Clean Only","Made in Italy"],
    specs:{"Material":"100% Silk","Silhouette":"A-Line","Length":"Floor","Care":"Dry Clean","Origin":"Italy"},
    stock:5, deliveryDays:4, isNew:true, isTrending:true, color:"#9b8ab5",
  },
  {
    id:6, name:"Balenciaga Phantom Sneaker", shortName:"Phantom Low", price:1050, originalPrice:1200,
    image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90",
    images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90","https://images.unsplash.com/photo-1528701800489-20be2dfbe2e3?w=800&q=90"],
    category:"Shoes", brand:"Balenciaga", rating:4.5, reviews:3412, badge:"Trending",
    description:"The Phantom Sneaker features an extreme XL outsole, sock-like stretch knit upper, and iconic Balenciaga branding for street-meets-luxury.",
    features:["Stretch Knit Upper","XL Rubber Outsole","Lace-up Closure","Padded Collar","Sizes 36–47","Recycled Materials"],
    specs:{"Upper":"Stretch Knit","Sole":"XL Rubber","Closure":"Lace-up","Fit":"True to Size","Origin":"Italy"},
    stock:12, deliveryDays:2, isNew:true, isTrending:true, color:"#f97316",
  },
  {
    id:7, name:"Christian Louboutin So Kate 120", shortName:"So Kate 120", price:795, originalPrice:895,
    image:"https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&q=90",
    images:["https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=800&q=90"],
    category:"Shoes", brand:"Christian Louboutin", rating:4.7, reviews:2108, badge:"Iconic",
    description:"The So Kate is perhaps the world's most famous stiletto. 120mm heel and pointed toe that elongates the leg with unparalleled elegance.",
    features:["Patent Leather Upper","120mm Heel","Pointed Toe","Leather Sole","Signature Red Sole","Made in Italy"],
    specs:{"Heel Height":"120mm","Material":"Patent Leather","Toe":"Pointed","Sole":"Leather","Origin":"Italy"},
    stock:7, deliveryDays:3, isNew:false, isTrending:false, color:"#e05c5c",
  },
  {
    id:8, name:"Ray-Ban Aviator Classic", shortName:"Aviator", price:185, originalPrice:220,
    image:"https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=90",
    images:["https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=90"],
    category:"Accessories", brand:"Ray-Ban", rating:4.8, reviews:14203, badge:"Best Seller",
    description:"The original aviator, born in 1937 for US military pilots. Gold-toned metal frame with G-15 crystal lenses offering 100% UV protection.",
    features:["G-15 Crystal Lenses","100% UV Protection","Gold Metal Frame","Adjustable Nose Pads","Spring Hinge","Case Included"],
    specs:{"Frame":"Metal","Lens":"G-15 Crystal","UV":"100%","Bridge":"50mm","Arm":"135mm"},
    stock:50, deliveryDays:1, isNew:false, isTrending:false, color:"#c9a84c",
  },
  {
    id:9, name:"Chanel No. 5 EDP 100ml", shortName:"Chanel No.5", price:185, originalPrice:210,
    image:"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=90",
    images:["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=90"],
    category:"Fragrance", brand:"Chanel", rating:4.9, reviews:8920, badge:"Icon",
    description:"The world's most iconic fragrance since 1921. A floral aldehyde with ylang-ylang, rose absolute, and sandalwood. Timeless femininity in a bottle.",
    features:["100ml EDP Spray","Top: Aldehyde, Neroli","Heart: Rose, Jasmine","Base: Sandalwood, Vetiver","Refillable Bottle","Gift Box"],
    specs:{"Volume":"100ml","Type":"EDP","Concentration":"15%","Longevity":"8-10hrs","Origin":"France"},
    stock:30, deliveryDays:1, isNew:false, isTrending:false, color:"#f0c96a",
  },
  {
    id:10, name:"Cartier Love Ring 18K Gold", shortName:"Love Ring", price:1850, originalPrice:2100,
    image:"https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90",
    images:["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90","https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&q=90"],
    category:"Jewelry", brand:"Cartier", rating:4.9, reviews:4301, badge:"Timeless",
    description:"The Love ring from Cartier's iconic collection. Crafted in 18K yellow gold with the signature screw motif — a symbol of love that endures.",
    features:["18K Yellow Gold","Screw Motif Design","Certificate of Authenticity","Cartier Box & Pouch","Complimentary Engraving","Lifetime Warranty"],
    specs:{"Metal":"18K Yellow Gold","Width":"3.65mm","Motif":"Screw","Weight":"~4.5g","Origin":"France"},
    stock:6, deliveryDays:2, isNew:false, isTrending:true, color:"#e8c97a",
  },
  {
    id:11, name:"Van Cleef Alhambra Necklace", shortName:"Alhambra", price:6750, originalPrice:7500,
    image:"https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&q=90",
    images:["https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=800&q=90","https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=90"],
    category:"Jewelry", brand:"Van Cleef & Arpels", rating:5.0, reviews:1102, badge:"Rare Find",
    description:"The Vintage Alhambra necklace in 18K yellow gold with malachite motifs — inspired by the four-leaf clover, a symbol of luck.",
    features:["18K Yellow Gold","Natural Malachite","Gold Chain 42cm","VCA Hallmark","Original Pouch","Certificate"],
    specs:{"Metal":"18K Yellow Gold","Stone":"Malachite","Chain":"42cm","Clasp":"Lobster","Origin":"France"},
    stock:2, deliveryDays:4, isNew:false, isTrending:false, color:"#6aada8",
  },
  {
    id:12, name:"Dior Saddle Bag Oblique", shortName:"Saddle Bag", price:2950, originalPrice:3400,
    image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90",
    images:["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90","https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=90"],
    category:"Bags", brand:"Dior", rating:4.7, reviews:2890, badge:"Trending",
    description:"The iconic Dior Saddle Bag in Oblique jacquard canvas. First introduced in 1999, it remains one of the most recognizable silhouettes in fashion.",
    features:["Oblique Jacquard Canvas","CD Clasp Closure","Removable Strap","Interior Zip Pocket","Dior Dust Bag","Serial Number"],
    specs:{"Material":"Oblique Jacquard","Closure":"CD Clasp","Strap":"Adjustable","Lining":"Cotton","Origin":"Italy"},
    stock:4, deliveryDays:3, isNew:true, isTrending:true, color:"#7898b0",
  },
];

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage products={products}/>}/>
            <Route path="/product/:id" element={<ProductPage products={products}/>}/>
            <Route path="/cart" element={<CartPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/profile" element={<ProfilePage/>}/>
            <Route path="/api/*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ErrorBoundary>
  );
}
export default App;