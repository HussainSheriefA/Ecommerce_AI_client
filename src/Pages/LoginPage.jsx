import React from "react";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <div className="login">
      <h2>Login</h2>

      <input type="text" placeholder="Email" />
      <input type="password" placeholder="Password" />

      <button onClick={() => alert("Logged In")}>Login</button>
    </div>
  );
}