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
    tenant_id           BIGINT NOT NULL,
    org_id              BIGINT NOT NULL,
    store_id            UUID NOT NULL REFERENCES biomedical_stores(id) ON DELETE CASCADE,
    item_id             BIGINT NOT NULL REFERENCES item_master(id) ON DELETE CASCADE,
    
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
    CONSTRAINT uq_store_item_config UNIQUE (tenant_id, org_id, store_id, item_id),
    CONSTRAINT fk_store_tenant_org FOREIGN KEY(tenant_id, org_id) 
        REFERENCES biomedical_stores(tenant_id, org_id),
    CONSTRAINT fk_item_tenant_org FOREIGN KEY(tenant_id, org_id) 
        REFERENCES item_master(tenant_id, org_id)
);

COMMENT ON TABLE store_item_config IS 'Store-specific inventory settings for items. Each store can have different reorder levels, locations, and lead times for the same item.';
COMMENT ON COLUMN store_item_config.reorder_level IS 'Stock level at which item should be reordered. Varies by store based on consumption rate and storage capacity.';
COMMENT ON COLUMN store_item_config.min_order_qty IS 'Minimum quantity to purchase in one order for this store. May differ based on store size and budget.';
COMMENT ON COLUMN store_item_config.reorder_time_days IS 'Lead time (days) from purchase order to delivery for this store. Accounts for location-specific delivery times.';

-- Indexes for performance
CREATE INDEX idx_store_item_config_tenant_org ON store_item_config(tenant_id, org_id);
CREATE INDEX idx_store_item_config_store ON store_item_config(store_id);
CREATE INDEX idx_store_item_config_item ON store_item_config(item_id);
CREATE INDEX idx_store_item_config_store_item ON store_item_config(store_id, item_id);
CREATE INDEX idx_store_item_config_active ON store_item_config(store_id) WHERE is_active = 'ACTIVE';

-- ============================================================
-- STEP 2: Helper Views and Queries
-- ============================================================

-- View: Item details with store configuration
CREATE OR REPLACE VIEW v_store_items AS
SELECT 
    im.tenant_id,
    im.org_id,
    im.id as item_id,
    im.item_code,
    im.item_name,
    im.item_type,
    im.manufacturer,
    bs.id as store_id,
    bs.store_name,
    COALESCE(sic.rack_number, 'Not Assigned') as rack_number,
    COALESCE(sic.shelf_number, 'Not Assigned') as shelf_number,
    COALESCE(sic.bin_location, '') as bin_location,
    COALESCE(sic.reorder_level, 0) as reorder_level,
    COALESCE(sic.min_order_qty, 1) as min_order_qty,
    COALESCE(sic.reorder_time_days, 14) as reorder_time_days,
    im.current_stock,
    sic.is_active,
    sic.created_at
FROM item_master im
JOIN biomedical_stores bs ON im.tenant_id = bs.tenant_id AND im.org_id = bs.org_id
LEFT JOIN store_item_config sic ON im.id = sic.item_id AND bs.id = sic.store_id
WHERE im.is_active = 'ACTIVE' AND bs.is_active = 'ACTIVE'
ORDER BY bs.store_name, im.item_code;

COMMENT ON VIEW v_store_items IS 'Shows all items with store-specific configurations. Includes items not yet configured for a store (with defaults).';

-- View: Low stock items per store (for alerts)
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    bs.tenant_id,
    bs.org_id,
    bs.store_name,
    im.item_code,
    im.item_name,
    sic.reorder_level,
    im.current_stock,
    (sic.reorder_level - im.current_stock) as qty_to_reorder,
    sic.min_order_qty,
    sic.reorder_time_days,
    CASE 
        WHEN im.current_stock <= 0 THEN 'CRITICAL - Out of Stock'
        WHEN im.current_stock <= (sic.reorder_level * 0.5) THEN 'HIGH - Below 50% Reorder Level'
        WHEN im.current_stock <= sic.reorder_level THEN 'MEDIUM - At Reorder Level'
        ELSE 'OK'
    END as alert_level
FROM store_item_config sic
JOIN item_master im ON sic.item_id = im.id AND sic.tenant_id = im.tenant_id AND sic.org_id = im.org_id
JOIN biomedical_stores bs ON sic.store_id = bs.id AND sic.tenant_id = bs.tenant_id AND sic.org_id = bs.org_id
WHERE sic.is_active = 'ACTIVE' 
    AND im.is_active = 'ACTIVE'
    AND bs.is_active = 'ACTIVE'
    AND im.current_stock <= sic.reorder_level
ORDER BY bs.tenant_id, bs.org_id, bs.store_name, im.current_stock ASC;

COMMENT ON VIEW v_low_stock_alerts IS 'Shows items that need to be reordered per store based on current stock vs reorder level.';

-- ============================================================
-- SAMPLE QUERIES
-- ============================================================

-- Query: Get store configuration for an item
-- SELECT * FROM store_item_config 
-- WHERE tenant_id = 1 AND org_id = 1 AND item_id = 'item-uuid' AND store_id = 'store-uuid';

-- Query: Get all items not configured for a specific store
-- SELECT DISTINCT im.* FROM item_master im
-- LEFT JOIN store_item_config sic ON im.id = sic.item_id AND sic.store_id = 'store-uuid'
-- WHERE sic.id IS NULL AND im.tenant_id = 1 AND im.org_id = 1;

-- Query: Get reorder alerts for a specific organization
-- SELECT * FROM v_low_stock_alerts WHERE tenant_id = 1 AND org_id = 1;
