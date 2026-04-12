// ================= React Frontend - App.js =================
import React, { useState, useEffect } from "react";
import { api } from "./api";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import './App.css';

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  if (page === "login") return <Login setPage={setPage} setUser={setUser} />;
  if (page === "signup") return <Signup setPage={setPage} />;
  if (page === "user") return <UserDashboard user={user} onLogout={handleLogout} />;
  if (page === "admin") return <AdminDashboard onLogout={handleLogout} />;
}

function Login({ setPage, setUser }) {
  const [mobileNumber, setMobile] = useState("");
  const [aadhaarNumber, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const res = await api("login", { mobileNumber, aadhaarNumber });
    setLoading(false);
    if (res.success) {
      if (res.role === "admin") setPage("admin");
      else {
        setUser({ mobileNumber });
        setPage("user");
      }
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
          onChange={e => setMobile(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="password"
          placeholder="Aadhaar Number" 
          onChange={e => setAadhaar(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <button onClick={handleLogin} className="auth-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Login →"}
        </button>
        <p className="auth-link" onClick={() => setPage("signup")}>Create Account →</p>
      </div>
    </div>
  );
}

function Signup({ setPage }) {
  const [mobileNumber, setMobile] = useState("");
  const [aadhaarNumber, setAadhaar] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    const res = await api("register", { mobileNumber, aadhaarNumber, name });
    setLoading(false);
    if (res.success) {
      alert("Registered Successfully");
      setPage("login");
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
          onChange={e => setName(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="tel"
          placeholder="Mobile Number" 
          onChange={e => setMobile(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <input 
          type="password"
          placeholder="Aadhaar Number" 
          onChange={e => setAadhaar(e.target.value)} 
          className="auth-input"
          disabled={loading}
        />
        <button onClick={handleSignup} className="auth-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Register →"}
        </button>
        <p className="auth-link" onClick={() => setPage("login")}>← Back to Login</p>
      </div>
    </div>
  );
}