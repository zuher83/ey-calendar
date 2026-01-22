import { EyCalendar } from "@emoory/ey-calendar";
import type { EyCalendarEvent } from "@emoory/ey-calendar";

function App() {
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
    {
      id: "3",
      title: "Project Review",
      start: new Date(2024, 0, 15, 14, 0),
      end: new Date(2024, 0, 15, 15, 30),
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>📅 EyCalendar - Vite + React Example</h1>
      <EyCalendar events={events} defaultView="week" />
    </div>
  );
}

export default App;
