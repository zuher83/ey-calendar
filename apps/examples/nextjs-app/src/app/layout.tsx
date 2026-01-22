import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EyCalendar - Next.js App Router Example",
  description: "Example implementation of EyCalendar with Next.js App Router",
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
