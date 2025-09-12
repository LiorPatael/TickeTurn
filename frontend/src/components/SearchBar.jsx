import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState([]);

  // שולף את כל הכרטיסים מהשרת
  useEffect(() => {
    fetch("http://localhost:3050/tickets")
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const filteredTickets = query
    ? tickets.filter(ticket =>
        ticket.eventName.toLowerCase().includes(query.toLowerCase()) && !ticket.isSold
      )
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px", position: "relative" }}>
      <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "400px" }}>
        <input
          type="text"
          placeholder="חפש אירוע..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: "10px 15px", borderRadius: "5px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}
        >
          Search
        </button>
      </div>

      {filteredTickets.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "60px",
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "white",
          border: "1px solid #ccc",
          borderRadius: "5px",
          maxHeight: "200px",
          overflowY: "auto",
          listStyle: "none",
          margin: 0,
          padding: 0,
          zIndex: 1000
        }}>
          {filteredTickets.map(ticket => (
            <li key={ticket.id}>
              <Link
                to={`/buy/${ticket.id}`}
                style={{ display: "block", padding: "10px", textDecoration: "none", color: "black" }}
                onClick={() => setQuery("")}
              >
                {ticket.eventName} – {ticket.eventDate}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
