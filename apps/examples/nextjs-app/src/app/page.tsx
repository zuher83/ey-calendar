"use client";

import { EyCalendar } from "@emoory/ey-calendar";
import type { EyCalendarEvent } from "@emoory/ey-calendar";
import { calendarTheme } from "./calendar-theme";

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
    <main
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "linear-gradient(180deg, #fff7ed 0%, #fffbeb 100%)",
      }}
    >
      <div style={{ display: "grid", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>EyCalendar - Next.js App Router</h1>
        <p style={{ margin: 0, color: "#7c2d12" }}>
          Published structure-only CSS with a local theme overlay.
        </p>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <EyCalendar events={events} defaultView="week" theme={calendarTheme} />
      </div>
    </main>
  );
}
