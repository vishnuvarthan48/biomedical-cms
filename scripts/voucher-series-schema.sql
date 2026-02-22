-- ============================================================
-- VOUCHER SERIES - PostgreSQL Schema
-- Auto-numbering configuration for all CMMS modules
-- ============================================================

-- ─── Voucher Series Master Table ───────────────────
-- Stores prefix/separator/sequence config per module
CREATE TABLE IF NOT EXISTS voucher_series (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,                          -- multi-tenant isolation

    module_key      VARCHAR(10) NOT NULL,                   -- e.g. GRN, PO, AST, DEV, TKT
    module_name     VARCHAR(100) NOT NULL,                  -- e.g. "Goods Receipt Note (GRN)"
    prefix          VARCHAR(10) NOT NULL,                   -- e.g. GRN, AST, TKT
    separator       VARCHAR(2)  NOT NULL DEFAULT '-',       -- -, /, ., _
    starting_no     INTEGER     NOT NULL DEFAULT 1 CHECK (starting_no >= 0),
    current_no      INTEGER     NOT NULL DEFAULT 0,         -- last used number (next = current_no + 1)
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,

    created_by      UUID,
    updated_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One active series per module per tenant
    CONSTRAINT uq_voucher_series_module UNIQUE (tenant_id, module_key),
    -- Prefix must be unique within a tenant
    CONSTRAINT uq_voucher_series_prefix UNIQUE (tenant_id, prefix),
    -- Separator limited to allowed values
    CONSTRAINT chk_separator CHECK (separator IN ('-', '/', '.', '_'))
);

COMMENT ON TABLE voucher_series IS 'Configurable auto-numbering series for each CMMS module';
COMMENT ON COLUMN voucher_series.module_key IS 'Short code identifying the module (GRN, PO, AST, DEV, TKT, WO, PM, CAL, AT, VND, STR, ITM)';
COMMENT ON COLUMN voucher_series.current_no IS 'Last used sequence number. Next generated number = current_no + 1';

-- ─── Index for fast lookups ────────────────────────
CREATE INDEX IF NOT EXISTS idx_voucher_series_tenant
    ON voucher_series (tenant_id, is_active);

-- ─── Auto-update updated_at ────────────────────────
CREATE OR REPLACE FUNCTION trg_voucher_series_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS voucher_series_updated_at ON voucher_series;
CREATE TRIGGER voucher_series_updated_at
    BEFORE UPDATE ON voucher_series
    FOR EACH ROW EXECUTE FUNCTION trg_voucher_series_updated_at();

-- ─── Function to get next number (atomic) ──────────
-- Call: SELECT next_voucher_number('tenant-uuid', 'GRN');
-- Returns: 'GRN-48'
CREATE OR REPLACE FUNCTION next_voucher_number(
    p_tenant_id UUID,
    p_module_key VARCHAR(10)
)
RETURNS TEXT AS $$
DECLARE
    v_prefix    VARCHAR(10);
    v_separator VARCHAR(2);
    v_next      INTEGER;
BEGIN
    -- Atomic increment: locks the row to prevent race conditions
    UPDATE voucher_series
    SET    current_no = current_no + 1
    WHERE  tenant_id  = p_tenant_id
      AND  module_key = p_module_key
      AND  is_active  = TRUE
    RETURNING prefix, separator, current_no
    INTO v_prefix, v_separator, v_next;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No active voucher series found for module "%" in tenant "%"',
            p_module_key, p_tenant_id;
    END IF;

    RETURN v_prefix || v_separator || v_next::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION next_voucher_number IS
    'Atomically increments and returns the next formatted voucher number for a given module.
     Usage: SELECT next_voucher_number(''tenant-uuid'', ''GRN'') => ''GRN-48''';

-- ─── Function to peek next number (read-only) ─────
-- Call: SELECT peek_voucher_number('tenant-uuid', 'AST');
-- Returns: 'AST-1157' (without incrementing)
CREATE OR REPLACE FUNCTION peek_voucher_number(
    p_tenant_id UUID,
    p_module_key VARCHAR(10)
)
RETURNS TEXT AS $$
DECLARE
    v_prefix    VARCHAR(10);
    v_separator VARCHAR(2);
    v_next      INTEGER;
BEGIN
    SELECT prefix, separator, current_no + 1
    INTO   v_prefix, v_separator, v_next
    FROM   voucher_series
    WHERE  tenant_id  = p_tenant_id
      AND  module_key = p_module_key
      AND  is_active  = TRUE;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    RETURN v_prefix || v_separator || v_next::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ─── Audit log for series changes ──────────────────
CREATE TABLE IF NOT EXISTS voucher_series_audit (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_series_id UUID NOT NULL REFERENCES voucher_series(id) ON DELETE CASCADE,
    action          VARCHAR(20) NOT NULL,                   -- CREATE, UPDATE, DEACTIVATE, REACTIVATE
    old_values      JSONB,
    new_values      JSONB,
    changed_by      UUID,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vs_audit_series
    ON voucher_series_audit (voucher_series_id, changed_at DESC);

-- ─── Audit trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION trg_voucher_series_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO voucher_series_audit (voucher_series_id, action, new_values, changed_by)
        VALUES (NEW.id, 'CREATE', to_jsonb(NEW), NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO voucher_series_audit (
            voucher_series_id, action, old_values, new_values, changed_by
        ) VALUES (
            NEW.id,
            CASE
                WHEN OLD.is_active = TRUE AND NEW.is_active = FALSE THEN 'DEACTIVATE'
                WHEN OLD.is_active = FALSE AND NEW.is_active = TRUE THEN 'REACTIVATE'
                ELSE 'UPDATE'
            END,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NEW.updated_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS voucher_series_audit_trigger ON voucher_series;
CREATE TRIGGER voucher_series_audit_trigger
    AFTER INSERT OR UPDATE ON voucher_series
    FOR EACH ROW EXECUTE FUNCTION trg_voucher_series_audit();

-- ─── Seed Data (sample tenant) ─────────────────────
DO $$
DECLARE
    v_tenant UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    INSERT INTO voucher_series (tenant_id, module_key, module_name, prefix, separator, starting_no, current_no)
    VALUES
        (v_tenant, 'GRN', 'Goods Receipt Note (GRN)',    'GRN', '-', 1,    47),
        (v_tenant, 'PO',  'Purchase Order',               'PO',  '-', 1,    23),
        (v_tenant, 'AST', 'Asset Registration',           'AST', '-', 1000, 1156),
        (v_tenant, 'DEV', 'Device Registration',          'DEV', '-', 1,    89),
        (v_tenant, 'TKT', 'Ticket',                       'TKT', '-', 1,    512),
        (v_tenant, 'WO',  'Work Order',                   'WO',  '/', 1,    234),
        (v_tenant, 'PM',  'Preventive Maintenance',       'PM',  '-', 1,    78),
        (v_tenant, 'CAL', 'Calibration',                  'CAL', '-', 1,    34)
    ON CONFLICT (tenant_id, module_key) DO NOTHING;
END $$;

-- ─── Summary view ──────────────────────────────────
CREATE OR REPLACE VIEW v_voucher_series_summary AS
SELECT
    vs.tenant_id,
    vs.module_key,
    vs.module_name,
    vs.prefix || vs.separator || (vs.current_no + 1)::TEXT AS next_number,
    vs.current_no AS last_used,
    vs.starting_no,
    vs.is_active,
    vs.updated_at
FROM voucher_series vs
ORDER BY vs.module_name;
