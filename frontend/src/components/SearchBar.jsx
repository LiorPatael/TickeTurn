import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import '../styles/theme.css';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTickets = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Searching for:', searchQuery);
      
      const response = await fetch(
        `http://localhost:3050/tickets?search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      console.log('Search results:', data);
      const results = Array.isArray(data) ? data : [];
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching tickets:', err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch]);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    searchTickets(newQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      searchTickets(query);
    }
  };

  return (
    <div className="search-container glass-card" style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      position: "relative",
      padding: "24px",
      maxWidth: "500px",
      width: "90%",
      margin: "50px auto",
      background: "rgba(28, 31, 60, 0.8)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 8px 32px rgba(0, 188, 212, 0.15)",
      boxSizing: "border-box"
    }}>
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        width: "100%",
        position: "relative",
        boxSizing: "border-box"
      }}>
        <input
          type="text"
          placeholder="חפש אירוע..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="modern-input"
          style={{ 
            flex: 1,
            fontSize: "1.1rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.3s ease",
            width: "100%",
            boxSizing: "border-box",
            minWidth: 0 /* Prevents flex item from overflowing */
          }}
        />
        <button
          onClick={() => searchTickets(query)}
          disabled={isLoading}
          className="modern-button"
          style={{
            background: "var(--accent-gradient)",
            minWidth: "120px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          {isLoading ? (
            <span className="loader"></span>
          ) : (
            <>
              <span>Search</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div style={{ marginTop: "20px", color: "var(--text-secondary)" }}>
          <span className="loader"></span>
          Loading tickets...
        </div>
      ) : error ? (
        <div style={{ marginTop: "20px", color: "var(--accent-main)" }}>
          Error: {error}
        </div>
      ) : searchResults.length > 0 && (
        <ul style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          width: "100%",
          width: "100%",
          background: "rgba(28, 31, 60, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "var(--border-radius)",
          maxHeight: "300px",
          overflowY: "auto",
          listStyle: "none",
          margin: 0,
          padding: "8px",
          zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0, 188, 212, 0.15)"
        }}>
          {searchResults.map(ticket => (
            <li key={ticket.id} style={{
              margin: "4px 0",
              transition: "var(--transition)"
            }}>
              <Link
                to={`/buy/${ticket.id}`}
                style={{
                  display: "block",
                  padding: "16px",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  borderRadius: "var(--border-radius)",
                  background: "rgba(255, 255, 255, 0.05)",
                  transition: "var(--transition)",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
                onClick={() => setQuery("")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ 
                    fontSize: "1.1rem", 
                    fontWeight: "600",
                    background: "var(--accent-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    {ticket.eventName}
                  </span>
                  <span style={{ 
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem"
                  }}>
                    {new Date(ticket.eventDate).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {ticket.location && (
                  <div style={{ 
                    marginTop: "8px",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)"
                  }}>
                    <span>📍 {ticket.location}</span>
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
