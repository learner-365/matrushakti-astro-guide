import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matrushakti Astro Guide — Vedic Kundli Generator",
  description: "Create a Vedic Janma Kundli with transparent calculation settings and traditional Indian chart styles.",
  applicationName: "Matrushakti Astro Guide",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

