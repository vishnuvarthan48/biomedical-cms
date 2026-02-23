-- ============================================================================
-- DATABASE DESIGN: Device Management Module (v3)
-- Module     : Asset Management > Device Management
-- Version    : 3.0
-- Convention : BIGINT IDENTITY for all PKs
--              All master/lookup tables are tenant-scoped (tenant_id)
--              FK references use BIGINT id (not VARCHAR enums)
--              Reuses already-created master tables:
--                - inlet_power
--                - voltage_option       (child of inlet_power)
--                - equipment_class_option (child of inlet_power)
--                - equipment_type_option  (child of inlet_power)
--                - device_risk_type
-- ============================================================================


-- ============================================================================
-- SECTION A: MASTER / LOOKUP TABLES (NEW - only tables NOT yet created)
-- ============================================================================
-- Already exist (DO NOT recreate):
--   inlet_power, voltage_option, equipment_class_option,
--   equipment_type_option, device_risk_type
-- ============================================================================


-- A1. device_type (Imaging, Life Support, Patient Monitoring, ...)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_type (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(30) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(300),
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_device_type_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_device_type_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO device_type (tenant_id, code, name, sort_order) VALUES
(1, 'IMAGING',            'Imaging',              1),
(1, 'LIFE_SUPPORT',       'Life Support',         2),
(1, 'PATIENT_MONITORING', 'Patient Monitoring',   3),
(1, 'THERAPEUTIC',        'Therapeutic',          4),
(1, 'STERILIZATION',      'Sterilization',        5),
(1, 'LABORATORY',         'Laboratory',           6),
(1, 'SURGICAL',           'Surgical',             7);


-- A2. country (Country of Origin / Manufacture)
-- ============================================================================
CREATE TABLE IF NOT EXISTS country (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(10) NOT NULL,            -- ISO 3166-1 alpha-2
    name          VARCHAR(100) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_country_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_country_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO country (tenant_id, code, name, sort_order) VALUES
(1, 'IN',  'India',        1),
(1, 'US',  'USA',          2),
(1, 'DE',  'Germany',      3),
(1, 'JP',  'Japan',        4),
(1, 'CN',  'China',        5),
(1, 'NL',  'Netherlands',  6),
(1, 'IL',  'Israel',       7),
(1, 'KR',  'South Korea',  8),
(1, 'GB',  'UK',           9),
(1, 'FR',  'France',      10),
(1, 'IT',  'Italy',       11),
(1, 'CH',  'Switzerland', 12);


-- A3. power_supply_type (AC Mains, Battery, Dual, Solar, UPS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS power_supply_type (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(20) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_power_supply_type_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_power_supply_type_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO power_supply_type (tenant_id, code, name, sort_order) VALUES
(1, 'AC_MAINS', 'AC Mains',               1),
(1, 'BATTERY',  'Battery',                 2),
(1, 'DUAL',     'Dual (AC + Battery)',     3),
(1, 'SOLAR',    'Solar',                   4),
(1, 'UPS',      'UPS',                     5);


-- A4. depreciation_method (Straight Line, Declining Balance, Sum of Years)
-- ============================================================================
CREATE TABLE IF NOT EXISTS depreciation_method (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(30) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_depreciation_method_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_depreciation_method_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO depreciation_method (tenant_id, code, name, sort_order) VALUES
(1, 'STRAIGHT_LINE',     'Straight Line',    1),
(1, 'DECLINING_BALANCE', 'Declining Balance', 2),
(1, 'SUM_OF_YEARS',      'Sum of Years',     3);


-- A5. depreciation_frequency (Monthly, Quarterly, Yearly)
-- ============================================================================
CREATE TABLE IF NOT EXISTS depreciation_frequency (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(20) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_depreciation_frequency_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_depreciation_frequency_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO depreciation_frequency (tenant_id, code, name, sort_order) VALUES
(1, 'MONTHLY',   'Monthly',   1),
(1, 'QUARTERLY', 'Quarterly', 2),
(1, 'YEARLY',    'Yearly',    3);


-- A6. device_status (Draft, Active, Inactive)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_status (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(20) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_device_status_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_device_status_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO device_status (tenant_id, code, name, sort_order) VALUES
(1, 'DRAFT',    'Draft',    1),
(1, 'ACTIVE',   'Active',   2),
(1, 'INACTIVE', 'Inactive', 3);


-- A7. document_category (User Manual, Service Manual, Certificates, ...)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_category (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id        BIGINT NOT NULL,

    code             VARCHAR(50) NOT NULL,
    name             VARCHAR(100) NOT NULL,
    description      VARCHAR(300),
    accepted_formats VARCHAR(100) DEFAULT 'PDF',
    is_system        BOOLEAN NOT NULL DEFAULT TRUE,    -- TRUE = system default, cannot be deleted
    sort_order       INT NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_document_category_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_document_category_tenant_id   UNIQUE (tenant_id, id)
);

INSERT INTO document_category (tenant_id, code, name, description, accepted_formats, is_system, sort_order) VALUES
(1, 'USER_MANUAL',        'User Manual',                    'Equipment user/operator manual',                  'PDF',       TRUE, 1),
(1, 'SERVICE_MANUAL',     'Service Manual',                 'Technical service and repair manual',              'PDF',       TRUE, 2),
(1, 'REGULATORY_CERT',    'Regulatory Certificate',         'FDA/CE/CDSCO approval certificates',              'PDF, JPG',  TRUE, 3),
(1, 'SPARE_PARTS_CATALOG','Spare Parts Catalog',            'OEM spare parts list and catalog',                'PDF, XLSX', TRUE, 4),
(1, 'FACTORY_CALIBRATION','Factory Calibration Certificate','Factory calibration and test certificates',        'PDF',       TRUE, 5),
(1, 'SAFETY_DATA_SHEET',  'Safety Data Sheet',              'Material safety and hazard information',           'PDF',       TRUE, 6),
(1, 'INSTALLATION_GUIDE', 'Installation Guide',             'Site preparation and installation instructions',   'PDF',       TRUE, 7),
(1, 'TRAINING_MATERIAL',  'Training Material',              'Operator training documents and presentations',    'PDF, PPTX', TRUE, 8);


-- ============================================================================
-- SECTION B: CORE TRANSACTION TABLES
-- ============================================================================


-- B1. device_master (Core device registration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_master (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id             BIGINT NOT NULL,
    device_code           VARCHAR(20) NOT NULL,              -- Auto-generated e.g. DEV-00001

    -- General Information
    device_name           VARCHAR(200) NOT NULL,
    device_type_id        BIGINT NOT NULL,                   -- FK -> device_type
    generic_name          VARCHAR(200) NOT NULL,
    device_model          VARCHAR(200) NOT NULL,
    ecri_code             VARCHAR(50),
    manufacturer          VARCHAR(200) NOT NULL,
    model_number          VARCHAR(100),
    catalog_number        VARCHAR(100),
    country_id            BIGINT NOT NULL,                   -- FK -> country
    risk_type_id          BIGINT NOT NULL,                   -- FK -> device_risk_type (EXISTING)
    expected_lifespan     VARCHAR(50),
    regulatory_approval   VARCHAR(200),
    description           TEXT NOT NULL,

    -- Organization / Location Assignment
    org_id                BIGINT NOT NULL,                   -- FK -> organizations (RBAC)
    department_id         BIGINT,                            -- FK -> departments (Location Master)

    -- Device Image
    image_url             TEXT,

    -- Status
    status_id             BIGINT NOT NULL,                   -- FK -> device_status

    -- Audit
    created_by            BIGINT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by            BIGINT,
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Uniqueness
    CONSTRAINT uq_device_master_tenant_code UNIQUE (tenant_id, device_code),
    CONSTRAINT uq_device_master_tenant_id   UNIQUE (tenant_id, id),

    -- Foreign Keys (tenant-scoped composite)
    CONSTRAINT fk_dm_device_type FOREIGN KEY (tenant_id, device_type_id)
        REFERENCES device_type(tenant_id, id),
    CONSTRAINT fk_dm_country FOREIGN KEY (tenant_id, country_id)
        REFERENCES country(tenant_id, id),
    CONSTRAINT fk_dm_risk_type FOREIGN KEY (tenant_id, risk_type_id)
        REFERENCES device_risk_type(tenant_id, id),
    CONSTRAINT fk_dm_status FOREIGN KEY (tenant_id, status_id)
        REFERENCES device_status(tenant_id, id)
);

-- Add unique constraint on device_risk_type for composite FK
-- (only if not already present in the user's original table)
-- ALTER TABLE device_risk_type ADD CONSTRAINT uq_device_risk_type_tenant_id UNIQUE (tenant_id, id);

CREATE INDEX idx_dm_tenant        ON device_master(tenant_id);
CREATE INDEX idx_dm_org           ON device_master(tenant_id, org_id);
CREATE INDEX idx_dm_device_type   ON device_master(tenant_id, device_type_id);
CREATE INDEX idx_dm_status        ON device_master(tenant_id, status_id);
CREATE INDEX idx_dm_manufacturer  ON device_master(tenant_id, manufacturer);
CREATE INDEX idx_dm_name          ON device_master(tenant_id, device_name);


-- B2. device_technical_specs (1:1 with device_master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_technical_specs (
    id                     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id              BIGINT NOT NULL,
    device_id              BIGINT NOT NULL,

    -- Power & Electrical
    power_rating           VARCHAR(50),                     -- e.g. 5 kVA
    power_rating_typical   VARCHAR(50),                     -- e.g. 3.5 kVA
    power_rating_max       VARCHAR(50),                     -- e.g. 8 kVA
    inlet_power_id         BIGINT,                          -- FK -> inlet_power (EXISTING)
    voltage_option_id      BIGINT,                          -- FK -> voltage_option (EXISTING)
    power_supply_type_id   BIGINT,                          -- FK -> power_supply_type (NEW)

    -- Equipment Classification
    equipment_class_id     BIGINT,                          -- FK -> equipment_class_option (EXISTING)
    equipment_type_id      BIGINT,                          -- FK -> equipment_type_option (EXISTING)

    -- Physical Specifications
    weight                 VARCHAR(50),                     -- e.g. 2500 kg
    dimensions             VARCHAR(100),                    -- e.g. 250 x 170 x 200 cm
    operating_temp         VARCHAR(50),                     -- e.g. 18-24 C
    connectivity           VARCHAR(200),                    -- e.g. DICOM, HL7, Wi-Fi

    -- Audit
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Uniqueness (1:1)
    CONSTRAINT uq_dts_tenant_device UNIQUE (tenant_id, device_id),

    -- Foreign Keys (tenant-scoped composite)
    CONSTRAINT fk_dts_device FOREIGN KEY (tenant_id, device_id)
        REFERENCES device_master(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_dts_inlet_power FOREIGN KEY (tenant_id, inlet_power_id)
        REFERENCES inlet_power(tenant_id, id),
    CONSTRAINT fk_dts_voltage FOREIGN KEY (tenant_id, voltage_option_id)
        REFERENCES voltage_option(tenant_id, id),
    CONSTRAINT fk_dts_power_supply FOREIGN KEY (tenant_id, power_supply_type_id)
        REFERENCES power_supply_type(tenant_id, id),
    CONSTRAINT fk_dts_equip_class FOREIGN KEY (tenant_id, equipment_class_id)
        REFERENCES equipment_class_option(tenant_id, id),
    CONSTRAINT fk_dts_equip_type FOREIGN KEY (tenant_id, equipment_type_id)
        REFERENCES equipment_type_option(tenant_id, id)
);

-- NOTE: voltage_option, equipment_class_option, equipment_type_option need
-- a UNIQUE(tenant_id, id) constraint for composite FK. Add if not present:
-- ALTER TABLE voltage_option          ADD CONSTRAINT uq_voltage_option_tenant_id          UNIQUE (tenant_id, id);
-- ALTER TABLE equipment_class_option  ADD CONSTRAINT uq_equipment_class_option_tenant_id  UNIQUE (tenant_id, id);
-- ALTER TABLE equipment_type_option   ADD CONSTRAINT uq_equipment_type_option_tenant_id   UNIQUE (tenant_id, id);


-- B3. device_depreciation (1:1 with device_master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_depreciation (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id             BIGINT NOT NULL,
    device_id             BIGINT NOT NULL,

    dep_method_id         BIGINT,                           -- FK -> depreciation_method
    useful_life           VARCHAR(50),                      -- e.g. 10 years
    salvage_value         DECIMAL(15, 2),                   -- e.g. 50000.00
    dep_rate              DECIMAL(5, 2),                    -- e.g. 10.00 (%)
    dep_frequency_id      BIGINT,                           -- FK -> depreciation_frequency

    -- Audit
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Uniqueness (1:1)
    CONSTRAINT uq_dd_tenant_device UNIQUE (tenant_id, device_id),

    -- Foreign Keys (tenant-scoped composite)
    CONSTRAINT fk_dd_device FOREIGN KEY (tenant_id, device_id)
        REFERENCES device_master(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_dd_method FOREIGN KEY (tenant_id, dep_method_id)
        REFERENCES depreciation_method(tenant_id, id),
    CONSTRAINT fk_dd_frequency FOREIGN KEY (tenant_id, dep_frequency_id)
        REFERENCES depreciation_frequency(tenant_id, id)
);


-- B4. device_documents (1:N with device_master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_documents (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id             BIGINT NOT NULL,
    device_id             BIGINT NOT NULL,
    category_id           BIGINT NOT NULL,                  -- FK -> document_category

    -- File metadata
    file_name             VARCHAR(300) NOT NULL,
    file_url              TEXT NOT NULL,
    file_size_bytes       BIGINT,
    file_type             VARCHAR(50),                      -- MIME type

    -- Audit
    uploaded_by           BIGINT,
    uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign Keys (tenant-scoped composite)
    CONSTRAINT fk_ddoc_device FOREIGN KEY (tenant_id, device_id)
        REFERENCES device_master(tenant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_ddoc_category FOREIGN KEY (tenant_id, category_id)
        REFERENCES document_category(tenant_id, id),

    -- Constraints
    CONSTRAINT chk_ddoc_filename CHECK (TRIM(file_name) <> '')
);

CREATE INDEX idx_ddoc_tenant_device   ON device_documents(tenant_id, device_id);
CREATE INDEX idx_ddoc_tenant_category ON device_documents(tenant_id, device_id, category_id);


-- B5. device_service_mapping (1:N with device_master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_service_mapping (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id             BIGINT NOT NULL,
    device_id             BIGINT NOT NULL,

    service_name          VARCHAR(200) NOT NULL,
    hims_procedure_code   VARCHAR(50) NOT NULL,
    price                 DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    effective_from        DATE NOT NULL,
    effective_to          DATE,                              -- NULL = ongoing
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit
    created_by            BIGINT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Foreign Keys (tenant-scoped composite)
    CONSTRAINT fk_dsm_device FOREIGN KEY (tenant_id, device_id)
        REFERENCES device_master(tenant_id, id) ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_dsm_price     CHECK (price >= 0),
    CONSTRAINT chk_dsm_eff_range CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX idx_dsm_tenant_device ON device_service_mapping(tenant_id, device_id);
CREATE INDEX idx_dsm_tenant_code   ON device_service_mapping(tenant_id, hims_procedure_code);
CREATE INDEX idx_dsm_active        ON device_service_mapping(tenant_id, device_id, is_active);


-- ============================================================================
-- SECTION C: VIEW FOR LIST PAGE
-- ============================================================================

CREATE OR REPLACE VIEW vw_device_master_summary AS
SELECT
    dm.id,
    dm.tenant_id,
    dm.device_code,
    dm.device_name,
    dt.name                          AS device_type,
    dm.generic_name,
    dm.device_model,
    dm.manufacturer,
    c.name                           AS country_of_origin,
    drt.name                         AS risk_type,
    dm.expected_lifespan,
    dm.org_id,
    dm.department_id,
    ds.name                          AS status,
    ds.code                          AS status_code,
    dm.image_url,
    dm.created_at,
    -- Aggregated counts
    COALESCE(ac.asset_count, 0)      AS linked_assets,
    COALESCE(dc.doc_count, 0)        AS document_count,
    COALESCE(sc.service_count, 0)    AS service_count
FROM device_master dm
    JOIN device_type       dt  ON dt.tenant_id  = dm.tenant_id AND dt.id  = dm.device_type_id
    JOIN country           c   ON c.tenant_id   = dm.tenant_id AND c.id   = dm.country_id
    JOIN device_risk_type  drt ON drt.tenant_id = dm.tenant_id AND drt.id = dm.risk_type_id
    JOIN device_status     ds  ON ds.tenant_id  = dm.tenant_id AND ds.id  = dm.status_id
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::INT AS asset_count
        FROM asset_registration ar
        WHERE ar.device_id = dm.id AND ar.tenant_id = dm.tenant_id
    ) ac ON TRUE
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::INT AS doc_count
        FROM device_documents dd
        WHERE dd.device_id = dm.id AND dd.tenant_id = dm.tenant_id
    ) dc ON TRUE
    LEFT JOIN LATERAL (
        SELECT COUNT(*)::INT AS service_count
        FROM device_service_mapping dsm
        WHERE dsm.device_id = dm.id AND dsm.tenant_id = dm.tenant_id AND dsm.is_active = TRUE
    ) sc ON TRUE;


-- ============================================================================
-- SECTION D: ENTITY RELATIONSHIP DIAGRAM (Text)
-- ============================================================================
--
--  EXISTING MASTER TABLES (already created)   NEW MASTER TABLES (created above)
--  =========================================  ====================================
--  inlet_power                                device_type
--    +-- voltage_option (child)               country
--    +-- equipment_class_option (child)       power_supply_type
--    +-- equipment_type_option (child)        depreciation_method
--  device_risk_type                           depreciation_frequency
--                                             device_status
--                                             document_category
--
--  All tables are tenant-scoped (tenant_id) with composite FK:
--    FOREIGN KEY (tenant_id, <ref_id>) REFERENCES <table>(tenant_id, id)
--
--
--  device_type ---------------+
--  country -------------------+
--  device_risk_type ----------+------>  device_master
--  device_status -------------+         |  id (PK, BIGINT IDENTITY)
--                                       |  tenant_id
--                                       |  device_code (UNIQUE per tenant)
--                                       |  device_name, generic_name
--                                       |  device_type_id (FK)
--                                       |  country_id (FK)
--                                       |  risk_type_id (FK)
--                                       |  org_id, department_id
--                                       |  status_id (FK)
--                                       |
--  inlet_power ---------------+         +---> device_technical_specs (1:1)
--  voltage_option ------------+         |       inlet_power_id (FK -> inlet_power)
--  power_supply_type ---------+-------->|       voltage_option_id (FK -> voltage_option)
--  equipment_class_option ----+         |       power_supply_type_id (FK -> power_supply_type)
--  equipment_type_option -----+         |       equipment_class_id (FK -> equipment_class_option)
--                                       |       equipment_type_id (FK -> equipment_type_option)
--                                       |
--  depreciation_method -------+         +---> device_depreciation (1:1)
--  depreciation_frequency ----+-------->|       dep_method_id (FK)
--                                       |       dep_frequency_id (FK)
--                                       |
--  document_category ---------+         +---> device_documents (1:N)
--                             +-------->|       category_id (FK)
--                                       |
--                                       +---> device_service_mapping (1:N)
--                                              hims_procedure_code
--                                              price, effective_from/to
--
--
-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 1. PK STRATEGY: All tables use BIGINT GENERATED ALWAYS AS IDENTITY.
--    No UUIDs. Sequence auto-increments.
--
-- 2. TENANT ISOLATION: Every table has tenant_id. All FK references use
--    composite keys (tenant_id, id) to enforce cross-tenant integrity.
--    UNIQUE(tenant_id, id) on all master tables enables composite FKs.
--
-- 3. EXISTING TABLES REUSED (5):
--    inlet_power, voltage_option, equipment_class_option,
--    equipment_type_option, device_risk_type
--    These were already created with the correct tenant-scoped pattern.
--    voltage_option/equipment_class_option/equipment_type_option are
--    child tables of inlet_power (cascading dropdown dependency).
--
-- 4. NEW MASTER TABLES CREATED (7):
--    device_type, country, power_supply_type, depreciation_method,
--    depreciation_frequency, device_status, document_category
--
-- 5. TRANSACTION TABLES (5):
--    device_master, device_technical_specs, device_depreciation,
--    device_documents, device_service_mapping
--
-- 6. NAMING CONVENTION: No "master_" prefix. Table names match the
--    domain entity directly (e.g. device_type, not master_device_type).
--    Matches the existing table naming pattern.
--
-- 7. COMPOSITE FK NOTE: The existing tables (voltage_option,
--    equipment_class_option, equipment_type_option) need a
--    UNIQUE(tenant_id, id) constraint for composite FK to work.
--    Run the commented ALTER TABLE statements if not already present.
--
-- 8. CASCADING DROPDOWNS: When user selects inlet_power in the UI,
--    voltage_option, equipment_class_option, and equipment_type_option
--    are filtered by (tenant_id, inlet_power_id) -- the child FK
--    relationship handles this filtering automatically.
--
-- 9. VIEW: vw_device_master_summary joins all master tables via
--    tenant-scoped JOINs for the list page display.
--
-- ============================================================================
