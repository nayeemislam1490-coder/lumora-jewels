import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

export default function AdminGate({ children }) {
  const [session, setSession] = useState(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Wrong email or password.");
    setBusy(false);
  };

  if (session === undefined) return null;

  if (session) {
    return (
      <>
        {children}
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50, padding: "8px 14px", borderRadius: 10, border: "1px solid #c9a24b", background: "#33091a", color: "#f6edd6", cursor: "pointer" }}
        >
          Log out
        </button>
      </>
    );
  }

  const input = { width: "100%", padding: "11px 12px", margin: "6px 0 14px", borderRadius: 10, border: "1px solid #ebe3dc", font: "inherit" };
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#33091a", padding: 16 }}>
      <form onSubmit={login} style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 16, padding: 28, fontFamily: "Inter, system-ui, sans-serif" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 22, color: "#33091a" }}>Admin login</h1>
        <p style={{ margin: "0 0 18px", color: "#8a7c82", fontSize: 13 }}>Sign in to manage your store</p>
        <label style={{ fontSize: 13 }}>Email</label>
        <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        <label style={{ fontSize: 13 }}>Password</label>
        <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        {error && <p style={{ color: "#b53a32", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
        <button disabled={busy} style={{ width: "100%", padding: 12, border: 0, borderRadius: 10, background: "#c9a24b", color: "#33091a", fontWeight: 600, cursor: "pointer" }}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}