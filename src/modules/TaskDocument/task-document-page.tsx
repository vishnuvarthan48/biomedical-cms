"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card } from "@/src/components/ui/card";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  ClipboardList,
  Monitor,
  Ticket,
  Warehouse,
  Package,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = "Critical" | "High" | "Medium" | "Low";
type Status = "Done" | "In Progress" | "To Do" | "Blocked";
type TaskType = "Epic" | "Story" | "Task" | "Sub-task";

interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  storyPoints?: number;
  acceptanceCriteria?: string[];
  children?: Task[];
}

interface Module {
  id: string;
  key: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  tasks: Task[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  Critical: { label: "Critical", className: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30" },
  High:     { label: "High",     className: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30" },
  Medium:   { label: "Medium",   className: "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30" },
  Low:      { label: "Low",      className: "bg-muted text-muted-foreground border-border" },
};

const statusConfig: Record<Status, { label: string; className: string; icon: React.ElementType }> = {
  "Done":        { label: "Done",        className: "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30", icon: CheckCircle2 },
  "In Progress": { label: "In Progress", className: "bg-[#00BCD4]/10 text-[#00BCD4] border-[#00BCD4]/30", icon: Clock },
  "To Do":       { label: "To Do",       className: "bg-muted text-muted-foreground border-border",        icon: Circle },
  "Blocked":     { label: "Blocked",     className: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30", icon: AlertCircle },
};

const typeConfig: Record<TaskType, { className: string; short: string }> = {
  Epic:      { className: "bg-[#8B5CF6]/20 text-[#8B5CF6]", short: "E" },
  Story:     { className: "bg-[#3B82F6]/20 text-[#3B82F6]", short: "S" },
  Task:      { className: "bg-[#10B981]/20 text-[#10B981]", short: "T" },
  "Sub-task":{ className: "bg-[#F59E0B]/20 text-[#F59E0B]", short: "↳" },
};

// ─── Task Data ────────────────────────────────────────────────────────────────

const modules: Module[] = [
  // ═══ ASSET REGISTRATION ═══════════════════════════════════════════════════
  {
    id: "asset-registration",
    key: "AR",
    title: "Asset Registration",
    icon: Monitor,
    color: "#00BCD4",
    description: "Biomedical equipment registration with 12-tab data capture covering device information, location, vendor, maintenance scheduling, contracts and documentation.",
    tasks: [
      {
        id: "AR-001", type: "Epic", title: "Asset Registration Module", priority: "Critical", status: "In Progress", storyPoints: 89,
        description: "Complete end-to-end asset registration workflow for biomedical equipment across all hospital units.",
        children: [
          {
            id: "AR-002", type: "Story", title: "Generic Tab — Device & Purchase Details", priority: "Critical", status: "Done", storyPoints: 13,
            description: "Capture core device identity, purchase details, depreciation, and financial metadata.",
            acceptanceCriteria: [
              "Device name auto-populated from Device Master on selection",
              "Asset ID auto-generated using voucher series",
              "Purchase date, cost, currency captured",
              "Depreciation method (SLM/WDV) and useful life configured",
              "Country of origin, manufacturer, model number fields validated",
            ],
            children: [
              { id: "AR-002a", type: "Sub-task", title: "Device name dropdown from Device Master", priority: "Critical", status: "Done", storyPoints: 2, description: "Fetch registered devices and auto-fill generic fields on selection." },
              { id: "AR-002b", type: "Sub-task", title: "Auto-generate Asset ID via voucher series", priority: "Critical", status: "Done", storyPoints: 3, description: "Integrate with voucher series config to generate unique IDs." },
              { id: "AR-002c", type: "Sub-task", title: "Depreciation calculation logic (SLM / WDV)", priority: "High", status: "Done", storyPoints: 5, description: "Implement depreciation computation on form submission." },
              { id: "AR-002d", type: "Sub-task", title: "Purchase cost with multi-currency support", priority: "Medium", status: "Done", storyPoints: 3, description: "Support INR, USD, EUR; store converted INR value." },
            ],
          },
          {
            id: "AR-003", type: "Story", title: "Accessories Tab — Linked Accessories", priority: "Medium", status: "Done", storyPoints: 8,
            description: "Register accessories attached to the parent asset with individual serial numbers and condition tracking.",
            acceptanceCriteria: [
              "Add multiple accessories with name, serial no, condition",
              "Each accessory has its own status (Active/Inactive)",
              "Accessories linked to parent asset in DB",
            ],
            children: [
              { id: "AR-003a", type: "Sub-task", title: "Accessory list add/remove UI", priority: "Medium", status: "Done", storyPoints: 3, description: "Dynamic table for adding/removing accessories." },
              { id: "AR-003b", type: "Sub-task", title: "Accessory serial no uniqueness validation", priority: "Medium", status: "Done", storyPoints: 2, description: "Validate no duplicate serial numbers within accessory list." },
            ],
          },
          {
            id: "AR-004", type: "Story", title: "Child Assets Tab — Sub-asset Linkage", priority: "Medium", status: "Done", storyPoints: 5,
            description: "Link child assets (e.g. probe, transducer) to parent asset with depreciation inheritance.",
            acceptanceCriteria: [
              "Search and link existing registered assets as children",
              "Child asset depreciation schedule inherited or overridden",
            ],
          },
          {
            id: "AR-005", type: "Story", title: "S/W & Network Tab — Software & Connectivity", priority: "Medium", status: "Done", storyPoints: 8,
            description: "Capture software version, OS, IP address, MAC address, and VLAN information for networked devices.",
            acceptanceCriteria: [
              "OS type, version, patch date captured",
              "IP, MAC, VLAN, hostname fields with format validation",
              "Software license expiry date with alert configuration",
            ],
          },
          {
            id: "AR-006", type: "Story", title: "Location Tab — Physical Placement", priority: "Critical", status: "Done", storyPoints: 8,
            description: "Record exact physical location of the asset: hospital, building, floor, department, room.",
            acceptanceCriteria: [
              "Hospital → Building → Floor → Department → Room cascade dropdowns",
              "GPS coordinates optional capture",
              "Location change creates audit history",
            ],
            children: [
              { id: "AR-006a", type: "Sub-task", title: "Cascade location dropdown (Hospital → Room)", priority: "Critical", status: "Done", storyPoints: 5, description: "Each selection filters next level dropdown." },
              { id: "AR-006b", type: "Sub-task", title: "Location change audit trail", priority: "High", status: "To Do", storyPoints: 3, description: "Log every location change with user and timestamp." },
            ],
          },
          {
            id: "AR-007", type: "Story", title: "Asset Tracking Tab — BLE / RFID", priority: "Low", status: "To Do", storyPoints: 5,
            description: "Configure BLE beacon or RFID tag for real-time asset tracking.",
            acceptanceCriteria: [
              "BLE tag ID and beacon UUID captured",
              "RFID tag number and reader zone mapped",
              "Last detected location updated on beacon ping",
            ],
          },
          {
            id: "AR-008", type: "Story", title: "Vendor Tab — Supplier & Warranty", priority: "Critical", status: "Done", storyPoints: 10,
            description: "Capture vendor details, purchase order reference, warranty period and AMC/CMC contract linkage.",
            acceptanceCriteria: [
              "Vendor name from Vendor Master with auto-fill",
              "PO number, invoice number, delivery note captured",
              "Warranty start/end date with expiry alerts",
              "AMC/CMC coverage dates and vendor contact",
            ],
            children: [
              { id: "AR-008a", type: "Sub-task", title: "Vendor Master integration", priority: "Critical", status: "Done", storyPoints: 3, description: "Auto-populate vendor details from Vendor Master." },
              { id: "AR-008b", type: "Sub-task", title: "Warranty expiry notification setup", priority: "High", status: "To Do", storyPoints: 5, description: "Trigger alert 30/60/90 days before warranty end." },
            ],
          },
          {
            id: "AR-009", type: "Story", title: "Installation Records Tab", priority: "High", status: "Done", storyPoints: 8,
            description: "Record commissioning, installation engineer, site acceptance test (SAT) and training details.",
            acceptanceCriteria: [
              "Installation date, engineer name, commissioning certificate",
              "SAT checklist with pass/fail items",
              "Training conducted flag with attendee list",
            ],
          },
          {
            id: "AR-010", type: "Story", title: "Maintenance Tab — PM Schedule", priority: "High", status: "In Progress", storyPoints: 13,
            description: "Configure Preventive Maintenance (PM) schedule per maintenance type with frequency in months.",
            acceptanceCriteria: [
              "Internal PM, External PM, Calibration, Electrical Safety types",
              "Frequency captured as integer (nos in months)",
              "Next due date auto-calculated = start date + frequency months",
              "Assigned to: In-House / Vendor / Third Party",
              "PM schedule enabled/disabled per type",
            ],
            children: [
              { id: "AR-010a", type: "Sub-task", title: "Frequency input as nos (months) with auto next-due calc", priority: "High", status: "Done", storyPoints: 5, description: "Replace dropdown with number input; compute next due date via useMemo." },
              { id: "AR-010b", type: "Sub-task", title: "PM schedule to work order integration", priority: "High", status: "To Do", storyPoints: 8, description: "Auto-create PM work orders on due date." },
            ],
          },
          {
            id: "AR-011", type: "Story", title: "Contract Tab — AMC / CMC Linkage", priority: "Medium", status: "To Do", storyPoints: 5,
            description: "Link asset to active AMC/CMC contract with coverage period visibility.",
            acceptanceCriteria: [
              "Contract ID lookup from Contract Management module",
              "Coverage type (Full, Parts Only, Labour Only) displayed",
              "Contract end date proximity alert",
            ],
          },
          {
            id: "AR-012", type: "Story", title: "Documents Tab — File Attachments", priority: "Medium", status: "Done", storyPoints: 5,
            description: "Upload and categorize asset documents (manuals, certificates, invoices).",
            acceptanceCriteria: [
              "Document categories: Manual, Certificate, PO, Invoice, Delivery Note",
              "Max file size 20 MB; accepted formats PDF, DOC, JPG, PNG",
              "Documents listed with upload date and uploader name",
            ],
          },
          {
            id: "AR-013", type: "Story", title: "Barcode / QR Tab — Label Generation", priority: "High", status: "Done", storyPoints: 8,
            description: "Generate and print asset barcode / QR code labels for physical tagging.",
            acceptanceCriteria: [
              "QR code encodes asset ID, serial no, device name",
              "Barcode (Code128) generated for scanner compatibility",
              "Print-ready label with hospital logo and asset details",
              "Bulk print for multi-asset selection",
            ],
          },
          {
            id: "AR-014", type: "Story", title: "Asset Registration List Screen", priority: "Critical", status: "Done", storyPoints: 8,
            description: "Master list view of all registered assets with search, filter, and export.",
            acceptanceCriteria: [
              "Columns: Asset ID, Device Name, Model, Serial No, Department, Status, Warranty End",
              "Filter by department, category, status, hospital",
              "Export to Excel / PDF",
              "Row click → view/edit asset",
            ],
          },
        ],
      },
    ],
  },

  // ═══ TICKET GENERATION ════════════════════════════════════════════════════
  {
    id: "ticket-generation",
    key: "TG",
    title: "Ticket Generation",
    icon: Ticket,
    color: "#F59E0B",
    description: "Fault reporting and ticket lifecycle management for biomedical equipment breakdown, PPM and calibration requests.",
    tasks: [
      {
        id: "TG-001", type: "Epic", title: "Ticket Generation Module", priority: "Critical", status: "In Progress", storyPoints: 55,
        description: "End-to-end ticket creation, assignment, and closure workflow.",
        children: [
          {
            id: "TG-002", type: "Story", title: "Ticket Registration Form", priority: "Critical", status: "Done", storyPoints: 13,
            description: "Capture fault details, select asset, set priority and attach evidence documents.",
            acceptanceCriteria: [
              "Asset selection by Asset ID, serial number or scan",
              "Auto-populate device name, model, department, hospital on asset select",
              "Request types: Generic, PPM, Calibration, Electrical Safety",
              "Priority: Low, Medium, High, Critical",
              "Problem description with root cause categorisation",
              "Issue image/document attachment (max 5 files)",
              "Ticket number auto-generated via voucher series",
            ],
            children: [
              { id: "TG-002a", type: "Sub-task", title: "Asset lookup with auto-fill on select", priority: "Critical", status: "Done", storyPoints: 3, description: "Search by Asset ID or serial; fill device fields." },
              { id: "TG-002b", type: "Sub-task", title: "Ticket number voucher series integration", priority: "Critical", status: "Done", storyPoints: 2, description: "Generate unique ticket number per hospital." },
              { id: "TG-002c", type: "Sub-task", title: "Issue image upload and preview", priority: "High", status: "Done", storyPoints: 3, description: "Allow up to 5 images with in-form preview." },
              { id: "TG-002d", type: "Sub-task", title: "Root cause and problem category dropdowns", priority: "Medium", status: "Done", storyPoints: 2, description: "Configurable category list from admin settings." },
            ],
          },
          {
            id: "TG-003", type: "Story", title: "Ticket Allocation Rules Engine", priority: "Critical", status: "In Progress", storyPoints: 13,
            description: "Auto-assign tickets to engineers based on configurable condition-action rules.",
            acceptanceCriteria: [
              "Rule conditions: Department, Device Category, Priority, Hospital, Shift",
              "Rule actions: Assign to engineer, Set SLA override, Set priority override",
              "Rules evaluated in priority order",
              "Manual override allowed post auto-assignment",
              "Rule enable/disable toggle",
            ],
            children: [
              { id: "TG-003a", type: "Sub-task", title: "Rule builder UI with condition/action blocks", priority: "Critical", status: "Done", storyPoints: 8, description: "Dynamic add/remove condition rows with operator selection." },
              { id: "TG-003b", type: "Sub-task", title: "Rule evaluation engine on ticket submit", priority: "Critical", status: "To Do", storyPoints: 5, description: "Server-side rule matching on ticket create." },
            ],
          },
          {
            id: "TG-004", type: "Story", title: "Ticket List & Dashboard", priority: "High", status: "To Do", storyPoints: 8,
            description: "Consolidated ticket view with status, SLA countdown, and engineer assignment.",
            acceptanceCriteria: [
              "Columns: Ticket No, Asset ID, Device, Department, Priority, Status, Assigned To, Created, SLA Due",
              "Filter by status, priority, department, date range",
              "SLA breach highlighted in red",
              "Quick status update from list row",
            ],
          },
          {
            id: "TG-005", type: "Story", title: "Ticket Closure & Feedback", priority: "High", status: "To Do", storyPoints: 8,
            description: "Record resolution details, parts used, labour time and capture requester sign-off.",
            acceptanceCriteria: [
              "Resolution description mandatory on close",
              "Parts consumed linked to Store Issue Voucher",
              "Labour hours captured per engineer",
              "Requester digital sign-off or OTP confirmation",
              "Closure triggers asset status update",
            ],
          },
          {
            id: "TG-006", type: "Story", title: "SLA Configuration", priority: "Medium", status: "To Do", storyPoints: 5,
            description: "Define response and resolution SLAs per priority level and asset category.",
            acceptanceCriteria: [
              "SLA matrix: Priority × Category → Response time, Resolution time",
              "Business hours vs calendar hours toggle",
              "Escalation rules on SLA breach",
            ],
          },
          {
            id: "TG-007", type: "Story", title: "Mobile Ticket View", priority: "Low", status: "To Do", storyPoints: 8,
            description: "Mobile-optimised ticket submission and status view for ward staff.",
            acceptanceCriteria: [
              "Responsive layout for mobile screen sizes",
              "QR scan to pre-fill asset details",
              "Simplified form with required fields only",
            ],
          },
        ],
      },
    ],
  },

  // ═══ STORE MASTER ═════════════════════════════════════════════════════════
  {
    id: "store-master",
    key: "SM",
    title: "Biomedical Store Master",
    icon: Warehouse,
    color: "#10B981",
    description: "Configuration and management of biomedical spare parts stores across hospital units, including stock source, shelf-life defaults and reorder policies.",
    tasks: [
      {
        id: "SM-001", type: "Epic", title: "Biomedical Store Master Module", priority: "High", status: "In Progress", storyPoints: 34,
        description: "Define and manage stores that hold biomedical spares, consumables and accessories.",
        children: [
          {
            id: "SM-002", type: "Story", title: "Store Create / Edit Form", priority: "Critical", status: "Done", storyPoints: 8,
            description: "Create and configure a biomedical store with hospital mapping and stock source settings.",
            acceptanceCriteria: [
              "Fields: Store Name, Hospital (multi-tenant), Location, Contact Person",
              "Stock Source: Direct Purchase / External ERP / Both",
              "Default Shelf Life (months) configurable at store level",
              "Max. Stores per Hospital configurable",
              "Default store flag (one per hospital)",
              "Active / Inactive status toggle",
            ],
            children: [
              { id: "SM-002a", type: "Sub-task", title: "Hospital multi-tenant dropdown", priority: "Critical", status: "Done", storyPoints: 2, description: "Scoped to logged-in user's tenant/org." },
              { id: "SM-002b", type: "Sub-task", title: "Stock source toggle with ERP config fields", priority: "High", status: "Done", storyPoints: 3, description: "Show ERP endpoint fields when External ERP or Both selected." },
              { id: "SM-002c", type: "Sub-task", title: "Default store per hospital enforcement", priority: "High", status: "Done", storyPoints: 2, description: "Auto-unset previous default on new default set." },
              { id: "SM-002d", type: "Sub-task", title: "Shelf life default propagation to Item Master", priority: "Medium", status: "To Do", storyPoints: 3, description: "New items inherit store shelf life if not overridden." },
            ],
          },
          {
            id: "SM-003", type: "Story", title: "Store List Screen", priority: "High", status: "Done", storyPoints: 5,
            description: "List all stores with status, hospital, contact and quick actions.",
            acceptanceCriteria: [
              "Columns: Store ID, Store Name, Hospital, Stock Source, Contact, Status, Default",
              "Filter by hospital and status",
              "Activate / Deactivate from action menu",
              "Export to Excel",
            ],
          },
          {
            id: "SM-004", type: "Story", title: "Store Item Configuration (store_item_config)", priority: "High", status: "In Progress", storyPoints: 8,
            description: "Map items to stores with store-specific reorder levels, rack/bin locations and lead times.",
            acceptanceCriteria: [
              "Item linked to one or more stores",
              "Per-store: Rack No, Shelf No, Bin Location",
              "Per-store: Reorder Level, Min Order Qty, Reorder Lead Time (days)",
              "Active / Inactive toggle per store-item mapping",
            ],
          },
          {
            id: "SM-005", type: "Story", title: "Store Transfer — Inter-Store Stock Move", priority: "Medium", status: "To Do", storyPoints: 8,
            description: "Transfer stock between stores in the same hospital with full traceability.",
            acceptanceCriteria: [
              "Source store → Destination store selection",
              "Item + quantity + batch selection",
              "Transfer voucher generated with unique number",
              "Stock decremented from source, incremented at destination",
              "Transfer requires approval if configured",
            ],
          },
          {
            id: "SM-006", type: "Story", title: "Stock Visibility Dashboard", priority: "Low", status: "To Do", storyPoints: 5,
            description: "Real-time stock level view across all stores for a hospital with reorder alerts.",
            acceptanceCriteria: [
              "Item-wise current stock per store",
              "Reorder level breach highlighted",
              "Export stock snapshot to Excel",
            ],
          },
        ],
      },
    ],
  },

  // ═══ ITEM MASTER ══════════════════════════════════════════════════════════
  {
    id: "item-master",
    key: "IM",
    title: "Item Master",
    icon: Package,
    color: "#8B5CF6",
    description: "Centralised catalogue of biomedical spares, consumables and accessories with batch/serial tracking configuration.",
    tasks: [
      {
        id: "IM-001", type: "Epic", title: "Item Master Module", priority: "High", status: "In Progress", storyPoints: 40,
        description: "Define the biomedical item catalogue with tracking rules and compatible device linkages.",
        children: [
          {
            id: "IM-002", type: "Story", title: "Item Create / Edit Form", priority: "Critical", status: "Done", storyPoints: 13,
            description: "Create items with full tracking configuration, UOM, shelf life and device compatibility.",
            acceptanceCriteria: [
              "Item Code (BIGINT PK), Item Name, Part Number, Catalogue Number",
              "Item Type: Consumable / Spare / Accessory",
              "Manufacturer, UOM (Stock & Purchase), Shelf Life (months)",
              "Batch Required, Expiry Required, Serial Tracking toggles",
              "Compatible Devices multi-select from Device Master",
              "Active / Inactive / Deleted status",
            ],
            children: [
              { id: "IM-002a", type: "Sub-task", title: "Item Type drives tracking toggle defaults", priority: "Critical", status: "Done", storyPoints: 2, description: "Consumable → batch/expiry ON; Spare → serial ON by default." },
              { id: "IM-002b", type: "Sub-task", title: "BIGINT primary key (no UUID)", priority: "Critical", status: "Done", storyPoints: 1, description: "Schema updated to BIGINT PK; FK in store_item_config updated." },
              { id: "IM-002c", type: "Sub-task", title: "Compatible devices multi-select", priority: "High", status: "Done", storyPoints: 3, description: "Tag items to one or more device types." },
              { id: "IM-002d", type: "Sub-task", title: "Shelf life default from Store Master", priority: "Medium", status: "To Do", storyPoints: 2, description: "Pre-fill shelf life from linked store; user can override." },
              { id: "IM-002e", type: "Sub-task", title: "Item code uniqueness validation (tenant + org)", priority: "High", status: "Done", storyPoints: 2, description: "Unique constraint on tenant_id + org_id + item_code." },
            ],
          },
          {
            id: "IM-003", type: "Story", title: "Item List Screen", priority: "High", status: "Done", storyPoints: 8,
            description: "Browse and manage item catalogue with filters and bulk actions.",
            acceptanceCriteria: [
              "Columns: Item Code, Item Name, Type, Manufacturer, UOM, Shelf Life, Batch/Serial Flags, Stock, Status",
              "Filter by item type, status, compatible device",
              "Bulk activate / deactivate",
              "Export to Excel",
              "Row click → view/edit",
            ],
          },
          {
            id: "IM-004", type: "Story", title: "Item Stock View — Current Balance", priority: "High", status: "To Do", storyPoints: 5,
            description: "Show current stock per item across all stores with reorder status.",
            acceptanceCriteria: [
              "Item → Store → Current Stock table",
              "Colour-coded reorder breach indicator",
              "Drill down to batch/serial level",
            ],
          },
          {
            id: "IM-005", type: "Story", title: "GRN Integration — Goods Receipt", priority: "Critical", status: "In Progress", storyPoints: 8,
            description: "Receive items against purchase orders; update stock with batch/serial and expiry.",
            acceptanceCriteria: [
              "GRN linked to PO and Vendor",
              "Per-line: Item, Qty Ordered, Qty Received, Batch No, Expiry Date, Serial Nos",
              "Stock incremented on GRN save",
              "GRN voucher number auto-generated",
            ],
          },
          {
            id: "IM-006", type: "Story", title: "Store Issue Voucher — Consumption against Ticket", priority: "High", status: "To Do", storyPoints: 8,
            description: "Issue items from store against a service ticket with FIFO batch consumption.",
            acceptanceCriteria: [
              "Issue linked to Ticket ID",
              "FIFO batch selection for batch-tracked items",
              "Serial number selection for serial-tracked items",
              "Stock decremented on issue save",
              "Issue voucher printable",
            ],
          },
        ],
      },
    ],
  },
];

// ─── Stat Summary ─────────────────────────────────────────────────────────────

function getStats(tasks: Task[]): { total: number; done: number; inProgress: number; todo: number; totalSP: number } {
  let total = 0, done = 0, inProgress = 0, todo = 0, totalSP = 0;
  const walk = (t: Task) => {
    total++;
    if (t.storyPoints) totalSP += t.storyPoints;
    if (t.status === "Done") done++;
    else if (t.status === "In Progress") inProgress++;
    else todo++;
    t.children?.forEach(walk);
  };
  tasks.forEach(walk);
  return { total, done, inProgress, todo, totalSP };
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function TaskRow({ task, depth = 0 }: { task: Task; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = task.children && task.children.length > 0;
  const typeCfg = typeConfig[task.type];
  const priCfg = priorityConfig[task.priority];
  const stsCfg = statusConfig[task.status];
  const StsIcon = stsCfg.icon;

  return (
    <>
      <tr className={cn("border-b border-border transition-colors hover:bg-muted/30", depth > 0 && "bg-muted/10")}>
        {/* Expand + Type */}
        <td className="py-2 px-3" style={{ paddingLeft: `${12 + depth * 20}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button onClick={() => setOpen(!open)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5 flex-shrink-0" />
            )}
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded font-mono min-w-[18px] text-center", typeCfg.className)}>
              {typeCfg.short}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">{task.id}</span>
          </div>
        </td>

        {/* Title + Description */}
        <td className="py-2 px-3 max-w-xs">
          <div className={cn("font-semibold text-sm text-foreground", depth === 0 && "text-base font-bold")}>
            {task.title}
          </div>
          {depth <= 1 && (
            <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{task.description}</div>
          )}
        </td>

        {/* Priority */}
        <td className="py-2 px-3 whitespace-nowrap">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", priCfg.className)}>
            {priCfg.label}
          </span>
        </td>

        {/* Status */}
        <td className="py-2 px-3 whitespace-nowrap">
          <span className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border w-fit", stsCfg.className)}>
            <StsIcon className="w-3 h-3" />
            {stsCfg.label}
          </span>
        </td>

        {/* Story Points */}
        <td className="py-2 px-3 text-center">
          {task.storyPoints !== undefined ? (
            <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded-full">{task.storyPoints}</span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </td>

        {/* Acceptance Criteria count */}
        <td className="py-2 px-3 text-center">
          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 ? (
            <span className="text-[10px] font-semibold text-muted-foreground">{task.acceptanceCriteria.length} AC</span>
          ) : <span className="text-muted-foreground text-xs">—</span>}
        </td>
      </tr>

      {/* Acceptance Criteria expanded */}
      {open && task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && depth <= 1 && (
        <tr className="border-b border-border bg-muted/5">
          <td />
          <td colSpan={5} className="py-2 px-3 pb-3">
            <div className="ml-8">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Acceptance Criteria</p>
              <ul className="space-y-1">
                {task.acceptanceCriteria.map((ac, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                    <CheckCircle2 className="w-3 h-3 text-[#10B981] mt-0.5 flex-shrink-0" />
                    {ac}
                  </li>
                ))}
              </ul>
            </div>
          </td>
        </tr>
      )}

      {/* Children */}
      {open && hasChildren && task.children!.map((child) => (
        <TaskRow key={child.id} task={child} depth={depth + 1} />
      ))}
    </>
  );
}

// ─── Module Section ───────────────────────────────────────────────────────────

function ModuleSection({ module }: { module: Module }) {
  const [open, setOpen] = useState(true);
  const allTasks = module.tasks.flatMap(t => [t, ...(t.children ?? []).flatMap(c => [c, ...(c.children ?? [])])]);
  const stats = getStats(module.tasks);
  const pct = Math.round((stats.done / Math.max(stats.total, 1)) * 100);
  const Icon = module.icon;

  return (
    <div className="border border-border rounded-xl overflow-hidden mb-6 shadow-sm">
      {/* Module Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${module.color}20` }}>
          <Icon className="w-5 h-5" style={{ color: module.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-foreground">{module.title}</span>
            <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{module.key}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{module.description}</p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-base font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold text-foreground">{stats.totalSP}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Points</div>
          </div>
          <div className="text-center">
            <div className="text-base font-bold" style={{ color: module.color }}>{pct}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Done</div>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] font-bold">{stats.done} Done</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00BCD4]/10 text-[#00BCD4] font-bold">{stats.inProgress} WIP</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">{stats.todo} To Do</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="hidden lg:block w-32 flex-shrink-0">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Progress</span><span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: module.color }} />
          </div>
        </div>

        <ChevronDown className={cn("w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform", !open && "-rotate-90")} />
      </button>

      {/* Task Table */}
      {open && (
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-48">ID / Type</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Title & Description</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-24">Priority</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-28">Status</th>
                <th className="text-center px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-16">SP</th>
                <th className="text-center px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-16">AC</th>
              </tr>
            </thead>
            <tbody>
              {module.tasks.map((task) => (
                <TaskRow key={task.id} task={task} depth={0} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TaskDocumentPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");

  const totalStats = modules.reduce(
    (acc, m) => {
      const s = getStats(m.tasks);
      return { total: acc.total + s.total, done: acc.done + s.done, inProgress: acc.inProgress + s.inProgress, todo: acc.todo + s.todo, totalSP: acc.totalSP + s.totalSP };
    },
    { total: 0, done: 0, inProgress: 0, todo: 0, totalSP: 0 },
  );

  const overallPct = Math.round((totalStats.done / Math.max(totalStats.total, 1)) * 100);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Page Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-5 h-5 text-[#00BCD4]" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CMMS Biomedical</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground text-balance">Project Task Document</h1>
              <p className="text-sm text-muted-foreground mt-1 text-pretty">
                Sprint backlog and acceptance criteria for Asset Registration, Ticket Generation, Store Master and Item Master modules.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-semibold"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4" />
              Export / Print
            </Button>
          </div>

          {/* Overall Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
            {[
              { label: "Total Tasks", value: totalStats.total, color: "text-foreground" },
              { label: "Done", value: totalStats.done, color: "text-[#10B981]" },
              { label: "In Progress", value: totalStats.inProgress, color: "text-[#00BCD4]" },
              { label: "To Do", value: totalStats.todo, color: "text-muted-foreground" },
              { label: "Story Points", value: totalStats.totalSP, color: "text-[#8B5CF6]" },
            ].map((s) => (
              <Card key={s.label} className="px-4 py-3 border-border shadow-none">
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground font-semibold">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Overall progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className="font-semibold">Overall Completion</span>
              <span className="font-bold text-foreground">{overallPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[#00BCD4] rounded-full transition-all" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["All", "Done", "In Progress", "To Do", "Blocked"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "text-xs font-semibold px-3 py-1 rounded-full border transition-colors",
                  statusFilter === s
                    ? "bg-[#00BCD4] text-white border-[#00BCD4]"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-b border-border px-6 py-2 bg-muted/20">
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">Legend:</span>
          {Object.entries(typeConfig).map(([type, cfg]) => (
            <span key={type} className="flex items-center gap-1 text-[10px]">
              <span className={cn("px-1.5 py-0.5 rounded font-bold font-mono", cfg.className)}>{cfg.short}</span>
              <span className="text-muted-foreground">{type}</span>
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground ml-2">SP = Story Points &nbsp;·&nbsp; AC = Acceptance Criteria count</span>
        </div>
      </div>

      {/* Module Sections */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {modules.map((module) => (
          <ModuleSection key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}
