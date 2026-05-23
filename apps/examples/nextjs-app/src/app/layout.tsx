import type { Metadata } from "next";
import type { ReactNode, JSX } from "react";
import "@emoory/ey-calendar/styles/structure.css";
import "./calendar-theme.css";

export const metadata: Metadata = {
  title: "EyCalendar - Next.js App Router Example",
  description: "Example implementation of EyCalendar with Next.js App Router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
