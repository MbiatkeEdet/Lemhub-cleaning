import { Routes, Route } from "react-router-dom";
import InternalLayout from "./components/InternalLayout";
import PublicLayout from "./components/PublicLayout";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Book from "./pages/Book";
import Cleaners from "./pages/Cleaners";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PaymentCallback from "./pages/PaymentCallback";
import CardCallback from "./pages/CardCallback";
import CleanerDashboard from "./pages/CleanerDashboard";
import CleanerHome from "./pages/CleanerHome";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminCleanerApplications from "./pages/admin/AdminCleanerApplications";
import AdminCleanerApplicationDetail from "./pages/admin/AdminCleanerApplicationDetail";
import AdminAddCleaner from "./pages/admin/AdminAddCleaner";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPaymentGateways from "./pages/admin/AdminPaymentGateways";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminBookings from "./pages/admin/AdminBookings";
import CleanerManagement from "./pages/CleanerManagement";
import SafetyAlerts from "./pages/SafetyAlerts";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AdminSupportApplications from "./pages/admin/AdminSupportApplications";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";
import ReviewAndTip from "./pages/ReviewAndTip";
import Unsubscribe from "./pages/Unsubscribe";
import SupportApply from "./pages/SupportApply";
import SupportOverview from "./pages/SupportOverview";
import SupportConsole from "./pages/SupportConsole";
import SupportTicketDetail from "./pages/SupportTicketDetail";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/cleaners" element={<Cleaners />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pay/callback" element={<PaymentCallback />} />
        <Route
          path="/dashboard/payment-methods/callback"
          element={
            <RequireAuth>
              <CardCallback />
            </RequireAuth>
          }
        />
        <Route path="/review/:bookingId" element={<ReviewAndTip />} />
        <Route path="/unsubscribe" element={<Unsubscribe />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/cleaner/apply"
          element={
            <RequireAuth>
              <CleanerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/support/apply"
          element={
            <RequireAuth>
              <SupportApply />
            </RequireAuth>
          }
        />
      </Route>

      <Route element={<InternalLayout />}>
        <Route
          path="/cleaner"
          element={
            <RequireAuth role="cleaner">
              <CleanerHome />
            </RequireAuth>
          }
        />
        <Route
          path="/support"
          element={
            <RequireAuth role={["admin", "support_agent"]}>
              <SupportOverview />
            </RequireAuth>
          }
        />
        <Route
          path="/support/console"
          element={
            <RequireAuth role={["admin", "support_agent"]}>
              <SupportConsole />
            </RequireAuth>
          }
        />
        <Route
          path="/support/console/:id"
          element={
            <RequireAuth role={["admin", "support_agent"]}>
              <SupportTicketDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminOverview />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <RequireAuth role="admin">
              <AdminCleanerApplications />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/applications/:id"
          element={
            <RequireAuth role="admin">
              <AdminCleanerApplicationDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/cleaners/new"
          element={
            <RequireAuth role="admin">
              <AdminAddCleaner />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RequireAuth role="admin">
              <AdminPayments />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/gateways"
          element={
            <RequireAuth role="admin">
              <AdminPaymentGateways />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <RequireAuth role="admin">
              <AdminPricing />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <RequireAuth role="admin">
              <AdminBookings />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/cleaners"
          element={
            <RequireAuth role={["admin", "support_agent"]}>
              <CleanerManagement />
            </RequireAuth>
          }
        />
        <Route
          path="/staff/safety-alerts"
          element={
            <RequireAuth role={["admin", "support_agent"]}>
              <SafetyAlerts />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/payouts"
          element={
            <RequireAuth role="admin">
              <AdminPayouts />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/support-applications"
          element={
            <RequireAuth role="admin">
              <AdminSupportApplications />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <RequireAuth role="admin">
              <AdminCustomers />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <RequireAuth role="admin">
              <AdminActivity />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireAuth role="admin">
              <AdminSettings />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  );
}
