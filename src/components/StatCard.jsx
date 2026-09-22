export default function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-mist bg-white p-5">
      
      <p className="text-xs text-ink/45 mb-1">
        {label}
      </p>
      <p className="font-display text-xl text-ink">{value}</p>
    </div>
  );
}
