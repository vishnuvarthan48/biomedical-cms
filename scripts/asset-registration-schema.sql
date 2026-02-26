-- ============================================================================
-- ASSET REGISTRATION Database Schema - PostgreSQL
-- CMMS Biomedical Module
-- ============================================================================
-- Covers all 12 tabs of the Asset Registration form:
--   1. Generic  2. Accessories  3. Child Assets  4. S/W & Network
--   5. Location  6. Asset Tracking (BLE)  7. Vendor  8. Installation Records
--   9. Maintenance  10. Contract  11. Documents  12. Barcode / QR
--
-- All dropdown fields are backed by FK-referenced lookup/base tables.
-- Shared base tables (hospitals, vendors) reference grn-schema.sql.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. LOOKUP / BASE TABLES  (FK sources for every dropdown)
-- ============================================================================

-- 1a. Countries (FK for Country of Origin dropdown)
CREATE TABLE IF NOT EXISTS countries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_code    VARCHAR(10) UNIQUE NOT NULL,       -- e.g. USA, DE, JP
    country_name    VARCHAR(150) NOT NULL,              -- United States, Germany
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE countries IS 'Lookup: Country of Origin dropdown in Generic tab';

INSERT INTO countries (country_code, country_name) VALUES
    ('USA', 'United States'),
    ('DE', 'Germany'),
    ('JP', 'Japan'),
    ('NL', 'Netherlands'),
    ('IN', 'India'),
    ('KR', 'South Korea'),
    ('GB', 'United Kingdom'),
    ('FR', 'France'),
    ('IL', 'Israel'),
    ('CN', 'China')
ON CONFLICT (country_code) DO NOTHING;

-- 1b. Currencies (FK for Currency dropdown in Purchase Cost)
CREATE TABLE IF NOT EXISTS currencies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency_code   VARCHAR(10) UNIQUE NOT NULL,       -- INR, USD, EUR
    currency_name   VARCHAR(100) NOT NULL,              -- Indian Rupee
    symbol          VARCHAR(10),                        -- Rs, $
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE currencies IS 'Lookup: Currency dropdown in Purchase Cost section';

INSERT INTO currencies (currency_code, currency_name, symbol) VALUES
    ('INR', 'Indian Rupee', 'Rs'),
    ('USD', 'US Dollar', '$'),
    ('EUR', 'Euro', 'E'),
    ('GBP', 'British Pound', 'P'),
    ('AED', 'UAE Dirham', 'AED'),
    ('SAR', 'Saudi Riyal', 'SAR')
ON CONFLICT (currency_code) DO NOTHING;

-- 1c. Device Types (FK for Device Type dropdown)
CREATE TABLE IF NOT EXISTS device_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name       VARCHAR(100) UNIQUE NOT NULL,      -- Imaging, Life Support, etc.
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE device_types IS 'Lookup: Device Type dropdown in Generic tab & Device Management';

INSERT INTO device_types (type_name) VALUES
    ('Imaging'), ('Life Support'), ('Laboratory'), ('Surgical'),
    ('Patient Monitoring'), ('Sterilization'), ('Therapeutic'),
    ('Infusion'), ('Emergency'), ('Diagnostic')
ON CONFLICT (type_name) DO NOTHING;

-- 1d. Asset Categories (FK for Asset Category dropdown)
CREATE TABLE IF NOT EXISTS asset_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_code   VARCHAR(50) UNIQUE NOT NULL,       -- imaging, life-support, lab
    category_name   VARCHAR(150) NOT NULL,              -- Imaging, Life Support
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE asset_categories IS 'Lookup: Asset Category dropdown in Classification & Status';

INSERT INTO asset_categories (category_code, category_name) VALUES
    ('imaging', 'Imaging'),
    ('life-support', 'Life Support'),
    ('lab', 'Laboratory'),
    ('surgical', 'Surgical'),
    ('monitoring', 'Patient Monitoring'),
    ('sterilization', 'Sterilization')
ON CONFLICT (category_code) DO NOTHING;

-- 1e. Asset Sub-Categories (FK for Asset Sub-Category dropdown, cascaded from category)
CREATE TABLE IF NOT EXISTS asset_sub_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL REFERENCES asset_categories(id) ON DELETE CASCADE,
    sub_code        VARCHAR(50) NOT NULL,
    sub_name        VARCHAR(150) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (category_id, sub_code)
);

COMMENT ON TABLE asset_sub_categories IS 'Lookup: Asset Sub-Category dropdown, filtered by parent category';

INSERT INTO asset_sub_categories (category_id, sub_code, sub_name)
SELECT c.id, v.sub_code, v.sub_name
FROM asset_categories c
CROSS JOIN (VALUES ('mri', 'MRI'), ('ct', 'CT'), ('xray', 'X-Ray')) AS v(sub_code, sub_name)
WHERE c.category_code = 'imaging'
ON CONFLICT DO NOTHING;

-- 1f. Asset Statuses (FK for Asset Status dropdown)
CREATE TABLE IF NOT EXISTS asset_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_code     VARCHAR(50) UNIQUE NOT NULL,
    status_name     VARCHAR(100) NOT NULL,
    color_hex       VARCHAR(10),                       -- for badge display
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE asset_statuses IS 'Lookup: Asset Status dropdown in Classification & Status';

INSERT INTO asset_statuses (status_code, status_name) VALUES
    ('working', 'Working Fine'),
    ('repair', 'Under Repair'),
    ('condemned', 'Condemned'),
    ('standby', 'Standby'),
    ('new', 'New'),
    ('not-installed', 'Not Installed')
ON CONFLICT (status_code) DO NOTHING;

-- 1g. Depreciation Methods (FK for Depreciation Method dropdown)
CREATE TABLE IF NOT EXISTS depreciation_methods (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_code     VARCHAR(20) UNIQUE NOT NULL,       -- SLM, WDV, DDB, SYD, UOP, NONE
    method_name     VARCHAR(100) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE depreciation_methods IS 'Lookup: Depreciation Method dropdown';

INSERT INTO depreciation_methods (method_code, method_name) VALUES
    ('SLM', 'Straight Line Method (SLM)'),
    ('WDV', 'Written Down Value (WDV)'),
    ('DDB', 'Double Declining Balance'),
    ('SYD', 'Sum of Years Digits'),
    ('UOP', 'Units of Production'),
    ('NONE', 'No Depreciation')
ON CONFLICT (method_code) DO NOTHING;

-- 1h. Depreciation Frequencies (FK for Depreciation Frequency dropdown)
CREATE TABLE IF NOT EXISTS depreciation_frequencies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    frequency_code  VARCHAR(20) UNIQUE NOT NULL,       -- MONTHLY, QUARTERLY, etc.
    frequency_name  VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO depreciation_frequencies (frequency_code, frequency_name) VALUES
    ('MONTHLY', 'Monthly'),
    ('QUARTERLY', 'Quarterly'),
    ('SEMI_ANNUAL', 'Semi-Annual'),
    ('ANNUAL', 'Annual')
ON CONFLICT (frequency_code) DO NOTHING;

-- 1i. Funding Sources (FK for Funding Source dropdown)
CREATE TABLE IF NOT EXISTS funding_sources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_code     VARCHAR(20) UNIQUE NOT NULL,
    source_name     VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO funding_sources (source_code, source_name) VALUES
    ('CAPEX', 'Capital Expenditure (CAPEX)'),
    ('OPEX', 'Operating Expenditure (OPEX)'),
    ('GRANT', 'Grant / Donation'),
    ('LEASE', 'Lease'),
    ('LOAN', 'Loan Funded')
ON CONFLICT (source_code) DO NOTHING;

-- 1j. Connection Types (FK for Connection Type dropdown in Configuration)
CREATE TABLE IF NOT EXISTS connection_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(20) UNIQUE NOT NULL,
    type_name       VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO connection_types (type_code, type_name) VALUES
    ('WIRED', 'Wired'), ('WIRELESS', 'Wireless'), ('BLUETOOTH', 'Bluetooth'),
    ('USB', 'USB'), ('SERIAL', 'Serial'), ('NONE', 'None')
ON CONFLICT (type_code) DO NOTHING;

-- 1k. Departments (FK for Department dropdown in Location tab)
CREATE TABLE IF NOT EXISTS departments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    dept_code       VARCHAR(50) NOT NULL,
    dept_name       VARCHAR(150) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (hospital_id, dept_code)
);

COMMENT ON TABLE departments IS 'Lookup: Department dropdown in Location tab, filtered by hospital';

INSERT INTO departments (hospital_id, dept_code, dept_name)
SELECT h.id, v.code, v.name
FROM hospitals h
CROSS JOIN (VALUES
    ('radiology', 'Radiology'), ('icu', 'ICU'), ('emergency', 'Emergency'),
    ('obgyn', 'OB/GYN'), ('cssd', 'CSSD'), ('general', 'General Ward')
) AS v(code, name)
WHERE h.status = 'Active'
ON CONFLICT DO NOTHING;

-- 1l. Accessory Types (FK for Accessory Type dropdown)
CREATE TABLE IF NOT EXISTS accessory_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(30) UNIQUE NOT NULL,
    type_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO accessory_types (type_code, type_name) VALUES
    ('PROBE', 'Probe'), ('CABLE', 'Cable'), ('ADAPTER', 'Adapter'),
    ('BATTERY', 'Battery'), ('SENSOR', 'Sensor'), ('TRANSDUCER', 'Transducer'),
    ('PERIPHERAL', 'Peripheral'), ('OTHER', 'Other')
ON CONFLICT (type_code) DO NOTHING;

-- 1m. Accessory Conditions (FK for Condition dropdown)
CREATE TABLE IF NOT EXISTS accessory_conditions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_code  VARCHAR(20) UNIQUE NOT NULL,
    condition_name  VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO accessory_conditions (condition_code, condition_name) VALUES
    ('NEW', 'New'), ('GOOD', 'Good'), ('FAIR', 'Fair'), ('REPLACE', 'Needs Replacement')
ON CONFLICT (condition_code) DO NOTHING;

-- 1n. IP Types (FK for IP Type dropdown in S/W & Network)
CREATE TABLE IF NOT EXISTS ip_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(20) UNIQUE NOT NULL,
    type_name       VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ip_types (type_code, type_name) VALUES
    ('STATIC', 'Static'), ('DHCP', 'DHCP'), ('NONE', 'None')
ON CONFLICT (type_code) DO NOTHING;

-- 1o. License Types (FK for License Type dropdown - Software License)
CREATE TABLE IF NOT EXISTS sw_license_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(30) UNIQUE NOT NULL,
    type_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sw_license_types (type_code, type_name) VALUES
    ('PERPETUAL', 'Perpetual'), ('SUBSCRIPTION', 'Subscription'),
    ('TRIAL', 'Trial'), ('OEM', 'OEM'), ('OPEN_SOURCE', 'Open Source')
ON CONFLICT (type_code) DO NOTHING;

-- 1p. Integration License Types (FK for Integration License Type dropdown)
CREATE TABLE IF NOT EXISTS integration_license_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(30) UNIQUE NOT NULL,
    type_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO integration_license_types (type_code, type_name) VALUES
    ('DICOM', 'DICOM'), ('HL7', 'HL7'), ('API', 'API'),
    ('CUSTOM', 'Custom'), ('OTHER', 'Other')
ON CONFLICT (type_code) DO NOTHING;

-- 1q. BLE Beacon Types (FK for Beacon Type dropdown in Asset Tracking)
CREATE TABLE IF NOT EXISTS ble_beacon_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(30) UNIQUE NOT NULL,
    type_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ble_beacon_types (type_code, type_name) VALUES
    ('IBEACON', 'Apple iBeacon'), ('EDDYSTONE', 'Google Eddystone'),
    ('ALTBEACON', 'AltBeacon'), ('CUSTOM', 'Custom BLE Beacon')
ON CONFLICT (type_code) DO NOTHING;

-- 1r. BLE Beacon Manufacturers (FK for Manufacturer dropdown in Asset Tracking)
CREATE TABLE IF NOT EXISTS ble_manufacturers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mfr_code        VARCHAR(30) UNIQUE NOT NULL,
    mfr_name        VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO ble_manufacturers (mfr_code, mfr_name) VALUES
    ('KONTAKT', 'Kontakt.io'), ('ESTIMOTE', 'Estimote'), ('MINEW', 'Minew'),
    ('ARUBA', 'Aruba Networks'), ('CISCO', 'Cisco Meraki'),
    ('ZEBRA', 'Zebra Technologies'), ('OTHER', 'Other')
ON CONFLICT (mfr_code) DO NOTHING;

-- 1s. Battery Types (FK for Battery Type dropdown)
CREATE TABLE IF NOT EXISTS battery_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(30) UNIQUE NOT NULL,
    type_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO battery_types (type_code, type_name) VALUES
    ('CR2032', 'CR2032 (Coin Cell)'), ('CR2477', 'CR2477'),
    ('AA', 'AA Battery'), ('AAA', 'AAA Battery'),
    ('RECHARGEABLE', 'Rechargeable Li-Ion'), ('USB_POWERED', 'USB Powered')
ON CONFLICT (type_code) DO NOTHING;

-- 1t. Tracking Zones (FK for Assigned Zone dropdown)
CREATE TABLE IF NOT EXISTS tracking_zones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    zone_code       VARCHAR(30) NOT NULL,
    zone_name       VARCHAR(150) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (hospital_id, zone_code)
);

COMMENT ON TABLE tracking_zones IS 'Lookup: Assigned Zone dropdown in BLE / Geo-Fence section';

INSERT INTO tracking_zones (hospital_id, zone_code, zone_name)
SELECT h.id, v.code, v.name
FROM hospitals h
CROSS JOIN (VALUES
    ('ZONE_A', 'Zone A - ICU Wing'), ('ZONE_B', 'Zone B - Emergency'),
    ('ZONE_C', 'Zone C - Radiology'), ('ZONE_D', 'Zone D - OT Complex'),
    ('ZONE_E', 'Zone E - General Ward'), ('ZONE_F', 'Zone F - CSSD'),
    ('ZONE_G', 'Zone G - Store / Utility')
) AS v(code, name)
WHERE h.status = 'Active'
ON CONFLICT DO NOTHING;

-- 1u. Floors (FK for Floor dropdown in Zone Mapping)
CREATE TABLE IF NOT EXISTS floors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    floor_code      VARCHAR(10) NOT NULL,
    floor_name      VARCHAR(50) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (hospital_id, floor_code)
);

INSERT INTO floors (hospital_id, floor_code, floor_name, sort_order)
SELECT h.id, v.code, v.name, v.sort_order
FROM hospitals h
CROSS JOIN (VALUES
    ('B1', 'Basement 1', 0), ('GF', 'Ground Floor', 1), ('1F', '1st Floor', 2),
    ('2F', '2nd Floor', 3), ('3F', '3rd Floor', 4), ('4F', '4th Floor', 5),
    ('5F', '5th Floor', 6)
) AS v(code, name, sort_order)
WHERE h.status = 'Active'
ON CONFLICT DO NOTHING;

-- 1v. BLE Gateways / Readers (FK for Nearest Gateway dropdown)
CREATE TABLE IF NOT EXISTS ble_gateways (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    gateway_code    VARCHAR(30) NOT NULL,
    gateway_name    VARCHAR(150) NOT NULL,
    location_desc   VARCHAR(200),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (hospital_id, gateway_code)
);

INSERT INTO ble_gateways (hospital_id, gateway_code, gateway_name, location_desc)
SELECT h.id, v.code, v.name, v.loc
FROM hospitals h
CROSS JOIN (VALUES
    ('GW-001', 'GW-001 - ICU Corridor', 'ICU Wing Corridor'),
    ('GW-002', 'GW-002 - ER Entrance', 'Emergency Room Entrance'),
    ('GW-003', 'GW-003 - Radiology Lobby', 'Radiology Department Lobby'),
    ('GW-004', 'GW-004 - OT Corridor', 'OT Complex Corridor'),
    ('GW-005', 'GW-005 - Store Room', 'Biomedical Store Room')
) AS v(code, name, loc)
WHERE h.status = 'Active'
ON CONFLICT DO NOTHING;

-- 1w. Geo-Fence Alert Types (FK for Exit Alert Type dropdown)
CREATE TABLE IF NOT EXISTS geo_fence_alert_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_code      VARCHAR(20) UNIQUE NOT NULL,
    alert_name      VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO geo_fence_alert_types (alert_code, alert_name) VALUES
    ('EMAIL', 'Email Notification'), ('SMS', 'SMS Alert'),
    ('PUSH', 'Push Notification'), ('DASHBOARD', 'Dashboard Alert'),
    ('ALL', 'All Channels')
ON CONFLICT (alert_code) DO NOTHING;

-- 1x. Beacon Placement Positions (FK for Placement on Asset dropdown)
CREATE TABLE IF NOT EXISTS beacon_placements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_code  VARCHAR(20) UNIQUE NOT NULL,
    placement_name  VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO beacon_placements (placement_code, placement_name) VALUES
    ('TOP', 'Top'), ('FRONT', 'Front Panel'), ('REAR', 'Rear Panel'),
    ('SIDE_L', 'Left Side'), ('SIDE_R', 'Right Side'),
    ('BOTTOM', 'Bottom / Chassis'), ('INTERNAL', 'Internal')
ON CONFLICT (placement_code) DO NOTHING;

-- 1y. Beacon Purpose (FK for Purpose dropdown in Additional Beacons)
CREATE TABLE IF NOT EXISTS beacon_purposes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purpose_code    VARCHAR(20) UNIQUE NOT NULL,
    purpose_name    VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO beacon_purposes (purpose_code, purpose_name) VALUES
    ('PRIMARY', 'Primary Tracking'), ('SECONDARY', 'Secondary / Redundancy'),
    ('TAMPER', 'Tamper Detection'), ('ENVIRONMENT', 'Environmental Sensor')
ON CONFLICT (purpose_code) DO NOTHING;

-- 1z. Warranty Statuses (FK for Warranty Status dropdown)
CREATE TABLE IF NOT EXISTS warranty_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_code     VARCHAR(20) UNIQUE NOT NULL,
    status_name     VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO warranty_statuses (status_code, status_name) VALUES
    ('ACTIVE', 'Active'), ('EXPIRED', 'Expired'),
    ('EXTENDED', 'Extended'), ('NA', 'Not Applicable')
ON CONFLICT (status_code) DO NOTHING;

-- 1aa. Maintenance Types (FK for Maintenance Schedule rows)
CREATE TABLE IF NOT EXISTS maintenance_types (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_code       VARCHAR(30) UNIQUE NOT NULL,
    type_name       VARCHAR(150) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO maintenance_types (type_code, type_name, sort_order) VALUES
    ('EXT_PM', 'External PM (Service Provider)', 1),
    ('INT_PM', 'Internal PM (In-House BME)', 2),
    ('EST', 'Electrical Safety Test (EST)', 3),
    ('CALIBRATION', 'QA/QC/Calibration', 4),
    ('BATTERY', 'Battery Replacement', 5),
    ('FILTER', 'Filter Replacement', 6),
    ('OTHER', 'Other Maintenance', 7)
ON CONFLICT (type_code) DO NOTHING;

-- 1bb. Maintenance Frequencies lookup table removed.
--      Frequency is now captured as a direct integer (nos in months)
--      on asset_maintenance_schedules.frequency_months column.

-- 1cc. Maintenance Assigned To (FK for Assigned To dropdown)
CREATE TABLE IF NOT EXISTS maintenance_assignees (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignee_code   VARCHAR(30) UNIQUE NOT NULL,
    assignee_name   VARCHAR(100) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO maintenance_assignees (assignee_code, assignee_name) VALUES
    ('INHOUSE', 'In-House BME'),
    ('VENDOR', 'Vendor / OEM'),
    ('THIRD_PARTY', 'Third Party')
ON CONFLICT (assignee_code) DO NOTHING;

-- 1dd. Document Categories (FK for Document Categories in Documents tab)
CREATE TABLE IF NOT EXISTS document_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name   VARCHAR(150) UNIQUE NOT NULL,
    description     TEXT,
    accepted_formats VARCHAR(100) DEFAULT 'PDF, DOC',
    is_system       BOOLEAN NOT NULL DEFAULT TRUE,     -- system = cannot be deleted by user
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE document_categories IS 'Lookup: Document category list in Documents tab. System categories cannot be deleted.';

INSERT INTO document_categories (category_name, description, accepted_formats, is_system, sort_order) VALUES
    ('Specifications', 'Product specifications, datasheets, and technical documentation', 'PDF, DOC', TRUE, 1),
    ('Quotations', 'Vendor quotations and price comparisons', 'PDF, XLS', TRUE, 2),
    ('Pre-evaluation', 'Pre-purchase evaluation reports and assessments', 'PDF, DOC', TRUE, 3),
    ('Technical Comparison Report', 'Technical comparison between shortlisted equipment', 'PDF, XLS', TRUE, 4),
    ('Supplier Integrity Checklist', 'Supplier verification and due diligence records', 'PDF, DOC', TRUE, 5),
    ('Tax Invoice', 'Purchase invoice and tax documentation', 'PDF', TRUE, 6),
    ('Delivery Note', 'Goods receipt and delivery confirmation documents', 'PDF', TRUE, 7),
    ('Factory Calibration Certificate', 'OEM calibration certificates and test reports', 'PDF', TRUE, 8),
    ('Contract Agreement', 'Service contracts, AMC/CMC agreements', 'PDF, DOC', TRUE, 9),
    ('PPM Schedule', 'Planned preventive maintenance schedule documents', 'PDF, XLS', TRUE, 10),
    ('Authorized Distributor Letter / LOA', 'Letter of authorization from manufacturer', 'PDF', TRUE, 11),
    ('Trade License', 'Vendor trade license and registration certificates', 'PDF', TRUE, 12),
    ('Post Evaluation Report', 'Post-installation performance evaluation', 'PDF, DOC', TRUE, 13),
    ('Safety Assessment', 'Electrical safety and risk assessment reports', 'PDF', TRUE, 14),
    ('Discard Report', 'Equipment condemnation and disposal documentation', 'PDF, DOC', TRUE, 15),
    ('Beyond Economical Report', 'BER analysis and cost justification for replacement', 'PDF, XLS', TRUE, 16)
ON CONFLICT (category_name) DO NOTHING;

-- 1ee. BME Users / Asset Owners (FK for Asset Owner BME dropdown)
CREATE TABLE IF NOT EXISTS bme_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    employee_code   VARCHAR(50),
    full_name       VARCHAR(200) NOT NULL,
    designation     VARCHAR(100),
    email           VARCHAR(200),
    mobile          VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bme_users IS 'Lookup: Asset Owner BME dropdown, Maintenance Assigned To personnel';

-- 1ff. Risk Classifications (FK for Risk Classification in Device Management)
CREATE TABLE IF NOT EXISTS risk_classifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_code      VARCHAR(20) UNIQUE NOT NULL,
    class_name      VARCHAR(100) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO risk_classifications (class_code, class_name) VALUES
    ('CLASS_I', 'Class I - Low Risk'),
    ('CLASS_II', 'Class II - Medium Risk'),
    ('CLASS_III', 'Class III - High Risk')
ON CONFLICT (class_code) DO NOTHING;

-- 1gg. Beacon Statuses (FK for Beacon Status dropdown)
CREATE TABLE IF NOT EXISTS beacon_statuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status_code     VARCHAR(20) UNIQUE NOT NULL,
    status_name     VARCHAR(50) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO beacon_statuses (status_code, status_name) VALUES
    ('ACTIVE', 'Active'), ('INACTIVE', 'Inactive'),
    ('LOW_BATTERY', 'Low Battery'), ('OFFLINE', 'Offline'),
    ('MAINTENANCE', 'Under Maintenance')
ON CONFLICT (status_code) DO NOTHING;


-- ============================================================================
-- 2. DEVICE MASTER TABLE (source for Device dropdown in Asset Registration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_master (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_code             VARCHAR(50) UNIQUE NOT NULL,           -- DEV-001
    device_name             VARCHAR(250) NOT NULL,                 -- MRI Scanner
    generic_name            VARCHAR(250),                          -- Magnetic Resonance Imaging System
    device_type_id          UUID NOT NULL REFERENCES device_types(id),
    manufacturer            VARCHAR(250) NOT NULL,
    model                   VARCHAR(250),
    country_id              UUID REFERENCES countries(id),
    risk_class_id           UUID REFERENCES risk_classifications(id),
    expected_lifespan       VARCHAR(50),                           -- e.g. "12 years"
    regulatory_approval     VARCHAR(200),                          -- e.g. FDA, CE, CDSCO
    description             TEXT,
    -- Technical Specifications
    power_requirements      VARCHAR(200),
    weight                  VARCHAR(100),
    dimensions              VARCHAR(200),
    operating_temp          VARCHAR(100),
    connectivity            VARCHAR(200),
    -- Depreciation Configuration (auto-populated into Asset Registration)
    depreciation_method_id  UUID REFERENCES depreciation_methods(id),
    useful_life_years       INT,
    salvage_value           DECIMAL(14,2) DEFAULT 0,
    depreciation_rate       DECIMAL(6,2),
    depreciation_freq_id    UUID REFERENCES depreciation_frequencies(id),
    -- Image
    image_url               TEXT,
    -- Status
    status                  VARCHAR(20) NOT NULL DEFAULT 'Active'
                            CHECK (status IN ('Active', 'Draft', 'Inactive')),
    linked_assets_count     INT NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE device_master IS 'Device catalog/master -- source for Device dropdown in Asset Registration Generic tab';
CREATE INDEX idx_device_master_type ON device_master(device_type_id);
CREATE INDEX idx_device_master_status ON device_master(status);


-- ============================================================================
-- 3. ASSET REGISTRATION HEADER  (Tab 1: Generic)
-- ============================================================================

CREATE TABLE IF NOT EXISTS assets (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id_display        VARCHAR(50) UNIQUE NOT NULL,           -- Auto-generated: AST-2026-0001
    hospital_id             UUID NOT NULL REFERENCES hospitals(id),
    device_id               UUID NOT NULL REFERENCES device_master(id),

    -- Device Identification (auto-populated from device_master or overridden)
    device_type_id          UUID REFERENCES device_types(id),
    manufacturer            VARCHAR(250),
    generic_name            VARCHAR(250),
    country_id              UUID REFERENCES countries(id),
    serial_no               VARCHAR(200) NOT NULL,                 -- Manufacturer serial number

    -- Asset Image
    image_url               TEXT,
    use_default_image       BOOLEAN NOT NULL DEFAULT TRUE,

    -- Device Classification
    manufactured_date       DATE,
    tag_no                  VARCHAR(100),
    lot_no                  VARCHAR(100),
    firmware_version        VARCHAR(100),
    software_version        VARCHAR(100),

    -- Configuration
    option_in_device        TEXT,                                   -- Options / modules installed
    connection_type_id      UUID REFERENCES connection_types(id),
    control_no              VARCHAR(100),
    reference_no            VARCHAR(100),                           -- PO or project code
    is_capital_equipment    BOOLEAN NOT NULL DEFAULT FALSE,

    -- Purchase Cost
    purchase_price          DECIMAL(14,2),
    currency_id             UUID REFERENCES currencies(id),
    tax_gst_pct             DECIMAL(6,2),
    tax_amount              DECIMAL(14,2),                          -- Auto-calculated
    total_cost_incl_tax     DECIMAL(14,2),                          -- Auto-calculated
    funding_source_id       UUID REFERENCES funding_sources(id),
    budget_code             VARCHAR(100),
    -- NOTE: purchase_date removed (redundant with invoice_date in asset_vendor_procurement)
    -- Use asset_vendor_procurement.invoice_date as the canonical acquisition date

    -- Depreciation (auto-populated from device_master, read-only if device selected)
    depreciation_method_id  UUID REFERENCES depreciation_methods(id),
    useful_life_years       INT,
    salvage_value           DECIMAL(14,2) DEFAULT 0,
    depreciation_rate       DECIMAL(6,2),
    depreciation_freq_id    UUID REFERENCES depreciation_frequencies(id),
    depreciation_start_date DATE,
    accumulated_depreciation DECIMAL(14,2) DEFAULT 0,               -- Auto-calculated
    current_book_value      DECIMAL(14,2),                          -- Auto-calculated

    -- Classification & Status
    asset_category_id       UUID REFERENCES asset_categories(id),
    asset_sub_category_id   UUID REFERENCES asset_sub_categories(id),
    asset_owner_bme_id      UUID REFERENCES bme_users(id),
    asset_status_id         UUID REFERENCES asset_statuses(id),

    -- Workflow
    form_status             VARCHAR(20) NOT NULL DEFAULT 'Draft'
                            CHECK (form_status IN ('Draft', 'Submitted', 'Approved', 'Rejected')),
    created_by              UUID,
    approved_by             UUID,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE assets IS 'Main asset registration header -- Tab 1 (Generic) fields plus purchase/depreciation/classification';

CREATE INDEX idx_assets_hospital ON assets(hospital_id);
CREATE INDEX idx_assets_device ON assets(device_id);
CREATE INDEX idx_assets_status ON assets(asset_status_id);
CREATE INDEX idx_assets_category ON assets(asset_category_id);
CREATE INDEX idx_assets_form_status ON assets(form_status);

-- Auto-generate asset_id_display sequence
CREATE SEQUENCE IF NOT EXISTS asset_id_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE FUNCTION generate_asset_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.asset_id_display IS NULL OR NEW.asset_id_display = '' THEN
        NEW.asset_id_display := 'AST-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('asset_id_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_asset_id
    BEFORE INSERT ON assets
    FOR EACH ROW
    EXECUTE FUNCTION generate_asset_id();

-- Auto-calculate tax_amount and total_cost
CREATE OR REPLACE FUNCTION calc_asset_cost()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.purchase_price IS NOT NULL AND NEW.tax_gst_pct IS NOT NULL THEN
        NEW.tax_amount := ROUND(NEW.purchase_price * NEW.tax_gst_pct / 100, 2);
        NEW.total_cost_incl_tax := NEW.purchase_price + NEW.tax_amount;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_asset_cost
    BEFORE INSERT OR UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION calc_asset_cost();


-- ============================================================================
-- 4. ACCESSORIES  (Tab 2)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_accessories (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    accessory_type_id   UUID NOT NULL REFERENCES accessory_types(id),
    item_name           VARCHAR(250),
    serial_no           VARCHAR(200),
    manufacturer        VARCHAR(250),
    part_no             VARCHAR(100),
    quantity            INT NOT NULL DEFAULT 1,
    installation_date   DATE,
    warranty_expiry     DATE,
    condition_id        UUID REFERENCES accessory_conditions(id),
    cost                DECIMAL(14,2),
    notes               TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    sort_order          INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_accessories_asset ON asset_accessories(asset_id);


-- ============================================================================
-- 5. CHILD ASSETS  (Tab 3)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_child_links (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_asset_id     UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    child_asset_id      UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    -- child device_name, model, serial_no auto-populated from child asset record
    linked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (parent_asset_id, child_asset_id),
    CHECK (parent_asset_id != child_asset_id)
);

COMMENT ON TABLE asset_child_links IS 'Tab 3: Links sub-assets / component equipment to a parent asset';
CREATE INDEX idx_child_links_parent ON asset_child_links(parent_asset_id);
CREATE INDEX idx_child_links_child ON asset_child_links(child_asset_id);


-- ============================================================================
-- 6. S/W & NETWORK  (Tab 4)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_network_config (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    -- Network Configuration
    device_udi          VARCHAR(200),                      -- UDI (DICOM/HL7 identifier)
    ae_title            VARCHAR(100),                      -- DICOM AE Title
    fqdn                VARCHAR(300),
    ip_type_id          UUID REFERENCES ip_types(id),
    network_port        VARCHAR(10),
    ip_address          VARCHAR(45),                       -- IPv4 or IPv6
    subnet_mask         VARCHAR(45),
    default_gateway     VARCHAR(45),
    domain_name         VARCHAR(200),
    ntp_server          VARCHAR(200),
    -- MAC Addresses
    ethernet_mac_1      VARCHAR(20),
    ethernet_mac_2      VARCHAR(20),
    wireless_mac        VARCHAR(20),
    bluetooth_mac       VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id)
);

CREATE TABLE IF NOT EXISTS asset_sw_licenses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    license_name        VARCHAR(250),
    license_type_id     UUID REFERENCES sw_license_types(id),
    license_start_date  DATE,
    validity_months     INT,
    license_key         VARCHAR(500),
    renewal_date        DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sw_licenses_asset ON asset_sw_licenses(asset_id);

CREATE TABLE IF NOT EXISTS asset_integration_licenses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    license_name        VARCHAR(250),
    license_type_id     UUID REFERENCES integration_license_types(id),
    start_date          DATE,
    validity_months     INT,
    license_key         VARCHAR(500),
    renewal_date        DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integration_licenses_asset ON asset_integration_licenses(asset_id);


-- ============================================================================
-- 7. LOCATION  (Tab 5)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_location (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    hospital_id         UUID NOT NULL REFERENCES hospitals(id),
    department_id       UUID NOT NULL REFERENCES departments(id),
    floor               VARCHAR(50),
    room_no             VARCHAR(50),
    bed_no              VARCHAR(50),
    device_label        VARCHAR(100),
    device_custom_id    VARCHAR(100),
    end_user            VARCHAR(200),
    end_user_contact    VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id)
);

CREATE INDEX idx_asset_location_hospital ON asset_location(hospital_id);
CREATE INDEX idx_asset_location_dept ON asset_location(department_id);


-- ============================================================================
-- 8. ASSET TRACKING / BLE  (Tab 6)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_ble_config (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id                UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    ble_enabled             BOOLEAN NOT NULL DEFAULT FALSE,
    -- BLE Controller Configuration
    ble_controller_id       VARCHAR(100),
    beacon_type_id          UUID REFERENCES ble_beacon_types(id),
    beacon_mac_address      VARCHAR(20),
    uuid                    VARCHAR(50),
    major_value             INT CHECK (major_value BETWEEN 0 AND 65535),
    minor_value             INT CHECK (minor_value BETWEEN 0 AND 65535),
    firmware_version        VARCHAR(100),
    hardware_model          VARCHAR(200),
    manufacturer_id         UUID REFERENCES ble_manufacturers(id),
    -- Signal Configuration
    tx_power_dbm            INT,                                   -- e.g. -30, -20, 0, 4
    advertising_interval_ms INT,                                   -- e.g. 100, 250, 1000
    rssi_threshold_dbm      INT,
    scan_range_meters       INT,
    -- Battery & Maintenance
    battery_type_id         UUID REFERENCES battery_types(id),
    battery_level_pct       INT CHECK (battery_level_pct BETWEEN 0 AND 100),
    battery_installed_date  DATE,
    expected_battery_life_months INT,
    low_battery_alert_pct   INT CHECK (low_battery_alert_pct BETWEEN 1 AND 50),
    last_signal_received    TIMESTAMPTZ,
    beacon_status_id        UUID REFERENCES beacon_statuses(id),
    beacon_attach_date      DATE,
    -- Zone Mapping & Geo-Fence
    geo_fence_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_zone_id        UUID REFERENCES tracking_zones(id),
    assigned_floor_id       UUID REFERENCES floors(id),
    nearest_gateway_id      UUID REFERENCES ble_gateways(id),
    geo_fence_radius_m      INT,
    exit_alert_type_id      UUID REFERENCES geo_fence_alert_types(id),
    alert_recipients        TEXT,                                   -- comma-separated emails
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id)
);

-- Additional BLE Beacons (multi-beacon per asset)
CREATE TABLE IF NOT EXISTS asset_ble_beacons (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    beacon_mac          VARCHAR(20) NOT NULL,
    placement_id        UUID REFERENCES beacon_placements(id),
    purpose_id          UUID REFERENCES beacon_purposes(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'INACTIVE')),
    sort_order          INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ble_beacons_asset ON asset_ble_beacons(asset_id);


-- ============================================================================
-- 9. VENDOR  (Tab 7)
-- ============================================================================
-- Uses vendors table from grn-schema.sql (shared base table)

CREATE TABLE IF NOT EXISTS asset_vendor (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    vendor_id           UUID NOT NULL REFERENCES vendors(id),
    -- vendor_poc, vendor_mobile, vendor_email auto-populated from vendors table
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id)
);


-- ============================================================================
-- 10. INSTALLATION RECORDS  (Tab 8)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_installation (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id                UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    -- Procurement Trail
    pr_no                   VARCHAR(100),
    pr_date                 DATE,
    quote_no                VARCHAR(100),
    quote_date              DATE,
    po_no                   VARCHAR(100),
    po_date                 DATE,
    invoice_no              VARCHAR(100),
    invoice_date            DATE,
    -- Delivery & Installation
    delivery_note           VARCHAR(100),
    delivery_date           DATE,
    installed_by            VARCHAR(200),
    installation_date       DATE,
    -- Warranty
    warranty_period_years   INT,
    warranty_start_date     DATE,
    warranty_end_date       DATE,
    warranty_status_id      UUID REFERENCES warranty_statuses(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id)
);

-- Auto-calculate warranty_end_date from start_date + period
CREATE OR REPLACE FUNCTION calc_warranty_end()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.warranty_start_date IS NOT NULL AND NEW.warranty_period_years IS NOT NULL THEN
        NEW.warranty_end_date := NEW.warranty_start_date + (NEW.warranty_period_years * INTERVAL '1 year');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_warranty_end
    BEFORE INSERT OR UPDATE ON asset_installation
    FOR EACH ROW
    EXECUTE FUNCTION calc_warranty_end();


-- ============================================================================
-- 11. MAINTENANCE SCHEDULES  (Tab 9)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_maintenance_schedules (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id                UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    maintenance_type_id     UUID NOT NULL REFERENCES maintenance_types(id),
    is_enabled              BOOLEAN NOT NULL DEFAULT FALSE,
    start_date              DATE,
    frequency_months        INT CHECK (frequency_months >= 1),        -- Nos in months (e.g. 3 = every 3 months)
    next_due_date           DATE,                                     -- Auto-calculated: start_date + frequency_months
    assigned_to_id          UUID REFERENCES maintenance_assignees(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, maintenance_type_id)
);

CREATE INDEX idx_maint_schedules_asset ON asset_maintenance_schedules(asset_id);
CREATE INDEX idx_maint_schedules_due ON asset_maintenance_schedules(next_due_date);

-- Auto-calculate next_due_date from start_date + frequency_months
CREATE OR REPLACE FUNCTION calc_next_due_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_enabled AND NEW.start_date IS NOT NULL AND NEW.frequency_months IS NOT NULL THEN
        NEW.next_due_date := NEW.start_date + (NEW.frequency_months * INTERVAL '1 month');
    ELSE
        NEW.next_due_date := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_next_due_date
    BEFORE INSERT OR UPDATE ON asset_maintenance_schedules
    FOR EACH ROW
    EXECUTE FUNCTION calc_next_due_date();


-- ============================================================================
-- 12. CONTRACT LINK  (Tab 10)
-- ============================================================================

-- Contracts table (source for Contract Number dropdown)
CREATE TABLE IF NOT EXISTS contracts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_no         VARCHAR(100) UNIQUE NOT NULL,              -- AMC-2026-001
    contract_type       VARCHAR(50) NOT NULL,                      -- AMC, CMC, etc.
    vendor_id           UUID REFERENCES vendors(id),
    contract_start      DATE NOT NULL,
    contract_period     VARCHAR(50),                               -- e.g. "12 months"
    contract_end        DATE,
    contract_status     VARCHAR(30) NOT NULL DEFAULT 'Active'
                        CHECK (contract_status IN ('Active', 'Expired', 'Pending', 'Cancelled')),
    coverage_type       VARCHAR(200),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asset-to-Contract link (many assets can share one contract)
CREATE TABLE IF NOT EXISTS asset_contracts (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    contract_id         UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    linked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, contract_id)
);

CREATE INDEX idx_asset_contracts_asset ON asset_contracts(asset_id);
CREATE INDEX idx_asset_contracts_contract ON asset_contracts(contract_id);


-- ============================================================================
-- 13. DOCUMENTS  (Tab 11)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_documents (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES document_categories(id),
    file_name           VARCHAR(500) NOT NULL,
    file_path           TEXT NOT NULL,                             -- storage path / URL
    file_size_bytes     BIGINT,
    mime_type           VARCHAR(100),
    uploaded_by         UUID,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asset_docs_asset ON asset_documents(asset_id);
CREATE INDEX idx_asset_docs_category ON asset_documents(category_id);


-- ============================================================================
-- 14. BARCODE / QR CODE  (Tab 12)
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_barcodes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    barcode_type        VARCHAR(20) NOT NULL DEFAULT 'CODE128'
                        CHECK (barcode_type IN ('CODE128', 'QR')),
    barcode_data        TEXT NOT NULL,                             -- the encoded string
    barcode_image_url   TEXT,                                      -- cached image path
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, barcode_type)
);

CREATE INDEX idx_asset_barcodes_asset ON asset_barcodes(asset_id);


-- ============================================================================
-- 15. USEFUL VIEWS
-- ============================================================================

-- 15a. Full Asset Overview (joins all key lookups)
CREATE OR REPLACE VIEW vw_asset_overview AS
SELECT
    a.id,
    a.asset_id_display,
    h.hospital_name,
    dm.device_name,
    dm.model                      AS device_model,
    dt.type_name                  AS device_type,
    a.manufacturer,
    a.serial_no,
    c.country_name                AS country_of_origin,
    ac.category_name              AS asset_category,
    asc2.sub_name                 AS asset_sub_category,
    ast.status_name               AS asset_status,
    bu.full_name                  AS asset_owner_bme,
    a.purchase_price,
    cur.currency_code,
    a.total_cost_incl_tax,
    depm.method_name              AS depreciation_method,
    a.useful_life_years,
    a.current_book_value,
    a.form_status,
    al.floor,
    al.room_no,
    dep.dept_name                 AS department,
    a.created_at,
    a.updated_at
FROM assets a
LEFT JOIN hospitals h           ON h.id = a.hospital_id
LEFT JOIN device_master dm      ON dm.id = a.device_id
LEFT JOIN device_types dt       ON dt.id = a.device_type_id
LEFT JOIN countries c           ON c.id = a.country_id
LEFT JOIN asset_categories ac   ON ac.id = a.asset_category_id
LEFT JOIN asset_sub_categories asc2 ON asc2.id = a.asset_sub_category_id
LEFT JOIN asset_statuses ast    ON ast.id = a.asset_status_id
LEFT JOIN bme_users bu          ON bu.id = a.asset_owner_bme_id
LEFT JOIN currencies cur        ON cur.id = a.currency_id
LEFT JOIN depreciation_methods depm ON depm.id = a.depreciation_method_id
LEFT JOIN asset_location al     ON al.asset_id = a.id
LEFT JOIN departments dep       ON dep.id = al.department_id;

-- 15b. Maintenance Due Soon (next 30 days)
CREATE OR REPLACE VIEW vw_maintenance_due_soon AS
SELECT
    a.asset_id_display,
    dm.device_name,
    mt.type_name                  AS maintenance_type,
    ms.next_due_date,
    mf.frequency_name,
    ma.assignee_name              AS assigned_to,
    ms.is_enabled
FROM asset_maintenance_schedules ms
JOIN assets a                   ON a.id = ms.asset_id
JOIN device_master dm           ON dm.id = a.device_id
JOIN maintenance_types mt       ON mt.id = ms.maintenance_type_id
LEFT JOIN maintenance_frequencies mf ON mf.id = ms.frequency_id
LEFT JOIN maintenance_assignees ma  ON ma.id = ms.assigned_to_id
WHERE ms.is_enabled = TRUE
  AND ms.next_due_date <= (CURRENT_DATE + INTERVAL '30 days')
ORDER BY ms.next_due_date;

-- 15c. Warranty Expiring Soon (next 90 days)
CREATE OR REPLACE VIEW vw_warranty_expiring_soon AS
SELECT
    a.asset_id_display,
    dm.device_name,
    ai.warranty_start_date,
    ai.warranty_end_date,
    ws.status_name                AS warranty_status,
    ai.warranty_period_years
FROM asset_installation ai
JOIN assets a                   ON a.id = ai.asset_id
JOIN device_master dm           ON dm.id = a.device_id
LEFT JOIN warranty_statuses ws  ON ws.id = ai.warranty_status_id
WHERE ai.warranty_end_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '90 days')
ORDER BY ai.warranty_end_date;

-- 15d. BLE Tracked Assets
CREATE OR REPLACE VIEW vw_ble_tracked_assets AS
SELECT
    a.asset_id_display,
    dm.device_name,
    bc.ble_controller_id,
    bt.type_name                  AS beacon_type,
    bc.beacon_mac_address,
    bs.status_name                AS beacon_status,
    bc.battery_level_pct,
    tz.zone_name                  AS assigned_zone,
    fl.floor_name                 AS assigned_floor,
    gw.gateway_name               AS nearest_gateway,
    bc.geo_fence_enabled,
    bc.last_signal_received
FROM asset_ble_config bc
JOIN assets a                   ON a.id = bc.asset_id
JOIN device_master dm           ON dm.id = a.device_id
LEFT JOIN ble_beacon_types bt   ON bt.id = bc.beacon_type_id
LEFT JOIN beacon_statuses bs    ON bs.id = bc.beacon_status_id
LEFT JOIN tracking_zones tz     ON tz.id = bc.assigned_zone_id
LEFT JOIN floors fl             ON fl.id = bc.assigned_floor_id
LEFT JOIN ble_gateways gw       ON gw.id = bc.nearest_gateway_id
WHERE bc.ble_enabled = TRUE;


-- ============================================================================
-- 16. UPDATE TIMESTAMP TRIGGER (reusable for all tables)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'assets', 'asset_accessories', 'asset_network_config',
            'asset_sw_licenses', 'asset_integration_licenses',
            'asset_location', 'asset_ble_config', 'asset_vendor',
            'asset_installation', 'asset_maintenance_schedules',
            'device_master', 'contracts'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_updated_at_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp();',
            tbl, tbl
        );
    END LOOP;
END;
$$;


-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Summary:
--   34 lookup/base tables   (every dropdown backed by FK)
--   1  device_master        (source for Device dropdown)
--   1  assets header        (Tab 1: Generic + Purchase + Depreciation + Classification)
--   1  asset_accessories    (Tab 2)
--   1  asset_child_links    (Tab 3)
--   3  SW/Network tables    (Tab 4: network_config, sw_licenses, integration_licenses)
--   1  asset_location       (Tab 5)
--   2  BLE tables           (Tab 6: ble_config, ble_beacons)
--   1  asset_vendor         (Tab 7)
--   1  asset_installation   (Tab 8: procurement trail + warranty)
--   1  asset_maintenance_schedules (Tab 9)
--   2  contract tables      (Tab 10: contracts, asset_contracts)
--   1  asset_documents      (Tab 11)
--   1  asset_barcodes       (Tab 12)
--   4  views                (overview, maintenance due, warranty expiring, BLE tracked)
--   Auto-triggers           (asset ID gen, cost calc, warranty end, next due date, updated_at)
-- ============================================================================
