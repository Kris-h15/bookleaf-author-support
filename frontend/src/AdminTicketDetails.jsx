import { useEffect, useState } from "react";
import "./AdminTicketDetails.css";
import InternalNotes from "./InternalNotes";
import "./InternalNotes.css";
import AIDraft from "./AIDraft";
import socket from "./socket";

function AdminTicketDetails({ ticketId, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState("Open");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [messages, setMessages] = useState([]);

  // useEffect(() => {
  //   let cancelled = false;

  //   async function loadTicket() {
  //     // socket.io connection ===========================
  //     socket.connect();
  //     socket.emit("join-ticket", ticketId);

  //     // ======================================
  //     try {
  //       setLoading(true);
  //       setError("");

  //       const response = await fetch(
  //         `http://localhost:5000/api/tickets/${ticketId}`,
  //       );
  //       const data = await response.json();

  //       if (!response.ok) {
  //         throw new Error(data.message || "Unable to load ticket");
  //       }

  //       if (!cancelled) {
  //         setTicket(data.ticket);
  //         setStatus(data.ticket.status);
  //         setPriority(data.ticket.priority);
  //       }
  //     } catch (err) {
  //       if (!cancelled) setError(err.message);
  //     } finally {
  //       if (!cancelled) setLoading(false);
  //     }
  //   }
  //   loadTicket();

  //   // socket.io

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    let cancelled = false;

    const handleNewMessage = (data) => {
      // Ignore messages for another ticket
      if (data.ticketId !== ticketId) return;

      const incomingMessage = data.message;

      setTicket((current) => {
        if (!current) return current;

        // Avoid displaying a duplicate message
        const exists = current.messages?.some(
          (message) =>
            message._id &&
            incomingMessage._id &&
            message._id === incomingMessage._id,
        );

        if (exists) return current;

        return {
          ...current,
          messages: [...(current.messages || []), incomingMessage],
        };
      });
    };

    const handleChatError = (message) => {
      if (!cancelled) setError(message);
    };

    socket.on("new-message", handleNewMessage);
    socket.on("chat-error", handleChatError);

    socket.connect();
    socket.emit("join-ticket", ticketId);

    async function loadTicket() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/tickets/${ticketId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load ticket");
        }

        if (!cancelled) {
          setTicket(data.ticket);
          setStatus(data.ticket.status);
          setPriority(data.ticket.priority);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTicket();

    return () => {
      cancelled = true;

      socket.emit("leave-ticket", ticketId);
      socket.off("new-message", handleNewMessage);
      socket.off("chat-error", handleChatError);
    };
  }, [ticketId]);

  async function updateTicket(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/admin/${ticketId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, priority }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update ticket");
      }

      setTicket(data.ticket);
      setSuccess("Ticket updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading ticket...</p>;

  if (error && !ticket) {
    return (
      <div className="admin-ticket-details">
        <button onClick={onBack}>← Back to Queue</button>
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="admin-ticket-details">
      <button className="admin-back-button" onClick={onBack}>
        ← Back to Queue
      </button>

      <h1>{ticket.subject}</h1>
      <p>Ticket ID: {ticket.ticket_id}</p>
      <p>Regarding: {ticket.book_name}</p>

      <section id="authorimg" className="admin-detail-card">
        <div>
          <h2>Author Information</h2>
          <p>Name: {ticket.author?.name || "Unknown"}</p>
          <p>Email: {ticket.author?.email || "Unknown"}</p>
        </div>
        <div>
          <img id="author_image" src={ticket.author.photoUrl} alt="PHOTO" />
        </div>
      </section>

      <section id="ticket_descr" className="admin-detail-card">
        <div>
          <h2>Ticket Description</h2>
          <p>{ticket.description}</p>
        </div>
        <div>
          <img
            id="book_image"
            src={`./images/${ticket.book_name}.jpg`}
            alt="Book Img"
          />
        </div>
      </section>

      <section className="admin-detail-card">
        <h2>Manage Ticket</h2>

        <form onSubmit={updateTicket} className="admin-update-form">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Waiting for Author</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </label>

          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}
      </section>

      <section className="admin-detail-card">
        <h2>Conversation</h2>

        {ticket.messages?.length ? (
          ticket.messages.map((message, index) => (
            <div className="admin-message" key={message._id || index}>
              <strong>{message.senderName}</strong>
              <span>{message.senderRole}</span>
              <p>{message.message}</p>
              <small>{new Date(message.createdAt).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </section>
      {/* to generate  ai-Response */}
      <AIDraft
        ticketId={ticketId}
        onReplySent={(updatedTicket) => {
          setTicket((current) =>
            current
              ? {
                  ...current,
                  messages: updatedTicket.messages,
                }
              : current,
          );
        }}
      />
      <InternalNotes
        ticketId={ticketId}
        internalNotes={ticket.internalNotes || []}
      />
    </div>
  );
}

export default AdminTicketDetails;
