import { ImageResponse } from "next/og";

export const alt = "PowerGrid BD — load-shedding schedules, outage reporting and bill payment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card, generated at build time in the brand colours. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #111a2e 0%, #1c2742 60%, #3a2c10 100%)",
          color: "#f4f6fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#f5b73b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>PowerGrid BD</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 950 }}>
            Know when the power goes. Get it back faster.
          </div>
          <div style={{ fontSize: 30, color: "#c6cde0", maxWidth: 950 }}>
            Load-shedding schedules · Outage reporting · Technician dispatch · Bill payment
          </div>
        </div>
      </div>
    ),
    size
  );
}
