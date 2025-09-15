import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (fullName.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const registerRes = await fetch("http://localhost:3050/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ 
          name: fullName, 
          email, 
          password 
        })
      });

      const data = await registerRes.json();

      if (!registerRes.ok) {
        // Server may return details array from validation middleware
        if (data && data.details && Array.isArray(data.details)) {
          setError(data.details.join(' | '));
        } else {
          setError(data.message || 'Registration failed');
        }
        return;
      }

      setIsSuccessful(true);
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="register-container glass-card">
      <h2 className="register-title">Join TickeTurn Today</h2>
      
      <p className="register-sub">Create your account and start exploring amazing events or share your tickets with others.</p>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-wrap">
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="modern-input"
          />
          <span className="input-icon">👤</span>
        </div>

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
            placeholder="Choose a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="modern-input"
          />
          <span className="input-icon">🔒</span>
        </div>

        <div className="input-wrap">
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="modern-input"
          />
          <span className="input-icon">🔒</span>
        </div>

        <button 
          type="submit" 
          className="modern-button"
          disabled={loading}
        >
          {loading ? (
            <span className="loader"></span>
          ) : (
            "Create Account"
          )}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isSuccessful && (
          <div className="success-message">
            Registration successful! Redirecting...
          </div>
        )}
      </form>
    </div>
  );
}

export default Register;