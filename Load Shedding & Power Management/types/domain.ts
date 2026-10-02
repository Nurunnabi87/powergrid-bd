/**
 * Domain types mirroring the PowerGrid BD API (Prisma schema + service
 * selects). Every field here is one the API actually returns.
 */

// ---------- Enums ----------

export const USER_ROLES = ["CUSTOMER", "TECHNICIAN", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "BANNED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const SUBSTATION_STATUSES = ["OPERATIONAL", "MAINTENANCE", "OFFLINE"] as const;
export type SubstationStatus = (typeof SUBSTATION_STATUSES)[number];

export const PRIORITY_TIERS = ["CRITICAL", "HIGH", "NORMAL", "LOW"] as const;
export type PriorityTier = (typeof PRIORITY_TIERS)[number];

export const CONNECTION_TYPES = ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"] as const;
export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export const CONNECTION_STATUSES = ["ACTIVE", "SUSPENDED", "DISCONNECTED"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const SCHEDULE_STATUSES = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];

export const OUTAGE_TYPES = ["SCHEDULED", "UNEXPECTED"] as const;
export type OutageType = (typeof OUTAGE_TYPES)[number];

export const OUTAGE_STATUSES = [
  "REPORTED",
  "ACKNOWLEDGED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;
export type OutageStatus = (typeof OUTAGE_STATUSES)[number];

export const OUTAGE_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type OutageSeverity = (typeof OUTAGE_SEVERITIES)[number];

export const ASSIGNMENT_STATUSES = ["ASSIGNED", "ACCEPTED", "COMPLETED", "REASSIGNED"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const BILL_STATUSES = ["UNPAID", "PENDING", "PAID", "OVERDUE"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export const PAYMENT_STATUSES = ["INITIATED", "PENDING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["STRIPE", "BKASH"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const NOTIFICATION_TYPES = [
  "SCHEDULE_PUBLISHED",
  "OUTAGE_REPORTED",
  "OUTAGE_ASSIGNED",
  "OUTAGE_RESOLVED",
  "POWER_RESTORED",
  "BILL_GENERATED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Status → allowed next statuses, copied from the API's assertTransition(). */
export const OUTAGE_TRANSITIONS: Record<OutageStatus, readonly OutageStatus[]> = {
  REPORTED: ["ACKNOWLEDGED", "ASSIGNED", "CANCELLED"],
  ACKNOWLEDGED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
  CANCELLED: [],
};

export const SCHEDULE_TRANSITIONS: Record<ScheduleStatus, readonly ScheduleStatus[]> = {
  PLANNED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// ---------- Small shared shapes ----------

export interface ZoneRef {
  id: string;
  name: string;
  code: string;
}

export interface PersonRef {
  id: string;
  name: string;
  phone?: string | null;
  email?: string;
}

// ---------- Users ----------

export interface TechnicianProfile {
  id: string;
  specialization: string;
  isAvailable: boolean;
  activeJobCount: number;
  maxConcurrentJobs: number;
  zone: ZoneRef | null;
}

/** GET /users/me */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  technicianProfile: TechnicianProfile | null;
}

/** The user object returned by login/register. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/** GET /admin/users */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
  createdAt: string;
  _count: { connections: number; reportedOutages: number };
}

/** GET /admin/technicians */
export interface TechnicianCapacity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  specialization: string;
  isAvailable: boolean;
  activeJobCount: number;
  maxConcurrentJobs: number;
  zone: ZoneRef | null;
  inZone: boolean;
  canTakeJob: boolean;
}

// ---------- Distribution hierarchy ----------

export interface Zone {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { substations: number };
}

export interface Substation {
  id: string;
  name: string;
  code: string;
  capacityMva: number;
  status: SubstationStatus;
  createdAt: string;
  updatedAt: string;
  zone: ZoneRef & { city: string };
  _count: { feeders: number };
}

export interface Feeder {
  id: string;
  name: string;
  code: string;
  voltageLevel: string;
  loadKw: number;
  createdAt: string;
  updatedAt: string;
  substation: { id: string; name: string; code: string; zone: ZoneRef };
  _count: { areas: number };
}

export interface Area {
  id: string;
  name: string;
  code: string;
  population: number;
  priorityTier: PriorityTier;
  createdAt: string;
  updatedAt: string;
  feeder: {
    id: string;
    name: string;
    code: string;
    substation: { id: string; name: string; zone: ZoneRef };
  };
  _count: { connections: number };
}

export interface Connection {
  id: string;
  meterNo: string;
  connectionType: ConnectionType;
  tariffRate: number;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string; phone: string | null };
  area: {
    id: string;
    name: string;
    code: string;
    priorityTier: PriorityTier;
    feeder: { id: string; name: string; code: string };
  };
}

/** GET /users/me/connections */
export interface MyConnection {
  id: string;
  meterNo: string;
  connectionType: ConnectionType;
  tariffRate: number;
  status: ConnectionStatus;
  createdAt: string;
  area: {
    id: string;
    name: string;
    code: string;
    priorityTier: PriorityTier;
    feeder: {
      id: string;
      name: string;
      code: string;
      substation: { id: string; name: string; zone: ZoneRef };
    };
  };
}

// ---------- Load shedding ----------

export interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: ScheduleStatus;
  isAutoGenerated: boolean;
  createdAt: string;
  feeder: {
    id: string;
    name: string;
    code: string;
    substation: { id: string; name: string; zone: ZoneRef };
  };
}

export interface GenerateScheduleResult {
  zone: string;
  date: string;
  requestedDeficitMw: number;
  coveredLoadMw: number;
  feedersProtected: number;
  slotsCreated: number;
  customersNotified: number;
  schedules: { id: string; feederId: string; startTime: string; endTime: string }[];
}

// ---------- Outages ----------

export interface OutageAssignment {
  id: string;
  status: AssignmentStatus;
  assignedAt: string;
  acceptedAt: string | null;
  completedAt?: string | null;
  notes?: string | null;
  technician: { id: string; name: string; phone: string | null };
  assignedBy?: { id: string; name: string } | null;
}

export interface Outage {
  id: string;
  type: OutageType;
  status: OutageStatus;
  severity: OutageSeverity;
  title: string;
  description: string;
  photoUrl: string | null;
  affectedCustomers: number;
  reportedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  restoredAt: string | null;
  downtimeMinutes: number | null;
  resolutionNote: string | null;
  createdAt: string;
  area: {
    id: string;
    name: string;
    code: string;
    priorityTier: PriorityTier;
    feeder: {
      id: string;
      name: string;
      code: string;
      substation: { id: string; name: string; zoneId: string };
    };
  };
  reportedBy: { id: string; name: string; phone: string | null } | null;
  assignments: OutageAssignment[];
}

// ---------- Billing ----------

export interface Bill {
  id: string;
  billingPeriod: string;
  unitsConsumed: number;
  tariffRate: number;
  amount: number;
  lateFee: number;
  totalAmount: number;
  dueDate: string;
  status: BillStatus;
  issuedAt: string;
  paidAt: string | null;
  createdAt: string;
  connection: {
    id: string;
    meterNo: string;
    connectionType: ConnectionType;
    area: { id: string; name: string; code: string };
  };
  customer: { id: string; name: string; email: string };
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  paymentID: string | null;
  trxID: string | null;
  merchantInvoiceNumber: string;
  failureReason: string | null;
  initiatedAt: string;
  paidAt: string | null;
  createdAt: string;
  bill: {
    id: string;
    billingPeriod: string;
    totalAmount: number;
    status: BillStatus;
    dueDate: string;
    connection: { id: string; meterNo: string };
  };
  customer: { id: string; name: string; email: string };
}

export interface InitiatePaymentResult {
  paymentId: string;
  provider: PaymentProvider;
  paymentID: string | null;
  merchantInvoiceNumber: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  instruction: string;
}

/** POST /payments/:id/verify — two shapes depending on whether it settled now. */
export interface VerifyPaymentResult {
  alreadyProcessed: boolean;
  paymentId: string;
  trxID: string | null;
  payment?: Payment;
}

// ---------- Notifications ----------

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  outageId: string | null;
  scheduleId: string | null;
  createdAt: string;
}

// ---------- Admin & analytics ----------

export interface DashboardStats {
  users: Partial<Record<UserRole, number>>;
  infrastructure: {
    zones: number;
    substations: number;
    feeders: number;
    areas: number;
    connections: number;
  };
  outages: {
    byStatus: Partial<Record<OutageStatus, number>>;
    currentlyOpen: number;
    averageRestorationMinutes: number;
  };
  loadShedding: { activeSchedules: number };
  billing: {
    byStatus: Partial<Record<BillStatus, { count: number; amount: number }>>;
    unpaidAmount: number;
  };
  revenue: { completedPayments: number; totalCollected: number };
  generatedAt: string;
  cached: boolean;
}

export interface OutageAnalytics {
  totalOutages: number;
  resolvedOutages: number;
  resolutionRate: number;
  meanTimeToRestoreMinutes: number;
  fastestRestorationMinutes: number | null;
  slowestRestorationMinutes: number | null;
  byStatus: Partial<Record<OutageStatus, number>>;
  bySeverity: Partial<Record<OutageSeverity, number>>;
  byType: Partial<Record<OutageType, number>>;
  topAffectedAreas: {
    areaId: string;
    area: string;
    code: string;
    zone: string;
    outages: number;
    averageDowntimeMinutes: number;
  }[];
  /** Newest first, as returned by the API. */
  monthlyTrend: { month: string; outages: number; averageDowntimeMinutes: number }[];
  generatedAt: string;
  cached: boolean;
}

export interface LoadSheddingAnalytics {
  byZone: { zone: string; slots: number; totalHours: number }[];
  mostShedFeeders: { feeder: string; code: string; slots: number; totalHours: number }[];
  byStatus: Partial<Record<ScheduleStatus, number>>;
  criticalAreasProtected: number;
  generatedAt: string;
  cached: boolean;
}

export interface TechnicianPerformanceRow {
  technician: string;
  email: string;
  jobsCompleted: number;
  averageRestorationMinutes: number;
}

/** GET /analytics/my-performance */
export interface MyPerformance {
  profile: {
    specialization: string;
    isAvailable: boolean;
    activeJobCount: number;
    maxConcurrentJobs: number;
    zone: ZoneRef | null;
  };
  assignments: Record<AssignmentStatus, number> & { total: number };
  restoration: {
    jobsRestored: number;
    averageMinutes: number;
    fastestMinutes: number | null;
    slowestMinutes: number | null;
    totalDowntimeMinutes: number;
    customersRestored: number;
  };
  bySeverity: Partial<Record<OutageSeverity, number>>;
  monthlyTrend: { month: string; jobs: number; averageMinutes: number }[];
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: UserRole } | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// ---------- Public ----------

export interface PublicStats {
  network: {
    zones: number;
    substations: number;
    feeders: number;
    areas: number;
    criticalAreas: number;
  };
  customersServed: number;
  loadShedding: { schedulesToday: number; activeNow: number };
  outages: { open: number; restored: number; meanTimeToRestoreMinutes: number };
  generatedAt: string;
  cached: boolean;
}

export interface PublicZone {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string | null;
  _count: { substations: number };
}

export interface PublicSchedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: ScheduleStatus;
  feeder: {
    id: string;
    name: string;
    code: string;
    voltageLevel: string;
    areas: { id: string; name: string; priorityTier: PriorityTier }[];
    substation: { id: string; name: string; zone: ZoneRef };
  };
}
