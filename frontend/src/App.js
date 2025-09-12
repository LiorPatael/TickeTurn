import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import SearchBar from './components/SearchBar';
import logo from './logo.png';
import UploadTicket from './components/UploadTicket';
import TicketDetails from './components/TicketDetails';
import AllTickets from './components/AllTickets'; 
import { FaUpload } from 'react-icons/fa';
import mockTickets from './mockTickets.json';
import BuyTicket from './components/BuyTicket';
import { Link } from 'react-router-dom';

function App() {
  const [results, setResults] = useState([]);
  const [user, setUser] = useState(null);

  const [tickets, setTickets] = useState(() => {
    const storedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
    const mergedTickets = [...mockTickets, ...storedTickets].filter(
      (ticket, index, self) => index === self.findIndex(t => t.id === ticket.id)
    );
    localStorage.setItem("tickets", JSON.stringify(mergedTickets));
    return mergedTickets;
  });

  const handleSearch = (query) => {
    if (!query) {
      setResults([]);
      return;
    }
    const filtered = tickets.filter(ticket =>
      ticket.eventName.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="app-container" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* Header תמידי */}
      <Header user={user} setUser={setUser} />

      <div style={{ flex: 1, padding: "20px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: "20px" }}>
                  <span style={{ fontWeight: "bold", color: "#333" }}>Upload Here</span>
                  <Link to="/upload" style={{ textDecoration: "none", color: "black", fontSize: "30px" }}>
                    <FaUpload title="Upload Ticket" />
                  </Link>
                </div>
                <img src={logo} alt="TickeTurn Logo" className="logo" /><br />
                <h1 style={{ textAlign: "center", marginTop: "50px" }}>SEARCH. BUY. ENJOY.</h1>
                <h2 style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}>Find your next event with TickeTurn!</h2>
                <SearchBar onSearch={handleSearch} />
                <div style={{ maxWidth: "800px", margin: "20px auto" }}>
                  {results.length > 0 && results.map(ticket => (
                    <div key={ticket.id} style={{ marginBottom: "15px", backgroundColor: "#d4edda", padding: "15px", borderRadius: "10px" }}>
                      <Link to={`/upload/${ticket.id}`} style={{ textDecoration: "none", color: "#155724", fontWeight: "bold" }}>
                        {ticket.eventName} - {ticket.eventDate}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            }
          />

          {/* דפי התחברות והרשמה */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />

          {/* דפי כרטיסים */}
          <Route path="/upload" element={<UploadTicket />} />
          <Route path="/upload/:id" element={<TicketDetails />} />
          <Route path="/my-tickets" element={<AllTickets />} />
          <Route path="/buy/:id" element={<BuyTicket />} />
        </Routes>
      </div>

      {/* Footer תמידי */}
      <Footer />
    </div>
  );
}

export default App;
