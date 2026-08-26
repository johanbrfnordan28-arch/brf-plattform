import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Styrelse-Navet — Underhållsplan och upphandling för styrelser",
  description:
    "Prova gratis i 30 dagar. Underhållsplan, upphandling av stora och små entreprenader, dokument och beslutsstöd — samlat för BRF-styrelser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} antialiased`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
