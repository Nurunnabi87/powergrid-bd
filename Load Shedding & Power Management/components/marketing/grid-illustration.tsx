/**
 * Hero artwork: a substation feeding three feeders into neighbourhoods, one
 * of which is dark (shed) while a critical site (hospital) stays lit.
 * Pure SVG in theme colours, so it adapts to light and dark mode.
 */
export function GridIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-labelledby="grid-illustration-title"
      className={className}
    >
      <title id="grid-illustration-title">
        A substation feeding three areas: two powered, one in scheduled load shedding, with a hospital kept online
      </title>
      <defs>
        <linearGradient id="gi-glow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Card surface */}
      <rect x="8" y="8" width="464" height="344" rx="24" fill="var(--card)" stroke="var(--border)" />
      <circle cx="240" cy="92" r="84" fill="url(#gi-glow)" />

      {/* Substation */}
      <g transform="translate(200 48)">
        <rect width="80" height="64" rx="10" fill="var(--secondary)" stroke="var(--border)" />
        <path d="M44 12 30 36h12l-6 18 18-26H42l6-16z" fill="var(--primary)" />
      </g>
      <text x="240" y="132" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)" fontFamily="var(--font-geist-mono)">
        SUBSTATION · 33/11 kV
      </text>

      {/* Feeders */}
      <g fill="none" strokeWidth="3" strokeLinecap="round">
        <path d="M240 112v40H96v58" stroke="var(--primary)" />
        <path d="M240 152v58" stroke="var(--primary)" />
        <path d="M240 152h144v58" stroke="var(--muted-foreground)" strokeDasharray="6 8" opacity="0.6" />
      </g>
      <g fill="var(--primary)">
        <circle cx="96" cy="152" r="4" />
        <circle cx="240" cy="152" r="5" />
      </g>

      {/* Area A: powered homes */}
      <g transform="translate(40 214)">
        <rect width="112" height="100" rx="14" fill="var(--secondary)" stroke="var(--border)" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${14 + i * 30} 30)`}>
            <path d="M0 16 12 4l12 12v22H0z" fill="var(--background)" stroke="var(--border)" />
            <rect x="8" y="22" width="8" height="8" rx="1.5" fill="var(--primary)" />
          </g>
        ))}
        <text x="56" y="86" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">Area A · powered</text>
      </g>

      {/* Hospital: critical, never shed */}
      <g transform="translate(184 214)">
        <rect width="112" height="100" rx="14" fill="var(--secondary)" stroke="var(--success)" strokeWidth="1.5" />
        <rect x="36" y="22" width="40" height="44" rx="4" fill="var(--background)" stroke="var(--border)" />
        <path d="M52 34h8v8h8v8h-8v8h-8v-8h-8v-8h8z" fill="var(--success)" />
        <text x="56" y="86" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">Critical · protected</text>
      </g>

      {/* Area C: shed */}
      <g transform="translate(328 214)">
        <rect width="112" height="100" rx="14" fill="var(--muted)" stroke="var(--border)" strokeDasharray="4 4" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${14 + i * 30} 30)`} opacity="0.55">
            <path d="M0 16 12 4l12 12v22H0z" fill="var(--background)" stroke="var(--border)" />
            <rect x="8" y="22" width="8" height="8" rx="1.5" fill="var(--muted-foreground)" opacity="0.4" />
          </g>
        ))}
        <text x="56" y="86" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">Area C · shedding</text>
      </g>

      {/* Schedule chip */}
      <g transform="translate(330 40)">
        <rect width="124" height="44" rx="10" fill="var(--background)" stroke="var(--border)" />
        <text x="12" y="19" fontSize="10" fill="var(--muted-foreground)">Next slot</text>
        <text x="12" y="34" fontSize="12" fontWeight="600" fill="var(--foreground)" fontFamily="var(--font-geist-mono)">
          14:00 – 16:00
        </text>
      </g>
    </svg>
  );
}
