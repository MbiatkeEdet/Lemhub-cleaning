const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const TOKEN_KEY = "tidynow_auth_token";

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message || "Something went wrong. Please try again.", res.status, data?.errors);
  }

  return data;
}

async function requestMultipart(path, formData) {
  const headers = { Accept: "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { method: "POST", headers, body: formData });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message || "Upload failed. Please try again.", res.status, data?.errors);
  }

  return data;
}

async function requestBlob(path) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) throw new ApiError("Could not load file.", res.status);

  return URL.createObjectURL(await res.blob());
}

export function fetchCatalog() {
  return request("/catalog");
}

export function createBooking(payload) {
  return request("/bookings", { method: "POST", body: payload }).then((res) => res.data);
}

export function requestOtp(email) {
  return request("/auth/otp/request", { method: "POST", body: { email } });
}

export function verifyOtp(email, code) {
  return request("/auth/otp/verify", { method: "POST", body: { email, code } });
}

export function googleLogin(idToken) {
  return request("/auth/google", { method: "POST", body: { id_token: idToken } });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function fetchMe() {
  return request("/me");
}

export function fetchMyBookings() {
  return request("/me/bookings").then((res) => res.data);
}

export function fetchAvailableGateways() {
  return request("/payment-gateways/available").then((res) => res.data);
}

export function initiatePayment(bookingId, gatewayCode) {
  return request(`/bookings/${bookingId}/payments`, {
    method: "POST",
    body: { gateway_code: gatewayCode },
  }).then((res) => res.data);
}

export function requestManualFollowUp(bookingId) {
  return request(`/bookings/${bookingId}/payments/request-follow-up`, { method: "POST" });
}

export function verifyPayment(reference) {
  return request(`/payments/${reference}/verify`, { method: "POST" }).then((res) => res.data);
}

export function fetchPaymentMethods() {
  return request("/me/payment-methods").then((res) => res.data);
}

export function addPaymentMethod(gatewayCode) {
  return request("/me/payment-methods", {
    method: "POST",
    body: { gateway_code: gatewayCode },
  }).then((res) => res.data);
}

export function setDefaultPaymentMethod(id) {
  return request(`/me/payment-methods/${id}/default`, { method: "POST" }).then((res) => res.data);
}

export function removePaymentMethod(id) {
  return request(`/me/payment-methods/${id}`, { method: "DELETE" }).then((res) => res.data);
}

export function fetchMyPayments() {
  return request("/me/payments").then((res) => res.data);
}

export function fetchRecurringPlans() {
  return request("/recurring-plans").then((res) => res.data);
}

export function createRecurringPlan(payload) {
  return request("/recurring-plans", { method: "POST", body: payload }).then((res) => res.data);
}

export function pauseRecurringPlan(planId) {
  return request(`/recurring-plans/${planId}/pause`, { method: "POST" }).then((res) => res.data);
}

export function resumeRecurringPlan(planId) {
  return request(`/recurring-plans/${planId}/resume`, { method: "POST" }).then((res) => res.data);
}

export function cancelRecurringPlan(planId) {
  return request(`/recurring-plans/${planId}/cancel`, { method: "POST" }).then((res) => res.data);
}

export function uploadPaymentProof(bookingId, file) {
  const formData = new FormData();
  formData.append("proof", file);
  return requestMultipart(`/bookings/${bookingId}/payments/manual-proof`, formData);
}

// --- Cleaner self-serve KYC ---

export function fetchCleanerApplication() {
  return request("/cleaner-application").then((res) => res.data);
}

export function saveCleanerApplication(payload) {
  return request("/cleaner-application", { method: "POST", body: payload }).then((res) => res.data);
}

export function uploadCleanerDocument(documentType, file) {
  const formData = new FormData();
  formData.append("document_type", documentType);
  formData.append("file", file);
  return requestMultipart("/cleaner-application/documents", formData);
}

export function submitCleanerApplication() {
  return request("/cleaner-application/submit", { method: "POST" }).then((res) => res.data);
}

export function updateCleanerProfile(payload) {
  return request("/me/cleaner-profile", { method: "PATCH", body: payload }).then((res) => res.data);
}

// --- Staff: cleaner roster management (admins + support agents) ---
//
// There is no public cleaner list. Everything about who cleans for us is
// served from here, behind auth.

export function fetchStaffCleaners({ q, status } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const qs = params.toString();

  return request(`/staff/cleaners${qs ? `?${qs}` : ""}`).then((res) => res.data);
}

export function fetchStaffCleaner(id) {
  return request(`/staff/cleaners/${id}`).then((res) => res.data);
}

export function updateStaffCleaner(id, payload) {
  return request(`/staff/cleaners/${id}`, { method: "PATCH", body: payload }).then((res) => res.data);
}

export function suspendCleaner(id, reason) {
  return request(`/staff/cleaners/${id}/suspend`, { method: "POST", body: { reason } });
}

export function reactivateCleaner(id) {
  return request(`/staff/cleaners/${id}/reactivate`, { method: "POST" });
}

// Admin-only: the API refuses this for anyone else, and for any cleaner who
// has history on file.
export function adminDeleteCleaner(id) {
  return request(`/admin/cleaners/${id}`, { method: "DELETE" });
}

// --- Admin: overview ---

export function fetchAdminOverview() {
  return request("/admin/overview").then((res) => res.data);
}

export function fetchAdminOverviewTrends(days) {
  return request(`/admin/overview/trends${days ? `?days=${days}` : ""}`).then((res) => res.data);
}

// --- Admin: cleaner KYC review ---

export function fetchAdminCleanerApplications(status) {
  return request(`/admin/cleaner-applications${status ? `?status=${status}` : ""}`).then((res) => res.data);
}

export function fetchAdminCleanerApplication(id) {
  return request(`/admin/cleaner-applications/${id}`).then((res) => res.data);
}

export function fetchAdminDocumentUrl(applicationId, documentId) {
  return requestBlob(`/admin/cleaner-applications/${applicationId}/documents/${documentId}`);
}

export function adminApproveCleanerApplication(id) {
  return request(`/admin/cleaner-applications/${id}/approve`, { method: "POST" }).then((res) => res.data);
}

export function adminRejectCleanerApplication(id, reason) {
  return request(`/admin/cleaner-applications/${id}/reject`, { method: "POST", body: { reason } }).then((res) => res.data);
}

export function adminRequestMoreInfo(id, reason) {
  return request(`/admin/cleaner-applications/${id}/request-more-info`, { method: "POST", body: { reason } }).then((res) => res.data);
}

export function adminCreateCleaner(payload) {
  return request("/admin/cleaners", { method: "POST", body: payload }).then((res) => res.data);
}

export function adminBatchImportCleaners(file) {
  const formData = new FormData();
  formData.append("file", file);
  return requestMultipart("/admin/cleaners/batch-import", formData).then((res) => res.data);
}

// --- Admin: pricing catalog ---

export function fetchAdminApartmentTypes() {
  return request("/admin/apartment-types").then((res) => res.data);
}

export function adminCreateApartmentType(payload) {
  return request("/admin/apartment-types", { method: "POST", body: payload }).then((res) => res.data);
}

export function adminUpdateApartmentType(id, payload) {
  return request(`/admin/apartment-types/${id}`, { method: "POST", body: payload }).then((res) => res.data);
}

export function fetchAdminFrequencies() {
  return request("/admin/frequencies").then((res) => res.data);
}

export function adminCreateFrequency(payload) {
  return request("/admin/frequencies", { method: "POST", body: payload }).then((res) => res.data);
}

export function adminUpdateFrequency(id, payload) {
  return request(`/admin/frequencies/${id}`, { method: "POST", body: payload }).then((res) => res.data);
}

// --- Admin: payments (Phase 3/4 backend, first frontend surface) ---

export function fetchAdminPaymentGateways() {
  return request("/admin/payment-gateways").then((res) => res.data);
}

export function adminTogglePaymentGateway(id) {
  return request(`/admin/payment-gateways/${id}/toggle`, { method: "POST" }).then((res) => res.data);
}

// --- Admin: site settings ---

export function fetchAdminSettings() {
  return request("/admin/settings").then((res) => res.data);
}

export function adminUpdateSettings(payload) {
  return request("/admin/settings", { method: "PATCH", body: payload }).then((res) => res.data);
}

export function fetchAdminPendingManualPayments() {
  return request("/admin/payments/manual/pending").then((res) => res.data);
}

export function adminConfirmManualPayment(id) {
  return request(`/admin/payments/manual/${id}/confirm`, { method: "POST" });
}

export function adminRejectManualPayment(id, reason) {
  return request(`/admin/payments/manual/${id}/reject`, {
    method: "POST",
    body: { reason: reason || null },
  });
}

export function fetchAdminManualPaymentProofUrl(id) {
  return requestBlob(`/admin/payments/manual/${id}/proof`);
}

// --- Push notifications ---

export function savePushSubscription(subscription) {
  return request("/me/push-subscription", { method: "POST", body: subscription });
}

// --- Cleaner: assigned jobs & field safety ---

export function fetchCleanerJobs() {
  return request("/cleaner-jobs").then((res) => res.data);
}

export function fetchCleanerJobStats() {
  return request("/cleaner-jobs/stats").then((res) => res.data);
}

export function arriveAtJob(bookingId) {
  return request(`/cleaner-jobs/${bookingId}/arrive`, { method: "POST" }).then((res) => res.data);
}

export function completeJob(bookingId) {
  return request(`/cleaner-jobs/${bookingId}/complete`, { method: "POST" }).then((res) => res.data);
}

export function raiseJobSos(bookingId) {
  return request(`/cleaner-jobs/${bookingId}/sos`, { method: "POST" });
}

export function confirmCheckin(checkinId, safeWord) {
  return request(`/cleaner-jobs/checkins/${checkinId}/confirm`, {
    method: "POST",
    body: { safe_word: safeWord },
  });
}

// --- Admin: bookings & assignment ---

export function fetchAdminBookings(status) {
  return request(`/admin/bookings${status ? `?status=${status}` : ""}`).then((res) => res.data);
}

export function adminAssignBooking(bookingId, cleanerProfileId) {
  return request(`/admin/bookings/${bookingId}/assign`, {
    method: "POST",
    body: { cleaner_profile_id: cleanerProfileId },
  });
}

export function fetchSafetyAlerts() {
  return request("/staff/safety-alerts").then((res) => res.data);
}

export function resolveSafetyAlert(id) {
  return request(`/staff/safety-alerts/${id}/resolve`, { method: "POST" });
}

// --- Post-cleaning reviews & tips (reachable by a logged-in owner, or a
// guest carrying expires/signature from their emailed link) ---

function withLinkParams(path, linkParams) {
  const qs = new URLSearchParams(linkParams).toString();
  return qs ? `${path}?${qs}` : path;
}

export function fetchBookingCompletion(bookingId, linkParams = {}) {
  return request(withLinkParams(`/bookings/${bookingId}/completion`, linkParams)).then((res) => res.data);
}

export function submitBookingReview(bookingId, linkParams = {}, payload) {
  return request(withLinkParams(`/bookings/${bookingId}/reviews`, linkParams), {
    method: "POST",
    body: payload,
  });
}

export function payTip(bookingId, linkParams = {}, payload) {
  return request(withLinkParams(`/bookings/${bookingId}/tips`, linkParams), {
    method: "POST",
    body: payload,
  }).then((res) => res.data);
}

// --- Admin: cleaner payouts ---

export function fetchAdminPayouts() {
  return request("/admin/payouts").then((res) => res.data);
}

export function adminRecordPayout(cleanerProfileId) {
  return request("/admin/payouts", {
    method: "POST",
    body: { cleaner_profile_id: cleanerProfileId },
  });
}

// --- Support: contact form / "need help" entry points (guest or logged in) ---

export function submitSupportTicket(payload) {
  return request("/support-tickets", { method: "POST", body: payload }).then((res) => res.data);
}

export function unsubscribeEmail(payload) {
  return request("/email-unsubscribe", { method: "POST", body: payload });
}

// --- Support agent: self-serve application ---

export function fetchSupportApplication() {
  return request("/support-application").then((res) => res.data);
}

export function applyForSupport(payload) {
  return request("/support-application", { method: "POST", body: payload }).then((res) => res.data);
}

// --- Admin: support agent applications ---

export function fetchAdminSupportApplications() {
  return request("/admin/support-applications").then((res) => res.data);
}

export function adminApproveSupportApplication(id) {
  return request(`/admin/support-applications/${id}/approve`, { method: "POST" });
}

export function adminRejectSupportApplication(id, reason) {
  return request(`/admin/support-applications/${id}/reject`, { method: "POST", body: { reason } });
}

// --- Support console (support agents & admins) ---

export function fetchSupportOverview() {
  return request("/support/overview").then((res) => res.data);
}

export function fetchSupportTickets(status) {
  return request(`/support/tickets${status ? `?status=${status}` : ""}`).then((res) => res.data);
}

export function fetchSupportTicket(id) {
  return request(`/support/tickets/${id}`).then((res) => res.data);
}

export function addSupportTicketMessage(id, payload) {
  return request(`/support/tickets/${id}/messages`, { method: "POST", body: payload });
}

export function resolveSupportTicket(id) {
  return request(`/support/tickets/${id}/resolve`, { method: "POST" });
}

export function reopenSupportTicket(id) {
  return request(`/support/tickets/${id}/reopen`, { method: "POST" });
}

// --- Booking cancellation ---

const CANCELLABLE_STATUSES = ["pending_confirmation", "awaiting_payment_manual", "confirmed", "assigned"];

export function isBookingCancellable(status) {
  return CANCELLABLE_STATUSES.includes(status);
}

export function cancelBooking(bookingId, reason) {
  return request(`/bookings/${bookingId}/cancel`, { method: "POST", body: { reason: reason || null } });
}

export function adminCancelBooking(bookingId, reason) {
  return request(`/admin/bookings/${bookingId}/cancel`, { method: "POST", body: { reason: reason || null } });
}

// --- Admin: customers & NDPR erasure ---

export function fetchAdminCustomers(q) {
  return request(`/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`).then((res) => res.data);
}

export function adminAnonymizeCustomer(id) {
  return request(`/admin/customers/${id}/anonymize`, { method: "POST" });
}

// --- Admin: activity (audit log + email log) ---

export function fetchAdminAuditLog(action) {
  return request(`/admin/activity/audit-log${action ? `?action=${encodeURIComponent(action)}` : ""}`).then((res) => res.data);
}

export function fetchAdminEmailLog(category) {
  return request(`/admin/activity/emails${category ? `?category=${encodeURIComponent(category)}` : ""}`).then((res) => res.data);
}
