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
          color: "#FFFDF8",
          display: "flex",
          fontFamily: "sans-serif",
          fontSize: 82,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.12em",
          width: "100%",
        }}
      >
        SF
      </div>
    ),
    size,
  );
}
