-- ============================================================================
-- VENDOR MASTER MIGRATION - Schema Alignment with Vendor Registration Form
-- ============================================================================
-- This migration updates the vendors table to match the comprehensive
-- Vendor Registration form design with POC details, compliance fields, etc.
-- ============================================================================

-- Step 1: Verify vendors table has all required fields
-- (If running fresh with updated grn-schema.sql, this is already done)
-- If upgrading from old schema, the ALTER commands below are idempotent

-- Step 2: Seed sample vendors for demo/testing
-- Get hospital ID for inserting vendors
DO $$
DECLARE
    hospital_id UUID;
    v_vendor1_id UUID;
    v_vendor2_id UUID;
    v_vendor3_id UUID;
BEGIN
    -- Get first hospital
    SELECT id INTO hospital_id FROM hospitals LIMIT 1;
    
    IF hospital_id IS NOT NULL THEN
        -- Generate UUIDs for vendors
        v_vendor1_id := uuid_generate_v4();
        v_vendor2_id := uuid_generate_v4();
        v_vendor3_id := uuid_generate_v4();
        
        -- Insert sample vendor 1: Local supplier
        INSERT INTO vendors (
            id, hospital_id, vendor_type, vendor_name, legal_name, vendor_code, country,
            website, company_phone, company_mobile, company_email, company_fax,
            poc1_name, poc1_mobile, poc1_email,
            poc2_name, poc2_mobile, poc2_email,
            address_line1, address_line2, city, state, postal_code,
            trade_license_no, trade_license_issue_date, trade_license_expiry_date,
            vat_trn, vat_cert_no, is_active, status, notes
        ) VALUES (
            v_vendor1_id, hospital_id, 'Local', 'MedEquip Solutions LLC', 'MedEquip Solutions LLC',
            'VND-MED-001', 'UAE',
            'www.medequip.ae', '+971-4-3456789', '+971-50-1234567', 'info@medequip.ae', '+971-4-3456780',
            'Ahmed Al Rashid', '+971-50-1111111', 'ahmed@medequip.ae',
            'Sara Khan', '+971-50-2222222', 'sara@medequip.ae',
            'Office 501, Business Bay Tower', 'Al Abraj Street', 'Dubai', 'Dubai', '123456',
            'TL-2024-78901', '2024-01-15', '2026-01-14',
            '100234567890003', 'VAT-2024-001', TRUE, 'Active',
            'Preferred vendor for patient monitors and ventilators'
        ) ON CONFLICT (vendor_code) DO NOTHING;
        
        -- Insert sample vendor 2: International
        INSERT INTO vendors (
            id, hospital_id, vendor_type, vendor_name, legal_name, vendor_code, country,
            website, company_phone, company_mobile, company_email, company_fax,
            poc1_name, poc1_mobile, poc1_email,
            poc2_name, poc2_mobile, poc2_email,
            address_line1, city, state, postal_code,
            trade_license_no, trade_license_issue_date, trade_license_expiry_date,
            is_active, status, notes
        ) VALUES (
            v_vendor2_id, hospital_id, 'International', 'Siemens Healthineers AG', 'Siemens Healthineers AG',
            'VND-SHI-001', 'Germany',
            'www.siemens-healthineers.com', '+49-9131-840', '+49-170-1234567', 'orders@siemens-healthineers.com', '+49-9131-841',
            'Dr. Klaus Weber', '+49-160-1234567', 'klaus.weber@siemens-healthineers.com',
            'Maria Mueller', '+49-160-7654321', 'maria.mueller@siemens-healthineers.com',
            'Siemens Healthineers AG, Henkeloopstraat 123', 'Erlangen', 'Bayern', '91052',
            'TL-2023-45678', '2023-06-01', '2025-05-31',
            TRUE, 'Active',
            'Imaging systems and diagnostic equipment supplier'
        ) ON CONFLICT (vendor_code) DO NOTHING;
        
        -- Insert sample vendor 3: Local, pending approval
        INSERT INTO vendors (
            id, hospital_id, vendor_type, vendor_name, legal_name, vendor_code, country,
            company_phone, company_mobile, company_email,
            poc1_name, poc1_mobile, poc1_email,
            address_line1, city, state, postal_code,
            is_active, status, notes
        ) VALUES (
            v_vendor3_id, hospital_id, 'Local', 'BioMed Components India', 'BioMed Components Private Limited',
            'VND-BMC-001', 'India',
            '+91-22-1234567', '+91-98765-43210', 'sales@biomedcomponents.in',
            'Rajesh Kumar', '+91-98765-11111', 'rajesh@biomedcomponents.in',
            '123 Medical Plaza, Sector 5', 'Mumbai', 'Maharashtra', '400012',
            FALSE, 'Pending',
            'New vendor for spare parts - awaiting compliance documents'
        ) ON CONFLICT (vendor_code) DO NOTHING;
        
        RAISE NOTICE 'Vendor master seeded successfully for hospital: %', hospital_id;
    ELSE
        RAISE WARNING 'No hospitals found. Please create a hospital first.';
    END IF;
END $$;

-- Step 3: Verify vendors table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'vendors'
ORDER BY ordinal_position;

-- Step 4: Verify indexed columns
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'vendors'
ORDER BY indexname;

-- Step 5: Verify vendor counts
SELECT COUNT(*) as total_vendors, 
       COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_vendors,
       COUNT(CASE WHEN status = 'Active' THEN 1 END) as status_active,
       COUNT(CASE WHEN status = 'Pending' THEN 1 END) as status_pending
FROM vendors;

COMMENT ON COLUMN vendors.vendor_type IS 'Local or International vendor classification';
COMMENT ON COLUMN vendors.poc1_name IS 'Primary Point of Contact for official correspondence';
COMMENT ON COLUMN vendors.poc2_name IS 'Secondary Point of Contact for backup communication';
COMMENT ON COLUMN vendors.trade_license_no IS 'Trade license / business registration number';
COMMENT ON COLUMN vendors.vat_trn IS 'VAT Tax Registration Number (for VAT-registered vendors)';
COMMENT ON COLUMN vendors.vat_cert_no IS 'VAT certificate number for compliance';
