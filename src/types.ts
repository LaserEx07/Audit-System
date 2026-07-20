export type UserRole =
  | 'Administrator'
  | 'Internal Auditor'
  | 'Accounting'
  | 'Warehouse'
  | 'Purchasing'
  | 'Manager'
  | 'Viewer';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Permission {
  module: string;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  dateCreated: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  description: string;
  status: 'Active' | 'Inactive';
  dateCreated: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  departmentId: string;
  position: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export type AuditType =
  | 'Financial'
  | 'Inventory'
  | 'Cash'
  | 'Bank'
  | 'Sales'
  | 'Purchasing'
  | 'Warehouse'
  | 'Operations'
  | 'IT'
  | 'Compliance'
  | 'HR';

export type RiskLevel = 'High' | 'Medium' | 'Low';
export type AuditStatus = 'Draft' | 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface AuditPlan {
  id: string;
  auditNumber: string;
  title: string;
  companyId: string;
  departmentId: string;
  auditType: AuditType;
  riskLevel: RiskLevel;
  leadAuditorId: string; // Employee ID
  auditTeamIds: string[]; // List of Employee IDs
  objective: string;
  scope: string;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  priority: PriorityLevel;
  remarks: string;
  dateCreated: string;
}

export interface ChecklistQuestion {
  id: string;
  question: string;
  category: string;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  title: string;
  auditType: AuditType;
  questions: ChecklistQuestion[];
  dateCreated: string;
}

export interface ExecutionAnswer {
  questionId: string;
  status: 'Pass' | 'Fail' | 'N/A';
  remarks: string;
  evidenceName?: string;
  evidenceData?: string; // base64 or mockup URL
  timestamp: string;
}

export interface AuditExecution {
  id: string;
  auditPlanId: string;
  answers: Record<string, ExecutionAnswer>;
  digitalSignature?: string;
  timestamp: string;
  gpsLocation?: string;
}

export type FindingStatus = 'Open' | 'Resolved' | 'In Progress' | 'Closed';
export type FindingSeverity = 'Critical' | 'Major' | 'Minor';

export interface Finding {
  id: string;
  findingNumber: string;
  auditPlanId: string;
  category: string;
  description: string;
  evidenceName?: string;
  rootCause: string;
  impact: string;
  riskLevel: RiskLevel;
  severity: FindingSeverity;
  recommendation: string;
  auditorId: string; // Employee ID
  date: string;
  status: FindingStatus;
}

export type CorrectiveActionStatus = 'Pending' | 'In Progress' | 'Under Review' | 'Verified' | 'Overdue';

export interface CorrectiveAction {
  id: string;
  actionNumber: string;
  findingId: string;
  assignedToId: string; // Employee ID
  departmentId: string;
  dueDate: string;
  priority: PriorityLevel;
  progress: number; // 0 to 100
  completionDate?: string;
  verifiedById?: string; // Employee ID
  status: CorrectiveActionStatus;
  evidenceName?: string;
}

export interface NCR {
  id: string;
  ncrNumber: string;
  findingId: string;
  departmentId: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  closedById?: string; // Employee ID
  dateClosed?: string;
  status: 'Open' | 'Closed';
}

export interface InventoryAudit {
  id: string;
  auditPlanId?: string;
  product: string;
  sku: string;
  warehouse: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  unitCost: number;
  totalVariance: number;
  remarks: string;
  dateCreated: string;
}

export interface CashAudit {
  id: string;
  auditPlanId?: string;
  cashierName: string;
  openingCash: number;
  cashCount: number;
  expectedCash: number;
  difference: number;
  remarks: string;
  evidenceName?: string;
  dateCreated: string;
}

export interface BankStatementItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference: string;
  isMatched: boolean;
  matchedId?: string;
}

export interface DeliveryReceiptItem {
  id: string;
  date: string;
  customerName: string;
  amount: number;
  reference: string;
  isMatched: boolean;
  matchedId?: string;
}

export interface PurchasingAudit {
  id: string;
  auditPlanId?: string;
  supplier: string;
  purchaseOrder: string;
  receivingReport: string;
  invoice: string;
  deliveryReceipt: string;
  amount: number;
  status: 'Verified' | 'Pending' | 'Discrepancy';
  verificationDetails: string;
  dateCreated: string;
}

export interface Document {
  id: string;
  name: string;
  category: 'Policy' | 'Report' | 'Evidence' | 'Working Paper' | 'SOP' | 'Other';
  filePath?: string;
  fileType: string; // 'pdf' | 'xlsx' | 'docx' | 'png'
  fileSize: string;
  version: string;
  uploadedBy: string;
  uploadedDate: string;
  description: string;
}

export interface AuditLog {
  id: string;
  user: string;
  date: string;
  time: string;
  action: string;
  oldValue: string;
  newValue: string;
  module: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'audit' | 'finding' | 'action' | 'approval' | 'system';
  date: string;
  isRead: boolean;
}
