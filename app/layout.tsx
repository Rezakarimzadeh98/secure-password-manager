import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Password Manager - Enterprise Edition",
  description: "Professional password manager with advanced generation, secure vault, password bank, and comprehensive management tools. Built with Next.js 15 and TypeScript.",
  keywords: ["password generator", "password manager", "secure passwords", "password vault", "enterprise security", "cryptographic generator"],
  authors: [{ name: "Reza Karimzadeh", url: "https://github.com/Rezakarimzadeh98" }],
  creator: "Reza Karimzadeh",
  openGraph: {
    title: "Secure Password Manager - Enterprise Edition",
    description: "Professional password management with advanced generation and secure storage",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
