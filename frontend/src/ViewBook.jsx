import { useState, useEffect } from "react";
import "./ViewBook.css";
import Chatbot from "./Chatbot";

function ViewBook({ id, authorName = "NULL", onBack = () => {} }) {
  const [search, setSearch] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setbooks] = useState([]);

  useEffect(() => {
    const getbooks = async () => {
      // fetch all books using author_id from Book Collection
      let response = await fetch(
        `http://localhost:5000/api/authors/books/${id}`,
      );
      let data = await response.json();
      setbooks(data.books);
      //   console.log(`data : ${data.books}`);
      //   console.log("Books received:", books);
      //   console.log("Is books an array?", Array.isArray(books.books));
    };
    getbooks();
  }, [id]);

  //   const filteredBooks = books.filter((book) =>
  //     `${book.title} ${book.genre} ${book.isbn}`
  //       .toLowerCase()
  //       .includes(search.toLowerCase()),
  //   );

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="author-books-page">
      <header className="author-books-header">
        <div>
          <button className="author-books-back" onClick={onBack}>
            ← Back to Dashboard
          </button>

          <p className="author-books-eyebrow">MY LIBRARY</p>
          <h1>My Books</h1>
          <p className="author-books-subtitle">
            Welcome, {authorName}. Manage and explore your published work.
          </p>
        </div>

        <div className="author-books-total">
          <span>Total Books</span>
          <strong>{books.length}</strong>
        </div>
      </header>

      <div className="author-books-toolbar">
        <div className="author-books-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search your books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="author-books-result-count">
          {books.length} books found
        </span>
      </div>

      {books.length === 0 ? (
        <div className="author-books-empty">
          <div className="author-books-empty-icon">📚</div>
          <h2>No books found</h2>
          <p>
            {books.length === 0
              ? "You haven't added any books yet."
              : "Try another search term."}
          </p>
        </div>
      ) : (
        <div className="author-books-grid">
          {books.map((book) => (
            <article className="author-book-card" key={book._id}>
              <div className="author-book-cover">
                <img
                  src={`./images/${book.title}.jpg`}
                  alt={`${book.title} cover`}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/300x400/e2e8e5/164e45?text=Book+Cover";
                  }}
                />

                <span
                  className={`author-book-status ${
                    book.status?.toLowerCase() === "published"
                      ? "author-status-published"
                      : "author-status-draft"
                  }`}
                >
                  {book.status}
                </span>
              </div>

              <div className="author-book-info">
                <span className="author-book-genre">{book.genre}</span>

                <h2>{book.title}</h2>

                {/* <p className="author-book-description">{book.description}</p> */}

                <div className="author-book-details">
                  <div>
                    <span>ISBN</span>
                    <strong>{book.isbn || "—"}</strong>
                  </div>

                  <div>
                    <span>Published</span>
                    <strong>{formatDate(book.publication_date)}</strong>
                  </div>

                  <div>
                    <span>Price</span>
                    <strong>{book.mrp != null ? `₹${book.mrp}` : "—"}</strong>
                  </div>
                </div>

                <button
                  className="author-book-view-btn"
                  onClick={() => setSelectedBook(book)}
                >
                  View Details <span>→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedBook && (
        <div
          className="author-book-modal-overlay"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="author-book-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="author-book-modal-close"
              onClick={() => setSelectedBook(null)}
              aria-label="Close details"
            >
              ×
            </button>

            <img
              id="author_img"
              src={`./images/${selectedBook.title}.jpg`}
              alt={selectedBook.title}
            />

            <div>
              <span className="author-book-genre">{selectedBook.genre}</span>
              <h2>{selectedBook.title}</h2>
              <p>{selectedBook.description}</p>

              <p>
                <strong>Status:</strong> {selectedBook.status}
              </p>
              <p>
                <strong>ISBN:</strong> {selectedBook.isbn || "—"}
              </p>
              <p>
                <strong>Published:</strong>{" "}
                {formatDate(selectedBook.publication_date)}
              </p>
              <p>
                <strong>Print Partner:</strong> {selectedBook.print_partner}
              </p>
              <p>
                <strong>royalty per copy:</strong>{" "}
                {selectedBook.author_royalty_per_copy}
              </p>
              <p>
                <strong>Total royalty Earned:</strong>{" "}
                {selectedBook.total_royalty_earned}
              </p>
              <p>
                <strong>Total copies sold:</strong>{" "}
                {selectedBook.total_copies_sold}
              </p>
              <p>
                <strong>Available on:</strong>{" "}
                {selectedBook.available_on.join(", ")}
              </p>
              <p>
                <strong>Price:</strong>{" "}
                {selectedBook.mrp != null ? `₹${selectedBook.mrp}` : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Chatbot id={id} />
    </div>
  );
}

export default ViewBook;
