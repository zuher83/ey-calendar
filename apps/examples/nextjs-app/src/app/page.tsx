"use client";

import { EyCalendar } from "@emoory/ey-calendar";
import type { EyCalendarEvent } from "@emoory/ey-calendar";

export default function Home() {
  const events: EyCalendarEvent[] = [
    {
      id: "1",
      title: "Team Meeting",
      start: new Date(2024, 0, 15, 10, 0),
      end: new Date(2024, 0, 15, 11, 0),
      color: "#3b82f6",
    },
    {
      id: "2",
      title: "Lunch Break",
      start: new Date(2024, 0, 15, 12, 0),
      end: new Date(2024, 0, 15, 13, 0),
      color: "#10b981",
    },
  ];

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>📅 EyCalendar - Next.js App Router Example</h1>
      <EyCalendar events={events} defaultView="week" />
    </main>
  );
}
