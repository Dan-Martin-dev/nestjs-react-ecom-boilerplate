// UI-specific types for the web application
// For shared business logic types, import from @repo/shared

// UI Component Props
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// UI State types
export interface UIState {
  isLoading: boolean;
  error: string | null;
}

// Form state types  
export interface FormState<T> {
  data: T;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<keyof T, string>;
}

// Modal state
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  isActive?: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Layout types
export type LayoutType = 'sidebar' | 'topbar' | 'minimal';
