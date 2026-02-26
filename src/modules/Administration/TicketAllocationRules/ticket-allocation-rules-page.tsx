"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Separator } from "@/src/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  Search,
  Plus,
  GripVertical,
  Copy,
  Trash2,
  Pencil,
  ArrowLeft,
  Power,
  Settings,
  ShieldCheck,
  Users,
  Zap,
  ChevronDown,
  ChevronRight,
  X,
  Save,
  Info,
  AlertTriangle,
  CheckCircle2,
  Play,
  Filter,
  ArrowUpDown,
  ListOrdered,
  Target,
  GitBranch,
  Layers,
  Eye,
  RotateCcw,
} from "lucide-react";

/* ================================================================== */
/*  TYPES                                                               */
/* ================================================================== */
type ConditionOperator = "IN" | "NOT_IN" | "EQUALS" | "NOT_EQUALS";
type MatchType = "ALL" | "ANY";
type AssignToType = "TEAM" | "ENGINEER" | "VENDOR" | "QUEUE";
type AssignStrategy = "FIXED" | "ROUND_ROBIN" | "LEAST_OPEN";
type EvalMode = "FIRST_MATCH" | "BEST_MATCH";
type LoadBalancing = "ROUND_ROBIN" | "LEAST_OPEN" | "MANUAL";
type RuleView = "list" | "create" | "edit" | "test";

interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  values: string[];
}

interface Assignment {
  assignToType: AssignToType;
  assignToId: string;
  assignToName: string;
  strategy: AssignStrategy;
  poolIds?: string[];
  overridePriority?: string;
  overrideSla?: string;
  notifyAssignee: boolean;
  notifyChannels: string[];
}

interface AllocationRule {
  id: string;
  priority: number;
  ruleName: string;
  description: string;
  matchType: MatchType;
  conditions: Condition[];
  assignment: Assignment;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface GlobalSettings {
  ruleBasedEnabled: boolean;
  evalMode: EvalMode;
  defaultFallback: string;
  loadBalancing: LoadBalancing;
}

/* ================================================================== */
/*  MOCK REFERENCE DATA                                                */
/* ================================================================== */
const DEPARTMENTS = [
  { id: "D-01", name: "Radiology" },
  { id: "D-02", name: "ICU" },
  { id: "D-03", name: "Emergency" },
  { id: "D-04", name: "General Ward" },
  { id: "D-05", name: "Dialysis" },
  { id: "D-06", name: "Operation Theatre" },
  { id: "D-07", name: "CSSD" },
  { id: "D-08", name: "Cardiology" },
  { id: "D-09", name: "Neurology" },
  { id: "D-10", name: "Pathology Lab" },
];

const ASSET_CATEGORIES = [
  { id: "AC-01", name: "Ventilator" },
  { id: "AC-02", name: "Infusion Pump" },
  { id: "AC-03", name: "Patient Monitor" },
  { id: "AC-04", name: "Defibrillator" },
  { id: "AC-05", name: "X-Ray Machine" },
  { id: "AC-06", name: "CT Scanner" },
  { id: "AC-07", name: "MRI Machine" },
  { id: "AC-08", name: "Ultrasound" },
  { id: "AC-09", name: "ECG Machine" },
  { id: "AC-10", name: "Autoclave" },
  { id: "AC-11", name: "Dialysis Machine" },
  { id: "AC-12", name: "Anaesthesia Workstation" },
];

const TICKET_TYPES = [
  { id: "TT-01", name: "Breakdown" },
  { id: "TT-02", name: "Service Request" },
  { id: "TT-03", name: "Calibration" },
  { id: "TT-04", name: "AMC / Contract" },
  { id: "TT-05", name: "Installation" },
];

const SEVERITY_LEVELS = [
  { id: "S-01", name: "Critical" },
  { id: "S-02", name: "High" },
  { id: "S-03", name: "Medium" },
  { id: "S-04", name: "Low" },
];

const LOCATIONS = [
  { id: "L-01", name: "Main Tower" },
  { id: "L-02", name: "Diagnostic Block" },
  { id: "L-03", name: "Block A - OMR" },
];

const TEAMS = [
  { id: "T-01", name: "Radiology Biomedical Team" },
  { id: "T-02", name: "ICU Equipment Team" },
  { id: "T-03", name: "General Biomedical Team" },
  { id: "T-04", name: "Imaging Service Team" },
  { id: "T-05", name: "Critical Care Support" },
  { id: "T-06", name: "Sterilization Team" },
];

const ENGINEERS = [
  { id: "E-01", name: "Rajesh Kumar" },
  { id: "E-02", name: "Priya Sharma" },
  { id: "E-03", name: "Vikram Singh" },
  { id: "E-04", name: "Anita Nair" },
  { id: "E-05", name: "Suresh Reddy" },
];

const VENDORS = [
  { id: "V-01", name: "Philips Healthcare" },
  { id: "V-02", name: "GE Healthcare" },
  { id: "V-03", name: "Siemens Healthineers" },
  { id: "V-04", name: "Mindray India" },
  { id: "V-05", name: "B. Braun" },
];

const CONDITION_FIELDS = [
  { key: "DEPARTMENT", label: "Department", options: DEPARTMENTS },
  { key: "ASSET_CATEGORY", label: "Asset Category", options: ASSET_CATEGORIES },
  { key: "TICKET_TYPE", label: "Ticket Type", options: TICKET_TYPES },
  { key: "SEVERITY", label: "Severity", options: SEVERITY_LEVELS },
  { key: "LOCATION", label: "Location / Building", options: LOCATIONS },
];

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "IN", label: "is any of" },
  { value: "NOT_IN", label: "is not any of" },
  { value: "EQUALS", label: "equals" },
  { value: "NOT_EQUALS", label: "not equals" },
];

/* ================================================================== */
/*  INITIAL MOCK RULES                                                  */
/* ================================================================== */
const initialRules: AllocationRule[] = [
  {
    id: "RULE-001",
    priority: 1,
    ruleName: "Radiology Critical Breakdown",
    description: "Route critical radiology breakdowns to imaging specialists",
    matchType: "ALL",
    conditions: [
      { id: "C-001", field: "DEPARTMENT", operator: "IN", values: ["D-01"] },
      { id: "C-002", field: "TICKET_TYPE", operator: "EQUALS", values: ["TT-01"] },
      { id: "C-003", field: "SEVERITY", operator: "IN", values: ["S-01", "S-02"] },
    ],
    assignment: {
      assignToType: "TEAM",
      assignToId: "T-01",
      assignToName: "Radiology Biomedical Team",
      strategy: "ROUND_ROBIN",
      notifyAssignee: true,
      notifyChannels: ["EMAIL", "PUSH"],
    },
    isActive: true,
    createdAt: "2025-12-01",
    updatedAt: "2026-01-15",
    createdBy: "Arjun Kumar",
  },
  {
    id: "RULE-002",
    priority: 2,
    ruleName: "ICU Ventilator Alerts",
    description: "All ICU ventilator tickets go to critical care support with SLA override",
    matchType: "ALL",
    conditions: [
      { id: "C-004", field: "DEPARTMENT", operator: "IN", values: ["D-02"] },
      { id: "C-005", field: "ASSET_CATEGORY", operator: "IN", values: ["AC-01"] },
    ],
    assignment: {
      assignToType: "TEAM",
      assignToId: "T-05",
      assignToName: "Critical Care Support",
      strategy: "LEAST_OPEN",
      overridePriority: "Critical",
      overrideSla: "2 hours",
      notifyAssignee: true,
      notifyChannels: ["EMAIL", "SMS", "PUSH"],
    },
    isActive: true,
    createdAt: "2025-12-05",
    updatedAt: "2026-01-20",
    createdBy: "Arjun Kumar",
  },
  {
    id: "RULE-003",
    priority: 3,
    ruleName: "CT/MRI Service Requests",
    description: "Imaging equipment service requests route to vendor",
    matchType: "ALL",
    conditions: [
      { id: "C-006", field: "ASSET_CATEGORY", operator: "IN", values: ["AC-06", "AC-07"] },
      { id: "C-007", field: "TICKET_TYPE", operator: "IN", values: ["TT-02", "TT-04"] },
    ],
    assignment: {
      assignToType: "VENDOR",
      assignToId: "V-03",
      assignToName: "Siemens Healthineers",
      strategy: "FIXED",
      notifyAssignee: true,
      notifyChannels: ["EMAIL"],
    },
    isActive: true,
    createdAt: "2025-12-10",
    updatedAt: "2026-02-01",
    createdBy: "Priya Sharma",
  },
  {
    id: "RULE-004",
    priority: 4,
    ruleName: "Emergency Department - All Tickets",
    description: "Route all emergency dept tickets to general biomed team",
    matchType: "ANY",
    conditions: [
      { id: "C-008", field: "DEPARTMENT", operator: "EQUALS", values: ["D-03"] },
    ],
    assignment: {
      assignToType: "ENGINEER",
      assignToId: "E-03",
      assignToName: "Vikram Singh",
      strategy: "FIXED",
      notifyAssignee: true,
      notifyChannels: ["EMAIL", "PUSH"],
    },
    isActive: true,
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    createdBy: "Arjun Kumar",
  },
  {
    id: "RULE-005",
    priority: 5,
    ruleName: "CSSD Autoclave Calibration",
    description: "Autoclave calibration tickets to sterilization team",
    matchType: "ALL",
    conditions: [
      { id: "C-009", field: "DEPARTMENT", operator: "IN", values: ["D-07"] },
      { id: "C-010", field: "ASSET_CATEGORY", operator: "EQUALS", values: ["AC-10"] },
      { id: "C-011", field: "TICKET_TYPE", operator: "EQUALS", values: ["TT-03"] },
    ],
    assignment: {
      assignToType: "TEAM",
      assignToId: "T-06",
      assignToName: "Sterilization Team",
      strategy: "ROUND_ROBIN",
      notifyAssignee: false,
      notifyChannels: [],
    },
    isActive: false,
    createdAt: "2026-01-10",
    updatedAt: "2026-02-10",
    createdBy: "Suresh Reddy",
  },
  {
    id: "RULE-006",
    priority: 6,
    ruleName: "Dialysis Machine - OMR Branch",
    description: "Dialysis machine tickets from OMR to vendor B. Braun",
    matchType: "ALL",
    conditions: [
      { id: "C-012", field: "ASSET_CATEGORY", operator: "EQUALS", values: ["AC-11"] },
      { id: "C-013", field: "LOCATION", operator: "IN", values: ["L-03"] },
    ],
    assignment: {
      assignToType: "VENDOR",
      assignToId: "V-05",
      assignToName: "B. Braun",
      strategy: "FIXED",
      notifyAssignee: true,
      notifyChannels: ["EMAIL"],
    },
    isActive: true,
    createdAt: "2026-01-20",
    updatedAt: "2026-02-15",
    createdBy: "Anita Nair",
  },
];

const initialGlobalSettings: GlobalSettings = {
  ruleBasedEnabled: true,
  evalMode: "FIRST_MATCH",
  defaultFallback: "Unassigned Queue",
  loadBalancing: "ROUND_ROBIN",
};

/* ================================================================== */
/*  HELPERS                                                             */
/* ================================================================== */
function resolveValues(field: string, values: string[]): string {
  const fd = CONDITION_FIELDS.find((f) => f.key === field);
  if (!fd) return values.join(", ");
  return values
    .map((v) => fd.options.find((o) => o.id === v)?.name ?? v)
    .join(", ");
}

function conditionSummary(rule: AllocationRule): string {
  return rule.conditions
    .map((c) => {
      const fd = CONDITION_FIELDS.find((f) => f.key === c.field);
      const opLabel = OPERATORS.find((o) => o.value === c.operator)?.label ?? c.operator;
      return `${fd?.label ?? c.field} ${opLabel} ${resolveValues(c.field, c.values)}`;
    })
    .join(rule.matchType === "ALL" ? " AND " : " OR ");
}

let idCounter = 100;
function genId(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

/* ================================================================== */
/*  MAIN COMPONENT                                                      */
/* ================================================================== */
export function TicketAllocationRulesPage() {
  const [view, setView] = useState<RuleView>("list");
  const [rules, setRules] = useState<AllocationRule[]>(initialRules);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(initialGlobalSettings);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [editingRule, setEditingRule] = useState<AllocationRule | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Test simulator state
  const [testDept, setTestDept] = useState("");
  const [testCategory, setTestCategory] = useState("");
  const [testType, setTestType] = useState("");
  const [testSeverity, setTestSeverity] = useState("");
  const [testLocation, setTestLocation] = useState("");
  const [testResult, setTestResult] = useState<AllocationRule | null>(null);
  const [testNoMatch, setTestNoMatch] = useState(false);

  const filteredRules = useMemo(() => {
    let r = [...rules].sort((a, b) => a.priority - b.priority);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (rule) =>
          rule.ruleName.toLowerCase().includes(q) ||
          rule.description.toLowerCase().includes(q) ||
          rule.assignment.assignToName.toLowerCase().includes(q)
      );
    }
    if (filterStatus === "ACTIVE") r = r.filter((x) => x.isActive);
    if (filterStatus === "INACTIVE") r = r.filter((x) => !x.isActive);
    return r;
  }, [rules, search, filterStatus]);

  const stats = useMemo(() => {
    const active = rules.filter((r) => r.isActive).length;
    return { total: rules.length, active, inactive: rules.length - active };
  }, [rules]);

  const toggleRuleStatus = useCallback(
    (id: string) => {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
      );
    },
    []
  );

  const deleteRule = useCallback((id: string) => {
    setRules((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.map((r, i) => ({ ...r, priority: i + 1 }));
    });
  }, []);

  const duplicateRule = useCallback(
    (rule: AllocationRule) => {
      const newRule: AllocationRule = {
        ...rule,
        id: genId("RULE"),
        ruleName: `${rule.ruleName} (Copy)`,
        priority: rules.length + 1,
        isActive: false,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        conditions: rule.conditions.map((c) => ({ ...c, id: genId("C") })),
      };
      setRules((prev) => [...prev, newRule]);
    },
    [rules.length]
  );

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setRules((prev) => {
      const sorted = [...prev].sort((a, b) => a.priority - b.priority);
      const [moved] = sorted.splice(dragIdx, 1);
      sorted.splice(idx, 0, moved);
      return sorted.map((r, i) => ({ ...r, priority: i + 1 }));
    });
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  // Test simulator
  const runTest = () => {
    setTestResult(null);
    setTestNoMatch(false);
    const sorted = [...rules].filter((r) => r.isActive).sort((a, b) => a.priority - b.priority);
    for (const rule of sorted) {
      const condResults = rule.conditions.map((cond) => {
        let testVal = "";
        if (cond.field === "DEPARTMENT") testVal = testDept;
        else if (cond.field === "ASSET_CATEGORY") testVal = testCategory;
        else if (cond.field === "TICKET_TYPE") testVal = testType;
        else if (cond.field === "SEVERITY") testVal = testSeverity;
        else if (cond.field === "LOCATION") testVal = testLocation;
        if (!testVal) return true; // skip unchecked field
        if (cond.operator === "IN") return cond.values.includes(testVal);
        if (cond.operator === "NOT_IN") return !cond.values.includes(testVal);
        if (cond.operator === "EQUALS") return cond.values[0] === testVal;
        if (cond.operator === "NOT_EQUALS") return cond.values[0] !== testVal;
        return false;
      });
      const match =
        rule.matchType === "ALL"
          ? condResults.every(Boolean)
          : condResults.some(Boolean);
      if (match) {
        setTestResult(rule);
        return;
      }
    }
    setTestNoMatch(true);
  };

  /* ================================================================ */
  /*  RULE BUILDER (Create/Edit)                                       */
  /* ================================================================ */
  if (view === "create" || view === "edit") {
    return (
      <RuleBuilder
        rule={editingRule}
        totalRules={rules.length}
        onSave={(saved) => {
          if (view === "edit") {
            setRules((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
          } else {
            setRules((prev) => [...prev, { ...saved, priority: prev.length + 1 }]);
          }
          setView("list");
          setEditingRule(null);
        }}
        onCancel={() => {
          setView("list");
          setEditingRule(null);
        }}
      />
    );
  }

  /* ================================================================ */
  /*  RULES LIST VIEW                                                   */
  /* ================================================================ */
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Ticket Allocation Rules
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure rules to automatically route tickets to the right team, engineer, or vendor
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-sm font-semibold"
              onClick={() => setShowGlobalSettings(!showGlobalSettings)}
            >
              <Settings className="w-4 h-4 mr-1.5" /> Global Settings
            </Button>
            <Button
              size="sm"
              className="h-9 text-sm font-semibold text-white border-0"
              style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
              onClick={() => {
                setEditingRule(null);
                setView("create");
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Rule
            </Button>
          </div>
        </div>

        {/* Global Settings Panel */}
        {showGlobalSettings && (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                    <Settings className="w-4.5 h-4.5 text-[#00BCD4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">Global Settings</h3>
                    <p className="text-xs text-muted-foreground">
                      Control how ticket allocation rules are evaluated
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowGlobalSettings(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Rule-based Allocation
                  </Label>
                  <div className="flex items-center gap-3 h-10">
                    <Switch
                      checked={globalSettings.ruleBasedEnabled}
                      onCheckedChange={(v) =>
                        setGlobalSettings({ ...globalSettings, ruleBasedEnabled: v })
                      }
                    />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {globalSettings.ruleBasedEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Evaluation Mode</Label>
                  <Select
                    value={globalSettings.evalMode}
                    onValueChange={(v) =>
                      setGlobalSettings({ ...globalSettings, evalMode: v as EvalMode })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIRST_MATCH">First Match Wins</SelectItem>
                      <SelectItem value="BEST_MATCH">Best Match (Scoring)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Default Fallback</Label>
                  <Select
                    value={globalSettings.defaultFallback}
                    onValueChange={(v) =>
                      setGlobalSettings({ ...globalSettings, defaultFallback: v })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unassigned Queue">Unassigned Queue</SelectItem>
                      <SelectItem value="Default Team">Default Team</SelectItem>
                      <SelectItem value="Admin Queue">Admin Queue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Load Balancing</Label>
                  <Select
                    value={globalSettings.loadBalancing}
                    onValueChange={(v) =>
                      setGlobalSettings({
                        ...globalSettings,
                        loadBalancing: v as LoadBalancing,
                      })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                      <SelectItem value="LEAST_OPEN">Least Open Tickets</SelectItem>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!globalSettings.ruleBasedEnabled && (
                <div className="flex items-center gap-2 mt-4 px-3 py-2.5 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <p className="text-xs text-[#F59E0B] font-medium">
                    Rule-based allocation is disabled. Tickets will use category/department defaults or go to the fallback queue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Rules", value: stats.total, icon: Layers, color: "#00BCD4" },
            { label: "Active", value: stats.active, icon: Zap, color: "#10B981" },
            { label: "Inactive", value: stats.inactive, icon: Power, color: "#F59E0B" },
          ].map((s) => (
            <Card key={s.label} className="border border-border shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}12` }}
                >
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground leading-none">{s.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 text-sm"
                  placeholder="Search rules..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}
              >
                <SelectTrigger className="h-9 w-[150px] text-sm">
                  <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active Only</SelectItem>
                  <SelectItem value="INACTIVE">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6 hidden lg:block" />

              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <GripVertical className="w-3.5 h-3.5" />
                Drag rows to reorder priority
              </div>

              <div className="ml-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-sm font-semibold"
                      onClick={() => setView("test")}
                    >
                      <Play className="w-4 h-4 mr-1.5 text-[#00BCD4]" />
                      Test Routing
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Simulate a ticket to see which rule matches</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules Table */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead className="min-w-[220px]">Rule Name</TableHead>
                <TableHead className="min-w-[320px]">Conditions</TableHead>
                <TableHead className="min-w-[180px]">Assign To</TableHead>
                <TableHead className="w-[100px] text-center">Strategy</TableHead>
                <TableHead className="w-[90px] text-center">Status</TableHead>
                <TableHead className="w-[140px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Target className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-semibold">No rules found</p>
                      <p className="text-xs">
                        {search ? "Try a different search term" : "Create your first allocation rule"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule, idx) => (
                  <TableRow
                    key={rule.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "group cursor-grab active:cursor-grabbing transition-colors",
                      !rule.isActive && "opacity-60",
                      dragIdx === idx && "bg-[#00BCD4]/5"
                    )}
                  >
                    {/* Priority */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-sm font-bold text-foreground">{rule.priority}</span>
                      </div>
                    </TableCell>

                    {/* Rule Name */}
                    <TableCell>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">
                          {rule.ruleName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {rule.description}
                        </p>
                        {rule.effectiveFrom && (
                          <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                            {rule.effectiveFrom} - {rule.effectiveTo || "ongoing"}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Conditions */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold border-[#00BCD4]/20 text-[#00BCD4] bg-[#00BCD4]/5"
                        >
                          {rule.matchType === "ALL" ? "AND" : "OR"}
                        </Badge>
                        {rule.conditions.map((c) => {
                          const fd = CONDITION_FIELDS.find((f) => f.key === c.field);
                          return (
                            <Badge
                              key={c.id}
                              variant="outline"
                              className="text-[11px] font-semibold border-border bg-muted/50 text-foreground"
                            >
                              {fd?.label}: {resolveValues(c.field, c.values)}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>

                    {/* Assign To */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold",
                            rule.assignment.assignToType === "TEAM" &&
                              "border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10",
                            rule.assignment.assignToType === "ENGINEER" &&
                              "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10",
                            rule.assignment.assignToType === "VENDOR" &&
                              "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10",
                            rule.assignment.assignToType === "QUEUE" &&
                              "border-muted-foreground/30 text-muted-foreground bg-muted/30"
                          )}
                        >
                          {rule.assignment.assignToType}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground">
                          {rule.assignment.assignToName}
                        </span>
                      </div>
                      {rule.assignment.overrideSla && (
                        <p className="text-[11px] text-[#EF4444] font-semibold mt-0.5">
                          SLA: {rule.assignment.overrideSla}
                        </p>
                      )}
                    </TableCell>

                    {/* Strategy */}
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-border bg-card text-muted-foreground"
                      >
                        {rule.assignment.strategy === "ROUND_ROBIN"
                          ? "Round Robin"
                          : rule.assignment.strategy === "LEAST_OPEN"
                            ? "Least Open"
                            : "Fixed"}
                      </Badge>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => toggleRuleStatus(rule.id)}
                        className="inline-flex items-center"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold cursor-pointer transition-colors",
                            rule.isActive
                              ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                              : "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10"
                          )}
                        >
                          {rule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditingRule(rule);
                                setView("edit");
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => duplicateRule(rule)}
                            >
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicate</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-[#EF4444]"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Routing Logic Panel */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                <GitBranch className="w-4.5 h-4.5 text-[#00BCD4]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">Routing Priority</h3>
                <p className="text-xs text-muted-foreground">
                  How tickets are resolved when multiple rules or defaults exist
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { step: 1, label: "Match Rules", sub: "Top-priority rule wins", color: "#00BCD4" },
                { step: 2, label: "Category Default", sub: "From asset category master", color: "#10B981" },
                { step: 3, label: "Dept Default", sub: "From department master", color: "#F59E0B" },
                { step: 4, label: "Fallback Queue", sub: globalSettings.defaultFallback, color: "#EF4444" },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground">{s.sub}</p>
                    </div>
                  </div>
                  {i < 3 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Simulator Dialog */}
        {view === "test" && (
          <TestSimulator
            testDept={testDept}
            setTestDept={setTestDept}
            testCategory={testCategory}
            setTestCategory={setTestCategory}
            testType={testType}
            setTestType={setTestType}
            testSeverity={testSeverity}
            setTestSeverity={setTestSeverity}
            testLocation={testLocation}
            setTestLocation={setTestLocation}
            testResult={testResult}
            testNoMatch={testNoMatch}
            onRun={runTest}
            onClose={() => {
              setView("list");
              setTestResult(null);
              setTestNoMatch(false);
            }}
            onReset={() => {
              setTestDept("");
              setTestCategory("");
              setTestType("");
              setTestSeverity("");
              setTestLocation("");
              setTestResult(null);
              setTestNoMatch(false);
            }}
            fallback={globalSettings.defaultFallback}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

/* ================================================================== */
/*  TEST SIMULATOR                                                      */
/* ================================================================== */
function TestSimulator({
  testDept,
  setTestDept,
  testCategory,
  setTestCategory,
  testType,
  setTestType,
  testSeverity,
  setTestSeverity,
  testLocation,
  setTestLocation,
  testResult,
  testNoMatch,
  onRun,
  onClose,
  onReset,
  fallback,
}: {
  testDept: string;
  setTestDept: (v: string) => void;
  testCategory: string;
  setTestCategory: (v: string) => void;
  testType: string;
  setTestType: (v: string) => void;
  testSeverity: string;
  setTestSeverity: (v: string) => void;
  testLocation: string;
  setTestLocation: (v: string) => void;
  testResult: AllocationRule | null;
  testNoMatch: boolean;
  onRun: () => void;
  onClose: () => void;
  onReset: () => void;
  fallback: string;
}) {
  return (
    <Card className="border-2 border-[#00BCD4]/30 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00BCD4]/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-[#00BCD4]" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">Test Routing Simulator</h3>
              <p className="text-sm text-muted-foreground">
                Pick sample values to see which rule matches
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-foreground">Department</Label>
            <Select value={testDept} onValueChange={setTestDept}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-foreground">Asset Category</Label>
            <Select value={testCategory} onValueChange={setTestCategory}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-foreground">Ticket Type</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {TICKET_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-foreground">Severity</Label>
            <Select value={testSeverity} onValueChange={setTestSeverity}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_LEVELS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-bold text-foreground">Location</Label>
            <Select value={testLocation} onValueChange={setTestLocation}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <Button
            className="text-white border-0 text-sm font-semibold h-10 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onRun}
          >
            <Play className="w-4 h-4 mr-1.5" /> Run Test
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
          </Button>
        </div>

        {/* Result */}
        {testResult && (
          <div className="rounded-xl border-2 border-[#10B981]/30 bg-[#10B981]/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <p className="text-sm font-bold text-[#10B981]">Rule Matched</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Rule
                </p>
                <p className="text-sm font-bold text-foreground">
                  #{testResult.priority} - {testResult.ruleName}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Assign To
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10"
                  >
                    {testResult.assignment.assignToType}
                  </Badge>
                  <span className="text-sm font-bold text-foreground">
                    {testResult.assignment.assignToName}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Strategy
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {testResult.assignment.strategy === "ROUND_ROBIN"
                    ? "Round Robin"
                    : testResult.assignment.strategy === "LEAST_OPEN"
                      ? "Least Open"
                      : "Fixed"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Conditions
                </p>
                <p className="text-xs text-muted-foreground">{conditionSummary(testResult)}</p>
              </div>
            </div>
          </div>
        )}
        {testNoMatch && (
          <div className="rounded-xl border-2 border-[#F59E0B]/30 bg-[#F59E0B]/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              <p className="text-sm font-bold text-[#F59E0B]">No Rule Matched</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This ticket would fall through to:{" "}
              <span className="font-bold text-foreground">{fallback}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ================================================================== */
/*  RULE BUILDER (Create / Edit)                                        */
/* ================================================================== */
function RuleBuilder({
  rule,
  totalRules,
  onSave,
  onCancel,
}: {
  rule: AllocationRule | null;
  totalRules: number;
  onSave: (r: AllocationRule) => void;
  onCancel: () => void;
}) {
  const isEdit = !!rule;

  const [name, setName] = useState(rule?.ruleName ?? "");
  const [desc, setDesc] = useState(rule?.description ?? "");
  const [active, setActive] = useState(rule?.isActive ?? true);
  const [matchType, setMatchType] = useState<MatchType>(rule?.matchType ?? "ALL");
  const [conditions, setConditions] = useState<Condition[]>(
    rule?.conditions ?? [{ id: genId("C"), field: "DEPARTMENT", operator: "IN", values: [] }]
  );
  const [effectiveFrom, setEffectiveFrom] = useState(rule?.effectiveFrom ?? "");
  const [effectiveTo, setEffectiveTo] = useState(rule?.effectiveTo ?? "");

  const [assignToType, setAssignToType] = useState<AssignToType>(
    rule?.assignment.assignToType ?? "TEAM"
  );
  const [assignToId, setAssignToId] = useState(rule?.assignment.assignToId ?? "");
  const [strategy, setStrategy] = useState<AssignStrategy>(
    rule?.assignment.strategy ?? "FIXED"
  );
  const [notifyAssignee, setNotifyAssignee] = useState(rule?.assignment.notifyAssignee ?? true);
  const [overrideSla, setOverrideSla] = useState(rule?.assignment.overrideSla ?? "");
  const [overridePriority, setOverridePriority] = useState(rule?.assignment.overridePriority ?? "");

  const assignOptions =
    assignToType === "TEAM"
      ? TEAMS
      : assignToType === "ENGINEER"
        ? ENGINEERS
        : assignToType === "VENDOR"
          ? VENDORS
          : [{ id: "Q-01", name: "Unassigned Queue" }, { id: "Q-02", name: "Default Queue" }];

  const selectedAssignName = assignOptions.find((o) => o.id === assignToId)?.name ?? "";

  const addCondition = () => {
    setConditions((prev) => [
      ...prev,
      { id: genId("C"), field: "DEPARTMENT", operator: "IN", values: [] },
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCondition = (id: string, partial: Partial<Condition>) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...partial } : c))
    );
  };

  const toggleConditionValue = (condId: string, value: string) => {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id !== condId) return c;
        const has = c.values.includes(value);
        return {
          ...c,
          values: has ? c.values.filter((v) => v !== value) : [...c.values, value],
        };
      })
    );
  };

  const handleSave = () => {
    const now = new Date().toISOString().split("T")[0];
    const saved: AllocationRule = {
      id: rule?.id ?? genId("RULE"),
      priority: rule?.priority ?? totalRules + 1,
      ruleName: name,
      description: desc,
      matchType,
      conditions,
      assignment: {
        assignToType,
        assignToId,
        assignToName: selectedAssignName,
        strategy,
        notifyAssignee,
        notifyChannels: notifyAssignee ? ["EMAIL", "PUSH"] : [],
        overrideSla: overrideSla || undefined,
        overridePriority: overridePriority || undefined,
      },
      isActive: active,
      effectiveFrom: effectiveFrom || undefined,
      effectiveTo: effectiveTo || undefined,
      createdAt: rule?.createdAt ?? now,
      updatedAt: now,
      createdBy: rule?.createdBy ?? "Current User",
    };
    onSave(saved);
  };

  const isValid = name.trim() && conditions.length > 0 && assignToId;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h3 className="text-xl font-extrabold text-foreground">
            {isEdit ? "Edit Rule" : "Create Rule"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isEdit ? `Editing: ${rule?.ruleName}` : "Define conditions and assignment for a new rule"}
          </p>
        </div>
      </div>

      {/* A) Basic Info */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#00BCD4]" />
            </div>
            <h3 className="text-base font-extrabold text-foreground">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">
                Rule Name <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                className="h-10"
                placeholder="e.g. Radiology Critical Breakdown"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Status</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch checked={active} onCheckedChange={setActive} />
                <span className="text-sm font-semibold text-muted-foreground">
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="md:col-span-2 flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Description</Label>
              <Input
                className="h-10"
                placeholder="Briefly describe what this rule does"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Effective From</Label>
              <Input
                type="date"
                className="h-10"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Effective To</Label>
              <Input
                type="date"
                className="h-10"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B) Conditions (WHEN) */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                <Filter className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Conditions{" "}
                  <span className="text-sm font-normal text-muted-foreground">(WHEN)</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Define when this rule should be triggered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-bold text-foreground">Match</Label>
              <Select value={matchType} onValueChange={(v) => setMatchType(v as MatchType)}>
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ALL conditions (AND)</SelectItem>
                  <SelectItem value="ANY">ANY condition (OR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {conditions.map((cond, idx) => {
              const fd = CONDITION_FIELDS.find((f) => f.key === cond.field);
              return (
                <div key={cond.id}>
                  {idx > 0 && (
                    <div className="flex items-center justify-center my-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-[#00BCD4]/20 text-[#00BCD4] bg-[#00BCD4]/5"
                      >
                        {matchType}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/20">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Field */}
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Field
                        </Label>
                        <Select
                          value={cond.field}
                          onValueChange={(v) =>
                            updateCondition(cond.id, { field: v, values: [] })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_FIELDS.map((f) => (
                              <SelectItem key={f.key} value={f.key}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Operator */}
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Operator
                        </Label>
                        <Select
                          value={cond.operator}
                          onValueChange={(v) =>
                            updateCondition(cond.id, { operator: v as ConditionOperator })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Values */}
                      <div className="md:col-span-6 flex flex-col gap-1.5">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Values
                        </Label>
                        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-border bg-card min-h-[36px]">
                          {fd?.options.map((opt) => {
                            const selected = cond.values.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => toggleConditionValue(cond.id, opt.id)}
                                className={cn(
                                  "px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors",
                                  selected
                                    ? "border-[#00BCD4]/40 bg-[#00BCD4]/10 text-[#00BCD4]"
                                    : "border-border bg-muted/30 text-muted-foreground hover:border-[#00BCD4]/30"
                                )}
                              >
                                {opt.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    {conditions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 mt-6 hover:text-[#EF4444]"
                        onClick={() => removeCondition(cond.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-9 text-sm font-semibold"
            onClick={addCondition}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Condition
          </Button>
        </CardContent>
      </Card>

      {/* C) Assignment (THEN) */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Assignment{" "}
                <span className="text-sm font-normal text-muted-foreground">(THEN)</span>
              </h3>
              <p className="text-xs text-muted-foreground">Define where matching tickets go</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Assign To Type */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">
                Assign To <span className="text-[#EF4444]">*</span>
              </Label>
              <div className="flex gap-2">
                {(["TEAM", "ENGINEER", "VENDOR", "QUEUE"] as AssignToType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setAssignToType(t);
                      setAssignToId("");
                    }}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-xs font-bold border transition-colors text-center",
                      assignToType === t
                        ? "border-[#00BCD4]/40 bg-[#00BCD4]/10 text-[#00BCD4]"
                        : "border-border bg-card text-muted-foreground hover:border-[#00BCD4]/30"
                    )}
                  >
                    {t === "TEAM" ? "Team" : t === "ENGINEER" ? "Engineer" : t === "VENDOR" ? "Vendor" : "Queue"}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign To Name */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">
                {assignToType === "TEAM"
                  ? "Team"
                  : assignToType === "ENGINEER"
                    ? "Engineer"
                    : assignToType === "VENDOR"
                      ? "Vendor"
                      : "Queue"}{" "}
                <span className="text-[#EF4444]">*</span>
              </Label>
              <Select value={assignToId} onValueChange={setAssignToId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {assignOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Strategy */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Assignment Strategy</Label>
              <Select value={strategy} onValueChange={(v) => setStrategy(v as AssignStrategy)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed Assignee</SelectItem>
                  <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                  <SelectItem value="LEAST_OPEN">Least Open Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SLA Override */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">SLA Override</Label>
              <Select value={overrideSla} onValueChange={setOverrideSla}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="No override" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No override</SelectItem>
                  <SelectItem value="1 hour">1 Hour</SelectItem>
                  <SelectItem value="2 hours">2 Hours</SelectItem>
                  <SelectItem value="4 hours">4 Hours</SelectItem>
                  <SelectItem value="8 hours">8 Hours</SelectItem>
                  <SelectItem value="24 hours">24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Override */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Priority Override</Label>
              <Select value={overridePriority} onValueChange={setOverridePriority}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="No override" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No override</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notify */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">Notify Assignee</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch checked={notifyAssignee} onCheckedChange={setNotifyAssignee} />
                <span className="text-sm font-semibold text-muted-foreground">
                  {notifyAssignee ? "Yes (Email + Push)" : "No"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {name && conditions.some((c) => c.values.length > 0) && assignToId && (
        <Card className="border-2 border-[#00BCD4]/20 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-[#00BCD4]" />
              </div>
              <h3 className="text-base font-extrabold text-foreground">Rule Preview</h3>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm text-foreground">
                <span className="font-bold">WHEN</span>{" "}
                {conditions
                  .filter((c) => c.values.length > 0)
                  .map((c, i) => {
                    const fd = CONDITION_FIELDS.find((f) => f.key === c.field);
                    const opLabel = OPERATORS.find((o) => o.value === c.operator)?.label;
                    return (
                      <span key={c.id}>
                        {i > 0 && (
                          <Badge
                            variant="outline"
                            className="mx-1.5 text-[10px] font-bold border-[#00BCD4]/20 text-[#00BCD4] bg-[#00BCD4]/5"
                          >
                            {matchType}
                          </Badge>
                        )}
                        <span className="font-semibold text-[#00BCD4]">{fd?.label}</span>{" "}
                        <span className="text-muted-foreground">{opLabel}</span>{" "}
                        <span className="font-semibold">{resolveValues(c.field, c.values)}</span>
                      </span>
                    );
                  })}
              </p>
              <p className="text-sm text-foreground mt-2">
                <span className="font-bold">THEN</span> assign to{" "}
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10 mx-1"
                >
                  {assignToType}
                </Badge>
                <span className="font-semibold">{selectedAssignName}</span>
                {strategy !== "FIXED" && (
                  <span className="text-muted-foreground">
                    {" "}
                    using{" "}
                    <span className="font-semibold">
                      {strategy === "ROUND_ROBIN" ? "Round Robin" : "Least Open Tickets"}
                    </span>
                  </span>
                )}
                {overrideSla && (
                  <span className="text-[#EF4444] font-semibold"> | SLA: {overrideSla}</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={handleSave}
          disabled={!isValid}
        >
          <Save className="w-4 h-4 mr-1.5" /> {isEdit ? "Update Rule" : "Create Rule"}
        </Button>
        <Button
          variant="outline"
          className="text-sm font-semibold h-10 px-4"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
