import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function BuyTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3050/tickets/${id}`)
      .then(res => res.json())
      .then(data => setTicket(data))
      .catch(() => setTicket(null));
  }, [id]);

  if (!ticket) {
    return (
      <div className="glass-card" style={{
        maxWidth: "600px",
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
        <span className="loader"></span>
        <p style={{ marginTop: "20px" }}>Loading ticket details...</p>
      </div>
    );
  }

  const handlePurchase = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3050/tickets/${id}/purchase`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to purchase ticket");
      }

      alert(`✅ Ticket for "${ticket.eventName}" purchased successfully!`);
      navigate("/");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{
      maxWidth: "600px",
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
      {/* פרטי האירוע */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "2.5rem",
          marginBottom: "20px",
          background: "var(--accent-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center"
        }}>{ticket.eventName}</h1>

        <div style={{
          display: "grid",
          gap: "20px",
          padding: "20px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "var(--border-radius)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          {/* תאריך האירוע */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            color: "var(--text-secondary)"
          }}>
            <span style={{ fontSize: "1.5rem" }}>📅</span>
            <div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "5px" }}>תאריך האירוע</h3>
              <p>{new Date(ticket.eventDate).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}</p>
            </div>
          </div>

          {/* מיקום האירוע */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            color: "var(--text-secondary)"
          }}>
            <span style={{ fontSize: "1.5rem" }}>📍</span>
            <div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "5px" }}>מיקום</h3>
              <p>{ticket.location}</p>
            </div>
          </div>

          {/* מחיר כרטיס */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            color: "var(--text-secondary)"
          }}>
            <span style={{ fontSize: "1.5rem" }}>💰</span>
            <div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "5px" }}>מחיר</h3>
              <p style={{ 
                fontSize: "1.2rem", 
                color: "var(--accent-main)",
                fontWeight: "bold"
              }}>₪{ticket.price}</p>
            </div>
          </div>

          {/* פרטי המוכר */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "15px",
            color: "var(--text-secondary)"
          }}>
            <span style={{ fontSize: "1.5rem" }}>👤</span>
            <div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "5px" }}>מוכר</h3>
              <p>{ticket.sellerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* כפתור רכישת כרטיס */}
      <button
        onClick={handlePurchase}
        disabled={loading || ticket.isSold}
        className="modern-button"
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "1.2rem",
          fontWeight: "600",
          marginTop: "20px",
          opacity: ticket.isSold ? 0.7 : 1,
          cursor: ticket.isSold ? "not-allowed" : "pointer"
        }}
      >
        {loading ? (
          <span className="loader"></span>
        ) : ticket.isSold ? (
          "הכרטיס כבר נמכר"
        ) : (
          <>
            רכישת כרטיס - ₪{ticket.price}
          </>
        )}
      </button>

      {!token && (
        <p style={{ 
          textAlign: "center", 
          marginTop: "20px",
          color: "var(--text-secondary)",
          fontSize: "0.9rem"
        }}>
          אנא <span style={{ 
            color: "var(--accent-main)", 
            cursor: "pointer",
            textDecoration: "underline"
          }} onClick={() => navigate("/login")}>התחבר</span> כדי לרכוש כרטיס זה
        </p>
      )}
    </div>
  );
}

export default BuyTicket;
