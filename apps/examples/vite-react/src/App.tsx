import { EyCalendar } from "@emoory/ey-calendar";
import type { EyCalendarEvent } from "@emoory/ey-calendar";
import { headlessClassNames } from "./headlessTheme";

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
    <div className="vite-shell">
      <section className="vite-card">
        <h1>EyCalendar - Vite + React 19</h1>
        <p>Published root import with the full CSS bundle.</p>
        <EyCalendar events={events} defaultView="week" />
      </section>

      <section className="vite-card">
        <h2>Headless consumer</h2>
        <p>Published root import with unstyled mode and local class mappings.</p>
        <EyCalendar
          events={events}
          defaultView="planning"
          unstyled
          classNames={headlessClassNames}
        />
      </section>
    </div>
  );
}

export default App;
