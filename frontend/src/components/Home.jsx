import React, { useEffect, useState } from "react";

function Home() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3050/tickets")
      .then(res => res.json())
      .then(data => setTickets(data));
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "0 15px" }}>
      <h2 style={{ textAlign: "center", color: "#045c75" }}>Available Tickets</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" }}>
        {tickets.map(ticket => (
          <div key={ticket.id} style={{
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundColor: "#f8f9fa"
          }}>
            <h3>{ticket.eventName}</h3>
            <p><strong>Date:</strong> {ticket.eventDate}</p>
            <p><strong>Price:</strong> ${ticket.price}</p>
            <p><strong>Location:</strong> {ticket.location}</p>
            <p><strong>Seller:</strong> {ticket.seller.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
