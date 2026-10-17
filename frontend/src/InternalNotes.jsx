import { useState } from "react";

function InternalNotes({ ticketId, internalNotes = [] }) {
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState(internalNotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addNote = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a note.");
      return;
    }

    setLoading(true);
    setError("");

    console.log(ticketId);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/internal-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add note");
      }

      setNotes(data.internalNotes);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="internal-notes">
      <h3>🔒 Internal Notes</h3>
      <p className="notes-subtitle">
        Private notes for internal ticket tracking (For Admin to Admin Talk).
      </p>

      <form onSubmit={addNote}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a private note..."
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Note"}
        </button>
      </form>

      {error && <p className="notes-error">{error}</p>}

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-notes">No internal notes yet.</div>
        ) : (
          notes.map((note, index) => (
            <article className="note-card" key={note._id || index}>
              <p>{note.message}</p>

              <div className="note-meta">
                <span>
                  Admin:{" "}
                  {typeof note.admin === "object"
                    ? note.admin?.name || note.admin?._id
                    : note.admin}
                </span>

                <span>
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default InternalNotes;
