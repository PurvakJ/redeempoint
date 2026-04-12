// components/Login.js
import React, { useState, useEffect } from 'react';
import { makeApiCall, testApiConnection } from '../api';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [mobileNumber, setMobileNumber] = useState('');
  const [adhaarNumber, setAdhaarNumber] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const result = await testApiConnection();
      if (result.success) {
        setApiStatus('connected');
        console.log('API is connected successfully');
      } else {
        setApiStatus('error');
        setError('Cannot connect to server. Please check your connection and try again.');
      }
    };
    testConnection();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await makeApiCall('login', { mobileNumber, adhaarNumber });
      
      if (result.success) {
        onLogin(result.user, result.role);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error(err);
    }
    
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      setLoading(false);
      return;
    }

    if (!/^\d{12}$/.test(adhaarNumber)) {
      setError('Please enter a valid 12-digit Adhaar number');
      setLoading(false);
      return;
    }

    try {
      const result = await makeApiCall('register', { 
        mobileNumber, 
        adhaarNumber, 
        name 
      });
      
      if (result.success) {
        setSuccess(result.message);
        setName('');
        setMobileNumber('');
        setAdhaarNumber('');
        setTimeout(() => {
          setIsLogin(true);
          setSuccess('');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error(err);
    }
    
    setLoading(false);
  };

  if (apiStatus === 'error') {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Connection Error</h2>
          <div className="error-message">
            Cannot connect to the server. Please make sure:
            <ul>
              <li>Google Apps Script is deployed</li>
              <li>Web App URL is correctly set in api.js</li>
              <li>You have internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="toggle-buttons">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
          >
            Login
          </button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
              />
            </div>
            <div className="form-group">
              <label>Adhaar Number</label>
              <input
                type="text"
                value={adhaarNumber}
                onChange={(e) => setAdhaarNumber(e.target.value)}
                required
                placeholder="Enter 12-digit Adhaar number"
                maxLength="12"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="admin-note">
              <p>Admin Login: Mobile: 9999999999 | Adhaar: ADMIN123</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <h2>Create New Account</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
              />
              <small>Will be used as username</small>
            </div>
            <div className="form-group">
              <label>Adhaar Number</label>
              <input
                type="text"
                value={adhaarNumber}
                onChange={(e) => setAdhaarNumber(e.target.value)}
                required
                placeholder="Enter 12-digit Adhaar number"
                maxLength="12"
              />
              <small>For verification purposes</small>
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <p className="terms">
              By signing up, you agree to our Terms & Conditions
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;