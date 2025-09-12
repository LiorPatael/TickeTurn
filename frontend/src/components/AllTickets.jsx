import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3050/tickets")
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));
  }, []);

  if (tickets.length === 0) 
    return <div style={{ textAlign: "center", marginTop: "50px" }}>No tickets available.</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "50px auto" }}>
      <h2 style={{ textAlign: "center" }}>Available Tickets</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
      {tickets
  .filter(ticket => !ticket.isSold) // רק כרטיסים זמינים
  .map(ticket => (
    <li key={ticket.id} style={{
      marginBottom: "15px",
      backgroundColor: "#d4edda",
      padding: "15px",
      borderRadius: "10px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <strong>{ticket.eventName}</strong>
        <span>{ticket.eventDate}</span>
      </div>
      <button
        onClick={() => navigate(`/buy/${ticket.id}`)}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        View
      </button>
    </li>
))}
      </ul> 
    </div>
  );
}

export default AllTickets;
