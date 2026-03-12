import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Leaders League: Mandalika Edition | Astra Motor",
  description:
    "High-performance leaderboard dashboard for Astra Motor — Track employee performance across MotoGP, Moto2, Moto3, and MXGP clusters.",
  keywords: ["astra motor", "leaders league", "mandalika", "leaderboard", "performance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0D0D0D] text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
