import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function AllTicketsPaginated() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:3050/tickets')
      .then(res => res.json())
      .then(data => {
        setTickets(data);
        setFiltered(data);
      })
      .catch(err => console.error('Error fetching tickets:', err));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(tickets);
    } else {
      setFiltered(
        tickets.filter(ticket =>
          ticket.eventName.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    setCurrentPage(1); // reset when search changes
  }, [search, tickets]);

  // חישוב פאג’ינציה
  const indexOfLast = currentPage * ticketsPerPage;
  const indexOfFirst = indexOfLast - ticketsPerPage;
  const currentTickets = filtered.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filtered.length / ticketsPerPage);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 חיפוש כרטיסים</h2>

      <input
        type="text"
        placeholder="חפש אירוע..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {currentTickets.length === 0 && <p>לא נמצאו כרטיסים.</p>}

      {currentTickets.map((ticket) => (
        <Card key={ticket.id} className="mb-4 shadow-md">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold">{ticket.eventName}</h3>
            <p>📍 {ticket.location}</p>
            <p>📅 {ticket.date}</p>
            <p>💰 {ticket.price} ₪</p>
          </CardContent>
        </Card>
      ))}

      {/* פאג’ינציה */}
      <div className="flex justify-between items-center mt-4">
        <Button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          הקודם
        </Button>
        <span>
          עמוד {currentPage} מתוך {totalPages}
        </span>
        <Button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          הבא
        </Button>
      </div>
    </div>
  );
}

export default AllTicketsPaginated;
