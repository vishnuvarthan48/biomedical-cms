-- ============================================================
-- GRN Schema v2: Store-Item Configuration Migration
-- Purpose: Separate store-specific inventory settings from item_master
-- ============================================================
-- This migration creates a new store_item_config table to manage
-- store-specific settings like rack/shelf location, reorder levels,
-- min order qty, and reorder lead time for each item per store.
--
-- Benefits:
-- - Supports different reorder levels/quantities per store
-- - Allows different rack/shelf arrangements for same item
-- - Enables store-specific lead times
-- - Multi-store inventory management with separate policies
-- ============================================================

-- ============================================================
-- STEP 1: Create the new store_item_config table
-- ============================================================

CREATE TABLE IF NOT EXISTS store_item_config (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id         UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    store_id            UUID NOT NULL REFERENCES biomedical_stores(id) ON DELETE CASCADE,
    item_id             UUID NOT NULL REFERENCES item_master(id) ON DELETE CASCADE,
    
    -- Store-specific location fields
    rack_number         VARCHAR(50),
    shelf_number        VARCHAR(50),
    bin_location        VARCHAR(100),              -- Optional: Additional location info
    
    -- Store-specific reorder policies
    reorder_level       INT NOT NULL DEFAULT 0,   -- Point at which item is reordered
    min_order_qty       INT NOT NULL DEFAULT 1,   -- Minimum quantity to order
    reorder_time_days   INT DEFAULT 14,           -- Lead time from supplier for this store
    
    -- Store-specific metadata
    is_active           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (is_active IN ('ACTIVE', 'INACTIVE', 'DELETED')),
    remarks             TEXT,
    
    -- Audit fields
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one config per store-item combination
    CONSTRAINT uq_store_item_config UNIQUE (hospital_id, store_id, item_id)
);

COMMENT ON TABLE store_item_config IS 'Store-specific inventory settings for items. Each store can have different reorder levels, locations, and lead times for the same item.';
COMMENT ON COLUMN store_item_config.reorder_level IS 'Stock level at which item should be reordered. Varies by store based on consumption rate and storage capacity.';
COMMENT ON COLUMN store_item_config.min_order_qty IS 'Minimum quantity to purchase in one order for this store. May differ based on store size and budget.';
COMMENT ON COLUMN store_item_config.reorder_time_days IS 'Lead time (days) from purchase order to delivery for this store. Accounts for location-specific delivery times.';

-- Indexes for performance
CREATE INDEX idx_store_item_config_hospital ON store_item_config(hospital_id);
CREATE INDEX idx_store_item_config_store ON store_item_config(store_id);
CREATE INDEX idx_store_item_config_item ON store_item_config(item_id);
CREATE INDEX idx_store_item_config_store_item ON store_item_config(store_id, item_id);
CREATE INDEX idx_store_item_config_active ON store_item_config(store_id) WHERE is_active = 'ACTIVE';

-- ============================================================
-- STEP 2: Migrate existing data from item_master
-- ============================================================
-- If the hospital already has items with store assignments,
-- migrate their store-specific settings to the new table

INSERT INTO store_item_config (hospital_id, store_id, item_id, rack_number, shelf_number, reorder_level, min_order_qty, reorder_time_days, is_active)
SELECT 
    im.hospital_id,
    im.store_id,
    im.id,
    im.rack_number,
    im.shelf_number,
    im.reorder_level,
    im.min_order_qty,
    im.reorder_time_days,
    'ACTIVE'
FROM item_master im
WHERE im.store_id IS NOT NULL
ON CONFLICT (hospital_id, store_id, item_id) DO NOTHING;

-- ============================================================
-- STEP 3: Remove store-specific columns from item_master
-- ============================================================
-- Note: This is optional - you can keep them for backward compatibility
-- or remove them entirely. Uncomment to remove:

-- ALTER TABLE item_master
--     DROP COLUMN IF EXISTS rack_number,
--     DROP COLUMN IF EXISTS shelf_number,
--     DROP COLUMN IF EXISTS reorder_level,
--     DROP COLUMN IF EXISTS min_order_qty,
--     DROP COLUMN IF EXISTS reorder_time_days;

-- ============================================================
-- STEP 4: Update item_master to remove store_id
-- ============================================================
-- Items are now global/hospital-wide. Store mapping is in store_item_config.
-- Optional: uncomment to enforce this change:

-- ALTER TABLE item_master
--     DROP COLUMN IF EXISTS store_id;

-- ============================================================
-- STEP 5: Helper Views and Queries
-- ============================================================

-- View: Item details with store configuration
CREATE OR REPLACE VIEW v_store_items AS
SELECT 
    im.id as item_id,
    im.item_code,
    im.item_name,
    im.item_type,
    im.manufacturer,
    bs.id as store_id,
    bs.store_name,
    h.id as hospital_id,
    h.hospital_name,
    COALESCE(sic.rack_number, 'Not Assigned') as rack_number,
    COALESCE(sic.shelf_number, 'Not Assigned') as shelf_number,
    COALESCE(sic.reorder_level, 0) as reorder_level,
    COALESCE(sic.min_order_qty, 1) as min_order_qty,
    COALESCE(sic.reorder_time_days, 14) as reorder_time_days,
    im.current_stock,
    sic.is_active,
    sic.created_at
FROM item_master im
JOIN hospitals h ON im.hospital_id = h.id
CROSS JOIN biomedical_stores bs
LEFT JOIN store_item_config sic ON im.id = sic.item_id AND bs.id = sic.store_id
WHERE im.status = 'Active' AND bs.status = 'Active'
ORDER BY bs.store_name, im.item_code;

COMMENT ON VIEW v_store_items IS 'Shows all items with store-specific configurations. Includes items not yet configured for a store (with defaults).';

-- View: Low stock items per store (for alerts)
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    h.hospital_name,
    bs.store_name,
    im.item_code,
    im.item_name,
    sic.reorder_level,
    im.current_stock,
    (sic.reorder_level - im.current_stock) as qty_to_reorder,
    sic.min_order_qty,
    CASE 
        WHEN im.current_stock <= 0 THEN 'CRITICAL - Out of Stock'
        WHEN im.current_stock <= (sic.reorder_level * 0.5) THEN 'HIGH - Below 50% Reorder Level'
        WHEN im.current_stock <= sic.reorder_level THEN 'MEDIUM - At Reorder Level'
        ELSE 'OK'
    END as alert_level
FROM store_item_config sic
JOIN item_master im ON sic.item_id = im.id
JOIN biomedical_stores bs ON sic.store_id = bs.id
JOIN hospitals h ON sic.hospital_id = h.id
WHERE sic.is_active = 'ACTIVE' 
    AND im.status = 'Active'
    AND bs.status = 'Active'
    AND im.current_stock <= sic.reorder_level
ORDER BY h.hospital_name, bs.store_name, im.current_stock ASC;

COMMENT ON VIEW v_low_stock_alerts IS 'Shows items that need to be reordered per store based on current stock vs reorder level.';

-- Query: Get store configuration for an item
-- Usage: SELECT * FROM store_item_config WHERE item_id = 'item-uuid' AND store_id = 'store-uuid';

-- Query: Get all items not configured for a specific store
-- SELECT DISTINCT im.* FROM item_master im
-- LEFT JOIN store_item_config sic ON im.id = sic.item_id AND sic.store_id = 'store-uuid'
-- WHERE sic.id IS NULL AND im.hospital_id = 'hospital-uuid';

-- ============================================================
-- STEP 6: Sample Data (for testing multi-store scenario)
-- ============================================================

-- Uncomment to insert sample store configurations:

/*
-- Assuming these records exist from base schema:
-- hospitals: id = 'h1', name = 'City Medical Center'
-- biomedical_stores: id = 's1' (Central Store), id = 's2' (ICU Store)
-- item_master: id = 'i1' (item code: ECGCABLE001)

INSERT INTO store_item_config (hospital_id, store_id, item_id, rack_number, shelf_number, reorder_level, min_order_qty, reorder_time_days, is_active, remarks)
VALUES 
    ('h1', 's1', 'i1', 'A-01', '3', 50, 10, 7, 'ACTIVE', 'Central store: faster lead time'),
    ('h1', 's2', 'i1', 'B-02', '2', 20, 5, 14, 'ACTIVE', 'ICU store: lower stock, longer lead time');
*/

-- ============================================================
-- STEP 7: Rollback Instructions (if needed)
-- ============================================================

/*
-- To rollback this migration:

-- 1. Restore columns to item_master (if you dropped them)
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES biomedical_stores(id);
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS rack_number VARCHAR(50);
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS shelf_number VARCHAR(50);
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS reorder_level INT DEFAULT 0;
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS min_order_qty INT DEFAULT 1;
ALTER TABLE item_master ADD COLUMN IF NOT EXISTS reorder_time_days INT DEFAULT 14;

-- 2. Copy data back from store_item_config
UPDATE item_master im SET 
    store_id = sic.store_id,
    rack_number = sic.rack_number,
    shelf_number = sic.shelf_number,
    reorder_level = sic.reorder_level,
    min_order_qty = sic.min_order_qty,
    reorder_time_days = sic.reorder_time_days
FROM store_item_config sic
WHERE im.id = sic.item_id;

-- 3. Drop the new table and views
DROP VIEW IF EXISTS v_low_stock_alerts;
DROP VIEW IF EXISTS v_store_items;
DROP TABLE IF EXISTS store_item_config;
*/
