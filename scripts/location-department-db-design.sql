-- ============================================================================
-- DATABASE DESIGN: Location, Department & Mapping Module
-- Module     : Administration > Location & Department Master
-- Version    : 4.0
-- Convention : BIGINT GENERATED ALWAYS AS IDENTITY, tenant-scoped, FK IDs
-- Hierarchy  : Organization (RBAC, already exists)
--                └── Building > Floor > Room > Bed  (physical)
--              Department (logical) mapped via department_location_map
-- Note       : Organization table exists in RBAC module. We reference org_id
--              as a BIGINT FK. No separate facility table is needed.
-- ============================================================================


-- ============================================================================
-- SECTION A: MASTER / LOOKUP TABLES
-- ============================================================================

-- A1. room_type  (ICU, OT, Ward, General, Lab, Store, CSSD, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS room_type (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(30)  NOT NULL,
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(300),
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, code)
);

INSERT INTO room_type (tenant_id, code, name, description, sort_order) VALUES
(1, 'ICU',       'Intensive Care Unit',            'Critical care rooms',                  1),
(1, 'MICU',      'Medical ICU',                    'Medical intensive care',               2),
(1, 'NICU',      'Neonatal ICU',                   'Neonatal intensive care',              3),
(1, 'CICU',      'Cardiac ICU',                    'Cardiac intensive care',               4),
(1, 'CCU',       'Coronary Care Unit',             'Coronary care rooms',                  5),
(1, 'OT',        'Operation Theatre',              'Surgical operation theatres',          6),
(1, 'WARD',      'General Ward',                   'General patient wards',                7),
(1, 'PVT-ROOM',  'Private Room',                   'Single-patient private rooms',         8),
(1, 'SEMI-PVT',  'Semi-Private Room',              'Shared 2-patient rooms',               9),
(1, 'ER',        'Emergency Room',                 'Emergency / trauma rooms',            10),
(1, 'OPD',       'Out-Patient Department',         'Consultation rooms',                  11),
(1, 'LAB',       'Laboratory',                     'Pathology / microbiology labs',       12),
(1, 'RAD',       'Radiology',                      'Imaging & radiology rooms',           13),
(1, 'PHARM',     'Pharmacy',                       'Pharmacy / drug dispensing',          14),
(1, 'STORE',     'Store Room',                     'Equipment / consumable storage',      15),
(1, 'CSSD',      'CSSD',                           'Central Sterile Supply Department',   16),
(1, 'DIALYSIS',  'Dialysis Unit',                  'Dialysis treatment rooms',            17),
(1, 'BLOOD-BNK', 'Blood Bank',                     'Blood bank processing area',          18),
(1, 'ADMIN',     'Administrative',                 'Admin / office rooms',                19),
(1, 'UTILITY',   'Utility Room',                   'Utility / service rooms',             20);


-- A2. location_level  (BUILDING, FLOOR, ROOM, BED -- enum-like lookup)
-- ============================================================================
CREATE TABLE IF NOT EXISTS location_level (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,

    code          VARCHAR(20)  NOT NULL,       -- BUILDING, FLOOR, ROOM, BED
    name          VARCHAR(60)  NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, code)
);

INSERT INTO location_level (tenant_id, code, name, sort_order) VALUES
(1, 'BUILDING', 'Building',   1),
(1, 'FLOOR',    'Floor',      2),
(1, 'ROOM',     'Room',       3),
(1, 'BED',      'Bed',        4);


-- ============================================================================
-- SECTION B: PHYSICAL HIERARCHY TABLES
-- ============================================================================
-- Organization table already exists in RBAC module with:
--   org_id BIGINT PK, tenant_id, org_name, org_code, address, city, state, etc.
-- We reference it via org_id FK without recreating it.
-- ============================================================================

-- B1. building  (top physical level, belongs to an organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS building (
    building_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    org_id        BIGINT NOT NULL,              -- FK to organization (RBAC)

    building_name VARCHAR(150) NOT NULL,
    building_code VARCHAR(50),
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, org_id, building_code)
);

CREATE INDEX idx_building_org ON building(tenant_id, org_id);


-- B2. floor
-- ============================================================================
CREATE TABLE IF NOT EXISTS floor (
    floor_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    org_id        BIGINT NOT NULL,              -- FK to organization (RBAC) - denormalized for direct queries

    building_id   BIGINT NOT NULL REFERENCES building(building_id) ON DELETE CASCADE,
    floor_no      INT NOT NULL,                  -- -1=Basement, 0=Ground, 1,2...
    floor_name    VARCHAR(100),                  -- e.g. "Basement", "Ground Floor"
    description   VARCHAR(300),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, building_id, floor_no)
);

CREATE INDEX idx_floor_building ON floor(tenant_id, building_id);
CREATE INDEX idx_floor_org      ON floor(tenant_id, org_id);


-- B3. room
-- ============================================================================
CREATE TABLE IF NOT EXISTS room (
    room_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    org_id        BIGINT NOT NULL,              -- FK to organization (RBAC) - denormalized for direct queries

    floor_id      BIGINT NOT NULL REFERENCES floor(floor_id) ON DELETE CASCADE,
    room_no       VARCHAR(50) NOT NULL,          -- e.g. "ICU-301", "OT-501"
    room_name     VARCHAR(100),                  -- e.g. "Medical ICU"
    room_type_id  BIGINT REFERENCES room_type(id),
    description   VARCHAR(300),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, floor_id, room_no)
);

CREATE INDEX idx_room_floor     ON room(tenant_id, floor_id);
CREATE INDEX idx_room_type      ON room(tenant_id, room_type_id);
CREATE INDEX idx_room_org       ON room(tenant_id, org_id);


-- B4. bed
-- ============================================================================
CREATE TABLE IF NOT EXISTS bed (
    bed_id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    org_id        BIGINT NOT NULL,              -- FK to organization (RBAC) - denormalized for direct queries

    room_id       BIGINT NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
    bed_no        VARCHAR(50) NOT NULL,          -- e.g. "1", "2", "A"
    bed_code      VARCHAR(80),                   -- optional global code e.g. "ER-B1"
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, room_id, bed_no)
);

CREATE INDEX idx_bed_room ON bed(tenant_id, room_id);
CREATE INDEX idx_bed_org  ON bed(tenant_id, org_id);


-- ============================================================================
-- SECTION C: DEPARTMENT (LOGICAL) + LOCATION MAPPING
-- ============================================================================

-- C1. department  (belongs to an organization, not a physical location)
-- ============================================================================
CREATE TABLE IF NOT EXISTS department (
    dept_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id     BIGINT NOT NULL,
    org_id        BIGINT NOT NULL,              -- FK to organization (RBAC)

    dept_name     VARCHAR(150) NOT NULL,
    dept_code     VARCHAR(60),
    description   VARCHAR(500),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,

    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, org_id, dept_name)
);

CREATE INDEX idx_dept_org ON department(tenant_id, org_id);


-- C2. department_location_map
-- ============================================================================
-- Maps a department to any physical level: BUILDING, FLOOR, ROOM, or BED.
-- location_id stores the PK of the referenced physical entity based on
-- the location_level_id (polymorphic FK).
-- One department can span multiple buildings/floors/rooms/beds.
-- is_primary marks the department's main physical location.
-- ============================================================================
CREATE TABLE IF NOT EXISTS department_location_map (
    dept_loc_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tenant_id        BIGINT NOT NULL,

    dept_id          BIGINT NOT NULL REFERENCES department(dept_id) ON DELETE CASCADE,
    org_id           BIGINT NOT NULL,            -- FK to organization (RBAC)
    location_level_id BIGINT NOT NULL REFERENCES location_level(id),
    location_id      BIGINT NOT NULL,            -- building_id|floor_id|room_id|bed_id

    is_primary       BOOLEAN NOT NULL DEFAULT FALSE,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, dept_id, location_level_id, location_id)
);

CREATE INDEX idx_dept_loc_dept    ON department_location_map(tenant_id, dept_id);
CREATE INDEX idx_dept_loc_level   ON department_location_map(tenant_id, location_level_id, location_id);
CREATE INDEX idx_dept_loc_org     ON department_location_map(tenant_id, org_id);


-- ============================================================================
-- SECTION D: SUMMARY VIEWS
-- ============================================================================

-- D1. Building summary (floor/room/bed counts per building + org info)
-- ============================================================================
CREATE OR REPLACE VIEW vw_building_summary AS
SELECT
    b.tenant_id,
    b.building_id,
    b.building_name,
    b.building_code,
    b.is_active           AS building_active,
    b.org_id,
    COUNT(DISTINCT fl.floor_id)  AS floor_count,
    COUNT(DISTINCT r.room_id)    AS room_count,
    COUNT(DISTINCT bd.bed_id)    AS bed_count,
    COUNT(DISTINCT bd.bed_id) FILTER (WHERE bd.is_active) AS active_bed_count
FROM building b
LEFT JOIN floor fl ON fl.building_id = b.building_id
LEFT JOIN room  r  ON r.floor_id = fl.floor_id
LEFT JOIN bed   bd ON bd.room_id = r.room_id
GROUP BY b.tenant_id, b.building_id, b.building_name, b.building_code,
         b.is_active, b.org_id;


-- D2. Department mapping summary (resolves physical location breadcrumbs)
-- ============================================================================
CREATE OR REPLACE VIEW vw_department_location_summary AS
SELECT
    dlm.tenant_id,
    dlm.dept_loc_id,
    d.dept_id,
    d.dept_name,
    d.dept_code,
    d.is_active           AS dept_active,
    dlm.org_id,
    ll.code               AS location_level,
    dlm.location_id,
    dlm.is_primary,
    -- Resolved single-level name
    CASE ll.code
        WHEN 'BUILDING' THEN (SELECT building_name FROM building WHERE building_id = dlm.location_id)
        WHEN 'FLOOR'    THEN (SELECT floor_name    FROM floor    WHERE floor_id    = dlm.location_id)
        WHEN 'ROOM'     THEN (SELECT room_name     FROM room     WHERE room_id     = dlm.location_id)
        WHEN 'BED'      THEN (SELECT 'Bed ' || bed_no FROM bed   WHERE bed_id      = dlm.location_id)
    END AS location_name,
    -- Full breadcrumb path
    CASE ll.code
        WHEN 'BUILDING' THEN (
            SELECT building_name FROM building WHERE building_id = dlm.location_id
        )
        WHEN 'FLOOR' THEN (
            SELECT bld.building_name || ' > ' || fl.floor_name
            FROM floor fl
            JOIN building bld ON bld.building_id = fl.building_id
            WHERE fl.floor_id = dlm.location_id
        )
        WHEN 'ROOM' THEN (
            SELECT bld.building_name || ' > ' || fl.floor_name || ' > ' || r.room_no || ' - ' || COALESCE(r.room_name, '')
            FROM room r
            JOIN floor fl      ON fl.floor_id = r.floor_id
            JOIN building bld  ON bld.building_id = fl.building_id
            WHERE r.room_id = dlm.location_id
        )
        WHEN 'BED' THEN (
            SELECT bld.building_name || ' > ' || fl.floor_name || ' > ' || r.room_no || ' - ' || COALESCE(r.room_name, '') || ' > Bed ' || bd.bed_no
            FROM bed bd
            JOIN room r        ON r.room_id = bd.room_id
            JOIN floor fl      ON fl.floor_id = r.floor_id
            JOIN building bld  ON bld.building_id = fl.building_id
            WHERE bd.bed_id = dlm.location_id
        )
    END AS location_breadcrumb
FROM department_location_map dlm
JOIN department d          ON d.dept_id = dlm.dept_id
JOIN location_level ll     ON ll.id = dlm.location_level_id;


-- D3. Floor detail view (rooms + beds + room types per floor)
-- ============================================================================
CREATE OR REPLACE VIEW vw_floor_detail AS
SELECT
    fl.tenant_id,
    fl.floor_id,
    fl.floor_no,
    fl.floor_name,
    fl.is_active          AS floor_active,
    b.building_id,
    b.building_name,
    b.org_id,
    COUNT(DISTINCT r.room_id)  AS room_count,
    COUNT(DISTINCT bd.bed_id)  AS bed_count,
    COUNT(DISTINCT bd.bed_id) FILTER (WHERE bd.is_active) AS active_bed_count,
    STRING_AGG(DISTINCT rt.name, ', ' ORDER BY rt.name)   AS room_types
FROM floor fl
JOIN building b    ON b.building_id = fl.building_id
LEFT JOIN room r   ON r.floor_id = fl.floor_id
LEFT JOIN bed bd   ON bd.room_id = r.room_id
LEFT JOIN room_type rt ON rt.id = r.room_type_id
GROUP BY fl.tenant_id, fl.floor_id, fl.floor_no, fl.floor_name,
         fl.is_active, b.building_id, b.building_name, b.org_id;


-- D4. Room detail view (bed count + room type name)
-- ============================================================================
CREATE OR REPLACE VIEW vw_room_detail AS
SELECT
    r.tenant_id,
    r.room_id,
    r.room_no,
    r.room_name,
    r.is_active           AS room_active,
    rt.code               AS room_type_code,
    rt.name               AS room_type_name,
    fl.floor_id,
    fl.floor_name,
    b.building_id,
    b.building_name,
    b.org_id,
    COUNT(DISTINCT bd.bed_id)  AS bed_count,
    COUNT(DISTINCT bd.bed_id) FILTER (WHERE bd.is_active) AS active_bed_count
FROM room r
JOIN floor fl      ON fl.floor_id = r.floor_id
JOIN building b    ON b.building_id = fl.building_id
LEFT JOIN room_type rt ON rt.id = r.room_type_id
LEFT JOIN bed bd       ON bd.room_id = r.room_id
GROUP BY r.tenant_id, r.room_id, r.room_no, r.room_name, r.is_active,
         rt.code, rt.name, fl.floor_id, fl.floor_name,
         b.building_id, b.building_name, b.org_id;


-- D5. Organization location overview (aggregated counts)
-- ============================================================================
CREATE OR REPLACE VIEW vw_org_location_overview AS
SELECT
    b.tenant_id,
    b.org_id,
    COUNT(DISTINCT b.building_id)  AS building_count,
    COUNT(DISTINCT fl.floor_id)    AS floor_count,
    COUNT(DISTINCT r.room_id)      AS room_count,
    COUNT(DISTINCT bd.bed_id)      AS bed_count,
    COUNT(DISTINCT bd.bed_id) FILTER (WHERE bd.is_active) AS active_bed_count,
    COUNT(DISTINCT d.dept_id)      AS department_count
FROM building b
LEFT JOIN floor fl     ON fl.building_id = b.building_id
LEFT JOIN room r       ON r.floor_id = fl.floor_id
LEFT JOIN bed bd       ON bd.room_id = r.room_id
LEFT JOIN department d ON d.org_id = b.org_id AND d.tenant_id = b.tenant_id AND d.is_active = TRUE
GROUP BY b.tenant_id, b.org_id;


-- ============================================================================
-- SECTION E: SEED DATA  (Apollo Hospital, tenant_id = 1)
-- ============================================================================
-- Assumes organization table already has:
--   org_id = 1 -> Apollo Chennai - Main Campus
--   org_id = 2 -> Apollo Chennai - OMR Branch
-- ============================================================================

-- E1. Buildings
-- ============================================================================
INSERT INTO building (tenant_id, org_id, building_name, building_code, description) VALUES
-- org_id=1 (Main Campus)
(1, 1, 'Main Tower',              'MT', 'Primary 8-floor main tower'),            -- building_id = 1
(1, 1, 'Diagnostic Block',        'DX', 'Radiology, Pathology, Blood Bank'),      -- building_id = 2
-- org_id=2 (OMR Branch)
(1, 2, 'Block A - Main Hospital', 'BA', '10-floor main hospital block');          -- building_id = 3


-- E2. Floors
-- ============================================================================
INSERT INTO floor (tenant_id, org_id, building_id, floor_no, floor_name) VALUES
-- Main Tower (building_id=1, org_id=1)
(1, 1, 1, -1, 'Basement'),          -- floor_id = 1
(1, 1, 1,  0, 'Ground Floor'),      -- floor_id = 2
(1, 1, 1,  1, '1st Floor'),         -- floor_id = 3
(1, 1, 1,  2, '2nd Floor'),         -- floor_id = 4
(1, 1, 1,  3, '3rd Floor'),         -- floor_id = 5
(1, 1, 1,  4, '4th Floor'),         -- floor_id = 6
(1, 1, 1,  5, '5th Floor'),         -- floor_id = 7
(1, 1, 1,  6, '6th Floor'),         -- floor_id = 8

-- Diagnostic Block (building_id=2, org_id=1)
(1, 1, 2,  0, 'Ground Floor'),      -- floor_id = 9
(1, 1, 2,  1, '1st Floor'),         -- floor_id = 10
(1, 1, 2,  2, '2nd Floor'),         -- floor_id = 11
(1, 1, 2,  3, '3rd Floor'),         -- floor_id = 12

-- Block A - OMR (building_id=3, org_id=2)
(1, 2, 3, -1, 'Basement'),          -- floor_id = 13
(1, 2, 3,  0, 'Ground Floor'),      -- floor_id = 14
(1, 2, 3,  1, '1st Floor'),         -- floor_id = 15
(1, 2, 3,  2, '2nd Floor'),         -- floor_id = 16
(1, 2, 3,  3, '3rd Floor'),         -- floor_id = 17
(1, 2, 3,  4, '4th Floor'),         -- floor_id = 18
(1, 2, 3,  5, '5th Floor');         -- floor_id = 19


-- E3. Rooms
-- ============================================================================
-- room_type_id references: ICU=1, MICU=2, NICU=3, CICU=4, CCU=5, OT=6,
--   WARD=7, PVT=8, SEMI=9, ER=10, OPD=11, LAB=12, RAD=13, PHARM=14,
--   STORE=15, CSSD=16, DIALYSIS=17, BLOOD-BNK=18, ADMIN=19, UTILITY=20

INSERT INTO room (tenant_id, org_id, floor_id, room_no, room_name, room_type_id) VALUES
-- Main Tower > Basement (floor_id=1, org_id=1)
(1, 1,  1, 'CSSD-B01',  'CSSD',                  16),   -- room_id = 1

-- Main Tower > Ground Floor (floor_id=2, org_id=1)
(1, 1,  2, 'ER-001',    'Emergency',              10),   -- room_id = 2
(1, 1,  2, 'OPD-002',   'OPD',                    11),   -- room_id = 3
(1, 1,  2, 'RAD-003',   'Radiology',              13),   -- room_id = 4

-- Main Tower > 1st Floor (floor_id=3, org_id=1)
(1, 1,  3, 'WA-101',    'Ward A',                  7),   -- room_id = 5
(1, 1,  3, 'WB-102',    'Ward B',                  7),   -- room_id = 6
(1, 1,  3, 'LAB-103',   'Laboratory',             12),   -- room_id = 7

-- Main Tower > 2nd Floor (floor_id=4, org_id=1)
(1, 1,  4, 'WC-201',    'Ward C',                  7),   -- room_id = 8
(1, 1,  4, 'WD-202',    'Ward D',                  7),   -- room_id = 9

-- Main Tower > 3rd Floor (floor_id=5, org_id=1)
(1, 1,  5, 'MICU-301',  'MICU',                    2),   -- room_id = 10
(1, 1,  5, 'NICU-302',  'NICU',                    3),   -- room_id = 11
(1, 1,  5, 'CICU-303',  'CICU',                    4),   -- room_id = 12

-- Main Tower > 4th Floor (floor_id=6, org_id=1)
(1, 1,  6, 'CCU-401',   'CCU',                     5),   -- room_id = 13

-- Main Tower > 5th Floor (floor_id=7, org_id=1)
(1, 1,  7, 'OT-501',    'General Surgery OT',      6),   -- room_id = 14
(1, 1,  7, 'OT-502',    'Cardiac Surgery OT',      6),   -- room_id = 15
(1, 1,  7, 'OT-503',    'Neuro Surgery OT',        6),   -- room_id = 16
(1, 1,  7, 'OT-504',    'Uro Surgery OT',          6),   -- room_id = 17

-- Main Tower > 6th Floor (floor_id=8, org_id=1)
(1, 1,  8, 'OT-601',    'Ortho Surgery OT',        6),   -- room_id = 18
(1, 1,  8, 'OT-602',    'Gyne Surgery OT',         6),   -- room_id = 19

-- Diagnostic Block > Ground Floor (floor_id=9, org_id=1)
(1, 1,  9, 'RD-001',    'Radiology & Imaging',     13),  -- room_id = 20

-- Diagnostic Block > 1st Floor (floor_id=10, org_id=1)
(1, 1, 10, 'LAB-101',   'Pathology Lab',           12),  -- room_id = 21
(1, 1, 10, 'LAB-102',   'Microbiology Lab',        12),  -- room_id = 22

-- Diagnostic Block > 2nd Floor (floor_id=11, org_id=1)
(1, 1, 11, 'BB-201',    'Blood Bank',              18),  -- room_id = 23

-- Diagnostic Block > 3rd Floor (floor_id=12, org_id=1)
(1, 1, 12, 'DU-301',    'Dialysis Unit',           17),  -- room_id = 24

-- Block A OMR > Basement (floor_id=13, org_id=2)
(1, 2, 13, 'CSSD-B01',  'CSSD',                    16),  -- room_id = 25

-- Block A OMR > Ground Floor (floor_id=14, org_id=2)
(1, 2, 14, 'ER-G01',    'Emergency',               10),  -- room_id = 26
(1, 2, 14, 'OPD-G02',   'General OPD',             11),  -- room_id = 27
(1, 2, 14, 'PH-G03',    'Pharmacy',                14),  -- room_id = 28

-- Block A OMR > 1st Floor (floor_id=15, org_id=2)
(1, 2, 15, 'C-101',     'Cardiology OPD',          11),  -- room_id = 29
(1, 2, 15, 'RAD-101',   'Radiology',               13),  -- room_id = 30

-- Block A OMR > 2nd Floor (floor_id=16, org_id=2)
(1, 2, 16, 'ICU-201',   'ICU',                      1),  -- room_id = 31

-- Block A OMR > 3rd Floor (floor_id=17, org_id=2)
(1, 2, 17, 'OT-301',    'OT Complex',               6),  -- room_id = 32

-- Block A OMR > 4th Floor (floor_id=18, org_id=2)
(1, 2, 18, 'C-401',     'Cardiology',               1),  -- room_id = 33

-- Block A OMR > 5th Floor (floor_id=19, org_id=2)
(1, 2, 19, 'N-501',     'Neurology',                7);  -- room_id = 34


-- E4. Beds
-- ============================================================================
-- Emergency ER-001 (room_id=2, org_id=1): 8 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code) VALUES
(1, 1, 2, '1', 'ER-B1'), (1, 1, 2, '2', 'ER-B2'), (1, 1, 2, '3', 'ER-B3'), (1, 1, 2, '4', 'ER-B4'),
(1, 1, 2, '5', 'ER-B5'), (1, 1, 2, '6', 'ER-B6'), (1, 1, 2, '7', 'ER-B7'), (1, 1, 2, '8', 'ER-B8');
-- bed_id 1..8

-- Ward A WA-101 (room_id=5, org_id=1): 20 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 5, n::TEXT, 'WA-B' || n FROM generate_series(1, 20) AS n;
-- bed_id 9..28

-- Ward B WB-102 (room_id=6, org_id=1): 20 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 6, n::TEXT, 'WB-B' || n FROM generate_series(1, 20) AS n;
-- bed_id 29..48

-- Ward C WC-201 (room_id=8, org_id=1): 18 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 8, n::TEXT, 'WC-B' || n FROM generate_series(1, 18) AS n;
-- bed_id 49..66

-- Ward D WD-202 (room_id=9, org_id=1): 18 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 9, n::TEXT, 'WD-B' || n FROM generate_series(1, 18) AS n;
-- bed_id 67..84

-- MICU-301 (room_id=10, org_id=1): 12 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 10, n::TEXT, 'MICU-B' || n FROM generate_series(1, 12) AS n;
-- bed_id 85..96

-- NICU-302 (room_id=11, org_id=1): 8 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 11, n::TEXT, 'NICU-B' || n FROM generate_series(1, 8) AS n;
-- bed_id 97..104

-- CICU-303 (room_id=12, org_id=1): 6 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 12, n::TEXT, 'CICU-B' || n FROM generate_series(1, 6) AS n;
-- bed_id 105..110

-- CCU-401 (room_id=13, org_id=1): 6 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 13, n::TEXT, 'CCU-B' || n FROM generate_series(1, 6) AS n;
-- bed_id 111..116

-- Dialysis DU-301 (room_id=24, org_id=1): 10 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 1, 24, n::TEXT, 'DU-B' || n FROM generate_series(1, 10) AS n;
-- bed_id 117..126

-- OMR Emergency ER-G01 (room_id=26, org_id=2): 6 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 2, 26, n::TEXT, 'ER-B' || n FROM generate_series(1, 6) AS n;
-- bed_id 127..132

-- OMR ICU-201 (room_id=31, org_id=2): 10 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 2, 31, n::TEXT, 'ICU-B' || n FROM generate_series(1, 10) AS n;
-- bed_id 133..142

-- OMR Cardiology C-401 (room_id=33, org_id=2): 16 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 2, 33, n::TEXT, 'CARD-B' || n FROM generate_series(1, 16) AS n;
-- bed_id 143..158

-- OMR Neurology N-501 (room_id=34, org_id=2): 12 beds
INSERT INTO bed (tenant_id, org_id, room_id, bed_no, bed_code)
SELECT 1, 2, 34, n::TEXT, 'NEURO-B' || n FROM generate_series(1, 12) AS n;
-- bed_id 159..170


-- E5. Departments
-- ============================================================================
INSERT INTO department (tenant_id, org_id, dept_name, dept_code, description) VALUES
-- Main Campus (org_id=1)
(1, 1, 'Emergency Medicine',  'EM',    'Emergency department'),                          -- dept_id = 1
(1, 1, 'General Surgery',     'GS',    'General surgery department'),                    -- dept_id = 2
(1, 1, 'Radiology',           'RAD',   'Imaging & diagnostics'),                        -- dept_id = 3
(1, 1, 'Critical Care',       'CC',    'ICU, MICU, NICU, CICU, CCU'),                   -- dept_id = 4
(1, 1, 'CSSD',                'CSSD',  'Central Sterile Supply'),                        -- dept_id = 5
(1, 1, 'Dialysis Unit',       'DU',    'Renal dialysis services'),                       -- dept_id = 6
(1, 1, 'General Medicine',    'GM',    'General medicine wards'),                        -- dept_id = 7

-- OMR Branch (org_id=2)
(1, 2, 'Emergency Medicine',  'EM',    'OMR emergency department'),                      -- dept_id = 8
(1, 2, 'Cardiology',          'CARD',  'Cardiology department'),                         -- dept_id = 9
(1, 2, 'Neurology',           'NEURO', 'Neurology ward');                                -- dept_id = 10


-- E6. Department Location Mappings
-- ============================================================================
-- location_level_id: BUILDING=1, FLOOR=2, ROOM=3, BED=4
-- bed_id reference: ER=1-8, WA=9-28, WB=29-48, WC=49-66, WD=67-84,
--                   MICU=85-96, NICU=97-104, CICU=105-110, CCU=111-116,
--                   DU=117-126, OMR-ER=127-132, OMR-ICU=133-142,
--                   OMR-CARD=143-158, OMR-NEURO=159-170

INSERT INTO department_location_map (tenant_id, dept_id, org_id, location_level_id, location_id, is_primary) VALUES
-- DEPT 1: Emergency Medicine (Main) -> ER-001 room + 4 ER beds
(1, 1, 1, 3, 2,   TRUE),   -- ROOM: ER-001 (room_id=2) PRIMARY
(1, 1, 1, 4, 1,   FALSE),  -- BED:  ER-B1  (bed_id=1)
(1, 1, 1, 4, 2,   FALSE),  -- BED:  ER-B2  (bed_id=2)
(1, 1, 1, 4, 3,   FALSE),  -- BED:  ER-B3  (bed_id=3)
(1, 1, 1, 4, 5,   FALSE),  -- BED:  ER-B5  (bed_id=5)

-- DEPT 2: General Surgery -> OT-501, OT-502 rooms + 3 Ward A beds
(1, 2, 1, 3, 14,  TRUE),   -- ROOM: OT-501 (room_id=14) PRIMARY
(1, 2, 1, 3, 15,  FALSE),  -- ROOM: OT-502 (room_id=15)
(1, 2, 1, 4, 9,   FALSE),  -- BED:  WA-B1  (bed_id=9)
(1, 2, 1, 4, 13,  FALSE),  -- BED:  WA-B5  (bed_id=13)
(1, 2, 1, 4, 18,  FALSE),  -- BED:  WA-B10 (bed_id=18)

-- DEPT 3: Radiology -> RAD-003 room + RD-001 room
(1, 3, 1, 3, 4,   TRUE),   -- ROOM: RAD-003 (room_id=4) PRIMARY
(1, 3, 1, 3, 20,  FALSE),  -- ROOM: RD-001 (room_id=20)

-- DEPT 4: Critical Care -> 3rd Floor + CCU room + 8 ICU beds
(1, 4, 1, 2, 5,   TRUE),   -- FLOOR: 3rd Floor (floor_id=5) PRIMARY
(1, 4, 1, 3, 13,  FALSE),  -- ROOM: CCU-401 (room_id=13)
(1, 4, 1, 4, 85,  FALSE),  -- BED:  MICU-B1  (bed_id=85)
(1, 4, 1, 4, 87,  FALSE),  -- BED:  MICU-B3  (bed_id=87)
(1, 4, 1, 4, 90,  FALSE),  -- BED:  MICU-B6  (bed_id=90)
(1, 4, 1, 4, 97,  FALSE),  -- BED:  NICU-B1  (bed_id=97)
(1, 4, 1, 4, 100, FALSE),  -- BED:  NICU-B4  (bed_id=100)
(1, 4, 1, 4, 106, FALSE),  -- BED:  CICU-B2  (bed_id=106)
(1, 4, 1, 4, 111, FALSE),  -- BED:  CCU-B1   (bed_id=111)
(1, 4, 1, 4, 113, FALSE),  -- BED:  CCU-B3   (bed_id=113)

-- DEPT 5: CSSD -> CSSD-B01 room
(1, 5, 1, 3, 1,   TRUE),   -- ROOM: CSSD-B01 (room_id=1) PRIMARY

-- DEPT 6: Dialysis Unit -> DU-301 room + 5 dialysis beds
(1, 6, 1, 3, 24,  TRUE),   -- ROOM: DU-301 (room_id=24) PRIMARY
(1, 6, 1, 4, 117, FALSE),  -- BED:  DU-B1   (bed_id=117)
(1, 6, 1, 4, 118, FALSE),  -- BED:  DU-B2   (bed_id=118)
(1, 6, 1, 4, 120, FALSE),  -- BED:  DU-B4   (bed_id=120)
(1, 6, 1, 4, 123, FALSE),  -- BED:  DU-B7   (bed_id=123)
(1, 6, 1, 4, 126, FALSE),  -- BED:  DU-B10  (bed_id=126)

-- DEPT 7: General Medicine -> Ward A + Ward B rooms + 5 beds
(1, 7, 1, 3, 5,   TRUE),   -- ROOM: WA-101 (room_id=5) PRIMARY
(1, 7, 1, 4, 10,  FALSE),  -- BED:  WA-B2   (bed_id=10)
(1, 7, 1, 4, 16,  FALSE),  -- BED:  WA-B8   (bed_id=16)
(1, 7, 1, 4, 23,  FALSE),  -- BED:  WA-B15  (bed_id=23)
(1, 7, 1, 3, 6,   FALSE),  -- ROOM: WB-102 (room_id=6)
(1, 7, 1, 4, 31,  FALSE),  -- BED:  WB-B3   (bed_id=31)
(1, 7, 1, 4, 40,  FALSE),  -- BED:  WB-B12  (bed_id=40)

-- DEPT 8: Emergency Medicine (OMR) -> ER-G01 room + 3 ER beds
(1, 8, 2, 3, 26,  TRUE),   -- ROOM: ER-G01 (room_id=26) PRIMARY
(1, 8, 2, 4, 127, FALSE),  -- BED:  ER-B1   (bed_id=127)
(1, 8, 2, 4, 129, FALSE),  -- BED:  ER-B3   (bed_id=129)
(1, 8, 2, 4, 131, FALSE),  -- BED:  ER-B5   (bed_id=131)

-- DEPT 9: Cardiology (OMR) -> Cardiology OPD + Cardiology room + 4 CARD beds
(1, 9, 2, 3, 29,  FALSE),  -- ROOM: C-101 (room_id=29)
(1, 9, 2, 3, 33,  TRUE),   -- ROOM: C-401 (room_id=33) PRIMARY
(1, 9, 2, 4, 143, FALSE),  -- BED:  CARD-B1  (bed_id=143)
(1, 9, 2, 4, 146, FALSE),  -- BED:  CARD-B4  (bed_id=146)
(1, 9, 2, 4, 150, FALSE),  -- BED:  CARD-B8  (bed_id=150)
(1, 9, 2, 4, 154, FALSE),  -- BED:  CARD-B12 (bed_id=154)

-- DEPT 10: Neurology (OMR) -> Neurology room + 3 NEURO beds
(1, 10, 2, 3, 34,  TRUE),  -- ROOM: N-501 (room_id=34) PRIMARY
(1, 10, 2, 4, 159, FALSE), -- BED:  NEURO-B1 (bed_id=159)
(1, 10, 2, 4, 163, FALSE), -- BED:  NEURO-B5 (bed_id=163)
(1, 10, 2, 4, 167, FALSE); -- BED:  NEURO-B9 (bed_id=167)


-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
