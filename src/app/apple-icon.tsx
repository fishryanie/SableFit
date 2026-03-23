import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#111111",
          borderRadius: 42,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #303030 0%, #111111 100%)",
            borderRadius: 38,
            display: "flex",
            height: 122,
            position: "relative",
            width: 122,
          }}
        >
          <div
            style={{
              color: "#FFFDF8",
              fontFamily: "sans-serif",
              fontSize: 92,
              fontWeight: 800,
              inset: 0,
              letterSpacing: "-0.14em",
              lineHeight: "122px",
              position: "absolute",
              textAlign: "center",
            }}
          >
            S
          </div>
          <div
            style={{
              background: "#B79B67",
              borderRadius: 999,
              height: 8,
              position: "absolute",
              right: 18,
              top: 20,
              transform: "rotate(-24deg)",
              width: 28,
            }}
          />
          <div
            style={{
              background: "#F2E8D5",
              border: "3px solid #B79B67",
              borderRadius: 999,
              height: 18,
              position: "absolute",
              right: 8,
              top: 12,
              width: 18,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
