import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return "#c9a84c";
    const colors = ["#c9a84c", "#6aada8", "#9b8ab5", "#e05c5c", "#7898b0"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-brand" onClick={() => navigate("/")}>
          VELUR
        </div>
        <nav className="header-nav">
          <button onClick={() => navigate("/")} className="nav-link">Home</button>
          <button onClick={() => navigate("/cart")} className="nav-link">Cart</button>
          <div className="user-avatar-small" 
               style={{ backgroundColor: getAvatarColor(user.name) }}
               onClick={() => navigate("/profile")}>
            {getInitials(user.name)}
          </div>
        </nav>
      </header>

      <div className="profile-content">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar-large" style={{ backgroundColor: getAvatarColor(user.name) }}>
              {getInitials(user.name)}
            </div>
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">{user.email}</p>
            <span className="user-badge">{user.user_type || 'Customer'}</span>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Overview
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="nav-icon">📦</span>
              My Orders
            </button>
            <button 
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <span className="nav-icon">📍</span>
              Addresses
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              Settings
            </button>
            <button className="nav-item logout" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h1>Welcome back, {user.name?.split(' ')[0]}!</h1>
              <p className="subtitle">Here's what's happening with your account</p>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <span className="stat-value">$0</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🛒</div>
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Cart Items</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Reviews</span>
                  </div>
                </div>
              </div>

              <div className="recent-section">
                <h3>Recent Activity</h3>
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No recent activity</p>
                  <button onClick={() => navigate("/")} className="btn-primary">
                    Start Shopping
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="tab-content">
              <h1>My Orders</h1>
              <div className="empty-state">
                <span className="empty-icon">📦</span>
                <p>No orders yet</p>
                <button onClick={() => navigate("/")} className="btn-primary">
                  Browse Products
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="tab-content">
              <h1>My Addresses</h1>
              <div className="empty-state">
                <span className="empty-icon">📍</span>
                <p>No addresses saved</p>
                <button className="btn-primary">Add Address</button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h1>Account Settings</h1>
              <div className="settings-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user.name} readOnly />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue={user.email} readOnly />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" placeholder="Add phone number" />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
