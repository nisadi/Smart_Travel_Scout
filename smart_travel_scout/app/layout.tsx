// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Travel Scout — AI-Powered Sri Lanka Travel Experiences",
  description:
    "Describe your dream travel experience and let our AI scout the best matching experiences from curated Sri Lanka destinations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "Inter, sans-serif",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        {children}
      </body>
    </html>
  );
}