-- ============================================================================
-- RESOURCES TABLE AND RELATED MASTER DATA
-- Device Management Resources Hierarchy
-- ============================================================================

-- 1. RESOURCES TABLE (with hierarchy support for parent-child relationships)
CREATE TABLE IF NOT EXISTS resources (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    resource_key    VARCHAR(200)  NOT NULL UNIQUE,
    resource_name   VARCHAR(200)  NOT NULL,
    resource_type   VARCHAR(50)   NOT NULL DEFAULT 'MODULE'
                        CHECK (resource_type IN ('MODULE', 'ENTITY', 'OPERATION')),
    parent_id       BIGINT        NULL,
    description     VARCHAR(500),
    icon_key        VARCHAR(100),
    sort_order      INTEGER       DEFAULT 100,
    is_active       VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE'
                        CHECK (is_active IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_resources_parent
        FOREIGN KEY (parent_id)
        REFERENCES resources(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_resources_parent ON resources(parent_id);
CREATE INDEX IF NOT EXISTS idx_resources_key    ON resources(resource_key);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(is_active);
CREATE INDEX IF NOT EXISTS idx_resources_type   ON resources(resource_type);


-- 2. ACTIONS TABLE (seeded with standard CRUD + custom actions)
CREATE TABLE IF NOT EXISTS actions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action_key      VARCHAR(100)  NOT NULL UNIQUE,
    action_name     VARCHAR(200)  NOT NULL,
    description     VARCHAR(500),
    action_category VARCHAR(50)   NOT NULL DEFAULT 'STANDARD'
                        CHECK (action_category IN ('STANDARD', 'CUSTOM', 'SYSTEM')),
    is_active       VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE'
                        CHECK (is_active IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_key ON actions(action_key);
CREATE INDEX IF NOT EXISTS idx_actions_active ON actions(is_active);


-- ============================================================================
-- SEED DATA: RESOURCES (Master list of all modules/entities in the system)
-- ============================================================================

-- Top-level modules
INSERT INTO resources (resource_key, resource_name, resource_type, description, sort_order, is_active)
VALUES
    ('ASSET_MGMT', 'Asset Management', 'MODULE', 'Register, track, and manage medical devices and equipment', 10, 'ACTIVE'),
    ('MAINTENANCE', 'Maintenance', 'MODULE', 'PM schedules, work orders, and maintenance tracking', 20, 'ACTIVE'),
    ('WARRANTY_AMC', 'Warranty & AMC', 'MODULE', 'Warranty and AMC contract management', 30, 'ACTIVE'),
    ('COMPLIANCE', 'Compliance', 'MODULE', 'Safety tests, calibration, and regulatory compliance', 40, 'ACTIVE'),
    ('NOTIFICATIONS', 'Notifications', 'MODULE', 'Event-driven notifications and alerts', 50, 'ACTIVE'),
    ('RBAC', 'Role-Based Access Control', 'MODULE', 'Users, roles, permissions, and tenant management', 60, 'ACTIVE'),
    ('LOCATION_MGMT', 'Location Management', 'MODULE', 'Hospital, clinic, departments, floors, rooms, beds', 70, 'ACTIVE'),
    ('REPORTS', 'Reports & Analytics', 'MODULE', 'Device reports, compliance dashboards, analytics', 80, 'ACTIVE')
ON CONFLICT (resource_key) DO NOTHING;

-- Asset Management Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'ASSET', 'Asset', 'ENTITY',
    id, 'Device/equipment master records',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'ASSET_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'DEVICE_TYPE', 'Device Type', 'ENTITY',
    id, 'Device type classifications (Defibrillator, Ventilator, etc.)',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'ASSET_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'MANUFACTURER', 'Manufacturer', 'ENTITY',
    id, 'Device manufacturers and vendors',
    30, 'ACTIVE'
FROM resources WHERE resource_key = 'ASSET_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'ASSET_CATEGORY', 'Asset Category', 'ENTITY',
    id, 'Asset risk levels, categories (Critical, Non-Critical)',
    40, 'ACTIVE'
FROM resources WHERE resource_key = 'ASSET_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

-- Maintenance Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'WORK_ORDER', 'Work Order', 'ENTITY',
    id, 'Preventive and corrective maintenance work orders',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'MAINTENANCE'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'PM_SCHEDULE', 'PM Schedule', 'ENTITY',
    id, 'Preventive maintenance schedules and templates',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'MAINTENANCE'
ON CONFLICT (resource_key) DO NOTHING;

-- Warranty & AMC Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'WARRANTY_CONTRACT', 'Warranty Contract', 'ENTITY',
    id, 'Device warranty information and expiry tracking',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'WARRANTY_AMC'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'AMC_CONTRACT', 'AMC Contract', 'ENTITY',
    id, 'Annual Maintenance Contract details and tracking',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'WARRANTY_AMC'
ON CONFLICT (resource_key) DO NOTHING;

-- Compliance Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'SAFETY_TEST', 'Safety Test', 'ENTITY',
    id, 'Electrical safety and biomedical compliance tests',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'COMPLIANCE'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'CALIBRATION', 'Calibration', 'ENTITY',
    id, 'Device calibration and verification records',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'COMPLIANCE'
ON CONFLICT (resource_key) DO NOTHING;

-- Location Management Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'LOCATION', 'Location', 'ENTITY',
    id, 'Hospital/clinic locations',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'LOCATION_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'DEPARTMENT', 'Department', 'ENTITY',
    id, 'Organization departments and wards',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'LOCATION_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'BUILDING', 'Building', 'ENTITY',
    id, 'Physical buildings within a location',
    30, 'ACTIVE'
FROM resources WHERE resource_key = 'LOCATION_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'FLOOR', 'Floor', 'ENTITY',
    id, 'Floors within a building',
    40, 'ACTIVE'
FROM resources WHERE resource_key = 'LOCATION_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'ROOM', 'Room', 'ENTITY',
    id, 'Rooms on a floor',
    50, 'ACTIVE'
FROM resources WHERE resource_key = 'LOCATION_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'BED', 'Bed', 'ENTITY',
    id, 'Beds within a room',
    60, 'ACTIVE'
FROM resources WHERE resource_key = 'LOCATION_MGMT'
ON CONFLICT (resource_key) DO NOTHING;

-- RBAC Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'ROLE', 'Role', 'ENTITY',
    id, 'System roles (Admin, Supervisor, User, etc.)',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'RBAC'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'USER', 'User', 'ENTITY',
    id, 'System users with role assignments',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'RBAC'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'PERMISSION', 'Permission', 'ENTITY',
    id, 'Role-based permissions and access control',
    30, 'ACTIVE'
FROM resources WHERE resource_key = 'RBAC'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'TENANT', 'Tenant', 'ENTITY',
    id, 'Multi-tenant configurations and isolation',
    40, 'ACTIVE'
FROM resources WHERE resource_key = 'RBAC'
ON CONFLICT (resource_key) DO NOTHING;

-- Notifications Entities
INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'EVENT_MASTER', 'Event Master', 'ENTITY',
    id, 'Global catalog of system events for notifications',
    10, 'ACTIVE'
FROM resources WHERE resource_key = 'NOTIFICATIONS'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'NOTIFICATION_RULE', 'Notification Rule', 'ENTITY',
    id, 'Tenant-level notification rules and configurations',
    20, 'ACTIVE'
FROM resources WHERE resource_key = 'NOTIFICATIONS'
ON CONFLICT (resource_key) DO NOTHING;

INSERT INTO resources (resource_key, resource_name, resource_type, parent_id, description, sort_order, is_active)
SELECT
    'NOTIFICATION_LOG', 'Notification Log', 'ENTITY',
    id, 'Audit trail of notifications sent to users',
    30, 'ACTIVE'
FROM resources WHERE resource_key = 'NOTIFICATIONS'
ON CONFLICT (resource_key) DO NOTHING;


-- ============================================================================
-- SEED DATA: ACTIONS (Standard CRUD + Custom actions)
-- ============================================================================

INSERT INTO actions (action_key, action_name, action_category, description, is_active)
VALUES
    -- Standard CRUD
    ('CREATE', 'Create', 'STANDARD', 'Create new records', 'ACTIVE'),
    ('READ', 'Read', 'STANDARD', 'View records', 'ACTIVE'),
    ('UPDATE', 'Update', 'STANDARD', 'Edit existing records', 'ACTIVE'),
    ('DELETE', 'Delete', 'STANDARD', 'Soft delete records', 'ACTIVE'),
    ('EXPORT', 'Export', 'STANDARD', 'Export data to CSV/Excel', 'ACTIVE'),
    ('IMPORT', 'Import', 'STANDARD', 'Bulk import via file upload', 'ACTIVE'),

    -- Asset Management Custom Actions
    ('REGISTER_ASSET', 'Register Asset', 'CUSTOM', 'Register new medical device', 'ACTIVE'),
    ('TRANSFER_ASSET', 'Transfer Asset', 'CUSTOM', 'Transfer asset to another location', 'ACTIVE'),
    ('DECOMMISSION', 'Decommission', 'CUSTOM', 'Mark asset as decommissioned', 'ACTIVE'),
    ('GENERATE_REPORT', 'Generate Report', 'CUSTOM', 'Generate asset reports', 'ACTIVE'),

    -- Work Order Custom Actions
    ('CREATE_WO', 'Create Work Order', 'CUSTOM', 'Create new maintenance work order', 'ACTIVE'),
    ('ASSIGN_WO', 'Assign Work Order', 'CUSTOM', 'Assign work order to technician', 'ACTIVE'),
    ('CLOSE_WO', 'Close Work Order', 'CUSTOM', 'Mark work order as completed', 'ACTIVE'),

    -- Compliance Custom Actions
    ('SCHEDULE_TEST', 'Schedule Test', 'CUSTOM', 'Schedule safety or calibration test', 'ACTIVE'),
    ('RECORD_TEST', 'Record Test', 'CUSTOM', 'Record test results and compliance status', 'ACTIVE'),
    ('ISSUE_CERTIFICATE', 'Issue Certificate', 'CUSTOM', 'Generate compliance certificate', 'ACTIVE'),

    -- Notification Custom Actions
    ('CONFIGURE_NOTIFICATIONS', 'Configure Notifications', 'CUSTOM', 'Set up notification rules', 'ACTIVE'),
    ('SEND_NOTIFICATION', 'Send Notification', 'SYSTEM', 'Send notification to users', 'ACTIVE'),
    ('ACKNOWLEDGE_NOTIFICATION', 'Acknowledge', 'CUSTOM', 'Mark notification as read/acknowledged', 'ACTIVE'),

    -- Admin Actions
    ('MANAGE_ROLES', 'Manage Roles', 'CUSTOM', 'Create/edit system roles', 'ACTIVE'),
    ('MANAGE_PERMISSIONS', 'Manage Permissions', 'CUSTOM', 'Assign permissions to roles', 'ACTIVE'),
    ('MANAGE_USERS', 'Manage Users', 'CUSTOM', 'Create/deactivate users', 'ACTIVE')
ON CONFLICT (action_key) DO NOTHING;


-- ============================================================================
-- SUMMARY QUERIES (for verification and dropdown data)
-- ============================================================================

-- View all active resources (for API dropdown endpoints)
-- SELECT id, resource_key, resource_name, resource_type, parent_id, description
-- FROM resources
-- WHERE is_active = 'ACTIVE'
-- ORDER BY resource_type, sort_order, resource_name;

-- View resource hierarchy
-- SELECT r.id, r.resource_key, r.resource_name, r.resource_type, p.resource_name as parent_name, r.description
-- FROM resources r
-- LEFT JOIN resources p ON r.parent_id = p.id
-- WHERE r.is_active = 'ACTIVE'
-- ORDER BY r.resource_type, COALESCE(p.resource_name, ''), r.sort_order;

-- View all active actions
-- SELECT id, action_key, action_name, action_category, description
-- FROM actions
-- WHERE is_active = 'ACTIVE'
-- ORDER BY action_category, action_name;
