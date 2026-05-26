import type { Metadata } from "next";
import { Inter } from "next/font/google";
// Suppress TS error for side-effect CSS import when no global declaration is present
// @ts-ignore
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "Arial"]
});

export const metadata: Metadata = {
  title: "NBL Shop",
  description: "Multi-tenant ecommerce stores with Stripe Connect payouts."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}