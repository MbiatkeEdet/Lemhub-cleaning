export default function SealBadge({ size = 72, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Verified by the agency"
    >
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="var(--color-brass)"
        strokeWidth="1.2"
        strokeDasharray="2.4 3.4"
      />
      <circle cx="50" cy="50" r="39" fill="var(--color-pine)" />
      <circle
        cx="50"
        cy="50"
        r="39"
        fill="none"
        stroke="var(--color-brass-light)"
        strokeWidth="0.6"
      />
      <path
        d="M34 51 L45 62 L67 38"
        fill="none"
        stroke="var(--color-linen)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="76"
        textAnchor="middle"
        fill="var(--color-brass-light)"
        fontSize="7.2"
        fontFamily="var(--font-mono)"
        letterSpacing="1.5"
      >
        VERIFIED
      </text>
    </svg>
  );
}
