import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all tickets
        const allTicketsResponse = await fetch("http://localhost:3050/tickets");
        const allTicketsData = await allTicketsResponse.json();
        setTickets(allTicketsData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "60vh" 
      }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "2rem",
        color: "var(--text-error)" 
      }}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">Welcome to TicketTurn</h1>
        <p className="home-subtitle">Buy and sell tickets securely</p>
        <button 
          onClick={() => navigate("/upload")}
          className="upload-button modern-button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          Upload a Ticket
        </button>
      </div>



      {/* All Tickets Section */}
      <div>
        <h2 className="tickets-section-title">All Available Tickets</h2>
        
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <div key={ticket.id} 
              className="glass-card ticket-card"
              onClick={() => navigate(`/ticket/${ticket.id}`)}>
              <h3 className="ticket-title">{ticket.eventName}</h3>
              <p className="ticket-date">{ticket.eventDate}</p>
              <p className="ticket-price">${ticket.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
