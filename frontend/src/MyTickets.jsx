import { useEffect, useState } from "react";
import TicketDetails from "./TicketDetails";
import "./MyTickets.css";
import Chatbot from "./Chatbot";

function MyTickets({ user, onBack }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError("");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/author/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load tickets");
        }

        setTickets(data.tickets || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user.id]);

  if (selectedTicketId) {
    return (
      <TicketDetails
        ticketId={selectedTicketId}
        user={user}
        onBack={() => setSelectedTicketId(null)}
      />
    );
  }

  return (
    <div className="my-tickets-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h1>My Support Tickets</h1>
      <p>View and track your support requests.</p>

      {loading && <p>Loading tickets...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p>You haven't raised any tickets yet.</p>
      )}

      <div className="tickets-list">
        {tickets.map((ticket) => (
          <div className="ticket-card" key={ticket.ticket_id}>
            <div className="ticket-card-header">
              <span>{ticket.ticket_id}</span>
              <span className="ticket-status">{ticket.status}</span>
            </div>

            <h3>{ticket.subject}</h3>
            <p>{ticket.description}</p>

            <div className="ticket-meta">
              <span>Category: {ticket.category}</span>
              <span>Priority: {ticket.priority}</span>
              <span>
                Created: {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>

            <button
              className="view-ticket-button"
              onClick={() => setSelectedTicketId(ticket.ticket_id)}
            >
              View Details →
            </button>
          </div>
        ))}
      </div>
      <Chatbot id={user.id} />
    </div>
  );
}

export default MyTickets;
