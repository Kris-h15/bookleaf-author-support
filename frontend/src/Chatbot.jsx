import { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

const quickQuestions = [
  "How do I publish a book?",
  "How do royalties work?",
  "How can I contact support?",
];

export default function Chatbot(id) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! 👋 Welcome to BookLeaf. I'm your virtual assistant. How can I help you today?",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const getBotReply = async (message) => {
    const text = message.toLowerCase();
    // AI API Call
    let response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/authors/${id.id}/ai-bot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          msg: text,
        }),
      },
    );
    const data = await response.json();
    // console.log(data);

    // return "I'm not sure about that yet. Please try asking about publishing, royalties, or support.";
    return data.output;
  };

  const handleSend = (text = input) => {
    const message = text.trim();

    if (!message || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);

    setInput("");
    setIsTyping(true);

    // response
    setTimeout(() => {
      const reply = getBotReply(message);

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);

      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="bookleaf-chatbot">
      {/* Floating chat button */}
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open BookLeaf chatbot"
        >
          <span className="chatbot-toggle-icon">✉</span>
          <span className="chatbot-notification" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <section className="chatbot-window" aria-label="BookLeaf support chat">
          <header className="chatbot-header">
            <div className="chatbot-avatar">B</div>

            <div className="chatbot-header-info">
              <h3>BookLeaf Assistant</h3>
              <p>
                <span className="chatbot-online-dot" />
                Here to help
              </p>
            </div>

            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="chatbot-messages">
            <div className="chatbot-date-label">BOOKLEAF SUPPORT</div>

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message-row ${
                  message.role === "user"
                    ? "chatbot-user-row"
                    : "chatbot-bot-row"
                }`}
              >
                {message.role === "bot" && (
                  <div className="chatbot-small-avatar">B</div>
                )}

                <div
                  className={`chatbot-message ${
                    message.role === "user"
                      ? "chatbot-user-message"
                      : "chatbot-bot-message"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-message-row chatbot-bot-row">
                <div className="chatbot-small-avatar">B</div>

                <div className="chatbot-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="chatbot-quick-questions">
              <p>Frequently asked questions</p>

              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => handleSend(question)}
                  disabled={isTyping}
                >
                  {question}
                  <span>→</span>
                </button>
              ))}
            </div>
          )}

          <form
            className="chatbot-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="Type your message"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <footer className="chatbot-footer">
            Powered by BookLeaf Support
          </footer>
        </section>
      )}
    </div>
  );
}
