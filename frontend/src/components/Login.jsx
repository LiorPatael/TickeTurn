import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Login.css'; // נשתמש ב־CSS חיצוני

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3050/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // show validation details if provided
        if (data && data.details && Array.isArray(data.details)) {
          setError(data.details.join(' | '));
        } else {
          setError(data.message || 'Login failed');
        }
        return;
      }

      // success
      if (data && data.user && data.token) {
        login(data.user, data.token);
        navigate('/');
      } else {
        setError('Unexpected server response');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container glass-card">
      <h2 className="login-title">Welcome Back!</h2>
      
      <p className="login-sub">Great to see you again! Ready to explore more events?</p>
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-wrap">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="modern-input"
          />
          <span className="input-icon">📧</span>
        </div>
        
        <div className="input-wrap">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="modern-input"
          />
          <span className="input-icon">🔒</span>
        </div>
        
        <button type="submit" className="modern-button login-submit" disabled={loading}>
          {loading ? <span className="loader"></span> : 'Sign In'}
        </button>

        {error && (
          <div className="error-message" style={{ marginTop: '12px' }}>{error}</div>
        )}
      </form>
    </div>
  );
}

export default Login;
