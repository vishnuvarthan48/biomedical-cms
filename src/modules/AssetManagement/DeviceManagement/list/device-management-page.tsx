"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Switch } from "@/src/components/ui/switch";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  MoreVertical,
  ArrowLeft,
  Save,
  Send,
  Upload,
  ChevronDown,
  ChevronUp,
  Cpu,
  Filter,
  Download,
  Trash2,
  X,
  Stethoscope,
  AlertCircle,
  FileText,
  CheckCircle2,
  FolderOpen,
  Building2,
} from "lucide-react";
import { mockUsers, mockOrganizations } from "@/src/lib/rbac-data";
import { DeviceImageSection } from "./device-image-section";

// ----- Types -----
interface DeviceMaster {
  id: string;
  deviceName: string;
  deviceType: string;
  manufacturer: string;
  model: string;
  country: string;
  riskClass: string;
  lifespan: string;
  status: "Active" | "Draft" | "Inactive";
  createdAt: string;
  linkedAssets: number;
}

interface ServiceMapping {
  id: string;
  serviceName: string;
  himsProcedureCode: string;
  price: number;
  effectiveFrom: string;
  effectiveTo: string;
  active: boolean;
}

// ----- Mock Data -----
const mockDevices: DeviceMaster[] = [
  { id: "DEV-001", deviceName: "MRI Scanner", deviceType: "Imaging", manufacturer: "Siemens Healthineers", model: "Magnetom Vida 3T", country: "Germany", riskClass: "Class III", lifespan: "12 years", status: "Active", createdAt: "2024-06-15", linkedAssets: 3 },
  { id: "DEV-002", deviceName: "CT Scanner", deviceType: "Imaging", manufacturer: "GE Healthcare", model: "Revolution EVO", country: "USA", riskClass: "Class III", lifespan: "10 years", status: "Active", createdAt: "2024-07-20", linkedAssets: 2 },
  { id: "DEV-003", deviceName: "Ventilator", deviceType: "Life Support", manufacturer: "Draeger", model: "Savina 300 Elite", country: "Germany", riskClass: "Class III", lifespan: "8 years", status: "Active", createdAt: "2024-08-10", linkedAssets: 12 },
  { id: "DEV-004", deviceName: "Ultrasound System", deviceType: "Imaging", manufacturer: "Philips", model: "EPIQ Elite", country: "Netherlands", riskClass: "Class II", lifespan: "10 years", status: "Active", createdAt: "2024-09-05", linkedAssets: 4 },
  { id: "DEV-005", deviceName: "Infusion Pump", deviceType: "Therapeutic", manufacturer: "B. Braun", model: "Infusomat Space", country: "Germany", riskClass: "Class II", lifespan: "7 years", status: "Draft", createdAt: "2025-01-10", linkedAssets: 0 },
  { id: "DEV-006", deviceName: "Defibrillator", deviceType: "Life Support", manufacturer: "Philips", model: "HeartStart MRx", country: "USA", riskClass: "Class III", lifespan: "10 years", status: "Active", createdAt: "2024-05-18", linkedAssets: 6 },
  { id: "DEV-007", deviceName: "Autoclave", deviceType: "Sterilization", manufacturer: "Tuttnauer", model: "3870 EA", country: "Israel", riskClass: "Class I", lifespan: "15 years", status: "Inactive", createdAt: "2020-03-01", linkedAssets: 1 },
  { id: "DEV-008", deviceName: "Patient Monitor", deviceType: "Patient Monitoring", manufacturer: "GE Healthcare", model: "Carescape B650", country: "USA", riskClass: "Class II", lifespan: "8 years", status: "Active", createdAt: "2024-10-22", linkedAssets: 8 },
];

const statusBadge: Record<string, string> = {
  Active: "bg-[#D1FAE5] text-[#059669]",
  Draft: "bg-[#FEF3C7] text-[#D97706]",
  Inactive: "bg-[#F3F4F6] text-[#6B7280]",
};

const riskBadge: Record<string, string> = {
  "Class I": "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
  "Class II": "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]",
  "Class III": "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
};

const deviceTypes = ["All", "Imaging", "Life Support", "Patient Monitoring", "Therapeutic", "Sterilization"];

// ----- FormField helper -----
// ----- Document categories for Device Master -----
const defaultDocCategories = [
  { name: "User Manual", desc: "Operating instructions and user guide from OEM", formats: "PDF" },
  { name: "Service Manual", desc: "Technical service and repair manual", formats: "PDF" },
  { name: "Regulatory Certificate", desc: "FDA, CE, BIS, or AERB certificates", formats: "PDF" },
  { name: "Spare Parts Catalog", desc: "OEM spare parts list with part numbers", formats: "PDF, XLS" },
  { name: "Factory Calibration Certificate", desc: "OEM calibration certificates and test reports", formats: "PDF" },
  { name: "Safety Data Sheet (SDS)", desc: "Material safety and hazard information", formats: "PDF" },
  { name: "Installation Guide", desc: "Site preparation and installation requirements", formats: "PDF, DOC" },
  { name: "Training Material", desc: "Operator training documents and presentations", formats: "PDF, PPT" },
];

// ----- Org dropdown: filtered by current user's active memberships -----
const CURRENT_USER_ID = "U-001";
const _currentUser = mockUsers.find((u) => u.id === CURRENT_USER_ID)!;
const _userActiveOrgIds = _currentUser.orgMemberships
  .filter((m) => m.status === "Active")
  .map((m) => m.orgId);
const orgOptions = mockOrganizations
  .filter((o) => _userActiveOrgIds.includes(o.id) && o.status === "Active")
  .map((o) => ({ id: o.id, name: o.name, code: o.code }));

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-bold text-foreground">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ----- Device List View -----
function DeviceListView({
  onCreate,
  onEdit,
  onView,
}: {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockDevices.filter((d) => {
    if (typeFilter !== "All" && d.deviceType !== typeFilter) return false;
    if (statusFilter !== "All" && d.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.deviceName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.manufacturer.toLowerCase().includes(q) ||
        d.model.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeFilterCount = [typeFilter, statusFilter].filter((f) => f !== "All").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Device Management</h1>
          <p className="text-base text-muted-foreground mt-1">Register and manage biomedical device master records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 text-sm font-semibold">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            className="text-white border-0 h-11 text-sm font-semibold px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onCreate}
          >
            <Plus className="w-5 h-5 mr-2" /> Register Device
          </Button>
        </div>
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-2.5">
        {deviceTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              typeFilter === t
                ? "bg-[#00BCD4] text-white shadow-md"
                : "bg-card text-foreground border border-border hover:border-[#00BCD4] hover:text-[#00BCD4]"
            }`}
          >
            {t}
            {t !== "All" && (
              <span className="ml-1.5 text-xs opacity-75">({mockDevices.filter((d) => d.deviceType === t).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, model, manufacturer..."
              className="pl-11 h-11 bg-card border-border text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            className={`h-11 text-sm font-semibold px-4 ${showFilters ? "text-white border-0" : ""}`}
            style={showFilters ? { background: "linear-gradient(135deg, #00BCD4, #00838F)" } : undefined}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-white text-[#00BCD4] text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">Status Filter</h3>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setTypeFilter("All"); setStatusFilter("All"); }} className="text-sm font-semibold text-[#00BCD4] hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["All", "Active", "Draft", "Inactive"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      statusFilter === s
                        ? "bg-[#00BCD4] text-white border-[#00BCD4]"
                        : "bg-card text-foreground border-border hover:border-[#00BCD4]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-border bg-muted/30">
                  <TableHead className="font-bold text-foreground">Device ID</TableHead>
                  <TableHead className="font-bold text-foreground">Device Name</TableHead>
                  <TableHead className="font-bold text-foreground">Type</TableHead>
                  <TableHead className="font-bold text-foreground">Manufacturer</TableHead>
                  <TableHead className="font-bold text-foreground">Model</TableHead>
                  <TableHead className="font-bold text-foreground">Risk Class</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Assets</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Cpu className="w-10 h-10 text-muted-foreground/40" />
                        <p className="text-base font-semibold text-foreground">No devices found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((d) => (
                    <TableRow key={d.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                      <TableCell className="font-mono font-bold text-[#00BCD4] text-sm">{d.id}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">{d.deviceName}</TableCell>
                      <TableCell className="text-sm text-foreground">{d.deviceType}</TableCell>
                      <TableCell className="text-sm text-foreground">{d.manufacturer}</TableCell>
                      <TableCell className="text-sm text-foreground">{d.model}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${riskBadge[d.riskClass] || ""}`}>{d.riskClass}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[d.status]}`}>{d.status}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold">{d.linkedAssets}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]" title="Edit" onClick={() => onEdit(d.id)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]" title="View" onClick={() => onView(d.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(d.id)}>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(d.id)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit Device
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Device Registration Form -----
function DeviceRegistrationForm({
  onBack,
  editId,
}: {
  onBack: () => void;
  editId?: string | null;
}) {
  const [docsOpen, setDocsOpen] = useState(true);
  const [servicesOpen, setServicesOpen] = useState(true);
  const isEdit = !!editId;
  const device = isEdit ? mockDevices.find((d) => d.id === editId) : null;

  // Form state - all controlled inputs
  const [form, setForm] = useState({
    deviceName: device?.deviceName || "",
    genericName: "",
    deviceType: device?.deviceType || "",
    deviceModel: device?.model || "",
    ecri: "",
    manufacturer: device?.manufacturer || "",
    modelNumber: "",
    catalogNumber: "",
    country: device?.country || "",
    riskClass: device?.riskClass || "",
    lifespan: device?.lifespan || "",
    regulatoryApproval: "",
    description: "",
    // Organization / Location
    orgId: "",
    departmentName: "",
    // Technical specs - Power
    powerRating: "",
    powerRatingTypical: "",
    powerRatingMax: "",
    inletPower: "",
    voltage: "",
    equipmentClass: "",
    equipmentType: "",
    powerSupplyType: "",
    // Technical specs - Physical
    weight: "",
    dimensions: "",
    operatingTemp: "",
    connectivity: "",
    // Depreciation
    depMethod: "",
    usefulLife: "",
    salvageValue: "",
    depRate: "",
    depFrequency: "",
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ----- Service Mapping state -----
  const [services, setServices] = useState<ServiceMapping[]>(
    isEdit
      ? [
          { id: "SVC-001", serviceName: "CT Brain", himsProcedureCode: "RAD_CT_BRAIN", price: 1800, effectiveFrom: "2026-02-01", effectiveTo: "", active: true },
          { id: "SVC-002", serviceName: "CT Head", himsProcedureCode: "RAD_CT_HEAD", price: 2200, effectiveFrom: "2026-02-01", effectiveTo: "", active: true },
          { id: "SVC-003", serviceName: "CT Abdomen", himsProcedureCode: "RAD_CT_ABDOMEN", price: 3500, effectiveFrom: "2026-01-15", effectiveTo: "2026-12-31", active: true },
          { id: "SVC-004", serviceName: "CT Chest (HRCT)", himsProcedureCode: "RAD_CT_HRCT", price: 2800, effectiveFrom: "2026-03-01", effectiveTo: "", active: false },
        ]
      : [],
  );
  const [showSvcDialog, setShowSvcDialog] = useState(false);
  const [editSvcId, setEditSvcId] = useState<string | null>(null);
  const [svcName, setSvcName] = useState("");
  const [svcHimsCode, setSvcHimsCode] = useState("");
  const [svcPrice, setSvcPrice] = useState("");
  const [svcFrom, setSvcFrom] = useState("");
  const [svcTo, setSvcTo] = useState("");
  const [svcActive, setSvcActive] = useState(true);
  const [svcError, setSvcError] = useState("");

  const resetSvcForm = () => {
    setEditSvcId(null);
    setSvcName(""); setSvcHimsCode(""); setSvcPrice(""); setSvcFrom(""); setSvcTo(""); setSvcActive(true); setSvcError("");
  };

  const openEditSvc = (svc: ServiceMapping) => {
    setEditSvcId(svc.id);
    setSvcName(svc.serviceName);
    setSvcHimsCode(svc.himsProcedureCode);
    setSvcPrice(String(svc.price));
    setSvcFrom(svc.effectiveFrom);
    setSvcTo(svc.effectiveTo);
    setSvcActive(svc.active);
    setSvcError("");
    setShowSvcDialog(true);
  };

  const saveSvc = () => {
    const name = svcName.trim();
    const code = svcHimsCode.trim();
    const price = parseFloat(svcPrice);

    if (!name) { setSvcError("Service Name is required."); return; }
    if (!code) { setSvcError("HIMS Procedure Code is required."); return; }
    if (!svcPrice || isNaN(price) || price <= 0) { setSvcError("Standard Price must be greater than 0."); return; }

    // Duplicate checks (exclude current row when editing)
    const nameDup = services.find((s) => s.serviceName.toLowerCase() === name.toLowerCase() && s.id !== editSvcId);
    if (nameDup) { setSvcError(`Duplicate: "${name}" already exists for this device.`); return; }
    const codeDup = services.find((s) => s.himsProcedureCode === code && s.id !== editSvcId);
    if (codeDup) { setSvcError(`Duplicate: HIMS Code "${code}" already mapped to "${codeDup.serviceName}".`); return; }

    if (editSvcId) {
      setServices((prev) =>
        prev.map((s) => s.id === editSvcId ? { ...s, serviceName: name, himsProcedureCode: code, price, effectiveFrom: svcFrom, effectiveTo: svcTo, active: svcActive } : s),
      );
    } else {
      setServices((prev) => [
        ...prev,
        { id: `SVC-${Date.now()}`, serviceName: name, himsProcedureCode: code, price, effectiveFrom: svcFrom, effectiveTo: svcTo, active: svcActive },
      ]);
    }
    resetSvcForm();
    setShowSvcDialog(false);
  };

  const deleteSvc = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // ----- Documents state (category-based, matches Asset Registration design) -----
  const [docCategories, setDocCategories] = useState(defaultDocCategories);
  const [docFiles, setDocFiles] = useState<Record<string, string[]>>({});
  const [showDocCatForm, setShowDocCatForm] = useState(false);
  const [newDocCatName, setNewDocCatName] = useState("");
  const [newDocCatDesc, setNewDocCatDesc] = useState("");
  const [newDocCatFormats, setNewDocCatFormats] = useState("PDF, DOC");

  const simulateDocUpload = (catName: string) => {
    setDocFiles((prev) => ({
      ...prev,
      [catName]: [...(prev[catName] || []), `${catName.replace(/\s+/g, "_")}_${Date.now()}.pdf`],
    }));
  };

  const removeDocFile = (catName: string, fileIdx: number) => {
    setDocFiles((prev) => ({
      ...prev,
      [catName]: prev[catName].filter((_, i) => i !== fileIdx),
    }));
  };

  const addDocCategory = () => {
    if (!newDocCatName.trim()) return;
    setDocCategories((prev) => [...prev, { name: newDocCatName.trim(), desc: newDocCatDesc.trim() || "Custom document category", formats: newDocCatFormats.trim() || "PDF, DOC" }]);
    setNewDocCatName(""); setNewDocCatDesc(""); setNewDocCatFormats("PDF, DOC"); setShowDocCatForm(false);
  };

  const removeDocCategory = (catName: string) => {
    setDocCategories((prev) => prev.filter((c) => c.name !== catName));
    setDocFiles((prev) => { const next = { ...prev }; delete next[catName]; return next; });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {isEdit ? `Edit Device — ${device?.deviceName || editId}` : "Register New Device"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEdit ? "Update the device master record" : "Create a new device master entry for the catalog"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 text-sm font-semibold gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button
            className="text-white border-0 h-10 text-sm font-semibold gap-2 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          >
            <Send className="w-4 h-4" /> Submit
          </Button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-8">
        {/* General Information */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Device Name" required>
                <Input className="h-10" placeholder="e.g. MRI Scanner" value={form.deviceName} onChange={(e) => updateField("deviceName", e.target.value)} />
              </FormField>
              <FormField label="Device Type" required>
                <Select value={form.deviceType} onValueChange={(v) => updateField("deviceType", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {deviceTypes.filter((t) => t !== "All").map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Generic Name" required>
                <Input className="h-10" placeholder="e.g. Magnetic Resonance Imaging System" value={form.genericName} onChange={(e) => updateField("genericName", e.target.value)} />
              </FormField>
              <FormField label="Device Model" required>
                <Input className="h-10" placeholder="e.g. Magnetom Vida 3T" value={form.deviceModel} onChange={(e) => updateField("deviceModel", e.target.value)} />
              </FormField>
              <FormField label="ECRI Code">
                <Input className="h-10" placeholder="e.g. 18-483" value={form.ecri} onChange={(e) => updateField("ecri", e.target.value)} />
              </FormField>
              <FormField label="Manufacturer" required>
                <Input className="h-10" placeholder="e.g. Siemens Healthineers" value={form.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
              </FormField>
              <FormField label="Model Number">
                <Input className="h-10" placeholder="e.g. MV-3T-2024" value={form.modelNumber} onChange={(e) => updateField("modelNumber", e.target.value)} />
              </FormField>
              <FormField label="Catalog Number">
                <Input className="h-10" placeholder="e.g. CAT-MRI-001" value={form.catalogNumber} onChange={(e) => updateField("catalogNumber", e.target.value)} />
              </FormField>
              <FormField label="Country of Origin" required>
                <Select value={form.country} onValueChange={(v) => updateField("country", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {["India", "USA", "Germany", "Japan", "China", "Netherlands", "Israel", "South Korea", "UK", "France", "Italy", "Switzerland"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Risk Classification" required>
                <Select value={form.riskClass} onValueChange={(v) => updateField("riskClass", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class I">Class I - Low Risk</SelectItem>
                    <SelectItem value="Class II">Class II - Medium Risk</SelectItem>
                    <SelectItem value="Class III">Class III - High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Expected Lifespan">
                <Input className="h-10" placeholder="e.g. 10 years" value={form.lifespan} onChange={(e) => updateField("lifespan", e.target.value)} />
              </FormField>
              <FormField label="Regulatory Approval">
                <Input className="h-10" placeholder="e.g. FDA, CE, CDSCO" value={form.regulatoryApproval} onChange={(e) => updateField("regulatoryApproval", e.target.value)} />
              </FormField>
            </div>

            {/* Organization / Department Assignment */}
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-[#00BCD4]" />
                <h4 className="text-sm font-bold text-foreground">Organization & Department</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Hospital / Clinic / Organization" required>
                  <Select value={form.orgId} onValueChange={(v) => updateField("orgId", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select organization" /></SelectTrigger>
                    <SelectContent>
                      {orgOptions.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <span className="font-semibold">{org.name}</span>
                          <span className="text-muted-foreground ml-1.5 font-mono text-[10px]">{org.code}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Department Name">
                  <Select value={form.departmentName} onValueChange={(v) => updateField("departmentName", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {["Radiology", "Cardiology", "ICU", "Emergency", "OPD", "General Surgery OT", "Cardiac Surgery OT", "Neuro Surgery OT", "CSSD", "Laboratory", "Pathology", "Physiotherapy"].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            {/* Description */}
            <div className="mt-5 pt-4 border-t border-border">
              <FormField label="Description" required>
                <Textarea className="min-h-[80px]" placeholder="Enter device description, purpose, and key features..." value={form.description} onChange={(e) => updateField("description", e.target.value)} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Technical Specifications */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
              Technical Specifications
            </h3>

            {/* Power & Electrical */}
            <h4 className="text-sm font-bold text-foreground mb-3">Power & Electrical</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <FormField label="Power Rating">
                <Input className="h-10" placeholder="e.g. 5 kVA" value={form.powerRating} onChange={(e) => updateField("powerRating", e.target.value)} />
              </FormField>
              <FormField label="Power Rating Typical">
                <Input className="h-10" placeholder="e.g. 3.5 kVA" value={form.powerRatingTypical} onChange={(e) => updateField("powerRatingTypical", e.target.value)} />
              </FormField>
              <FormField label="Power Rating Max">
                <Input className="h-10" placeholder="e.g. 8 kVA" value={form.powerRatingMax} onChange={(e) => updateField("powerRatingMax", e.target.value)} />
              </FormField>
              <FormField label="Inlet Power">
                <Select value={form.inletPower} onValueChange={(v) => updateField("inletPower", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select inlet power" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-phase">Single Phase</SelectItem>
                    <SelectItem value="three-phase">Three Phase</SelectItem>
                    <SelectItem value="dc">DC Power</SelectItem>
                    <SelectItem value="battery">Battery Operated</SelectItem>
                    <SelectItem value="ups-backed">UPS Backed</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Voltage">
                <Select value={form.voltage} onValueChange={(v) => updateField("voltage", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select voltage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="110V">110V</SelectItem>
                    <SelectItem value="220V">220V</SelectItem>
                    <SelectItem value="230V">230V</SelectItem>
                    <SelectItem value="240V">240V</SelectItem>
                    <SelectItem value="415V">415V (3-Phase)</SelectItem>
                    <SelectItem value="12V-DC">12V DC</SelectItem>
                    <SelectItem value="24V-DC">24V DC</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Power Supply Type">
                <Select value={form.powerSupplyType} onValueChange={(v) => updateField("powerSupplyType", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ac-mains">AC Mains</SelectItem>
                    <SelectItem value="battery">Battery</SelectItem>
                    <SelectItem value="dual">Dual (AC + Battery)</SelectItem>
                    <SelectItem value="solar">Solar</SelectItem>
                    <SelectItem value="ups">UPS</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Equipment Classification */}
            <h4 className="text-sm font-bold text-foreground mb-3">Equipment Classification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <FormField label="Equipment Class">
                <Select value={form.equipmentClass} onValueChange={(v) => updateField("equipmentClass", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class-i">Class I - Basic Insulation + Earth</SelectItem>
                    <SelectItem value="class-ii">Class II - Double / Reinforced Insulation</SelectItem>
                    <SelectItem value="class-iii">Class III - Safety Extra-Low Voltage</SelectItem>
                    <SelectItem value="ip-rated">IP Rated</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Equipment Type">
                <Select value={form.equipmentType} onValueChange={(v) => updateField("equipmentType", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="type-b">Type B - Body Contact</SelectItem>
                    <SelectItem value="type-bf">Type BF - Body Floating</SelectItem>
                    <SelectItem value="type-cf">Type CF - Cardiac Floating</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            {/* Physical Specifications */}
            <h4 className="text-sm font-bold text-foreground mb-3">Physical Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Weight">
                <Input className="h-10" placeholder="e.g. 2500 kg" value={form.weight} onChange={(e) => updateField("weight", e.target.value)} />
              </FormField>
              <FormField label="Dimensions">
                <Input className="h-10" placeholder="e.g. 250 x 170 x 200 cm" value={form.dimensions} onChange={(e) => updateField("dimensions", e.target.value)} />
              </FormField>
              <FormField label="Operating Temperature">
                <Input className="h-10" placeholder="e.g. 18-24°C" value={form.operatingTemp} onChange={(e) => updateField("operatingTemp", e.target.value)} />
              </FormField>
              <FormField label="Connectivity">
                <Input className="h-10" placeholder="e.g. DICOM, HL7, Wi-Fi" value={form.connectivity} onChange={(e) => updateField("connectivity", e.target.value)} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Device Image & Depreciation */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Device Image Section */}
            <DeviceImageSection />

            {/* Depreciation Configuration */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-base font-extrabold text-foreground mb-5">
                Depreciation Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <FormField label="Method">
                  <Select value={form.depMethod} onValueChange={(v) => updateField("depMethod", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight-line">Straight Line</SelectItem>
                      <SelectItem value="declining-balance">Declining Balance</SelectItem>
                      <SelectItem value="sum-of-years">Sum of Years</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Useful Life">
                  <Input className="h-10" placeholder="e.g. 10 years" value={form.usefulLife} onChange={(e) => updateField("usefulLife", e.target.value)} />
                </FormField>
                <FormField label="Salvage Value">
                  <Input className="h-10" placeholder="e.g. 50000" value={form.salvageValue} onChange={(e) => updateField("salvageValue", e.target.value)} />
                </FormField>
                <FormField label="Rate (%)">
                  <Input className="h-10" placeholder="e.g. 10" value={form.depRate} onChange={(e) => updateField("depRate", e.target.value)} />
                </FormField>
                <FormField label="Frequency">
                  <Select value={form.depFrequency} onValueChange={(v) => updateField("depFrequency", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section – category-based (matches Asset Registration design) */}
        <Collapsible open={docsOpen} onOpenChange={setDocsOpen}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-2.5">
                    <FolderOpen className="w-5 h-5 text-[#00BCD4]" />
                    <h3 className="text-base font-extrabold text-foreground">Documents</h3>
                    {Object.keys(docFiles).filter((k) => docFiles[k]?.length > 0).length > 0 && (
                      <Badge className="bg-[#10B981]/10 text-[#10B981] border-0 text-xs font-bold">
                        {Object.keys(docFiles).filter((k) => docFiles[k]?.length > 0).length}/{docCategories.length}
                      </Badge>
                    )}
                  </div>
                  {docsOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Upload documents by category. Click the upload area or drag and drop files.</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {Object.keys(docFiles).filter((k) => docFiles[k]?.length > 0).length} of {docCategories.length} categories have uploads
                      </p>
                    </div>
                    <Button variant="outline" className="text-xs font-semibold h-9 px-4 gap-1.5" onClick={() => setShowDocCatForm(!showDocCatForm)}>
                      <Plus className="w-3.5 h-3.5" /> Additional Category
                    </Button>
                  </div>

                  {/* Add Custom Category Inline Form */}
                  {showDocCatForm && (
                    <div className="rounded-xl border-2 border-dashed border-[#00BCD4]/40 bg-[#00BCD4]/5 p-5 mb-4">
                      <h4 className="text-sm font-bold text-foreground mb-4">Add New Document Category</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Category Name" required>
                          <Input className="h-10" placeholder="e.g. Warranty Certificate" value={newDocCatName} onChange={(e) => setNewDocCatName(e.target.value)} />
                        </FormField>
                        <FormField label="Description">
                          <Input className="h-10" placeholder="e.g. Equipment warranty documents" value={newDocCatDesc} onChange={(e) => setNewDocCatDesc(e.target.value)} />
                        </FormField>
                        <FormField label="Accepted Formats">
                          <Input className="h-10" placeholder="e.g. PDF, DOC, XLS" value={newDocCatFormats} onChange={(e) => setNewDocCatFormats(e.target.value)} />
                        </FormField>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button className="text-white border-0 text-xs font-semibold h-9 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} disabled={!newDocCatName.trim()} onClick={addDocCategory}>
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                        </Button>
                        <Button variant="outline" className="text-xs font-semibold h-9 px-4" onClick={() => { setShowDocCatForm(false); setNewDocCatName(""); setNewDocCatDesc(""); setNewDocCatFormats("PDF, DOC"); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Category rows – alternating left/right layout */}
                  <div className="flex flex-col gap-3">
                    {docCategories.map((cat, idx) => {
                      const isEven = idx % 2 === 0;
                      const files = docFiles[cat.name] || [];
                      const hasFiles = files.length > 0;
                      const isCustom = !defaultDocCategories.some((d) => d.name === cat.name);

                      return (
                        <div key={cat.name} className={cn(
                          "flex rounded-xl border overflow-hidden transition-all",
                          hasFiles ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-border",
                          isEven ? "flex-row" : "flex-row-reverse",
                        )}>
                          {/* Info side */}
                          <div className={cn("flex-1 p-4 flex flex-col justify-center", isEven ? "pr-2" : "pl-2")}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0",
                                hasFiles ? "bg-[#10B981] text-white" : "bg-muted text-muted-foreground",
                              )}>
                                {hasFiles ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                              </span>
                              <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                              {isCustom && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00BCD4]/10 text-[#00BCD4]">Custom</span>
                              )}
                              {isCustom && (
                                <button className="ml-auto text-muted-foreground hover:text-[#EF4444] transition-colors" onClick={() => removeDocCategory(cat.name)} title="Remove category">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className={cn("text-xs text-muted-foreground ml-8", isEven ? "text-left" : "text-right")}>{cat.desc}</p>
                            {hasFiles && (
                              <div className={cn("flex flex-wrap gap-1.5 mt-2 ml-8", isEven ? "justify-start" : "justify-end")}>
                                {files.map((f, fIdx) => (
                                  <span key={fIdx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground">
                                    <FileText className="w-3 h-3 text-[#00BCD4]" />
                                    {f.length > 25 ? f.substring(0, 25) + "..." : f}
                                    <button className="ml-0.5 text-muted-foreground hover:text-[#EF4444]" onClick={() => removeDocFile(cat.name, fIdx)}>
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Upload zone side */}
                          <div
                            className={cn(
                              "w-48 shrink-0 border-dashed flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors group",
                              isEven ? "border-l" : "border-r",
                              hasFiles ? "border-[#10B981]/30 hover:border-[#10B981]" : "border-border hover:border-[#00BCD4]",
                            )}
                            onClick={() => simulateDocUpload(cat.name)}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                              hasFiles ? "bg-[#10B981]/10 group-hover:bg-[#10B981]/20" : "bg-muted group-hover:bg-[#00BCD4]/10",
                            )}>
                              <Upload className={cn("w-4 h-4 transition-colors", hasFiles ? "text-[#10B981]" : "text-muted-foreground group-hover:text-[#00BCD4]")} />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground text-center">
                              {hasFiles ? "Add more" : "Drop file here"}
                            </span>
                            <span className="text-xs text-muted-foreground">{cat.formats}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        {/* Service Mapping */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center gap-2.5">
                    <Stethoscope className="w-5 h-5 text-[#00BCD4]" />
                    <h3 className="text-base font-extrabold text-foreground">Service Mapping</h3>
                    {services.length > 0 && (
                      <Badge className="bg-[#00BCD4]/10 text-[#00BCD4] border-0 text-xs font-bold">{services.length}</Badge>
                    )}
                  </div>
                  {servicesOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">Map the services / procedures this device can perform with their HIMS codes and pricing.</p>
                    <Button
                      className="text-white border-0 h-9 text-xs font-semibold gap-1.5 px-4"
                      style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                      onClick={() => { resetSvcForm(); setShowSvcDialog(true); }}
                    >
                      <Plus className="w-4 h-4" /> Add Service
                    </Button>
                  </div>

                  {services.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-xl py-12 flex flex-col items-center gap-3">
                      <Stethoscope className="w-10 h-10 text-muted-foreground/30" />
                      <p className="text-sm font-semibold text-foreground">No services mapped yet</p>
                      <p className="text-xs text-muted-foreground">Click "Add Service" to map procedures this device can perform</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#1B2A3D]">
                            <TableHead className="text-white font-bold text-xs">Sl.</TableHead>
                            <TableHead className="text-white font-bold text-xs">Service Name</TableHead>
                            <TableHead className="text-white font-bold text-xs">HIMS Code</TableHead>
                            <TableHead className="text-white font-bold text-xs text-right">Price</TableHead>
                            <TableHead className="text-white font-bold text-xs">Effective From</TableHead>
                            <TableHead className="text-white font-bold text-xs">Effective To</TableHead>
                            <TableHead className="text-white font-bold text-xs text-center">Status</TableHead>
                            <TableHead className="text-white font-bold text-xs text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {services.map((svc, idx) => (
                            <TableRow key={svc.id} className="hover:bg-muted/20">
                              <TableCell className="text-xs font-semibold text-muted-foreground">{idx + 1}</TableCell>
                              <TableCell className="text-xs font-bold text-foreground">{svc.serviceName}</TableCell>
                              <TableCell>
                                <code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">{svc.himsProcedureCode}</code>
                              </TableCell>
                              <TableCell className="text-xs font-bold text-foreground text-right font-mono">
                                {svc.price.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 })}
                              </TableCell>
                              <TableCell className="text-xs text-foreground">{svc.effectiveFrom || "-"}</TableCell>
                              <TableCell className="text-xs text-foreground">{svc.effectiveTo || "-"}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={cn("text-[10px] font-bold border-0 px-2.5", svc.active ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]")}>
                                  {svc.active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-[#00BCD4]" title="Edit" onClick={() => openEditSvc(svc)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" title="Delete" onClick={() => deleteSvc(svc.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        {/* Add/Edit Service Dialog */}
        <Dialog open={showSvcDialog} onOpenChange={(o) => { if (!o) resetSvcForm(); setShowSvcDialog(o); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#00BCD4]" />
                {editSvcId ? "Edit Service" : "Add Service"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {svcError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {svcError}
                </div>
              )}

              <FormField label="Service Name" required>
                <Input className="h-10" placeholder="e.g. CT Brain, CT Head, MRI Knee" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
              </FormField>

              <FormField label="HIMS Procedure Code" required>
                <Input className="h-10 font-mono" placeholder="e.g. RAD_CT_BRAIN" value={svcHimsCode} onChange={(e) => setSvcHimsCode(e.target.value.toUpperCase())} />
                <p className="text-[10px] text-muted-foreground -mt-1">Required for future HIMS API integration. Must be unique per device.</p>
              </FormField>

              <FormField label="Standard Price" required>
                <Input className="h-10 font-mono" type="number" min="1" step="0.01" placeholder="e.g. 1800" value={svcPrice} onChange={(e) => setSvcPrice(e.target.value)} />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Effective From">
                  <Input className="h-10" type="date" value={svcFrom} onChange={(e) => setSvcFrom(e.target.value)} />
                </FormField>
                <FormField label="Effective To">
                  <Input className="h-10" type="date" value={svcTo} onChange={(e) => setSvcTo(e.target.value)} />
                </FormField>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-foreground">Active</p>
                  <p className="text-[10px] text-muted-foreground">Only active services are visible to HIMS</p>
                </div>
                <Switch checked={svcActive} onCheckedChange={setSvcActive} />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" className="h-10 text-sm font-semibold" onClick={() => { resetSvcForm(); setShowSvcDialog(false); }}>Cancel</Button>
              <Button
                className="text-white border-0 h-10 text-sm font-semibold gap-1.5 px-5"
                style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                onClick={saveSvc}
              >
                <Save className="w-4 h-4" /> {editSvcId ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ----- Main Exported Page -----
export function DeviceManagementPage() {
  const [view, setView] = useState<"list" | "create" | "edit" | "view">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (view === "create" || view === "edit") {
    return (
      <DeviceRegistrationForm
        onBack={() => { setView("list"); setSelectedId(null); }}
        editId={view === "edit" ? selectedId : null}
      />
    );
  }

  return (
    <DeviceListView
      onCreate={() => setView("create")}
      onEdit={(id) => { setSelectedId(id); setView("edit"); }}
      onView={(id) => { setSelectedId(id); setView("edit"); }}
    />
  );
}
