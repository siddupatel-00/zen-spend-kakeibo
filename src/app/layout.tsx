import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kakeibo — Mindful Financial Tracker",
  description: "A Japanese Kakeibo method habit & spending tracker. Transition from mindless spending to mindful wealth creation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
