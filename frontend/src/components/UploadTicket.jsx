import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import './UploadTicket.css';

function UploadTicket() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    price: "",
    location: ""
  });
  const [ticketImage, setTicketImage] = useState(null);
  const [error, setError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTicketImage(file);
    setIsExtracting(true);
    setError('');

    const formData = new FormData();
    formData.append('ticketImage', file);

    try {
      const res = await fetch('http://localhost:3050/api/vision/extract-text', {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to extract text from image.');
      }

      const { text } = responseData;

      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const newFormData = {};

      const datePatterns = [
        { regex: /(?<month>\d{1,2})[/-](?<day>\d{1,2})[/-](?<year>\d{2,4})/, score: 8 },
        { regex: /(?<day>\d{1,2})\s(?<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s(?<year>\d{4})/i, score: 10 },
        { regex: /(?<month>Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s(?<day>\d{1,2}),?\s(?<year>\d{4})/i, score: 10 },
      ];
      const monthMap = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

      const pricePatterns = [
        { regex: /[$€₪]\s*(\d+\.?\d*)/, score: 10, group: 1 },
        { regex: /(price|ticket|cost|total):?\s*\D*(\d+\.?\d*)/i, score: 11, group: 2 }
      ];

      const locationPatterns = [
        { regex: /\b(arena|stadium|park|hall|theater|centre|club)\b/i, score: 8 },
        { regex: /\b([A-Z][a-z]+,\s[A-Z]{2})\b/i, score: 10 }, // City, ST
        { regex: /\b\d+\s.*(street|st|ave|rd|blvd)\b/i, score: 9 }
      ];

      const fieldScores = {
        eventDate: { bestScore: 0, value: null, lineIndex: -1 },
        price: { bestScore: 0, value: null, lineIndex: -1 },
        location: { bestScore: 0, value: null, lineIndex: -1 },
        eventName: { bestScore: 0, value: null, lineIndex: -1 }
      };

      lines.forEach((line, index) => {
        for (const p of datePatterns) {
          const match = line.match(p.regex);
          if (match && p.score > fieldScores.eventDate.bestScore) {
            fieldScores.eventDate.bestScore = p.score;
            fieldScores.eventDate.value = match;
            fieldScores.eventDate.lineIndex = index;
          }
        }
        for (const p of pricePatterns) {
          const match = line.match(p.regex);
          if (match && p.score > fieldScores.price.bestScore) {
            fieldScores.price.bestScore = p.score;
            fieldScores.price.value = match[p.group];
            fieldScores.price.lineIndex = index;
          }
        }
        for (const p of locationPatterns) {
          if (p.regex.test(line) && p.score > fieldScores.location.bestScore) {
            fieldScores.location.bestScore = p.score;
            fieldScores.location.value = line;
            fieldScores.location.lineIndex = index;
          }
        }
      });

      const usedIndexes = new Set([
        fieldScores.eventDate.lineIndex,
        fieldScores.price.lineIndex,
        fieldScores.location.lineIndex
      ]);

      lines.forEach((line, index) => {
        if (usedIndexes.has(index)) return;
        let score = 5;
        if (index < 2) score += 3;
        if (line.length < 5) score -= 5;
        if (/\d/.test(line)) score -= 2;
        if (score > fieldScores.eventName.bestScore) {
          fieldScores.eventName.bestScore = score;
          fieldScores.eventName.value = line;
        }
      });

      if (fieldScores.eventDate.value) {
        try {
          const { day, month, year } = fieldScores.eventDate.value.groups;
          const yearF = year.length === 2 ? `20${year}` : year;
          const monthNum = isNaN(month) ? monthMap[month.substring(0,3).toLowerCase()] : month;
          newFormData.eventDate = new Date(yearF, monthNum - 1, day).toISOString().split('T')[0];
        } catch {}
      }
      if (fieldScores.price.value) newFormData.price = fieldScores.price.value;
      if (fieldScores.location.value) newFormData.location = fieldScores.location.value.split(',')[0]; // Extract only the city
      if (fieldScores.eventName.value) newFormData.eventName = fieldScores.eventName.value.trim();

      console.log("Smart parsing result:", newFormData);
      setFormData(prev => ({ ...prev, ...newFormData }));

    } catch (err) {
      setError(err.message || 'Could not analyze ticket image.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      // Validate data before sending
      if (!formData.eventName || !formData.eventDate || !formData.price || !formData.location) {
        throw new Error("Please fill in all fields");
      }

      // Parse and validate price
      const numericPrice = parseFloat(formData.price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error("Please enter a valid price");
      }

      // Validate date
      const eventDate = new Date(formData.eventDate);
      if (isNaN(eventDate.getTime())) {
        throw new Error("Please enter a valid date");
      }

      // Use the date string directly from the form input
      // The input type="date" returns dates in YYYY-MM-DD format
      const validatedData = {
        title: formData.eventName, // Use eventName for title
        ...formData,
        price: numericPrice,
        eventDate: formData.eventDate, // This is already in YYYY-MM-DD format
      };

      const postData = new FormData();
      Object.keys(validatedData).forEach(key => {
        postData.append(key, validatedData[key]);
      });
      if (ticketImage) {
        postData.append('ticketImage', ticketImage);
      }

      console.log("Sending ticket data:", validatedData);
      console.log("DEBUG token:", token);

      // Ensure we have a token (avoid sending 'Bearer undefined')
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      // Build headers conditionally - NOTE: Content-Type is set by browser for FormData
      const headers = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("http://localhost:3050/tickets", {
        method: "POST",
        headers,
        body: postData
      });

      // Safely parse response body (server might return non-JSON on 500)
      const raw = await res.text();
      let responseData = {};
      try {
        responseData = raw ? JSON.parse(raw) : {};
      } catch (parseErr) {
        responseData = { message: raw || res.statusText };
      }

      if (!res.ok) {
        console.error("Server error response:", responseData);
        let errorMessage = responseData.message || responseData.error || `Failed to upload ticket (${res.status})`;
        
        // New: Handle Joi's specific error structure
        if (responseData.details && Array.isArray(responseData.details) && responseData.details.length > 0) {
          // The actual message from Joi is in the 'message' property of the first details object
          const validationDetails = responseData.details[0].message || 'No details provided.';
          errorMessage = `Validation error: ${validationDetails}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log("Upload successful:", responseData);
      alert("✨ Ticket uploaded successfully!");
      navigate("/");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="upload-ticket-container glass-card">
        <h2>Please log in to upload tickets</h2>
        <button className="modern-button" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="upload-ticket-container glass-card">
      <h1>Upload Your Ticket</h1>
      <p>Share your ticket with others in our marketplace</p>

      <form onSubmit={handleSubmit}>
        <div className="input-wrap">
          <span className="input-icon">🎫</span>
          <input
            type="text"
            name="eventName"
            placeholder="Event Name"
            value={formData.eventName}
            onChange={handleChange}
            required
            className="modern-input"
          />
        </div>

        <div className="input-wrap">
          <span className="input-icon">📅</span>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleChange}
            required
            className="modern-input"
          />
        </div>

        <div className="input-wrap">
          <span className="input-icon">₪</span>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="modern-input"
          />
        </div>

        <div className="input-wrap">
          <span className="input-icon">📍</span>
          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={formData.location}
            onChange={handleChange}
            required
            className="modern-input"
          />
        </div>

        <div className="input-wrap">
          <span className="input-icon">📸</span>
          <input
            type="file"
            name="ticketImage"
            onChange={handleFileChange}
            className="modern-input"
            disabled={isExtracting}
          />
        </div>

        {isExtracting && <div className="extracting-message">Analyzing ticket...</div>}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <button type="submit" disabled={loading} className="modern-button">
          {loading ? <span className="loader"/> : 'Upload Ticket'}
        </button>
      </form>
    </div>
  );
}

export default UploadTicket;
