-- ============================================================================
-- LOCATION & DEPARTMENTS - PostgreSQL Schema
-- ============================================================================
--
--  Hierarchy (corrected):
--
--    Organization (Tenant)   <-- already exists via tenant_admin
--        |
--        +-- Location        <-- a physical building/block under the tenant
--                |                (Hospital Name + Building/Block)
--                +-- Department  <-- unit inside that location
--                                    (with optional Floor / Room / Bed No)
--
--  Example:
--    Tenant: "Apollo Hospitals Pvt Ltd"
--      Location: "Apollo Hospitals - Greams Road" / "Main Tower"
--        Dept: ICU (3rd Floor, ICU-301, 12 beds)
--        Dept: OT Complex (2nd Floor, OT-201)
--      Location: "Apollo Hospitals - Greams Road" / "Diagnostic Block"
--        Dept: Radiology (Ground Floor, RD-001)
--        Dept: Pathology Lab (1st Floor, LAB-101)
--
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";


-- ============================================================================
-- 1. LOOKUP TABLE: cost_types
-- ============================================================================
CREATE TABLE IF NOT EXISTS cost_types (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100) NOT NULL UNIQUE,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO cost_types (name, sort_order) VALUES
    ('Cost Center',    1),
    ('Profit Center',  2),
    ('Revenue Center', 3)
ON CONFLICT (name) DO NOTHING;


-- ============================================================================
-- 2. LOCATIONS TABLE
-- ============================================================================
-- Each row = one physical building/block under the tenant org.
-- "name" = Hospital / Clinic name,  "building" = Block / Tower name.

CREATE TABLE IF NOT EXISTS locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL,                          -- FK to tenants (already exists)
    location_code   VARCHAR(20) NOT NULL UNIQUE,            -- Auto: LOC-001, LOC-002 ...

    -- Basic
    name            VARCHAR(200) NOT NULL,                  -- Hospital / Clinic Name
    building        VARCHAR(200) NOT NULL,                  -- Building / Block name
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    pin_code        VARCHAR(20),

    -- Contact & Billing
    email           CITEXT,
    cost_type_id    UUID REFERENCES cost_types(id),

    -- Branding
    logo_url        TEXT,

    -- Status
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    -- Notes
    end_user_notes  TEXT,

    -- Audit
    created_by      UUID,
    updated_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Same tenant cannot have duplicate (name + building) combos
    CONSTRAINT uq_location_per_tenant UNIQUE (tenant_id, name, building),

    -- Name min length
    CONSTRAINT chk_loc_name_len CHECK (char_length(name) >= 3),

    -- Email format
    CONSTRAINT chk_loc_email CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

CREATE INDEX IF NOT EXISTS idx_loc_tenant    ON locations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_loc_name      ON locations(name);
CREATE INDEX IF NOT EXISTS idx_loc_city      ON locations(city);
CREATE INDEX IF NOT EXISTS idx_loc_active    ON locations(is_active);


-- ============================================================================
-- 3. DEPARTMENTS TABLE
-- ============================================================================
-- Each department belongs to exactly one location.
-- Floor / Room / Bed are optional physical details.

CREATE TABLE IF NOT EXISTS departments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

    name            VARCHAR(200) NOT NULL,                  -- Department Name
    floor           VARCHAR(50),                            -- e.g. "3rd Floor", "G", "B1"
    room            VARCHAR(50),                            -- e.g. "OT-2", "205", "ICU-301"
    bed_number      VARCHAR(50),                            -- e.g. "12", "B-12" (optional)

    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    created_by      UUID,
    updated_by      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Dept name unique per location
    CONSTRAINT uq_dept_per_location UNIQUE (location_id, name),

    -- Name min length
    CONSTRAINT chk_dept_name_len CHECK (char_length(name) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_dept_location ON departments(location_id);
CREATE INDEX IF NOT EXISTS idx_dept_active   ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_dept_floor    ON departments(floor);


-- ============================================================================
-- 4. AUTO-GENERATE LOCATION CODE (LOC-001, LOC-002 ...)
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS location_code_seq START 1;

CREATE OR REPLACE FUNCTION fn_auto_location_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.location_code IS NULL OR NEW.location_code = '' THEN
        NEW.location_code := 'LOC-' || LPAD(NEXTVAL('location_code_seq')::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_location_code ON locations;
CREATE TRIGGER trg_auto_location_code
    BEFORE INSERT ON locations
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_location_code();


-- ============================================================================
-- 5. AUTO-UPDATE updated_at TIMESTAMPS
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_loc_updated ON locations;
CREATE TRIGGER trg_loc_updated
    BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

DROP TRIGGER IF EXISTS trg_dept_updated ON departments;
CREATE TRIGGER trg_dept_updated
    BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- ============================================================================
-- 6. BULK ADD DEPARTMENTS HELPER
-- ============================================================================
CREATE OR REPLACE FUNCTION bulk_add_departments(
    p_location_id UUID,
    p_departments JSONB
)
RETURNS INT AS $$
DECLARE
    v_count INT := 0;
    v_row   JSONB;
BEGIN
    FOR v_row IN SELECT * FROM jsonb_array_elements(p_departments)
    LOOP
        INSERT INTO departments (location_id, name, floor, room, bed_number)
        VALUES (
            p_location_id,
            v_row->>'name',
            NULLIF(v_row->>'floor', ''),
            NULLIF(v_row->>'room', ''),
            NULLIF(v_row->>'bed_number', '')
        )
        ON CONFLICT (location_id, name) DO NOTHING;
        IF FOUND THEN v_count := v_count + 1; END IF;
    END LOOP;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 7. VIEWS
-- ============================================================================

-- 7a. Location summary with department counts
CREATE OR REPLACE VIEW v_location_summary AS
SELECT
    l.id,
    l.location_code,
    l.tenant_id,
    l.name,
    l.building,
    l.address,
    l.city,
    l.state,
    l.pin_code,
    l.email,
    ct.name                                        AS cost_type,
    l.is_active,
    l.end_user_notes,
    l.created_at,
    COUNT(d.id)                                    AS department_count,
    COUNT(d.id) FILTER (WHERE d.is_active)         AS active_departments,
    COALESCE(SUM(
        CASE WHEN d.bed_number ~ '^\d+$' THEN d.bed_number::INT ELSE 0 END
    ), 0)                                           AS total_beds
FROM locations l
LEFT JOIN cost_types ct ON ct.id = l.cost_type_id
LEFT JOIN departments d ON d.location_id = l.id
GROUP BY l.id, ct.name;

-- 7b. Department lookup (for dropdowns in asset registration, tickets, etc.)
CREATE OR REPLACE VIEW v_department_lookup AS
SELECT
    d.id              AS department_id,
    d.name            AS department_name,
    d.floor,
    d.room,
    d.bed_number,
    d.is_active       AS department_active,
    l.id              AS location_id,
    l.location_code,
    l.name            AS location_name,
    l.building,
    l.city,
    l.is_active       AS location_active
FROM departments d
JOIN locations l ON l.id = d.location_id;


-- ============================================================================
-- 8. SEED DATA  (matches UI mock data exactly)
-- ============================================================================
DO $$
DECLARE
    v_tenant UUID := '00000000-0000-0000-0000-000000000001';  -- placeholder tenant
    v_cc     UUID;
    v_pc     UUID;
    v_loc    UUID;
BEGIN
    SELECT id INTO v_cc FROM cost_types WHERE name = 'Cost Center';
    SELECT id INTO v_pc FROM cost_types WHERE name = 'Profit Center';

    -- ----------------------------------------------------------------
    -- LOC-001: Chennai > Main Tower  (8 departments)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Greams Road', 'Main Tower',
            '21, Greams Lane, Off Greams Road', 'Chennai', 'Tamil Nadu', '600006',
            'mainblock@apollochennai.com', v_cc,
            'Primary campus, 8-floor main tower with ICU, OT, and all critical-care departments.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"Intensive Care Unit (ICU)","floor":"3rd Floor","room":"ICU-301","bed_number":"12"},
        {"name":"Operation Theatre Complex","floor":"2nd Floor","room":"OT-201","bed_number":""},
        {"name":"Cardiology","floor":"4th Floor","room":"CARD-401","bed_number":"20"},
        {"name":"Neurology","floor":"5th Floor","room":"NEURO-501","bed_number":"15"},
        {"name":"Emergency Department","floor":"Ground Floor","room":"ER-001","bed_number":"8"},
        {"name":"Oncology","floor":"6th Floor","room":"ONC-601","bed_number":"18"},
        {"name":"Pharmacy","floor":"Ground Floor","room":"PH-002","bed_number":""},
        {"name":"Neonatal ICU (NICU)","floor":"3rd Floor","room":"NICU-305","bed_number":"6"}
    ]'::JSONB);
    UPDATE departments SET is_active = FALSE WHERE location_id = v_loc AND name = 'Pharmacy';

    -- ----------------------------------------------------------------
    -- LOC-002: Chennai > Diagnostic Block  (5 departments)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Greams Road', 'Diagnostic Block',
            '21, Greams Lane, Off Greams Road', 'Chennai', 'Tamil Nadu', '600006',
            'diagnostics@apollochennai.com', v_cc,
            'Houses Radiology, Pathology, Blood Bank, and Dialysis.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"Radiology & Imaging","floor":"Ground Floor","room":"RD-001","bed_number":""},
        {"name":"Pathology Lab","floor":"1st Floor","room":"LAB-101","bed_number":""},
        {"name":"Microbiology Lab","floor":"1st Floor","room":"LAB-102","bed_number":""},
        {"name":"Blood Bank","floor":"2nd Floor","room":"BB-201","bed_number":""},
        {"name":"Dialysis Unit","floor":"3rd Floor","room":"DU-301","bed_number":"10"}
    ]'::JSONB);

    -- ----------------------------------------------------------------
    -- LOC-003: Chennai > Rehabilitation Wing  (3 departments)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Greams Road', 'Rehabilitation Wing',
            '21, Greams Lane, Off Greams Road', 'Chennai', 'Tamil Nadu', '600006',
            'rehab@apollochennai.com', v_cc,
            'Physiotherapy, BME Workshop, and CSSD.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"Physiotherapy","floor":"1st Floor","room":"PT-110","bed_number":""},
        {"name":"Biomedical Engineering","floor":"Basement","room":"BME-B1","bed_number":""},
        {"name":"CSSD","floor":"Ground Floor","room":"CSSD-G01","bed_number":""}
    ]'::JSONB);

    -- ----------------------------------------------------------------
    -- LOC-004: Delhi > Block A - Main Hospital  (6 departments)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Sarita Vihar', 'Block A - Main Hospital',
            'Sarita Vihar, Delhi - Mathura Road', 'New Delhi', 'Delhi', '110076',
            'blocka@apollodelhi.com', v_pc,
            '10-floor main hospital block with all clinical departments.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"ICU","floor":"2nd Floor","room":"ICU-201","bed_number":"10"},
        {"name":"OT Complex","floor":"3rd Floor","room":"OT-301","bed_number":""},
        {"name":"Radiology","floor":"1st Floor","room":"RAD-101","bed_number":""},
        {"name":"Emergency","floor":"Ground Floor","room":"ER-G01","bed_number":"6"},
        {"name":"Cardiology","floor":"4th Floor","room":"C-401","bed_number":"16"},
        {"name":"Neurology","floor":"5th Floor","room":"N-501","bed_number":"12"}
    ]'::JSONB);

    -- ----------------------------------------------------------------
    -- LOC-005: Delhi > Block B - Diagnostics & Research  (4 departments)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Sarita Vihar', 'Block B - Diagnostics & Research',
            'Sarita Vihar, Delhi - Mathura Road', 'New Delhi', 'Delhi', '110076',
            'blockb@apollodelhi.com', v_pc,
            'Pathology, BME Workshop, Research Lab.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"Pathology","floor":"Basement","room":"P-B1","bed_number":""},
        {"name":"BME Workshop","floor":"Basement","room":"BME-B2","bed_number":""},
        {"name":"Research Lab","floor":"3rd Floor","room":"RL-301","bed_number":""},
        {"name":"Pharmacy","floor":"Ground Floor","room":"PH-G01","bed_number":""}
    ]'::JSONB);

    -- ----------------------------------------------------------------
    -- LOC-006: Bangalore > Tower A  (5 departments)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Bannerghatta', 'Tower A',
            '154/11, Bannerghatta Road', 'Bangalore', 'Karnataka', '560076',
            'towera@apolloblr.com', v_cc,
            'ICU, OT, Radiology, Orthopaedics, Emergency.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"ICU","floor":"2nd Floor","room":"ICU-201","bed_number":"8"},
        {"name":"OT","floor":"3rd Floor","room":"OT-301","bed_number":""},
        {"name":"Radiology","floor":"Ground Floor","room":"RD-G01","bed_number":""},
        {"name":"Orthopaedics","floor":"4th Floor","room":"ORTH-401","bed_number":"14"},
        {"name":"Emergency","floor":"Ground Floor","room":"ER-G02","bed_number":"6"}
    ]'::JSONB);

    -- ----------------------------------------------------------------
    -- LOC-007: Bangalore > Tower B - Outpatient  (3 depts, INACTIVE location)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, is_active, end_user_notes)
    VALUES (v_tenant, 'Apollo Hospitals - Bannerghatta', 'Tower B - Outpatient',
            '154/11, Bannerghatta Road', 'Bangalore', 'Karnataka', '560076',
            'towerb@apolloblr.com', v_cc, FALSE,
            'General Medicine OPD, Dermatology OPD, Dental OPD.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"General Medicine OPD","floor":"1st Floor","room":"OPD-101","bed_number":""},
        {"name":"Dermatology OPD","floor":"2nd Floor","room":"OPD-201","bed_number":""},
        {"name":"Dental OPD","floor":"2nd Floor","room":"OPD-205","bed_number":""}
    ]'::JSONB);

    -- ----------------------------------------------------------------
    -- LOC-008: Hyderabad > Single Building  (4 depts, 1 inactive dept)
    -- ----------------------------------------------------------------
    INSERT INTO locations (tenant_id, name, building, address, city, state, pin_code, email, cost_type_id, end_user_notes)
    VALUES (v_tenant, 'Apollo Clinic - Jubilee Hills', 'Single Building',
            'Road No. 36, Jubilee Hills', 'Hyderabad', 'Telangana', '500033',
            'clinic@apollohyd.com', v_cc,
            'Clinic mode - single building, limited biomedical scope.')
    RETURNING id INTO v_loc;

    PERFORM bulk_add_departments(v_loc, '[
        {"name":"General Consultation","floor":"Ground Floor","room":"GC-G01","bed_number":""},
        {"name":"Pharmacy","floor":"Ground Floor","room":"PH-G02","bed_number":""},
        {"name":"Minor OT","floor":"1st Floor","room":"MOT-101","bed_number":"2"},
        {"name":"Diagnostics","floor":"1st Floor","room":"DX-102","bed_number":""}
    ]'::JSONB);
    UPDATE departments SET is_active = FALSE WHERE location_id = v_loc AND name = 'Diagnostics';

    RAISE NOTICE 'Seed complete: 8 locations, 38 departments';
END $$;


-- ============================================================================
-- 9. SAMPLE QUERIES (API reference)
-- ============================================================================

-- All locations for a tenant with dept counts
-- SELECT * FROM v_location_summary WHERE tenant_id = '...' ORDER BY name, building;

-- Departments for a specific location
-- SELECT * FROM departments WHERE location_id = '...' AND is_active = TRUE ORDER BY floor, name;

-- Department dropdown for asset registration (active locations & depts only)
-- SELECT department_id, department_name, floor, room, location_name, building, city
-- FROM v_department_lookup
-- WHERE location_active = TRUE AND department_active = TRUE
-- ORDER BY location_name, building, department_name;
