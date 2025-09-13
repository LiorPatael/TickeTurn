import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LatestTicketsSlider() {
  const [tickets, setTickets] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3050/tickets/latest')
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching latest tickets:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(current => 
        current === tickets.length - 1 ? 0 : current + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [tickets.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (!tickets.length) {
    return null;
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '400px',
      overflow: 'hidden',
      borderRadius: 'var(--border-radius)',
      marginBottom: '40px'
    }}>
      <div style={{
        display: 'flex',
        width: `${tickets.length * 100}%`,
        transform: `translateX(-${(currentSlide * (100 / tickets.length))}%)`,
        transition: 'transform 0.5s ease-in-out',
        height: '100%'
      }}>
        {tickets.map((ticket, index) => (
          <div
            key={ticket.id}
            onClick={() => navigate(`/ticket/${ticket.id}`)}
            style={{
              width: `${100 / tickets.length}%`,
              padding: '20px',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            <div className="glass-card" style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '30px',
              background: 'rgba(28, 31, 60, 0.8)',
              backdropFilter: 'blur(20px)',
              transition: 'transform 0.3s ease',
              transform: currentSlide === index ? 'scale(1)' : 'scale(0.95)',
              opacity: currentSlide === index ? 1 : 0.7,
            }}>
              <div>
                <h3 style={{
                  fontSize: '2rem',
                  marginBottom: '15px',
                  background: 'var(--accent-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{ticket.eventName}</h3>
                <p style={{
                  fontSize: '1.2rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '10px'
                }}>
                  {new Date(ticket.eventDate).toLocaleDateString('he-IL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {ticket.location && (
                  <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '20px'
                  }}>
                    📍 {ticket.location}
                  </p>
                )}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'var(--accent-color)'
                }}>
                  ${ticket.price}
                </span>
                <button
                  className="modern-button"
                  style={{
                    background: 'var(--accent-gradient)',
                    padding: '12px 24px'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide indicators */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px'
      }}>
        {tickets.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              background: currentSlide === index ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default LatestTicketsSlider;
