"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
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
  Hash,
  Pencil,
  RotateCcw,
  Save,
  Search,
  X,
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────
interface VoucherSeries {
  id: string;
  moduleKey: string;
  moduleName: string;
  prefix: string;
  separator: string;
  startingNo: number;
  currentNo: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Module definitions (all modules that require auto-numbering) ────
const MODULE_OPTIONS = [
  { key: "GRN", label: "Goods Receipt Note (GRN)" },
  { key: "PO", label: "Purchase Order" },
  { key: "AST", label: "Asset Registration" },
  { key: "DEV", label: "Device Registration" },
  { key: "TKT", label: "Ticket" },
  { key: "WO", label: "Work Order" },
  { key: "PM", label: "Preventive Maintenance" },
  { key: "CAL", label: "Calibration" },
  { key: "AT", label: "Asset Transfer" },
  { key: "VND", label: "Vendor Registration" },
  { key: "STR", label: "Store Master" },
  { key: "ITM", label: "Item Master" },
] as const;

// ─── Seed data ─────────────────────────────────────
const initialData: VoucherSeries[] = [
  {
    id: "vs-001",
    moduleKey: "GRN",
    moduleName: "Goods Receipt Note (GRN)",
    prefix: "GRN",
    separator: "-",
    startingNo: 1,
    currentNo: 47,
    isActive: true,
    createdAt: "2025-01-15",
    updatedAt: "2026-02-20",
  },
  {
    id: "vs-002",
    moduleKey: "PO",
    moduleName: "Purchase Order",
    prefix: "PO",
    separator: "-",
    startingNo: 1,
    currentNo: 23,
    isActive: true,
    createdAt: "2025-01-15",
    updatedAt: "2026-02-18",
  },
  {
    id: "vs-003",
    moduleKey: "AST",
    moduleName: "Asset Registration",
    prefix: "AST",
    separator: "-",
    startingNo: 1000,
    currentNo: 1156,
    isActive: true,
    createdAt: "2025-01-15",
    updatedAt: "2026-02-22",
  },
  {
    id: "vs-004",
    moduleKey: "DEV",
    moduleName: "Device Registration",
    prefix: "DEV",
    separator: "-",
    startingNo: 1,
    currentNo: 89,
    isActive: true,
    createdAt: "2025-01-15",
    updatedAt: "2026-02-10",
  },
  {
    id: "vs-005",
    moduleKey: "TKT",
    moduleName: "Ticket",
    prefix: "TKT",
    separator: "-",
    startingNo: 1,
    currentNo: 512,
    isActive: true,
    createdAt: "2025-02-01",
    updatedAt: "2026-02-22",
  },
  {
    id: "vs-006",
    moduleKey: "WO",
    moduleName: "Work Order",
    prefix: "WO",
    separator: "/",
    startingNo: 1,
    currentNo: 234,
    isActive: true,
    createdAt: "2025-02-01",
    updatedAt: "2026-02-19",
  },
  {
    id: "vs-007",
    moduleKey: "PM",
    moduleName: "Preventive Maintenance",
    prefix: "PM",
    separator: "-",
    startingNo: 1,
    currentNo: 78,
    isActive: true,
    createdAt: "2025-03-01",
    updatedAt: "2026-01-30",
  },
  {
    id: "vs-008",
    moduleKey: "CAL",
    moduleName: "Calibration",
    prefix: "CAL",
    separator: "-",
    startingNo: 1,
    currentNo: 34,
    isActive: false,
    createdAt: "2025-03-01",
    updatedAt: "2026-01-15",
  },
];

// ─── Helper to generate preview ────────────────────
function generatePreview(
  prefix: string,
  separator: string,
  startingNo: number,
): string {
  if (!prefix) return "-";
  return `${prefix}${separator}${startingNo}`;
}

// ─── Form field helper ─────────────────────────────
function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-bold text-foreground">
        {label}
        {required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </Label>
      {children}
      {hint && (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────
function VoucherSeriesPage() {
  const [series, setSeries] = useState<VoucherSeries[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Form state
  const [formModule, setFormModule] = useState("");
  const [formPrefix, setFormPrefix] = useState("");
  const [formSeparator, setFormSeparator] = useState("-");
  const [formStartingNo, setFormStartingNo] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // Deletion confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Computed preview
  const preview = generatePreview(
    formPrefix,
    formSeparator,
    parseInt(formStartingNo) || 1,
  );

  // Available modules (exclude already-configured unless editing)
  const configuredKeys = series
    .filter((s) => s.id !== editingId)
    .map((s) => s.moduleKey);
  const availableModules = MODULE_OPTIONS.filter(
    (m) => !configuredKeys.includes(m.key),
  );

  // Filtered list
  const filtered = series.filter((s) => {
    const matchSearch =
      !search ||
      s.moduleName.toLowerCase().includes(search.toLowerCase()) ||
      s.prefix.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && s.isActive) ||
      (statusFilter === "inactive" && !s.isActive);
    return matchSearch && matchStatus;
  });

  const resetForm = () => {
    setFormModule("");
    setFormPrefix("");
    setFormSeparator("-");
    setFormStartingNo("");
    setFormActive(true);
    setFormError("");
    setFormSuccess("");
    setEditingId(null);
  };

  const handleModuleChange = (key: string) => {
    setFormModule(key);
    setFormError("");
    // Auto-suggest prefix from module key
    const mod = MODULE_OPTIONS.find((m) => m.key === key);
    if (mod && !formPrefix) {
      setFormPrefix(mod.key);
    }
  };

  const handleSave = () => {
    setFormError("");
    setFormSuccess("");

    if (!formModule) {
      setFormError("Please select a module.");
      return;
    }
    if (!formPrefix.trim()) {
      setFormError("Prefix is required.");
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(formPrefix.trim())) {
      setFormError("Prefix must be alphanumeric (no spaces or special characters).");
      return;
    }
    if (!formSeparator) {
      setFormError("Separator is required.");
      return;
    }
    const startNo = parseInt(formStartingNo);
    if (!formStartingNo || isNaN(startNo) || startNo < 0) {
      setFormError("Starting number must be 0 or greater.");
      return;
    }

    // Check for duplicate prefix (excluding current edit)
    const dupPrefix = series.find(
      (s) =>
        s.id !== editingId &&
        s.prefix.toLowerCase() === formPrefix.trim().toLowerCase(),
    );
    if (dupPrefix) {
      setFormError(
        `Prefix "${formPrefix.trim()}" is already used by "${dupPrefix.moduleName}".`,
      );
      return;
    }

    const mod = MODULE_OPTIONS.find((m) => m.key === formModule);
    const now = new Date().toISOString().split("T")[0];

    if (editingId) {
      // Update
      setSeries((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                moduleKey: formModule,
                moduleName: mod?.label || formModule,
                prefix: formPrefix.trim().toUpperCase(),
                separator: formSeparator,
                startingNo: startNo,
                isActive: formActive,
                updatedAt: now,
              }
            : s,
        ),
      );
      setFormSuccess(`Updated series for "${mod?.label || formModule}".`);
    } else {
      // Create
      const newEntry: VoucherSeries = {
        id: `vs-${Date.now()}`,
        moduleKey: formModule,
        moduleName: mod?.label || formModule,
        prefix: formPrefix.trim().toUpperCase(),
        separator: formSeparator,
        startingNo: startNo,
        currentNo: startNo,
        isActive: formActive,
        createdAt: now,
        updatedAt: now,
      };
      setSeries((prev) => [...prev, newEntry]);
      setFormSuccess(`Created series "${newEntry.prefix}${newEntry.separator}${newEntry.startingNo}" for "${mod?.label}".`);
    }

    resetForm();
    setTimeout(() => setFormSuccess(""), 3000);
  };

  const handleEdit = (item: VoucherSeries) => {
    setEditingId(item.id);
    setFormModule(item.moduleKey);
    setFormPrefix(item.prefix);
    setFormSeparator(item.separator);
    setFormStartingNo(String(item.startingNo));
    setFormActive(item.isActive);
    setFormError("");
    setFormSuccess("");
  };

  const handleDelete = (id: string) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
    setConfirmDeleteId(null);
  };

  const handleToggleStatus = (id: string) => {
    setSeries((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, isActive: !s.isActive, updatedAt: new Date().toISOString().split("T")[0] }
          : s,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Master</span>
            <span>/</span>
            <span className="font-bold text-foreground">Voucher Series</span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Hash className="w-5 h-5 text-[#00BCD4]" />
            Voucher Series Configuration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define auto-numbering prefixes, separators, and starting numbers for each module
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/5 text-xs font-bold px-3 py-1"
        >
          {series.filter((s) => s.isActive).length} Active Series
        </Badge>
      </div>

      {/* Form Card */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h3 className="text-sm font-extrabold text-foreground">
              {editingId ? "Edit Voucher Series" : "Add New Voucher Series"}
            </h3>
            {editingId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                <X className="w-3 h-3 mr-1" /> Cancel Edit
              </Button>
            )}
          </div>

          {/* Row 1: Module, Prefix, Separator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <FormField label="Module Name" required>
              <Select value={formModule} onValueChange={handleModuleChange}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select module" />
                </SelectTrigger>
                <SelectContent>
                  {(editingId ? MODULE_OPTIONS : availableModules).map((m) => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Prefix" required hint="Alphanumeric only (e.g. GRN, AST, TKT)">
              <Input
                className="h-10"
                placeholder="e.g. GRN"
                value={formPrefix}
                onChange={(e) => {
                  setFormPrefix(e.target.value.toUpperCase());
                  setFormError("");
                }}
                maxLength={10}
              />
            </FormField>

            <FormField label="Separator" required hint="Character between prefix and number">
              <Select value={formSeparator} onValueChange={setFormSeparator}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Hyphen ( - )</SelectItem>
                  <SelectItem value="/">Slash ( / )</SelectItem>
                  <SelectItem value=".">Dot ( . )</SelectItem>
                  <SelectItem value="_">Underscore ( _ )</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Row 2: Starting No, Active, Preview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FormField label="Starting Number" required hint="First number in the series">
              <Input
                type="number"
                className="h-10"
                placeholder="e.g. 1"
                min="0"
                value={formStartingNo}
                onChange={(e) => {
                  setFormStartingNo(e.target.value);
                  setFormError("");
                }}
              />
            </FormField>

            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  id="vs-active"
                  checked={formActive}
                  onCheckedChange={(v) => setFormActive(v === true)}
                />
                <Label
                  htmlFor="vs-active"
                  className="text-xs font-bold text-foreground cursor-pointer"
                >
                  Active
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-[#00BCD4]" /> Preview
              </Label>
              <div
                className={cn(
                  "h-10 rounded-lg border flex items-center px-4 font-mono text-sm font-bold tracking-wide",
                  formPrefix
                    ? "border-[#00BCD4]/30 bg-[#00BCD4]/5 text-[#00BCD4]"
                    : "border-border bg-muted/30 text-muted-foreground",
                )}
              >
                {formPrefix ? preview : "Select module and set prefix"}
              </div>
            </div>
          </div>

          {/* Error / Success */}
          {formError && (
            <div className="flex items-center gap-2 text-xs text-[#EF4444] font-semibold bg-[#EF4444]/5 px-3 py-2 rounded-lg mb-3">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="flex items-center gap-2 text-xs text-[#10B981] font-semibold bg-[#10B981]/5 px-3 py-2 rounded-lg mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {formSuccess}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="text-xs font-bold h-9 px-4"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" /> RESET
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="text-xs font-bold h-9 px-5 bg-[#1e293b] hover:bg-[#334155] text-white"
            >
              <Save className="w-3 h-3 mr-1.5" /> SAVE
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List Card */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                className="h-8 text-xs pl-8"
                placeholder="Search module or prefix..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold transition-all",
                    statusFilter === s
                      ? "bg-[#00BCD4] text-white shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1e293b] hover:bg-[#1e293b] [&>th]:h-9 [&>th]:py-0 [&>th]:text-[11px] [&>th]:text-white [&>th]:font-bold">
                  <TableHead className="w-14 pl-4">Sl. No.</TableHead>
                  <TableHead className="min-w-[200px]">Module Name</TableHead>
                  <TableHead className="w-24">Prefix</TableHead>
                  <TableHead className="w-20">Separator</TableHead>
                  <TableHead className="w-24 text-right">Starting No</TableHead>
                  <TableHead className="w-24 text-right">Current No</TableHead>
                  <TableHead className="min-w-[140px]">Preview (Next)</TableHead>
                  <TableHead className="w-20 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      {search || statusFilter !== "all"
                        ? "No voucher series match your filters."
                        : "No voucher series configured yet. Use the form above to add one."}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((item, idx) => {
                  const nextPreview = `${item.prefix}${item.separator}${item.currentNo + 1}`;
                  const isDeleting = confirmDeleteId === item.id;
                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "h-10 group",
                        editingId === item.id && "bg-[#00BCD4]/[0.04]",
                        isDeleting && "bg-[#EF4444]/[0.04]",
                      )}
                    >
                      <TableCell className="text-xs text-muted-foreground pl-4 font-mono">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-foreground">
                          {item.moduleName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground ml-2">
                          ({item.moduleKey})
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-[#00BCD4]">
                        {item.prefix}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-center text-muted-foreground">
                        <span className="bg-muted/50 px-2 py-0.5 rounded text-[11px] font-bold">
                          {item.separator === "-"
                            ? "Hyphen"
                            : item.separator === "/"
                              ? "Slash"
                              : item.separator === "."
                                ? "Dot"
                                : "Underscore"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right text-muted-foreground">
                        {item.startingNo}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-right font-bold text-foreground">
                        {item.currentNo}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono font-bold text-foreground bg-muted/50 px-2.5 py-1 rounded">
                          {nextPreview}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <button onClick={() => handleToggleStatus(item.id)}>
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border-0 px-2.5 py-0.5 cursor-pointer transition-colors",
                              item.isActive
                                ? "bg-[#10B981] hover:bg-[#059669] text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80",
                            )}
                          >
                            {item.isActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        {isDeleting ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="h-6 w-6 inline-flex items-center justify-center rounded text-white bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
                              title="Confirm delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-muted transition-colors"
                              title="Cancel"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(item)}
                              className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer summary */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20">
            <span className="text-[11px] text-muted-foreground">
              Showing {filtered.length} of {series.length} series
            </span>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                {series.filter((s) => s.isActive).length} Active
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                {series.filter((s) => !s.isActive).length} Inactive
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { VoucherSeriesPage };
