# Store Architecture: Single vs Dual Table Design

## Current Design: Single `biomedical_stores` Table

Currently, the system uses **ONE table: `biomedical_stores`** to manage all inventory storage locations in a hospital.

```sql
CREATE TABLE biomedical_stores (
    id              UUID PRIMARY KEY,
    hospital_id     UUID NOT NULL REFERENCES hospitals(id),
    store_name      VARCHAR(200) NOT NULL,
    stock_source    VARCHAR(30) NOT NULL DEFAULT 'Both'
                    CHECK (stock_source IN ('Direct Purchase', 'External ERP', 'Both')),
    contact_person  VARCHAR(150),
    location        VARCHAR(200),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    status          VARCHAR(20) NOT NULL DEFAULT 'Active',
    remarks         TEXT,
    created_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ
);
```

---

## Why NOT Use Two Tables (`stores` + `biomedical_stores`)?

### ❌ Anti-Pattern Reasons:

#### 1. **Domain Separation Does NOT Mean Table Separation**
- `stores` (generic, across all modules: pharmacy, supply chain, warehouse)
- `biomedical_stores` (biomedical-specific, within CMMS module)

**Reality Check:**
- The biomedical stores ARE stores. They don't serve another purpose.
- There's no generic "stores" entity that's broader than biomedical stores in a hospital's CMMS system.
- A hospital doesn't have generic "stores" that aren't biomedical stores.

#### 2. **Creates Unnecessary Foreign Key Chains**
With two tables:
```
item_master → biomedical_stores → stores (redundant lookup)
grn_header  → biomedical_stores → stores (redundant lookup)
```

Result: More database queries, slower joins, data duplication.

#### 3. **Business Logic Confusion**
If you split them, what goes where?
- Store Name → `stores` or `biomedical_stores`? (AMBIGUOUS)
- Location → `stores` or `biomedical_stores`? (AMBIGUOUS)
- Is Default → `stores` or `biomedical_stores`? (AMBIGUOUS)

This leads to data consistency issues and unclear responsibility.

#### 4. **Violates Single Responsibility Principle (SRP)**
- `stores` would have overlapping columns with `biomedical_stores`
- Both represent the same real-world entity: a hospital inventory storage location
- Splitting them violates SRP because the responsibility is now split across two tables

---

## When TWO Tables WOULD Make Sense

### Scenario A: Multiple Module Stores
If the hospital had **separate store systems for different modules**:
```
Generic stores table:
├─ Central Pharmacy Store (pharmacy_module)
├─ Blood Bank Store (blood_bank_module)
├─ Biomedical Store 1 (CMMS_module)
├─ Biomedical Store 2 (CMMS_module)
└─ Supply Chain Warehouse (supply_chain_module)
```

Then you'd have:
```sql
CREATE TABLE stores (                   -- Generic
    id, hospital_id, store_name, location, status, ...
);

CREATE TABLE biomedical_stores (        -- Module-Specific
    id, store_id (FK to stores), shelf_life_policy, ...
);
```

**But this is NOT our case.** Our system is CMMS-only for stores.

### Scenario B: Shared Store Infrastructure
If multiple modules needed to consume stores data:
```
pharmacy_grn_lines → stores
blood_bank_inventory → stores
biomedical_grn_lines → stores
```

Then a shared `stores` table + module-specific junction tables makes sense.

**But our design doesn't require this.** Pharmacy and Blood Bank aren't part of CMMS.

---

## Recommended Architecture: SINGLE `biomedical_stores` Table

### ✅ Keep Current Design

**Advantages:**
1. **Direct, One-to-One Relationship** - No redundant lookups
2. **Clear Semantics** - `biomedical_stores` explicitly says "these are store locations for biomedical inventory"
3. **Easy Querying** - Item → Store is a single FK relationship
4. **Minimal Joins** - Fewer tables = faster queries
5. **Explicit Domain Context** - Naming makes it clear this is biomedical-specific

**Example Query:**
```sql
-- Current: Simple and direct
SELECT i.item_name, s.store_name, s.location
FROM item_master i
JOIN biomedical_stores s ON i.store_id = s.id
WHERE i.hospital_id = $1;
```

vs with two tables:
```sql
-- Two tables: Unnecessary join
SELECT i.item_name, s.store_name, gs.location
FROM item_master i
JOIN biomedical_stores bs ON i.biomedical_store_id = bs.id
JOIN stores gs ON bs.store_id = gs.id
WHERE i.hospital_id = $1;
```

---

## Future Scalability

### If pharmacy/blood_bank modules are added later:
You can still maintain separate tables:
```
stores (shared by all modules)         ← Added later if needed
├─ biomedical_stores (FK to stores)
├─ pharmacy_stores (FK to stores)
└─ blood_bank_stores (FK to stores)
```

But for now, keeping `biomedical_stores` as a standalone table is correct because:
- CMMS is currently the only module managing inventory stores
- Adding pharmacy/blood_bank would be a future feature
- YAGNI (You Aren't Gonna Need It) - don't over-engineer for hypothetical scenarios

---

## Conclusion

**Use the current single-table design: `biomedical_stores`**

| Aspect | Single Table (Current) | Dual Table (Anti-Pattern) |
|--------|------------------------|--------------------------|
| Joins | 1 | 2+ |
| Data Duplication | None | High |
| Query Performance | Faster | Slower |
| Schema Clarity | Clear | Ambiguous |
| Maintenance | Simple | Complex |
| SRP Violation | No | Yes |

The dual-table design would only be beneficial if:
1. ✅ Multiple hospital modules share the same store infrastructure
2. ✅ You need polymorphic queries across store types

Neither applies to our current architecture.
