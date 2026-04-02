import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, checkAPIHealth } from "../services/api";
import "./LoginPage.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    // Validate name
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password strength
    if (formData.password) {
      if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/\d/.test(formData.password)) {
        errors.password = 'Password must contain at least one number';
      }
    } else {
      errors.password = 'Password is required';
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setFormData({ ...formData, [fieldName]: fieldValue });
    setError("");
    // Clear validation error for this field as user types
    setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate form before submission
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      // First, check if the API is healthy
      console.log('🏥 Checking API health...');
      const healthStatus = await checkAPIHealth();
      
      if (!healthStatus.healthy) {
        console.error('❌ API health check failed:', healthStatus.error);
        throw new Error(healthStatus.error || 'Backend server is not responding');
      }
      
      console.log('✅ API health check passed');
      
      console.log('🔐 Attempting registration with:', { name: formData.name, email: formData.email, password: '***' });
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword
      });
      
      console.log('✅ Registration response:', response);
      console.log('Response type:', typeof response);

      const token = response?.data?.token || response?.token || response?.access;
      const user = response?.data?.user || response?.user;
      const isSuccess = response?.success === true || response?.status === 201;

      if (isSuccess) {
        if (token) {
          localStorage.setItem('token', token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Redirect to login page after registration
        navigate("/login");
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      console.error('Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      
      // More specific error messages
      let errorMessage = "Registration failed. Please try again.";
      if (err.message.includes('Unable to connect') || err.message.includes('not responding')) {
        errorMessage = "Unable to connect to server. Please ensure the Django backend is running on http://localhost:8000";
      } else if (err.message.includes('health check failed')) {
        errorMessage = err.message;
      } else if (err.message.includes('already registered')) {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
            <h1>Create Account</h1>
            <p>Join VELUR for an exclusive luxury shopping experience</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              {validationErrors.name && (
                <span className="field-error">{validationErrors.name}</span>
              )}
            </div>

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
              {validationErrors.email && (
                <span className="field-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength="8"
              />
              {validationErrors.password && (
                <span className="field-error">{validationErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
              {validationErrors.confirmPassword && (
                <span className="field-error">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="social-login">
            <div className="divider">
              <span>Or continue with</span>
            </div>
            <div className="social-buttons">
              <button className="social-btn google">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="social-btn apple">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#000" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.26-.94 3.94-.8 1.66.14 2.83.9 3.55 2.14-3.22 1.94-2.68 6.16.22 7.38-.52 1.36-1.19 2.71-1.89 3.51zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>

          <div className="form-footer">
            <p>Already have an account? <span onClick={() => navigate("/login")} className="link">Sign in</span></p>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="login-image-section">
          <div className="image-overlay">
            <div className="floating-card">
              <div className="card-icon">✨</div>
              <div className="card-content">
                <h3>Join VELUR</h3>
                <p>Exclusive luxury shopping</p>
              </div>
            </div>
            <div className="floating-card secondary">
              <div className="card-stats">
                <span className="stat-number">VIP</span>
                <span className="stat-label">Member Benefits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}