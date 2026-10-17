import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [role, setRole] = useState("author");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setpassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            role,
            password: password.trim(),
          }),
        },
      );

      const data = await response.json();
      // saving the token as token in localstorage
      localStorage.setItem("token", data.token);
      // console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>BookLeaf</h1>
        <p>Author Support & Communication Portal</p>

        <div className="role-selector">
          <button
            type="button"
            className={role === "author" ? "active" : ""}
            onClick={() => {
              setRole("author");
              setError("");
            }}
          >
            Author
          </button>

          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => {
              setRole("admin");
              setError("");
            }}
          >
            Admin
          </button>
        </div>

        <label htmlFor="email">Email address</label>

        <input
          id="email"
          type="email"
          placeholder={
            role === "author" ? "Enter your registered Email" : "Enter Email"
          }
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* password Field */}
        <label htmlFor="email">Password</label>

        <input
          id="password"
          type="password"
          placeholder={"Enter Password"}
          value={password}
          onChange={(e) => setpassword(e.target.value)}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? "Checking..." : `Continue as ${role}`}
        </button>

        {role == "admin" ? (
          <span>
            <small id="creds">
              Admin Email : admin@bookleaf.com <br />
              Password : Admin@123{" "}
            </small>
            {/* <button>Copy</button> */}
          </span>
        ) : (
          <span className="notice">
            {/* <small>Trial version · BookLeaf Publishing</small> */}
            <small id="creds">
              Password : FirstName (In small alphabet) <br /> Ex: Name : Sagar
              Sharma <br />
              password: sagar
            </small>
          </span>
        )}
      </form>
    </div>
  );
}

export default Login;
