import { useEffect, useState } from "react";
import "./AuthorDashboard.css";
import RaiseTicket from "./RaiseTicket";
import TicketDetails from "./TicketDetails";
import MyTickets from "./MyTickets";
import ViewBook from "./ViewBook";
import Chatbot from "./Chatbot";
import AuthorGroupChat from "./AuthorGroupChat";

function AuthorDashboard({ user, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRaiseTicket, setShowRaiseTicket] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [viewBook, setviewBook] = useState(false);
  const [groupchat, setgroupchat] = useState(false);

  useEffect(() => {
    // console.log(user);
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/authors/${user.id}/dashboard`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setDashboard(data);
        // console.log(dashboard);
      } catch (err) {
        setError(err.message || "Unable to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user.id]);

  const handleLogout = async () => {
    onLogout();
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  if (loading) {
    return <div className="dashboard-message">Loading your dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-message">
        <p>{error}</p>
        <button onClick={onLogout}>Back to Login</button>
      </div>
    );
  }

  if (showRaiseTicket) {
    return (
      <RaiseTicket
        user={user}
        onBack={() => setShowRaiseTicket(false)}
        onTicketCreated={() => setShowRaiseTicket(false)}
      />
    );
  }

  if (showMyTickets) {
    return <MyTickets user={user} onBack={() => setShowMyTickets(false)} />;
  }

  const { author, totals, books } = dashboard;

  if (viewBook) {
    return (
      <ViewBook
        id={user.author_id}
        authorName={author.name}
        onBack={() => {
          setviewBook(false);
        }}
      />
    );
  }

  if (groupchat) {
    return <AuthorGroupChat />;
  }

  return (
    <div className="author-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>BookLeaf</h1>
          <p>Author Support Portal</p>
        </div>
        {/* User Image */}
        {/* <div className="righticons">
          <div className="user-profile">
            <img
              // src={user?.picture || user?.photoURL}
              src={author.photoUrl}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          {/* Logout btn */}
        {/* <button onClick={onLogout}>Logout</button> */}
        {/* </div> */}
        <div className="profile-container">
          <img
            src={author.photoUrl}
            alt="Profile"
            className="profile-image"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          />

          {showProfileMenu && (
            // Profile Pic
            <div className="profile-dropdown">
              <img
                src={author.photoUrl}
                alt="Profile"
                className="dropdown-profile-image"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              />
              {/* update DP */}
              {/* <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
              >
                Update DP
              </button> */}
              {/* Logout Btn */}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <div>
            <h2>Welcome, {author.name}!</h2>
            <p>Here is an overview of your books and royalties.</p>
          </div>
          {/* <span className="author-id">{author.author_id}</span> */}
          <span>
            <button
              className="raise-ticket-button"
              onClick={() => setShowRaiseTicket(true)}
            >
              + Raise a Ticket
            </button>
            {/* View Ticket Btn */}
            <button
              onClick={() => setShowMyTickets(true)}
              className="raise-ticket-button"
            >
              My Tickets
            </button>
          </span>
        </section>

        <section className="stats-grid">
          {/* View Book Option */}
          <div
            // onClick={() => {
            //   setviewBook(true);
            // }}
            className="stat-card"
          >
            <p>Total Books</p>
            <h3>{totals.booksCount}</h3>
          </div>

          <div className="stat-card">
            <p>Copies Sold</p>
            <h3>{totals.copiesSold.toLocaleString("en-IN")}</h3>
          </div>

          <div className="stat-card">
            <p>Total Royalty Earned</p>
            <h3>{formatMoney(totals.royaltyEarned)}</h3>
          </div>

          <div className="stat-card">
            <p>Royalty Paid</p>
            <h3>{formatMoney(totals.royaltyPaid)}</h3>
          </div>

          <div className="stat-card pending-card">
            <p>Royalty Pending</p>
            <h3>{formatMoney(totals.royaltyPending)}</h3>
          </div>
        </section>

        <section className="books-section">
          <h2>Your Books</h2>

          {books.length === 0 ? (
            <p>No books found for your account.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Status</th>
                    <th>Copies Sold</th>
                    <th>Royalty Earned</th>
                    <th>Royalty Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id}>
                      <td>
                        <strong>{book.title}</strong>
                        <small>{book.book_id}</small>
                      </td>
                      <td>
                        <span className="book-status">
                          {book.status || "Unknown"}
                        </span>
                      </td>
                      <td>
                        {(book.total_copies_sold || 0).toLocaleString("en-IN")}
                      </td>
                      <td>{formatMoney(book.total_royalty_earned)}</td>
                      <td>{formatMoney(book.royalty_pending)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <button className="view-books-btn" onClick={() => setviewBook(true)}>
          {/* <span className="view-books-icon">📚</span> */}
          View Books
          <span className="view-books-arrow">→</span>
        </button>
        {/* Community Chat Btn */}
        {/* <button
          className="view-books-btn"
          onClick={() => setgroupchat(true)}
          onBack={() => {
            setgroupchat(false);
          }}
        >
          community chat
          <span className="view-books-arrow">→</span>
        </button> */}
      </main>
      <Chatbot id={user.id} />
    </div>
  );
}

export default AuthorDashboard;
