import { useState } from "react";
import AdminTickets from "./AdminTickets";
import "./AdminDashboard.css";
import AdminTicketDetails from "./AdminTicketDetails";
import Analytics from "./Analytics";
import AddAuthorPopup from "./AddAuthorPopup";

function AdminDashboard({ user, onLogout }) {
  const [showTickets, setShowTickets] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showAddAuthor, setShowAddAuthor] = useState(false);

  const handleAddAuthor = async (data) => {
    console.log(data);

    // Post Request
    let response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/authors/new`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    console.log(await response.json());
  };

  if (selectedTicketId) {
    return (
      <AdminTicketDetails
        ticketId={selectedTicketId}
        onBack={() => setSelectedTicketId(null)}
      />
    );
  }

  if (showTickets) {
    return (
      <AdminTickets
        onBack={() => setShowTickets(false)}
        onViewTicket={setSelectedTicketId}
      />
    );
  }

  if (showAddAuthor) {
    return (
      <AddAuthorPopup
        onClose={() => setShowAddAuthor(false)}
        onSubmit={handleAddAuthor}
      />
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1>BookLeaf Admin Portal</h1>
          <p>Welcome, {user.name || user.email}</p>
        </div>

        <button onClick={onLogout}>Log Out</button>
      </header>

      <section className="admin-dashboard-card">
        <h2>Support Management</h2>
        <p>View, filter, and manage author support tickets.</p>

        <button onClick={() => setShowTickets(true)}>Open Ticket Queue</button>

        {/* Add New user button */}
        <button id="add_authon_btn" onClick={() => setShowAddAuthor(true)}>
          + Add Author
        </button>
      </section>
      {/* Analytics */}
      <Analytics />
    </div>
  );
}

export default AdminDashboard;
