// Component props types for default components
// src/components/ey-calendar/types/components.ts

import type React from "react";

/**
 * Props for default button component
 */
export interface DefaultButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "nav" | "today" | "view" | "viewActive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props for default badge component
 */
export interface DefaultBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "info" | "success" | "warning" | "error";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

/**
 * Props for icon components
 */
export interface IconProps {
  className?: string;
  size?: number;
}
