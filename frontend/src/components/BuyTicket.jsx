import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function BuyTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext); // ל־JWT
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3050/tickets/${id}`)
      .then(res => res.json())
      .then(data => setTicket(data))
      .catch(() => setTicket(null));
  }, [id]);

  if (!ticket) return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading ticket...</div>;

  const handlePurchase = async () => {
    if (!token) return alert("You must be logged in to purchase!");

    const res = await fetch(`http://localhost:3050/tickets/${id}/purchase`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return alert("Error: " + err.message);
    }

    alert(`✅ Ticket for "${ticket.eventName}" purchased successfully!`);
    navigate("/"); // חזרה לעמוד הראשי אחרי קנייה
  };

  return (
    <div style={{
      maxWidth: "600px",
      margin: "50px auto",
      padding: "20px",
      borderRadius: "10px",
      backgroundColor: "#f8f9fa",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      {/* פרטי האירוע */}
      <div style={{ marginBottom: "20px" }}>
        <h2>{ticket.eventName}</h2>
        <p><strong>Date:</strong> {ticket.eventDate}</p>
        <p><strong>Price:</strong> ${ticket.price}</p>
        <p><strong>Location:</strong> {ticket.location}</p>
      </div>

      <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

      {/* פרטי המוכר */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#28a745",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold"
        }}>
          {ticket.seller?.name ? ticket.seller.name[0].toUpperCase() : "?"}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0 }}>{ticket.seller?.name || "Unknown"}</p>
          <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>{ticket.seller?.email || "-"}</p>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Confirm Purchase
      </button>
    </div>
  );
}

export default BuyTicket;
