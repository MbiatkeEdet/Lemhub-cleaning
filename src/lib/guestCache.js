const DB_NAME = "tidynow_guest_cache";
const DB_VERSION = 2;
const KEY_STORE = "keys";
const PROFILE_STORE = "profiles";
const DRAFT_STORE = "drafts";
const DEVICE_KEY_ID = "device-key";
const DRAFT_ID = "booking-draft";
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Convenience prefill only — protects a lost/stolen device's local storage
// dump, not a defense against a compromised page.
//
// Contact details, the service address and access preferences live here,
// encrypted under a non-extractable device key. Card and payment data never
// does: the gateways hold the card, the server holds the token, and neither
// is ever in the browser to begin with.

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(KEY_STORE)) db.createObjectStore(KEY_STORE);
      if (!db.objectStoreNames.contains(PROFILE_STORE)) db.createObjectStore(PROFILE_STORE);
      if (!db.objectStoreNames.contains(DRAFT_STORE)) db.createObjectStore(DRAFT_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getRecord(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function putRecord(db, storeName, key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getOrCreateKey(db) {
  const existing = await getRecord(db, KEY_STORE, DEVICE_KEY_ID);
  if (existing) return existing;

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await putRecord(db, KEY_STORE, DEVICE_KEY_ID, key);
  return key;
}

async function hashContact(value) {
  const normalized = value.trim().toLowerCase().replace(/[^\d+@.a-z]/g, "");
  const bytes = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function saveGuestProfile(contactValues, profile) {
  try {
    const db = await openDb();
    const key = await getOrCreateKey(db);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(profile));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
    const record = { iv, ciphertext, savedAt: Date.now() };

    for (const value of contactValues.filter((v) => v && v.trim())) {
      const hash = await hashContact(value);
      await putRecord(db, PROFILE_STORE, hash, record);
    }
  } catch {
    // best-effort convenience cache — never block the booking flow on it
  }
}

export async function loadGuestProfile(contactValue) {
  if (!contactValue || !contactValue.trim()) return null;

  try {
    const db = await openDb();
    const hash = await hashContact(contactValue);
    const record = await getRecord(db, PROFILE_STORE, hash);
    if (!record || Date.now() - record.savedAt > TTL_MS) return null;

    const key = await getOrCreateKey(db);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: record.iv }, key, record.ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

export async function clearGuestCache() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(PROFILE_STORE, "readwrite");
      tx.objectStore(PROFILE_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // no-op
  }
}


/**
 * The in-progress booking form. Kept here rather than in localStorage
 * because a half-filled booking carries the same home address and access
 * notes as a saved profile — it just hasn't been submitted yet.
 */
export async function saveBookingDraft(draft) {
  try {
    const db = await openDb();
    const key = await getOrCreateKey(db);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(draft));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

    await putRecord(db, DRAFT_STORE, DRAFT_ID, { iv, ciphertext, savedAt: Date.now() });
  } catch {
    // best-effort convenience cache — never block the booking flow on it
  }
}

export async function loadBookingDraft() {
  try {
    const db = await openDb();
    const record = await getRecord(db, DRAFT_STORE, DRAFT_ID);
    if (!record || Date.now() - record.savedAt > DRAFT_TTL_MS) return null;

    const key = await getOrCreateKey(db);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: record.iv }, key, record.ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

export async function clearBookingDraft() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DRAFT_STORE, "readwrite");
      tx.objectStore(DRAFT_STORE).delete(DRAFT_ID);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // no-op
  }
}
