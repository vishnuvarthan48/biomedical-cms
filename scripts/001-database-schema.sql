-- ============================================================================
-- CMMS Multi-Tenant Platform Database Design
-- Covers: Platform Admin -> Tenant Admin -> CMMS Admin (excluding Maintenance)
-- Modules: RBAC, Asset Management, Device Management, Store/Item Master,
--          GRN, Vendor, Reports/Compliance
-- ============================================================================

-- =====================
-- 1. PLATFORM ADMIN
-- =====================

-- 1.1 Tenants (Top-level entity)
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    timezone        VARCHAR(100) DEFAULT 'Asia/Kolkata',
    locale          VARCHAR(20) DEFAULT 'en-IN',
    contact_email   VARCHAR(200),
    contact_phone   VARCHAR(50),
    primary_contact VARCHAR(200),
    notes           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'Draft'
                        CHECK (status IN ('Draft', 'Active', 'Suspended')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_code ON tenants(code);


-- =====================
-- 2. TENANT ADMIN (RBAC)
-- =====================

-- 2.1 Organizations (Hospitals / branches under a tenant)
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    address         TEXT,
    contact_email   VARCHAR(200),
    contact_phone   VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, code)
);

CREATE INDEX idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX idx_organizations_status ON organizations(status);


-- 2.2 Users
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                VARCHAR(200) NOT NULL,
    email               VARCHAR(200) NOT NULL,
    mobile              VARCHAR(50),
    username            VARCHAR(100) NOT NULL UNIQUE,
    password_hash       VARCHAR(500) NOT NULL,
    default_org_id      UUID REFERENCES organizations(id),
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    status              VARCHAR(20) NOT NULL DEFAULT 'Active'
                            CHECK (status IN ('Active', 'Inactive')),
    last_login          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);


-- 2.3 User-Organization Memberships
CREATE TABLE user_org_memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, org_id)
);

CREATE INDEX idx_user_org_user ON user_org_memberships(user_id);
CREATE INDEX idx_user_org_org ON user_org_memberships(org_id);


-- 2.4 Resources (seeded: ASSET, WORK_ORDER, VENDOR, etc.)
CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 2.5 Actions (seeded: VIEW, CREATE, UPDATE, DELETE, APPROVE, etc.)
CREATE TABLE actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 2.6 Roles
CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    description     TEXT,
    scope           VARCHAR(20) NOT NULL DEFAULT 'Org-level'
                        CHECK (scope IN ('Org-level', 'Tenant-level')),
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, code)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);


-- 2.7 Role Permissions (role -> resource -> action, direct mapping)
-- Which role can perform which action on which resource
CREATE TABLE role_permissions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    action_id       UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
    is_allowed      BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    granted_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_role_resource_action UNIQUE (role_id, resource_id, action_id)
);

CREATE INDEX idx_role_perm_role ON role_permissions(role_id);
CREATE INDEX idx_role_perm_resource ON role_permissions(resource_id);
CREATE INDEX idx_role_perm_tenant ON role_permissions(tenant_id);


-- 2.8 User-Org-Role assignment (role per user per org)
CREATE TABLE user_org_roles (
    user_org_membership_id UUID NOT NULL REFERENCES user_org_memberships(id) ON DELETE CASCADE,
    role_id                UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_org_membership_id, role_id)
);


-- 2.14 Audit Logs
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(id),
    actor           VARCHAR(200) NOT NULL,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       VARCHAR(200),
    entity_name     VARCHAR(300),
    action          VARCHAR(50) NOT NULL,
    summary         TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);


-- =======================================
-- 3. DEVICE MANAGEMENT (Device Master)
-- =======================================

-- 3.1 Device Master (device catalog/model registry)
CREATE TABLE device_masters (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    device_code         VARCHAR(50) NOT NULL,
    device_name         VARCHAR(200) NOT NULL,
    device_type         VARCHAR(100),
    generic_name        VARCHAR(200),
    device_model        VARCHAR(200),
    manufacturer        VARCHAR(200),
    ecri                VARCHAR(50),
    model_number        VARCHAR(100),
    catalog_number      VARCHAR(100),
    country_of_origin   VARCHAR(100),
    equipment_class     VARCHAR(50)
                            CHECK (equipment_class IN ('Class I', 'Class II', 'Class III')),
    equipment_type      VARCHAR(50)
                            CHECK (equipment_type IN ('Diagnostic', 'Therapeutic', 'Life Support', 'Laboratory')),
    -- Power specifications
    power_rating        VARCHAR(50),
    power_rating_typical VARCHAR(50),
    power_rating_max    VARCHAR(50),
    inlet_power         VARCHAR(50),
    voltage             VARCHAR(50),
    power_supply_type   VARCHAR(50),
    -- Depreciation defaults
    depreciation_method VARCHAR(20)
                            CHECK (depreciation_method IN ('SLM', 'WDV', 'DDB', 'SYD', 'UOP', 'NONE')),
    useful_life_years   INT,
    salvage_value       DECIMAL(15, 2),
    depreciation_rate   DECIMAL(5, 2),
    depreciation_frequency VARCHAR(20)
                            CHECK (depreciation_frequency IN ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL')),
    status              VARCHAR(20) NOT NULL DEFAULT 'Draft'
                            CHECK (status IN ('Active', 'Draft', 'Inactive')),
    assets_linked       INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, device_code)
);

CREATE INDEX idx_device_masters_tenant ON device_masters(tenant_id);
CREATE INDEX idx_device_masters_status ON device_masters(status);
CREATE INDEX idx_device_masters_manufacturer ON device_masters(manufacturer);


-- 3.2 Device Document Categories (reference data)
CREATE TABLE device_doc_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    allowed_formats VARCHAR(100),
    sort_order      INT NOT NULL DEFAULT 0
);


-- 3.3 Device Documents (attachments linked to device master)
CREATE TABLE device_documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_master_id    UUID NOT NULL REFERENCES device_masters(id) ON DELETE CASCADE,
    doc_category_id     UUID NOT NULL REFERENCES device_doc_categories(id),
    file_name           VARCHAR(500) NOT NULL,
    file_path           VARCHAR(1000) NOT NULL,
    file_size_bytes     BIGINT,
    mime_type           VARCHAR(100),
    uploaded_by         UUID REFERENCES users(id),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_docs_device ON device_documents(device_master_id);


-- ==========================================
-- 4. ASSET MANAGEMENT (Asset Registration)
-- ==========================================

-- 4.1 Assets (individual equipment instances)
CREATE TABLE assets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id),
    asset_code          VARCHAR(50) NOT NULL,
    device_master_id    UUID REFERENCES device_masters(id),
    -- Core identification
    device_name         VARCHAR(200),
    device_type         VARCHAR(100),
    generic_name        VARCHAR(200),
    manufacturer        VARCHAR(200),
    country_of_origin   VARCHAR(100),
    serial_no           VARCHAR(200),
    image_url           VARCHAR(1000),
    -- Classification
    manufactured_date   DATE,
    tag_no              VARCHAR(100),
    lot_no              VARCHAR(100),
    firmware_version    VARCHAR(50),
    software_version    VARCHAR(50),
    -- Configuration
    options_in_device   TEXT,
    connection_type     VARCHAR(20)
                            CHECK (connection_type IN ('WIRED', 'WIRELESS', 'BLUETOOTH', 'USB', 'SERIAL', 'NONE')),
    control_no          VARCHAR(100),
    reference_no        VARCHAR(100),
    is_capital          BOOLEAN NOT NULL DEFAULT FALSE,
    -- Purchase Cost
    purchase_price      DECIMAL(15, 2),
    currency            VARCHAR(10) DEFAULT 'INR',
    tax_percent         DECIMAL(5, 2),
    tax_amount          DECIMAL(15, 2),
    total_cost          DECIMAL(15, 2),
    funding_source      VARCHAR(20)
                            CHECK (funding_source IN ('CAPEX', 'OPEX', 'GRANT', 'LEASE', 'LOAN')),
    budget_code         VARCHAR(100),
    purchase_date       DATE,
    -- Depreciation
    depreciation_method VARCHAR(20)
                            CHECK (depreciation_method IN ('SLM', 'WDV', 'DDB', 'SYD', 'UOP', 'NONE')),
    useful_life_years   INT,
    salvage_value       DECIMAL(15, 2),
    depreciation_rate   DECIMAL(5, 2),
    depreciation_frequency VARCHAR(20),
    dep_start_date      DATE,
    current_book_value  DECIMAL(15, 2),
    accumulated_dep     DECIMAL(15, 2),
    -- Location
    department          VARCHAR(200),
    building            VARCHAR(200),
    floor               VARCHAR(100),
    room_no             VARCHAR(100),
    zone                VARCHAR(100),
    sub_location        VARCHAR(200),
    gps_coordinates     VARCHAR(100),
    -- Installation
    quantity            INT DEFAULT 1,
    installation_date   DATE,
    warranty_expiry     DATE,
    -- Status
    status              VARCHAR(30) NOT NULL DEFAULT 'New'
                            CHECK (status IN ('Working Fine', 'Under Repair', 'Condemned',
                                              'Standby', 'New', 'Not Installed')),
    risk_level          VARCHAR(20)
                            CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Low')),
    category            VARCHAR(100),
    last_pm_date        DATE,
    next_pm_date        DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, asset_code)
);

CREATE INDEX idx_assets_tenant_org ON assets(tenant_id, org_id);
CREATE INDEX idx_assets_device_master ON assets(device_master_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_risk ON assets(risk_level);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_department ON assets(department);
CREATE INDEX idx_assets_serial ON assets(serial_no);


-- 4.2 Asset Accessories (sub-devices / modules on an asset)
CREATE TABLE asset_accessories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    accessory_name  VARCHAR(200) NOT NULL,
    type            VARCHAR(100),
    serial_no       VARCHAR(200),
    quantity        INT DEFAULT 1,
    installation_date DATE,
    warranty_expiry DATE,
    status          VARCHAR(20) DEFAULT 'Active',
    cost            DECIMAL(15, 2),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_accessories_asset ON asset_accessories(asset_id);


-- 4.3 Asset Software Licenses
CREATE TABLE asset_software_licenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    license_name    VARCHAR(200) NOT NULL,
    license_key     VARCHAR(500),
    vendor          VARCHAR(200),
    license_type    VARCHAR(50),
    start_date      DATE,
    validity_months INT,
    renewal_date    DATE,
    status          VARCHAR(20) DEFAULT 'Active',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_sw_licenses_asset ON asset_software_licenses(asset_id);


-- 4.4 Asset Regulatory Certificates
CREATE TABLE asset_regulatory_certs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    cert_name       VARCHAR(200) NOT NULL,
    cert_type       VARCHAR(100),
    issuing_body    VARCHAR(200),
    cert_number     VARCHAR(200),
    start_date      DATE,
    validity_months INT,
    renewal_date    DATE,
    status          VARCHAR(20) DEFAULT 'Active',
    document_url    VARCHAR(1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_reg_certs_asset ON asset_regulatory_certs(asset_id);


-- 4.5 Asset Network Configuration
CREATE TABLE asset_network_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    ip_address      VARCHAR(50),
    subnet_mask     VARCHAR(50),
    gateway         VARCHAR(50),
    dns_primary     VARCHAR(50),
    dns_secondary   VARCHAR(50),
    mac_address     VARCHAR(50),
    vlan_id         VARCHAR(20),
    dicom_ae_title  VARCHAR(100),
    dicom_port      INT,
    hl7_port        INT,
    network_zone    VARCHAR(100),
    wifi_ssid       VARCHAR(200),
    wifi_signal_dbm INT,
    cybersecurity_clearance BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_network_asset ON asset_network_configs(asset_id);


-- 4.6 Asset Safety Compliance (Electrical Safety Testing)
CREATE TABLE asset_safety_compliance (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    applied_part_type   VARCHAR(50),
    protection_class    VARCHAR(50),
    est_standard        VARCHAR(100),
    earth_leakage_pass  BOOLEAN,
    enclosure_leakage_pass BOOLEAN,
    patient_leakage_pass BOOLEAN,
    insulation_resistance_mohm DECIMAL(10, 2),
    test_date           DATE,
    test_interval_months INT,
    max_deviation_percent DECIMAL(5, 2),
    next_est_due        TIMESTAMPTZ,
    tested_by           VARCHAR(200),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_safety_asset ON asset_safety_compliance(asset_id);


-- 4.7 Asset Risk Scoring
CREATE TABLE asset_risk_scores (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id            UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    equipment_function_score INT,
    physical_risk_score INT,
    maintenance_requirement_score INT,
    problem_frequency_score INT,
    failure_consequence_score INT,
    total_score         INT,
    risk_level          VARCHAR(20)
                            CHECK (risk_level IN ('Critical', 'High', 'Medium', 'Low')),
    pm_frequency_months INT,
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_risk_asset ON asset_risk_scores(asset_id);


-- 4.8 Asset Procurement History
CREATE TABLE asset_procurement (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    vendor_id       UUID,
    pr_number       VARCHAR(100),
    pr_date         DATE,
    quote_number    VARCHAR(100),
    quote_date      DATE,
    po_number       VARCHAR(100),
    po_date         DATE,
    invoice_number  VARCHAR(100),
    invoice_date    DATE,
    delivery_challan VARCHAR(100),
    delivery_date   DATE,
    installation_date DATE,
    warranty_period_years INT,
    warranty_start  DATE,
    warranty_end    DATE,
    amc_vendor      VARCHAR(200),
    amc_type        VARCHAR(50),
    amc_value       DECIMAL(15, 2),
    amc_start       DATE,
    amc_end         DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_procurement_asset ON asset_procurement(asset_id);
CREATE INDEX idx_asset_procurement_vendor ON asset_procurement(vendor_id);


-- 4.9 Asset PM Schedule Profiles (linked from asset form)
CREATE TABLE asset_pm_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    pm_type         VARCHAR(50) NOT NULL,
    frequency       VARCHAR(50),
    start_date      DATE,
    next_due_date   DATE,
    assigned_to     UUID REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_pm_profiles_asset ON asset_pm_profiles(asset_id);


-- 4.10 Asset Documents
CREATE TABLE asset_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    doc_category    VARCHAR(200),
    file_name       VARCHAR(500) NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    uploaded_by     UUID REFERENCES users(id),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_docs_asset ON asset_documents(asset_id);


-- ==========================================
-- 5. OPERATIONS: STORE MASTER
-- ==========================================

-- 5.1 Biomedical Stores
CREATE TABLE stores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    org_id          UUID NOT NULL REFERENCES organizations(id),
    store_code      VARCHAR(50) NOT NULL,
    store_name      VARCHAR(200) NOT NULL,
    stock_source    VARCHAR(30) NOT NULL
                        CHECK (stock_source IN ('Direct Purchase', 'External ERP', 'Both')),
    contact_person  VARCHAR(200),
    location        VARCHAR(300),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    remarks         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active'
                        CHECK (status IN ('Active', 'Inactive')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, store_code)
);

CREATE INDEX idx_stores_tenant_org ON stores(tenant_id, org_id);
CREATE INDEX idx_stores_status ON stores(status);


-- ==========================================
-- 6. OPERATIONS: ITEM MASTER
-- ==========================================

-- 6.1 Item Master (spares, consumables, accessories)
CREATE TABLE items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id),
    store_id            UUID NOT NULL REFERENCES stores(id),
    item_code           VARCHAR(50) NOT NULL,
    item_name           VARCHAR(200) NOT NULL,
    item_type           VARCHAR(50) NOT NULL
                            CHECK (item_type IN ('Spare', 'Consumable', 'Accessory', 'Tool')),
    part_number         VARCHAR(100),
    description         TEXT,
    catalogue_number    VARCHAR(100),
    manufacturer        VARCHAR(200),
    department          VARCHAR(200),
    -- UOM
    stock_uom           VARCHAR(50),
    purchase_uom        VARCHAR(50),
    -- Storage location
    rack_number         VARCHAR(50),
    shelf_number        VARCHAR(50),
    -- Reorder info
    reorder_level       INT DEFAULT 0,
    min_order_qty       INT DEFAULT 1,
    reorder_time        VARCHAR(50),
    -- Tracking flags
    batch_required      BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_required     BOOLEAN NOT NULL DEFAULT FALSE,
    serial_tracking     BOOLEAN NOT NULL DEFAULT FALSE,
    -- Current stock
    current_stock       INT NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'Active'
                            CHECK (status IN ('Active', 'Inactive')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, item_code)
);

CREATE INDEX idx_items_tenant_org ON items(tenant_id, org_id);
CREATE INDEX idx_items_store ON items(store_id);
CREATE INDEX idx_items_type ON items(item_type);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_part_number ON items(part_number);


-- 6.2 Item-Device Compatibility (many-to-many)
CREATE TABLE item_device_compatibility (
    item_id         UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    device_master_id UUID NOT NULL REFERENCES device_masters(id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, device_master_id)
);


-- ==========================================
-- 7. OPERATIONS: VENDOR REGISTRATION
-- ==========================================

-- 7.1 Vendors
CREATE TABLE vendors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id),
    vendor_code         VARCHAR(50) NOT NULL,
    vendor_type         VARCHAR(20) NOT NULL
                            CHECK (vendor_type IN ('Local', 'International')),
    country             VARCHAR(100),
    department          VARCHAR(200),
    vendor_name         VARCHAR(300) NOT NULL,
    legal_name          VARCHAR(300),
    website             VARCHAR(500),
    -- Company contact
    company_phone       VARCHAR(50),
    company_mobile      VARCHAR(50),
    company_email       VARCHAR(200),
    fax                 VARCHAR(50),
    -- Point of Contact 1
    poc1_name           VARCHAR(200),
    poc1_mobile         VARCHAR(50),
    poc1_email          VARCHAR(200),
    -- Point of Contact 2
    poc2_name           VARCHAR(200),
    poc2_mobile         VARCHAR(50),
    poc2_email          VARCHAR(200),
    contact_details     TEXT,
    -- Address
    address_line1       VARCHAR(300),
    address_line2       VARCHAR(300),
    city                VARCHAR(100),
    state               VARCHAR(100),
    postal_code         VARCHAR(20),
    -- Trade License
    trade_license_no    VARCHAR(100),
    trade_license_issue DATE,
    trade_license_expiry DATE,
    -- VAT/Tax Registration
    vat_trn             VARCHAR(100),
    vat_cert_no         VARCHAR(100),
    vat_cert_issue      DATE,
    vat_cert_expiry     DATE,
    -- Status
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'Active'
                            CHECK (status IN ('Active', 'Inactive', 'Pending')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, vendor_code)
);

CREATE INDEX idx_vendors_tenant_org ON vendors(tenant_id, org_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_name ON vendors(vendor_name);


-- 7.2 Vendor Documents
CREATE TABLE vendor_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    doc_type        VARCHAR(100) NOT NULL,
    file_name       VARCHAR(500) NOT NULL,
    file_path       VARCHAR(1000) NOT NULL,
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    uploaded_by     UUID REFERENCES users(id),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendor_docs_vendor ON vendor_documents(vendor_id);


-- ==========================================
-- 8. OPERATIONS: GRN (Goods Receipt Note)
-- ==========================================

-- 8.1 GRN Header
CREATE TABLE grn_headers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    org_id              UUID NOT NULL REFERENCES organizations(id),
    store_id            UUID NOT NULL REFERENCES stores(id),
    grn_number          VARCHAR(50) NOT NULL,
    grn_date            DATE NOT NULL,
    inward_source       VARCHAR(30) NOT NULL
                            CHECK (inward_source IN ('Direct Purchase', 'ERP Transfer')),
    -- Direct Purchase fields
    vendor_id           UUID REFERENCES vendors(id),
    invoice_no          VARCHAR(100),
    invoice_date        DATE,
    invoice_amount      DECIMAL(15, 2),
    -- ERP Transfer fields
    external_ref_no     VARCHAR(100),
    transfer_date       DATE,
    source_erp_store    VARCHAR(200),
    -- Common
    remarks             TEXT,
    total_amount        DECIMAL(15, 2) DEFAULT 0,
    line_count          INT DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'Draft'
                            CHECK (status IN ('Draft', 'Posted', 'Cancelled')),
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, grn_number)
);

CREATE INDEX idx_grn_headers_tenant_org ON grn_headers(tenant_id, org_id);
CREATE INDEX idx_grn_headers_store ON grn_headers(store_id);
CREATE INDEX idx_grn_headers_vendor ON grn_headers(vendor_id);
CREATE INDEX idx_grn_headers_status ON grn_headers(status);
CREATE INDEX idx_grn_headers_date ON grn_headers(grn_date);


-- 8.2 GRN Lines (items received)
CREATE TABLE grn_lines (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_header_id       UUID NOT NULL REFERENCES grn_headers(id) ON DELETE CASCADE,
    item_id             UUID NOT NULL REFERENCES items(id),
    item_code           VARCHAR(50),
    item_name           VARCHAR(200),
    part_number         VARCHAR(100),
    qty_received        INT NOT NULL DEFAULT 0,
    uom                 VARCHAR(50),
    batch_no            VARCHAR(100),
    expiry_date         DATE,
    serial_numbers      TEXT,
    unit_rate           DECIMAL(15, 2) DEFAULT 0,
    line_amount         DECIMAL(15, 2) DEFAULT 0,
    -- Tracking flags (inherited from item master)
    batch_required      BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_required     BOOLEAN NOT NULL DEFAULT FALSE,
    serial_required     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_grn_lines_header ON grn_lines(grn_header_id);
CREATE INDEX idx_grn_lines_item ON grn_lines(item_id);


-- ==========================================
-- 9. ANALYTICS: COMPLIANCE & REPORTS
-- ==========================================

-- 9.1 Compliance Frameworks
CREATE TABLE compliance_frameworks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    full_name       VARCHAR(500),
    description     TEXT,
    total_items     INT NOT NULL DEFAULT 0,
    completed_items INT NOT NULL DEFAULT 0,
    score           DECIMAL(5, 2) DEFAULT 0,
    status          VARCHAR(30) DEFAULT 'Compliant'
                        CHECK (status IN ('Compliant', 'Attention', 'Non-Compliant')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_tenant ON compliance_frameworks(tenant_id);


-- 9.2 Compliance Checklist Items
CREATE TABLE compliance_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id        UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    item_code           VARCHAR(50),
    description         TEXT NOT NULL,
    is_completed        BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by        UUID REFERENCES users(id),
    completed_at        TIMESTAMPTZ,
    evidence_url        VARCHAR(1000),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compliance_items_framework ON compliance_items(framework_id);


-- 9.3 Report Definitions (configurable report catalog)
CREATE TABLE report_definitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category        VARCHAR(100) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    query_template  TEXT,
    is_system       BOOLEAN NOT NULL DEFAULT TRUE,
    status          VARCHAR(20) DEFAULT 'Active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_report_defs_tenant ON report_definitions(tenant_id);
CREATE INDEX idx_report_defs_category ON report_definitions(category);


-- ==========================================
-- 10. STOCK MOVEMENT (Inventory Tracking)
-- ==========================================

-- 10.1 Stock Movements (stock-in, stock-out, adjustments)
CREATE TABLE stock_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    store_id        UUID NOT NULL REFERENCES stores(id),
    item_id         UUID NOT NULL REFERENCES items(id),
    movement_type   VARCHAR(20) NOT NULL
                        CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'TRANSFER')),
    quantity        INT NOT NULL,
    reference_type  VARCHAR(50),
    reference_id    UUID,
    batch_no        VARCHAR(100),
    serial_no       VARCHAR(200),
    remarks         TEXT,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_movements_tenant_store ON stock_movements(tenant_id, store_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);


-- ==========================================
-- 11. CROSS-CUTTING: ORG SWITCHER
-- ==========================================

-- This is handled by user_org_memberships + default_org_id on users table.
-- The org-switcher in the UI reads from user_org_memberships WHERE status='Active'
-- and sets the active context via default_org_id or a session variable.


-- ==========================================
-- 12. UPDATED_AT TRIGGER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_privileges_updated BEFORE UPDATE ON privileges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_device_masters_updated BEFORE UPDATE ON device_masters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_stores_updated BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_items_updated BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendors_updated BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_grn_headers_updated BEFORE UPDATE ON grn_headers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_compliance_updated BEFORE UPDATE ON compliance_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_asset_network_updated BEFORE UPDATE ON asset_network_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
