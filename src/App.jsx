import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Book from "./pages/Book";
import AgencyPortal from "./pages/AgencyPortal";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Kyc from "./pages/Kyc";
// Landing page removed — Home is now the public entry
import { useApp } from "./context/AppContext";

export default function App() {
  const { user } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/book" element={<Book />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/agency" element={<AgencyPortal />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
