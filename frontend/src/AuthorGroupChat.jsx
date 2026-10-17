import { useEffect, useRef, useState } from "react";
// import socket from "./socket";
import "./AuthorGroupChat.css";

const initialMessages = [
  {
    id: 1,
    senderId: "author1",
    senderName: "Priya Sharma",
    text: "Has anyone published their first book recently?",
    time: "10:30 AM",
  },
  {
    id: 2,
    senderId: "author2",
    senderName: "Rahul Verma",
    text: "Yes! Make sure you carefully review your manuscript before submission.",
    time: "10:32 AM",
  },
  {
    id: 3,
    senderId: "author3",
    senderName: "Ananya Singh",
    text: "That's helpful. How long did the publishing process take?",
    time: "10:34 AM",
  },
];

export default function AuthorGroupChat({ currentUser }) {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  //   const [connected, setConnected] = useState(socket.connected);
  const [connected, setConnected] = useState(true);
  const bottomRef = useRef(null);

  const user = currentUser || {
    id: "demo-user",
    name: "You",
  };

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleNewMessage = (newMessage) => {
      setMessages((previous) => {
        // Avoid adding a message twice if the server echoes it.
        if (
          previous.some(
            (item) =>
              item.id === newMessage.id ||
              (item._id && item._id === newMessage._id),
          )
        ) {
          return previous;
        }

        return [...previous, newMessage];
      });
    };

    // socket.on("connect", handleConnect);
    // socket.on("disconnect", handleDisconnect);
    // socket.on("group-message", handleNewMessage);

    // if (!socket.connected) {
    //   socket.connect();
    // }

    // socket.emit("join-authors-group");

    // return () => {
    //   socket.off("connect", handleConnect);
    //   socket.off("disconnect", handleDisconnect);
    //   socket.off("group-message", handleNewMessage);
    //   socket.emit("leave-authors-group");
    // };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    const text = message.trim();
    if (!text || !socket.connected) return;

    socket.emit("send-group-message", {
      text,
    });

    setMessage("");
  };

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="author-chat-page">
      <aside className="author-chat-sidebar">
        <div className="community-brand">
          <div className="community-brand-icon">B</div>
          <div>
            <h2>BookLeaf</h2>
            <p>Author Community</p>
          </div>
        </div>

        <div className="sidebar-label">COMMUNITY</div>

        <button className="community-channel active">
          <span className="channel-hash">#</span>
          <span>All Authors</span>
          <span className="channel-count">∞</span>
        </button>

        <div className="sidebar-note">
          <div className="sidebar-note-icon">✦</div>
          <h3>Better together.</h3>
          <p>
            Connect with fellow authors, share your journey, and grow together.
          </p>
        </div>

        <div className="sidebar-user">
          <div className="author-avatar current-avatar">
            {(user.name || "Y").charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <strong>{user.name || "You"}</strong>
            <span>Author</span>
          </div>
          <span className="online-dot" title="Connected" />
        </div>
      </aside>

      <main className="author-chat-main">
        <header className="author-chat-header">
          <div className="channel-heading">
            <div className="channel-heading-icon">#</div>
            <div>
              <h1>All Authors</h1>
              <p>A space for every BookLeaf author</p>
            </div>
          </div>

          <div
            className={`connection-status ${
              connected ? "is-connected" : "is-disconnected"
            }`}
          >
            <span className="status-dot" />
            {connected ? "Connected" : "Reconnecting..."}
          </div>
        </header>

        <section className="community-welcome">
          <div className="welcome-symbol">✍</div>
          <div>
            <h2>Welcome to the authors' corner!</h2>
            <p>
              Ask questions, exchange ideas, discuss publishing, and celebrate
              each other's progress.
            </p>
          </div>
        </section>

        <section className="author-chat-messages">
          {messages.map((msg, index) => {
            const isOwnMessage =
              String(msg.senderId || msg.authorId || "") === String(user.id);

            const senderName = msg.senderName || "Author";
            const avatarLetter = senderName.charAt(0).toUpperCase();

            return (
              <article
                className={`chat-message ${isOwnMessage ? "own-message" : ""}`}
                key={msg._id || msg.id || `${senderName}-${index}`}
              >
                <div className="author-avatar message-avatar">
                  {avatarLetter}
                </div>

                <div className="message-content">
                  <div className="message-meta">
                    <strong>{isOwnMessage ? "You" : senderName}</strong>
                    <span>{formatTime(msg.createdAt || msg.time)}</span>
                  </div>

                  <div className="message-bubble">
                    {msg.text || msg.message}
                  </div>
                </div>
              </article>
            );
          })}

          <div ref={bottomRef} />
        </section>

        <form className="author-chat-composer" onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              connected
                ? "Message the author community..."
                : "Connecting to the community..."
            }
            maxLength={2000}
            disabled={!connected}
            aria-label="Write a message"
          />

          <span className="composer-hint">Be kind and constructive</span>

          <button
            type="submit"
            disabled={!message.trim() || !connected}
            aria-label="Send message"
          >
            <span>Send</span>
            <span className="send-arrow">➤</span>
          </button>
        </form>
      </main>
    </div>
  );
}
