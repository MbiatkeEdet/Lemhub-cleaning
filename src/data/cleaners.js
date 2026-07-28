export const SEED_CLEANERS = [
  {
    id: "c-001",
    name: "Amaka Obi",
    initials: "AO",
    years: 6,
    rating: 4.9,
    reviews: 214,
    specialties: ["Deep cleaning", "Move-in / move-out", "Eco products"],
    bio: "Amaka leads with an inspection-grade checklist and finishes every room with a final walk-through.",
    verifiedOn: "2024-03-12",
    areas: ["Port Harcourt", "GRA Phase 2", "Trans Amadi"],
  },
  {
    id: "c-002",
    name: "Tunde Bakare",
    initials: "TB",
    years: 4,
    rating: 4.8,
    reviews: 168,
    specialties: ["Kitchen detailing", "Laundry", "Weekly upkeep"],
    bio: "Tunde specializes in recurring weekly visits, keeping busy households consistently guest-ready.",
    verifiedOn: "2024-06-02",
    areas: ["Port Harcourt", "Rumuola", "Woji"],
  },
  {
    id: "c-003",
    name: "Ifeoma Chukwu",
    initials: "IC",
    years: 8,
    rating: 5.0,
    reviews: 301,
    specialties: ["Deep cleaning", "Upholstery", "Post-construction"],
    bio: "Ifeoma trained the current onboarding checklist used to certify every new cleaner on the platform.",
    verifiedOn: "2023-11-20",
    areas: ["Port Harcourt", "Old GRA", "D-Line"],
  },
  {
    id: "c-004",
    name: "Emeka Nwosu",
    initials: "EN",
    years: 3,
    rating: 4.7,
    reviews: 96,
    specialties: ["Bathroom detailing", "Twice-monthly plans"],
    bio: "Emeka is known for meticulous grout and tile work, and punctual, predictable scheduling.",
    verifiedOn: "2025-01-08",
    areas: ["Port Harcourt", "Ada George"],
  },
];

export function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
