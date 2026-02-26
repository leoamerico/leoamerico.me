import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Leonardo Américo — Arquiteto de Soluções para Gestão Pública";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020617",
          backgroundImage:
            "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Leonardo Américo
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#22D3EE",
              fontWeight: 500,
            }}
          >
            Arquiteto de Soluções · Gestão Pública · Transformação Digital
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            leoamerico.me
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
