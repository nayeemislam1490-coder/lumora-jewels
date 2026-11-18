import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import { Shop, Product } from "./pages/Shop.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { Cart, Checkout } from "./pages/CartCheckout.jsx";
import { About, Help, Contact, Policy, NotFound } from "./pages/Info.jsx";
import AdminGate from "./components/AdminGate";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="product/:id" element={<Product />} />
        <Route path="dashboard" element={<AdminGate><Dashboard /></AdminGate>} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="about" element={<About />} />
        <Route path="help" element={<Help />} />
        <Route path="contact" element={<Contact />} />
        <Route path="policy/:slug" element={<Policy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}