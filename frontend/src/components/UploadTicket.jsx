import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function UploadTicket() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!user) navigate("/login"); // אם לא מחובר, נשלח לדף התחברות
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return; // בטיחות נוספת

    const res = await fetch("http://localhost:3050/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ eventName, eventDate, price, location })
    });

    if (!res.ok) {
      const err = await res.json();
      return alert("Error: " + err.message);
    }

    alert("Ticket uploaded successfully!");
    navigate("/");
  };

  return (
    <div className="upload-ticket-container">
      <h2>Upload Ticket</h2>
      {user && (
        <form onSubmit={handleSubmit}>
          <input placeholder="Event name" value={eventName} onChange={e => setEventName(e.target.value)} required />
          <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
          <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
          <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required />
          <button type="submit">Upload Ticket</button>
        </form>
      )}
    </div>
  );
}

export default UploadTicket;
