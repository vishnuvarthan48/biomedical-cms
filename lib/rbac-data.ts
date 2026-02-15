// ============================================================
// RBAC Types & Mock Data for Multi-Tenant CMMS Platform
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

export interface Role {
  id: string
  tenantId: string
  name: string
  code: string
  description: string
  scope: "Org-level"
  status: "Active" | "Inactive"
  privileges: string[]
  assignedUsersCount: number
}

export interface Privilege {
  id: string
  tenantId: string
  name: string
  code: string
  description: string
  status: "Active" | "Inactive"
  menus: string[]
  permissions: Permission[]
}

export interface Permission {
  resource: string
  actions: string[]
}

export interface MenuItem {
  id: string
  tenantId: string
  title: string
  route: string
  icon: string
  parentId: string | null
  sortOrder: number
  status: "Active" | "Inactive"
  children?: MenuItem[]
  privilegeIds: string[]
}

export interface ResourceDef {
  code: string
  name: string
  description: string
  status: "Active" | "Inactive"
}

export interface ActionDef {
  code: string
  name: string
  description: string
  status: "Active" | "Inactive"
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
  { code: "VIEW", name: "View", description: "Read-only access to view records", status: "Active" },
  { code: "CREATE", name: "Create", description: "Create new records", status: "Active" },
  { code: "UPDATE", name: "Update", description: "Modify existing records", status: "Active" },
  { code: "DELETE", name: "Delete", description: "Permanently remove records", status: "Active" },
  { code: "APPROVE", name: "Approve", description: "Approve pending requests or orders", status: "Active" },
  { code: "ASSIGN", name: "Assign", description: "Assign records to users or teams", status: "Active" },
  { code: "CLOSE", name: "Close", description: "Close completed records", status: "Active" },
  { code: "CANCEL", name: "Cancel", description: "Cancel pending records", status: "Active" },
  { code: "IMPORT", name: "Import", description: "Bulk import data from files", status: "Active" },
  { code: "EXPORT", name: "Export", description: "Export data to files or reports", status: "Active" },
  { code: "PRINT", name: "Print", description: "Print records or reports", status: "Active" },
  { code: "ATTACHMENT_ADD", name: "Add Attachment", description: "Upload file attachments to records", status: "Active" },
  { code: "ATTACHMENT_DELETE", name: "Delete Attachment", description: "Remove file attachments from records", status: "Active" },
  { code: "CONFIGURE", name: "Configure", description: "System configuration and settings", status: "Active" },
]

// --- Seeded Resources ---
export const seededResources: ResourceDef[] = [
  { code: "TENANT_SETTINGS", name: "Tenant Settings", description: "Tenant-level configuration and preferences", status: "Active" },
  { code: "ORG_SETTINGS", name: "Organization Settings", description: "Organization-level configuration", status: "Active" },
  { code: "USER", name: "User", description: "User account management", status: "Active" },
  { code: "ROLE", name: "Role", description: "Role definitions and assignments", status: "Active" },
  { code: "PRIVILEGE", name: "Privilege", description: "Privilege bundles with permissions", status: "Active" },
  { code: "MENU", name: "Menu", description: "Navigation menu structure", status: "Active" },
  { code: "AUDIT_LOG", name: "Audit Log", description: "System audit trail and activity logs", status: "Active" },
  { code: "ASSET", name: "Asset", description: "Medical equipment and asset records", status: "Active" },
  { code: "ASSET_CATEGORY", name: "Asset Category", description: "Equipment classification categories", status: "Active" },
  { code: "LOCATION", name: "Location", description: "Physical locations and zones", status: "Active" },
  { code: "MAINTENANCE_PLAN", name: "Maintenance Plan (PM)", description: "Preventive maintenance schedules", status: "Active" },
  { code: "WORK_ORDER", name: "Work Order", description: "Corrective and preventive work orders", status: "Active" },
  { code: "WORK_REQUEST", name: "Work Request", description: "Maintenance service requests", status: "Active" },
  { code: "CHECKLIST", name: "Checklist", description: "Inspection and maintenance checklists", status: "Active" },
  { code: "SPARE_ITEM", name: "Spare Item (Inventory)", description: "Spare parts and consumable inventory", status: "Active" },
  { code: "STOCK_MOVEMENT", name: "Stock Movement", description: "Inventory stock-in and stock-out records", status: "Active" },
  { code: "PURCHASE_REQUEST", name: "Purchase Request", description: "Purchase requisitions", status: "Active" },
  { code: "PURCHASE_ORDER", name: "Purchase Order", description: "Purchase order management", status: "Active" },
  { code: "VENDOR", name: "Vendor", description: "Vendor and supplier records", status: "Active" },
  { code: "CONTRACT", name: "Contract / AMC", description: "Service contracts and AMC agreements", status: "Active" },
  { code: "REPORTS", name: "Reports / Dashboard", description: "Reports, analytics, and dashboards", status: "Active" },
  { code: "DOCUMENTS", name: "Documents", description: "Document management and attachments", status: "Active" },
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

// --- Seeded Privileges ---
export const mockPrivileges: Privilege[] = [
  { id: "P1", tenantId: "T-001", name: "Tenant Administration", code: "TENANT_ADMIN", description: "Full tenant-level administration including settings, orgs, users, roles, and audit logs", status: "Active",
    menus: ["Tenant Settings", "Organizations", "Users", "Roles", "Privileges", "Menus", "Audit Logs"],
    permissions: [
      { resource: "TENANT_SETTINGS", actions: ["VIEW", "UPDATE"] },
      { resource: "ORG_SETTINGS", actions: ["VIEW", "UPDATE"] },
      { resource: "USER", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "ROLE", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "PRIVILEGE", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "MENU", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "AUDIT_LOG", actions: ["VIEW", "EXPORT"] },
    ]},
  { id: "P2", tenantId: "T-001", name: "Organization Administration", code: "ORG_ADMIN", description: "Org-level settings, users, and role assignment", status: "Active",
    menus: ["Org Settings", "Org Users", "Role Assignment"],
    permissions: [
      { resource: "ORG_SETTINGS", actions: ["VIEW", "UPDATE"] },
      { resource: "USER", actions: ["VIEW", "CREATE", "UPDATE"] },
      { resource: "ROLE", actions: ["VIEW"] },
      { resource: "AUDIT_LOG", actions: ["VIEW"] },
    ]},
  { id: "P3", tenantId: "T-001", name: "Work Order Management", code: "WO_MGMT", description: "Create, assign, update, and close work orders", status: "Active",
    menus: ["Work Orders", "Work Requests"],
    permissions: [
      { resource: "WORK_ORDER", actions: ["VIEW", "CREATE", "UPDATE", "ASSIGN", "CLOSE"] },
      { resource: "WORK_REQUEST", actions: ["VIEW", "CREATE", "UPDATE"] },
    ]},
  { id: "P4", tenantId: "T-001", name: "Work Order Approval", code: "WO_APPROVAL", description: "Approve or cancel work orders", status: "Active",
    menus: ["Approvals"],
    permissions: [
      { resource: "WORK_ORDER", actions: ["APPROVE", "CANCEL"] },
    ]},
  { id: "P5", tenantId: "T-001", name: "Asset Management", code: "ASSET_MGMT", description: "Full asset lifecycle management including categories and locations", status: "Active",
    menus: ["Assets", "Locations", "Categories"],
    permissions: [
      { resource: "ASSET", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "ASSET_CATEGORY", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "LOCATION", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "DOCUMENTS", actions: ["ATTACHMENT_ADD", "ATTACHMENT_DELETE"] },
    ]},
  { id: "P6", tenantId: "T-001", name: "Preventive Maintenance", code: "PM_MGMT", description: "Create and manage PM plans and schedules", status: "Active",
    menus: ["PM Plans", "Schedules"],
    permissions: [
      { resource: "MAINTENANCE_PLAN", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "WORK_ORDER", actions: ["CREATE", "VIEW"] },
    ]},
  { id: "P7", tenantId: "T-001", name: "Inventory & Spares", code: "INV_MGMT", description: "Manage spare items and stock movements", status: "Active",
    menus: ["Spares", "Stock"],
    permissions: [
      { resource: "SPARE_ITEM", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
      { resource: "STOCK_MOVEMENT", actions: ["VIEW", "CREATE", "EXPORT"] },
    ]},
  { id: "P8", tenantId: "T-001", name: "Purchasing", code: "PURCHASE_MGMT", description: "Manage purchase orders and vendors", status: "Active",
    menus: ["Purchase Orders", "Vendors"],
    permissions: [
      { resource: "PURCHASE_ORDER", actions: ["VIEW", "CREATE", "UPDATE", "APPROVE"] },
      { resource: "VENDOR", actions: ["VIEW", "CREATE", "UPDATE", "DELETE"] },
    ]},
  { id: "P9", tenantId: "T-001", name: "Reporting", code: "REPORTING", description: "Access reports and dashboards", status: "Active",
    menus: ["Reports", "Dashboard"],
    permissions: [
      { resource: "REPORTS", actions: ["VIEW", "EXPORT"] },
    ]},
  { id: "P10", tenantId: "T-001", name: "Read-only Operator", code: "READONLY", description: "View-only access to assets, work orders, and reports", status: "Active",
    menus: ["Assets", "Work Orders", "Reports"],
    permissions: [
      { resource: "ASSET", actions: ["VIEW"] },
      { resource: "WORK_ORDER", actions: ["VIEW"] },
      { resource: "REPORTS", actions: ["VIEW"] },
    ]},
]

// --- Seeded Roles ---
export const mockRoles: Role[] = [
  { id: "R1", tenantId: "T-001", name: "Tenant Group Admin", code: "TENANT_GROUP_ADMIN", description: "Full tenant-wide admin with reporting", scope: "Org-level", status: "Active", privileges: ["P1", "P9"], assignedUsersCount: 1 },
  { id: "R2", tenantId: "T-001", name: "Organization Admin", code: "ORG_ADMIN", description: "Org-level user management and settings", scope: "Org-level", status: "Active", privileges: ["P2", "P9"], assignedUsersCount: 2 },
  { id: "R3", tenantId: "T-001", name: "Maintenance Manager", code: "MAINT_MANAGER", description: "Full maintenance operations and approvals", scope: "Org-level", status: "Active", privileges: ["P3", "P4", "P5", "P6", "P9"], assignedUsersCount: 3 },
  { id: "R4", tenantId: "T-001", name: "Technician", code: "TECHNICIAN", description: "Work order execution and limited asset viewing", scope: "Org-level", status: "Active", privileges: ["P3"], assignedUsersCount: 8 },
  { id: "R5", tenantId: "T-001", name: "Storekeeper", code: "STOREKEEPER", description: "Inventory and spares management", scope: "Org-level", status: "Active", privileges: ["P7", "P9"], assignedUsersCount: 2 },
  { id: "R6", tenantId: "T-001", name: "Purchase Officer", code: "PURCHASE_OFFICER", description: "Purchasing and vendor management", scope: "Org-level", status: "Active", privileges: ["P8", "P9"], assignedUsersCount: 1 },
  { id: "R7", tenantId: "T-001", name: "Auditor / Compliance", code: "AUDITOR", description: "Reporting and audit log access", scope: "Org-level", status: "Active", privileges: ["P9"], assignedUsersCount: 1 },
  { id: "R8", tenantId: "T-001", name: "Viewer (Read-only)", code: "VIEWER", description: "Read-only access across modules", scope: "Org-level", status: "Active", privileges: ["P10"], assignedUsersCount: 4 },
]

// --- Mock Menus ---
export const mockMenus: MenuItem[] = [
  { id: "M-001", tenantId: "T-001", title: "Dashboard", route: "/dashboard", icon: "LayoutDashboard", parentId: null, sortOrder: 1, status: "Active", privilegeIds: ["P9"], children: [] },
  { id: "M-002", tenantId: "T-001", title: "Asset Management", route: "/assets", icon: "Wrench", parentId: null, sortOrder: 2, status: "Active", privilegeIds: ["P5"], children: [
    { id: "M-002-1", tenantId: "T-001", title: "Assets", route: "/assets/list", icon: "", parentId: "M-002", sortOrder: 1, status: "Active", privilegeIds: ["P5"] },
    { id: "M-002-2", tenantId: "T-001", title: "Categories", route: "/assets/categories", icon: "", parentId: "M-002", sortOrder: 2, status: "Active", privilegeIds: ["P5"] },
    { id: "M-002-3", tenantId: "T-001", title: "Locations", route: "/assets/locations", icon: "", parentId: "M-002", sortOrder: 3, status: "Active", privilegeIds: ["P5"] },
  ]},
  { id: "M-003", tenantId: "T-001", title: "Work Orders", route: "/work-orders", icon: "ClipboardList", parentId: null, sortOrder: 3, status: "Active", privilegeIds: ["P3"], children: [] },
  { id: "M-004", tenantId: "T-001", title: "Preventive Maintenance", route: "/pm", icon: "CalendarClock", parentId: null, sortOrder: 4, status: "Active", privilegeIds: ["P6"], children: [] },
  { id: "M-005", tenantId: "T-001", title: "Inventory", route: "/inventory", icon: "Package", parentId: null, sortOrder: 5, status: "Active", privilegeIds: ["P7"], children: [] },
  { id: "M-006", tenantId: "T-001", title: "Administration", route: "/admin", icon: "Shield", parentId: null, sortOrder: 10, status: "Active", privilegeIds: ["P1"], children: [
    { id: "M-006-1", tenantId: "T-001", title: "Organizations", route: "/admin/orgs", icon: "", parentId: "M-006", sortOrder: 1, status: "Active", privilegeIds: ["P1"] },
    { id: "M-006-2", tenantId: "T-001", title: "Users", route: "/admin/users", icon: "", parentId: "M-006", sortOrder: 2, status: "Active", privilegeIds: ["P1"] },
    { id: "M-006-3", tenantId: "T-001", title: "Roles", route: "/admin/roles", icon: "", parentId: "M-006", sortOrder: 3, status: "Active", privilegeIds: ["P1"] },
    { id: "M-006-4", tenantId: "T-001", title: "Privileges", route: "/admin/privileges", icon: "", parentId: "M-006", sortOrder: 4, status: "Active", privilegeIds: ["P1"] },
    { id: "M-006-5", tenantId: "T-001", title: "Menus", route: "/admin/menus", icon: "", parentId: "M-006", sortOrder: 5, status: "Active", privilegeIds: ["P1"] },
  ]},
]

// --- Mock Audit Logs ---
export const mockAuditLogs: AuditLog[] = [
  { id: "AL-001", timestamp: "2026-02-14 09:32:15", actor: "Platform Admin", tenant: "Apollo Hospitals Group", entity: "Tenant T-001", entityType: "Tenant", action: "UPDATE", summary: "Status changed from Draft to Active" },
  { id: "AL-002", timestamp: "2026-02-14 09:15:00", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "User U-004 (Ravi Anand)", entityType: "User", action: "UPDATE", summary: "Status changed to Inactive" },
  { id: "AL-003", timestamp: "2026-02-13 16:45:30", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "Role R4 (Technician)", entityType: "Role", action: "UPDATE", summary: "Added privilege P5 (Asset Management)" },
  { id: "AL-004", timestamp: "2026-02-13 14:22:00", actor: "Platform Admin", tenant: "Max Healthcare", entity: "Tenant T-003", entityType: "Tenant", action: "CREATE", summary: "New tenant created as Draft" },
  { id: "AL-005", timestamp: "2026-02-13 11:30:45", actor: "Dr. Meena Shankar", tenant: "Apollo Hospitals Group", entity: "Org ORG-002", entityType: "Organization", action: "UPDATE", summary: "Address updated" },
  { id: "AL-006", timestamp: "2026-02-12 17:50:00", actor: "Platform Admin", tenant: "Manipal Hospitals", entity: "Tenant T-004", entityType: "Tenant", action: "UPDATE", summary: "Status changed to Suspended" },
  { id: "AL-007", timestamp: "2026-02-12 15:10:20", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "User U-003 (Priya Murugan)", entityType: "User", action: "UPDATE", summary: "Added org membership: ORG-003" },
  { id: "AL-008", timestamp: "2026-02-12 10:05:00", actor: "Platform Admin", tenant: "Fortis Healthcare", entity: "User (Admin Reset)", entityType: "User", action: "RESET_PASSWORD", summary: "Admin password regenerated for tenant admin" },
  { id: "AL-009", timestamp: "2026-02-11 13:20:00", actor: "Suresh Venkat", tenant: "Apollo Hospitals Group", entity: "Purchase Order PO-100", entityType: "Purchase", action: "APPROVE", summary: "Purchase order approved for Philips parts" },
  { id: "AL-010", timestamp: "2026-02-11 09:00:00", actor: "Arjun Kumar", tenant: "Apollo Hospitals Group", entity: "Menu M-006", entityType: "Menu", action: "UPDATE", summary: "Reordered administration submenu items" },
]
