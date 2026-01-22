/**
 * Professional Calendar Event Generator
 *
 * Generates realistic calendar events for multiple users sharing their calendars
 * in a professional environment. Simulates real workplace patterns including:
 * - Recurring meetings (daily standups, weekly syncs)
 * - One-time meetings with realistic durations
 * - Deep work blocks for developers/designers
 * - Vacation days, sick leaves, and training
 * - Meeting room allocation
 * - Smart conflict detection
 *
 * @author Zuher ELMAS de l'équipe Emoory
 */

import { faker } from "@faker-js/faker";
import {
  addDays,
  addMinutes,
  endOfDay,
  format,
  isWeekend,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import type { EyCalendarEvent } from "@emoory/ey-calendar";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * User profile with role-specific meeting patterns
 */
export interface User {
  id: string;
  name: string;
  role: string;
  department: Department;
  meetingRatio: number; // 0.0-1.0 (percentage of time in meetings)
  color: string; // Unique color per user
  email: string;
}

/**
 * Company departments
 */
export type Department =
  | "Executive"
  | "Engineering"
  | "Product"
  | "Design"
  | "Sales"
  | "Marketing"
  | "HR"
  | "Finance";

/**
 * Event template for recurring patterns
 */
export interface EventTemplate {
  title: string;
  duration: number; // minutes
  participants: string[] | "all"; // user IDs array or 'all'
  color?: string;
  requiresRoom?: boolean;
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  time?: string; // HH:mm format
  frequency?: "daily" | "weekly" | "biweekly" | "monthly";
}

/**
 * Meeting room resource
 */
export interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  floor: number;
}

/**
 * Generator configuration options
 */
export interface GeneratorOptions {
  userCount?: number; // 4-10 users
  startDate?: Date; // Default: 12 months ago
  endDate?: Date; // Default: 3 months from now
  includeWeekends?: boolean; // Default: false
  includeMeetingRooms?: boolean; // Default: true
  workdayStart?: number; // Hour (default: 8)
  workdayEnd?: number; // Hour (default: 18)
  lunchBreakStart?: number; // Hour (default: 12)
  lunchBreakDuration?: number; // Minutes (default: 60)
}

/**
 * User availability tracker
 */
interface UserSchedule {
  [userId: string]: {
    [dateKey: string]: Array<{ start: Date; end: Date }>;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ROLE_TEMPLATES = [
  { role: "CEO", department: "Executive" as Department, meetingRatio: 0.85 },
  { role: "CTO", department: "Engineering" as Department, meetingRatio: 0.65 },
  { role: "CPO", department: "Product" as Department, meetingRatio: 0.7 },
  { role: "VP Sales", department: "Sales" as Department, meetingRatio: 0.9 },
  { role: "VP Marketing", department: "Marketing" as Department, meetingRatio: 0.75 },
  { role: "Senior Developer", department: "Engineering" as Department, meetingRatio: 0.25 },
  { role: "Product Manager", department: "Product" as Department, meetingRatio: 0.7 },
  { role: "UX Designer", department: "Design" as Department, meetingRatio: 0.4 },
  { role: "Sales Manager", department: "Sales" as Department, meetingRatio: 0.85 },
  { role: "HR Manager", department: "HR" as Department, meetingRatio: 0.6 },
  { role: "Developer", department: "Engineering" as Department, meetingRatio: 0.3 },
  { role: "Designer", department: "Design" as Department, meetingRatio: 0.35 },
  { role: "Marketing Specialist", department: "Marketing" as Department, meetingRatio: 0.5 },
  { role: "Finance Manager", department: "Finance" as Department, meetingRatio: 0.55 },
];

const USER_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ef4444", // Red
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

const MEETING_ROOMS: MeetingRoom[] = [
  { id: "room-1", name: "Salle Atlas", capacity: 4, floor: 1 },
  { id: "room-2", name: "Salle Babel", capacity: 6, floor: 1 },
  { id: "room-3", name: "Salle Cosmos", capacity: 8, floor: 2 },
  { id: "room-4", name: "Salle Delta", capacity: 10, floor: 2 },
  { id: "room-5", name: "Salle Echo", capacity: 12, floor: 3 },
  { id: "room-6", name: "Salle Forum", capacity: 20, floor: 3 },
];

const EVENT_TITLES = {
  standup: ["Daily Standup", "Morning Sync", "Team Standup"],
  oneOnOne: ["1-on-1", "Catch-up", "Weekly Sync", "Check-in"],
  client: ["Client Meeting", "Client Call", "Client Presentation", "Discovery Call"],
  deepWork: ["Focus Time", "Deep Work", "Development Block", "Design Sprint"],
  teamSync: ["Team Sync", "Team Meeting", "Sprint Planning", "Weekly Review"],
  workshop: ["Workshop", "Brainstorming", "Strategy Session", "Innovation Lab"],
  review: ["Code Review", "Design Review", "Performance Review", "Project Review"],
  training: ["Training Session", "Workshop", "Learning Session", "Skill Development"],
  allHands: ["All Hands", "Town Hall", "Company Update", "Quarterly Review"],
};

// ============================================================================
// MAIN GENERATOR CLASS
// ============================================================================

export class ProfessionalEventGenerator {
  private users: User[] = [];
  private options: Required<GeneratorOptions>;
  private userSchedule: UserSchedule = {};
  private events: EyCalendarEvent[] = [];

  constructor(options: GeneratorOptions = {}) {
    this.options = {
      userCount: options.userCount || 6,
      startDate: options.startDate || addDays(new Date(), -365), // 12 months ago
      endDate: options.endDate || addDays(new Date(), 90), // 3 months from now
      includeWeekends: options.includeWeekends ?? false,
      includeMeetingRooms: options.includeMeetingRooms ?? true,
      workdayStart: options.workdayStart || 8,
      workdayEnd: options.workdayEnd || 18,
      lunchBreakStart: options.lunchBreakStart || 12,
      lunchBreakDuration: options.lunchBreakDuration || 60,
    };

    // Ensure userCount is between 4 and 10
    this.options.userCount = Math.max(4, Math.min(10, this.options.userCount));
  }

  /**
   * Generate all events for the calendar
   */
  public generate(): EyCalendarEvent[] {
    this.users = this.generateUsers();
    this.initializeSchedules();

    // Generation order matters for realistic scheduling
    this.generateRecurringEvents(); // 40% - Predictable patterns
    this.generateOneTimeEvents(); // 50% - Ad-hoc meetings
    this.generateAbsences(); // 10% - Vacations, sick days, training

    return this.events;
  }

  /**
   * Get generated users for display purposes
   */
  public getUsers(): User[] {
    return this.users;
  }

  // ==========================================================================
  // USER GENERATION
  // ==========================================================================

  private generateUsers(): User[] {
    const users: User[] = [];
    const selectedRoles = faker.helpers.shuffle(ROLE_TEMPLATES).slice(0, this.options.userCount);

    selectedRoles.forEach((roleTemplate, index) => {
      users.push({
        id: `user-${index + 1}`,
        name: faker.person.fullName(),
        role: roleTemplate.role,
        department: roleTemplate.department,
        meetingRatio: roleTemplate.meetingRatio,
        color: USER_COLORS[index % USER_COLORS.length],
        email: faker.internet.email(),
      });
    });

    return users;
  }

  // ==========================================================================
  // SCHEDULE TRACKING
  // ==========================================================================

  private initializeSchedules(): void {
    this.users.forEach((user) => {
      this.userSchedule[user.id] = {};
    });
  }

  /**
   * Check if user is available at the specified time slot
   */
  private isUserAvailable(userId: string, start: Date, end: Date): boolean {
    const dateKey = format(start, "yyyy-MM-dd");
    const userSlots = this.userSchedule[userId]?.[dateKey] || [];

    return !userSlots.some((slot) => {
      return (
        (start >= slot.start && start < slot.end) ||
        (end > slot.start && end <= slot.end) ||
        (start <= slot.start && end >= slot.end)
      );
    });
  }

  /**
   * Check if all users are available
   */
  private areUsersAvailable(userIds: string[], start: Date, end: Date): boolean {
    return userIds.every((userId) => this.isUserAvailable(userId, start, end));
  }

  /**
   * Block time slot for user(s)
   */
  private blockTimeSlot(userIds: string[], start: Date, end: Date): void {
    userIds.forEach((userId) => {
      const dateKey = format(start, "yyyy-MM-dd");
      if (!this.userSchedule[userId][dateKey]) {
        this.userSchedule[userId][dateKey] = [];
      }
      this.userSchedule[userId][dateKey].push({ start, end });
    });
  }

  // ==========================================================================
  // TIME UTILITIES
  // ==========================================================================

  /**
   * Round time to nearest 15 or 30 minute interval
   */
  private roundToInterval(date: Date, interval: 15 | 30 = 30): Date {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.round(minutes / interval) * interval;

    return setMinutes(date, roundedMinutes);
  }

  /**
   * Get random time slot during business hours
   */
  private getRandomBusinessTime(
    date: Date,
    durationMinutes: number
  ): { start: Date; end: Date } | null {
    const workStart = setHours(setMinutes(date, 0), this.options.workdayStart);
    const workEnd = setHours(setMinutes(date, 0), this.options.workdayEnd);
    const lunchStart = setHours(setMinutes(date, 0), this.options.lunchBreakStart);
    const lunchEnd = addMinutes(lunchStart, this.options.lunchBreakDuration);

    // Available slots: morning (8h-12h) and afternoon (13h-18h)
    const morningSlots: Date[] = [];
    const afternoonSlots: Date[] = [];

    // Generate 30-minute intervals
    let currentTime = workStart;
    while (currentTime < workEnd) {
      const slotEnd = addMinutes(currentTime, durationMinutes);

      // Check if slot fits before lunch or after lunch
      if (slotEnd <= lunchStart) {
        morningSlots.push(new Date(currentTime));
      } else if (currentTime >= lunchEnd && slotEnd <= workEnd) {
        afternoonSlots.push(new Date(currentTime));
      }

      currentTime = addMinutes(currentTime, 30);
    }

    const allSlots = [...morningSlots, ...afternoonSlots];
    if (allSlots.length === 0) return null;

    const start = faker.helpers.arrayElement(allSlots);
    const end = addMinutes(start, durationMinutes);

    return { start, end };
  }

  /**
   * Get specific time on a date
   */
  private setTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(":").map(Number);

    return setMinutes(setHours(date, hours), minutes);
  }

  // ==========================================================================
  // RECURRING EVENTS (40% of total)
  // ==========================================================================

  private generateRecurringEvents(): void {
    const recurringTemplates = this.buildRecurringTemplates();

    let currentDate = new Date(this.options.startDate);
    const endDate = this.options.endDate;

    while (currentDate <= endDate) {
      if (!this.options.includeWeekends && isWeekend(currentDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      recurringTemplates.forEach((template) => {
        this.tryScheduleRecurringEvent(currentDate, template);
      });

      currentDate = addDays(currentDate, 1);
    }
  }

  private buildRecurringTemplates(): EventTemplate[] {
    const templates: EventTemplate[] = [];

    // Daily Standup - Everyone except executives (Mon-Fri 9:30)
    const nonExecs = this.users.filter((u) => u.department !== "Executive").map((u) => u.id);
    if (nonExecs.length > 0) {
      templates.push({
        title: faker.helpers.arrayElement(EVENT_TITLES.standup),
        duration: 15,
        participants: nonExecs,
        time: "09:30",
        frequency: "daily",
        requiresRoom: false,
      });
    }

    // Weekly Team Sync - Per department (Monday 14:00)
    const departmentGroups = this.groupUsersByDepartment();
    Object.entries(departmentGroups).forEach(([dept, userIds]) => {
      if (userIds.length > 1) {
        templates.push({
          title: `${dept} Team Sync`,
          duration: 60,
          participants: userIds,
          dayOfWeek: 1, // Monday
          time: "14:00",
          frequency: "weekly",
          requiresRoom: true,
        });
      }
    });

    // All Hands - Everyone (First Monday of month 10:00)
    templates.push({
      title: faker.helpers.arrayElement(EVENT_TITLES.allHands),
      duration: 90,
      participants: this.users.map((u) => u.id),
      dayOfWeek: 1, // Monday
      time: "10:00",
      frequency: "monthly",
      requiresRoom: true,
    });

    return templates;
  }

  private tryScheduleRecurringEvent(date: Date, template: EventTemplate): void {
    const dayOfWeek = date.getDay();

    // Check frequency conditions
    if (template.dayOfWeek !== undefined && template.dayOfWeek !== dayOfWeek) {
      return;
    }

    if (template.frequency === "monthly") {
      // Only first Monday of month
      if (dayOfWeek !== 1 || date.getDate() > 7) return;
    }

    if (template.frequency === "biweekly") {
      // Every other week
      const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
      if (weekNumber % 2 !== 0) return;
    }

    const start = this.setTime(date, template.time || "09:00");
    const end = addMinutes(start, template.duration);

    const participants = Array.isArray(template.participants)
      ? template.participants
      : template.participants === "all"
        ? this.users.map((u) => u.id)
        : [template.participants];

    if (!this.areUsersAvailable(participants, start, end)) {
      return;
    }

    const mainUser = this.users.find((u) => u.id === participants[0]);
    const room = template.requiresRoom ? faker.helpers.arrayElement(MEETING_ROOMS) : undefined;

    this.events.push({
      id: faker.string.uuid(),
      title: template.title,
      description: `Recurring ${template.frequency} meeting with ${participants.length} participants`,
      start,
      end,
      color: mainUser?.color || "#3b82f6",
      isAllDay: false,
      resourceId: room?.id,
    });

    this.blockTimeSlot(participants, start, end);
  }

  // ==========================================================================
  // ONE-TIME EVENTS (50% of total)
  // ==========================================================================

  private generateOneTimeEvents(): void {
    const targetEventCount = this.calculateTargetEventCount() * 0.5;
    let generatedCount = 0;

    const eventDurations = [
      { duration: 30, weight: 0.35, type: "short" }, // 35% - Quick sync, 1-on-1
      { duration: 60, weight: 0.4, type: "standard" }, // 40% - Standard meetings
      { duration: 120, weight: 0.15, type: "long" }, // 15% - Workshops, reviews
      { duration: 240, weight: 0.07, type: "halfDay" }, // 7% - Deep work, training
      { duration: 480, weight: 0.03, type: "fullDay" }, // 3% - Conferences, seminars
    ];

    let currentDate = new Date(this.options.startDate);

    while (currentDate <= this.options.endDate && generatedCount < targetEventCount) {
      if (!this.options.includeWeekends && isWeekend(currentDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // Generate 3-8 events per day
      const eventsPerDay = faker.number.int({ min: 3, max: 8 });

      for (let i = 0; i < eventsPerDay && generatedCount < targetEventCount; i++) {
        const durationConfig = faker.helpers.weightedArrayElement(
          eventDurations.map((d) => ({ value: d, weight: d.weight }))
        );
        this.tryGenerateOneTimeEvent(currentDate, durationConfig.duration, durationConfig.type);
        generatedCount++;
      }

      currentDate = addDays(currentDate, 1);
    }
  }

  private tryGenerateOneTimeEvent(date: Date, durationMinutes: number, type: string): void {
    const timeSlot = this.getRandomBusinessTime(date, durationMinutes);
    if (!timeSlot) return;

    // Select participants based on meeting type
    const participants = this.selectParticipants(type, durationMinutes);
    if (participants.length === 0) return;

    if (!this.areUsersAvailable(participants, timeSlot.start, timeSlot.end)) {
      return;
    }

    const mainUser = this.users.find((u) => u.id === participants[0])!;
    const title = this.generateEventTitle(type, participants.length);
    const room =
      durationMinutes >= 60 && participants.length > 2
        ? faker.helpers.arrayElement(MEETING_ROOMS)
        : undefined;

    this.events.push({
      id: faker.string.uuid(),
      title,
      description: faker.company.catchPhrase(),
      start: timeSlot.start,
      end: timeSlot.end,
      color: mainUser.color,
      isAllDay: false,
      resourceId: room?.id,
    });

    this.blockTimeSlot(participants, timeSlot.start, timeSlot.end);
  }

  private selectParticipants(type: string, durationMinutes: number): string[] {
    if (type === "short" && durationMinutes === 30) {
      // 1-on-1 meetings
      return faker.helpers.arrayElements(
        this.users.map((u) => u.id),
        2
      );
    }

    if (type === "halfDay" || type === "fullDay") {
      // Deep work - single person
      const devOrDesigner = this.users.filter(
        (u) => u.department === "Engineering" || u.department === "Design"
      );
      if (devOrDesigner.length > 0) {
        return [faker.helpers.arrayElement(devOrDesigner).id];
      }
    }

    // Standard meetings - 2-5 people
    const count = faker.number.int({ min: 2, max: Math.min(5, this.users.length) });

    return faker.helpers.arrayElements(
      this.users.map((u) => u.id),
      count
    );
  }

  private generateEventTitle(type: string, participantCount: number): string {
    if (type === "short" && participantCount === 2) {
      return faker.helpers.arrayElement(EVENT_TITLES.oneOnOne);
    }
    if (type === "halfDay" || type === "fullDay") {
      return faker.helpers.arrayElement(EVENT_TITLES.deepWork);
    }
    if (type === "long") {
      return faker.helpers.arrayElement(EVENT_TITLES.workshop);
    }

    const titleCategories = [EVENT_TITLES.client, EVENT_TITLES.teamSync, EVENT_TITLES.review];

    return faker.helpers.arrayElement(faker.helpers.arrayElement(titleCategories));
  }

  // ==========================================================================
  // ABSENCES (10% of total)
  // ==========================================================================

  private generateAbsences(): void {
    this.users.forEach((user) => {
      // Summer vacation (2 weeks)
      this.addVacation(user, "summer", 10);

      // Winter vacation (1 week)
      this.addVacation(user, "winter", 5);

      // Random short vacations (3-5 days, 2-3 times)
      const shortVacations = faker.number.int({ min: 2, max: 3 });
      for (let i = 0; i < shortVacations; i++) {
        this.addVacation(user, "random", faker.number.int({ min: 3, max: 5 }));
      }

      // Sick days (1-3 days, 1-2 times)
      const sickLeaves = faker.number.int({ min: 1, max: 2 });
      for (let i = 0; i < sickLeaves; i++) {
        this.addSickLeave(user, faker.number.int({ min: 1, max: 3 }));
      }

      // Training (1-2 days, 1-2 times)
      const trainings = faker.number.int({ min: 1, max: 2 });
      for (let i = 0; i < trainings; i++) {
        this.addTraining(user, faker.number.int({ min: 1, max: 2 }));
      }
    });
  }

  private addVacation(user: User, season: "summer" | "winter" | "random", days: number): void {
    let startDate: Date;

    if (season === "summer") {
      // July-August
      startDate = new Date(
        this.options.startDate.getFullYear(),
        6 + faker.number.int({ min: 0, max: 1 }),
        faker.number.int({ min: 1, max: 20 })
      );
    } else if (season === "winter") {
      // December-January
      startDate = new Date(
        this.options.startDate.getFullYear(),
        faker.number.int({ min: 0, max: 1 }) === 0 ? 11 : 0,
        faker.number.int({ min: 1, max: 20 })
      );
    } else {
      // Random date within range
      const daysDiff = Math.floor(
        (this.options.endDate.getTime() - this.options.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      startDate = addDays(
        this.options.startDate,
        faker.number.int({ min: 0, max: daysDiff - days })
      );
    }

    // Ensure it's within range
    if (startDate < this.options.startDate || startDate > this.options.endDate) return;

    const start = startOfDay(startDate);
    const end = endOfDay(addDays(start, days - 1));

    this.events.push({
      id: faker.string.uuid(),
      title: `🏖️ Vacation - ${user.name}`,
      description: `${days}-day vacation`,
      start,
      end,
      color: user.color,
      isAllDay: true,
      resourceId: user.id,
    });

    // Block all days
    for (let i = 0; i < days; i++) {
      const day = addDays(start, i);
      this.blockTimeSlot([user.id], startOfDay(day), endOfDay(day));
    }
  }

  private addSickLeave(user: User, days: number): void {
    const daysDiff = Math.floor(
      (this.options.endDate.getTime() - this.options.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const startDate = addDays(
      this.options.startDate,
      faker.number.int({ min: 0, max: daysDiff - days })
    );

    const start = startOfDay(startDate);
    const end = endOfDay(addDays(start, days - 1));

    this.events.push({
      id: faker.string.uuid(),
      title: `🤒 Sick Leave - ${user.name}`,
      description: `${days}-day sick leave`,
      start,
      end,
      color: "#ef4444", // Red for sick leave
      isAllDay: true,
      resourceId: user.id,
    });

    for (let i = 0; i < days; i++) {
      const day = addDays(start, i);
      this.blockTimeSlot([user.id], startOfDay(day), endOfDay(day));
    }
  }

  private addTraining(user: User, days: number): void {
    const daysDiff = Math.floor(
      (this.options.endDate.getTime() - this.options.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const startDate = addDays(
      this.options.startDate,
      faker.number.int({ min: 0, max: daysDiff - days })
    );

    const start = startOfDay(startDate);
    const end = endOfDay(addDays(start, days - 1));

    this.events.push({
      id: faker.string.uuid(),
      title: `📚 ${faker.helpers.arrayElement(EVENT_TITLES.training)} - ${user.name}`,
      description: `${days}-day professional training`,
      start,
      end,
      color: "#8b5cf6", // Purple for training
      isAllDay: true,
      resourceId: user.id,
    });

    for (let i = 0; i < days; i++) {
      const day = addDays(start, i);
      this.blockTimeSlot([user.id], startOfDay(day), endOfDay(day));
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private groupUsersByDepartment(): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    this.users.forEach((user) => {
      if (!groups[user.department]) {
        groups[user.department] = [];
      }
      groups[user.department].push(user.id);
    });

    return groups;
  }

  private calculateTargetEventCount(): number {
    const workDays = this.calculateWorkDays();
    // Estimate: 5-8 events per user per day on average

    return workDays * this.users.length * faker.number.int({ min: 5, max: 8 });
  }

  private calculateWorkDays(): number {
    let count = 0;
    let currentDate = new Date(this.options.startDate);

    while (currentDate <= this.options.endDate) {
      if (!this.options.includeWeekends && isWeekend(currentDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }
      count++;
      currentDate = addDays(currentDate, 1);
    }

    return count;
  }
}

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Generate events and return both events and users
 */
export function generateProfessionalEventsWithUsers(options?: GeneratorOptions): {
  events: EyCalendarEvent[];
  users: User[];
} {
  const generator = new ProfessionalEventGenerator(options);
  const events = generator.generate();
  const users = generator.getUsers();

  return { events, users };
}
