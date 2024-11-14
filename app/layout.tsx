import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colour Sustainability Checker",
  description:
    "Check how sustainable your colour choices are for digital displays and learn about energy-efficient colour selection.",
  icons: {
    icon: "/colour-icon.png",
    apple: "/colour-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/colour-icon.png" />
        <link rel="apple-touch-icon" href="/colour-icon.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
