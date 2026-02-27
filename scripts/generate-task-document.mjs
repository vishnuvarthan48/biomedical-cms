import * as XLSX from "xlsx";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─────────────────────────────────────────────
// TASK DATA
// ─────────────────────────────────────────────
const modules = [
  {
    name: "Device Management",
    color: "1565C0",
    tasks: [
      { id: "DM-001", type: "Epic",    title: "Device Master Setup",                       priority: "Critical", status: "In Progress", points: 0,  assignee: "Dev Team",  sprint: "Sprint 1", description: "Foundation module — all asset registrations depend on this catalog" },
      { id: "DM-002", type: "Story",   title: "Device list page with search & filter",     priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 1", description: "List view: Device ID, Name, Type, Manufacturer, Model, Risk Class, Status, Asset count. Filter by type/status." },
      { id: "DM-003", type: "Story",   title: "Create / Edit Device form",                 priority: "High",     status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 1", description: "Fields: Device Name*, Device Type*, Generic Name*, Device Model*, ECRI Code, Manufacturer*, Model No, Catalog No, Country of Origin*, Risk Classification*, Expected Lifespan, Regulatory Approval, Hospital*, Department, Description*, Power Rating, Voltage, Power Supply Type" },
      { id: "DM-004", type: "Story",   title: "Service Mapping per device",                priority: "Medium",   status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 1", description: "CRUD for service name, HIMS code, price, validity dates, active flag" },
      { id: "DM-005", type: "Story",   title: "Document categories & file uploads",        priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "Configurable doc categories (PDF/DOC). Add/remove categories. Upload files per category." },
      { id: "DM-006", type: "Sub-task","title": "Depreciation fields (SLM/WDV)",          priority: "Medium",   status: "Done",        points: 3,  assignee: "Backend",   sprint: "Sprint 1", description: "Depreciation method, useful life, salvage value, rate, frequency — stored on device master, propagated to asset registration" },
      { id: "DM-007", type: "Sub-task","title": "API: Device CRUD endpoints",              priority: "High",     status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 2", description: "POST /devices, PUT /devices/:id, GET /devices, GET /devices/:id, DELETE /devices/:id" },
      { id: "DM-008", type: "Sub-task","title": "DB: devices, device_services tables",     priority: "High",     status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 2", description: "Create tables per schema: devices, device_services, device_doc_categories, device_doc_files" },
    ],
  },
  {
    name: "Asset Registration",
    color: "00838F",
    tasks: [
      { id: "AR-001", type: "Epic",    title: "Asset Registration Module",                 priority: "Critical", status: "In Progress", points: 0,  assignee: "Dev Team",  sprint: "Sprint 1", description: "Full lifecycle of biomedical asset — from device lookup to barcode/QR generation" },
      // Tab 1
      { id: "AR-002", type: "Story",   title: "Tab 1 — Generic Details",                   priority: "Critical", status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 1", description: "Fields: Device Name (lookup from Device Master, auto-fills model/type/manufacturer), Asset Code, Serial No, Asset Name, Asset Type, Manufacturer, Model, Generic Name, Country of Origin, Asset Category, Sub-Category, Risk Class, ECRI Code, Condition, Depreciation Method/Rate/Useful Life/Salvage Value, Department, Hospital" },
      // Tab 2
      { id: "AR-003", type: "Story",   title: "Tab 2 — Accessories",                        priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "Add/remove accessories linked to asset. Fields: Accessory Name, Part No, Quantity, Unit, Remarks" },
      // Tab 3
      { id: "AR-004", type: "Story",   title: "Tab 3 — Child Assets",                       priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "Link child assets (sub-components) to a parent asset. Searchable lookup + inline table" },
      // Tab 4
      { id: "AR-005", type: "Story",   title: "Tab 4 — S/W & Network",                      priority: "Low",      status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "OS, Software version, IP Address, MAC Address, Network type, Domain, Hostname" },
      // Tab 5
      { id: "AR-006", type: "Story",   title: "Tab 5 — Location",                           priority: "Critical", status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 1", description: "Hospital, Building, Floor, Ward/Room/Bed, Department, Location Type, GPS Coordinates. Location hierarchy dropdown cascade" },
      // Tab 6
      { id: "AR-007", type: "Story",   title: "Tab 6 — Asset Tracking",                     priority: "Low",      status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "Bluetooth/RFID tracking toggle. Tag ID, Reader ID, Last Seen timestamp" },
      // Tab 7
      { id: "AR-008", type: "Story",   title: "Tab 7 — Vendor Details",                     priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 1", description: "Vendor Name, Vendor Code, PO Number, PO Date, Purchase Price, Invoice No, Invoice Date, Warranty Start, Warranty End, Warranty Terms, Distributor details" },
      // Tab 8
      { id: "AR-009", type: "Story",   title: "Tab 8 — Installation Records",               priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 1", description: "Installation Date, Commissioning Date, Installed By, Engineer Name, FAT/SAT date, Installation Remarks, Acceptance Status" },
      // Tab 9
      { id: "AR-010", type: "Story",   title: "Tab 9 — Maintenance Schedule",               priority: "High",     status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 2", description: "Multiple schedule rows (PPM, IPM, Calibration etc). Per row: Enable toggle, Start Date, Frequency (nos in months), Next Due Date (auto-calculated), Assigned To (In-house/Vendor/Third Party)" },
      // Tab 10
      { id: "AR-011", type: "Story",   title: "Tab 10 — Contract",                          priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 2", description: "Link existing contracts to asset. Show Contract ID, Type, Vendor, Start/End dates, Status" },
      // Tab 11
      { id: "AR-012", type: "Story",   title: "Tab 11 — Documents",                         priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 2", description: "Configurable document categories. Upload files per category. Show file name, size, upload date." },
      // Tab 12
      { id: "AR-013", type: "Story",   title: "Tab 12 — Barcode / QR",                      priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 2", description: "Auto-generate barcode and QR code from Asset Code + Serial No. Preview, Download PNG/PDF, Print label" },
      { id: "AR-014", type: "Sub-task","title": "API: Asset CRUD + search endpoints",        priority: "High",     status: "To Do",       points: 8,  assignee: "Backend",   sprint: "Sprint 2", description: "POST/PUT/GET/DELETE /assets. Search by asset code, serial no, device name, department. Pagination + filters" },
      { id: "AR-015", type: "Sub-task","title": "DB: assets + 12 related tables",            priority: "High",     status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 2", description: "All schema tables: assets, asset_accessories, asset_child_links, asset_sw_network, asset_locations, asset_tracking, asset_vendor_details, asset_installation_records, asset_maintenance_schedules, asset_contracts, asset_doc_categories, asset_doc_files" },
      { id: "AR-016", type: "Sub-task","title": "Asset ID auto-generation (BME-XXX-NNN)",    priority: "Medium",   status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 2", description: "Auto-increment asset code per category prefix. Format: BME-{CATEGORY}-{NNN}" },
      { id: "AR-017", type: "Sub-task","title": "Device master auto-populate on selection",  priority: "High",     status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "When user picks a device from Device Master dropdown, Generic/Manufacturer/Type/Depreciation fields pre-fill" },
    ],
  },
  {
    name: "Store Master",
    color: "6A1B9A",
    tasks: [
      { id: "SM-001", type: "Epic",    title: "Biomedical Store Master",                    priority: "High",     status: "Done",        points: 0,  assignee: "Dev Team",  sprint: "Sprint 1", description: "Configure biomedical stores per hospital. Controls stock source behavior (Direct Purchase vs ERP Transfer)" },
      { id: "SM-002", type: "Story",   title: "Store list with search & filter",            priority: "High",     status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "Columns: Store ID, Hospital, Store Name, Stock Source, Contact Person, Location, Default flag, Status, Actions" },
      { id: "SM-003", type: "Story",   title: "Create / Edit Store form",                   priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 1", description: "Fields: Hospital/Clinic*, Store Name*, Stock Source* (Direct Purchase / External ERP / Both), Contact Person, Location, Default Store toggle, Status (Active/Inactive), Remarks" },
      { id: "SM-004", type: "Story",   title: "Stock Source logic enforcement",             priority: "High",     status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 1", description: "Direct Purchase: GRN with invoice. External ERP: GRN via CSV upload, no invoice. Both: supports either mode" },
      { id: "SM-005", type: "Sub-task","title": "API: Store CRUD endpoints",                priority: "High",     status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 2", description: "POST/PUT/GET/DELETE /stores. One default store per hospital validation." },
      { id: "SM-006", type: "Sub-task","title": "DB: biomedical_stores table",              priority: "High",     status: "To Do",       points: 2,  assignee: "Backend",   sprint: "Sprint 2", description: "Columns: id, hospital_id, store_name, stock_source (enum), contact_person, location, is_default, status, remarks, created_at, updated_at" },
    ],
  },
  {
    name: "Item Master",
    color: "E65100",
    tasks: [
      { id: "IM-001", type: "Epic",    title: "Item Master Module",                         priority: "High",     status: "In Progress", points: 0,  assignee: "Dev Team",  sprint: "Sprint 2", description: "Catalog of all spares, consumables and accessories used across biomedical stores" },
      { id: "IM-002", type: "Story",   title: "Item list with stats & filters",             priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 2", description: "Stats: Total Items, Spares, Consumables, Accessories. Columns: Item Code, Item Name, Type badge, Device(s), Manufacturer, UOM, Unit Price, Batch/Expiry/Serial flags, Status. Filter by category/status." },
      { id: "IM-003", type: "Story",   title: "Create / Edit Item form — Basic Info",       priority: "High",     status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 2", description: "Fields: Hospital*, Department*, Item Type* (Spare/Consumable/Accessory), Item Name*, Part Number, Device(s) (multi-select), Description, Item Code (auto), Catalogue Number, Manufacturer, Stock UOM*, Purchase UOM*" },
      { id: "IM-004", type: "Story",   title: "Tracking flags (Batch / Expiry / Serial)",   priority: "High",     status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 2", description: "Toggle: Batch Required, Expiry Required, Serial Tracking. These flags control what is captured at GRN time" },
      { id: "IM-005", type: "Story",   title: "Store Configuration per item",               priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 2", description: "Per store: Min Qty, Max Qty, Reorder Qty, Unit Price. Add/Edit/Remove store configurations inline." },
      { id: "IM-006", type: "Sub-task","title": "API: Item CRUD endpoints",                 priority: "High",     status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 3", description: "POST/PUT/GET/DELETE /items. Include store_configs as nested array." },
      { id: "IM-007", type: "Sub-task","title": "DB: items, item_store_configs tables",     priority: "High",     status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 3", description: "Tables: items (all catalog fields), item_store_configs (item_id, store_id, min_qty, max_qty, reorder_qty, unit_price)" },
      { id: "IM-008", type: "Sub-task","title": "Item Code auto-generation",                priority: "Medium",   status: "To Do",       points: 2,  assignee: "Backend",   sprint: "Sprint 3", description: "Sequential: ITM-{TYPE_PREFIX}-{NNN}. e.g. ITM-SPR-001 for Spare" },
    ],
  },
  {
    name: "Item GRN",
    color: "558B2F",
    tasks: [
      { id: "GR-001", type: "Epic",    title: "Goods Receipt Note (GRN)",                   priority: "High",     status: "In Progress", points: 0,  assignee: "Dev Team",  sprint: "Sprint 3", description: "Receive items into biomedical store via Direct Purchase invoice or ERP Transfer CSV" },
      { id: "GR-002", type: "Story",   title: "GRN list with stats & actions",              priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 3", description: "Stats: Total GRNs, Posted, Direct Purchase, ERP Transfer. Columns: GRN No, Date, Hospital, Source, Vendor/Ref, Invoice No, Lines, Amount, Status. Filter by source/status/date." },
      { id: "GR-003", type: "Story",   title: "GRN Header — Direct Purchase mode",          priority: "High",     status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 3", description: "Fields: Hospital*, Store*, Inward Source*, GRN Date*, GRN No (auto), Vendor Name*, Invoice No, Invoice Date, Invoice Amount. Post / Save as Draft actions." },
      { id: "GR-004", type: "Story",   title: "GRN Header — ERP Transfer mode",             priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 3", description: "Fields: Hospital*, Store*, Inward Source*, GRN Date*, External Ref No, Transfer Date, Source ERP Store. CSV upload replaces manual lines." },
      { id: "GR-005", type: "Story",   title: "GRN Line Items — manual entry",              priority: "High",     status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 3", description: "Item lookup from Item Master. Columns: Item Name, Part No, Type, Qty, UOM, Unit Price, Total, Batch No (if required), Expiry Date (if required), Serial No (if required). Add/Remove rows." },
      { id: "GR-006", type: "Story",   title: "GRN Line Items — CSV/Excel bulk upload",     priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 3", description: "Upload CSV template. Parse rows, validate against Item Master, show matched/unmatched. Auto-create line items from matched rows." },
      { id: "GR-007", type: "Story",   title: "GRN Documents upload",                       priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 3", description: "Upload supporting docs (Invoice scan, DC, Challan). Configurable categories." },
      { id: "GR-008", type: "Story",   title: "Post GRN — stock increment",                 priority: "Critical", status: "To Do",       points: 8,  assignee: "Backend",   sprint: "Sprint 3", description: "On Post: update store_stock table (item_id + store_id → qty increment). GRN status → Posted. Prevent duplicate posting. Validate batch/expiry/serial flags per item." },
      { id: "GR-009", type: "Sub-task","title": "API: GRN CRUD + Post endpoint",            priority: "High",     status: "To Do",       points: 8,  assignee: "Backend",   sprint: "Sprint 3", description: "POST /grns, PUT /grns/:id, POST /grns/:id/post. Transactional — lines + stock update in single DB transaction." },
      { id: "GR-010", type: "Sub-task","title": "DB: grn_headers, grn_lines, store_stock",  priority: "High",     status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 3", description: "Tables: grn_headers, grn_lines (item_id, qty, unit_price, batch_no, expiry_date, serial_no), store_stock (store_id, item_id, qty_on_hand)" },
      { id: "GR-011", type: "Sub-task","title": "GRN No auto-generation",                   priority: "Medium",   status: "To Do",       points: 2,  assignee: "Backend",   sprint: "Sprint 3", description: "Format: GRN-{YYYY}-{NNN} per hospital per year. Reset counter each calendar year." },
    ],
  },
  {
    name: "Contract Management",
    color: "AD1457",
    tasks: [
      { id: "CM-001", type: "Epic",    title: "Contract Management Module",                 priority: "High",     status: "In Progress", points: 0,  assignee: "Dev Team",  sprint: "Sprint 4", description: "Manage AMC/CMC/Warranty contracts for biomedical equipment. Link assets, track renewals." },
      { id: "CM-002", type: "Story",   title: "Contract list with search & filters",        priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 4", description: "Columns: Contract No, Type, Vendor, Hospital, Start/End Date, Price, Assets count, Status. Filter by type/status/vendor/date range." },
      { id: "CM-003", type: "Story",   title: "Create Contract — header form",              priority: "High",     status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 4", description: "Fields: Contract Type* (AMC/CMC/Warranty/Service), Contract Number*, Start Date*, Period in Years*, End Date (auto-calc), Contract Price*, Hospital/Clinic*, Vendor*, Contract Owner, Description, Notes, Status toggle" },
      { id: "CM-004", type: "Story",   title: "Asset selection — Browse tab",               priority: "High",     status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 4", description: "Modal with 3 tabs. Browse tab: search by Asset ID/Name/Serial, filter by Category. Table shows Asset ID, Name, Serial No, Category, Dept, Last Contract End Date. Multi-select." },
      { id: "CM-005", type: "Story",   title: "Asset selection — Lookup by PO/Vendor/Contract tab", priority: "High", status: "Done",   points: 5,  assignee: "Frontend",  sprint: "Sprint 4", description: "Search by PO Number, Vendor, or Previous Contract ID. Each fires a lookup returning matched assets. 'Select All' shortcut. Table shows same columns as Browse tab." },
      { id: "CM-006", type: "Story",   title: "Asset selection — Upload codes/serial nos tab", priority: "Medium", status: "Done",       points: 3,  assignee: "Frontend",  sprint: "Sprint 4", description: "Paste/type Asset Codes or Serial Numbers. Match button validates against Asset Register. Shows green matched rows + red unmatched codes." },
      { id: "CM-007", type: "Story",   title: "Document upload per contract",               priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 4", description: "Upload contract docs, agreements, invoices. Drag-and-drop. Show file name, size, upload timestamp." },
      { id: "CM-008", type: "Story",   title: "Contract sidebar — selected assets panel",   priority: "High",     status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 4", description: "Sticky sidebar shows selected asset count. Each card: Asset Code (ID), Device Name, Serial No, Category, Dept, Last Contract End Date in amber. Remove button." },
      { id: "CM-009", type: "Sub-task","title": "API: Contract CRUD endpoints",             priority: "High",     status: "To Do",       points: 8,  assignee: "Backend",   sprint: "Sprint 4", description: "POST/PUT/GET/DELETE /contracts. Include contract_assets (asset_id array) as nested relation." },
      { id: "CM-010", type: "Sub-task","title": "DB: contracts, contract_assets tables",    priority: "High",     status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 4", description: "Tables: contracts (header fields), contract_assets (contract_id, asset_id, added_at)" },
      { id: "CM-011", type: "Sub-task","title": "Contract renewal notification logic",      priority: "Medium",   status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 5", description: "30/60/90 day pre-expiry alerts. Email/in-app notification to Contract Owner and Admin." },
      { id: "CM-012", type: "Sub-task","title": "Last Contract End Date on assets",         priority: "Medium",   status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 4", description: "Derived field: latest contract end_date where asset is included. Used in Asset picker modal and asset list views." },
    ],
  },
  {
    name: "Ticket Generation",
    color: "BF360C",
    tasks: [
      { id: "TK-001", type: "Epic",    title: "Maintenance Ticket Generation",              priority: "Critical", status: "In Progress", points: 0,  assignee: "Dev Team",  sprint: "Sprint 2", description: "Allow end-users and BME team to raise maintenance/breakdown/PPM tickets against registered assets" },
      { id: "TK-002", type: "Story",   title: "Ticket registration form",                   priority: "Critical", status: "Done",        points: 8,  assignee: "Frontend",  sprint: "Sprint 2", description: "Fields: Asset ID* (lookup), Serial No* (auto-fill), Device Name* (auto-fill), Device Model (auto-fill), Device Type (auto-fill), Department* (auto-fill), Hospital* (auto-fill), Request Type* (Generic/PPM/Calibration/Breakdown/Installation), Priority* (Low/Medium/High/Critical), Root Problem*, Asset Status* (Working/Not Working/Partially Working), Problem Description*, Remarks" },
      { id: "TK-003", type: "Story",   title: "Asset lookup & auto-populate",               priority: "Critical", status: "Done",        points: 5,  assignee: "Frontend",  sprint: "Sprint 2", description: "Select Asset ID from dropdown → auto-fill: Serial No, Device Name, Model, Type, Department, Hospital from Asset Register" },
      { id: "TK-004", type: "Story",   title: "Issue image capture",                        priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 2", description: "Upload/capture image of the fault. Preview thumbnail. Remove option. Stored with ticket." },
      { id: "TK-005", type: "Story",   title: "Supporting document upload",                 priority: "Medium",   status: "Done",        points: 3,  assignee: "Frontend",  sprint: "Sprint 2", description: "Configurable document categories (Error Log, Photo, Report etc). Upload files per category. Custom category creation." },
      { id: "TK-006", type: "Story",   title: "Ticket number auto-generation",              priority: "High",     status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 2", description: "Format: TKT-{YYYY}-{NNN}. Sequential per year per hospital." },
      { id: "TK-007", type: "Story",   title: "Ticket status workflow",                     priority: "High",     status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 3", description: "Statuses: Open → Assigned → In Progress → Pending Parts → Resolved → Closed. Status transitions with timestamp log." },
      { id: "TK-008", type: "Story",   title: "SLA tracking per priority",                  priority: "High",     status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 3", description: "Configurable SLA hours per priority. Track response time and resolution time. Breach alerts." },
      { id: "TK-009", type: "Sub-task","title": "API: Ticket CRUD + status transition",     priority: "High",     status: "To Do",       points: 8,  assignee: "Backend",   sprint: "Sprint 2", description: "POST /tickets, PUT /tickets/:id, GET /tickets, POST /tickets/:id/assign, POST /tickets/:id/resolve" },
      { id: "TK-010", type: "Sub-task","title": "DB: tickets, ticket_docs tables",          priority: "High",     status: "To Do",       points: 3,  assignee: "Backend",   sprint: "Sprint 2", description: "Tables: tickets (all header fields + status + timestamps), ticket_documents (ticket_id, category, file_url)" },
      { id: "TK-011", type: "Sub-task","title": "Ticket allocation rules integration",      priority: "Medium",   status: "To Do",       points: 5,  assignee: "Backend",   sprint: "Sprint 3", description: "On ticket creation, evaluate allocation rules (department/device type/priority) to auto-assign technician" },
    ],
  },
];

// ─────────────────────────────────────────────
// COLOURS & STYLES
// ─────────────────────────────────────────────
const STATUS_FILL = {
  "Done":        "C8E6C9",
  "In Progress": "FFF9C4",
  "To Do":       "F5F5F5",
  "Blocked":     "FFCDD2",
};
const PRIORITY_FILL = {
  "Critical":    "FFCDD2",
  "High":        "FFE0B2",
  "Medium":      "E3F2FD",
  "Low":         "F3E5F5",
};
const TYPE_FILL = {
  "Epic":     "7B1FA2",
  "Story":    "1565C0",
  "Sub-task": "37474F",
};
const HEADER_BG  = "263238";
const HEADER_FG  = "FFFFFF";

function cell(v, fill, bold = false, fgColor = "000000", sz = 10, italic = false) {
  return {
    v,
    t: "s",
    s: {
      font:      { bold, sz, italic, color: { rgb: fgColor } },
      fill:      fill ? { patternType: "solid", fgColor: { rgb: fill } } : undefined,
      alignment: { vertical: "center", wrapText: true },
      border: {
        top:    { style: "thin", color: { rgb: "BDBDBD" } },
        bottom: { style: "thin", color: { rgb: "BDBDBD" } },
        left:   { style: "thin", color: { rgb: "BDBDBD" } },
        right:  { style: "thin", color: { rgb: "BDBDBD" } },
      },
    },
  };
}

function hdrCell(v) {
  return cell(v, HEADER_BG, true, HEADER_FG, 10);
}

// ─────────────────────────────────────────────
// BUILD WORKBOOK
// ─────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// ── SHEET 1: SUMMARY ──────────────────────────
const summaryRows = [
  [
    cell("CMMS — Project Task Document", "1565C0", true, "FFFFFF", 14),
    cell("", "1565C0"), cell("", "1565C0"), cell("", "1565C0"),
    cell("", "1565C0"), cell("", "1565C0"), cell("", "1565C0"),
  ],
  [
    cell("Module", HEADER_BG, true, HEADER_FG),
    cell("Total Tasks", HEADER_BG, true, HEADER_FG),
    cell("Story Points", HEADER_BG, true, HEADER_FG),
    cell("Done", HEADER_BG, true, HEADER_FG),
    cell("In Progress", HEADER_BG, true, HEADER_FG),
    cell("To Do", HEADER_BG, true, HEADER_FG),
    cell("% Complete", HEADER_BG, true, HEADER_FG),
  ],
];

let grandTotal = 0, grandPoints = 0, grandDone = 0;
for (const mod of modules) {
  const tasks     = mod.tasks.filter(t => t.type !== "Epic");
  const total     = tasks.length;
  const points    = tasks.reduce((s, t) => s + t.points, 0);
  const done      = tasks.filter(t => t.status === "Done").length;
  const inProg    = tasks.filter(t => t.status === "In Progress").length;
  const todo      = tasks.filter(t => t.status === "To Do").length;
  const pct       = total > 0 ? Math.round((done / total) * 100) + "%" : "0%";
  grandTotal  += total;
  grandPoints += points;
  grandDone   += done;
  summaryRows.push([
    cell(mod.name,     mod.color, true, "FFFFFF"),
    cell(String(total),  "F5F5F5"),
    cell(String(points), "F5F5F5"),
    cell(String(done),   STATUS_FILL["Done"]),
    cell(String(inProg), STATUS_FILL["In Progress"]),
    cell(String(todo),   STATUS_FILL["To Do"]),
    cell(pct,            "E8F5E9", true),
  ]);
}
summaryRows.push([
  cell("GRAND TOTAL", HEADER_BG, true, HEADER_FG),
  cell(String(grandTotal),  "E3F2FD", true),
  cell(String(grandPoints), "E3F2FD", true),
  cell(String(grandDone),   STATUS_FILL["Done"], true),
  cell("", "F5F5F5"),
  cell("", "F5F5F5"),
  cell(Math.round((grandDone / grandTotal) * 100) + "%", "C8E6C9", true),
]);

const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows.map(r => r.map(c => c.v)));
// Apply styles
summaryRows.forEach((row, r) => {
  row.forEach((cellObj, c) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    summaryWs[ref] = cellObj;
  });
});
summaryWs["!cols"] = [{ wch: 26 }, { wch: 13 }, { wch: 14 }, { wch: 8 }, { wch: 13 }, { wch: 8 }, { wch: 12 }];
summaryWs["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

// ── SHEET 2: ALL TASKS (master) ───────────────
const COLS = ["Task ID", "Module", "Type", "Title", "Priority", "Status", "Story Points", "Assignee", "Sprint", "Description / Acceptance Criteria"];
const allTaskRows = [COLS.map(hdrCell)];

for (const mod of modules) {
  for (const t of mod.tasks) {
    allTaskRows.push([
      cell(t.id,          t.type === "Epic" ? mod.color : null, t.type === "Epic", t.type === "Epic" ? "FFFFFF" : "000000"),
      cell(mod.name,      null),
      cell(t.type,        TYPE_FILL[t.type] ?? null, true, "FFFFFF"),
      cell(t.title,       t.type === "Epic" ? "E3F2FD" : null, t.type === "Epic"),
      cell(t.priority,    PRIORITY_FILL[t.priority] ?? null, false, "000000"),
      cell(t.status,      STATUS_FILL[t.status] ?? null),
      cell(t.points > 0 ? String(t.points) : "-", null),
      cell(t.assignee,    null),
      cell(t.sprint,      null),
      cell(t.description, null, false, "444444", 9, false),
    ]);
  }
}

const allWs = XLSX.utils.aoa_to_sheet(allTaskRows.map(r => r.map(c => c.v)));
allTaskRows.forEach((row, r) => {
  row.forEach((cellObj, c) => {
    const ref = XLSX.utils.encode_cell({ r, c });
    allWs[ref] = cellObj;
  });
});
allWs["!cols"] = [{ wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 46 }, { wch: 11 }, { wch: 14 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 70 }];
XLSX.utils.book_append_sheet(wb, allWs, "All Tasks");

// ── SHEETS 3–9: ONE PER MODULE ────────────────
for (const mod of modules) {
  const rows = [
    // Title row
    [
      cell(mod.name + " — Task List", mod.color, true, "FFFFFF", 12),
      ...Array(9).fill(cell("", mod.color)),
    ],
    COLS.map(hdrCell),
  ];
  for (const t of mod.tasks) {
    rows.push([
      cell(t.id,          t.type === "Epic" ? mod.color : null, t.type === "Epic", t.type === "Epic" ? "FFFFFF" : "000000"),
      cell(mod.name,      null),
      cell(t.type,        TYPE_FILL[t.type] ?? null, true, "FFFFFF"),
      cell(t.title,       t.type === "Epic" ? "EDE7F6" : null, t.type === "Epic"),
      cell(t.priority,    PRIORITY_FILL[t.priority] ?? null),
      cell(t.status,      STATUS_FILL[t.status] ?? null),
      cell(t.points > 0 ? String(t.points) : "-", null),
      cell(t.assignee,    null),
      cell(t.sprint,      null),
      cell(t.description, null, false, "444444", 9),
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows.map(r => r.map(c => c.v)));
  rows.forEach((row, r) => {
    row.forEach((cellObj, c) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      ws[ref] = cellObj;
    });
  });
  ws["!cols"] = [{ wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 46 }, { wch: 11 }, { wch: 14 }, { wch: 13 }, { wch: 13 }, { wch: 10 }, { wch: 70 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

  const safeSheetName = mod.name.replace(/[:/\\?*[\]]/g, "").slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
}

// ─────────────────────────────────────────────
// WRITE FILE
// ─────────────────────────────────────────────
const outPath = resolve(__dirname, "../public/CMMS-Task-Document.xlsx");
const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer", cellStyles: true });
writeFileSync(outPath, buf);
console.log("Excel task document written to:", outPath);
