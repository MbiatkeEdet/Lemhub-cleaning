import { useId, useMemo, useState } from "react";

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

function niceCeiling(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function shortDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

/**
 * A single-series trend line + area chart. No charting library — this is
 * the only place in the app that needs one, so it's hand-rolled SVG rather
 * than a new dependency.
 */
export default function TrendChart({ title, data, formatValue = (v) => v, color = "var(--color-ink)" }) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState(null);

  const { linePath, areaPath, points, gridTicks } = useMemo(() => {
    const values = data.map((d) => d.value);
    const max = niceCeiling(Math.max(...values, 1));
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const pts = data.map((d, i) => {
      const x = PAD_LEFT + (data.length === 1 ? plotWidth : (i / (data.length - 1)) * plotWidth);
      const y = PAD_TOP + plotHeight - (d.value / max) * plotHeight;
      return { x, y, ...d };
    });

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
    const baseline = PAD_TOP + plotHeight;
    const area = `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${baseline} L ${pts[0].x.toFixed(2)} ${baseline} Z`;

    const ticks = [0, 0.5, 1].map((f) => ({
      value: max * f,
      y: PAD_TOP + plotHeight - f * plotHeight,
    }));

    return { linePath: line, areaPath: area, points: pts, gridTicks: ticks };
  }, [data]);

  const last = points[points.length - 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const ratio = Math.min(1, Math.max(0, (x - PAD_LEFT) / plotWidth));
    setHoverIndex(Math.round(ratio * (points.length - 1)));
  }

  const tooltipLeftPct = hovered ? (hovered.x / WIDTH) * 100 : 0;
  const tooltipTopPct = hovered ? (hovered.y / HEIGHT) * 100 : 0;
  const tooltipOnRight = hovered && hovered.x < WIDTH * 0.75;

  return (
    <div className="rounded-2xl border border-mist bg-white/60 p-5">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs text-ink/45">{title}</p>
        <p className="font-display text-lg text-ink">{formatValue(last.value)}</p>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto touch-none"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridTicks.map((t) => (
            <g key={t.value}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={t.y}
                y2={t.y}
                stroke="var(--color-mist)"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={t.y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="9"
                fontFamily="var(--font-mono)"
                fill="var(--color-ink)"
                opacity="0.4"
              >
                {Math.round(t.value).toLocaleString()}
              </text>
            </g>
          ))}

          <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {hovered && (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_TOP}
              y2={HEIGHT - PAD_BOTTOM}
              stroke="var(--color-ink)"
              strokeOpacity="0.15"
              strokeWidth="1"
            />
          )}

          <circle cx={last.x} cy={last.y} r="5" fill={color} stroke="white" strokeWidth="2" />
          {hovered && hoverIndex !== points.length - 1 && (
            <circle cx={hovered.x} cy={hovered.y} r="5" fill={color} stroke="white" strokeWidth="2" />
          )}

          <text x={PAD_LEFT} y={HEIGHT - 6} fontSize="9" fontFamily="var(--font-mono)" fill="var(--color-ink)" opacity="0.4">
            {shortDate(points[0].date)}
          </text>
          <text
            x={WIDTH - PAD_RIGHT}
            y={HEIGHT - 6}
            textAnchor="end"
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--color-ink)"
            opacity="0.4"
          >
            {shortDate(last.date)}
          </text>
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute rounded-lg border border-mist bg-linen px-3 py-2 shadow-sm whitespace-nowrap"
            style={{
              left: `${tooltipLeftPct}%`,
              top: `${tooltipTopPct}%`,
              transform: `translate(${tooltipOnRight ? "12px" : "calc(-100% - 12px)"}, -50%)`,
            }}
          >
            <p className="text-xs text-ink/45">
              {shortDate(hovered.date)}
            </p>
            <p className="font-display text-sm text-ink">{formatValue(hovered.value)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
