import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evozome",
  description: "A private sanctuary designed for people who value space, silence and timeless design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
