import { useState } from "react";
import "./AddAuthorPopup.css";

function AddAuthorPopup({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    author_id: "Auth512",
    photoUrl: "",
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to add author:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="author-popup-overlay" onClick={onClose}>
      <div className="author-popup" onClick={(e) => e.stopPropagation()}>
        <div className="author-popup-header">
          <div>
            <span className="author-popup-eyebrow">BOOKLEAF ADMIN</span>
            <h2>Add New Author</h2>
            <p>Create a new author account.</p>
          </div>

          <button
            type="button"
            className="author-popup-close"
            onClick={onClose}
            aria-label="Close popup"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="author-form-group">
            <label htmlFor="author-name">Full Name</label>
            <input
              id="author-name"
              type="text"
              name="name"
              placeholder="Enter author's full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="author-form-group">
            <label htmlFor="author-email">Email Address</label>
            <input
              id="author-email"
              type="email"
              name="email"
              placeholder="author@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="author-form-group">
            <label htmlFor="author-phone">
              Phone Number <span>(Optional)</span>
            </label>
            <input
              id="author-phone"
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="author-form-group">
            <label htmlFor="author-photoUrl">
              Image URL <span>(Optional)</span>
            </label>
            <input
              id="photoUrl"
              type="String"
              name="photoUrl"
              placeholder="Enter Image URL"
              value={formData.photoUrl}
              onChange={handleChange}
            />
          </div>

          <div className="author-form-group">
            <label htmlFor="author-city">City</label>
            <input
              id="city"
              type="String"
              name="city"
              placeholder="Enter CITY"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          {/* buttons From Here */}

          <div className="author-popup-actions">
            <button
              type="button"
              className="author-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="author-btn-submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Author"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAuthorPopup;
