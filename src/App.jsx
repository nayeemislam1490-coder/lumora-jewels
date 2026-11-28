import { Component, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import { Shop, Product } from "./pages/Shop.jsx";
import { Cart, Checkout } from "./pages/CartCheckout.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import { About, Help, Contact, Policy, NotFound } from "./pages/Info.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const AdminGate = lazy(() => import("./components/AdminGate"));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.error("App render error:", err);
  }
  render() {
    if (this.state.hasError) {
      const currentUrl = typeof window !== "undefined" ? window.location.href : "/";
      return (
        <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "24px", textAlign: "center" }}>
          <div style={{ maxWidth: "420px", background: "#121A33", border: "1px solid rgba(212,177,106,0.3)", borderRadius: "20px", padding: "28px" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", marginBottom: "10px" }}>Having trouble loading here</h2>
            <p style={{ color: "#A9A394", fontSize: "0.92rem", marginBottom: "20px" }}>
              In-app browsers can sometimes block heavy scripts. Try opening the page directly in your browser.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-gold"
                onClick={() => this.setState({ hasError: false })}
              >
                Try again
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                Open in Browser
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<Product />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<div style={{ padding: "24px" }}>Loading dashboard...</div>}>
                <AdminGate>
                  <Dashboard />
                </AdminGate>
              </Suspense>
            }
          />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policy/:slug" element={<Policy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}