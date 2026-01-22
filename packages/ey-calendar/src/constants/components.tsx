/**
 * Default components for calendar icons and visual elements
 * Author: Zuher ELMAS de l'équipe Emoory
 */

import React from "react";

/**
 * Props for icon components
 */
export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Calendar components type for icon overrides
 */
export interface EyCalendarComponents {
  // Planning & Empty States
  EmptyStateIcon: React.ComponentType<IconProps>;

  // Event Icons
  LocationIcon: React.ComponentType<IconProps>;
  RecurringIcon: React.ComponentType<IconProps>;
  AllDayIcon: React.ComponentType<IconProps>;

  // Time & Duration
  TimeIcon: React.ComponentType<IconProps>;
  DurationIcon: React.ComponentType<IconProps>;

  // Conflict Indicators
  ConflictIcon: React.ComponentType<IconProps>;
  ConflictDotIcon: React.ComponentType<IconProps>;

  // Bullet & Separators
  BulletIcon: React.ComponentType<IconProps>;
  SeparatorIcon: React.ComponentType<IconProps>;
}

/**
 * Default icon components using emoji
 */
export const DEFAULT_COMPONENTS: EyCalendarComponents = {
  // Planning & Empty States
  EmptyStateIcon: ({ className }: IconProps) => <span className={className}>📅</span>,

  // Event Icons
  LocationIcon: ({ className }: IconProps) => <span className={className}>📍</span>,
  RecurringIcon: ({ className }: IconProps) => <span className={className}>↻</span>,
  AllDayIcon: ({ className }: IconProps) => <span className={className}>🕐</span>,

  // Time & Duration
  TimeIcon: ({ className }: IconProps) => <span className={className}>⏰</span>,
  DurationIcon: ({ className }: IconProps) => <span className={className}>⏱️</span>,

  // Conflict Indicators
  ConflictIcon: ({ className }: IconProps) => <span className={className}>⚠️</span>,
  ConflictDotIcon: ({ className }: IconProps) => <span className={className}>●</span>,

  // Bullet & Separators
  BulletIcon: ({ className }: IconProps) => <span className={className}>•</span>,
  SeparatorIcon: ({ className }: IconProps) => <span className={className}> • </span>,
};
