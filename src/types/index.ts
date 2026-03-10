export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
  isAllDay: boolean;
}

export interface GoogleTask {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  notes?: string;
  taskListId: string;
  taskListTitle: string;
}

export interface ScheduleContext {
  events: CalendarEvent[];
  tasks: GoogleTask[];
  fetchedAt: string;
}

export interface ChatRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  includeSchedule?: boolean;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

export interface ScheduleResponse {
  events: CalendarEvent[];
  tasks: GoogleTask[];
  error?: string;
}
