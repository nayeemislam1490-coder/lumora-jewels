import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../supabase.js";
import { getMyOrderIds } from "../myOrders.js";

const money = (n) => "৳" + Math.round(Number(n) || 0).toLocaleString("en-IN");

export default function MyOrders() {
  const [params] = useSearchParams();
  const newId = params.get("new");
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ids = getMyOrderIds();
    if (ids.length === 0) {
      setOrders([]);
      return;
    }
    // Server function returns ONLY the orders whose numbers are in this list.
    supabase.rpc("get_orders_by_ids", { p_ids: ids }).then(({ data, error }) => {
      if (error) {
        setError("Could not load your orders. Please try again.");
        setOrders([]);
        return;
      }
      setOrders(data || []);
    });
  }, []);

  return (
    <div className="container" style={{ padding: "40px 0 80px", maxWidth: 720 }}>
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 500 }}>My orders</h1>
      {newId && <div className="warn" style={{ marginBottom: 18 }}>Your order <b>{newId}</b> has been placed. Keep this number.</div>}
      {error && <p className="note">{error}</p>}
      {orders === null && <p>Loading...</p>}
      {orders && orders.length === 0 && (
        <p className="note">
          No orders on this phone yet. <Link to="/shop">Shop now</Link>
        </p>
      )}
      {orders && orders.map((o) => (
        <div key={o.id} className="card" style={{ padding: 18, marginBottom: 14, borderRadius: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <b>{o.id}</b>
            <span style={{ color: o.status === "Delivered" ? "var(--up, #2f8a62)" : "var(--gold)" }}>{o.status}</span>
          </div>
          <p style={{ margin: "8px 0" }}>{o.item_text}</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="note">{new Date(o.created_at).toLocaleDateString("en-GB")}</span>
            <b>{money(o.total)}</b>
          </div>
        </div>
      ))}
    </div>
  );
}
