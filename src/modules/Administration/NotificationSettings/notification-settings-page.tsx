"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
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
  Bell,
  BellOff,
  Search,
  ChevronDown,
  ChevronRight,
  Mail,
  Inbox,
  Clock,
  Zap,
  CalendarClock,
  ShieldCheck,
  Wrench,
  Package,
  ClipboardList,
  Settings,
  X,
  Save,
  RotateCcw,
  Info,
  Filter,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/* ================================================================== */
/*  SYSTEM ROLES (from BRD Section 1)                                  */
/* ================================================================== */
const RECIPIENT_ROLES = [
  { id: "PLATFORM_ADMIN", label: "Platform Admin", scope: "Platform", color: "bg-red-100 text-red-700 border-red-200" },
  { id: "TENANT_ADMIN", label: "Tenant Admin", scope: "Tenant", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "ORG_ADMIN", label: "Organization Admin", scope: "Org", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "ORG_SUPERVISOR", label: "Org Supervisor", scope: "Org", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "ORG_STORE_MANAGER", label: "Org Store Manager / Keeper", scope: "Org", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { id: "ORG_COORDINATOR", label: "Org Coordinator", scope: "Org", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { id: "ORG_USER", label: "Org User (Biomed Eng / Tech)", scope: "Org", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "END_USER", label: "End Users", scope: "Org", color: "bg-gray-100 text-gray-600 border-gray-200" },
] as const;

/* ================================================================== */
/*  EVENT MODULES & EVENT MASTER (BRD Section 3)                       */
/* ================================================================== */
type TriggerType = "Immediate" | "Scheduled";

interface EventDef {
  code: string;
  name: string;
  module: string;
  triggerType: TriggerType;
  refDateField?: string;
  description: string;
}

const EVENT_MODULES = [
  { key: "ASSET", label: "Asset Module", icon: Wrench, color: "text-blue-600" },
  { key: "WARRANTY_AMC", label: "Warranty / AMC", icon: ShieldCheck, color: "text-amber-600" },
  { key: "PM_MAINTENANCE", label: "PM / Maintenance / Compliance", icon: CalendarClock, color: "text-emerald-600" },
  { key: "WORK_ORDER", label: "Work Orders", icon: ClipboardList, color: "text-indigo-600" },
  { key: "INVENTORY", label: "Inventory / GRN", icon: Package, color: "text-teal-600" },
] as const;

const EVENT_MASTER: EventDef[] = [
  // Asset Module
  { code: "ASSET_REGISTERED", name: "Asset Registered", module: "ASSET", triggerType: "Immediate", description: "Triggered when a new asset is registered in the system" },
  { code: "ASSET_UPDATED", name: "Asset Updated", module: "ASSET", triggerType: "Immediate", description: "Triggered when asset details are modified" },
  { code: "ASSET_STATUS_CHANGED", name: "Asset Status Changed", module: "ASSET", triggerType: "Immediate", description: "Triggered when asset status transitions (Active, Inactive, Condemned, etc.)" },
  { code: "ASSET_TRANSFERRED", name: "Asset Transferred", module: "ASSET", triggerType: "Immediate", description: "Triggered when asset is transferred between locations/departments" },
  // Warranty / AMC
  { code: "WARRANTY_EXPIRY_UPCOMING", name: "Warranty Expiry Upcoming", module: "WARRANTY_AMC", triggerType: "Scheduled", refDateField: "assets.warranty_expiry", description: "Reminder before warranty expiry date" },
  { code: "WARRANTY_EXPIRED", name: "Warranty Expired", module: "WARRANTY_AMC", triggerType: "Scheduled", refDateField: "assets.warranty_expiry", description: "Triggered on the exact warranty expiry date" },
  { code: "AMC_EXPIRY_UPCOMING", name: "AMC Expiry Upcoming", module: "WARRANTY_AMC", triggerType: "Scheduled", refDateField: "contracts.end_date", description: "Reminder before AMC contract expiry date" },
  { code: "AMC_EXPIRED", name: "AMC Expired", module: "WARRANTY_AMC", triggerType: "Scheduled", refDateField: "contracts.end_date", description: "Triggered on AMC contract expiry date" },
  // PM / Maintenance / Compliance
  { code: "PM_DUE_UPCOMING", name: "PM Due Upcoming", module: "PM_MAINTENANCE", triggerType: "Scheduled", refDateField: "pm_schedules.next_due_date", description: "Reminder before preventive maintenance due date" },
  { code: "PM_OVERDUE", name: "PM Overdue", module: "PM_MAINTENANCE", triggerType: "Scheduled", refDateField: "pm_schedules.next_due_date", description: "Triggered when PM task is past due date" },
  { code: "SAFETY_TEST_DUE_UPCOMING", name: "Safety Test Due Upcoming", module: "PM_MAINTENANCE", triggerType: "Scheduled", refDateField: "assets.safety_test_due", description: "Reminder before safety test due date" },
  { code: "CALIBRATION_DUE_UPCOMING", name: "Calibration Due Upcoming", module: "PM_MAINTENANCE", triggerType: "Scheduled", refDateField: "assets.calibration_due", description: "Reminder before calibration due date" },
  // Work Orders
  { code: "WO_CREATED", name: "Work Order Created", module: "WORK_ORDER", triggerType: "Immediate", description: "Triggered when a new work order is created" },
  { code: "WO_ASSIGNED", name: "Work Order Assigned", module: "WORK_ORDER", triggerType: "Immediate", description: "Triggered when work order is assigned to a technician" },
  { code: "WO_IN_PROGRESS", name: "Work Order In Progress", module: "WORK_ORDER", triggerType: "Immediate", description: "Triggered when work order status changes to In Progress" },
  { code: "WO_CLOSED", name: "Work Order Closed", module: "WORK_ORDER", triggerType: "Immediate", description: "Triggered when work order is completed and closed" },
  // Inventory
  { code: "GRN_RECEIVED", name: "GRN Received", module: "INVENTORY", triggerType: "Immediate", description: "Triggered when goods receipt note is processed" },
  { code: "STOCK_LOW", name: "Stock Below Reorder", module: "INVENTORY", triggerType: "Immediate", description: "Triggered when item stock falls below reorder level" },
  { code: "ITEM_EXPIRY_UPCOMING", name: "Item Expiry Upcoming", module: "INVENTORY", triggerType: "Scheduled", refDateField: "grn_lines.expiry_date", description: "Reminder before stock item expiry" },
];

/* ================================================================== */
/*  NOTIFICATION RULE (one per event)                                  */
/* ================================================================== */
type RecipientScope = "Org" | "Tenant" | "Platform";

interface ReminderDay {
  id: string;
  daysBefore: number;
}

interface NotificationRule {
  eventCode: string;
  enabled: boolean;
  recipientRoles: string[];
  recipientScope: RecipientScope;
  // Timing
  timingImmediate: boolean;
  beforeDays: number;
  reminderDays: ReminderDay[];
  recurringEnabled: boolean;
  recurringIntervalDays: number;
  // Channels
  channelInApp: boolean;
  channelEmail: boolean;
  // Escalation
  escalationEnabled: boolean;
  escalationDays: number;
  escalationRoles: string[];
}

/* ================================================================== */
/*  SEED DATA (realistic defaults per BRD Section 6)                   */
/* ================================================================== */
function buildDefaultRules(): NotificationRule[] {
  return EVENT_MASTER.map((evt) => {
    const isScheduled = evt.triggerType === "Scheduled";
    const isWarranty = evt.module === "WARRANTY_AMC";
    const isAsset = evt.module === "ASSET";
    const isWO = evt.module === "WORK_ORDER";

    // Default recipients per BRD examples
    let roles: string[] = ["ORG_ADMIN", "ORG_SUPERVISOR"];
    if (isAsset) roles = ["ORG_ADMIN", "ORG_SUPERVISOR", "ORG_COORDINATOR", "ORG_USER"];
    if (isWarranty) roles = ["ORG_ADMIN", "ORG_SUPERVISOR", "ORG_USER", "ORG_STORE_MANAGER"];
    if (isWO) roles = ["ORG_ADMIN", "ORG_SUPERVISOR", "ORG_USER"];
    if (evt.code === "STOCK_LOW") roles = ["ORG_STORE_MANAGER", "ORG_SUPERVISOR"];
    if (evt.code === "GRN_RECEIVED") roles = ["ORG_STORE_MANAGER", "ORG_COORDINATOR"];

    return {
      eventCode: evt.code,
      enabled: true,
      recipientRoles: roles,
      recipientScope: "Org",
      timingImmediate: !isScheduled,
      beforeDays: isScheduled ? 30 : 0,
      reminderDays: isScheduled
        ? [
            { id: `rd-${evt.code}-1`, daysBefore: 30 },
            { id: `rd-${evt.code}-2`, daysBefore: 15 },
            { id: `rd-${evt.code}-3`, daysBefore: 7 },
            { id: `rd-${evt.code}-4`, daysBefore: 1 },
          ]
        : [],
      recurringEnabled: evt.code.includes("OVERDUE"),
      recurringIntervalDays: evt.code.includes("OVERDUE") ? 7 : 0,
      channelInApp: true,
      channelEmail: true,
      escalationEnabled: evt.code === "WARRANTY_EXPIRED" || evt.code === "PM_OVERDUE",
      escalationDays: evt.code === "WARRANTY_EXPIRED" ? 3 : evt.code === "PM_OVERDUE" ? 5 : 0,
      escalationRoles: evt.code === "WARRANTY_EXPIRED" || evt.code === "PM_OVERDUE" ? ["TENANT_ADMIN"] : [],
    };
  });
}

/* ================================================================== */
/*  TINY HELPER COMPONENTS                                             */
/* ================================================================== */
function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function ScopeIndicator({ scope }: { scope: string }) {
  const config = scope === "Platform"
    ? { bg: "bg-red-50 border-red-200", text: "text-red-700" }
    : scope === "Tenant"
    ? { bg: "bg-amber-50 border-amber-200", text: "text-amber-700" }
    : { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" };
  return (
    <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border", config.bg, config.text)}>
      {scope}
    </span>
  );
}

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export function NotificationSettingsPage() {
  const [rules, setRules] = useState<NotificationRule[]>(buildDefaultRules);
  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState<string>("ALL");
  const [filterTrigger, setFilterTrigger] = useState<string>("ALL");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(EVENT_MODULES.map((m) => m.key)));
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ── helpers ──
  const getRule = useCallback(
    (code: string) => rules.find((r) => r.eventCode === code)!,
    [rules],
  );

  const updateRule = useCallback(
    (code: string, patch: Partial<NotificationRule>) => {
      setRules((prev) => prev.map((r) => (r.eventCode === code ? { ...r, ...patch } : r)));
      setHasChanges(true);
    },
    [],
  );

  const toggleModule = (key: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── filter events ──
  const filteredModules = useMemo(() => {
    return EVENT_MODULES.filter((m) => filterModule === "ALL" || m.key === filterModule).map((mod) => {
      const events = EVENT_MASTER.filter(
        (e) =>
          e.module === mod.key &&
          (filterTrigger === "ALL" || e.triggerType === filterTrigger) &&
          (e.name.toLowerCase().includes(search.toLowerCase()) || e.code.toLowerCase().includes(search.toLowerCase())),
      );
      return { ...mod, events };
    }).filter((m) => m.events.length > 0);
  }, [search, filterModule, filterTrigger]);

  // ── summary stats ──
  const totalEvents = EVENT_MASTER.length;
  const enabledCount = rules.filter((r) => r.enabled).length;
  const scheduledCount = EVENT_MASTER.filter((e) => e.triggerType === "Scheduled").length;
  const immediateCount = totalEvents - scheduledCount;

  // ── toggle roles ──
  const toggleRole = (eventCode: string, roleId: string) => {
    const rule = getRule(eventCode);
    const next = rule.recipientRoles.includes(roleId)
      ? rule.recipientRoles.filter((r) => r !== roleId)
      : [...rule.recipientRoles, roleId];
    updateRule(eventCode, { recipientRoles: next });
  };

  // ── reminder management ──
  const addReminder = (eventCode: string) => {
    const rule = getRule(eventCode);
    const newDay: ReminderDay = { id: `rd-${Date.now()}`, daysBefore: 0 };
    updateRule(eventCode, { reminderDays: [...rule.reminderDays, newDay] });
  };

  const updateReminderDay = (eventCode: string, remId: string, value: number) => {
    const rule = getRule(eventCode);
    updateRule(eventCode, {
      reminderDays: rule.reminderDays.map((rd) => (rd.id === remId ? { ...rd, daysBefore: value } : rd)),
    });
  };

  const removeReminder = (eventCode: string, remId: string) => {
    const rule = getRule(eventCode);
    updateRule(eventCode, { reminderDays: rule.reminderDays.filter((rd) => rd.id !== remId) });
  };

  // ── escalation roles ──
  const toggleEscalationRole = (eventCode: string, roleId: string) => {
    const rule = getRule(eventCode);
    const next = rule.escalationRoles.includes(roleId)
      ? rule.escalationRoles.filter((r) => r !== roleId)
      : [...rule.escalationRoles, roleId];
    updateRule(eventCode, { escalationRoles: next });
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-muted/30">
        {/* ── HEADER ── */}
        <div className="shrink-0 border-b bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Notification Settings</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Configure event-driven notification rules, recipients, timing, and channels for your tenant.</p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { setRules(buildDefaultRules()); setHasChanges(false); }}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-[#1e293b] hover:bg-[#334155] text-white" onClick={() => setHasChanges(false)}>
                <Save className="h-3.5 w-3.5" /> Save All Rules
              </Button>
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: "Total Events", value: totalEvents, icon: Bell, color: "text-foreground", bg: "bg-muted/50" },
              { label: "Enabled", value: enabledCount, icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Immediate", value: immediateCount, icon: Zap, color: "text-blue-700", bg: "bg-blue-50" },
              { label: "Scheduled", value: scheduledCount, icon: CalendarClock, color: "text-amber-700", bg: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-lg border px-3 py-2.5 flex items-center gap-3", s.bg)}>
                <div className={cn("flex items-center justify-center h-8 w-8 rounded-md bg-background border", s.color)}>
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className={cn("text-lg font-bold leading-none", s.color)}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── SEARCH & FILTERS ── */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input className="h-8 pl-8 text-xs" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="h-8 w-[200px] text-xs">
                <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Modules</SelectItem>
                {EVENT_MODULES.map((m) => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterTrigger} onValueChange={setFilterTrigger}>
              <SelectTrigger className="h-8 w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Trigger Types</SelectItem>
                <SelectItem value="Immediate">Immediate</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-[10px] text-muted-foreground" onClick={() => setExpandedModules(new Set(EVENT_MODULES.map((m) => m.key)))}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-[10px] text-muted-foreground" onClick={() => setExpandedModules(new Set())}>
                Collapse All
              </Button>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filteredModules.map((mod) => {
            const ModIcon = mod.icon;
            const isExpanded = expandedModules.has(mod.key);
            const modEnabledCount = mod.events.filter((e) => getRule(e.code).enabled).length;

            return (
              <Card key={mod.key} className="border shadow-sm overflow-hidden">
                {/* Module Header */}
                <button
                  type="button"
                  onClick={() => toggleModule(mod.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className={cn("flex items-center justify-center h-8 w-8 rounded-md border bg-muted/30", mod.color)}>
                    <ModIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-foreground">{mod.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {mod.events.length} event{mod.events.length !== 1 ? "s" : ""} &middot; {modEnabledCount} enabled
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] mr-2">{mod.events.length} events</Badge>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#1e293b]">
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 w-[40px]">On/Off</TableHead>
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 min-w-[200px]">Event</TableHead>
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3">Trigger</TableHead>
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3">Recipients</TableHead>
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3">Channels</TableHead>
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3">Timing</TableHead>
                          <TableHead className="text-white text-[10px] font-bold uppercase tracking-wider py-2 px-3 text-right">Configure</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mod.events.map((evt) => {
                          const rule = getRule(evt.code);
                          const isEditing = editingEvent === evt.code;
                          return (
                            <EventRow
                              key={evt.code}
                              event={evt}
                              rule={rule}
                              isEditing={isEditing}
                              onToggleEnabled={() => updateRule(evt.code, { enabled: !rule.enabled })}
                              onStartEdit={() => setEditingEvent(isEditing ? null : evt.code)}
                              onToggleRole={(roleId) => toggleRole(evt.code, roleId)}
                              onUpdateRule={(patch) => updateRule(evt.code, patch)}
                              onAddReminder={() => addReminder(evt.code)}
                              onUpdateReminderDay={(remId, value) => updateReminderDay(evt.code, remId, value)}
                              onRemoveReminder={(remId) => removeReminder(evt.code, remId)}
                              onToggleEscalationRole={(roleId) => toggleEscalationRole(evt.code, roleId)}
                            />
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}

          {filteredModules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BellOff className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-semibold text-muted-foreground">No events match your filters</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ================================================================== */
/*  EVENT ROW (summary row + expandable config panel)                  */
/* ================================================================== */
interface EventRowProps {
  event: EventDef;
  rule: NotificationRule;
  isEditing: boolean;
  onToggleEnabled: () => void;
  onStartEdit: () => void;
  onToggleRole: (roleId: string) => void;
  onUpdateRule: (patch: Partial<NotificationRule>) => void;
  onAddReminder: () => void;
  onUpdateReminderDay: (remId: string, value: number) => void;
  onRemoveReminder: (remId: string) => void;
  onToggleEscalationRole: (roleId: string) => void;
}

function EventRow({
  event,
  rule,
  isEditing,
  onToggleEnabled,
  onStartEdit,
  onToggleRole,
  onUpdateRule,
  onAddReminder,
  onUpdateReminderDay,
  onRemoveReminder,
  onToggleEscalationRole,
}: EventRowProps) {
  return (
    <>
      {/* Summary Row */}
      <TableRow className={cn("transition-colors", !rule.enabled && "opacity-50", isEditing && "bg-blue-50/40 border-l-2 border-l-blue-500")}>
        {/* Toggle */}
        <TableCell className="py-2.5 px-3">
          <Switch checked={rule.enabled} onCheckedChange={onToggleEnabled} className="scale-75" />
        </TableCell>

        {/* Event Name */}
        <TableCell className="py-2.5 px-3">
          <div>
            <p className="text-xs font-semibold text-foreground leading-tight">{event.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{event.code}</p>
          </div>
        </TableCell>

        {/* Trigger Type */}
        <TableCell className="py-2.5 px-3">
          <Badge variant="outline" className={cn("text-[10px] font-semibold gap-1", event.triggerType === "Immediate" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200")}>
            {event.triggerType === "Immediate" ? <Zap className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
            {event.triggerType}
          </Badge>
        </TableCell>

        {/* Recipients Summary */}
        <TableCell className="py-2.5 px-3">
          <div className="flex items-center gap-1 flex-wrap max-w-[220px]">
            {rule.recipientRoles.length === 0 ? (
              <span className="text-[10px] text-muted-foreground italic">None</span>
            ) : rule.recipientRoles.length <= 3 ? (
              rule.recipientRoles.map((roleId) => {
                const role = RECIPIENT_ROLES.find((r) => r.id === roleId);
                return role ? (
                  <span key={roleId} className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border", role.color)}>
                    {role.label.length > 15 ? role.label.substring(0, 14) + "..." : role.label}
                  </span>
                ) : null;
              })
            ) : (
              <>
                {rule.recipientRoles.slice(0, 2).map((roleId) => {
                  const role = RECIPIENT_ROLES.find((r) => r.id === roleId);
                  return role ? (
                    <span key={roleId} className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border", role.color)}>
                      {role.label.length > 12 ? role.label.substring(0, 11) + "..." : role.label}
                    </span>
                  ) : null;
                })}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border bg-muted text-muted-foreground cursor-help">
                      +{rule.recipientRoles.length - 2}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    {rule.recipientRoles.slice(2).map((roleId) => RECIPIENT_ROLES.find((r) => r.id === roleId)?.label).join(", ")}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </TableCell>

        {/* Channels */}
        <TableCell className="py-2.5 px-3">
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("flex items-center justify-center h-6 w-6 rounded border", rule.channelInApp ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-muted border-muted text-muted-foreground/40")}>
                  <Inbox className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">In-App {rule.channelInApp ? "ON" : "OFF"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn("flex items-center justify-center h-6 w-6 rounded border", rule.channelEmail ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-muted border-muted text-muted-foreground/40")}>
                  <Mail className="h-3 w-3" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">Email {rule.channelEmail ? "ON" : "OFF"}</TooltipContent>
            </Tooltip>
          </div>
        </TableCell>

        {/* Timing Summary */}
        <TableCell className="py-2.5 px-3">
          {event.triggerType === "Immediate" ? (
            <span className="text-[10px] text-muted-foreground">Instant</span>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              {rule.reminderDays.length > 0
                ? rule.reminderDays.sort((a, b) => b.daysBefore - a.daysBefore).map((rd) => `${rd.daysBefore}d`).join(", ")
                : `${rule.beforeDays}d before`}
              {rule.recurringEnabled && (
                <span className="ml-1 text-amber-600 font-semibold"> + every {rule.recurringIntervalDays}d</span>
              )}
            </span>
          )}
        </TableCell>

        {/* Configure button */}
        <TableCell className="py-2.5 px-3 text-right">
          <Button variant={isEditing ? "default" : "outline"} size="sm" className={cn("h-7 text-[10px] gap-1", isEditing && "bg-[#1e293b] text-white")} onClick={onStartEdit}>
            <Settings className="h-3 w-3" />
            {isEditing ? "Close" : "Configure"}
          </Button>
        </TableCell>
      </TableRow>

      {/* Expanded Config Panel */}
      {isEditing && (
        <TableRow>
          <TableCell colSpan={7} className="p-0">
            <div className="bg-gradient-to-b from-blue-50/60 to-background border-t border-b border-blue-100 px-6 py-5 space-y-5">
              {/* Event info bar */}
              <div className="flex items-start gap-3 bg-white rounded-lg border p-3">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">{event.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{event.description}</p>
                  {event.refDateField && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Reference field: <code className="bg-muted px-1 py-0.5 rounded text-[9px] font-mono">{event.refDateField}</code>
                    </p>
                  )}
                </div>
                <ScopeIndicator scope={rule.recipientScope} />
              </div>

              <div className="grid grid-cols-3 gap-5">
                {/* ── LEFT: Recipients ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Recipients</p>
                  </div>

                  {/* Scope */}
                  <FormField label="Recipient Scope">
                    <Select value={rule.recipientScope} onValueChange={(v) => onUpdateRule({ recipientScope: v as RecipientScope })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Org">Org Scoped (same org as asset)</SelectItem>
                        <SelectItem value="Tenant">Tenant Scoped (all tenant admins)</SelectItem>
                        <SelectItem value="Platform">Platform Scoped (platform admins)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Role checkboxes */}
                  <FormField label="Recipient Roles">
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                      {RECIPIENT_ROLES.map((role) => (
                        <label key={role.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                          <Checkbox
                            checked={rule.recipientRoles.includes(role.id)}
                            onCheckedChange={() => onToggleRole(role.id)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-[11px] text-foreground flex-1">{role.label}</span>
                          <ScopeIndicator scope={role.scope} />
                        </label>
                      ))}
                    </div>
                  </FormField>
                </div>

                {/* ── CENTER: Timing ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Timing Configuration</p>
                  </div>

                  {event.triggerType === "Immediate" ? (
                    <div className="bg-white rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <p className="text-xs font-semibold text-foreground">Triggers immediately</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Notification is sent the moment this event occurs in the system.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Reminder days */}
                      <FormField label="Reminder Days (before event)" hint="Notification sent N days before the reference date">
                        <div className="space-y-1.5">
                          {rule.reminderDays.map((rd, idx) => (
                            <div key={rd.id} className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground w-4 text-right">{idx + 1}.</span>
                              <Input
                                type="number"
                                min={0}
                                className="h-7 w-20 text-xs text-center"
                                value={rd.daysBefore}
                                onChange={(e) => onUpdateReminderDay(rd.id, parseInt(e.target.value) || 0)}
                              />
                              <span className="text-[10px] text-muted-foreground">days before</span>
                              <button type="button" onClick={() => onRemoveReminder(rd.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600 hover:text-blue-700 gap-1 px-2" onClick={onAddReminder}>
                            + Add Reminder
                          </Button>
                        </div>
                      </FormField>

                      {/* Recurring */}
                      <Separator />
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={rule.recurringEnabled}
                            onCheckedChange={(v) => onUpdateRule({ recurringEnabled: !!v })}
                            className="h-3.5 w-3.5"
                          />
                          <span className="text-[11px] font-semibold text-foreground">Recurring after due date</span>
                        </label>
                        {rule.recurringEnabled && (
                          <div className="flex items-center gap-2 pl-5">
                            <span className="text-[10px] text-muted-foreground">Every</span>
                            <Input
                              type="number"
                              min={1}
                              className="h-7 w-16 text-xs text-center"
                              value={rule.recurringIntervalDays}
                              onChange={(e) => onUpdateRule({ recurringIntervalDays: parseInt(e.target.value) || 1 })}
                            />
                            <span className="text-[10px] text-muted-foreground">days until resolved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── RIGHT: Channels & Escalation ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Channels & Escalation</p>
                  </div>

                  {/* Channel toggles */}
                  <FormField label="Delivery Channels">
                    <div className="space-y-2 bg-white rounded-lg border p-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Inbox className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-[11px] text-foreground font-medium">In-App Notification</span>
                        </div>
                        <Switch checked={rule.channelInApp} onCheckedChange={(v) => onUpdateRule({ channelInApp: v })} className="scale-75" />
                      </label>
                      <Separator />
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-blue-600" />
                          <span className="text-[11px] text-foreground font-medium">Email</span>
                        </div>
                        <Switch checked={rule.channelEmail} onCheckedChange={(v) => onUpdateRule({ channelEmail: v })} className="scale-75" />
                      </label>
                      <Separator />
                      <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-2">
                          <Bell className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-[11px] text-foreground font-medium">SMS / WhatsApp</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">Coming Soon</Badge>
                      </div>
                    </div>
                  </FormField>

                  {/* Escalation */}
                  <Separator />
                  <FormField label="Escalation (optional)" hint="Escalate if not acknowledged within N days">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={rule.escalationEnabled}
                          onCheckedChange={(v) => onUpdateRule({ escalationEnabled: !!v })}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-[11px] font-semibold text-foreground">Enable escalation</span>
                      </label>
                      {rule.escalationEnabled && (
                        <div className="space-y-2 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">If not acknowledged within</span>
                            <Input
                              type="number"
                              min={1}
                              className="h-7 w-16 text-xs text-center"
                              value={rule.escalationDays}
                              onChange={(e) => onUpdateRule({ escalationDays: parseInt(e.target.value) || 1 })}
                            />
                            <span className="text-[10px] text-muted-foreground">days, notify:</span>
                          </div>
                          <div className="space-y-1">
                            {RECIPIENT_ROLES.filter((r) => r.scope === "Tenant" || r.scope === "Platform").map((role) => (
                              <label key={role.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 cursor-pointer">
                                <Checkbox
                                  checked={rule.escalationRoles.includes(role.id)}
                                  onCheckedChange={() => onToggleEscalationRole(role.id)}
                                  className="h-3 w-3"
                                />
                                <span className="text-[10px] text-foreground">{role.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                            <AlertTriangle className="h-3 w-3 text-amber-600 mt-0.5 shrink-0" />
                            <p className="text-[9px] text-amber-700">Escalation notifies higher-level roles when the original recipients have not acknowledged the notification.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormField>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
