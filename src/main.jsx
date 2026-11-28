import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./theme-ivory.css";
import App from "./App.jsx";
import { LangProvider } from "./i18n.jsx";
import { CartProvider } from "./cart.jsx";
import { loadProducts } from "./products.js";

// Show the page right away, never wait forever for the database.
// If the database is slow or blocked (common inside Messenger/Facebook/Instagram/TikTok
// browsers on mobile data), the page still opens with the built-in product list,
// and the live list is applied as soon as it arrives.
const TIMEOUT_MS = 3500;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

function mount() {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <BrowserRouter>
        <LangProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </LangProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

withTimeout(loadProducts().catch(() => null), TIMEOUT_MS).finally(mount);