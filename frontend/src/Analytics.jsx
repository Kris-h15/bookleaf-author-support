import { useEffect, useState } from "react";
import "./Analytics.css";
import TicketGraph from "./TicketGraph";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tickets/admin/analytics`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch analytics");
        }

        setAnalytics(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <p className="analytics-message">Loading analytics...</p>;
  }

  if (error) {
    return <p className="analytics-error">{error}</p>;
  }

  const cards = [
    { title: "Total Tickets", value: analytics.totalTickets },
    { title: "Open Tickets", value: analytics.openTickets },
    {
      title: "In Progress",
      value: analytics.inProgressTickets,
    },
    { title: "Resolved", value: analytics.resolvedTickets },
    { title: "Closed", value: analytics.closedTickets },
    {
      title: "High Priority",
      value: analytics.highPriorityTickets,
    },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-heading">
        <h1>Ticket Analytics</h1>
        <p>Overview of your support tickets</p>
      </div>

      <div className="analytics-grid">
        {cards.map((card) => (
          <div className="analytics-card" key={card.title}>
            <p>{card.title}</p>
            <h2>{card.value}</h2>
          </div>
        ))}
      </div>
      <TicketGraph analytics={analytics} />
    </div>
  );
}

export default Analytics;
