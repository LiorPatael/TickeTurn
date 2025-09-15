import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import SearchBar from './components/SearchBar';
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

  const [tickets, setTickets] = useState([]);

  const handleSearch = (searchResults) => {
    setResults(searchResults);
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
                <div className="upload-cta">
                  <span className="upload-cta-label">Upload Here</span>
                  <Link to="/upload" className="upload-cta-link" aria-label="Upload Ticket">
                    <FaUpload className="upload-icon" />
                  </Link>
                </div>
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
