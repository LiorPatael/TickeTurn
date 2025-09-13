import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function UploadTicket() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    price: "",
    location: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      // Validate data before sending
      if (!formData.eventName || !formData.eventDate || !formData.price || !formData.location) {
        throw new Error("Please fill in all fields");
      }

      // Parse and validate price
      const numericPrice = parseFloat(formData.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error("Please enter a valid price");
      }

      // Validate date
      const eventDate = new Date(formData.eventDate);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Please enter a valid date");
      }

      // Use the date string directly from the form input
      // The input type="date" returns dates in YYYY-MM-DD format
      const validatedData = {
        ...formData,
        price: numericPrice,
        eventDate: formData.eventDate  // This is already in YYYY-MM-DD format
      };

      console.log("Sending ticket data:", validatedData);

      const res = await fetch("http://localhost:3050/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(validatedData)
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error("Server error response:", responseData);
        throw new Error(responseData.message || responseData.error || "Failed to upload ticket");
      }

      console.log("Upload successful:", responseData);
      alert("✨ Ticket uploaded successfully!");
      navigate("/");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{
        maxWidth: "500px",
        width: "90%",
        margin: "50px auto",
        padding: "40px",
        textAlign: "center",
        background: "rgba(28, 31, 60, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "var(--border-radius)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 188, 212, 0.15)",
        color: "var(--text-secondary)"
      }}>
        <h2 style={{
          fontSize: "1.8rem",
          marginBottom: "20px",
          color: "var(--text-primary)"
        }}>Please log in to upload tickets</h2>
        <button
          onClick={() => navigate("/login")}
          className="modern-button"
          style={{ marginTop: "20px" }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{
      maxWidth: "500px",
      width: "90%",
      margin: "50px auto",
      padding: "40px",
      background: "rgba(28, 31, 60, 0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: "var(--border-radius)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 8px 32px rgba(0, 188, 212, 0.15)",
      color: "var(--text-primary)"
    }}>
      <h1 style={{
        fontSize: "2.5rem",
        marginBottom: "30px",
        background: "var(--accent-gradient)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textAlign: "center"
      }}>Upload Your Ticket</h1>

      <p style={{
        textAlign: "center",
        marginBottom: "30px",
        color: "var(--text-secondary)"
      }}>Share your ticket with others in our marketplace</p>

      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        {/* Event Name Input */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1.2rem"
          }}>🎫</span>
          <input
            type="text"
            name="eventName"
            placeholder="Event Name"
            value={formData.eventName}
            onChange={handleChange}
            required
            className="modern-input"
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              boxSizing: "border-box",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-primary)",
              fontSize: "1rem"
            }}
          />
        </div>

        {/* Event Date Input */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1.2rem"
          }}>📅</span>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="modern-input"
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              boxSizing: "border-box",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-primary)",
              fontSize: "1rem"
            }}
          />
        </div>

        {/* Price Input */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1.2rem"
          }}>₪</span>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="modern-input"
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              boxSizing: "border-box",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-primary)",
              fontSize: "1rem"
            }}
          />
        </div>

        {/* Location Input */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1.2rem"
          }}>📍</span>
          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={formData.location}
            onChange={handleChange}
            required
            className="modern-input"
            style={{
              width: "100%",
              padding: "12px 16px 12px 40px",
              boxSizing: "border-box",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--border-radius)",
              color: "var(--text-primary)",
              fontSize: "1rem"
            }}
          />
        </div>

        {error && (
          <div style={{
            color: "var(--accent-main)",
            textAlign: "center",
            padding: "10px",
            background: "rgba(255, 59, 48, 0.1)",
            borderRadius: "var(--border-radius)",
            marginTop: "10px"
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="modern-button"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.1rem",
            fontWeight: "600",
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}
        >
          {loading ? (
            <span className="loader"></span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Upload Ticket
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default UploadTicket;
