// ================= React Frontend - App.js (with Routing) =================
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { api } from "./api";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import './App.css';

// Session management
const SESSION_KEY = "greystone_session";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        // Validate session with backend (optional but recommended)
        setSession(sessionData);
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, role) => {
    const sessionData = {
      user: userData,
      role: role,
      timestamp: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          session?.role === "user" ? <Navigate to="/userdashboard" /> :
          session?.role === "admin" ? <Navigate to="/admindashboard" /> :
          <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/login" element={
          session ? <Navigate to={session.role === "user" ? "/userdashboard" : "/admindashboard"} /> :
          <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/signup" element={
          session ? <Navigate to={session.role === "user" ? "/userdashboard" : "/admindashboard"} /> :
          <SignupPage onLogin={handleLogin} />
        } />
        <Route path="/userdashboard" element={
          session?.role === "user" ? 
          <UserDashboard user={session.user} onLogout={handleLogout} /> : 
          <Navigate to="/login" />
        } />
        <Route path="/admindashboard" element={
          session?.role === "admin" ? 
          <AdminDashboard onLogout={handleLogout} /> : 
          <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

function LoginPage({ onLogin }) {
  const [mobileNumber, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      alert("Please enter mobile number and password");
      return;
    }
    setLoading(true);
    const res = await api("login", { mobileNumber, password });
    setLoading(false);
    if (res.success) {
      onLogin({ mobileNumber, name: res.name }, res.role);
      if (res.role === "admin") navigate("/admindashboard");
      else navigate("/userdashboard");
    } else alert(res.error);
  };

  return (
    <div className="auth-container">
      <div className="wood-pattern"></div>
      <div className="auth-card">
        <div className="logo-section">
          <img src="https://i.postimg.cc/FzPV5Mz4/Gemini_Generated_Image_qzhzksqzhzksqzhz_removebg_preview.png" alt="GREYSTONE" className="company-logo" />
          <h2>GREYSTONE</h2>
          <p>Premium Plywood & Furniture Solutions</p>
        </div>
        <input 
          type="tel"
          placeholder="Mobile Number" 
          value={mobileNumber}
          onChange={e => setMobile(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="password"
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
          className="auth-input"
          disabled={loading}
          onKeyPress={e => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin} className="auth-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Login →"}
        </button>
        <p className="auth-link" onClick={() => navigate("/signup")}>Create Account →</p>
      </div>
    </div>
  );
}

function SignupPage({ onLogin }) {
  const [mobileNumber, setMobile] = useState("");
  const [aadhaarNumber, setAadhaar] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !mobileNumber || !aadhaarNumber || !password) {
      alert("Please fill all fields");
      return;
    }
    if (mobileNumber.length !== 10) {
      alert("Mobile number must be 10 digits");
      return;
    }
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      alert("Aadhaar number must be 12 digits");
      return;
    }
    if (password.length < 4) {
      alert("Password must be at least 4 characters");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setLoading(true);
    const res = await api("register", { mobileNumber, aadhaarNumber, password, name });
    setLoading(false);
    if (res.success) {
      alert("Registered Successfully! Please login.");
      navigate("/login");
    } else alert(res.error);
  };

  return (
    <div className="auth-container">
      <div className="wood-pattern"></div>
      <div className="auth-card">
        <div className="logo-section">
          <img src="https://i.postimg.cc/FzPV5Mz4/Gemini_Generated_Image_qzhzksqzhzksqzhz_removebg_preview.png" alt="GREYSTONE" className="company-logo" />
          <h2>Join GREYSTONE</h2>
          <p>Start earning points today!</p>
        </div>
        <input 
          placeholder="Full Name" 
          value={name}
          onChange={e => setName(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="tel"
          placeholder="Mobile Number (10 digits)" 
          value={mobileNumber}
          onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="text"
          placeholder="Aadhaar Number (12 digits)" 
          value={aadhaarNumber}
          onChange={e => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="password"
          placeholder="Password" 
          value={password}
          onChange={e => setPassword(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="password"
          placeholder="Confirm Password" 
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <button onClick={handleSignup} className="auth-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Register →"}
        </button>
        <p className="auth-link" onClick={() => navigate("/login")}>← Back to Login</p>
      </div>
    </div>
  );
}