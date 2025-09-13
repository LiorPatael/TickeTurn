import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './Login.css'; // נשתמש ב־CSS חיצוני

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3050/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }
      const data = await res.json();
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container glass-card" style={{
        maxWidth: "400px",
        width: "90%",
        margin: "60px auto",
        padding: "40px",
        background: "rgba(28, 31, 60, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "var(--border-radius)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 188, 212, 0.15)",
        boxSizing: "border-box"
    }}>
      <h2 style={{
        fontSize: "2rem",
        marginBottom: "30px",
        textAlign: "center",
        background: "var(--accent-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>Welcome Back!</h2>
      
      <p style={{
        textAlign: "center",
        marginBottom: "30px",
        color: "var(--text-secondary)"
      }}>Great to see you again! Ready to explore more events?</p>
      
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%"
      }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="modern-input"
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              boxSizing: "border-box",
              fontSize: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-primary)",
              transition: "all 0.3s ease"
            }}
          />
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)"
          }}>📧</span>
        </div>
        
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="modern-input"
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              boxSizing: "border-box",
              fontSize: "1rem",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-primary)",
              transition: "all 0.3s ease"
            }}
          />
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)"
          }}>🔒</span>
        </div>
        
        <button type="submit" className="modern-button" style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          fontSize: "1rem",
          fontWeight: "600"
        }}>
          Sign In
        </button>
      </form>
    </div>
  );
}

export default Login;
