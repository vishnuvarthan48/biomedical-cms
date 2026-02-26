-- ============================================================
-- GRN (Goods Receipt Note) Database Schema - PostgreSQL
-- CMMS Biomedical Module
-- ============================================================
-- This script creates all tables required for the GRN module,
-- including reference/master tables and the GRN transactional
-- tables. Follows the current UI data model exactly.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. REFERENCE / MASTER TABLES
-- ============================================================

-- 1a. Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name   VARCHAR(200) NOT NULL,
    code            VARCHAR(50) UNIQUE NOT NULL,
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE hospitals IS 'Master list of hospitals in the network';

-- 1b. Biomedical Stores (Store Master)
CREATE TABLE IF NOT EXISTS biomedical_stores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id     UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    store_name      VARCHAR(200) NOT NULL,
    stock_source    VARCHAR(30) NOT NULL DEFAULT 'Both'
                    CHECK (stock_source IN ('Direct Purchase', 'External ERP', 'Both')),
    contact_person  VARCHAR(150),
    location        VARCHAR(200),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active', 'Inactive')),
    remarks         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE biomedical_stores IS 'Biomedical store master -- each hospital can have multiple stores';

CREATE INDEX idx_bio_stores_hospital ON biomedical_stores(hospital_id);

-- 1c. Item Master (Biomedical Spares / Consumables / Accessories)
CREATE TABLE IF NOT EXISTS item_master (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id         UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    store_id            UUID REFERENCES biomedical_stores(id) ON DELETE SET NULL,
    item_code           VARCHAR(50) UNIQUE NOT NULL,
    item_name           VARCHAR(250) NOT NULL,
    part_number         VARCHAR(100),
    item_type           VARCHAR(30) NOT NULL
                        CHECK (item_type IN ('Consumable', 'Spare', 'Accessory')),
    catalogue_number    VARCHAR(100),
    manufacturer        VARCHAR(200),
    description         TEXT,
    compatible_devices  TEXT[],              -- Array of compatible device names
    stock_uom           VARCHAR(50) NOT NULL DEFAULT 'Piece',
    purchase_uom        VARCHAR(50),
    shelf_life_months   INT NOT NULL DEFAULT 60,   -- Default from Store Master (60 months)
    batch_required      BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_required     BOOLEAN NOT NULL DEFAULT FALSE,
    serial_tracking     BOOLEAN NOT NULL DEFAULT FALSE,
    status              VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    current_stock       DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE item_master IS 'Biomedical item master -- spares, consumables, accessories with tracking flags';
COMMENT ON COLUMN item_master.shelf_life_months IS 'Default shelf life from Store Master. Fallback is 60 months if not defined';
COMMENT ON COLUMN item_master.batch_required IS 'TRUE for consumables that need batch tracking';
COMMENT ON COLUMN item_master.serial_tracking IS 'TRUE for spares/accessories that need serial number tracking';

CREATE INDEX idx_item_master_hospital ON item_master(hospital_id);
CREATE INDEX idx_item_master_store ON item_master(store_id);
CREATE INDEX idx_item_master_type ON item_master(item_type);
CREATE INDEX idx_item_master_code ON item_master(item_code);

-- 1d. Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name     VARCHAR(250) NOT NULL,
    vendor_code     VARCHAR(50) UNIQUE,
    contact_person  VARCHAR(150),
    phone           VARCHAR(30),
    email           VARCHAR(150),
    address         TEXT,
    gst_number      VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE vendors IS 'Vendor master for Direct Purchase GRNs';


-- ============================================================
-- 2. GRN HEADER
-- ============================================================

CREATE TABLE IF NOT EXISTS grn_header (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number          VARCHAR(50) UNIQUE NOT NULL,         -- e.g. GRN-2025-001 (auto-generated)
    hospital_id         UUID NOT NULL REFERENCES hospitals(id) ON DELETE RESTRICT,
    store_id            UUID NOT NULL REFERENCES biomedical_stores(id) ON DELETE RESTRICT,
    inward_source       VARCHAR(30) NOT NULL
                        CHECK (inward_source IN ('Direct Purchase', 'ERP Transfer')),
    grn_date            DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Direct Purchase fields (NULL when inward_source = 'ERP Transfer')
    vendor_id           UUID REFERENCES vendors(id) ON DELETE SET NULL,
    vendor_name         VARCHAR(250),                        -- Denormalized for quick display
    invoice_no          VARCHAR(100),
    invoice_date        DATE,
    invoice_amount      DECIMAL(14,2),

    -- ERP Transfer fields (NULL when inward_source = 'Direct Purchase')
    external_ref_no     VARCHAR(100),                        -- ERP reference number
    transfer_date       DATE,
    source_erp_store    VARCHAR(200),                        -- Source store name in external ERP

    remarks             TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'Draft'
                        CHECK (status IN ('Draft', 'Posted', 'Cancelled')),
    line_count          INT NOT NULL DEFAULT 0,
    total_amount        DECIMAL(14,2) NOT NULL DEFAULT 0,

    -- Audit fields
    created_by          VARCHAR(150),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(150),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    posted_at           TIMESTAMPTZ,
    posted_by           VARCHAR(150),
    cancelled_at        TIMESTAMPTZ,
    cancelled_by        VARCHAR(150)
);

COMMENT ON TABLE grn_header IS 'GRN header -- supports two inward modes: Direct Purchase and ERP Transfer';
COMMENT ON COLUMN grn_header.inward_source IS 'Direct Purchase = manual entry with invoice; ERP Transfer = bulk import from external ERP';
COMMENT ON COLUMN grn_header.invoice_amount IS 'Applicable only for Direct Purchase mode';

CREATE INDEX idx_grn_header_hospital ON grn_header(hospital_id);
CREATE INDEX idx_grn_header_store ON grn_header(store_id);
CREATE INDEX idx_grn_header_status ON grn_header(status);
CREATE INDEX idx_grn_header_date ON grn_header(grn_date);
CREATE INDEX idx_grn_header_vendor ON grn_header(vendor_id);
CREATE INDEX idx_grn_header_source ON grn_header(inward_source);


-- ============================================================
-- 3. GRN LINE ITEMS
-- ============================================================
-- Fields adapt based on item_type:
--   Consumable  -> batch_no, lot_number, mfg_date, shelf_life, expiry_date
--   Spare/Accessory -> serial_numbers, mfg_date, shelf_life, expiry_date, warranty_months, warranty_expiry
-- ============================================================

CREATE TABLE IF NOT EXISTS grn_lines (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id              UUID NOT NULL REFERENCES grn_header(id) ON DELETE CASCADE,
    line_number         INT NOT NULL,                        -- Sequential line # within GRN
    item_id             UUID NOT NULL REFERENCES item_master(id) ON DELETE RESTRICT,
    item_code           VARCHAR(50) NOT NULL,                -- Denormalized
    item_name           VARCHAR(250) NOT NULL,               -- Denormalized
    part_number         VARCHAR(100),                        -- Denormalized
    item_type           VARCHAR(30) NOT NULL
                        CHECK (item_type IN ('Consumable', 'Spare', 'Accessory')),
    qty_received        DECIMAL(12,2) NOT NULL CHECK (qty_received > 0),
    uom                 VARCHAR(50) NOT NULL,

    -- Consumable-specific fields
    batch_no            VARCHAR(100),                        -- Required for Consumables
    lot_number          VARCHAR(100),                        -- Optional for Consumables

    -- Spare / Accessory-specific fields
    serial_numbers      TEXT,                                -- Required for Spares/Accessories (comma-separated or JSON)

    -- Common date/shelf-life fields
    mfg_date            DATE,                                -- Manufacturing date
    shelf_life_months   INT DEFAULT 60,                      -- From Store Master; default 60 months
    expiry_date         DATE,                                -- Auto-calculated: mfg_date + shelf_life_months

    -- Spare / Accessory warranty fields
    warranty_months     INT DEFAULT 0,                       -- In months
    warranty_expiry     DATE,                                -- Auto-calculated: mfg_date + warranty_months

    -- Pricing (applicable for Direct Purchase)
    unit_rate           DECIMAL(12,2) NOT NULL DEFAULT 0,
    line_amount         DECIMAL(14,2) NOT NULL DEFAULT 0,    -- qty_received * unit_rate

    -- Tracking flags (from Item Master)
    batch_required      BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_required     BOOLEAN NOT NULL DEFAULT FALSE,
    serial_required     BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_grn_line UNIQUE (grn_id, line_number)
);

COMMENT ON TABLE grn_lines IS 'GRN line items -- fields adapt based on item_type (Consumable vs Spare/Accessory)';
COMMENT ON COLUMN grn_lines.batch_no IS 'Required for Consumables; NULL for Spares/Accessories';
COMMENT ON COLUMN grn_lines.lot_number IS 'Optional for Consumables; NULL for Spares/Accessories';
COMMENT ON COLUMN grn_lines.serial_numbers IS 'Required for Spares/Accessories; NULL for Consumables';
COMMENT ON COLUMN grn_lines.shelf_life_months IS 'Extracted from Store Master / Item Master. Default 60 months if not defined';
COMMENT ON COLUMN grn_lines.expiry_date IS 'Auto-calculated from mfg_date + shelf_life_months';
COMMENT ON COLUMN grn_lines.warranty_months IS 'Applicable only for Spares/Accessories. Value in months';
COMMENT ON COLUMN grn_lines.warranty_expiry IS 'Auto-calculated from mfg_date + warranty_months';

CREATE INDEX idx_grn_lines_grn ON grn_lines(grn_id);
CREATE INDEX idx_grn_lines_item ON grn_lines(item_id);
CREATE INDEX idx_grn_lines_type ON grn_lines(item_type);
CREATE INDEX idx_grn_lines_batch ON grn_lines(batch_no) WHERE batch_no IS NOT NULL;
CREATE INDEX idx_grn_lines_expiry ON grn_lines(expiry_date) WHERE expiry_date IS NOT NULL;


-- ============================================================
-- 4. GRN DOCUMENTS
-- ============================================================
-- Document types: PO, Invoice, DC, Warranty Certificate, MSDS, Additional Docs
-- ============================================================

CREATE TABLE IF NOT EXISTS grn_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id          UUID NOT NULL REFERENCES grn_header(id) ON DELETE CASCADE,
    document_type   VARCHAR(50) NOT NULL
                    CHECK (document_type IN (
                        'PO',
                        'Invoice',
                        'DC',
                        'Warranty Certificate',
                        'MSDS',
                        'Additional'
                    )),
    file_name       VARCHAR(300) NOT NULL,
    file_path       TEXT NOT NULL,                           -- S3/blob storage path
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    uploaded_by     VARCHAR(150),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE grn_documents IS 'Documents attached to a GRN -- PO, Invoice, DC, Warranty Certificate, MSDS, Additional';

CREATE INDEX idx_grn_docs_grn ON grn_documents(grn_id);
CREATE INDEX idx_grn_docs_type ON grn_documents(document_type);


-- ============================================================
-- 5. GRN ERP UPLOAD LOG (for ERP Transfer mode)
-- ============================================================
-- Tracks bulk file uploads and their validation status
-- ============================================================

CREATE TABLE IF NOT EXISTS grn_erp_uploads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id          UUID NOT NULL REFERENCES grn_header(id) ON DELETE CASCADE,
    file_name       VARCHAR(300) NOT NULL,
    file_path       TEXT,
    total_rows      INT NOT NULL DEFAULT 0,
    valid_rows      INT NOT NULL DEFAULT 0,
    invalid_rows    INT NOT NULL DEFAULT 0,
    upload_status   VARCHAR(30) NOT NULL DEFAULT 'Pending'
                    CHECK (upload_status IN ('Pending', 'Validated', 'Confirmed', 'Failed')),
    error_log       JSONB,                                   -- Stores row-level validation errors
    uploaded_by     VARCHAR(150),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE grn_erp_uploads IS 'Tracks ERP Transfer bulk file uploads with validation summary';

CREATE INDEX idx_grn_erp_uploads_grn ON grn_erp_uploads(grn_id);


-- ============================================================
-- 6. GRN NUMBER SEQUENCE
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS grn_number_seq START WITH 1 INCREMENT BY 1;

-- Function to auto-generate GRN number
CREATE OR REPLACE FUNCTION generate_grn_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.grn_number := 'GRN-' || EXTRACT(YEAR FROM NEW.grn_date)::TEXT || '-' ||
                      LPAD(nextval('grn_number_seq')::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_grn_number
    BEFORE INSERT ON grn_header
    FOR EACH ROW
    WHEN (NEW.grn_number IS NULL OR NEW.grn_number = '')
    EXECUTE FUNCTION generate_grn_number();


-- ============================================================
-- 7. AUTO-CALCULATE EXPIRY & WARRANTY EXPIRY
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_grn_line_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate expiry_date from mfg_date + shelf_life_months
    IF NEW.mfg_date IS NOT NULL AND NEW.shelf_life_months IS NOT NULL AND NEW.shelf_life_months > 0 THEN
        NEW.expiry_date := NEW.mfg_date + (NEW.shelf_life_months || ' months')::INTERVAL;
    END IF;

    -- Auto-calculate warranty_expiry from mfg_date + warranty_months (Spare/Accessory only)
    IF NEW.item_type IN ('Spare', 'Accessory')
       AND NEW.mfg_date IS NOT NULL
       AND NEW.warranty_months IS NOT NULL
       AND NEW.warranty_months > 0 THEN
        NEW.warranty_expiry := NEW.mfg_date + (NEW.warranty_months || ' months')::INTERVAL;
    END IF;

    -- Auto-calculate line_amount
    NEW.line_amount := COALESCE(NEW.qty_received, 0) * COALESCE(NEW.unit_rate, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_grn_line_dates
    BEFORE INSERT OR UPDATE ON grn_lines
    FOR EACH ROW
    EXECUTE FUNCTION calculate_grn_line_dates();


-- ============================================================
-- 8. AUTO-UPDATE GRN HEADER TOTALS
-- ============================================================

CREATE OR REPLACE FUNCTION update_grn_header_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_grn_id UUID;
BEGIN
    v_grn_id := COALESCE(NEW.grn_id, OLD.grn_id);

    UPDATE grn_header
    SET line_count   = (SELECT COUNT(*) FROM grn_lines WHERE grn_id = v_grn_id),
        total_amount = (SELECT COALESCE(SUM(line_amount), 0) FROM grn_lines WHERE grn_id = v_grn_id),
        updated_at   = NOW()
    WHERE id = v_grn_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_grn_header_totals
    AFTER INSERT OR UPDATE OR DELETE ON grn_lines
    FOR EACH ROW
    EXECUTE FUNCTION update_grn_header_totals();


-- ============================================================
-- 9. UPDATED_AT AUTO-TIMESTAMP
-- ============================================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_hospitals_updated    BEFORE UPDATE ON hospitals         FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE OR REPLACE TRIGGER trg_bio_stores_updated   BEFORE UPDATE ON biomedical_stores  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE OR REPLACE TRIGGER trg_item_master_updated  BEFORE UPDATE ON item_master        FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE OR REPLACE TRIGGER trg_vendors_updated      BEFORE UPDATE ON vendors            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE OR REPLACE TRIGGER trg_grn_header_updated   BEFORE UPDATE ON grn_header         FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE OR REPLACE TRIGGER trg_grn_lines_updated    BEFORE UPDATE ON grn_lines          FOR EACH ROW EXECUTE FUNCTION update_timestamp();


-- ============================================================
-- 10. SEED DATA (matches UI mock data)
-- ============================================================

-- Hospitals
INSERT INTO hospitals (id, hospital_name, code) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Apollo Hospital - Chennai', 'APL-CHN'),
    ('a1000000-0000-0000-0000-000000000002', 'Apollo Hospital - Delhi', 'APL-DEL'),
    ('a1000000-0000-0000-0000-000000000003', 'Apollo Hospital - Bangalore', 'APL-BLR')
ON CONFLICT (code) DO NOTHING;

-- Biomedical Stores
INSERT INTO biomedical_stores (id, hospital_id, store_name, stock_source, contact_person, location, is_default) VALUES
    ('b2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Biomedical Spares Store', 'Both', 'Rajesh Kumar', 'Block B, Ground Floor', TRUE),
    ('b2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Biomedical Store - ICU Wing', 'Direct Purchase', 'Sunil Mehta', 'ICU Building, Basement', TRUE),
    ('b2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Biomedical Store', 'External ERP', 'Priya Nair', 'Maintenance Block', TRUE)
ON CONFLICT DO NOTHING;

-- Vendors
INSERT INTO vendors (id, vendor_name, vendor_code) VALUES
    ('v3000000-0000-0000-0000-000000000001', 'Philips Medical Systems', 'VND-PHILIPS'),
    ('v3000000-0000-0000-0000-000000000002', 'Draeger Medical', 'VND-DRAEGER'),
    ('v3000000-0000-0000-0000-000000000003', 'BD Medical', 'VND-BD')
ON CONFLICT (vendor_code) DO NOTHING;

-- Item Master
INSERT INTO item_master (id, hospital_id, store_id, item_code, item_name, part_number, item_type, manufacturer, stock_uom, shelf_life_months, batch_required, expiry_required, serial_tracking) VALUES
    ('i4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'BIO-SPR-001', 'SpO2 Sensor Cable', 'PHI-SPO2-M1191B', 'Spare', 'Philips Medical', 'Piece', 60, FALSE, FALSE, TRUE),
    ('i4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'BIO-CON-001', 'ECG Electrode Pads', '3M-2560-ECG', 'Consumable', '3M Healthcare', 'Box (50)', 36, TRUE, TRUE, FALSE),
    ('i4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'BIO-SPR-002', 'Ventilator Flow Sensor', 'DRG-FS-8412960', 'Spare', 'Draeger Medical', 'Piece', 60, FALSE, FALSE, TRUE),
    ('i4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'BIO-ACC-001', 'NIBP Cuff (Adult)', 'PHI-NIBP-M1574A', 'Accessory', 'Philips Medical', 'Piece', 48, FALSE, FALSE, FALSE),
    ('i4000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'BIO-CON-002', 'Defibrillator Pads (Adult)', 'PHI-DEF-M3713A', 'Consumable', 'Philips Medical', 'Pair', 24, TRUE, TRUE, FALSE),
    ('i4000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'BIO-SPR-003', 'Infusion Pump Battery', 'BD-BAT-INF-320', 'Spare', 'BD Medical', 'Piece', 60, FALSE, FALSE, TRUE)
ON CONFLICT (item_code) DO NOTHING;

-- Sample GRN Headers
INSERT INTO grn_header (id, grn_number, hospital_id, store_id, inward_source, grn_date, vendor_id, vendor_name, invoice_no, invoice_date, invoice_amount, remarks, status, line_count, total_amount, created_by) VALUES
    ('g5000000-0000-0000-0000-000000000001', 'GRN-2025-001', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'Direct Purchase', '2025-06-10', 'v3000000-0000-0000-0000-000000000001', 'Philips Medical Systems', 'INV-PH-2025-456', '2025-06-08', 125000, 'Quarterly replenishment of SpO2 sensors and ECG electrodes', 'Posted', 3, 125000, 'Admin User'),
    ('g5000000-0000-0000-0000-000000000002', 'GRN-2025-002', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'ERP Transfer', '2025-06-12', NULL, NULL, NULL, NULL, NULL, 'Monthly biomedical stock transfer from central ERP', 'Posted', 5, 0, 'Store Keeper'),
    ('g5000000-0000-0000-0000-000000000003', 'GRN-2025-003', 'a1000000-0000-0000-0000-000000000002', 'b2000000-0000-0000-0000-000000000002', 'Direct Purchase', '2025-06-15', 'v3000000-0000-0000-0000-000000000002', 'Draeger Medical', 'DRG-2025-789', '2025-06-14', 85000, 'Ventilator flow sensors and spare batteries', 'Draft', 2, 85000, 'Admin User'),
    ('g5000000-0000-0000-0000-000000000004', 'GRN-2025-004', 'a1000000-0000-0000-0000-000000000001', 'b2000000-0000-0000-0000-000000000001', 'Direct Purchase', '2025-05-20', 'v3000000-0000-0000-0000-000000000003', 'BD Medical', 'BD-INV-2025-111', '2025-05-19', 45000, 'Infusion pump batteries and tubing sets', 'Cancelled', 2, 45000, 'Store Keeper')
ON CONFLICT (grn_number) DO NOTHING;

-- Sample GRN Lines for GRN-2025-001 (Direct Purchase)
INSERT INTO grn_lines (grn_id, line_number, item_id, item_code, item_name, part_number, item_type, qty_received, uom, batch_no, lot_number, serial_numbers, mfg_date, shelf_life_months, warranty_months, unit_rate, batch_required, expiry_required, serial_required) VALUES
    ('g5000000-0000-0000-0000-000000000001', 1, 'i4000000-0000-0000-0000-000000000001', 'BIO-SPR-001', 'SpO2 Sensor Cable', 'PHI-SPO2-M1191B', 'Spare', 10, 'Piece', NULL, NULL, 'SN-SPO2-001,SN-SPO2-002,SN-SPO2-003', '2025-03-15', 60, 12, 5000, FALSE, FALSE, TRUE),
    ('g5000000-0000-0000-0000-000000000001', 2, 'i4000000-0000-0000-0000-000000000002', 'BIO-CON-001', 'ECG Electrode Pads', '3M-2560-ECG', 'Consumable', 50, 'Box (50)', 'BATCH-ECG-2025-A', 'LOT-2025-03', NULL, '2025-02-01', 36, 0, 1000, TRUE, TRUE, FALSE),
    ('g5000000-0000-0000-0000-000000000001', 3, 'i4000000-0000-0000-0000-000000000004', 'BIO-ACC-001', 'NIBP Cuff (Adult)', 'PHI-NIBP-M1574A', 'Accessory', 15, 'Piece', NULL, NULL, 'SN-NIBP-001,SN-NIBP-002', '2025-04-10', 48, 18, 2000, FALSE, FALSE, FALSE)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 11. USEFUL VIEWS
-- ============================================================

-- GRN Summary View (matches list page columns)
CREATE OR REPLACE VIEW v_grn_summary AS
SELECT
    gh.id,
    gh.grn_number,
    gh.grn_date,
    h.hospital_name,
    bs.store_name,
    gh.inward_source,
    gh.vendor_name,
    gh.invoice_no,
    gh.external_ref_no,
    gh.line_count,
    gh.total_amount,
    gh.status,
    gh.created_by,
    gh.created_at,
    gh.remarks
FROM grn_header gh
JOIN hospitals h ON h.id = gh.hospital_id
JOIN biomedical_stores bs ON bs.id = gh.store_id
ORDER BY gh.grn_date DESC;

-- GRN Lines with expiry warnings
CREATE OR REPLACE VIEW v_grn_lines_expiry AS
SELECT
    gl.id,
    gh.grn_number,
    gl.item_code,
    gl.item_name,
    gl.item_type,
    gl.batch_no,
    gl.serial_numbers,
    gl.mfg_date,
    gl.expiry_date,
    gl.warranty_expiry,
    CASE
        WHEN gl.expiry_date IS NOT NULL AND gl.expiry_date < CURRENT_DATE THEN 'Expired'
        WHEN gl.expiry_date IS NOT NULL AND gl.expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'Expiring Soon'
        ELSE 'OK'
    END AS expiry_status,
    CASE
        WHEN gl.warranty_expiry IS NOT NULL AND gl.warranty_expiry < CURRENT_DATE THEN 'Warranty Expired'
        WHEN gl.warranty_expiry IS NOT NULL AND gl.warranty_expiry < CURRENT_DATE + INTERVAL '90 days' THEN 'Warranty Ending Soon'
        ELSE 'OK'
    END AS warranty_status
FROM grn_lines gl
JOIN grn_header gh ON gh.id = gl.grn_id
WHERE gh.status = 'Posted'
ORDER BY gl.expiry_date ASC NULLS LAST;

-- Item-type distribution per GRN
CREATE OR REPLACE VIEW v_grn_item_type_summary AS
SELECT
    gh.grn_number,
    gl.item_type,
    COUNT(*) AS line_count,
    SUM(gl.qty_received) AS total_qty,
    SUM(gl.line_amount) AS total_amount
FROM grn_lines gl
JOIN grn_header gh ON gh.id = gl.grn_id
GROUP BY gh.grn_number, gl.item_type
ORDER BY gh.grn_number, gl.item_type;
