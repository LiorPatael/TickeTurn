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
    setLoading(true);
    
    console.log('Starting registration process...'); // Debug log

    try {
      console.log('Sending registration request...'); // Debug log
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

      console.log('Registration response received:', registerRes.status); // Debug log
      
      const data = await registerRes.json();
      console.log('Registration response data:', data); // Debug log

      if (!registerRes.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setIsSuccessful(true);
      console.log('Registration successful, proceeding to login...'); // Debug log

      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      console.error('Registration/Login error:', error);
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="register-container glass-card" style={{
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
        marginBottom: "20px",
        textAlign: "center",
        background: "var(--accent-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>Join TickeTurn Today</h2>
      
      <p style={{
        textAlign: "center",
        marginBottom: "30px",
        color: "var(--text-secondary)"
      }}>Create your account and start exploring amazing events or share your tickets with others.</p>
      
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%"
      }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
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
          }}>👤</span>
        </div>

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
            placeholder="Choose a password"
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

        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
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

        <button 
          type="submit" 
          className="modern-button"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            fontSize: "1rem",
            fontWeight: "600",
            position: "relative"
          }}
        >
          {loading ? (
            <span className="loader"></span>
          ) : (
            "Create Account"
          )}
        </button>

        {error && (
          <div style={{
            color: "var(--accent-main)",
            textAlign: "center",
            marginTop: "10px"
          }}>
            {error}
          </div>
        )}

        {isSuccessful && (
          <div style={{
            color: "#4CAF50",
            textAlign: "center",
            marginTop: "10px"
          }}>
            Registration successful! Redirecting...
          </div>
        )}
      </form>
    </div>
  );
}

export default Register;