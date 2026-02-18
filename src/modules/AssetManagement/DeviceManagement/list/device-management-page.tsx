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
} from "lucide-react";
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
    manufacturer: device?.manufacturer || "",
    model: device?.model || "",
    country: device?.country || "",
    riskClass: device?.riskClass || "",
    lifespan: device?.lifespan || "",
    regulatoryApproval: "",
    description: "",
    // Technical specs
    powerReq: "",
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
              <FormField label="Generic Name">
                <Input className="h-10" placeholder="e.g. Magnetic Resonance Imaging System" value={form.genericName} onChange={(e) => updateField("genericName", e.target.value)} />
              </FormField>
              <FormField label="Device Type" required>
                <Select value={form.deviceType} onValueChange={(v) => updateField("deviceType", v)}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {["Imaging", "Life Support", "Patient Monitoring", "Therapeutic", "Sterilization", "Laboratory", "Surgical"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Manufacturer" required>
                <Input className="h-10" placeholder="e.g. Siemens Healthineers" value={form.manufacturer} onChange={(e) => updateField("manufacturer", e.target.value)} />
              </FormField>
              <FormField label="Model" required>
                <Input className="h-10" placeholder="e.g. Magnetom Vida 3T" value={form.model} onChange={(e) => updateField("model", e.target.value)} />
              </FormField>
              <FormField label="Country of Origin">
                <Input className="h-10" placeholder="e.g. Germany" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
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

            {/* Description */}
            <div className="mt-5">
              <FormField label="Description">
                <Textarea className="min-h-[80px]" placeholder="Enter device description..." value={form.description} onChange={(e) => updateField("description", e.target.value)} />
              </FormField>
            </div>

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

        {/* Technical Specifications */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField label="Power Requirements">
                <Input className="h-10" placeholder="e.g. 220V / 50Hz / 30A" value={form.powerReq} onChange={(e) => updateField("powerReq", e.target.value)} />
              </FormField>
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

        {/* Documents Section */}
        <Collapsible open={docsOpen} onOpenChange={setDocsOpen}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <h3 className="text-base font-extrabold text-foreground">Documents</h3>
                  {docsOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Upload device master documents such as user manuals, service manuals, and regulatory certificates.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {["User Manual", "Service Manual", "Regulatory Certificate", "Spare Parts Catalog"].map((doc) => (
                      <div key={doc} className="flex flex-col gap-2">
                        <p className="text-sm font-bold text-foreground">{doc}</p>
                        <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center min-h-[100px] cursor-pointer hover:border-[#00BCD4]/50 hover:bg-[#00BCD4]/5 transition-all border-border">
                          <Upload className="w-6 h-6 text-muted-foreground/50 mb-2" />
                          <span className="text-xs text-muted-foreground font-medium">Click to upload</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        {/* Service Providers */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left">
                  <h3 className="text-base font-extrabold text-foreground">Service Providers / AMC/CMC</h3>
                  {servicesOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">Add authorized service providers, AMC, or CMC details.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField label="Service Provider">
                      <Input className="h-10" placeholder="e.g. Siemens Technical Services" />
                    </FormField>
                    <FormField label="Contract Type">
                      <Select>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amc">AMC (Annual Maintenance)</SelectItem>
                          <SelectItem value="cmc">CMC (Comprehensive)</SelectItem>
                          <SelectItem value="warranty">Under Warranty</SelectItem>
                          <SelectItem value="on-call">On-Call Basis</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Contact Number">
                      <Input className="h-10" placeholder="e.g. +91 9876543210" />
                    </FormField>
                    <FormField label="Email">
                      <Input className="h-10" placeholder="e.g. service@vendor.com" />
                    </FormField>
                    <FormField label="Contract Start">
                      <Input className="h-10" type="date" />
                    </FormField>
                    <FormField label="Contract End">
                      <Input className="h-10" type="date" />
                    </FormField>
                  </div>
                  <Button variant="outline" className="mt-4 text-sm font-semibold gap-2">
                    <Plus className="w-4 h-4" /> Add Another Provider
                  </Button>
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
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
