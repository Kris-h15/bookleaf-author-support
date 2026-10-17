import { useEffect, useState } from "react";
import "./AdminTickets.css";

function AdminTickets({ onBack, onViewTicket }) {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [priority, setPriority] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTickets() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          status,
          category,
          priority,
          search,
        });

        const response = await fetch(
          `http://localhost:5000/api/tickets/admin/all?${params}`,
          { signal: controller.signal },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load tickets");
        }

        // console.log(data);
        setTickets(data.tickets || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchTickets();

    return () => controller.abort();
  }, [status, category, priority, search]);

  return (
    <div className="admin-tickets-page">
      <button className="admin-back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h1>Admin Ticket Queue</h1>
      <p>Review and manage author support requests.</p>

      <div className="ticket-filters">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ticket ID, subject, or description"
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Waiting for Author">Waiting for Author</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          <option value="Royalty">Royalty</option>
          <option value="Publishing">Publishing</option>
          <option value="Book Changes">Book Changes</option>
          <option value="Marketing">Marketing</option>
          <option value="Distribution">Distribution</option>
          <option value="Other">Other</option>
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="All">All priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {loading && <p>Loading tickets...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && tickets.length === 0 && (
        <p>No tickets match these filters.</p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-ticket-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Ticket ID</th>
                <th>Book Name</th>
                <th>Author</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Ai-classification</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticket_id}>
                  <td>
                    <img
                      className="dp_admin_tickets"
                      src={ticket.author.photoUrl}
                      alt="DP"
                    />
                  </td>
                  <td>{ticket.ticket_id}</td>
                  <td>{ticket.book_name}</td>
                  <td>{ticket.author?.name || "Unknown"}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.category}</td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.status}</td>
                  <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                  <td>
                    {ticket.aiClassification ? ticket.aiClassification : "NULL"}
                  </td>
                  <td>
                    <button onClick={() => onViewTicket(ticket.ticket_id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminTickets;
