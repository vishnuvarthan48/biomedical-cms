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
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Pencil,
  MoreVertical,
  Warehouse,
  Download,
  X,
  Save,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRightLeft,
  FileText,
  Info,
} from "lucide-react";

// ----- Types -----
interface BiomedicalStore {
  id: string;
  hospital: string;
  storeName: string;
  stockSource: "Direct Purchase" | "External ERP" | "Both";
  contactPerson: string;
  location: string;
  status: "Active" | "Inactive";
  isDefault: boolean;
  remarks: string;
  createdAt: string;
}

// ----- Mock Data -----
const mockStores: BiomedicalStore[] = [
  {
    id: "BSTR-001",
    hospital: "Apollo Hospital - Chennai",
    storeName: "Biomedical Spares Store",
    stockSource: "Both",
    contactPerson: "Rajesh Kumar",
    location: "Block B, Ground Floor",
    status: "Active",
    isDefault: true,
    remarks: "Primary biomedical store for Chennai campus",
    createdAt: "2025-01-10",
  },
  {
    id: "BSTR-002",
    hospital: "Apollo Hospital - Delhi",
    storeName: "Biomedical Store - ICU Wing",
    stockSource: "Direct Purchase",
    contactPerson: "Sunil Mehta",
    location: "ICU Building, Basement",
    status: "Active",
    isDefault: true,
    remarks: "Dedicated store for ICU equipment spares",
    createdAt: "2025-02-15",
  },
  {
    id: "BSTR-003",
    hospital: "Apollo Hospital - Bangalore",
    storeName: "Biomedical Store",
    stockSource: "External ERP",
    contactPerson: "Priya Nair",
    location: "Maintenance Block",
    status: "Active",
    isDefault: true,
    remarks: "Stock received only from ERP transfers",
    createdAt: "2025-03-20",
  },
  {
    id: "BSTR-004",
    hospital: "Apollo Hospital - Chennai",
    storeName: "OT Equipment Store",
    stockSource: "Direct Purchase",
    contactPerson: "Anand S",
    location: "OT Complex, Level 2",
    status: "Inactive",
    isDefault: false,
    remarks: "OT-specific spares sub-store",
    createdAt: "2025-04-05",
  },
  {
    id: "BSTR-005",
    hospital: "Apollo Hospital - Hyderabad",
    storeName: "Biomedical Consumables Store",
    stockSource: "Both",
    contactPerson: "Venkat R",
    location: "Block A, Room 102",
    status: "Active",
    isDefault: true,
    remarks: "",
    createdAt: "2025-05-12",
  },
];

const stockSourceConfig: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  "Direct Purchase": {
    label: "Direct Purchase",
    bg: "bg-[#8B5CF6]/10",
    text: "text-[#8B5CF6]",
    icon: FileText,
  },
  "External ERP": {
    label: "External ERP",
    bg: "bg-[#00BCD4]/10",
    text: "text-[#00BCD4]",
    icon: ArrowRightLeft,
  },
  Both: {
    label: "Both (Purchase + ERP)",
    bg: "bg-[#10B981]/10",
    text: "text-[#10B981]",
    icon: ShieldCheck,
  },
};

// ----- Helper: FormField -----
function FormField({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-sm font-bold text-foreground">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ----- Main Export -----
export function StoreMasterPage() {
  const [stores, setStores] = useState<BiomedicalStore[]>(mockStores);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [fHospital, setFHospital] = useState("");
  const [fName, setFName] = useState("");
  const [fSource, setFSource] = useState("");
  const [fContact, setFContact] = useState("");
  const [fLocation, setFLocation] = useState("");
  const [fStatus, setFStatus] = useState("Active");
  const [fDefault, setFDefault] = useState(false);
  const [fRemarks, setFRemarks] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setFHospital("");
    setFName("");
    setFSource("");
    setFContact("");
    setFLocation("");
    setFStatus("Active");
    setFDefault(false);
    setFRemarks("");
    setEditingId(null);
    setFormError("");
    setShowModal(false);
  };

  const openAdd = () => {
    setFHospital("");
    setFName("");
    setFSource("");
    setFContact("");
    setFLocation("");
    setFStatus("Active");
    setFDefault(false);
    setFRemarks("");
    setEditingId(null);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (store: BiomedicalStore) => {
    setFHospital(store.hospital);
    setFName(store.storeName);
    setFSource(store.stockSource);
    setFContact(store.contactPerson);
    setFLocation(store.location);
    setFStatus(store.status);
    setFDefault(store.isDefault);
    setFRemarks(store.remarks);
    setEditingId(store.id);
    setFormError("");
    setShowModal(true);
  };

  const handleSave = () => {
    setFormError("");
    if (!fHospital) {
      setFormError("Hospital / Clinic is required.");
      return;
    }
    if (!fName.trim()) {
      setFormError("Store Name is required.");
      return;
    }
    if (!fSource) {
      setFormError("Stock Source is required.");
      return;
    }

    if (editingId) {
      setStores((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                hospital: fHospital,
                storeName: fName.trim(),
                stockSource: fSource as BiomedicalStore["stockSource"],
                contactPerson: fContact.trim(),
                location: fLocation.trim(),
                status: fStatus as BiomedicalStore["status"],
                isDefault: fDefault,
                remarks: fRemarks.trim(),
              }
            : s,
        ),
      );
    } else {
      setStores((prev) => [
        ...prev,
        {
          id: `BSTR-${String(prev.length + 1).padStart(3, "0")}`,
          hospital: fHospital,
          storeName: fName.trim(),
          stockSource: fSource as BiomedicalStore["stockSource"],
          contactPerson: fContact.trim(),
          location: fLocation.trim(),
          status: fStatus as BiomedicalStore["status"],
          isDefault: fDefault,
          remarks: fRemarks.trim(),
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    resetForm();
  };

  const filtered = stores.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource =
      filterSource === "all" || s.stockSource === filterSource;
    return matchesSearch && matchesSource;
  });

  const activeCount = stores.filter((s) => s.status === "Active").length;
  const directCount = stores.filter(
    (s) => s.stockSource === "Direct Purchase" || s.stockSource === "Both",
  ).length;
  const erpCount = stores.filter(
    (s) => s.stockSource === "External ERP" || s.stockSource === "Both",
  ).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Biomedical Store Master
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Configure biomedical sub-stores for spare parts and consumables used
            in asset maintenance
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold px-5 py-2.5 h-auto"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={openAdd}
        >
          <Plus className="w-5 h-5 mr-2" /> Add Biomedical Store
        </Button>
      </div>

      {/* Context Banner */}
      <div className="rounded-xl border border-[#00BCD4]/20 bg-[#00BCD4]/5 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
        <div className="text-sm text-foreground leading-relaxed">
          <span className="font-bold">Biomedical stock only.</span> This module
          manages sub-stores exclusively for biomedical spares and consumables
          needed for asset maintenance. Stock enters via{" "}
          <span className="font-bold text-[#8B5CF6]">Direct Purchase</span>{" "}
          (with invoice) or{" "}
          <span className="font-bold text-[#00BCD4]">
            External ERP Transfer
          </span>{" "}
          (from the client{"'"}s main ERP store). This does not replace the
          client{"'"}s full inventory system.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #00BCD4, #00838F)",
              }}
            >
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {stores.length}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                Total Stores
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#10B981]/10">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {activeCount}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                Active Stores
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#8B5CF6]/10">
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {directCount}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                Direct Purchase
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#00BCD4]/10">
              <ArrowRightLeft className="w-5 h-5 text-[#00BCD4]" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {erpCount}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                ERP Transfer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search stores by name, hospital, ID..."
            className="pl-11 h-11 bg-card border-border text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="h-11 w-[220px] bg-card">
            <SelectValue placeholder="All Stock Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Sources</SelectItem>
            <SelectItem value="Direct Purchase">Direct Purchase</SelectItem>
            <SelectItem value="External ERP">External ERP</SelectItem>
            <SelectItem value="Both">Both</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-bold text-foreground">
                    Store ID
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Hospital / Clinic
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Store Name
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Stock Source
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Contact Person
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Location
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">
                    Default
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground text-sm font-semibold"
                    >
                      No biomedical stores found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((store) => {
                    const sc = stockSourceConfig[store.stockSource];
                    return (
                      <TableRow
                        key={store.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-[#00BCD4] text-sm">
                          {store.id}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {store.hospital}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-foreground">
                          {store.storeName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border-0",
                              sc.bg,
                              sc.text,
                            )}
                          >
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {store.contactPerson || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {store.location || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {store.isDefault ? (
                            <CheckCircle2 className="w-4 h-4 text-[#10B981] mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border-0",
                              store.status === "Active"
                                ? "bg-[#10B981]/10 text-[#10B981]"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {store.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(store)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit Store
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div
            className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-[650px] mx-4 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground">
                {editingId ? "Edit Biomedical Store" : "Add Biomedical Store"}
              </h3>
              <button
                onClick={resetForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-4 py-3 text-sm font-semibold text-[#EF4444]">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Hospital / Clinic" required>
                  <Select value={fHospital} onValueChange={setFHospital}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apollo Hospital - Chennai">
                        Apollo Hospital - Chennai
                      </SelectItem>
                      <SelectItem value="Apollo Hospital - Delhi">
                        Apollo Hospital - Delhi
                      </SelectItem>
                      <SelectItem value="Apollo Hospital - Bangalore">
                        Apollo Hospital - Bangalore
                      </SelectItem>
                      <SelectItem value="Apollo Hospital - Hyderabad">
                        Apollo Hospital - Hyderabad
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Store Name" required>
                  <Input
                    className="h-10"
                    placeholder="e.g. Biomedical Spares Store"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                  />
                </FormField>
              </div>
              <FormField label="Stock Source" required>
                <Select value={fSource} onValueChange={setFSource}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="How does stock enter this store?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct Purchase">
                      Direct Purchase -- Items purchased separately for
                      biomedical use
                    </SelectItem>
                    <SelectItem value="External ERP">
                      External ERP Transfer -- Stock transferred from client
                      ERP/common store
                    </SelectItem>
                    <SelectItem value="Both">
                      Both -- Combination of direct purchase and ERP transfer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              {fSource && (
                <div
                  className={cn(
                    "rounded-lg px-4 py-3 text-xs leading-relaxed font-medium",
                    fSource === "Direct Purchase"
                      ? "bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 text-[#8B5CF6]"
                      : fSource === "External ERP"
                        ? "bg-[#00BCD4]/5 border border-[#00BCD4]/20 text-[#00838F]"
                        : "bg-[#10B981]/5 border border-[#10B981]/20 text-[#059669]",
                  )}
                >
                  {fSource === "Direct Purchase" &&
                    "GRN will be created with invoice details (vendor, invoice no, amount). The biomedical team purchases items independently."}
                  {fSource === "External ERP" &&
                    "GRN will be created via Excel/CSV upload from the client's ERP system. No invoice details needed -- stock is transferred from the common store."}
                  {fSource === "Both" &&
                    "This store supports both modes: direct purchase with invoice details AND external ERP transfer via upload. Select the appropriate source when creating each GRN."}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Contact Person">
                  <Input
                    className="h-10"
                    placeholder="Store keeper / responsible person"
                    value={fContact}
                    onChange={(e) => setFContact(e.target.value)}
                  />
                </FormField>
                <FormField label="Location">
                  <Input
                    className="h-10"
                    placeholder="e.g. Block B, Ground Floor"
                    value={fLocation}
                    onChange={(e) => setFLocation(e.target.value)}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Status">
                  <Select value={fStatus} onValueChange={setFStatus}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={fDefault}
                      onChange={(e) => setFDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-[#00BCD4]"
                    />
                    <span className="text-sm font-semibold text-foreground">
                      Default Biomedical Store for this hospital
                    </span>
                  </label>
                </div>
              </div>
              <FormField label="Remarks">
                <Textarea
                  className="min-h-[70px]"
                  placeholder="Optional notes about this store..."
                  value={fRemarks}
                  onChange={(e) => setFRemarks(e.target.value)}
                />
              </FormField>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                className="text-white border-0 text-sm font-semibold h-10 px-5"
                style={{
                  background: "linear-gradient(135deg, #00BCD4, #00838F)",
                }}
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-1.5" />{" "}
                {editingId ? "Update Store" : "Create Store"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
