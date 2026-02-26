"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/modules";

interface Asset {
  id: string;
  serialNo: string;
  deviceName: string;
  deviceModel: string;
  category: string;
  department: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

const mockAssets: Asset[] = [
  { id: "AST-001", serialNo: "MAG-2023-1001", deviceName: "MRI Scanner", deviceModel: "Magnetom Vida", category: "Imaging", department: "Radiology" },
  { id: "AST-002", serialNo: "REV-2022-3044", deviceName: "CT Scanner", deviceModel: "Revolution EVO", category: "Imaging", department: "Radiology" },
  { id: "AST-003", serialNo: "SAV-2024-8811", deviceName: "Ventilator", deviceModel: "Savina 300", category: "Life Support", department: "ICU" },
  { id: "AST-004", serialNo: "EPQ-2023-5522", deviceName: "Ultrasound System", deviceModel: "EPIQ Elite", category: "Imaging", department: "OB/GYN" },
  { id: "AST-005", serialNo: "INF-2024-7733", deviceName: "Infusion Pump", deviceModel: "Infusomat Space", category: "Infusion", department: "General Ward" },
  { id: "AST-006", serialNo: "HRT-2023-4456", deviceName: "Defibrillator", deviceModel: "HeartStart MRx", category: "Emergency", department: "Emergency" },
];

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
  children: React.ReactNode;
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
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (assetIds: string[]) => void;
  selectedAssetIds: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedAssetIds));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const filteredAssets = mockAssets.filter(
    (a) =>
      (a.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNo.toLowerCase().includes(search.toLowerCase())) &&
      (!categoryFilter || a.category === categoryFilter),
  );

  const handleSelectAll = () => {
    if (selected.size === filteredAssets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredAssets.map((a) => a.id)));
    }
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Assets for Contract</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <Input
              placeholder="Search by device name or serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {assetCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select All */}
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <Checkbox
              checked={selected.size === filteredAssets.length && filteredAssets.length > 0}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <Label htmlFor="select-all" className="text-sm font-semibold cursor-pointer">
              Select All ({selected.size}/{filteredAssets.length})
            </Label>
          </div>

          {/* Asset List */}
          <div className="max-h-80 overflow-y-auto space-y-2 border border-border rounded p-3">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No assets found</div>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer border border-transparent hover:border-border"
                  onClick={() => handleToggle(asset.id)}
                >
                  <Checkbox checked={selected.has(asset.id)} onCheckedChange={() => handleToggle(asset.id)} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{asset.deviceName}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset.serialNo} • {asset.category} • {asset.department}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSelect(Array.from(selected));
              onClose();
            }}
          >
            Add {selected.size} Asset{selected.size !== 1 ? "s" : ""}
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
                className="w-full mb-3 bg-blue-600 hover:bg-blue-700"
              >
                <ChevronDown className="w-4 h-4 mr-2" />
                Select Assets
              </Button>

              {selectedAssets.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">Select at least one asset for this contract</div>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedAssets.map((asset) => (
                    <div key={asset.id} className="border border-border rounded p-2 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-foreground truncate">{asset.deviceName}</div>
                          <div className="text-xs text-muted-foreground">{asset.serialNo}</div>
                          <div className="text-xs text-muted-foreground">{asset.category}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
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
      />
    </div>
  );
}

export default ContractCreatePage;
