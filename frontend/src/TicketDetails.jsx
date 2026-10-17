import { useEffect, useState } from "react";
import "./TicketDetails.css";
import socket from "./socket";

function TicketDetails({ ticketId, user, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  // useEffect(() => {
  //   const fetchTicket = async () => {
  //     try {
  //       setLoading(true);
  //       setError("");

  //       // We will add this single-ticket API in the backend next.
  //       const response = await fetch(
  //         `http://localhost:5000/api/tickets/${ticketId}`,
  //       );

  //       const data = await response.json();

  //       if (!response.ok) {
  //         throw new Error(data.message || "Unable to load ticket");
  //       }

  //       setTicket(data.ticket);
  //     } catch (err) {
  //       setError(err.message || "Unable to connect to the server");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTicket();

  //   // Socket.io Connection =====================

  //   if (!ticketId) return;

  //   const handleNewMessage = (message) => {
  //     setMessages((previous) => [...previous, message]);
  //   };

  //   socket.connect();

  //   socket.emit("join-ticket", ticketId);
  //   socket.on("new-message", (data) => {
  //     (setReply[data],
  //       () => {
  //         sendReply;
  //       });
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  //   // ===========================================
  // }, [ticketId]);

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
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

        setTicket(data.ticket);
      } catch (err) {
        setError(err.message || "Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    const handleNewMessage = (data) => {
      // Server sends { ticketId, message }
      if (data.ticketId !== ticketId) return;

      setTicket((previous) => {
        if (!previous) return previous;

        const incomingMessage = data.message;

        // Prevent duplicates if the same message arrives twice
        const alreadyExists = previous.messages?.some(
          (message) =>
            message._id &&
            incomingMessage._id &&
            message._id === incomingMessage._id,
        );

        if (alreadyExists) return previous;

        return {
          ...previous,
          messages: [...(previous.messages || []), incomingMessage],
        };
      });
    };

    const handleChatError = (message) => {
      setError(message);
    };

    socket.connect();

    socket.on("new-message", handleNewMessage);
    socket.on("chat-error", handleChatError);

    socket.emit("join-ticket", ticketId);

    fetchTicket();

    return () => {
      socket.emit("leave-ticket", ticketId);
      socket.off("new-message", handleNewMessage);
      socket.off("chat-error", handleChatError);
    };
  }, [ticketId]);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // const sendReply = async (e) => {
  //   e.preventDefault();

  //   if (!reply.trim()) return;

  //   try {
  //     setSending(true);
  //     setError("");

  //     const response = await fetch(
  //       `http://localhost:5000/api/tickets/${ticketId}/replies`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           authorId: user.id,
  //           message: reply.trim(),
  //         }),
  //       },
  //     );

  //     const data = await response.json();

  //     // socket.io msg to server
  //     // socket.emit("msg", { authorId: user.id, message: reply.trim() });

  //     if (!response.ok) {
  //       throw new Error(data.message || "Unable to send reply");
  //     }

  //     setTicket(data.ticket);
  //     setReply("");
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setSending(false);
  //   }
  // };

  const sendReply = async (e) => {
    e.preventDefault();

    if (!reply.trim()) return;

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticketId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authorId: user.id,
            message: reply.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send reply");
      }

      // Update the sender's screen from the HTTP response
      setTicket(data.ticket);

      // Get the saved message from the updated ticket
      const savedMessage =
        data.ticket.messages[data.ticket.messages.length - 1];

      // Notify the Socket.IO server AFTER the HTTP save succeeds
      socket.emit("msg", {
        ticketId,
        message: savedMessage,
      });

      setReply("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="ticket-details-message">Loading ticket...</div>;
  }

  if (error) {
    return (
      <div className="ticket-details-message">
        <p>{error}</p>
        <button onClick={onBack}>Back to My Tickets</button>
      </div>
    );
  }

  if (!ticket) {
    return <div className="ticket-details-message">Ticket not found.</div>;
  }

  return (
    <div className="ticket-details-page">
      <main className="ticket-details-container">
        <button className="details-back-button" onClick={onBack}>
          ← Back to My Tickets
        </button>

        <section className="ticket-details-card">
          <div className="details-heading">
            <div>
              <span className="details-ticket-id">{ticket.ticket_id}</span>
              <h1>{ticket.subject}</h1>
            </div>

            <span
              className={`details-status ${ticket.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {ticket.status}
            </span>
          </div>

          <div className="details-metadata">
            <div>
              <span>Category</span>
              <strong>{ticket.category}</strong>
            </div>
            <div>
              <span>Priority</span>
              <strong>{ticket.priority}</strong>
            </div>
            <div>
              <span>Created</span>
              <strong>{formatDate(ticket.createdAt)}</strong>
            </div>
            <div>
              <span>Last updated</span>
              <strong>{formatDate(ticket.updatedAt)}</strong>
            </div>
          </div>

          <section className="details-description">
            <h2>Issue Description</h2>
            <p>{ticket.description}</p>
          </section>

          <section className="details-conversation">
            <h2>Conversation History</h2>

            {ticket.messages?.length ? (
              ticket.messages.map((message, index) => (
                <article className="details-message" key={index}>
                  <div className="details-message-header">
                    <strong>{message.senderName}</strong>
                    <span>{message.senderRole}</span>
                  </div>

                  <p>{message.message}</p>

                  <small>{formatDate(message.createdAt)}</small>
                </article>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </section>

          {/* Write a Reply Box */}
          <hr />

          <h2>Write a Reply</h2>

          <form onSubmit={sendReply} className="reply-form">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              maxLength={5000}
              required
            />

            <button
              type="submit"
              className="view-ticket-button"
              disabled={sending || !reply.trim()}
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default TicketDetails;
