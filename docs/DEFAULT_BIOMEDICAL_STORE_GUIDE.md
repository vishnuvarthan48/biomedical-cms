
# Default Biomedical Store - Concept & Usage Guide

## Overview
The **Default Biomedical Store** is a special designation in the CMMS system that marks one store per hospital as the "primary" or "main" store for biomedical parts, spares, and consumables inventory management.

---

## What it Does

### 1. **Primary Store for Inventory Transactions**
   - When you create a GRN (Goods Receipt Note), if no specific store is selected, it defaults to this store
   - All general inventory receipts and stock movements route through this store by default
   - Simplifies data entry for routine operations

### 2. **Default Location for Stock Allocation**
   - When a maintenance work order requires biomedical spares, the system automatically suggests this store
   - Technicians check this store first for spare parts
   - Reduces confusion when multiple stores exist

### 3. **Centralized Reporting**
   - All unspecified inventory reports default to showing stock from this store
   - Finance and procurement teams know where to look for primary inventory data
   - Dashboard metrics and KPIs report against this store by default

### 4. **Stock Visibility**
   - When checking "available stock," the system prioritizes this store's inventory
   - Cross-location transfers might pull from this store if items are unavailable locally

---

## When to Use Default Store

### ✓ **Use Default Store For:**

1. **Single Store Hospital**
   - Mark the only store as default
   - All transactions automatically route correctly

2. **Multi-Store Hospitals with Central Supply**
   - Mark the central/main biomedical store as default (e.g., main warehouse)
   - Other stores (ICU store, OT store, ward store) are secondary
   - Central store handles bulk receiving and distribution

3. **Primary Reception & Inventory Hub**
   - Mark the store where you receive most GRNs
   - Mark the store where initial stock inspection happens
   - Mark the store for inter-departmental stock requests

### ✗ **Do NOT Use Default Store For:**

- **Specialty Department Stores** (unless it's also the main store)
- **Consumable-only stores** (if you have separate spares store as default)
- **Temporary stores** or project-specific stores
- **Closed or archived stores** (mark as Inactive instead)

---

## Multi-Store Hospital Example

**Apollo Hospital - Chennai**

```
┌─ Biomedical Spares Store [DEFAULT] ⭐
│  └─ Location: Block B, Ground Floor
│  └─ Stock Source: Both (Direct + ERP)
│  └─ Purpose: Central warehouse for all biomedical spares
│  └─ Handles: GRN receipt, central inventory, distribution
│
├─ ICU Biomedical Store
│  └─ Location: ICU Wing, 4th Floor
│  └─ Stock Source: Direct Purchase only
│  └─ Purpose: Critical spare parts for ICU equipment
│  └─ Handles: Emergency replacements, local stock
│
└─ OT Biomedical Store
   └─ Location: Operation Theater, 5th Floor
   └─ Stock Source: Direct Purchase only
   └─ Purpose: Surgical equipment spare parts
   └─ Handles: Scheduled maintenance, planned stock
```

**Workflow:**
1. Vendor ships parts → **Default Store receives GRN**
2. Items inspected and stored at default location
3. Department requests items → **Transferred to ICU/OT stores**
4. Department uses items from their local store
5. If not available locally → **System suggests checking default store**

---

## System Behavior with Default Store

### GRN Creation (Without Store Selection)
```
GRN Entry Screen
├─ Hospital: Apollo Chennai (auto-filled)
├─ Store: [Not specified by user]
└─ System Action: Routes to DEFAULT store automatically
   └─ Spares received at "Biomedical Spares Store"
```

### Work Order - Spare Part Availability Check
```
Technician creates work order for equipment repair
├─ Required spare: Infusion pump module
├─ Search results:
│  ✓ ICU Store: 0 units
│  ✓ OT Store: 1 unit (request to bring)
│  ✓ DEFAULT Store: 5 units ⭐ (recommended)
└─ Technician action: Can take from OT or request from default store
```

### Stock Reports & Dashboard
```
Hospital Inventory Dashboard
├─ Active Stock: [Shown from DEFAULT store]
├─ Low Stock Items: [Alerts from DEFAULT store]
├─ Stock Value: [Calculated from DEFAULT store]
└─ Note: Can filter/switch to other stores if needed
```

---

## Database Schema Representation

```sql
CREATE TABLE biomedical_stores (
    id              UUID PRIMARY KEY,
    hospital_id     UUID NOT NULL,      -- Which hospital
    store_name      VARCHAR(200),       -- "Biomedical Spares Store"
    stock_source    VARCHAR(30),        -- Direct/ERP/Both
    is_default      BOOLEAN,            -- ⭐ Default flag (only 1 per hospital)
    status          VARCHAR(20),        -- Active/Inactive
    created_at      TIMESTAMPTZ
);

-- Each hospital can have many stores, but only ONE can have is_default = TRUE
-- UNIQUE constraint on (hospital_id, is_default=TRUE) ensures this
```

---

## Best Practices

### ✓ DO:
- Set exactly **ONE default store per hospital**
- Make the **central/main warehouse** as default
- Keep the default store **ACTIVE** (don't mark Inactive unless replacing it)
- Mark the store as default **during initial setup**
- Document the reason in "Remarks" field

### ✗ DON'T:
- Leave a hospital **without a default store** (causes system confusion)
- Mark a **ward-level or departmental store** as default (unless it's also the main store)
- Change the default store **frequently** (can cause transaction routing issues)
- Set multiple stores as default (system enforces only 1, but causes confusion)
- Archive a default store without assigning a new default first

---

## Configuration Best Practices

### Small Hospital (Single Store)
```
✓ Create 1 store: "Biomedical Store"
✓ Mark as: Default (is_default = TRUE)
✓ All transactions route automatically
```

### Medium Hospital (2-3 Stores)
```
✓ Central store (Main warehouse) → Default
✓ Department stores (ICU, OT) → Not default
✓ GRN always at central store
✓ Requisitions pull from appropriate store
```

### Large Hospital Network (4+ Stores)
```
✓ Regional central store → Default
✓ Departmental stores → Not default
✓ Satellite stores (other buildings) → Not default
✓ Consider: Separate item masters per store vs. shared inventory
```

---

## When to Change Default Store

**Scenario 1: New Store Added**
- Old default still works
- No change needed unless strategic decision
- Example: New central warehouse opened → can transfer default flag

**Scenario 2: Default Store Closed**
- MUST assign a new default before closing old one
- Prevents system failures and transaction routing errors
- Steps:
  1. Mark old store as Inactive (keep data)
  2. Mark another store as Default
  3. Update any pending transactions referencing old store

**Scenario 3: Store Reorganization**
- All stores exist, but hierarchy changes
- Update default to reflect new organizational structure
- Communicate to all departments

---

## Summary

| **Aspect** | **Details** |
|---|---|
| **Purpose** | Designate primary inventory store per hospital |
| **Count** | Only 1 per hospital can be default |
| **Used For** | Default GRN location, stock searches, reporting |
| **Set During** | Initial store setup / hospital configuration |
| **Best Practice** | Central warehouse → Default; Department stores → Non-default |
| **Can Change?** | Yes, but rarely needed once configured |
| **If Not Set** | System confusion, incorrect transaction routing |

When adding stores to a hospital, **always designate one as the default** to ensure smooth inventory operations and clear transaction flow.

