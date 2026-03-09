import { useState } from "react";
import { login } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import PrimaryButton from "../components/ui/PrimaryButton";
import TextField from "../components/ui/TextField";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await login({ email, password });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        alert("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Layout>
      <section className="auth-layout">
        <div className="auth-hero">
          <p className="auth-eyebrow">Secure land access</p>
          <h1 className="auth-headline">
            Sign in to your <em>Geo‑Vision</em> console.
          </h1>
          <p className="auth-copy">
            Authenticate with your registered credentials to manage land
            parcels, verify ownership and review spatial records.
          </p>
          <p className="auth-footer">
            Trusted infrastructure for land parcel identification.
          </p>
        </div>

        <div className="card auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">
            Enter your email and password to continue.
          </p>

          <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <TextField
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-footer">
            <PrimaryButton
              type="button"
              onClick={handleLogin}
              disabled={loading || !email || !password}
            >
              {loading ? "Signing in…" : "Sign in"}
            </PrimaryButton>
            <span className="form-meta">
              Enter to submit • Token stored securely in browser.
            </span>
          </div>

          <p className="auth-alt">
            Don&apos;t have an account?{" "}
            <Link to="/signup">Create one</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default Login;