"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#F5F2ED",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0a0a0a" }}>
            Something went wrong
          </h2>
          <p style={{ marginTop: 8, color: "#6b7280", fontSize: 14 }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              height: 44,
              padding: "0 24px",
              borderRadius: 12,
              background: "#0a0a0a",
              color: "#fff",
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
