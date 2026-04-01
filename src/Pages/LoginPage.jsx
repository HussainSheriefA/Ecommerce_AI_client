import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Google OAuth
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "",
        callback: handleGoogleResponse,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await authAPI.googleLogin(response.credential);
      
      // Save token and user data
      localStorage.setItem('token', result.access);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirect to profile page
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError("Google login is not available. Please try again later.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log('🔐 Attempting login with:', formData);
      const response = await authAPI.login(formData);
      
      console.log('✅ Login response:', response);
      console.log('Response type:', typeof response);
      console.log('Has access?', 'access' in response);
      console.log('Has user?', 'user' in response);
      
      // Save token to localStorage (Django returns 'access' not 'token')
      if (response && response.access) {
        localStorage.setItem('token', response.access);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect to profile page
        navigate("/profile");
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Left Side - Form */}
        <div className="login-form-section">
          <div className="brand-logo" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>VELUR</div>
          
          <div className="form-header">
            <h1>Welcome back</h1>
            <p>Sign in to access your account and continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="social-login">
            <div className="divider">
              <span>Or continue with</span>
            </div>
            <div className="social-buttons">
              <button 
                className="social-btn google" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                type="button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Loading...' : 'Google'}
              </button>
              <button className="social-btn apple" type="button">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#000" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.26-.94 3.94-.8 1.66.14 2.83.9 3.55 2.14-3.22 1.94-2.68 6.16.22 7.38-.52 1.36-1.19 2.71-1.89 3.51zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>

          <div className="form-footer">
            <p>Don't have an account? <span onClick={() => navigate("/signup")} className="link">Sign up</span></p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="login-image-section">
          <div className="image-overlay">
            <div className="floating-card">
              <div className="card-icon">🛒</div>
              <div className="card-content">
                <h3>Premium Shopping</h3>
                <p>Discover amazing products</p>
              </div>
            </div>
            <div className="floating-card secondary">
              <div className="card-stats">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}