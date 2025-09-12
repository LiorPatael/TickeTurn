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
    <div className="register-container">
      <h2>Create Account</h2>
      {error && <div className="error-message">{error}</div>}
      {isSuccessful && <div className="success-message">Registration successful! Redirecting to login...</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={fullName} 
          onChange={e => setFullName(e.target.value)} 
          required 
          disabled={loading}
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required 
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="register-footer">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;