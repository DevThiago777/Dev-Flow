export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  _count?: { projects: number; invoices: number };
}

export type ProjectStatus = "in_progress" | "completed" | "on_hold";

export interface ProjectMemberRef {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface Project {
  id: string;
  name: string;
  subtitle: string | null;
  icon: string;
  color: string;
  budget: number;
  deadline: string | null;
  status: ProjectStatus;
  progressPct: number;
  client: { id: string; name: string; company: string | null } | null;
  members: ProjectMemberRef[];
  taskCount: number;
  tasksDone?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  owner?: ProjectMemberRef;
  attendees: ProjectMemberRef[];
}

export type TransactionType = "earning" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string | null;
  date: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  client: { id: string; name: string; company: string | null };
}

export type TicketStatus = "open" | "pending" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  requester: ProjectMemberRef;
}

export interface DashboardResponse {
  kpis: {
    projects: { total: number; deltaPct: number };
    clients: { total: number; deltaPct: number };
    revenue: { total: number; deltaPct: number };
  };
  earnings: {
    series: { date: string; earning: number; expense: number }[];
    totalEarning: number;
    totalExpense: number;
    totalRevenue: number;
  };
  todayEvents: CalendarEvent[];
  recentProjects: Project[];
}
