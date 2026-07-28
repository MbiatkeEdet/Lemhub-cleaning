import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cleaners from "./pages/Cleaners";
import Book from "./pages/Book";
import AgencyPortal from "./pages/AgencyPortal";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cleaners" element={<Cleaners />} />
          <Route path="/book" element={<Book />} />
          <Route path="/agency" element={<AgencyPortal />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
