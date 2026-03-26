import React from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div style={{ padding: 40 }}>
      <h1>Checkout</h1>

      <input placeholder="Full Name" />
      <input placeholder="Address" />
      <input placeholder="Card Number" />

      <h2>Total: ${total}</h2>
      <button>Place Order</button>
    </div>
  );
}