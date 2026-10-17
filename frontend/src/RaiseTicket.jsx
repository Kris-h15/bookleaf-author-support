import { useState } from "react";
import "./RaiseTicket.css";
import { useEffect } from "react";
import Chatbot from "./Chatbot";

function RaiseTicket({ user, onBack, onTicketCreated }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // New states for book dropdown
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [booksLoading, setBooksLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim() || !description.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorId: user.id,
          subject,
          description,
          selectedBook,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create ticket");
      }

      setSuccess(`Ticket ${data.ticket.ticket_id} created successfully!`);
      setSubject("");
      setDescription("");

      if (onTicketCreated) {
        onTicketCreated(data.ticket);
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  // Fetch books belonging to this author
  useEffect(() => {
    // console.log(user);
    if (!user?.author_id) return;

    const getBooks = async () => {
      try {
        setBooksLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/authors/books/${user.author_id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to fetch books");
        }

        setBooks(data.books || []);
      } catch (err) {
        setError(err.message || "Unable to fetch books");
      } finally {
        setBooksLoading(false);
      }
    };

    getBooks();
  }, [user?.author_id]);

  return (
    <div className="raise-ticket-page">
      <div className="raise-ticket-card">
        <button type="button" className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <h1>Raise a Support Ticket</h1>
        <p>Tell us about your issue. Our support team will review it.</p>

        <form onSubmit={handleSubmit}>
          {/* Books dropdown */}
          <label htmlFor="ticket-book">Select Book</label>

          <select
            id="ticket-book"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            disabled={booksLoading}
            required
          >
            <option value="">
              {booksLoading ? "Loading books..." : "-- Select a book --"}
            </option>

            {books.map((book) => (
              <option key={book._id} value={book.title}>
                {book.title}
              </option>
            ))}
          </select>

          {!booksLoading && books.length === 0 && (
            <p>No books found for this author.</p>
          )}

          <label htmlFor="ticket-subject">Subject</label>
          <input
            id="ticket-subject"
            type="text"
            placeholder="e.g. Royalty payment query"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={150}
            required
          />

          <label htmlFor="ticket-description">Describe your issue</label>
          <textarea
            id="ticket-description"
            placeholder="Explain your query in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            maxLength={5000}
            required
          />

          {error && <p className="ticket-error">{error}</p>}
          {success && <p className="ticket-success">{success}</p>}

          <button
            type="submit"
            className="submit-ticket-button"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
      <Chatbot id={user.id} />
    </div>
  );
}

export default RaiseTicket;
