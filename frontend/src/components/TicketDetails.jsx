import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3050/tickets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Ticket not found on server");
        return res.json();
      })
      .then(data => setTicket(data))
      .catch(() => {
        // fallback ל-localStorage אם אין בשרת
        const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
        const found = tickets.find(t => t.id.toString() === id);
        setTicket(found || null);
      });
  }, [id]);

  if (!ticket)
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading ticket...</div>;

  return (
    <div style={{
      maxWidth: "800px",
      margin: "50px auto",
      padding: "20px",
      borderRadius: "10px",
      backgroundColor: "#f0f9f0",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
    }}>
      {/* פרטי האירוע */}
      <div style={{ marginBottom: "30px" }}>
        <h2>{ticket.eventName}</h2>
        <p><strong>Date:</strong> {ticket.eventDate}</p>
        <p><strong>Price:</strong> ${ticket.price}</p>
        <p><strong>Location:</strong> {ticket.location}</p>
      </div>

      {/* הפרדה בין פרטי האירוע לפרטי המוכר */}
      <hr style={{ margin: "20px 0", border: "1px solid #ccc" }} />

      {/* פרטי המוכר */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "15px" }}>
        <div style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          backgroundColor: "#28a745",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "18px"
        }}>
          {ticket.seller?.name ? ticket.seller.name[0].toUpperCase() : "?"}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{ticket.seller?.name || "Unknown"}</p>
          <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>{ticket.seller?.email || "-"}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(`/buy/${ticket.id}`)}
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
        Buy Ticket
      </button>
    </div>
  );
}

export default TicketDetails;
