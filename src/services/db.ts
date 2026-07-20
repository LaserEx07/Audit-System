import {
  Company,
  Department,
  Employee,
  AuditPlan,
  ChecklistTemplate,
  AuditExecution,
  Finding,
  CorrectiveAction,
  NCR,
  InventoryAudit,
  CashAudit,
  BankStatementItem,
  DeliveryReceiptItem,
  PurchasingAudit,
  Document,
  AuditLog,
  Notification,
  UserRole,
  User,
  AuditType
} from '../types';

// Helper to access LocalStorage safely
function getStorage<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(`audit_sys_${key}`);
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    console.error('Error reading localStorage key', key, e);
    return initialValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`audit_sys_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage key', key, e);
  }
}

// Global active user role simulation (can be changed in runtime navbar)
export function getActiveUser(): User {
  return getStorage<User>('active_user', {
    id: 'emp-1',
    fullName: 'Alice Smith',
    email: 'alice.smith@auditcorp.com',
    role: 'Administrator'
  });
}

export function setActiveUser(user: User): void {
  setStorage('active_user', user);
  logSystemAction('System', `Switched active role to ${user.role}`, '', user.fullName, 'Authentication');
}

// Logging helper
export function logSystemAction(
  user: string,
  action: string,
  oldValue: string,
  newValue: string,
  module: string
): void {
  const logs = getStorage<AuditLog[]>('audit_logs', []);
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    action,
    oldValue,
    newValue,
    module,
    ipAddress: '127.0.0.1 (Offline Interface)'
  };
  logs.unshift(newLog);
  setStorage('audit_logs', logs.slice(0, 1000)); // Limit to last 1000 logs
}

// Default Seed Data
const defaultCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Apex Logistics Corp',
    code: 'ALC',
    address: '404 Express Boulevard, Sector 4, Metro Area',
    contactPerson: 'David Chen',
    phone: '+1 (555) 019-2834',
    email: 'contact@apexlogistics.com',
    status: 'Active',
    dateCreated: '2026-01-15'
  },
  {
    id: 'comp-2',
    name: 'Summit Manufacturing Ltd',
    code: 'SML',
    address: '10 Industrial Parkway, Zone B, West District',
    contactPerson: 'Sarah Jenkins',
    phone: '+1 (555) 024-5928',
    email: 's.jenkins@summitmfg.com',
    status: 'Active',
    dateCreated: '2026-02-10'
  },
  {
    id: 'comp-3',
    name: 'Pinnacle Financials Inc',
    code: 'PFI',
    address: '88 Wall Street Heights, Financial Hub',
    contactPerson: 'Marcus Vance',
    phone: '+1 (555) 093-8471',
    email: 'compliance@pinnaclefin.com',
    status: 'Active',
    dateCreated: '2026-03-01'
  }
];

const defaultDepartments: Department[] = [
  { id: 'dept-1', name: 'Finance & Accounts', head: 'Emily Davis', description: 'Oversees financial statements, cash control, and tax compliance.', status: 'Active', dateCreated: '2026-01-01' },
  { id: 'dept-2', name: 'Warehouse & Inventory', head: 'Robert Johnson', description: 'Handles stock receiving, warehouse staging, distribution, and logistics.', status: 'Active', dateCreated: '2026-01-01' },
  { id: 'dept-3', name: 'IT & Cyber Security', head: 'John Doe', description: 'Maintains system logs, backup schedules, network security, and infrastructure controls.', status: 'Active', dateCreated: '2026-01-01' },
  { id: 'dept-4', name: 'Procurement & Purchasing', head: 'Michael Brown', description: 'Handles supplier vetting, purchase orders, purchase requests, and supply logistics.', status: 'Active', dateCreated: '2026-01-01' },
  { id: 'dept-5', name: 'Compliance & Legal', head: 'Sophia Martinez', description: 'Monitors corporate governance, policy adherence, and legislative requirements.', status: 'Active', dateCreated: '2026-01-01' }
];

const defaultEmployees: Employee[] = [
  { id: 'emp-1', employeeId: 'EMP-001', fullName: 'Alice Smith', departmentId: 'dept-5', position: 'Lead Internal Auditor', email: 'alice.smith@auditcorp.com', phone: '+1 (555) 123-4567', status: 'Active' },
  { id: 'emp-2', employeeId: 'EMP-002', fullName: 'John Doe', departmentId: 'dept-3', position: 'IT Manager', email: 'john.doe@auditcorp.com', phone: '+1 (555) 234-5678', status: 'Active' },
  { id: 'emp-3', employeeId: 'EMP-003', fullName: 'Robert Johnson', departmentId: 'dept-2', position: 'Warehouse Logistics Supervisor', email: 'robert.j@auditcorp.com', phone: '+1 (555) 345-6789', status: 'Active' },
  { id: 'emp-4', employeeId: 'EMP-004', fullName: 'Emily Davis', departmentId: 'dept-1', position: 'Chief Accountant', email: 'emily.davis@auditcorp.com', phone: '+1 (555) 456-7890', status: 'Active' },
  { id: 'emp-5', employeeId: 'EMP-005', fullName: 'Michael Brown', departmentId: 'dept-4', position: 'Procurement Specialist', email: 'michael.b@auditcorp.com', phone: '+1 (555) 567-8901', status: 'Active' },
  { id: 'emp-6', employeeId: 'EMP-006', fullName: 'Sophia Martinez', departmentId: 'dept-5', position: 'Senior Internal Auditor', email: 'sophia.m@auditcorp.com', phone: '+1 (555) 678-9012', status: 'Active' }
];

const defaultChecklists: ChecklistTemplate[] = [
  {
    id: 'chk-1',
    title: 'Standard Warehouse Safety & Stock Count',
    auditType: 'Warehouse',
    dateCreated: '2026-01-20',
    questions: [
      { id: 'q-w1', question: 'Are fire exits clear and safety equipment inspection logs up to date?', category: 'Physical Safety', required: true },
      { id: 'q-w2', question: 'Is physical stock organized properly under labeled bin numbers matching the ERP system?', category: 'Inventory Controls', required: true },
      { id: 'q-w3', question: 'Are high-value stock items locked in secure cages with restricted keycard access?', category: 'Security Controls', required: true },
      { id: 'q-w4', question: 'Are Goods Received Notes (GRN) stamped, dated, and entered into ERP within 24 hours of delivery?', category: 'Documentation', required: true },
      { id: 'q-w5', question: 'Do physical counts of spot-checked products match SKU system counts exactly?', category: 'Inventory Controls', required: true }
    ]
  },
  {
    id: 'chk-2',
    title: 'IT Server Room and Cyber Security Controls',
    auditType: 'IT',
    dateCreated: '2026-02-05',
    questions: [
      { id: 'q-it1', question: 'Is physical server room entry restricted to authorized keycard personnel with logs audited monthly?', category: 'Physical Access', required: true },
      { id: 'q-it2', question: 'Are daily automated offsite server database backups running and successfully verified?', category: 'Backup & Recovery', required: true },
      { id: 'q-it3', question: 'Do active employee account directories match HR active lists with immediate revocation for exit employees?', category: 'Identity Management', required: true },
      { id: 'q-it4', question: 'Is firewall firmware upgraded to the latest version and vulnerability scans run quarterly?', category: 'Network Security', required: false }
    ]
  },
  {
    id: 'chk-3',
    title: 'Accounts Payable & Cash Handling Integrity',
    auditType: 'Cash',
    dateCreated: '2026-02-15',
    questions: [
      { id: 'q-f1', question: 'Are petty cash lockboxes counted daily by the cashier and verified by an independent accountant?', category: 'Cash Controls', required: true },
      { id: 'q-f2', question: 'Are all single check disbursements above $10,000 dual-signed by authorized directors?', category: 'Approval Matrix', required: true },
      { id: 'q-f3', question: 'Are bank account statements reconciled within 5 days of monthly ledger closure?', category: 'Reconciliation', required: true }
    ]
  }
];

const defaultAuditPlans: AuditPlan[] = [
  {
    id: 'plan-1',
    auditNumber: 'AUD-2026-001',
    title: 'H1 Warehouse Inventory Verification',
    companyId: 'comp-2',
    departmentId: 'dept-2',
    auditType: 'Warehouse',
    riskLevel: 'High',
    leadAuditorId: 'emp-1',
    auditTeamIds: ['emp-6'],
    objective: 'To verify the physical accuracy of the raw material warehouse stock levels and evaluate safety guidelines.',
    scope: 'Summit Manufacturing Main Storage Hub, covering stock levels, safety exits, and security gates.',
    startDate: '2026-07-10',
    endDate: '2026-07-25',
    status: 'In Progress',
    priority: 'High',
    remarks: 'Field audit currently underway. High SKU variance suspected in sheet metals.',
    dateCreated: '2026-06-20'
  },
  {
    id: 'plan-2',
    auditNumber: 'AUD-2026-002',
    title: 'Disaster Recovery and Cyber Security Audit',
    companyId: 'comp-3',
    departmentId: 'dept-3',
    auditType: 'IT',
    riskLevel: 'Medium',
    leadAuditorId: 'emp-6',
    auditTeamIds: ['emp-1'],
    objective: 'Ensure IT infrastructure backup integrity and physical server security control alignment.',
    scope: 'Pinnacle Financials Central Server Infrastructure and cloud database endpoints.',
    startDate: '2026-08-01',
    endDate: '2026-08-10',
    status: 'Planned',
    priority: 'Medium',
    remarks: 'Will coordinate with IT head John Doe for penetration test scheduling.',
    dateCreated: '2026-07-02'
  },
  {
    id: 'plan-3',
    auditNumber: 'AUD-2026-003',
    title: 'FY2025 Year-End Cash and Financial Audit',
    companyId: 'comp-1',
    address: '', // dummy spacer
    departmentId: 'dept-1',
    auditType: 'Financial',
    riskLevel: 'High',
    leadAuditorId: 'emp-1',
    auditTeamIds: ['emp-6'],
    objective: 'Audit ledger consistency, cashier balance protocols, and general corporate expense records.',
    scope: 'Apex Logistics Corp headquarters corporate ledger of FY2025.',
    startDate: '2026-05-10',
    endDate: '2026-05-20',
    status: 'Completed',
    priority: 'High',
    remarks: 'Reconciliation has been successfully verified. Minor findings logged and resolved.',
    dateCreated: '2026-04-15'
  } as unknown as AuditPlan
];

const defaultFindings: Finding[] = [
  {
    id: 'find-1',
    findingNumber: 'FND-2026-001',
    auditPlanId: 'plan-1',
    category: 'Inventory Discrepancy',
    description: 'Physical count of high-strength structural sheet metal (SKU-MET-889) revealed a variance of -42 units compared to system reports.',
    evidenceName: 'sheet_metal_count.xlsx',
    rootCause: 'Receiving staff entered stock shipment under the wrong warehouse location code during busy delivery hours.',
    impact: 'Incorrect asset valuation in financial statement and minor production delays in high-pressure staging.',
    riskLevel: 'Medium',
    severity: 'Major',
    recommendation: 'Enforce real-time barcoding scanning on initial staging and implement mandatory dual-person counts for metal alloys.',
    auditorId: 'emp-1',
    date: '2026-07-15',
    status: 'In Progress'
  },
  {
    id: 'find-2',
    findingNumber: 'FND-2026-002',
    auditPlanId: 'plan-1',
    category: 'Physical Security Control',
    description: 'Security locks on high-value gold components storage cage are unlocked and keycards are dangling near the supervisor console.',
    evidenceName: 'cage_unlocked.jpg',
    rootCause: 'Lack of active safety training and negligence during shift handover procedures.',
    impact: 'High threat of inventory theft and internal product slippage.',
    riskLevel: 'High',
    severity: 'Critical',
    recommendation: 'Equip cages with automated digital locking mechanisms that log access logs directly, and initiate disciplinary guidelines.',
    auditorId: 'emp-6',
    date: '2026-07-18',
    status: 'Open'
  },
  {
    id: 'find-3',
    findingNumber: 'FND-2026-003',
    auditPlanId: 'plan-3',
    category: 'Cash Management Control',
    description: 'Petty cash lockbox was stored in desk drawers overnight rather than the company master safe box.',
    evidenceName: 'petty_cash_drawer.jpg',
    rootCause: 'Cashier finished shifts late and did not have access permissions for the primary office safe vault.',
    impact: 'Cash assets exposed to burglary.',
    riskLevel: 'Low',
    severity: 'Minor',
    recommendation: 'Grant authorized manager-on-duty permissions to lock box or assign a double-dial locking cash drawer.',
    auditorId: 'emp-1',
    date: '2026-05-15',
    status: 'Resolved'
  }
];

const defaultCorrectiveActions: CorrectiveAction[] = [
  {
    id: 'ca-1',
    actionNumber: 'CAP-2026-001',
    findingId: 'find-1',
    assignedToId: 'emp-3',
    departmentId: 'dept-2',
    dueDate: '2026-07-30',
    priority: 'Medium',
    progress: 75,
    status: 'In Progress',
    evidenceName: 'corrected_ledger.xlsx'
  },
  {
    id: 'ca-2',
    actionNumber: 'CAP-2026-002',
    findingId: 'find-2',
    assignedToId: 'emp-3',
    departmentId: 'dept-2',
    dueDate: '2026-07-22',
    priority: 'High',
    progress: 10,
    status: 'Pending'
  },
  {
    id: 'ca-3',
    actionNumber: 'CAP-2026-003',
    findingId: 'find-3',
    assignedToId: 'emp-4',
    departmentId: 'dept-1',
    dueDate: '2026-05-25',
    priority: 'Low',
    progress: 100,
    completionDate: '2026-05-24',
    verifiedById: 'emp-1',
    status: 'Verified',
    evidenceName: 'safe_confirmation_log.pdf'
  }
];

const defaultNCRs: NCR[] = [
  {
    id: 'ncr-1',
    ncrNumber: 'NCR-2026-001',
    findingId: 'find-2',
    departmentId: 'dept-2',
    description: 'High-value items secure cage was left completely unlocked and keycards were left unattended, violating Standard Operating Procedure SOP-WH-092.',
    rootCause: 'Supervisor bypassed standard locks during high-volume afternoon shipping and failed to lock up before departing.',
    correctiveAction: 'Immediate lock replacement with magnetic proximity locks and re-training of the warehouse security staff.',
    preventiveAction: 'Monthly automated system audits of high-value cage entry logs cross-matched with active shift records.',
    status: 'Open'
  }
];

const defaultInventoryAudits: InventoryAudit[] = [
  { id: 'inv-1', auditPlanId: 'plan-1', product: 'High-Strength Steel Sheets', sku: 'SKU-MET-889', warehouse: 'Zone A - Heavy Metals', systemQty: 120, physicalQty: 78, variance: -42, unitCost: 45.0, totalVariance: -1890.0, remarks: 'Confirmed system lag in logging defective returns', dateCreated: '2026-07-11' },
  { id: 'inv-2', auditPlanId: 'plan-1', product: 'Copper Wires 12V Pro', sku: 'SKU-COP-404', warehouse: 'Zone B - Wiring', systemQty: 500, physicalQty: 502, variance: 2, unitCost: 12.5, totalVariance: 25.0, remarks: 'Minor overage due to supplier overpack', dateCreated: '2026-07-11' },
  { id: 'inv-3', auditPlanId: 'plan-1', product: 'Gold Plated Connectors', sku: 'SKU-GLD-990', warehouse: 'Zone C - Restricted Safe', systemQty: 1500, physicalQty: 1500, variance: 0, unitCost: 28.0, totalVariance: 0.0, remarks: 'Counted inside secured vault cage', dateCreated: '2026-07-12' },
  { id: 'inv-4', auditPlanId: 'plan-1', product: 'Industrial Hydraulic Fluid', sku: 'SKU-HYD-102', warehouse: 'Zone D - Chemicals', systemQty: 60, physicalQty: 45, variance: -15, unitCost: 120.0, totalVariance: -1800.0, remarks: 'Leaked barrel marked for disposal but not written off', dateCreated: '2026-07-13' }
];

const defaultCashAudits: CashAudit[] = [
  { id: 'cash-1', auditPlanId: 'plan-3', cashierName: 'Gregory Jenkins', openingCash: 250.0, cashCount: 1245.5, expectedCash: 1245.5, difference: 0.0, remarks: 'Cash matches terminal tape perfectly.', dateCreated: '2026-05-12' },
  { id: 'cash-2', auditPlanId: 'plan-3', cashierName: 'Samantha Cole', openingCash: 250.0, cashCount: 890.0, expectedCash: 915.5, difference: -25.5, remarks: 'Shortage of $25.50. Cashier suspects mistake in customer change receipt.', evidenceName: 'register_receipt_variance.jpg', dateCreated: '2026-05-13' },
  { id: 'cash-3', auditPlanId: 'plan-3', cashierName: 'David Vance', openingCash: 250.0, cashCount: 1560.2, expectedCash: 1545.0, difference: 15.2, remarks: 'Over-counter excess of $15.20. Tips box count mixed in.', dateCreated: '2026-05-14' }
];

const defaultPurchasingAudits: PurchasingAudit[] = [
  { id: 'pa-1', auditPlanId: 'plan-3', supplier: 'Sigma Logistics Alloys', purchaseOrder: 'PO-2026-9092', receivingReport: 'RR-99882', invoice: 'INV-44123', deliveryReceipt: 'DR-11224', amount: 8450.0, status: 'Verified', verificationDetails: 'All 3 documents match. Verification confirmed.', dateCreated: '2026-05-12' },
  { id: 'pa-2', auditPlanId: 'plan-3', supplier: 'Titan Parts Manufacturing', purchaseOrder: 'PO-2026-9095', receivingReport: 'RR-99885', invoice: 'INV-44128', deliveryReceipt: 'DR-11229', amount: 12900.0, status: 'Discrepancy', verificationDetails: 'Invoice charges $12,900 but Purchase Order listed pre-negotiated rate of $11,900. $1,000 variance.', dateCreated: '2026-05-13' },
  { id: 'pa-3', auditPlanId: 'plan-3', supplier: 'Globe Connect Tech', purchaseOrder: 'PO-2026-9102', receivingReport: 'RR-99890', invoice: 'INV-44150', deliveryReceipt: 'DR-11242', amount: 3100.0, status: 'Pending', verificationDetails: 'Receiving Report waiting manager signature verification.', dateCreated: '2026-05-15' }
];

const defaultDocuments: Document[] = [
  { id: 'doc-1', name: 'Internal Audit Charter 2026.pdf', category: 'Policy', fileType: 'pdf', fileSize: '1.2 MB', version: 'v1.4', uploadedBy: 'Alice Smith', uploadedDate: '2026-01-10', description: 'Governs objectives, authority, scope, and responsibilities of the internal audit charter.' },
  { id: 'doc-2', name: 'Warehouse Materials Inventory Audit Template.xlsx', category: 'Working Paper', fileType: 'xlsx', fileSize: '340 KB', version: 'v2.1', uploadedBy: 'Robert Johnson', uploadedDate: '2026-06-18', description: 'Checklist template for high SKU heavy metals tracking.' },
  { id: 'doc-3', name: 'SOP-WH-092 Security Guidelines.pdf', category: 'SOP', fileType: 'pdf', fileSize: '2.5 MB', version: 'v3.0', uploadedBy: 'Sophia Martinez', uploadedDate: '2025-11-22', description: 'Standard Operating Procedures regarding security vaults and keycards access controls.' }
];

const defaultNotifications: Notification[] = [
  { id: 'not-1', title: 'Upcoming Audit Plan Trigger', message: 'The Disaster Recovery Audit (AUD-2026-002) is scheduled to start on 2026-08-01.', type: 'audit', date: '2026-07-19', isRead: false },
  { id: 'not-2', title: 'Overdue Finding Alert', message: 'Corrective Action CAP-2026-002 is approaching its due date of 2026-07-22 with only 10% progress.', type: 'action', date: '2026-07-18', isRead: false },
  { id: 'not-3', title: 'Critical Finding Logged', message: 'Auditor logged a CRITICAL Finding FND-2026-002 (Security cage unlocked) at Summit Manufacturing.', type: 'finding', date: '2026-07-18', isRead: true }
];

// Initialize DB structure with defaults if empty
export function initLocalStorageDatabase(): void {
  if (!localStorage.getItem('audit_sys_initialized')) {
    setStorage('companies', defaultCompanies);
    setStorage('departments', defaultDepartments);
    setStorage('employees', defaultEmployees);
    setStorage('checklists', defaultChecklists);
    setStorage('audit_plans', defaultAuditPlans);
    setStorage('findings', defaultFindings);
    setStorage('corrective_actions', defaultCorrectiveActions);
    setStorage('ncrs', defaultNCRs);
    setStorage('inventory_audits', defaultInventoryAudits);
    setStorage('cash_audits', defaultCashAudits);
    setStorage('purchasing_audits', defaultPurchasingAudits);
    setStorage('documents', defaultDocuments);
    setStorage('notifications', defaultNotifications);
    setStorage('executions', {}); // Record<auditPlanId, AuditExecution>
    
    // Seed default statements for Bank Reconciliation
    const defaultBankStatements: BankStatementItem[] = [
      { id: 'bs-1', date: '2026-07-01', description: 'Apex Logistics Corp INFLOW', amount: 8500.0, reference: 'REF-889102', isMatched: true, matchedId: 'dr-1' },
      { id: 'bs-2', date: '2026-07-02', description: 'Apex Logistics Corp DEPOSIT', amount: 14200.0, reference: 'REF-889103', isMatched: true, matchedId: 'dr-2' },
      { id: 'bs-3', date: '2026-07-03', description: 'Wire Inbound - Apex', amount: 3500.0, reference: 'REF-992144', isMatched: false },
      { id: 'bs-4', date: '2026-07-05', description: 'Transfer Summit Mfg Group', amount: 1250.0, reference: 'REF-332190', isMatched: false },
      { id: 'bs-5', date: '2026-07-06', description: 'Mischarge Refund Fee', amount: 75.0, reference: 'REF-002931', isMatched: true, matchedId: 'dr-5' },
      { id: 'bs-6', date: '2026-07-07', description: 'Payment Apex Wire DR-99', amount: 5900.0, reference: 'REF-990082', isMatched: false }
    ];
    const defaultDeliveryReceipts: DeliveryReceiptItem[] = [
      { id: 'dr-1', date: '2026-07-01', customerName: 'Apex Logistics Corp', amount: 8500.0, reference: 'REF-889102', isMatched: true, matchedId: 'bs-1' },
      { id: 'dr-2', date: '2026-07-02', customerName: 'Apex Logistics Corp', amount: 14200.0, reference: 'REF-889103', isMatched: true, matchedId: 'bs-2' },
      { id: 'dr-3', date: '2026-07-03', customerName: 'Summit Manufacturing Group', amount: 3500.0, reference: 'REF-992140', isMatched: false }, // Discrepancy ref
      { id: 'dr-4', date: '2026-07-04', customerName: 'Pinnacle Financials LLC', amount: 6500.0, reference: 'REF-229108', isMatched: false },
      { id: 'dr-5', date: '2026-07-06', customerName: 'Bank Charge Adjustment', amount: 75.0, reference: 'REF-002931', isMatched: true, matchedId: 'bs-5' }
    ];

    setStorage('bank_statements', defaultBankStatements);
    setStorage('delivery_receipts', defaultDeliveryReceipts);

    const initialLogs: AuditLog[] = [
      { id: 'log-1', user: 'System Installer', date: '2026-07-19', time: '08:00:00', action: 'Database initialization and seed load', oldValue: '', newValue: 'Successful seeding', module: 'System' }
    ];
    setStorage('audit_logs', initialLogs);

    localStorage.setItem('audit_sys_initialized', 'true');
  }
}

// Global Database API (Normalized CRUD with exact triggers)
export const Database = {
  // --- COMPANIES ---
  getCompanies: () => getStorage<Company[]>('companies', []),
  saveCompany: (company: Company) => {
    const list = Database.getCompanies();
    const existingIndex = list.findIndex((c) => c.id === company.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = company;
      logSystemAction(activeUser, `Updated Company: ${company.name}`, oldVal, JSON.stringify(company), 'Company Module');
    } else {
      list.push(company);
      logSystemAction(activeUser, `Created Company: ${company.name}`, '', JSON.stringify(company), 'Company Module');
    }
    setStorage('companies', list);
    return company;
  },
  deleteCompany: (id: string) => {
    const list = Database.getCompanies();
    const company = list.find((c) => c.id === id);
    if (!company) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((c) => c.id !== id);
    setStorage('companies', filtered);
    logSystemAction(activeUser, `Deleted Company: ${company.name}`, JSON.stringify(company), '', 'Company Module');
    return true;
  },

  // --- DEPARTMENTS ---
  getDepartments: () => getStorage<Department[]>('departments', []),
  saveDepartment: (dept: Department) => {
    const list = Database.getDepartments();
    const existingIndex = list.findIndex((d) => d.id === dept.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = dept;
      logSystemAction(activeUser, `Updated Department: ${dept.name}`, oldVal, JSON.stringify(dept), 'Department Module');
    } else {
      list.push(dept);
      logSystemAction(activeUser, `Created Department: ${dept.name}`, '', JSON.stringify(dept), 'Department Module');
    }
    setStorage('departments', list);
    return dept;
  },
  deleteDepartment: (id: string) => {
    const list = Database.getDepartments();
    const dept = list.find((d) => d.id === id);
    if (!dept) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((d) => d.id !== id);
    setStorage('departments', filtered);
    logSystemAction(activeUser, `Deleted Department: ${dept.name}`, JSON.stringify(dept), '', 'Department Module');
    return true;
  },

  // --- EMPLOYEES ---
  getEmployees: () => getStorage<Employee[]>('employees', []),
  saveEmployee: (emp: Employee) => {
    const list = Database.getEmployees();
    const existingIndex = list.findIndex((e) => e.id === emp.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = emp;
      logSystemAction(activeUser, `Updated Employee: ${emp.fullName}`, oldVal, JSON.stringify(emp), 'Employee Module');
    } else {
      list.push(emp);
      logSystemAction(activeUser, `Created Employee: ${emp.fullName}`, '', JSON.stringify(emp), 'Employee Module');
    }
    setStorage('employees', list);
    return emp;
  },
  deleteEmployee: (id: string) => {
    const list = Database.getEmployees();
    const emp = list.find((e) => e.id === id);
    if (!emp) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((e) => e.id !== id);
    setStorage('employees', filtered);
    logSystemAction(activeUser, `Deleted Employee: ${emp.fullName}`, JSON.stringify(emp), '', 'Employee Module');
    return true;
  },

  // --- AUDIT PLANNING ---
  getAuditPlans: () => getStorage<AuditPlan[]>('audit_plans', []),
  saveAuditPlan: (plan: AuditPlan) => {
    const list = Database.getAuditPlans();
    const existingIndex = list.findIndex((p) => p.id === plan.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = plan;
      logSystemAction(activeUser, `Updated Audit Plan: ${plan.auditNumber}`, oldVal, JSON.stringify(plan), 'Audit Planning');
    } else {
      list.push(plan);
      logSystemAction(activeUser, `Created Audit Plan: ${plan.auditNumber}`, '', JSON.stringify(plan), 'Audit Planning');
      // Create notification
      const notifs = getStorage<Notification[]>('notifications', []);
      notifs.unshift({
        id: `not-${Date.now()}`,
        title: 'New Audit Scheduled',
        message: `${plan.title} (${plan.auditNumber}) has been scheduled for ${plan.startDate}.`,
        type: 'audit',
        date: new Date().toISOString().split('T')[0],
        isRead: false
      });
      setStorage('notifications', notifs);
    }
    setStorage('audit_plans', list);
    return plan;
  },
  deleteAuditPlan: (id: string) => {
    const list = Database.getAuditPlans();
    const plan = list.find((p) => p.id === id);
    if (!plan) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((p) => p.id !== id);
    setStorage('audit_plans', filtered);
    logSystemAction(activeUser, `Deleted Audit Plan: ${plan.auditNumber}`, JSON.stringify(plan), '', 'Audit Planning');
    return true;
  },

  // --- CHECKLIST TEMPLATES ---
  getChecklistTemplates: () => getStorage<ChecklistTemplate[]>('checklists', []),
  saveChecklistTemplate: (tpl: ChecklistTemplate) => {
    const list = Database.getChecklistTemplates();
    const existingIndex = list.findIndex((t) => t.id === tpl.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = tpl;
      logSystemAction(activeUser, `Updated Checklist Template: ${tpl.title}`, oldVal, JSON.stringify(tpl), 'Checklist Module');
    } else {
      list.push(tpl);
      logSystemAction(activeUser, `Created Checklist Template: ${tpl.title}`, '', JSON.stringify(tpl), 'Checklist Module');
    }
    setStorage('checklists', list);
    return tpl;
  },
  deleteChecklistTemplate: (id: string) => {
    const list = Database.getChecklistTemplates();
    const tpl = list.find((t) => t.id === id);
    if (!tpl) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((t) => t.id !== id);
    setStorage('checklists', filtered);
    logSystemAction(activeUser, `Deleted Checklist Template: ${tpl.title}`, JSON.stringify(tpl), '', 'Checklist Module');
    return true;
  },

  // --- AUDIT EXECUTION ---
  getExecutions: () => getStorage<Record<string, AuditExecution>>('executions', {}),
  saveExecution: (exec: AuditExecution) => {
    const records = Database.getExecutions();
    const activeUser = getActiveUser().fullName;
    const oldVal = records[exec.auditPlanId] ? JSON.stringify(records[exec.auditPlanId]) : '';
    records[exec.auditPlanId] = exec;
    setStorage('executions', records);

    logSystemAction(activeUser, `Recorded Execution Answers for AuditPlan: ${exec.auditPlanId}`, oldVal, JSON.stringify(exec), 'Audit Execution');

    // Automatically change audit state to completed if signature is present, or In Progress
    const plans = Database.getAuditPlans();
    const planIndex = plans.findIndex(p => p.id === exec.auditPlanId);
    if (planIndex > -1) {
      const plan = plans[planIndex];
      const hasFailedCheck = Object.values(exec.answers).some((a) => a.status === 'Fail');
      
      // Update plan status
      if (exec.digitalSignature) {
        plan.status = 'Completed';
      } else {
        plan.status = 'In Progress';
      }
      plans[planIndex] = plan;
      setStorage('audit_plans', plans);

      // Trigger automatic finding generation if any answer failed and doesn't already exist
      if (hasFailedCheck) {
        const findings = Database.getFindings();
        Object.entries(exec.answers).forEach(([qId, ans]) => {
          if (ans.status === 'Fail') {
            const hasExisting = findings.some(f => f.auditPlanId === exec.auditPlanId && f.description.includes(ans.remarks));
            if (!hasExisting && ans.remarks) {
              const findNum = `FND-AUTO-${Date.now().toString().slice(-4)}`;
              const newFind: Finding = {
                id: `find-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                findingNumber: findNum,
                auditPlanId: exec.auditPlanId,
                category: 'Automated Checklist Failure',
                description: `Checklist audit failed with critical standard non-conformity. Auditor noted: "${ans.remarks}"`,
                evidenceName: ans.evidenceName || 'checklist_evidence.png',
                rootCause: 'Under Investigation - Auto generated from Checklist Failure.',
                impact: 'To be determined by compliance manager analysis.',
                riskLevel: 'Medium',
                severity: 'Major',
                recommendation: 'Evaluate procedures, execute full preventive controls, and implement immediate Corrective Action Plan.',
                auditorId: plan.leadAuditorId,
                date: new Date().toISOString().split('T')[0],
                status: 'Open'
              };
              findings.push(newFind);
              logSystemAction('System Engine', `Auto-generated Finding: ${findNum}`, '', JSON.stringify(newFind), 'Findings Trigger');
              
              // Trigger auto-generated notification
              const notifs = getStorage<Notification[]>('notifications', []);
              notifs.unshift({
                id: `not-${Date.now()}`,
                title: 'Checklist Finding Registered',
                message: `Automated audit check failure logged finding ${findNum} on Plan ${plan.auditNumber}.`,
                type: 'finding',
                date: new Date().toISOString().split('T')[0],
                isRead: false
              });
              setStorage('notifications', notifs);
            }
          }
        });
        setStorage('findings', findings);
      }
    }
    return exec;
  },

  // --- AUDIT FINDINGS ---
  getFindings: () => getStorage<Finding[]>('findings', []),
  saveFinding: (finding: Finding) => {
    const list = Database.getFindings();
    const existingIndex = list.findIndex((f) => f.id === finding.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = finding;
      logSystemAction(activeUser, `Updated Finding: ${finding.findingNumber}`, oldVal, JSON.stringify(finding), 'Audit Findings');
    } else {
      list.push(finding);
      logSystemAction(activeUser, `Created Finding: ${finding.findingNumber}`, '', JSON.stringify(finding), 'Audit Findings');
      
      // Auto-generate draft NCR for Critical and Major severity findings
      if (finding.severity === 'Critical' || finding.severity === 'Major') {
        const ncrs = Database.getNCRs();
        const ncrExists = ncrs.some((n) => n.findingId === finding.id);
        if (!ncrExists) {
          const plans = Database.getAuditPlans();
          const targetPlan = plans.find(p => p.id === finding.auditPlanId);
          const deptId = targetPlan?.departmentId || 'dept-5';
          const ncrNum = `NCR-${Date.now().toString().slice(-4)}`;
          
          const newNcr: NCR = {
            id: `ncr-${Date.now()}`,
            ncrNumber: ncrNum,
            findingId: finding.id,
            departmentId: deptId,
            description: finding.description,
            rootCause: finding.rootCause || 'Root cause under formal root-cause analysis stage.',
            correctiveAction: finding.recommendation || 'Develop formal Action Plan.',
            preventiveAction: 'Train personnel and implement periodic compliance checklist checkpoints.',
            status: 'Open'
          };
          ncrs.push(newNcr);
          setStorage('ncrs', ncrs);
          logSystemAction('System Engine', `Auto-generated NCR: ${ncrNum}`, '', JSON.stringify(newNcr), 'NCR Trigger');
        }
      }
    }
    setStorage('findings', list);
    return finding;
  },
  deleteFinding: (id: string) => {
    const list = Database.getFindings();
    const finding = list.find((f) => f.id === id);
    if (!finding) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((f) => f.id !== id);
    setStorage('findings', filtered);
    logSystemAction(activeUser, `Deleted Finding: ${finding.findingNumber}`, JSON.stringify(finding), '', 'Audit Findings');
    return true;
  },

  // --- CORRECTIVE ACTIONS ---
  getCorrectiveActions: () => getStorage<CorrectiveAction[]>('corrective_actions', []),
  saveCorrectiveAction: (ca: CorrectiveAction) => {
    const list = Database.getCorrectiveActions();
    const existingIndex = list.findIndex((c) => c.id === ca.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = ca;
      logSystemAction(activeUser, `Updated Corrective Action: ${ca.actionNumber}`, oldVal, JSON.stringify(ca), 'Corrective Action');
    } else {
      list.push(ca);
      logSystemAction(activeUser, `Created Corrective Action: ${ca.actionNumber}`, '', JSON.stringify(ca), 'Corrective Action');
    }
    setStorage('corrective_actions', list);
    return ca;
  },
  deleteCorrectiveAction: (id: string) => {
    const list = Database.getCorrectiveActions();
    const ca = list.find((c) => c.id === id);
    if (!ca) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((c) => c.id !== id);
    setStorage('corrective_actions', filtered);
    logSystemAction(activeUser, `Deleted Corrective Action: ${ca.actionNumber}`, JSON.stringify(ca), '', 'Corrective Action');
    return true;
  },

  // --- NON-CONFORMANCE REPORTS (NCR) ---
  getNCRs: () => getStorage<NCR[]>('ncrs', []),
  saveNCR: (ncr: NCR) => {
    const list = Database.getNCRs();
    const existingIndex = list.findIndex((n) => n.id === ncr.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = ncr;
      logSystemAction(activeUser, `Updated NCR: ${ncr.ncrNumber}`, oldVal, JSON.stringify(ncr), 'Non-Conformance Report');
    } else {
      list.push(ncr);
      logSystemAction(activeUser, `Created NCR: ${ncr.ncrNumber}`, '', JSON.stringify(ncr), 'Non-Conformance Report');
    }
    setStorage('ncrs', list);
    return ncr;
  },
  deleteNCR: (id: string) => {
    const list = Database.getNCRs();
    const ncr = list.find((n) => n.id === id);
    if (!ncr) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((n) => n.id !== id);
    setStorage('ncrs', filtered);
    logSystemAction(activeUser, `Deleted NCR: ${ncr.ncrNumber}`, JSON.stringify(ncr), '', 'Non-Conformance Report');
    return true;
  },

  // --- INVENTORY AUDIT ---
  getInventoryAudits: () => getStorage<InventoryAudit[]>('inventory_audits', []),
  saveInventoryAudit: (inv: InventoryAudit) => {
    const list = Database.getInventoryAudits();
    const existingIndex = list.findIndex((i) => i.id === inv.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = inv;
      logSystemAction(activeUser, `Updated Inventory Audit Item: ${inv.product}`, oldVal, JSON.stringify(inv), 'Inventory Audit');
    } else {
      list.push(inv);
      logSystemAction(activeUser, `Created Inventory Audit Item: ${inv.product}`, '', JSON.stringify(inv), 'Inventory Audit');
    }
    setStorage('inventory_audits', list);
    return inv;
  },
  deleteInventoryAudit: (id: string) => {
    const list = Database.getInventoryAudits();
    const inv = list.find((i) => i.id === id);
    if (!inv) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((i) => i.id !== id);
    setStorage('inventory_audits', filtered);
    logSystemAction(activeUser, `Deleted Inventory Audit Item: ${inv.product}`, JSON.stringify(inv), '', 'Inventory Audit');
    return true;
  },

  // --- CASH AUDIT ---
  getCashAudits: () => getStorage<CashAudit[]>('cash_audits', []),
  saveCashAudit: (cash: CashAudit) => {
    const list = Database.getCashAudits();
    const existingIndex = list.findIndex((c) => c.id === cash.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = cash;
      logSystemAction(activeUser, `Updated Cash Audit Record: ${cash.cashierName}`, oldVal, JSON.stringify(cash), 'Cash Audit');
    } else {
      list.push(cash);
      logSystemAction(activeUser, `Created Cash Audit Record: ${cash.cashierName}`, '', JSON.stringify(cash), 'Cash Audit');
    }
    setStorage('cash_audits', list);
    return cash;
  },
  deleteCashAudit: (id: string) => {
    const list = Database.getCashAudits();
    const cash = list.find((c) => c.id === id);
    if (!cash) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((c) => c.id !== id);
    setStorage('cash_audits', filtered);
    logSystemAction(activeUser, `Deleted Cash Audit Record: ${cash.cashierName}`, JSON.stringify(cash), '', 'Cash Audit');
    return true;
  },

  // --- BANK RECONCILIATION ---
  getBankStatements: () => getStorage<BankStatementItem[]>('bank_statements', []),
  saveBankStatements: (items: BankStatementItem[]) => setStorage('bank_statements', items),
  getDeliveryReceipts: () => getStorage<DeliveryReceiptItem[]>('delivery_receipts', []),
  saveDeliveryReceipts: (items: DeliveryReceiptItem[]) => setStorage('delivery_receipts', items),

  // --- PURCHASING AUDIT ---
  getPurchasingAudits: () => getStorage<PurchasingAudit[]>('purchasing_audits', []),
  savePurchasingAudit: (pa: PurchasingAudit) => {
    const list = Database.getPurchasingAudits();
    const existingIndex = list.findIndex((p) => p.id === pa.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = pa;
      logSystemAction(activeUser, `Updated Purchasing Audit: ${pa.supplier}`, oldVal, JSON.stringify(pa), 'Purchasing Audit');
    } else {
      list.push(pa);
      logSystemAction(activeUser, `Created Purchasing Audit: ${pa.supplier}`, '', JSON.stringify(pa), 'Purchasing Audit');
    }
    setStorage('purchasing_audits', list);
    return pa;
  },
  deletePurchasingAudit: (id: string) => {
    const list = Database.getPurchasingAudits();
    const pa = list.find((p) => p.id === id);
    if (!pa) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((p) => p.id !== id);
    setStorage('purchasing_audits', filtered);
    logSystemAction(activeUser, `Deleted Purchasing Audit: ${pa.supplier}`, JSON.stringify(pa), '', 'Purchasing Audit');
    return true;
  },

  // --- DOCUMENT MANAGEMENT ---
  getDocuments: () => getStorage<Document[]>('documents', []),
  saveDocument: (doc: Document) => {
    const list = Database.getDocuments();
    const existingIndex = list.findIndex((d) => d.id === doc.id);
    const activeUser = getActiveUser().fullName;

    if (existingIndex > -1) {
      const oldVal = JSON.stringify(list[existingIndex]);
      list[existingIndex] = doc;
      logSystemAction(activeUser, `Updated Document: ${doc.name}`, oldVal, JSON.stringify(doc), 'Document Management');
    } else {
      list.push(doc);
      logSystemAction(activeUser, `Created Document: ${doc.name}`, '', JSON.stringify(doc), 'Document Management');
    }
    setStorage('documents', list);
    return doc;
  },
  deleteDocument: (id: string) => {
    const list = Database.getDocuments();
    const doc = list.find((d) => d.id === id);
    if (!doc) return false;
    const activeUser = getActiveUser().fullName;

    const filtered = list.filter((d) => d.id !== id);
    setStorage('documents', filtered);
    logSystemAction(activeUser, `Deleted Document: ${doc.name}`, JSON.stringify(doc), '', 'Document Management');
    return true;
  },

  // --- SYSTEM LOGS & NOTIFICATIONS ---
  getAuditLogs: () => getStorage<AuditLog[]>('audit_logs', []),
  getNotifications: () => getStorage<Notification[]>('notifications', []),
  markNotificationAsRead: (id: string) => {
    const list = Database.getNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx > -1) {
      list[idx].isRead = true;
      setStorage('notifications', list);
    }
  },
  clearAllNotifications: () => {
    setStorage('notifications', []);
  },

  // --- BACKUP & RESTORE DATABASE ---
  backupDatabase: () => {
    const data: Record<string, any> = {};
    const keys = [
      'companies',
      'departments',
      'employees',
      'checklists',
      'audit_plans',
      'findings',
      'corrective_actions',
      'ncrs',
      'inventory_audits',
      'cash_audits',
      'purchasing_audits',
      'documents',
      'notifications',
      'executions',
      'bank_statements',
      'delivery_receipts',
      'audit_logs'
    ];
    keys.forEach((k) => {
      data[k] = localStorage.getItem(`audit_sys_${k}`)
        ? JSON.parse(localStorage.getItem(`audit_sys_${k}`)!)
        : null;
    });
    return JSON.stringify(data, null, 2);
  },

  restoreDatabase: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      Object.entries(data).forEach(([key, val]) => {
        if (val !== null) {
          localStorage.setItem(`audit_sys_${key}`, JSON.stringify(val));
        }
      });
      logSystemAction(getActiveUser().fullName, 'Restored database from external JSON backup', '', 'Full Database Restoration', 'Settings');
      return true;
    } catch (e) {
      console.error('Failed to restore database backup', e);
      return false;
    }
  }
};
