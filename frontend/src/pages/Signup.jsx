import { useState } from "react";
import { signup } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import TextField from "../components/ui/TextField";
import PrimaryButton from "../components/ui/PrimaryButton";

function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    aadhar: "",
    phone: "",
    email: "",
    password: ""
  });

  const handleSignup = async () => {

    const result = await signup(form);

    if (result?.error) {
      alert(result.error);
      return;
    }

    navigate("/login");

  };

  return (
    <Layout>
      <section className="card mb-5">

        <div className="card-header">
          <div>
            <p className="section-eyebrow">New operator</p>
            <h1 className="card-title">Create an account</h1>
            <p className="card-subtitle">
              Register with your official identifiers to access the
              Geo-Vision console.
            </p>
          </div>
        </div>

        <div className="form-grid">

          <TextField
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
            required
          />

          <TextField
            label="Aadhaar"
            placeholder="XXXX-XXXX-XXXX"
            value={form.aadhar}
            onChange={(e) =>
              setForm({ ...form, aadhar: e.target.value })
            }
            required
          />

          <TextField
            label="Phone"
            placeholder="+91-XXXXXXXXXX"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            required
          />

          <TextField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          <TextField
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

        </div>

        <div className="form-footer">
          <PrimaryButton type="button" onClick={handleSignup}>
            Signup
          </PrimaryButton>

          <span className="form-meta">
            You will be redirected to the login page on success.
          </span>
        </div>

        <p className="auth-alt" style={{ marginTop: 18 }}>
          Already registered? <Link to="/login">Sign in instead</Link>
        </p>

      </section>
    </Layout>
  );
}

export default Signup;