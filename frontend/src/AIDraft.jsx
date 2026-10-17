import { useState } from "react";
import "./AIDraft.css";

function AIDraft({ ticketId, onReplySent }) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Generate AI reply
  const generateDraft = async () => {
    if (!ticketId) {
      setError("Ticket ID is missing.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/ai-draft`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate draft");
      }

      setDraft(data.aiDraftResponse || "");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Send admin reply
  const sendReply = async () => {
    if (!draft.trim()) {
      setError("Please enter a reply first.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tickets/${ticketId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: draft.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply");
      }

      // Update the conversation in the parent component
      if (onReplySent && data.ticket) {
        onReplySent(data.ticket);
      }

      setDraft("");
      setSuccess("Reply sent successfully!");
    } catch (err) {
      setError(err.message || "Unable to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="ai-draft">
      <div className="ai-draft-header">
        <div>
          <h3>AI Reply Assistant</h3>
          <p>Generate a suggested response for this ticket.</p>
        </div>

        <button
          type="button"
          onClick={generateDraft}
          disabled={loading || sending}
          className="ai-generate-btn"
        >
          {loading ? "Generating..." : "Generate AI Reply"}
        </button>
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Generate or write a reply here. You can edit it before sending."
        rows={7}
      />

      {error && <p className="ai-draft-error">{error}</p>}

      {success && <p className="ai-draft-success">{success}</p>}

      <div className="ai-draft-footer">
        <span>Review your reply before sending.</span>

        <button
          type="button"
          className="ai-send-btn"
          disabled={!draft.trim() || sending || loading}
          onClick={sendReply}
        >
          {sending ? "Sending..." : "Send Reply"}
        </button>
      </div>
    </section>
  );
}

export default AIDraft;
