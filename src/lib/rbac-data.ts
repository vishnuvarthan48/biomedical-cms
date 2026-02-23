// ============================================================
// RBAC Types & Mock Data for Multi-Tenant CMMS Platform
// New model: Role -> Resource -> Action (no privileges/menus)
// ============================================================

// --- Types ---
export type TenantStatus = "Draft" | "Active" | "Suspended"
export type UserStatus = "Active" | "Inactive"
export type OrgStatus = "Active" | "Inactive"

export interface Tenant {
  id: string
  name: string
  code: string
  timezone: string
  locale: string
  contactEmail: string
  contactPhone: string
  notes: string
  status: TenantStatus
  createdDate: string
  primaryContact: string
}

export interface TenantUser {
  id: string
  tenantId: string
  name: string
  email: string
  mobile: string
  status: UserStatus
  defaultOrgId: string
  orgMemberships: OrgMembership[]
  mustChangePassword: boolean
  createdDate: string
  lastLogin: string
}

export interface OrgMembership {
  orgId: string
  orgName: string
  status: "Active" | "Inactive"
  roles: string[]
  isDefault: boolean
}

export interface Organization {
  id: string
  tenantId: string
  name: string
  code: string
  address: string
  status: OrgStatus
  usersCount: number
  createdDate: string
}

// --- Resource with hierarchy (parent_id) ---
export interface ResourceDef {
  id: string
  resourceKey: string
  resourceName: string
  parentId: string | null
  description: string
  isActive: boolean
}

// --- Action ---
export interface ActionDef {
  id: string
  actionKey: string
  actionName: string
  description: string
}

// --- Role (permissions are in role_permissions, no more privileges) ---
export interface Role {
  id: string
  tenantId: string
  name: string
  code: string
  description: string
  scope: "Org-level" | "Tenant-level"
  status: "Active" | "Inactive"
  assignedUsersCount: number
}

// --- Role Permission (role + resource + action mapping) ---
export interface RolePermission {
  roleId: string
  resourceId: string
  actionId: string
  isAllowed: boolean
}

export interface AuditLog {
  id: string
  timestamp: string
  actor: string
  tenant: string
  entity: string
  entityType: string
  action: string
  summary: string
}

// --- Seeded Actions ---
export const seededActions: ActionDef[] = [
  { id: "A-01", actionKey: "VIEW", actionName: "View", description: "Read-only access to view records" },
  { id: "A-02", actionKey: "CREATE", actionName: "Create", description: "Create new records" },
  { id: "A-03", actionKey: "UPDATE", actionName: "Update", description: "Modify existing records" },
  { id: "A-04", actionKey: "DELETE", actionName: "Delete", description: "Permanently remove records" },
  { id: "A-05", actionKey: "APPROVE", actionName: "Approve", description: "Approve pending requests or orders" },
  { id: "A-06", actionKey: "ASSIGN", actionName: "Assign", description: "Assign records to users or teams" },
  { id: "A-07", actionKey: "CLOSE", actionName: "Close", description: "Close completed records" },
  { id: "A-08", actionKey: "CANCEL", actionName: "Cancel", description: "Cancel pending records" },
  { id: "A-09", actionKey: "IMPORT", actionName: "Import", description: "Bulk import data from files" },
  { id: "A-10", actionKey: "EXPORT", actionName: "Export", description: "Export data to files or reports" },
  { id: "A-11", actionKey: "PRINT", actionName: "Print", description: "Print records or reports" },
  { id: "A-12", actionKey: "ATTACHMENT_ADD", actionName: "Add Attachment", description: "Upload file attachments to records" },
  { id: "A-13", actionKey: "ATTACHMENT_DELETE", actionName: "Delete Attachment", description: "Remove file attachments from records" },
  { id: "A-14", actionKey: "CONFIGURE", actionName: "Configure", description: "System configuration and settings" },
]

// --- Seeded Resources (hierarchical via parentId) ---
export const seededResources: ResourceDef[] = [
  // Administration Group
  { id: "RES-01", resourceKey: "ADMINISTRATION", resourceName: "Administration", parentId: null, description: "Top-level administration group", isActive: true },
  { id: "RES-02", resourceKey: "TENANT_SETTINGS", resourceName: "Tenant Settings", parentId: "RES-01", description: "Tenant-level configuration and preferences", isActive: true },
  { id: "RES-03", resourceKey: "ORG_SETTINGS", resourceName: "Organization Settings", parentId: "RES-01", description: "Organization-level configuration", isActive: true },
  { id: "RES-04", resourceKey: "USER", resourceName: "User", parentId: "RES-01", description: "User account management", isActive: true },
  { id: "RES-05", resourceKey: "ROLE", resourceName: "Role", parentId: "RES-01", description: "Role definitions and assignments", isActive: true },
  { id: "RES-06", resourceKey: "AUDIT_LOG", resourceName: "Audit Log", parentId: "RES-01", description: "System audit trail and activity logs", isActive: true },

  // Asset Management Group
  { id: "RES-07", resourceKey: "ASSET_MANAGEMENT", resourceName: "Asset Management", parentId: null, description: "Top-level asset management group", isActive: true },
  { id: "RES-08", resourceKey: "ASSET", resourceName: "Asset", parentId: "RES-07", description: "Medical equipment and asset records", isActive: true },
  { id: "RES-09", resourceKey: "ASSET_CATEGORY", resourceName: "Asset Category", parentId: "RES-07", description: "Equipment classification categories", isActive: true },
  { id: "RES-10", resourceKey: "LOCATION", resourceName: "Location", parentId: "RES-07", description: "Physical locations and zones", isActive: true },
  { id: "RES-11", resourceKey: "DEVICE_MASTER", resourceName: "Device Master", parentId: "RES-07", description: "Device catalog and master data", isActive: true },
  { id: "RES-32", resourceKey: "DEPARTMENT", resourceName: "Department", parentId: "RES-07", description: "Department and location mapping", isActive: true },
  { id: "RES-33", resourceKey: "NOTIFICATION_SETTINGS", resourceName: "Notification Settings", parentId: "RES-01", description: "Email, SMS and push notification configuration", isActive: true },

  // Maintenance Group
  { id: "RES-12", resourceKey: "MAINTENANCE", resourceName: "Maintenance", parentId: null, description: "Top-level maintenance group", isActive: true },
  { id: "RES-13", resourceKey: "MAINTENANCE_PLAN", resourceName: "Maintenance Plan (PM)", parentId: "RES-12", description: "Preventive maintenance schedules", isActive: true },
  { id: "RES-14", resourceKey: "WORK_ORDER", resourceName: "Work Order", parentId: "RES-12", description: "Corrective and preventive work orders", isActive: true },
  { id: "RES-15", resourceKey: "WORK_REQUEST", resourceName: "Work Request", parentId: "RES-12", description: "Maintenance service requests", isActive: true },
  { id: "RES-16", resourceKey: "CHECKLIST", resourceName: "Checklist", parentId: "RES-12", description: "Inspection and maintenance checklists", isActive: true },

  // Inventory Group
  { id: "RES-17", resourceKey: "INVENTORY", resourceName: "Inventory", parentId: null, description: "Top-level inventory group", isActive: true },
  { id: "RES-18", resourceKey: "STORE_MASTER", resourceName: "Store Master", parentId: "RES-17", description: "Store / warehouse master data", isActive: true },
  { id: "RES-19", resourceKey: "ITEM_MASTER", resourceName: "Item Master", parentId: "RES-17", description: "Spare parts and consumable items", isActive: true },
  { id: "RES-20", resourceKey: "GRN", resourceName: "Goods Receipt Note", parentId: "RES-17", description: "Goods receipt notes and inbound stock", isActive: true },
  { id: "RES-21", resourceKey: "STOCK_MOVEMENT", resourceName: "Stock Movement", parentId: "RES-17", description: "Inventory stock-in and stock-out records", isActive: true },

  // Operations Group
  { id: "RES-22", resourceKey: "OPERATIONS", resourceName: "Operations", parentId: null, description: "Top-level operations group", isActive: true },
  { id: "RES-23", resourceKey: "VENDOR", resourceName: "Vendor", parentId: "RES-22", description: "Vendor and supplier records", isActive: true },
  { id: "RES-24", resourceKey: "PURCHASE_REQUEST", resourceName: "Purchase Request", parentId: "RES-22", description: "Purchase requisitions", isActive: true },
  { id: "RES-25", resourceKey: "PURCHASE_ORDER", resourceName: "Purchase Order", parentId: "RES-22", description: "Purchase order management", isActive: true },
  { id: "RES-26", resourceKey: "CONTRACT", resourceName: "Contract / AMC", parentId: "RES-22", description: "Service contracts and AMC agreements", isActive: true },
  { id: "RES-27", resourceKey: "ASSET_TRANSFER", resourceName: "Asset Transfer", parentId: "RES-22", description: "Inter-org asset transfer management", isActive: true },

  // Reports & Compliance
  { id: "RES-28", resourceKey: "REPORTS_COMPLIANCE", resourceName: "Reports & Compliance", parentId: null, description: "Top-level reports and compliance group", isActive: true },
  { id: "RES-29", resourceKey: "REPORTS", resourceName: "Reports / Dashboard", parentId: "RES-28", description: "Reports, analytics, and dashboards", isActive: true },
  { id: "RES-30", resourceKey: "COMPLIANCE", resourceName: "Compliance", parentId: "RES-28", description: "Regulatory compliance tracking", isActive: true },
  { id: "RES-31", resourceKey: "DOCUMENTS", resourceName: "Documents", parentId: "RES-28", description: "Document management and attachments", isActive: true },
]

// --- Mock Tenants ---
export const mockTenants: Tenant[] = [
  { id: "T-001", name: "Apollo Hospitals Group", code: "apollo-hospitals", timezone: "Asia/Kolkata", locale: "en-IN", contactEmail: "admin@apollohospitals.com", contactPhone: "+91 44 2829 0200", notes: "Primary hospital chain - Chennai region", status: "Active", createdDate: "2025-06-15", primaryContact: "Dr. Prathap Reddy" },
  { id: "T-002", name: "Fortis Healthcare", code: "fortis-healthcare", timezone: "Asia/Kolkata", locale: "en-IN", contactEmail: "admin@fortishealthcare.com", contactPhone: "+91 11 4713 5000", notes: "Delhi NCR operations", status: "Active", createdDate: "2025-08-20", primaryContact: "Mr. Ashutosh Raghuvanshi" },
  { id: "T-003", name: "Max Healthcare", code: "max-healthcare", timezone: "Asia/Kolkata", locale: "en-IN", contactEmail: "admin@maxhealthcare.com", contactPhone: "+91 11 2651 5050", notes: "", status: "Draft", createdDate: "2026-01-10", primaryContact: "Mr. Abhay Soi" },
  { id: "T-004", name: "Manipal Hospitals", code: "manipal-hospitals", timezone: "Asia/Kolkata", locale: "en-IN", contactEmail: "admin@manipalhospitals.com", contactPhone: "+91 80 2502 4444", notes: "Bangalore operations - under review", status: "Suspended", createdDate: "2025-04-02", primaryContact: "Dr. H. Sudarshan Ballal" },
  { id: "T-005", name: "Narayana Health", code: "narayana-health", timezone: "Asia/Kolkata", locale: "en-IN", contactEmail: "admin@narayanahealth.org", contactPhone: "+91 80 7122 2222", notes: "Multi-city setup pending", status: "Draft", createdDate: "2026-02-01", primaryContact: "Dr. Devi Shetty" },
]

// --- Mock Organizations ---
export const mockOrganizations: Organization[] = [
  { id: "ORG-001", tenantId: "T-001", name: "Apollo Chennai - Main Campus", code: "APL-CHN-MAIN", address: "21 Greams Lane, Chennai 600006", status: "Active", usersCount: 45, createdDate: "2025-06-20" },
  { id: "ORG-002", tenantId: "T-001", name: "Apollo Chennai - OMR Branch", code: "APL-CHN-OMR", address: "OMR Road, Chennai 600096", status: "Active", usersCount: 22, createdDate: "2025-07-05" },
  { id: "ORG-003", tenantId: "T-001", name: "Apollo Hyderabad - Jubilee Hills", code: "APL-HYD-JH", address: "Jubilee Hills, Hyderabad 500033", status: "Active", usersCount: 38, createdDate: "2025-07-15" },
  { id: "ORG-004", tenantId: "T-002", name: "Fortis Gurugram", code: "FRT-GGN", address: "Sector 44, Gurugram 122002", status: "Active", usersCount: 30, createdDate: "2025-08-25" },
  { id: "ORG-005", tenantId: "T-002", name: "Fortis Noida", code: "FRT-NOI", address: "Sector 62, Noida 201301", status: "Inactive", usersCount: 15, createdDate: "2025-09-10" },
]

// --- Mock Users ---
export const mockUsers: TenantUser[] = [
  { id: "U-001", tenantId: "T-001", name: "Arjun Kumar", email: "arjun.kumar@apollohospitals.com", mobile: "+91 98765 43210", status: "Active", defaultOrgId: "ORG-001", mustChangePassword: false, createdDate: "2025-06-20", lastLogin: "2026-02-14", orgMemberships: [
    { orgId: "ORG-001", orgName: "Apollo Chennai - Main Campus", status: "Active", roles: ["R1"], isDefault: true },
    { orgId: "ORG-002", orgName: "Apollo Chennai - OMR Branch", status: "Active", roles: ["R2"], isDefault: false },
  ]},
  { id: "U-002", tenantId: "T-001", name: "Dr. Meena Shankar", email: "meena.s@apollohospitals.com", mobile: "+91 98765 43211", status: "Active", defaultOrgId: "ORG-001", mustChangePassword: false, createdDate: "2025-07-01", lastLogin: "2026-02-13", orgMemberships: [
    { orgId: "ORG-001", orgName: "Apollo Chennai - Main Campus", status: "Active", roles: ["R3"], isDefault: true },
  ]},
  { id: "U-003", tenantId: "T-001", name: "Priya Murugan", email: "priya.m@apollohospitals.com", mobile: "+91 98765 43212", status: "Active", defaultOrgId: "ORG-001", mustChangePassword: false, createdDate: "2025-07-10", lastLogin: "2026-02-14", orgMemberships: [
    { orgId: "ORG-001", orgName: "Apollo Chennai - Main Campus", status: "Active", roles: ["R4"], isDefault: true },
    { orgId: "ORG-003", orgName: "Apollo Hyderabad - Jubilee Hills", status: "Active", roles: ["R4"], isDefault: false },
  ]},
  { id: "U-004", tenantId: "T-001", name: "Ravi Anand", email: "ravi.a@apollohospitals.com", mobile: "+91 98765 43213", status: "Inactive", defaultOrgId: "ORG-002", mustChangePassword: true, createdDate: "2025-08-01", lastLogin: "2025-12-20", orgMemberships: [
    { orgId: "ORG-002", orgName: "Apollo Chennai - OMR Branch", status: "Active", roles: ["R5"], isDefault: true },
  ]},
  { id: "U-005", tenantId: "T-001", name: "Suresh Venkat", email: "suresh.v@apollohospitals.com", mobile: "+91 98765 43214", status: "Active", defaultOrgId: "ORG-001", mustChangePassword: false, createdDate: "2025-07-20", lastLogin: "2026-02-12", orgMemberships: [
    { orgId: "ORG-001", orgName: "Apollo Chennai - Main Campus", status: "Active", roles: ["R6"], isDefault: true },
  ]},
  { id: "U-006", tenantId: "T-001", name: "Kumar Rajendran", email: "kumar.r@apollohospitals.com", mobile: "+91 98765 43215", status: "Active", defaultOrgId: "ORG-003", mustChangePassword: false, createdDate: "2025-09-05", lastLogin: "2026-02-14", orgMemberships: [
    { orgId: "ORG-003", orgName: "Apollo Hyderabad - Jubilee Hills", status: "Active", roles: ["R7", "R8"], isDefault: true },
  ]},
]

// --- Seeded Roles (no more privileges array) ---
export const mockRoles: Role[] = [
  { id: "R1", tenantId: "T-001", name: "Tenant Group Admin", code: "TENANT_GROUP_ADMIN", description: "Full tenant-wide admin with reporting", scope: "Tenant-level", status: "Active", assignedUsersCount: 1 },
  { id: "R2", tenantId: "T-001", name: "Organization Admin", code: "ORG_ADMIN", description: "Org-level user management and settings", scope: "Org-level", status: "Active", assignedUsersCount: 2 },
  { id: "R3", tenantId: "T-001", name: "Maintenance Manager", code: "MAINT_MANAGER", description: "Full maintenance operations and approvals", scope: "Org-level", status: "Active", assignedUsersCount: 3 },
  { id: "R4", tenantId: "T-001", name: "Technician", code: "TECHNICIAN", description: "Work order execution and limited asset viewing", scope: "Org-level", status: "Active", assignedUsersCount: 8 },
  { id: "R5", tenantId: "T-001", name: "Storekeeper", code: "STOREKEEPER", description: "Inventory and spares management", scope: "Org-level", status: "Active", assignedUsersCount: 2 },
  { id: "R6", tenantId: "T-001", name: "Purchase Officer", code: "PURCHASE_OFFICER", description: "Purchasing and vendor management", scope: "Org-level", status: "Active", assignedUsersCount: 1 },
  { id: "R7", tenantId: "T-001", name: "Auditor / Compliance", code: "AUDITOR", description: "Reporting and audit log access", scope: "Org-level", status: "Active", assignedUsersCount: 1 },
  { id: "R8", tenantId: "T-001", name: "Viewer (Read-only)", code: "VIEWER", description: "Read-only access across modules", scope: "Org-level", status: "Active", assignedUsersCount: 4 },
]

// --- Role Permissions (role -> resource -> action) ---
export const mockRolePermissions: RolePermission[] = [
  // R1: Tenant Group Admin - Full admin + reports
  { roleId: "R1", resourceId: "RES-02", actionId: "A-01", isAllowed: true }, // Tenant Settings > View
  { roleId: "R1", resourceId: "RES-02", actionId: "A-03", isAllowed: true }, // Tenant Settings > Update
  { roleId: "R1", resourceId: "RES-02", actionId: "A-14", isAllowed: true }, // Tenant Settings > Configure
  { roleId: "R1", resourceId: "RES-03", actionId: "A-01", isAllowed: true }, // Org Settings > View
  { roleId: "R1", resourceId: "RES-03", actionId: "A-03", isAllowed: true }, // Org Settings > Update
  { roleId: "R1", resourceId: "RES-04", actionId: "A-01", isAllowed: true }, // User > View
  { roleId: "R1", resourceId: "RES-04", actionId: "A-02", isAllowed: true }, // User > Create
  { roleId: "R1", resourceId: "RES-04", actionId: "A-03", isAllowed: true }, // User > Update
  { roleId: "R1", resourceId: "RES-04", actionId: "A-04", isAllowed: true }, // User > Delete
  { roleId: "R1", resourceId: "RES-05", actionId: "A-01", isAllowed: true }, // Role > View
  { roleId: "R1", resourceId: "RES-05", actionId: "A-02", isAllowed: true }, // Role > Create
  { roleId: "R1", resourceId: "RES-05", actionId: "A-03", isAllowed: true }, // Role > Update
  { roleId: "R1", resourceId: "RES-05", actionId: "A-04", isAllowed: true }, // Role > Delete
  { roleId: "R1", resourceId: "RES-06", actionId: "A-01", isAllowed: true }, // Audit Log > View
  { roleId: "R1", resourceId: "RES-06", actionId: "A-10", isAllowed: true }, // Audit Log > Export
  { roleId: "R1", resourceId: "RES-29", actionId: "A-01", isAllowed: true }, // Reports > View
  { roleId: "R1", resourceId: "RES-29", actionId: "A-10", isAllowed: true }, // Reports > Export

  // R2: Organization Admin
  { roleId: "R2", resourceId: "RES-03", actionId: "A-01", isAllowed: true },  // Org Settings > View
  { roleId: "R2", resourceId: "RES-03", actionId: "A-03", isAllowed: true },  // Org Settings > Update
  { roleId: "R2", resourceId: "RES-04", actionId: "A-01", isAllowed: true },  // User > View
  { roleId: "R2", resourceId: "RES-04", actionId: "A-02", isAllowed: true },  // User > Create
  { roleId: "R2", resourceId: "RES-04", actionId: "A-03", isAllowed: true },  // User > Update
  { roleId: "R2", resourceId: "RES-05", actionId: "A-01", isAllowed: true },  // Role > View
  { roleId: "R2", resourceId: "RES-06", actionId: "A-01", isAllowed: true },  // Audit Log > View
  { roleId: "R2", resourceId: "RES-10", actionId: "A-01", isAllowed: true },  // Location > View
  { roleId: "R2", resourceId: "RES-10", actionId: "A-02", isAllowed: true },  // Location > Create
  { roleId: "R2", resourceId: "RES-10", actionId: "A-03", isAllowed: true },  // Location > Update
  { roleId: "R2", resourceId: "RES-10", actionId: "A-04", isAllowed: true },  // Location > Delete
  { roleId: "R2", resourceId: "RES-32", actionId: "A-01", isAllowed: true },  // Department > View
  { roleId: "R2", resourceId: "RES-32", actionId: "A-02", isAllowed: true },  // Department > Create
  { roleId: "R2", resourceId: "RES-32", actionId: "A-03", isAllowed: true },  // Department > Update
  { roleId: "R2", resourceId: "RES-32", actionId: "A-04", isAllowed: true },  // Department > Delete
  { roleId: "R2", resourceId: "RES-33", actionId: "A-01", isAllowed: true },  // Notification Settings > View
  { roleId: "R2", resourceId: "RES-33", actionId: "A-14", isAllowed: true },  // Notification Settings > Configure
  { roleId: "R2", resourceId: "RES-29", actionId: "A-01", isAllowed: true },  // Reports > View
  { roleId: "R2", resourceId: "RES-29", actionId: "A-10", isAllowed: true },  // Reports > Export

  // R3: Maintenance Manager
  { roleId: "R3", resourceId: "RES-14", actionId: "A-01", isAllowed: true }, // Work Order > View
  { roleId: "R3", resourceId: "RES-14", actionId: "A-02", isAllowed: true }, // Work Order > Create
  { roleId: "R3", resourceId: "RES-14", actionId: "A-03", isAllowed: true }, // Work Order > Update
  { roleId: "R3", resourceId: "RES-14", actionId: "A-05", isAllowed: true }, // Work Order > Approve
  { roleId: "R3", resourceId: "RES-14", actionId: "A-06", isAllowed: true }, // Work Order > Assign
  { roleId: "R3", resourceId: "RES-14", actionId: "A-07", isAllowed: true }, // Work Order > Close
  { roleId: "R3", resourceId: "RES-15", actionId: "A-01", isAllowed: true }, // Work Request > View
  { roleId: "R3", resourceId: "RES-15", actionId: "A-02", isAllowed: true },
  { roleId: "R3", resourceId: "RES-15", actionId: "A-03", isAllowed: true },
  { roleId: "R3", resourceId: "RES-08", actionId: "A-01", isAllowed: true }, // Asset > View
  { roleId: "R3", resourceId: "RES-08", actionId: "A-02", isAllowed: true },
  { roleId: "R3", resourceId: "RES-08", actionId: "A-03", isAllowed: true },
  { roleId: "R3", resourceId: "RES-08", actionId: "A-04", isAllowed: true },
  { roleId: "R3", resourceId: "RES-13", actionId: "A-01", isAllowed: true }, // PM > View
  { roleId: "R3", resourceId: "RES-13", actionId: "A-02", isAllowed: true },
  { roleId: "R3", resourceId: "RES-13", actionId: "A-03", isAllowed: true },
  { roleId: "R3", resourceId: "RES-13", actionId: "A-04", isAllowed: true },
  { roleId: "R3", resourceId: "RES-29", actionId: "A-01", isAllowed: true },
  { roleId: "R3", resourceId: "RES-29", actionId: "A-10", isAllowed: true },

  // R4: Technician
  { roleId: "R4", resourceId: "RES-14", actionId: "A-01", isAllowed: true },
  { roleId: "R4", resourceId: "RES-14", actionId: "A-02", isAllowed: true },
  { roleId: "R4", resourceId: "RES-14", actionId: "A-03", isAllowed: true },
  { roleId: "R4", resourceId: "RES-14", actionId: "A-07", isAllowed: true },
  { roleId: "R4", resourceId: "RES-15", actionId: "A-01", isAllowed: true },
  { roleId: "R4", resourceId: "RES-15", actionId: "A-02", isAllowed: true },
  { roleId: "R4", resourceId: "RES-08", actionId: "A-01", isAllowed: true },

  // R5: Storekeeper
  { roleId: "R5", resourceId: "RES-18", actionId: "A-01", isAllowed: true },
  { roleId: "R5", resourceId: "RES-18", actionId: "A-02", isAllowed: true },
  { roleId: "R5", resourceId: "RES-18", actionId: "A-03", isAllowed: true },
  { roleId: "R5", resourceId: "RES-19", actionId: "A-01", isAllowed: true },
  { roleId: "R5", resourceId: "RES-19", actionId: "A-02", isAllowed: true },
  { roleId: "R5", resourceId: "RES-19", actionId: "A-03", isAllowed: true },
  { roleId: "R5", resourceId: "RES-19", actionId: "A-04", isAllowed: true },
  { roleId: "R5", resourceId: "RES-20", actionId: "A-01", isAllowed: true },
  { roleId: "R5", resourceId: "RES-20", actionId: "A-02", isAllowed: true },
  { roleId: "R5", resourceId: "RES-21", actionId: "A-01", isAllowed: true },
  { roleId: "R5", resourceId: "RES-21", actionId: "A-02", isAllowed: true },
  { roleId: "R5", resourceId: "RES-21", actionId: "A-10", isAllowed: true },
  { roleId: "R5", resourceId: "RES-29", actionId: "A-01", isAllowed: true },

  // R6: Purchase Officer
  { roleId: "R6", resourceId: "RES-25", actionId: "A-01", isAllowed: true },
  { roleId: "R6", resourceId: "RES-25", actionId: "A-02", isAllowed: true },
  { roleId: "R6", resourceId: "RES-25", actionId: "A-03", isAllowed: true },
  { roleId: "R6", resourceId: "RES-25", actionId: "A-05", isAllowed: true },
  { roleId: "R6", resourceId: "RES-23", actionId: "A-01", isAllowed: true },
  { roleId: "R6", resourceId: "RES-23", actionId: "A-02", isAllowed: true },
  { roleId: "R6", resourceId: "RES-23", actionId: "A-03", isAllowed: true },
  { roleId: "R6", resourceId: "RES-23", actionId: "A-04", isAllowed: true },
  { roleId: "R6", resourceId: "RES-29", actionId: "A-01", isAllowed: true },

  // R7: Auditor / Compliance
  { roleId: "R7", resourceId: "RES-06", actionId: "A-01", isAllowed: true },
  { roleId: "R7", resourceId: "RES-06", actionId: "A-10", isAllowed: true },
  { roleId: "R7", resourceId: "RES-29", actionId: "A-01", isAllowed: true },
  { roleId: "R7", resourceId: "RES-29", actionId: "A-10", isAllowed: true },
  { roleId: "R7", resourceId: "RES-30", actionId: "A-01", isAllowed: true },

  // R8: Viewer (Read-only)
  { roleId: "R8", resourceId: "RES-08", actionId: "A-01", isAllowed: true },
  { roleId: "R8", resourceId: "RES-14", actionId: "A-01", isAllowed: true },
  { roleId: "R8", resourceId: "RES-29", actionId: "A-01", isAllowed: true },
]

// --- Mock Audit Logs ---
export const mockAuditLogs: AuditLog[] = [
  { id: "AL-001", timestamp: "2026-02-14 09:32:15", actor: "Platform Admin", tenant: "Apollo Hospitals Group", entity: "Tenant T-001", entityType: "Tenant", action: "UPDATE", summary: "Status changed from Draft to Active" },
  { id: "AL-002", timestamp: "2026-02-14 09:15:00", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "User U-004 (Ravi Anand)", entityType: "User", action: "UPDATE", summary: "Status changed to Inactive" },
  { id: "AL-003", timestamp: "2026-02-13 16:45:30", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "Role R4 (Technician)", entityType: "Role", action: "UPDATE", summary: "Added permission: Asset > View" },
  { id: "AL-004", timestamp: "2026-02-13 14:22:00", actor: "Platform Admin", tenant: "Max Healthcare", entity: "Tenant T-003", entityType: "Tenant", action: "CREATE", summary: "New tenant created as Draft" },
  { id: "AL-005", timestamp: "2026-02-13 11:30:45", actor: "Dr. Meena Shankar", tenant: "Apollo Hospitals Group", entity: "Org ORG-002", entityType: "Organization", action: "UPDATE", summary: "Address updated" },
  { id: "AL-006", timestamp: "2026-02-12 17:50:00", actor: "Platform Admin", tenant: "Manipal Hospitals", entity: "Tenant T-004", entityType: "Tenant", action: "UPDATE", summary: "Status changed to Suspended" },
  { id: "AL-007", timestamp: "2026-02-12 15:10:20", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "User U-003 (Priya Murugan)", entityType: "User", action: "UPDATE", summary: "Added org membership: ORG-003" },
  { id: "AL-008", timestamp: "2026-02-12 10:05:00", actor: "Platform Admin", tenant: "Fortis Healthcare", entity: "User (Admin Reset)", entityType: "User", action: "RESET_PASSWORD", summary: "Admin password regenerated for tenant admin" },
  { id: "AL-009", timestamp: "2026-02-11 13:20:00", actor: "Suresh Venkat", tenant: "Apollo Hospitals Group", entity: "Purchase Order PO-100", entityType: "Purchase", action: "APPROVE", summary: "Purchase order approved for Philips parts" },
  { id: "AL-010", timestamp: "2026-02-11 09:00:00", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "Resource RES-27", entityType: "Resource", action: "CREATE", summary: "Added Asset Transfer resource under Operations" },
]

// Helper: get children of a resource
export function getResourceChildren(parentId: string): ResourceDef[] {
  return seededResources.filter(r => r.parentId === parentId)
}

// Helper: get top-level resources
export function getTopLevelResources(): ResourceDef[] {
  return seededResources.filter(r => r.parentId === null)
}

// Helper: get permissions for a role
export function getRolePermissions(roleId: string): RolePermission[] {
  return mockRolePermissions.filter(rp => rp.roleId === roleId)
}

// Helper: check if a role has permission
export function hasPermission(roleId: string, resourceId: string, actionId: string): boolean {
  return mockRolePermissions.some(rp => rp.roleId === roleId && rp.resourceId === resourceId && rp.actionId === actionId && rp.isAllowed)
}
