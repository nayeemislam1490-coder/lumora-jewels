// src/components/AdminGate.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

export default function AdminGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "24px", color: "var(--ivory)" }}>
        Checking admin session...
      </div>
    );
  }

  if (session) {
    return children;
  }

  return (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", padding: "24px 16px" }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: "min(400px, 100%)",
          background: "var(--navy2)",
          border: "1px solid var(--line)",
          borderRadius: "20px",
          padding: "28px 24px",
          display: "grid",
          gap: "14px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <div style={{ fontSize: "0.72rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)" }}>
            Admin Access
          </div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", fontWeight: 500, marginTop: "6px" }}>
            Dashboard Login
          </h2>
        </div>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? <div className="err">{error}</div> : null}

        <button type="submit" className="btn btn-gold btn-block" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}