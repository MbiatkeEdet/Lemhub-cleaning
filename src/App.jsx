import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Cleaners from "./pages/Cleaners";
import Book from "./pages/Book";
import AgencyPortal from "./pages/AgencyPortal";
import Kyc from "./pages/Kyc";
import Landing from "./pages/Landing";
import { useApp } from "./context/AppContext";

export default function App() {
  const { user } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      {user.isLoggedIn ? <Navbar /> : null}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user.isLoggedIn ? <Home /> : <Landing />} />
          <Route path="/cleaners" element={user.isLoggedIn ? <Cleaners /> : <Navigate to="/" replace />} />
          <Route path="/kyc" element={user.isLoggedIn ? <Kyc /> : <Navigate to="/" replace />} />
          <Route
            path="/book"
            element={
              user.isLoggedIn && user.basicKycCompleted && user.fullKycCompleted ? (
                <Book />
              ) : (
                <Navigate to="/kyc" replace />
              )
            }
          />
          <Route path="/agency" element={user.isLoggedIn ? <AgencyPortal /> : <Navigate to="/" replace />} />
        </Routes>
      </main>
      {user.isLoggedIn ? <Footer /> : null}
    </div>
  );
}
