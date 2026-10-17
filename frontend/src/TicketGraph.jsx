import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function TicketGraph({ analytics }) {
  const data = [
    { name: "Open", value: analytics.openTickets },
    { name: "In Progress", value: analytics.inProgressTickets },
    { name: "Resolved", value: analytics.resolvedTickets },
    { name: "Closed", value: analytics.closedTickets },
  ];

  const COLORS = ["#f59e0b", "#3b82f6", "#22c55e", "#64748b"];

  return (
    <div style={{ width: "100%", height: 400 }}>
      {/* <h2>Tickets by Status</h2> */}

      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TicketGraph;
