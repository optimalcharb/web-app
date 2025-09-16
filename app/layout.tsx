import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shadow DOM Demo",
  description: "Next.js app demonstrating a custom element with shadow DOM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}