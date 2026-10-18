import { ImageResponse } from "next/og";

export const alt = "Hallery: a quiet, museum-style browser for 51,459 European artworks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 80, background: "#121211", color: "#ebe8e2", fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#a19d94" }}>Art of the moment</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 150, lineHeight: 1 }}>Hallery</div>
          <div style={{ fontSize: 42, fontStyle: "italic", color: "#a19d94", marginTop: 24 }}>51,459 European artworks, quietly.</div>
        </div>
      </div>
    ),
    size,
  );
}
