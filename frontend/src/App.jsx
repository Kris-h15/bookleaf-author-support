import { useState } from "react";
import Login from "./Login";
import AuthorDashboard from "./AuthorDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    // Deleting token from local storage
    localStorage.removeItem("token");
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user?.role === "admin") {
    return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
  }

  return <AuthorDashboard user={user} onLogout={handleLogout} />;
}

export default App;
