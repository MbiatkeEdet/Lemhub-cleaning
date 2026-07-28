import { useMemo, useState } from "react";
import CleanerCard from "../components/CleanerCard";
import { useApp } from "../context/AppContext";

export default function Cleaners() {
  const { cleaners } = useApp();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cleaners;
    return cleaners.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.specialties?.some((s) => s.toLowerCase().includes(q)) ||
        c.areas?.some((a) => a.toLowerCase().includes(q))
    );
  }, [cleaners, query]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink/45 mb-3">
        Verified roster
      </p>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <h1 className="font-display text-4xl text-ink max-w-lg">
          Every cleaner here has earned the seal.
        </h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, area, or specialty"
          className="w-full sm:w-72 rounded-full border border-mist bg-white/70 px-5 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-pine"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-mist bg-white/50 p-12 text-center">
          <p className="font-display text-xl text-ink mb-2">No matches</p>
          <p className="text-sm text-ink/55">
            Try a different name, area, or specialty.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <CleanerCard key={c.id} cleaner={c} />
          ))}
        </div>
      )}
    </div>
  );
}
