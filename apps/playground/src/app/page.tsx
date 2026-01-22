"use client";

import { useEffect, useState } from "react";
import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { EyCalendar } from "@emoory/ey-calendar";
import type { EyCalendarEvent, EyCalendarOptions } from "@emoory/ey-calendar";
import { generateProfessionalEventsWithUsers, type User } from "@/utils/eventGenerator";
// import "@emoory/ey-calendar/styles.css";
import "@emoory/ey-calendar/styles/structure.css";
import { tailwindTheme } from "@/styles/tailwind";

type Theme = "light" | "dark" | "system";

export default function PlaygroundPage() {
  const [events, setEvents] = useState<EyCalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentDate] = useState<string>(() => format(new Date(), "EEEE d MMMM yyyy"));
  const [theme, setTheme] = useState<Theme>("system");

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;

    const applySystemTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.remove("light", "dark");
      if (isDark) {
        root.classList.add("dark");
      }
    };

    if (theme === "system") {
      // Remove manual override, let prefers-color-scheme work
      root.removeAttribute("data-theme");
      applySystemTheme();

      // Listen for system theme changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applySystemTheme();
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      root.setAttribute("data-theme", theme);
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  // Initialize events and users
  useEffect(() => {
    const { events: generatedEvents, users: generatedUsers } = generateProfessionalEventsWithUsers({
      userCount: 6,
      includeWeekends: false,
      includeMeetingRooms: true,
      workdayStart: 8,
      workdayEnd: 18,
      lunchBreakStart: 12,
      lunchBreakDuration: 60,
    });

    setEvents(generatedEvents);
    setUsers(generatedUsers);
  }, []);

  const calendarOptions: EyCalendarOptions = {
    defaultView: "week",
    showWeekends: true,
    showToday: true,
    showWeekNumbers: true,
    highlightToday: true,
    enableDragDrop: true,
    enableResize: true,
    enableCreate: true,
    enableDelete: true,
    autoHeight: true,
    theme: tailwindTheme,
  };

  const handleEventCreate = (
    timeSlot: { start: Date; end: Date },
    resourceId?: string
  ): EyCalendarEvent => {
    const newEvent: EyCalendarEvent = {
      id: faker.string.uuid(),
      title: "Nouveau - " + faker.company.name(),
      description: faker.lorem.sentence(),
      start: timeSlot.start,
      end: timeSlot.end,
      color: faker.helpers.arrayElement(["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"]),
      isAllDay: false,
      resourceId,
    };

    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const handleEventUpdate = (eventId: string, updates: Partial<EyCalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, ...updates } : event))
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  };

  return (
    <div className="bg-background flex h-screen flex-col">
      <header className="border-border bg-background/80 flex items-center justify-between border-b px-6 py-4 backdrop-blur">
        <div>
          <h1 className="text-foreground text-2xl font-bold">📅 EyCalendar Playground</h1>
          <p className="text-muted-foreground text-sm">
            {events.length} events • {users.length} users • {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <div className="flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 p-1">
            <button
              onClick={() => setTheme("light")}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                theme === "light"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Mode clair"
            >
              ☀️
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                theme === "system"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Automatique (système)"
            >
              💻
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                theme === "dark"
                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Mode sombre"
            >
              🌙
            </button>
          </div>
          <div className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-xs font-medium">
            v0.1.0
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <EyCalendar
          events={events}
          options={calendarOptions}
          dataTheme={theme === "system" ? undefined : theme}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
          className="h-full"
        />
      </main>

      <footer className="border-border bg-muted/30 text-muted-foreground flex items-center justify-between border-t px-6 py-2 text-xs">
        <div className="flex items-center gap-4">
          {users.map((user) => (
            <span key={user.id} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              {user.name}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
