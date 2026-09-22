/**
 * The arrival windows offered at booking. The catalog endpoint is the
 * source of truth — these are the fallback used until it responds, and
 * they must stay in step with App\Enums\BookingSlot.
 */
export const FALLBACK_SLOTS = [
  { value: "07:00", label: "7:00 AM", window: "7:00 – 9:00 AM" },
  { value: "11:00", label: "11:00 AM", window: "11:00 AM – 1:00 PM" },
  { value: "13:00", label: "1:00 PM", window: "1:00 – 3:00 PM" },
  { value: "15:00", label: "3:00 PM", window: "3:00 – 5:00 PM" },
];

export const SLOT_BLURB = {
  "07:00": "Early start — done before the day gets going",
  "11:00": "Late morning — our most requested window",
  "13:00": "Straight after lunch",
  "15:00": "Afternoon — home by evening",
};
