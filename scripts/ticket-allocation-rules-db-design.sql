-- ============================================================
-- TICKET ALLOCATION RULES - DB DESIGN
-- ============================================================
-- Hierarchy: Organization has many rules. Rules have conditions
-- and one assignment target. Rules are evaluated in priority
-- order (first-match-wins or best-match scoring).
--
-- Removed facility concept; org_id references organization (RBAC).
-- tenant_id on every table for multi-tenant isolation.
-- ============================================================

-- ============================================================
-- 1. GLOBAL SETTINGS (per org)
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_allocation_global_settings (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id         BIGINT NOT NULL,
    org_id            BIGINT NOT NULL,

    rule_based_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    eval_mode          VARCHAR(20) NOT NULL DEFAULT 'FIRST_MATCH',  -- FIRST_MATCH | BEST_MATCH
    default_fallback   VARCHAR(100) NOT NULL DEFAULT 'Unassigned Queue',
    load_balancing     VARCHAR(20) NOT NULL DEFAULT 'ROUND_ROBIN',  -- ROUND_ROBIN | LEAST_OPEN | MANUAL

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, org_id)
);

CREATE INDEX idx_alloc_settings_org ON ticket_allocation_global_settings(tenant_id, org_id);

-- ============================================================
-- 2. ALLOCATION RULE (the main rule header)
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_allocation_rule (
    rule_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id         BIGINT NOT NULL,
    org_id            BIGINT NOT NULL,

    rule_name         VARCHAR(200) NOT NULL,
    description       VARCHAR(500),
    priority          INT NOT NULL,                  -- 1 = highest; drag-reorderable
    match_type        VARCHAR(5) NOT NULL DEFAULT 'ALL',  -- ALL (AND) | ANY (OR)
    is_active         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (is_active IN ('ACTIVE','INACTIVE','DELETED')),

    effective_from    DATE,                          -- optional date range
    effective_to      DATE,

    -- ASSIGNMENT (denormalized for fast reads; normalized alt below)
    assign_to_type    VARCHAR(20) NOT NULL,          -- TEAM | ENGINEER | VENDOR | QUEUE
    assign_to_id      BIGINT NOT NULL,               -- FK to team/user/vendor depending on type
    assign_to_name    VARCHAR(200) NOT NULL,          -- cached display name
    strategy          VARCHAR(20) NOT NULL DEFAULT 'FIXED',  -- FIXED | ROUND_ROBIN | LEAST_OPEN

    override_priority VARCHAR(20),                   -- NULL = no override; Critical/High/Medium/Low
    override_sla      VARCHAR(50),                   -- NULL = no override; e.g. "2 hours"
    notify_assignee   BOOLEAN NOT NULL DEFAULT TRUE,
    notify_channels   VARCHAR(200),                  -- comma-separated: EMAIL,SMS,PUSH

    created_by        BIGINT,
    updated_by        BIGINT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, org_id, priority)
);

CREATE INDEX idx_alloc_rule_org       ON ticket_allocation_rule(tenant_id, org_id);
CREATE INDEX idx_alloc_rule_active    ON ticket_allocation_rule(tenant_id, org_id, is_active);
CREATE INDEX idx_alloc_rule_priority  ON ticket_allocation_rule(tenant_id, org_id, priority);

-- ============================================================
-- 3. RULE CONDITION (the "WHEN" rows)
-- ============================================================
-- Each rule has 1..N conditions. During evaluation, conditions
-- are combined using the parent rule's match_type (AND/OR).
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_allocation_rule_condition (
    condition_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id         BIGINT NOT NULL,
    org_id            BIGINT NOT NULL,
    rule_id           BIGINT NOT NULL REFERENCES ticket_allocation_rule(rule_id) ON DELETE CASCADE,

    -- CONDITION DEFINITION
    field_key         VARCHAR(50) NOT NULL,          -- DEPARTMENT | ASSET_CATEGORY | TICKET_TYPE | SEVERITY | LOCATION
    operator          VARCHAR(20) NOT NULL,          -- IN | NOT_IN | EQUALS | NOT_EQUALS
    -- values stored as JSON array for flexibility
    field_values      JSONB NOT NULL DEFAULT '[]',   -- e.g. ["D-01","D-02"]

    sort_order        INT NOT NULL DEFAULT 0,        -- display order within the rule

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alloc_cond_rule  ON ticket_allocation_rule_condition(tenant_id, rule_id);
CREATE INDEX idx_alloc_cond_field ON ticket_allocation_rule_condition(tenant_id, field_key);

-- ============================================================
-- 4. RULE ASSIGNMENT POOL (optional, for round-robin/least-open)
-- ============================================================
-- When strategy is ROUND_ROBIN or LEAST_OPEN, the rule may have
-- multiple pool members to distribute among.
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_allocation_rule_pool (
    pool_id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id         BIGINT NOT NULL,
    org_id            BIGINT NOT NULL,
    rule_id           BIGINT NOT NULL REFERENCES ticket_allocation_rule(rule_id) ON DELETE CASCADE,

    member_type       VARCHAR(20) NOT NULL,          -- ENGINEER | VENDOR
    member_id         BIGINT NOT NULL,
    member_name       VARCHAR(200) NOT NULL,
    is_active         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (is_active IN ('ACTIVE','INACTIVE','DELETED')),

    -- round-robin state
    last_assigned_at  TIMESTAMPTZ,
    assignment_count  INT NOT NULL DEFAULT 0,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, rule_id, member_type, member_id)
);

CREATE INDEX idx_alloc_pool_rule ON ticket_allocation_rule_pool(tenant_id, rule_id);

-- ============================================================
-- 5. TICKET ROUTING LOG (audit trail)
-- ============================================================
-- Records which rule matched (or fallback) for each ticket.
-- Used by "Explain why this ticket went to X" feature.
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_routing_log (
    log_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id         BIGINT NOT NULL,
    org_id            BIGINT NOT NULL,
    ticket_id         BIGINT NOT NULL,               -- FK to ticket

    matched_rule_id   BIGINT REFERENCES ticket_allocation_rule(rule_id),
    matched_rule_name VARCHAR(200),
    matched_priority  INT,

    -- fallback info when no rule matched
    fallback_used     BOOLEAN NOT NULL DEFAULT FALSE,
    fallback_type     VARCHAR(50),                   -- CATEGORY_DEFAULT | DEPT_DEFAULT | FALLBACK_QUEUE
    fallback_detail   VARCHAR(200),

    -- final assignment
    assigned_to_type  VARCHAR(20) NOT NULL,
    assigned_to_id    BIGINT NOT NULL,
    assigned_to_name  VARCHAR(200) NOT NULL,
    strategy_used     VARCHAR(20),

    -- evaluation metadata
    rules_evaluated   INT NOT NULL DEFAULT 0,        -- how many rules were checked
    eval_time_ms      INT,                           -- processing time in ms

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routing_log_ticket ON ticket_routing_log(tenant_id, ticket_id);
CREATE INDEX idx_routing_log_rule   ON ticket_routing_log(tenant_id, matched_rule_id);
CREATE INDEX idx_routing_log_date   ON ticket_routing_log(tenant_id, created_at DESC);

-- ============================================================
-- 6. VIEWS
-- ============================================================

-- Expanded rule view with conditions aggregated as JSON
CREATE OR REPLACE VIEW vw_allocation_rule_expanded AS
SELECT
    r.rule_id,
    r.tenant_id,
    r.org_id,
    r.rule_name,
    r.description,
    r.priority,
    r.match_type,
    r.is_active,
    r.effective_from,
    r.effective_to,
    r.assign_to_type,
    r.assign_to_id,
    r.assign_to_name,
    r.strategy,
    r.override_priority,
    r.override_sla,
    r.notify_assignee,
    r.notify_channels,
    r.created_at,
    r.updated_at,
    COALESCE(
        (SELECT json_agg(json_build_object(
            'conditionId', c.condition_id,
            'fieldKey', c.field_key,
            'operator', c.operator,
            'values', c.field_values
        ) ORDER BY c.sort_order)
        FROM ticket_allocation_rule_condition c
        WHERE c.rule_id = r.rule_id AND c.tenant_id = r.tenant_id),
        '[]'::json
    ) AS conditions,
    (SELECT COUNT(*) FROM ticket_allocation_rule_condition c
     WHERE c.rule_id = r.rule_id AND c.tenant_id = r.tenant_id) AS condition_count,
    (SELECT COUNT(*) FROM ticket_allocation_rule_pool p
     WHERE p.rule_id = r.rule_id AND p.tenant_id = r.tenant_id) AS pool_member_count
FROM ticket_allocation_rule r;

-- Routing summary view per rule
CREATE OR REPLACE VIEW vw_routing_stats AS
SELECT
    r.rule_id,
    r.tenant_id,
    r.org_id,
    r.rule_name,
    r.priority,
    r.is_active,
    COUNT(l.log_id) AS times_matched,
    MAX(l.created_at) AS last_matched_at
FROM ticket_allocation_rule r
LEFT JOIN ticket_routing_log l ON l.matched_rule_id = r.rule_id AND l.tenant_id = r.tenant_id
GROUP BY r.rule_id, r.tenant_id, r.org_id, r.rule_name, r.priority, r.is_active;

-- ============================================================
-- 7. SEED DATA
-- ============================================================

-- Global Settings for org_id=1
INSERT INTO ticket_allocation_global_settings (tenant_id, org_id, rule_based_enabled, eval_mode, default_fallback, load_balancing)
VALUES (1, 1, TRUE, 'FIRST_MATCH', 'Unassigned Queue', 'ROUND_ROBIN');

-- Global Settings for org_id=2
INSERT INTO ticket_allocation_global_settings (tenant_id, org_id, rule_based_enabled, eval_mode, default_fallback, load_balancing)
VALUES (1, 2, TRUE, 'FIRST_MATCH', 'Default Team', 'LEAST_OPEN');

-- Rule 1: Radiology Critical Breakdown
INSERT INTO ticket_allocation_rule (
    tenant_id, org_id, rule_name, description, priority, match_type,
    assign_to_type, assign_to_id, assign_to_name, strategy,
    override_priority, override_sla, notify_assignee, notify_channels
) VALUES (
    1, 1, 'Radiology Critical Breakdown',
    'Route critical radiology breakdowns to imaging specialists',
    1, 'ALL',
    'TEAM', 1, 'Radiology Biomedical Team', 'ROUND_ROBIN',
    NULL, NULL, TRUE, 'EMAIL,PUSH'
);
-- rule_id = 1

INSERT INTO ticket_allocation_rule_condition (tenant_id, org_id, rule_id, field_key, operator, field_values, sort_order) VALUES
(1, 1, 1, 'DEPARTMENT',  'IN',     '["D-01"]',          1),
(1, 1, 1, 'TICKET_TYPE', 'EQUALS', '["TT-01"]',         2),
(1, 1, 1, 'SEVERITY',    'IN',     '["S-01","S-02"]',   3);

-- Rule 2: ICU Ventilator Alerts
INSERT INTO ticket_allocation_rule (
    tenant_id, org_id, rule_name, description, priority, match_type,
    assign_to_type, assign_to_id, assign_to_name, strategy,
    override_priority, override_sla, notify_assignee, notify_channels
) VALUES (
    1, 1, 'ICU Ventilator Alerts',
    'All ICU ventilator tickets go to critical care support with SLA override',
    2, 'ALL',
    'TEAM', 5, 'Critical Care Support', 'LEAST_OPEN',
    'Critical', '2 hours', TRUE, 'EMAIL,SMS,PUSH'
);
-- rule_id = 2

INSERT INTO ticket_allocation_rule_condition (tenant_id, org_id, rule_id, field_key, operator, field_values, sort_order) VALUES
(1, 1, 2, 'DEPARTMENT',     'IN',     '["D-02"]',          1),
(1, 1, 2, 'ASSET_CATEGORY', 'IN',     '["AC-01"]',         2);

-- Rule 3: CT/MRI Service Requests -> Vendor
INSERT INTO ticket_allocation_rule (
    tenant_id, org_id, rule_name, description, priority, match_type,
    assign_to_type, assign_to_id, assign_to_name, strategy,
    notify_assignee, notify_channels
) VALUES (
    1, 1, 'CT/MRI Service Requests',
    'Imaging equipment service requests route to vendor',
    3, 'ALL',
    'VENDOR', 3, 'Siemens Healthineers', 'FIXED',
    TRUE, 'EMAIL'
);
-- rule_id = 3

INSERT INTO ticket_allocation_rule_condition (tenant_id, org_id, rule_id, field_key, operator, field_values, sort_order) VALUES
(1, 1, 3, 'ASSET_CATEGORY', 'IN', '["AC-06","AC-07"]',    1),
(1, 1, 3, 'TICKET_TYPE',    'IN', '["TT-02","TT-04"]',    2);

-- Rule 4: Emergency Dept -> Fixed Engineer
INSERT INTO ticket_allocation_rule (
    tenant_id, org_id, rule_name, description, priority, match_type,
    assign_to_type, assign_to_id, assign_to_name, strategy,
    effective_from, effective_to, notify_assignee, notify_channels
) VALUES (
    1, 1, 'Emergency Department - All Tickets',
    'Route all emergency dept tickets to Vikram Singh',
    4, 'ANY',
    'ENGINEER', 3, 'Vikram Singh', 'FIXED',
    '2026-01-01', '2026-12-31', TRUE, 'EMAIL,PUSH'
);
-- rule_id = 4

INSERT INTO ticket_allocation_rule_condition (tenant_id, org_id, rule_id, field_key, operator, field_values, sort_order) VALUES
(1, 1, 4, 'DEPARTMENT', 'EQUALS', '["D-03"]', 1);

-- Rule 5: CSSD Autoclave Calibration (INACTIVE)
INSERT INTO ticket_allocation_rule (
    tenant_id, org_id, rule_name, description, priority, match_type, is_active,
    assign_to_type, assign_to_id, assign_to_name, strategy,
    notify_assignee, notify_channels
) VALUES (
    1, 1, 'CSSD Autoclave Calibration',
    'Autoclave calibration tickets to sterilization team',
    5, 'ALL', FALSE,
    'TEAM', 6, 'Sterilization Team', 'ROUND_ROBIN',
    FALSE, ''
);
-- rule_id = 5

INSERT INTO ticket_allocation_rule_condition (tenant_id, org_id, rule_id, field_key, operator, field_values, sort_order) VALUES
(1, 1, 5, 'DEPARTMENT',     'IN',     '["D-07"]',    1),
(1, 1, 5, 'ASSET_CATEGORY', 'EQUALS', '["AC-10"]',   2),
(1, 1, 5, 'TICKET_TYPE',    'EQUALS', '["TT-03"]',   3);

-- Rule 6: Dialysis Machine OMR -> Vendor
INSERT INTO ticket_allocation_rule (
    tenant_id, org_id, rule_name, description, priority, match_type,
    assign_to_type, assign_to_id, assign_to_name, strategy,
    notify_assignee, notify_channels
) VALUES (
    1, 1, 'Dialysis Machine - OMR Branch',
    'Dialysis machine tickets from OMR to vendor B. Braun',
    6, 'ALL',
    'VENDOR', 5, 'B. Braun', 'FIXED',
    TRUE, 'EMAIL'
);
-- rule_id = 6

INSERT INTO ticket_allocation_rule_condition (tenant_id, org_id, rule_id, field_key, operator, field_values, sort_order) VALUES
(1, 1, 6, 'ASSET_CATEGORY', 'EQUALS', '["AC-11"]',   1),
(1, 1, 6, 'LOCATION',       'IN',     '["L-03"]',    2);

-- Sample pool members for Round Robin rules
INSERT INTO ticket_allocation_rule_pool (tenant_id, org_id, rule_id, member_type, member_id, member_name) VALUES
(1, 1, 1, 'ENGINEER', 1, 'Rajesh Kumar'),
(1, 1, 1, 'ENGINEER', 2, 'Priya Sharma'),
(1, 1, 2, 'ENGINEER', 3, 'Vikram Singh'),
(1, 1, 2, 'ENGINEER', 4, 'Anita Nair'),
(1, 1, 2, 'ENGINEER', 5, 'Suresh Reddy');
