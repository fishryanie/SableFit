import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "linear-gradient(180deg,#F9F7F1,#ECE6D8)",
          color: "#111111",
          display: "flex",
          height: "100%",
          padding: "42px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(17,17,17,0.08)",
            borderRadius: 48,
            boxShadow: "0 24px 64px rgba(17,17,17,0.08)",
            display: "flex",
            flex: 1,
            justifyContent: "space-between",
            overflow: "hidden",
            padding: "48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "58%" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  background: "rgba(17,17,17,0.08)",
                  borderRadius: 999,
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: 3,
                  padding: "10px 20px",
                  textTransform: "uppercase",
                }}
              >
                SableFit
              </div>
              <div style={{ fontSize: 74, fontWeight: 800, letterSpacing: -3, lineHeight: 1.02, marginTop: 26 }}>
                Mobile-first workout planner and gym routine tracker
              </div>
              <div style={{ fontSize: 28, lineHeight: 1.45, marginTop: 22, opacity: 0.72 }}>
                Visual exercise cards, weekly plans, Today view, and reminder-ready PWA flow.
              </div>
            </div>

            <div style={{ display: "flex", gap: 14 }}>
              {["185 exercises", "12 system plans", "Install-ready PWA"].map((item) => (
                <div
                  key={item}
                  style={{
                    background: "#F4F1EA",
                    borderRadius: 999,
                    fontSize: 24,
                    fontWeight: 700,
                    padding: "12px 20px",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              background: "#111111",
              borderRadius: 36,
              color: "#FFFDF8",
              display: "flex",
              fontSize: 140,
              fontWeight: 800,
              justifyContent: "center",
              letterSpacing: -18,
              width: "30%",
            }}
          >
            SF
          </div>
        </div>
      </div>
    ),
    size,
  );
}
