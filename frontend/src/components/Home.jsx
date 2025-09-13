import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [latestTickets, setLatestTickets] = useState([]);
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

        // Fetch latest tickets
        const latestTicketsResponse = await fetch("http://localhost:3050/tickets/latest");
        const latestTicketsData = await latestTicketsResponse.json();
        setLatestTickets(latestTicketsData);
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
    <div className="container" style={{ padding: "40px 20px" }}>
      <div style={{ 
        textAlign: "center", 
        marginBottom: "60px"
      }}>
        <h1 style={{
          fontSize: "3rem",
          marginBottom: "20px",
          background: "var(--accent-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Welcome to TicketTurn
        </h1>
        <p style={{
          fontSize: "1.2rem",
          color: "var(--text-secondary)",
          marginBottom: "30px"
        }}>
          Buy and sell tickets securely
        </p>
        <button 
          onClick={() => navigate("/upload")}
          className="modern-button"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            padding: "16px 32px",
            fontSize: "1.1rem",
            fontWeight: "600",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "0 auto"
          }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
          </svg>
          Upload a Ticket
        </button>
      </div>

      {/* Latest Tickets Section */}
      {latestTickets.length > 0 && (
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{
            fontSize: "2rem",
            marginBottom: "30px",
            textAlign: "center",
            color: "var(--text-primary)",
            background: "var(--accent-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Latest Available Tickets</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            padding: "20px 0"
          }}>
            {latestTickets.map(ticket => (
              <div key={ticket.id} 
                className="glass-card"
                onClick={() => navigate(`/ticket/${ticket.id}`)}
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}>
                <h3 style={{ 
                  fontSize: "1.3rem", 
                  marginBottom: "10px",
                  color: "var(--text-primary)" 
                }}>{ticket.eventName}</h3>
                <p style={{ 
                  color: "var(--text-secondary)",
                  marginBottom: "8px" 
                }}>{ticket.eventDate}</p>
                <p style={{ 
                  fontSize: "1.2rem",
                  color: "var(--accent-color)",
                  fontWeight: "bold" 
                }}>${ticket.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Tickets Section */}
      <div>
        <h2 style={{
          fontSize: "2rem",
          marginBottom: "30px",
          textAlign: "center",
          color: "var(--text-primary)",
          background: "var(--accent-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>All Available Tickets</h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          padding: "20px 0"
        }}>
          {tickets.map(ticket => (
            <div key={ticket.id} 
              className="glass-card"
              onClick={() => navigate(`/ticket/${ticket.id}`)}
              style={{
                padding: "20px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}>
              <h3 style={{ 
                fontSize: "1.3rem", 
                marginBottom: "10px",
                color: "var(--text-primary)" 
              }}>{ticket.eventName}</h3>
              <p style={{ 
                color: "var(--text-secondary)",
                marginBottom: "8px" 
              }}>{ticket.eventDate}</p>
              <p style={{ 
                fontSize: "1.2rem",
                color: "var(--accent-color)",
                fontWeight: "bold" 
              }}>${ticket.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
