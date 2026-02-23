-- ============================================================================
-- NOTIFICATION SETTINGS -- Tenant-level Event-driven Notification Engine
-- Matches BRD: Roles, Event Master, Rules, Timing, Channels, Escalation
-- ============================================================================

BEGIN;

/* ==================================================================
   0.  ENUMS
   ================================================================== */
CREATE TYPE notification_trigger_type AS ENUM ('Immediate', 'Scheduled');
CREATE TYPE notification_recipient_scope AS ENUM ('Org', 'Tenant', 'Platform');
CREATE TYPE notification_delivery_status AS ENUM ('Queued', 'Sent', 'Failed', 'Skipped');
CREATE TYPE notification_read_status AS ENUM ('Unread', 'Read', 'Acknowledged');

/* ==================================================================
   1.  RECIPIENT ROLES (BRD Section 1)
   Static lookup -- seeded once, rarely changes.
   ================================================================== */
CREATE TABLE notification_recipient_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code       VARCHAR(50) UNIQUE NOT NULL,
    role_name       VARCHAR(100) NOT NULL,
    scope           notification_recipient_scope NOT NULL DEFAULT 'Org',
    display_order   INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO notification_recipient_roles (role_code, role_name, scope, display_order) VALUES
    ('PLATFORM_ADMIN',    'Platform Admin',              'Platform', 1),
    ('TENANT_ADMIN',      'Tenant Admin',                'Tenant',   2),
    ('ORG_ADMIN',         'Organization Admin',          'Org',      3),
    ('ORG_SUPERVISOR',    'Org Supervisor',              'Org',      4),
    ('ORG_STORE_MANAGER', 'Org Store Manager / Keeper',  'Org',      5),
    ('ORG_COORDINATOR',   'Org Coordinator',             'Org',      6),
    ('ORG_USER',          'Org User (Biomed Eng / Tech)','Org',      7),
    ('END_USER',          'End Users',                   'Org',      8);

/* ==================================================================
   2.  EVENT MODULES (grouping for UI)
   ================================================================== */
CREATE TABLE notification_event_modules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_key      VARCHAR(50) UNIQUE NOT NULL,
    module_name     VARCHAR(100) NOT NULL,
    icon_name       VARCHAR(50),            -- for frontend icon lookup
    display_order   INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO notification_event_modules (module_key, module_name, icon_name, display_order) VALUES
    ('ASSET',          'Asset Module',                   'Wrench',        1),
    ('WARRANTY_AMC',   'Warranty / AMC',                 'ShieldCheck',   2),
    ('PM_MAINTENANCE', 'PM / Maintenance / Compliance',  'CalendarClock', 3),
    ('WORK_ORDER',     'Work Orders',                    'ClipboardList', 4),
    ('INVENTORY',      'Inventory / GRN',                'Package',       5);

/* ==================================================================
   3.  EVENT MASTER (BRD Section 3) -- global catalog
   ================================================================== */
CREATE TABLE notification_event_master (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_code      VARCHAR(80) UNIQUE NOT NULL,
    event_name      VARCHAR(150) NOT NULL,
    module_key      VARCHAR(50) NOT NULL REFERENCES notification_event_modules(module_key),
    trigger_type    notification_trigger_type NOT NULL,
    ref_date_field  VARCHAR(200),           -- e.g. 'assets.warranty_expiry'
    description     TEXT,
    default_template TEXT,                  -- placeholder template: "Asset {{asset_name}} warranty expires on {{expiry_date}}"
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asset Module
INSERT INTO notification_event_master (event_code, event_name, module_key, trigger_type, description) VALUES
    ('ASSET_REGISTERED',      'Asset Registered',       'ASSET', 'Immediate', 'Triggered when a new asset is registered'),
    ('ASSET_UPDATED',         'Asset Updated',           'ASSET', 'Immediate', 'Triggered when asset details are modified'),
    ('ASSET_STATUS_CHANGED',  'Asset Status Changed',    'ASSET', 'Immediate', 'Triggered when asset status transitions'),
    ('ASSET_TRANSFERRED',     'Asset Transferred',       'ASSET', 'Immediate', 'Triggered when asset is transferred');

-- Warranty / AMC
INSERT INTO notification_event_master (event_code, event_name, module_key, trigger_type, ref_date_field, description) VALUES
    ('WARRANTY_EXPIRY_UPCOMING', 'Warranty Expiry Upcoming', 'WARRANTY_AMC', 'Scheduled', 'assets.warranty_expiry',  'Reminder before warranty expiry'),
    ('WARRANTY_EXPIRED',         'Warranty Expired',          'WARRANTY_AMC', 'Scheduled', 'assets.warranty_expiry',  'On warranty expiry date'),
    ('AMC_EXPIRY_UPCOMING',      'AMC Expiry Upcoming',       'WARRANTY_AMC', 'Scheduled', 'contracts.end_date',      'Reminder before AMC contract expiry'),
    ('AMC_EXPIRED',              'AMC Expired',                'WARRANTY_AMC', 'Scheduled', 'contracts.end_date',      'On AMC contract expiry date');

-- PM / Maintenance / Compliance
INSERT INTO notification_event_master (event_code, event_name, module_key, trigger_type, ref_date_field, description) VALUES
    ('PM_DUE_UPCOMING',          'PM Due Upcoming',            'PM_MAINTENANCE', 'Scheduled', 'pm_schedules.next_due_date', 'Reminder before PM due date'),
    ('PM_OVERDUE',               'PM Overdue',                  'PM_MAINTENANCE', 'Scheduled', 'pm_schedules.next_due_date', 'PM task past due date'),
    ('SAFETY_TEST_DUE_UPCOMING', 'Safety Test Due Upcoming',    'PM_MAINTENANCE', 'Scheduled', 'assets.safety_test_due',     'Reminder before safety test'),
    ('CALIBRATION_DUE_UPCOMING', 'Calibration Due Upcoming',    'PM_MAINTENANCE', 'Scheduled', 'assets.calibration_due',     'Reminder before calibration');

-- Work Orders
INSERT INTO notification_event_master (event_code, event_name, module_key, trigger_type, description) VALUES
    ('WO_CREATED',      'Work Order Created',      'WORK_ORDER', 'Immediate', 'New work order created'),
    ('WO_ASSIGNED',     'Work Order Assigned',     'WORK_ORDER', 'Immediate', 'Work order assigned to technician'),
    ('WO_IN_PROGRESS',  'Work Order In Progress',  'WORK_ORDER', 'Immediate', 'Work order status changed to In Progress'),
    ('WO_CLOSED',       'Work Order Closed',       'WORK_ORDER', 'Immediate', 'Work order completed and closed');

-- Inventory
INSERT INTO notification_event_master (event_code, event_name, module_key, trigger_type, ref_date_field, description) VALUES
    ('GRN_RECEIVED',        'GRN Received',           'INVENTORY', 'Immediate', NULL,                      'Goods receipt note processed'),
    ('STOCK_LOW',           'Stock Below Reorder',     'INVENTORY', 'Immediate', NULL,                      'Item stock below reorder level'),
    ('ITEM_EXPIRY_UPCOMING','Item Expiry Upcoming',    'INVENTORY', 'Scheduled', 'grn_lines.expiry_date',   'Stock item approaching expiry');

/* ==================================================================
   4.  TENANT NOTIFICATION RULES (BRD Section 4)
   One rule per tenant + event combination.
   ================================================================== */
CREATE TABLE tenant_notification_rules (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,       -- FK to tenants table
    event_code          VARCHAR(80) NOT NULL REFERENCES notification_event_master(event_code),
    enabled             BOOLEAN NOT NULL DEFAULT TRUE,

    -- Recipient scope (BRD 4.1)
    recipient_scope     notification_recipient_scope NOT NULL DEFAULT 'Org',

    -- Timing (BRD 4.2)
    timing_immediate    BOOLEAN NOT NULL DEFAULT FALSE,
    before_days         INT DEFAULT 30,                       -- first/default reminder
    recurring_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_interval  INT DEFAULT 0,                        -- days between repeats

    -- Channels (BRD 4.3)
    channel_in_app      BOOLEAN NOT NULL DEFAULT TRUE,
    channel_email       BOOLEAN NOT NULL DEFAULT FALSE,
    channel_sms         BOOLEAN NOT NULL DEFAULT FALSE,       -- future
    channel_whatsapp    BOOLEAN NOT NULL DEFAULT FALSE,       -- future

    -- Escalation
    escalation_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    escalation_days     INT DEFAULT 0,                        -- days before escalation fires

    -- Metadata
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by          UUID,                                 -- FK to users

    UNIQUE (tenant_id, event_code)
);

/* ==================================================================
   5.  RULE -> RECIPIENT ROLES (many-to-many)
   ================================================================== */
CREATE TABLE tenant_notification_rule_recipients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id     UUID NOT NULL REFERENCES tenant_notification_rules(id) ON DELETE CASCADE,
    role_code   VARCHAR(50) NOT NULL REFERENCES notification_recipient_roles(role_code),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (rule_id, role_code)
);

/* ==================================================================
   6.  RULE -> REMINDER DAYS (for scheduled events, multi-day reminders)
   e.g. 60, 30, 15, 7, 1 days before expiry
   ================================================================== */
CREATE TABLE tenant_notification_reminder_days (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id         UUID NOT NULL REFERENCES tenant_notification_rules(id) ON DELETE CASCADE,
    days_before     INT NOT NULL CHECK (days_before >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (rule_id, days_before)
);

/* ==================================================================
   7.  RULE -> ESCALATION ROLES
   Who gets notified when escalation triggers.
   ================================================================== */
CREATE TABLE tenant_notification_escalation_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id     UUID NOT NULL REFERENCES tenant_notification_rules(id) ON DELETE CASCADE,
    role_code   VARCHAR(50) NOT NULL REFERENCES notification_recipient_roles(role_code),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (rule_id, role_code)
);

/* ==================================================================
   8.  RULE -> OPTIONAL FILTERS / CONDITIONS (BRD Section 4.4)
   e.g. only fire for certain orgs, locations, asset categories, risk levels
   ================================================================== */
CREATE TABLE tenant_notification_rule_filters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id         UUID NOT NULL REFERENCES tenant_notification_rules(id) ON DELETE CASCADE,
    filter_type     VARCHAR(50) NOT NULL,   -- 'ORGANIZATION', 'LOCATION', 'DEPARTMENT', 'ASSET_CATEGORY', 'RISK_LEVEL', 'ASSET_STATUS'
    filter_value    VARCHAR(200) NOT NULL,  -- the actual id or value to match
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (rule_id, filter_type, filter_value)
);

/* ==================================================================
   9.  NOTIFICATION LOG (BRD Section 7 - delivery tracking)
   Every sent notification is logged here for deduplication & audit.
   ================================================================== */
CREATE TABLE notification_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    rule_id             UUID REFERENCES tenant_notification_rules(id),
    event_code          VARCHAR(80) NOT NULL REFERENCES notification_event_master(event_code),

    -- Entity context
    entity_type         VARCHAR(50) NOT NULL,   -- 'Asset', 'WorkOrder', 'GRN', 'Contract'...
    entity_id           UUID NOT NULL,          -- the specific record
    org_id              UUID,                   -- asset's org_id for scoping

    -- Recipient
    recipient_user_id   UUID NOT NULL,          -- resolved user id
    recipient_role_code VARCHAR(50),
    channel             VARCHAR(20) NOT NULL,   -- 'in_app', 'email', 'sms'

    -- Delivery
    delivery_status     notification_delivery_status NOT NULL DEFAULT 'Queued',
    read_status         notification_read_status NOT NULL DEFAULT 'Unread',
    read_at             TIMESTAMPTZ,
    acknowledged_at     TIMESTAMPTZ,

    -- Reminder tracking (prevents duplicates)
    reminder_window     VARCHAR(50),            -- e.g. '30_days_before', 'on_date', 'recurring_7'
    scheduled_for       TIMESTAMPTZ,            -- when the notification was intended

    -- Content
    title               VARCHAR(300),
    body                TEXT,
    action_url          VARCHAR(500),

    -- Metadata
    sent_at             TIMESTAMPTZ,
    failed_reason       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Deduplication: same event + entity + user + reminder window = no duplicate
    UNIQUE (tenant_id, event_code, entity_id, recipient_user_id, reminder_window)
);

/* ==================================================================
   10. ESCALATION LOG
   Tracks when escalation was triggered.
   ================================================================== */
CREATE TABLE notification_escalation_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_log_id UUID NOT NULL REFERENCES notification_log(id),
    escalated_to_user   UUID NOT NULL,
    escalated_role_code VARCHAR(50),
    escalated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    channel             VARCHAR(20) NOT NULL,
    delivery_status     notification_delivery_status NOT NULL DEFAULT 'Queued'
);

/* ==================================================================
   11. INDEXES
   ================================================================== */
-- Rules lookup
CREATE INDEX idx_notif_rules_tenant ON tenant_notification_rules(tenant_id);
CREATE INDEX idx_notif_rules_event ON tenant_notification_rules(event_code);
CREATE INDEX idx_notif_rules_enabled ON tenant_notification_rules(tenant_id, enabled) WHERE enabled = TRUE;

-- Recipients
CREATE INDEX idx_notif_recipients_rule ON tenant_notification_rule_recipients(rule_id);

-- Reminder days
CREATE INDEX idx_notif_reminders_rule ON tenant_notification_reminder_days(rule_id);

-- Notification log
CREATE INDEX idx_notif_log_tenant ON notification_log(tenant_id);
CREATE INDEX idx_notif_log_user ON notification_log(recipient_user_id, read_status);
CREATE INDEX idx_notif_log_entity ON notification_log(entity_type, entity_id);
CREATE INDEX idx_notif_log_scheduled ON notification_log(scheduled_for) WHERE delivery_status = 'Queued';
CREATE INDEX idx_notif_log_unread ON notification_log(recipient_user_id) WHERE read_status = 'Unread';

-- Filters
CREATE INDEX idx_notif_filters_rule ON tenant_notification_rule_filters(rule_id);

/* ==================================================================
   12. HELPER FUNCTIONS
   ================================================================== */

-- Resolve recipients for an event + entity org
-- Returns user_ids that should be notified
CREATE OR REPLACE FUNCTION resolve_notification_recipients(
    p_tenant_id UUID,
    p_event_code VARCHAR(80),
    p_org_id UUID DEFAULT NULL
)
RETURNS TABLE (user_id UUID, role_code VARCHAR(50), scope notification_recipient_scope)
LANGUAGE plpgsql AS $$
BEGIN
    -- This is a skeleton; actual implementation would join:
    -- tenant_notification_rules -> rule_recipients -> users (via org memberships + role mappings)
    -- The scope determines filtering:
    --   'Org'      -> only users in the same org_id
    --   'Tenant'   -> all tenant admin users
    --   'Platform' -> platform admin users

    RETURN QUERY
    SELECT
        NULL::UUID AS user_id,          -- placeholder: join to real users table
        rr.role_code,
        nr.recipient_scope AS scope
    FROM tenant_notification_rules nr
    JOIN tenant_notification_rule_recipients rr ON rr.rule_id = nr.id
    WHERE nr.tenant_id = p_tenant_id
      AND nr.event_code = p_event_code
      AND nr.enabled = TRUE;
END;
$$;

-- Check if notification already sent (deduplication per BRD Section 7)
CREATE OR REPLACE FUNCTION is_notification_duplicate(
    p_tenant_id UUID,
    p_event_code VARCHAR(80),
    p_entity_id UUID,
    p_user_id UUID,
    p_reminder_window VARCHAR(50)
)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM notification_log
        WHERE tenant_id = p_tenant_id
          AND event_code = p_event_code
          AND entity_id = p_entity_id
          AND recipient_user_id = p_user_id
          AND reminder_window = p_reminder_window
    );
END;
$$;

-- Auto-update updated_at on rules
CREATE OR REPLACE FUNCTION update_notification_rule_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notif_rule_updated
    BEFORE UPDATE ON tenant_notification_rules
    FOR EACH ROW EXECUTE FUNCTION update_notification_rule_timestamp();

/* ==================================================================
   13. VIEWS
   ================================================================== */

-- Summary: all rules for a tenant with recipient count and reminder count
CREATE OR REPLACE VIEW vw_tenant_notification_rules_summary AS
SELECT
    r.id AS rule_id,
    r.tenant_id,
    r.event_code,
    em.event_name,
    em.module_key,
    em.trigger_type,
    r.enabled,
    r.recipient_scope,
    r.channel_in_app,
    r.channel_email,
    r.timing_immediate,
    r.before_days,
    r.recurring_enabled,
    r.recurring_interval,
    r.escalation_enabled,
    r.escalation_days,
    (SELECT COUNT(*) FROM tenant_notification_rule_recipients rr WHERE rr.rule_id = r.id) AS recipient_count,
    (SELECT COUNT(*) FROM tenant_notification_reminder_days rd WHERE rd.rule_id = r.id) AS reminder_count,
    (SELECT string_agg(rr.role_code, ', ' ORDER BY rr.role_code) FROM tenant_notification_rule_recipients rr WHERE rr.rule_id = r.id) AS recipient_roles_csv,
    (SELECT string_agg(rd.days_before::TEXT, ', ' ORDER BY rd.days_before DESC) FROM tenant_notification_reminder_days rd WHERE rd.rule_id = r.id) AS reminder_days_csv,
    r.updated_at
FROM tenant_notification_rules r
JOIN notification_event_master em ON em.event_code = r.event_code;

-- Unread notifications per user
CREATE OR REPLACE VIEW vw_user_unread_notifications AS
SELECT
    recipient_user_id,
    COUNT(*) AS unread_count,
    MIN(created_at) AS oldest_unread
FROM notification_log
WHERE read_status = 'Unread'
  AND delivery_status = 'Sent'
GROUP BY recipient_user_id;

-- Pending escalations: notifications past escalation threshold
CREATE OR REPLACE VIEW vw_pending_escalations AS
SELECT
    nl.id AS notification_log_id,
    nl.tenant_id,
    nl.event_code,
    nl.entity_type,
    nl.entity_id,
    nl.recipient_user_id,
    nl.created_at AS notification_sent_at,
    r.escalation_days,
    r.escalation_days - EXTRACT(DAY FROM (now() - nl.created_at))::INT AS days_remaining
FROM notification_log nl
JOIN tenant_notification_rules r ON r.tenant_id = nl.tenant_id AND r.event_code = nl.event_code
WHERE r.escalation_enabled = TRUE
  AND nl.read_status != 'Acknowledged'
  AND nl.delivery_status = 'Sent'
  AND nl.created_at + (r.escalation_days || ' days')::INTERVAL <= now()
  AND NOT EXISTS (
      SELECT 1 FROM notification_escalation_log el WHERE el.notification_log_id = nl.id
  );

COMMIT;
