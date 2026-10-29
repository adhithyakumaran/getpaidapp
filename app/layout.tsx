import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coupon Intelligence",
  description: "Coupon discovery with clear conditions, source evidence, and honest freshness information.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
