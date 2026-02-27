"use client";

import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card } from "@/src/components/ui/card";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Upload,
  ArrowLeft,
  Save,
  RotateCcw,
  X,
  Cloud,
  FileText,
  Trash2,
  ChevronDown,
  Search,
  AlertCircle,
  Hash,
  ClipboardList,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/modules";

interface Asset {
  id: string;
  assetCode: string;
  serialNo: string;
  deviceName: string;
  deviceModel: string;
  category: string;
  department: string;
  lastContractEndDate?: string; // last contract end date for this asset
  warrantyExpiryDate?: string; // warranty expiry date
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

const mockAssets: Asset[] = [
  { id: "AST-001", assetCode: "BME-MRI-001", serialNo: "MAG-2023-1001", deviceName: "MRI Scanner",       deviceModel: "Magnetom Vida",      category: "Imaging",      department: "Radiology",     lastContractEndDate: "2025-01-14", warrantyExpiryDate: "2024-03-20" },
  { id: "AST-002", assetCode: "BME-CT-002",  serialNo: "REV-2022-3044", deviceName: "CT Scanner",         deviceModel: "Revolution EVO",     category: "Imaging",      department: "Radiology",     lastContractEndDate: "2025-01-14", warrantyExpiryDate: "2025-06-15" },
  { id: "AST-003", assetCode: "BME-VENT-003",serialNo: "SAV-2024-8811", deviceName: "Ventilator",         deviceModel: "Savina 300",         category: "Life Support", department: "ICU",           lastContractEndDate: "2026-02-01", warrantyExpiryDate: "2026-09-30" },
  { id: "AST-004", assetCode: "BME-USG-004", serialNo: "EPQ-2023-5522", deviceName: "Ultrasound System",  deviceModel: "EPIQ Elite",         category: "Imaging",      department: "OB/GYN",        lastContractEndDate: "2024-05-31", warrantyExpiryDate: "2024-12-31" },
  { id: "AST-005", assetCode: "BME-INF-005", serialNo: "INF-2024-7733", deviceName: "Infusion Pump",      deviceModel: "Infusomat Space",    category: "Infusion",     department: "General Ward",  lastContractEndDate: "2026-02-01", warrantyExpiryDate: "2027-01-15" },
  { id: "AST-006", assetCode: "BME-DEF-006", serialNo: "HRT-2023-4456", deviceName: "Defibrillator",      deviceModel: "HeartStart MRx",     category: "Emergency",    department: "Emergency",     lastContractEndDate: "2024-05-31", warrantyExpiryDate: "2024-08-10" },
];

// PO Number → asset IDs mapping
const poAssetMap: Record<string, string[]> = {
  "PO-2024-0011": ["AST-001", "AST-002"],
  "PO-2024-0022": ["AST-003", "AST-005"],
  "PO-2024-0033": ["AST-004", "AST-006"],
  "PO-2023-0044": ["AST-001", "AST-003", "AST-004"],
};

// Vendor → asset IDs mapping
const vendorAssetMap: Record<string, string[]> = {
  ge:      ["AST-001", "AST-002"],
  siemens: ["AST-003", "AST-005"],
  philips: ["AST-004", "AST-006"],
};

// Previous contract ID → asset IDs mapping
const contractAssetMap: Record<string, string[]> = {
  "CTR-001": ["AST-001", "AST-002"],
  "CTR-002": ["AST-003", "AST-005"],
  "CTR-003": ["AST-004", "AST-006"],
};

const assetCategories = ["Imaging", "Life Support", "Infusion", "Emergency", "Monitoring", "Laboratory"];
const documentCategories = [
  { id: "contract_docs", label: "Contract Documents", accept: ".pdf,.doc,.docx" },
  { id: "agreements", label: "Agreements", accept: ".pdf,.doc,.docx" },
  { id: "invoice", label: "Invoice", accept: ".pdf" },
];

function FormField({
  label,
  required,
  children,
  className,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-bold text-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function DocumentUploadZone({
  category,
  onFileSelect,
  files,
}: {
  category: { id: string; label: string; accept: string };
  onFileSelect: (file: File) => void;
  files: UploadedFile[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept={category.accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <Cloud className="w-8 h-8 text-muted-foreground" />
        <div className="text-sm font-medium">Click to upload</div>
        <div className="text-xs text-muted-foreground">{category.accept.replace(/\./g, "").toUpperCase()}</div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">{file.name}</span>
              </div>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AssetPickerModal({
  open,
  onClose,
  onSelect,
  selectedAssetIds,
  currentVendor,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (assetIds: string[]) => void;
  selectedAssetIds: string[];
  currentVendor?: string;
}) {
  const [tab, setTab] = useState<"browse" | "lookup" | "upload">("browse");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedAssetIds));

  // Browse tab
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Lookup tab
  const [lookupPoNumber, setLookupPoNumber] = useState("");
  const [lookupVendor, setLookupVendor] = useState(currentVendor ?? "none");
  const [lookupPrevContract, setLookupPrevContract] = useState("none");
  const [lookupDeviceCategory, setLookupDeviceCategory] = useState("none");
  const [lookupWarrantyFilter, setLookupWarrantyFilter] = useState<"none" | "expired" | "expiring-soon" | "valid">("none");
  const [lookupResults, setLookupResults] = useState<Asset[]>([]);
  const [lookupSource, setLookupSource] = useState<string>("");

  // Upload tab
  const [uploadText, setUploadText] = useState("");
  const [uploadResult, setUploadResult] = useState<{ matched: Asset[]; unmatched: string[] } | null>(null);

  // --- Browse helpers ---
  const filteredAssets = mockAssets.filter(
    (a) =>
      (a.assetCode.toLowerCase().includes(search.toLowerCase()) ||
        a.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNo.toLowerCase().includes(search.toLowerCase())) &&
      (categoryFilter === "all" || a.category === categoryFilter),
  );

  const handleSelectAll = () => {
    if (selected.size === filteredAssets.length) setSelected(new Set());
    else setSelected(new Set(filteredAssets.map((a) => a.id)));
  };

  const handleToggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  // --- Lookup helpers ---
  const runLookup = (source: "po" | "vendor" | "contract" | "device" | "warranty", value: string) => {
    let ids: string[] = [];
    let label = "";
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (source === "po") {
      ids = poAssetMap[value.trim().toUpperCase()] ?? poAssetMap[value.trim()] ?? [];
      label = `PO ${value}`;
    } else if (source === "vendor") {
      ids = vendorAssetMap[value] ?? [];
      label = `Vendor`;
    } else if (source === "contract") {
      ids = contractAssetMap[value] ?? [];
      label = `Contract ${value}`;
    } else if (source === "device") {
      ids = mockAssets.filter((a) => a.category === value).map((a) => a.id);
      label = value;
    } else if (source === "warranty") {
      if (value === "expired") {
        ids = mockAssets.filter((a) => a.warrantyExpiryDate && new Date(a.warrantyExpiryDate) < today).map((a) => a.id);
        label = "Warranty Expired";
      } else if (value === "expiring-soon") {
        ids = mockAssets.filter((a) => a.warrantyExpiryDate && new Date(a.warrantyExpiryDate) <= thirtyDaysFromNow && new Date(a.warrantyExpiryDate) >= today).map((a) => a.id);
        label = "Warranty Expiring Soon";
      } else if (value === "valid") {
        ids = mockAssets.filter((a) => a.warrantyExpiryDate && new Date(a.warrantyExpiryDate) > thirtyDaysFromNow).map((a) => a.id);
        label = "Valid Warranty";
      }
    }
    const assets = mockAssets.filter((a) => ids.includes(a.id));
    setLookupResults(assets);
    setLookupSource(assets.length ? label : "");
  };

  const handleAddLookupResults = () => {
    const next = new Set(selected);
    lookupResults.forEach((a) => next.add(a.id));
    setSelected(next);
  };

  // --- Upload helpers ---
  const handleUploadMatch = () => {
    const lines = uploadText.split(/[\n,]/).map((l) => l.trim()).filter(Boolean);
    const matched: Asset[] = [];
    const unmatched: string[] = [];
    lines.forEach((code) => {
      const found = mockAssets.find(
        (a) =>
          a.assetCode.toLowerCase() === code.toLowerCase() ||
          a.serialNo.toLowerCase() === code.toLowerCase() ||
          a.id.toLowerCase() === code.toLowerCase(),
      );
      if (found) matched.push(found);
      else unmatched.push(code);
    });
    setUploadResult({ matched, unmatched });
    const next = new Set(selected);
    matched.forEach((a) => next.add(a.id));
    setSelected(next);
  };

  // Shared asset table used by Lookup and Browse result views
  const AssetResultTable = ({ assets }: { assets: Asset[] }) => (
    <div className="rounded-lg border border-border overflow-x-auto">
      <table className="w-full text-xs min-w-[520px]">
        <thead className="bg-muted/60">
          <tr>
            <th className="w-8 px-2 py-2" />
            <th className="text-left px-2 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wide">Asset ID</th>
            <th className="text-left px-2 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wide">Name</th>
            <th className="text-left px-2 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wide">Serial No</th>
            <th className="text-left px-2 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wide">Category</th>
            <th className="text-left px-2 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wide">Dept</th>
            <th className="text-left px-2 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wide">Last Contract End</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-muted-foreground">No assets found</td>
            </tr>
          ) : (
            assets.map((asset, i) => (
              <tr
                key={asset.id}
                onClick={() => handleToggle(asset.id)}
                className={cn(
                  "border-t border-border cursor-pointer transition-colors",
                  selected.has(asset.id) ? "bg-[#00BCD4]/8" : i % 2 === 0 ? "bg-background hover:bg-muted/40" : "bg-muted/20 hover:bg-muted/40",
                )}
              >
                <td className="px-2 py-2 text-center">
                  <Checkbox checked={selected.has(asset.id)} onCheckedChange={() => handleToggle(asset.id)} />
                </td>
                <td className="px-2 py-2 font-mono font-bold text-[#00BCD4]">{asset.assetCode}</td>
                <td className="px-2 py-2 font-semibold text-foreground">{asset.deviceName}</td>
                <td className="px-2 py-2 font-mono text-muted-foreground">{asset.serialNo}</td>
                <td className="px-2 py-2 text-muted-foreground">{asset.category}</td>
                <td className="px-2 py-2 text-muted-foreground">{asset.department}</td>
                <td className="px-2 py-2 font-mono text-muted-foreground">{asset.lastContractEndDate ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Assets to Contract</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border shrink-0">
          {(
            [
              { key: "browse", icon: <ClipboardList className="w-3.5 h-3.5" />, label: "Browse Assets" },
              { key: "lookup", icon: <Package className="w-3.5 h-3.5" />, label: "Lookup by PO / Vendor / Contract" },
              { key: "upload", icon: <Upload className="w-3.5 h-3.5" />, label: "Upload Codes" },
            ] as const
          ).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap",
                tab === key
                  ? "border-[#00BCD4] text-[#00BCD4]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 pt-3 space-y-3">

          {/* ── BROWSE TAB ── */}
          {tab === "browse" && (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Asset ID, name or serial..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {assetCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded border border-border">
                <Checkbox
                  checked={selected.size === filteredAssets.length && filteredAssets.length > 0}
                  onCheckedChange={handleSelectAll}
                  id="select-all"
                />
                <Label htmlFor="select-all" className="text-xs font-semibold cursor-pointer">
                  Select All ({selected.size}/{filteredAssets.length})
                </Label>
              </div>
              <AssetResultTable assets={filteredAssets} />
            </>
          )}

          {/* ── LOOKUP TAB ── */}
          {tab === "lookup" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* PO Number */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">PO Number</Label>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="e.g. PO-2024-0011"
                      value={lookupPoNumber}
                      onChange={(e) => setLookupPoNumber(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button
                      size="sm"
                      className="h-9 px-3 shrink-0 text-white border-0"
                      style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
                      disabled={!lookupPoNumber.trim()}
                      onClick={() => runLookup("po", lookupPoNumber)}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Vendor */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Vendor</Label>
                  <div className="flex gap-1.5">
                    <Select value={lookupVendor} onValueChange={setLookupVendor}>
                      <SelectTrigger className="h-9 text-xs flex-1">
                        <SelectValue placeholder="Select vendor..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select vendor...</SelectItem>
                        <SelectItem value="ge">GE Healthcare</SelectItem>
                        <SelectItem value="siemens">Siemens Medical</SelectItem>
                        <SelectItem value="philips">Philips Healthcare</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-9 px-3 shrink-0 text-white border-0"
                      style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
                      disabled={!lookupVendor || lookupVendor === "none"}
                      onClick={() => runLookup("vendor", lookupVendor)}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Previous Contract */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Previous Contract ID</Label>
                  <div className="flex gap-1.5">
                    <Select value={lookupPrevContract} onValueChange={setLookupPrevContract}>
                      <SelectTrigger className="h-9 text-xs flex-1">
                        <SelectValue placeholder="Select contract..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select contract...</SelectItem>
                        <SelectItem value="CTR-001">CTR-001 (GE Healthcare)</SelectItem>
                        <SelectItem value="CTR-002">CTR-002 (Siemens Medical)</SelectItem>
                        <SelectItem value="CTR-003">CTR-003 (Philips Healthcare)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-9 px-3 shrink-0 text-white border-0"
                      style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
                      disabled={!lookupPrevContract || lookupPrevContract === "none"}
                      onClick={() => runLookup("contract", lookupPrevContract)}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Device Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Device Category</Label>
                  <div className="flex gap-1.5">
                    <Select value={lookupDeviceCategory} onValueChange={setLookupDeviceCategory}>
                      <SelectTrigger className="h-9 text-xs flex-1">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select category...</SelectItem>
                        {assetCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-9 px-3 shrink-0 text-white border-0"
                      style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
                      disabled={!lookupDeviceCategory || lookupDeviceCategory === "none"}
                      onClick={() => runLookup("device", lookupDeviceCategory)}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Warranty Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Warranty Status</Label>
                  <div className="flex gap-1.5">
                    <Select value={lookupWarrantyFilter} onValueChange={(val) => setLookupWarrantyFilter(val as typeof lookupWarrantyFilter)}>
                      <SelectTrigger className="h-9 text-xs flex-1">
                        <SelectValue placeholder="Select warranty..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select warranty status...</SelectItem>
                        <SelectItem value="expired">Warranty Expired</SelectItem>
                        <SelectItem value="expiring-soon">Expiring Soon (30 days)</SelectItem>
                        <SelectItem value="valid">Valid Warranty</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-9 px-3 shrink-0 text-white border-0"
                      style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
                      disabled={!lookupWarrantyFilter || lookupWarrantyFilter === "none"}
                      onClick={() => runLookup("warranty", lookupWarrantyFilter)}
                    >
                      <Search className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {lookupResults.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground">
                      {lookupResults.length} asset{lookupResults.length !== 1 ? "s" : ""} found
                      {lookupSource && <span className="font-normal text-muted-foreground"> · {lookupSource}</span>}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 text-xs font-bold text-white border-0 px-3"
                      style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
                      onClick={handleAddLookupResults}
                    >
                      Select All {lookupResults.length} Assets
                    </Button>
                  </div>
                  <AssetResultTable assets={lookupResults} />
                </div>
              )}

              {lookupResults.length === 0 && lookupSource === "" && (
                <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  Use any filter above to search for assets by PO Number, Vendor, Previous Contract, Device Category, or Warranty Status.
                </div>
              )}
            </div>
          )}

          {/* ── UPLOAD TAB ── */}
          {tab === "upload" && (
            <div className="space-y-4">
              <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground">
                Paste or type Asset Codes or Serial Numbers separated by commas or new lines. The system will match them against the Asset Register.
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Asset Codes / Serial Numbers</Label>
                <Textarea
                  rows={5}
                  placeholder={"BME-MRI-001\nBME-CT-002, BME-VENT-003\nMAG-2023-1001"}
                  value={uploadText}
                  onChange={(e) => { setUploadText(e.target.value); setUploadResult(null); }}
                  className="font-mono text-sm resize-none"
                />
              </div>
              <Button
                onClick={handleUploadMatch}
                disabled={!uploadText.trim()}
                className="w-full h-9 text-sm font-semibold text-white border-0"
                style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
              >
                <Hash className="w-4 h-4 mr-2" />
                Match Assets
              </Button>

              {uploadResult && (
                <div className="space-y-3">
                  {uploadResult.matched.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span className="text-xs font-bold text-[#10B981]">{uploadResult.matched.length} Matched & Added to Selection</span>
                      </div>
                      <div className="space-y-1">
                        {uploadResult.matched.map((a) => (
                          <div key={a.id} className="flex items-center gap-2 px-3 py-2 bg-[#10B981]/5 border border-[#10B981]/20 rounded text-xs">
                            <span className="font-mono font-bold text-[#00BCD4]">{a.assetCode}</span>
                            <span className="text-foreground font-semibold">{a.deviceName}</span>
                            <span className="text-muted-foreground">{a.serialNo}</span>
                            <span className="text-muted-foreground ml-auto">{a.lastContractEndDate ?? "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {uploadResult.unmatched.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                        <span className="text-xs font-bold text-[#EF4444]">{uploadResult.unmatched.length} Not Found</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {uploadResult.unmatched.map((code) => (
                          <span key={code} className="px-2 py-0.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded text-xs font-mono text-[#EF4444]">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-3 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
            className="text-white font-semibold"
            onClick={() => {
              onSelect(Array.from(selected));
              onClose();
            }}
          >
            Add {selected.size} Asset{selected.size !== 1 ? "s" : ""} to Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ContractCreatePage() {
  const navigate = useNavigate();

  // Form state
  const [contractType, setContractType] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodYears, setPeriodYears] = useState("");
  const [contractPrice, setContractPrice] = useState("");
  const [hospital, setHospital] = useState("");
  const [vendor, setVendor] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [contractStatus, setContractStatus] = useState(false);

  // Asset selection
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  // Documents
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedFile[]>>({
    contract_docs: [],
    agreements: [],
    invoice: [],
  });

  const handleAssetSelect = (assetIds: string[]) => {
    const selected = mockAssets.filter((a) => assetIds.includes(a.id));
    setSelectedAssets(selected);
  };

  const handleFileUpload = (category: string, file: File) => {
    const newFile: UploadedFile = {
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toLocaleString(),
    };
    setUploadedDocs((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), newFile],
    }));
  };

  const handleRemoveAsset = (id: string) => {
    setSelectedAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    if (!contractNumber || !contractType || !startDate || selectedAssets.length === 0) {
      alert("Please fill all required fields");
      return;
    }
    alert("Contract created successfully!");
    navigate(ROUTES.CONTRACT_MANAGEMENT);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-40 bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.CONTRACT_MANAGEMENT)}
              className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold">Service Contract Creation</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Details Section */}
            <Card className="p-6 border-border">
              <h2 className="text-lg font-bold mb-4">Contract Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Contract Type" required>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AMC">Annual Maintenance Contract</SelectItem>
                      <SelectItem value="WARRANTY">Warranty</SelectItem>
                      <SelectItem value="SERVICE">Service Agreement</SelectItem>
                      <SelectItem value="SUPPORT">Support Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Contract Number" required>
                  <Input
                    placeholder="e.g., AMC-2024-001"
                    value={contractNumber}
                    onChange={(e) => setContractNumber(e.target.value)}
                  />
                </FormField>

                <FormField label="Start Date" required>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </FormField>

                <FormField label="Period in Years" required>
                  <Input
                    type="number"
                    placeholder="1, 2, 3..."
                    value={periodYears}
                    onChange={(e) => setPeriodYears(e.target.value)}
                  />
                </FormField>

                <FormField label="End Date">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled
                  />
                </FormField>

                <FormField label="Contract Price" required>
                  <Input
                    type="number"
                    placeholder="Amount in INR"
                    value={contractPrice}
                    onChange={(e) => setContractPrice(e.target.value)}
                  />
                </FormField>

                <FormField label="Hospital/Clinic" required>
                  <Select value={hospital} onValueChange={setHospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apollo">Apollo Hospital - Chennai</SelectItem>
                      <SelectItem value="apollo-delhi">Apollo Hospital - Delhi</SelectItem>
                      <SelectItem value="max">Max Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Vendor" required>
                  <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ge">GE Healthcare</SelectItem>
                      <SelectItem value="siemens">Siemens Medical</SelectItem>
                      <SelectItem value="philips">Philips Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Contract Owner">
                  <Select value={owner} onValueChange={setOwner}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="jane">Jane Doe</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Checkbox
                  checked={contractStatus}
                  onCheckedChange={(v) => setContractStatus(!!v)}
                  id="contract-status"
                />
                <Label htmlFor="contract-status" className="text-sm font-medium cursor-pointer">
                  Contract Status (Active)
                </Label>
              </div>

              <FormField label="Description" className="mt-4">
                <Textarea
                  placeholder="Contract scope and details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </FormField>

              <FormField label="Notes" className="mt-4">
                <Textarea
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </FormField>
            </Card>

            {/* Documents Section */}
            <Card className="p-6 border-border">
              <h2 className="text-lg font-bold mb-4">Documents Section</h2>
              <div className="grid grid-cols-1 gap-4">
                {documentCategories.map((category) => (
                  <div key={category.id}>
                    <Label className="text-sm font-semibold mb-2 block">{category.label}</Label>
                    <DocumentUploadZone
                      category={category}
                      onFileSelect={(file) => handleFileUpload(category.id, file)}
                      files={uploadedDocs[category.id] || []}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Asset Selection */}
          <div className="space-y-4">
            <Card className="p-4 border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm">Contract Assets</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                  {selectedAssets.length}
                </span>
              </div>

              <Button
                onClick={() => setAssetModalOpen(true)}
                className="w-full mb-3 text-white font-semibold text-sm h-9 border-0"
                style={{ background: "linear-gradient(135deg,#00BCD4,#00838F)" }}
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Select / Upload Assets
              </Button>

              {selectedAssets.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">Select at least one asset for this contract</div>
                </div>
              ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedAssets.map((asset) => (
                    <div key={asset.id} className="border border-[#00BCD4]/20 rounded-lg p-2.5 bg-[#00BCD4]/5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-foreground truncate mb-1">{asset.deviceName}</div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">ID</span>
                            <span className="font-mono text-[11px] font-bold text-[#00BCD4]">{asset.assetCode}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">S/N</span>
                            <span className="font-mono text-[11px] text-muted-foreground">{asset.serialNo}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground">{asset.category} · {asset.department}</div>
                          {asset.lastContractEndDate && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Last End</span>
                              <span className="font-mono text-[10px] text-[#F59E0B] font-semibold">{asset.lastContractEndDate}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Contract
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(ROUTES.CONTRACT_MANAGEMENT)}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        open={assetModalOpen}
        onClose={() => setAssetModalOpen(false)}
        onSelect={handleAssetSelect}
        selectedAssetIds={selectedAssets.map((a) => a.id)}
        currentVendor={vendor || undefined}
      />
    </div>
  );
}

export default ContractCreatePage;
