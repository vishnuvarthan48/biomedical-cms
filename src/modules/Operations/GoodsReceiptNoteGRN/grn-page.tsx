"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
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
  Eye,
  MoreVertical,
  Download,
  X,
  Save,
  Send,
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Trash2,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Info,
  ArrowRightLeft,
  FileText,
} from "lucide-react";

// ----- Types -----
interface GrnHeader {
  id: string;
  hospital: string;
  store: string;
  inwardSource: "Direct Purchase" | "ERP Transfer";
  grnDate: string;
  // Direct Purchase fields
  vendorName: string;
  invoiceNo: string;
  invoiceDate: string;
  invoiceAmount: string;
  // ERP Transfer fields
  externalRefNo: string;
  transferDate: string;
  sourceErpStore: string;
  remarks: string;
  status: "Draft" | "Posted" | "Cancelled";
  lineCount: number;
  totalAmount: number;
  createdAt: string;
  createdBy: string;
}

interface GrnLine {
  id: string;
  itemCode: string;
  itemName: string;
  partNumber: string;
  itemType: "Consumable" | "Spare" | "Accessory";
  qtyReceived: number;
  uom: string;
  // Consumable fields
  batchNo: string;
  lotNumber: string;
  // Spare / Accessory fields
  serialNumbers: string;
  // Common fields
  mfgDate: string;
  shelfLifeMonths: number;
  expiryDate: string;
  // Spare / Accessory warranty
  warrantyMonths: number;
  warrantyExpiry: string;
  unitRate: number;
  lineAmount: number;
  batchRequired: boolean;
  expiryRequired: boolean;
  serialRequired: boolean;
}

// ----- Mock Data -----
const mockGrns: GrnHeader[] = [
  {
    id: "GRN-2025-001",
    hospital: "Apollo Hospital - Chennai",
    store: "Biomedical Spares Store",
    inwardSource: "Direct Purchase",
    grnDate: "2025-06-10",
    vendorName: "Philips Medical Systems",
    invoiceNo: "INV-PH-2025-456",
    invoiceDate: "2025-06-08",
    invoiceAmount: "125000",
    externalRefNo: "",
    transferDate: "",
    sourceErpStore: "",
    remarks: "Quarterly replenishment of SpO2 sensors and ECG electrodes",
    status: "Posted",
    lineCount: 3,
    totalAmount: 125000,
    createdAt: "2025-06-10",
    createdBy: "Admin User",
  },
  {
    id: "GRN-2025-002",
    hospital: "Apollo Hospital - Chennai",
    store: "Biomedical Spares Store",
    inwardSource: "ERP Transfer",
    grnDate: "2025-06-12",
    vendorName: "",
    invoiceNo: "",
    invoiceDate: "",
    invoiceAmount: "",
    externalRefNo: "ERP-TRF-1234",
    transferDate: "2025-06-11",
    sourceErpStore: "Main Store - Central ERP",
    remarks: "Monthly biomedical stock transfer from central ERP",
    status: "Posted",
    lineCount: 5,
    totalAmount: 0,
    createdAt: "2025-06-12",
    createdBy: "Store Keeper",
  },
  {
    id: "GRN-2025-003",
    hospital: "Apollo Hospital - Delhi",
    store: "Biomedical Store - ICU Wing",
    inwardSource: "Direct Purchase",
    grnDate: "2025-06-15",
    vendorName: "Draeger Medical",
    invoiceNo: "DRG-2025-789",
    invoiceDate: "2025-06-14",
    invoiceAmount: "85000",
    externalRefNo: "",
    transferDate: "",
    sourceErpStore: "",
    remarks: "Ventilator flow sensors and spare batteries",
    status: "Draft",
    lineCount: 2,
    totalAmount: 85000,
    createdAt: "2025-06-15",
    createdBy: "Admin User",
  },
  {
    id: "GRN-2025-004",
    hospital: "Apollo Hospital - Chennai",
    store: "Biomedical Spares Store",
    inwardSource: "Direct Purchase",
    grnDate: "2025-05-20",
    vendorName: "BD Medical",
    invoiceNo: "BD-INV-2025-111",
    invoiceDate: "2025-05-19",
    invoiceAmount: "45000",
    externalRefNo: "",
    transferDate: "",
    sourceErpStore: "",
    remarks: "Infusion pump batteries and tubing sets",
    status: "Cancelled",
    lineCount: 2,
    totalAmount: 45000,
    createdAt: "2025-05-20",
    createdBy: "Store Keeper",
  },
];

// Default shelf life in months (from Store Master, fallback)
const DEFAULT_SHELF_LIFE = 60;

// Helper: calculate expiry/warranty expiry from mfg date + months
function addMonths(dateStr: string, months: number): string {
  if (!dateStr || !months) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

// Biomedical items only
const biomedItemLookup = [
  {
    code: "BIO-SPR-001",
    name: "SpO2 Sensor Cable",
    partNumber: "PHI-SPO2-M1191B",
    uom: "Piece",
    itemType: "Spare" as const,
    shelfLifeMonths: 60,
    batchRequired: false,
    expiryRequired: false,
    serialRequired: true,
  },
  {
    code: "BIO-CON-001",
    name: "ECG Electrode Pads",
    partNumber: "3M-2560-ECG",
    uom: "Box (50)",
    itemType: "Consumable" as const,
    shelfLifeMonths: 36,
    batchRequired: true,
    expiryRequired: true,
    serialRequired: false,
  },
  {
    code: "BIO-SPR-002",
    name: "Ventilator Flow Sensor",
    partNumber: "DRG-FS-8412960",
    uom: "Piece",
    itemType: "Spare" as const,
    shelfLifeMonths: 60,
    batchRequired: false,
    expiryRequired: false,
    serialRequired: true,
  },
  {
    code: "BIO-ACC-001",
    name: "NIBP Cuff (Adult)",
    partNumber: "PHI-NIBP-M1574A",
    uom: "Piece",
    itemType: "Accessory" as const,
    shelfLifeMonths: 48,
    batchRequired: false,
    expiryRequired: false,
    serialRequired: false,
  },
  {
    code: "BIO-CON-002",
    name: "Defibrillator Pads (Adult)",
    partNumber: "PHI-DEF-M3713A",
    uom: "Pair",
    itemType: "Consumable" as const,
    shelfLifeMonths: 24,
    batchRequired: true,
    expiryRequired: true,
    serialRequired: false,
  },
  {
    code: "BIO-SPR-003",
    name: "Infusion Pump Battery",
    partNumber: "BD-BAT-INF-320",
    uom: "Piece",
    itemType: "Spare" as const,
    shelfLifeMonths: 60,
    batchRequired: false,
    expiryRequired: false,
    serialRequired: true,
  },
];

// ----- Helpers -----
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
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="text-[11px] font-bold text-foreground">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      {children}
    </div>
  );
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: React.ElementType }
> = {
  Draft: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", icon: Clock },
  Posted: { bg: "bg-[#10B981]/10", text: "text-[#10B981]", icon: CheckCircle2 },
  Cancelled: { bg: "bg-muted", text: "text-muted-foreground", icon: XCircle },
};

// ----- List View -----
function GrnListView({
  grns,
  onAdd,
  onView,
}: {
  grns: GrnHeader[];
  onAdd: () => void;
  onView: (grn: GrnHeader) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  const filtered = grns.filter((g) => {
    const matchSearch =
      !searchQuery ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    const matchSource =
      filterSource === "all" || g.inwardSource === filterSource;
    return matchSearch && matchStatus && matchSource;
  });

  const draftCount = grns.filter((g) => g.status === "Draft").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Goods Receipt Note (GRN)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Inward biomedical spares and consumables into store for asset
            maintenance
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {draftCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7] text-[#D97706] text-xs font-bold">
              <Clock className="w-3.5 h-3.5" /> {draftCount} draft(s)
            </div>
          )}
          <Button
            className="text-white border-0 text-xs font-semibold px-4 h-8"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onAdd}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create GRN
          </Button>
        </div>
      </div>

      {/* Context Banner */}
      <div className="rounded-lg border border-[#00BCD4]/20 bg-[#00BCD4]/5 px-3 py-2 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#00BCD4] mt-0.5 shrink-0" />
        <div className="text-xs text-foreground leading-relaxed">
          <span className="font-bold">Two inward modes: </span>
          <span className="font-bold text-[#8B5CF6]">Direct Purchase</span> --
          enter stock with invoice details.
          <span className="font-bold text-[#00BCD4]"> ERP Transfer</span> --
          upload Excel/CSV from client ERP.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total GRNs",
            value: grns.length,
            icon: ClipboardList,
            color: "#00BCD4",
          },
          {
            label: "Posted",
            value: grns.filter((g) => g.status === "Posted").length,
            icon: CheckCircle2,
            color: "#10B981",
          },
          {
            label: "Direct Purchase",
            value: grns.filter((g) => g.inwardSource === "Direct Purchase")
              .length,
            icon: FileText,
            color: "#8B5CF6",
          },
          {
            label: "ERP Transfer",
            value: grns.filter((g) => g.inwardSource === "ERP Transfer").length,
            icon: ArrowRightLeft,
            color: "#00BCD4",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="px-3 py-2 flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground leading-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search GRN No, vendor, invoice..."
            className="pl-9 h-8 bg-card border-border text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[140px] bg-card text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Posted">Posted</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="h-8 w-[180px] bg-card text-xs">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="Direct Purchase">Direct Purchase</SelectItem>
            <SelectItem value="ERP Transfer">ERP Transfer</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="h-8 text-xs font-semibold px-3">
          <Download className="w-3.5 h-3.5 mr-1.5" /> Export
        </Button>
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 [&>th]:h-7 [&>th]:py-0 [&>th]:text-[11px]">
                  <TableHead className="font-bold text-foreground">
                    GRN No
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Date
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Hospital
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Source
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Vendor / Ref
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Invoice No
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-center">
                    Lines
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right">
                    Amount
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-center w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-muted-foreground text-xs font-semibold"
                    >
                      No GRNs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((grn) => {
                    const sc = statusConfig[grn.status];
                    return (
                      <TableRow
                        key={grn.id}
                        className="h-8 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-[#00BCD4] text-xs py-0.5 px-2">
                          {grn.id}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-0.5 px-2">
                          {grn.grnDate}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground truncate max-w-[140px] py-0.5 px-2">
                          {grn.hospital}
                        </TableCell>
                        <TableCell className="py-0.5 px-2">
                          <Badge
                            className={cn(
                              "text-[9px] font-bold border-0 px-1.5 py-0",
                              grn.inwardSource === "Direct Purchase"
                                ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                                : "bg-[#00BCD4]/10 text-[#00BCD4]",
                            )}
                          >
                            {grn.inwardSource}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground truncate max-w-[140px] py-0.5 px-2">
                          {grn.inwardSource === "Direct Purchase"
                            ? grn.vendorName
                            : grn.externalRefNo || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-0.5 px-2">
                          {grn.invoiceNo || "-"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground text-center py-0.5 px-2">
                          {grn.lineCount}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-foreground text-right py-0.5 px-2">
                          {grn.totalAmount > 0
                            ? `$${grn.totalAmount.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center py-0.5 px-2">
                          <Badge
                            className={cn(
                              "text-[9px] font-bold border-0 px-1.5 py-0",
                              sc.bg,
                              sc.text,
                            )}
                          >
                            {grn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-0.5 px-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(grn)}>
                                <Eye className="w-3.5 h-3.5 mr-2" /> View / Edit
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
    </div>
  );
}

// ----- GRN Form View -----
function GrnForm({
  editGrn,
  onBack,
}: {
  editGrn: GrnHeader | null;
  onBack: () => void;
}) {
  const isEdit = !!editGrn;
  const [hospital, setHospital] = useState(editGrn?.hospital || "");
  const [store, setStore] = useState(editGrn?.store || "");
  const [inwardSource, setInwardSource] = useState(editGrn?.inwardSource || "");
  const [grnDate, setGrnDate] = useState(
    editGrn?.grnDate || new Date().toISOString().split("T")[0],
  );
  // Direct Purchase
  const [vendorName, setVendorName] = useState(editGrn?.vendorName || "");
  const [invoiceNo, setInvoiceNo] = useState(editGrn?.invoiceNo || "");
  const [invoiceDate, setInvoiceDate] = useState(editGrn?.invoiceDate || "");
  const [invoiceAmount, setInvoiceAmount] = useState(
    editGrn?.invoiceAmount || "",
  );
  // ERP Transfer
  const [externalRefNo, setExternalRefNo] = useState(
    editGrn?.externalRefNo || "",
  );
  const [transferDate, setTransferDate] = useState(editGrn?.transferDate || "");
  const [sourceErpStore, setSourceErpStore] = useState(
    editGrn?.sourceErpStore || "",
  );
  const [remarks, setRemarks] = useState(editGrn?.remarks || "");

  // Lines
  const [lines, setLines] = useState<GrnLine[]>([]);

  // Upload state for ERP Transfer mode
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  // uploadFile is stored for future use (e.g., re-upload, filename display)
  void uploadFile;
  const [uploadPreview, setUploadPreview] = useState<{
    rows: {
      item: string;
      qty: number;
      batch: string;
      expiry: string;
      status: string;
    }[];
  } | null>(null);

  // Inline quick-add row state
  const [qaItem, setQaItem] = useState("");
  const [qaQty, setQaQty] = useState("");
  const [qaBatch, setQaBatch] = useState("");
  const [qaLotNumber, setQaLotNumber] = useState("");
  const [qaMfgDate, setQaMfgDate] = useState("");
  const [qaShelfLife, setQaShelfLife] = useState("");
  const [qaExpiry, setQaExpiry] = useState("");
  const [qaSerial, setQaSerial] = useState("");
  const [qaWarranty, setQaWarranty] = useState("");
  const [qaWarrantyExpiry, setQaWarrantyExpiry] = useState("");
  const [qaRate, setQaRate] = useState("");
  const [qaError, setQaError] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const qaSelectedItem = biomedItemLookup.find((i) => i.code === qaItem);
  const isConsumable = qaSelectedItem?.itemType === "Consumable";
  const isSpareOrAccessory = qaSelectedItem?.itemType === "Spare" || qaSelectedItem?.itemType === "Accessory";

  // Auto-calculate expiry date when mfgDate or shelfLife changes
  const qaComputedExpiry = qaMfgDate && qaShelfLife ? addMonths(qaMfgDate, parseInt(qaShelfLife) || 0) : qaExpiry;
  const qaComputedWarrantyExpiry = qaMfgDate && qaWarranty ? addMonths(qaMfgDate, parseInt(qaWarranty) || 0) : qaWarrantyExpiry;

  // Auto-populate shelf life from item master when item changes
  const handleItemChange = (code: string) => {
    setQaItem(code);
    setQaError("");
    const found = biomedItemLookup.find((i) => i.code === code);
    if (found) {
      setQaShelfLife(String(found.shelfLifeMonths || DEFAULT_SHELF_LIFE));
    }
  };

  const resetQuickAdd = () => {
    setQaItem("");
    setQaQty("");
    setQaBatch("");
    setQaLotNumber("");
    setQaMfgDate("");
    setQaShelfLife("");
    setQaExpiry("");
    setQaSerial("");
    setQaWarranty("");
    setQaWarrantyExpiry("");
    setQaRate("");
    setQaError("");
  };

  const handleQuickAdd = () => {
    setQaError("");
    if (!qaItem) {
      setQaError("Select an item.");
      return;
    }
    const found = biomedItemLookup.find((i) => i.code === qaItem);
    if (!found) {
      setQaError("Item not found.");
      return;
    }
    const qty = parseInt(qaQty);
    if (!qaQty || isNaN(qty) || qty <= 0) {
      setQaError("Quantity must be greater than 0.");
      return;
    }
    const isCons = found.itemType === "Consumable";
    const isSpAcc = found.itemType === "Spare" || found.itemType === "Accessory";

    if (isCons && !qaBatch.trim()) {
      setQaError("Batch Number is required for Consumables.");
      return;
    }
    if (isSpAcc && !qaSerial.trim()) {
      setQaError("Serial Number is required for Spares/Accessories.");
      return;
    }

    const shelfLife = parseInt(qaShelfLife) || found.shelfLifeMonths || DEFAULT_SHELF_LIFE;
    const computedExpiry = qaMfgDate ? addMonths(qaMfgDate, shelfLife) : qaExpiry;
    const warrantyMo = parseInt(qaWarranty) || 0;
    const computedWarrantyExp = isSpAcc && qaMfgDate && warrantyMo ? addMonths(qaMfgDate, warrantyMo) : "";

    const rate = parseFloat(qaRate) || 0;
    setLines((prev) => [
      ...prev,
      {
        id: `LN-${Date.now()}`,
        itemCode: found.code,
        itemName: found.name,
        partNumber: found.partNumber,
        itemType: found.itemType,
        qtyReceived: qty,
        uom: found.uom,
        batchNo: isCons ? qaBatch.trim() : "",
        lotNumber: isCons ? qaLotNumber.trim() : "",
        serialNumbers: isSpAcc ? qaSerial.trim() : "",
        mfgDate: qaMfgDate,
        shelfLifeMonths: shelfLife,
        expiryDate: computedExpiry,
        warrantyMonths: isSpAcc ? warrantyMo : 0,
        warrantyExpiry: computedWarrantyExp,
        unitRate: rate,
        lineAmount: rate * qty,
        batchRequired: found.batchRequired,
        expiryRequired: found.expiryRequired,
        serialRequired: found.serialRequired,
      },
    ]);
    resetQuickAdd();
    // Keep quick-add row open for continuous entry
  };

  const removeLine = (id: string) =>
    setLines((prev) => prev.filter((l) => l.id !== id));

  const totalAmount = lines.reduce((s, l) => s + l.lineAmount, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    // Simulated parsing -- real implementation would parse Excel/CSV
    setUploadPreview({
      rows: [
        {
          item: "BIO-SPR-001",
          qty: 10,
          batch: "",
          expiry: "",
          status: "Valid",
        },
        {
          item: "BIO-CON-001",
          qty: 20,
          batch: "BATCH-2025-A",
          expiry: "2026-12-31",
          status: "Valid",
        },
        { item: "BIO-SPR-002", qty: 5, batch: "", expiry: "", status: "Valid" },
        {
          item: "UNKNOWN-001",
          qty: 3,
          batch: "",
          expiry: "",
          status: "Item not mapped",
        },
      ],
    });
  };

  const confirmUpload = () => {
    if (!uploadPreview) return;
    const validRows = uploadPreview.rows.filter((r) => r.status === "Valid");
    const newLines: GrnLine[] = validRows.map((r, idx) => {
      const found = biomedItemLookup.find((i) => i.code === r.item);
      return {
        id: `LN-UPL-${Date.now()}-${idx}`,
        itemCode: r.item,
        itemName: found?.name || r.item,
        partNumber: found?.partNumber || "",
        itemType: (found?.itemType || "Spare") as GrnLine["itemType"],
        qtyReceived: r.qty,
        uom: found?.uom || "Piece",
        batchNo: r.batch,
        lotNumber: "",
        serialNumbers: "",
        mfgDate: "",
        shelfLifeMonths: found?.shelfLifeMonths || DEFAULT_SHELF_LIFE,
        expiryDate: r.expiry,
        warrantyMonths: 0,
        warrantyExpiry: "",
        unitRate: 0,
        lineAmount: 0,
        batchRequired: found?.batchRequired || false,
        expiryRequired: found?.expiryRequired || false,
        serialRequired: found?.serialRequired || false,
      };
    });
    setLines((prev) => [...prev, ...newLines]);
    setUploadFile(null);
    setUploadPreview(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 rounded-lg"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground tracking-tight">
            {isEdit ? `GRN: ${editGrn.id}` : "Create GRN"}
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {isEdit
              ? `Status: ${editGrn.status}`
              : "Inward biomedical spares/consumables into store"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs font-semibold h-8 px-3"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button variant="outline" className="text-xs font-semibold h-8 px-3">
            <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
          </Button>
          <Button
            className="text-white border-0 text-xs font-semibold h-8 px-4"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Post GRN
          </Button>
        </div>
      </div>

      {/* GRN Header */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            GRN Header
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <FormField label="Hospital / Clinic" required>
              <Select value={hospital} onValueChange={setHospital}>
                <SelectTrigger className="h-8 text-xs">
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
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Biomedical Store" required>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biomedical Spares Store">
                    Biomedical Spares Store
                  </SelectItem>
                  <SelectItem value="Biomedical Store - ICU Wing">
                    Biomedical Store - ICU Wing
                  </SelectItem>
                  <SelectItem value="OT Equipment Store">
                    OT Equipment Store
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Inward Source" required>
              <Select value={inwardSource} onValueChange={setInwardSource}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Direct Purchase">
                    Direct Purchase (with Invoice)
                  </SelectItem>
                  <SelectItem value="ERP Transfer">
                    External ERP Transfer (Upload)
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="GRN Date" required>
              <Input
                type="date"
                className="h-8 text-xs"
                value={grnDate}
                onChange={(e) => setGrnDate(e.target.value)}
              />
            </FormField>
            <FormField label="GRN No">
              <Input
                className="h-8 text-xs bg-muted/30 font-mono font-semibold"
                placeholder="Auto"
                readOnly
                value={isEdit ? editGrn.id : "GRN-2025-XXX"}
              />
            </FormField>
            <FormField label="Remarks">
              <Input
                className="h-8 text-xs"
                placeholder="Optional remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Inward Source context banner */}
      {inwardSource && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 flex items-start gap-2",
            inwardSource === "Direct Purchase"
              ? "border-[#8B5CF6]/20 bg-[#8B5CF6]/5"
              : "border-[#00BCD4]/20 bg-[#00BCD4]/5",
          )}
        >
          <Info
            className={cn(
              "w-3.5 h-3.5 mt-0.5 shrink-0",
              inwardSource === "Direct Purchase"
                ? "text-[#8B5CF6]"
                : "text-[#00BCD4]",
            )}
          />
          <div className="text-[11px] text-foreground leading-relaxed">
            {inwardSource === "Direct Purchase" ? (
              <>
                <span className="font-bold">Direct Purchase.</span> Enter vendor
                and invoice details. Line items include unit rate and amount.
              </>
            ) : (
              <>
                <span className="font-bold">ERP Transfer.</span> Upload
                Excel/CSV to auto-create GRN lines. No invoice/pricing needed.
                <span className="font-semibold text-[#00BCD4]">
                  {" "}
                  API integration in future phase.
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Conditional: Direct Purchase / Invoice Fields */}
      {inwardSource === "Direct Purchase" && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
              Invoice Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <FormField label="Vendor / Supplier" required>
                <Input
                  className="h-8 text-xs"
                  placeholder="Vendor name"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </FormField>
              <FormField label="Invoice No" required>
                <Input
                  className="h-8 text-xs"
                  placeholder="Invoice number"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </FormField>
              <FormField label="Invoice Date" required>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </FormField>
              <FormField label="Invoice Amount">
                <Input
                  type="number"
                  className="h-8 text-xs"
                  placeholder="0.00"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                />
              </FormField>
              <FormField label="Attachment">
                <div className="h-8 border border-dashed border-border rounded-lg flex items-center justify-center text-[11px] text-muted-foreground cursor-pointer hover:border-[#8B5CF6] transition-colors font-medium">
                  <Upload className="w-3 h-3 mr-1.5" /> Upload Invoice
                </div>
              </FormField>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conditional: ERP Transfer Fields */}
      {inwardSource === "ERP Transfer" && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
              External ERP Transfer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField label="External Reference No">
                <Input
                  className="h-8 text-xs"
                  placeholder="ERP Transfer / Issue No"
                  value={externalRefNo}
                  onChange={(e) => setExternalRefNo(e.target.value)}
                />
              </FormField>
              <FormField label="Transfer Date">
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                />
              </FormField>
              <FormField label="Source Store (Client ERP)">
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Main Store - Central ERP"
                  value={sourceErpStore}
                  onChange={(e) => setSourceErpStore(e.target.value)}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items - Inline Grid */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                GRN Line Items
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {lines.length} item(s)
                {totalAmount > 0
                  ? ` | Total: $${totalAmount.toLocaleString()}`
                  : ""}
                {" "}<span className="text-[#8B5CF6]">Fields adapt based on item type (Consumable vs Spare/Accessory)</span>
              </p>
            </div>
            {inwardSource === "ERP Transfer" && (
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border hover:border-[#00BCD4] transition-colors cursor-pointer text-xs font-semibold text-foreground">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#00BCD4]" /> Bulk
                Import
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>

          {/* Upload Preview Banner (for ERP Transfer bulk import) */}
          {uploadPreview && (
            <div className="mb-5 border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-foreground">
                    Upload Preview ({uploadPreview.rows.length} rows)
                  </span>
                  {uploadPreview.rows.filter((r) => r.status !== "Valid")
                    .length > 0 && (
                    <span className="ml-3 text-xs font-bold text-[#EF4444]">
                      {
                        uploadPreview.rows.filter((r) => r.status !== "Valid")
                          .length
                      }{" "}
                      row(s) with errors -- will be skipped
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold h-8"
                    onClick={() => {
                      setUploadFile(null);
                      setUploadPreview(null);
                    }}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Discard
                  </Button>
                  <Button
                    size="sm"
                    className="text-white border-0 text-xs font-semibold h-8 px-4"
                    style={{
                      background: "linear-gradient(135deg, #10B981, #059669)",
                    }}
                    onClick={confirmUpload}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm & Add
                    All
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">
                      Item Code
                    </TableHead>
                    <TableHead className="text-xs font-bold">Qty</TableHead>
                    <TableHead className="text-xs font-bold">Batch</TableHead>
                    <TableHead className="text-xs font-bold">Expiry</TableHead>
                    <TableHead className="text-xs font-bold text-center">
                      Validation
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadPreview.rows.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={row.status !== "Valid" ? "bg-[#EF4444]/5" : ""}
                    >
                      <TableCell className="text-sm font-mono font-semibold">
                        {row.item}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {row.qty}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.batch || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.expiry || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold border-0",
                            row.status === "Valid"
                              ? "bg-[#10B981]/10 text-[#10B981]"
                              : "bg-[#EF4444]/10 text-[#EF4444]",
                          )}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Error message for quick add */}
          {qaError && (
            <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-4 py-2 text-xs font-semibold text-[#EF4444] mb-3">
              {qaError}
            </div>
          )}

          {/* Line Items Table with inline add row */}
          <div className="rounded-lg border border-border overflow-visible">
            {lines.length === 0 && !showQuickAdd && (
              <div className="py-6 flex flex-col items-center gap-1.5 text-muted-foreground">
                <Package className="w-6 h-6 opacity-40" />
                <p className="text-xs font-semibold">No line items yet</p>
                <p className="text-[11px]">
                  Click the + button below to start adding items.
                </p>
              </div>
            )}
            {(lines.length > 0 || showQuickAdd) && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 [&>th]:h-7 [&>th]:py-0 [&>th]:text-[11px]">
                    <TableHead className="font-bold text-foreground w-8">#</TableHead>
                    <TableHead className="font-bold text-foreground min-w-[140px]">Item</TableHead>
                    <TableHead className="font-bold text-foreground w-14">Type</TableHead>
                    <TableHead className="font-bold text-foreground text-right w-12">Qty</TableHead>
                    <TableHead className="font-bold text-foreground w-12">UOM</TableHead>
                    <TableHead className="font-bold text-foreground w-20">Batch</TableHead>
                    <TableHead className="font-bold text-foreground w-20">Lot No</TableHead>
                    <TableHead className="font-bold text-foreground w-20">Serial</TableHead>
                    <TableHead className="font-bold text-foreground w-22">Mfg Date</TableHead>
                    <TableHead className="font-bold text-foreground w-16">Shelf Life</TableHead>
                    <TableHead className="font-bold text-foreground w-22">Exp. Date</TableHead>
                    <TableHead className="font-bold text-foreground w-16">Warranty</TableHead>
                    <TableHead className="font-bold text-foreground w-22">Warr. Expiry</TableHead>
                    {inwardSource === "Direct Purchase" && (
                      <>
                        <TableHead className="font-bold text-foreground text-right w-16">Rate</TableHead>
                        <TableHead className="font-bold text-foreground text-right w-16">Amount</TableHead>
                      </>
                    )}
                    <TableHead className="font-bold text-foreground text-center w-14" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.map((ln, idx) => {
                    const lnCons = ln.itemType === "Consumable";
                    const lnSpAcc = ln.itemType === "Spare" || ln.itemType === "Accessory";
                    return (
                      <TableRow key={ln.id} className="h-8">
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{idx + 1}</TableCell>
                        <TableCell className="py-0.5 px-2">
                          <span className="text-xs font-semibold text-foreground">{ln.itemName}</span>
                          <span className="text-[10px] font-mono text-[#00BCD4] ml-1">{ln.itemCode}</span>
                        </TableCell>
                        <TableCell className="py-0.5 px-2">
                          <Badge className={cn("text-[9px] font-bold border-0 px-1.5 py-0", lnCons ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#8B5CF6]/10 text-[#8B5CF6]")}>{ln.itemType}</Badge>
                        </TableCell>
                        <TableCell className="text-right py-0.5 px-2 text-xs font-bold text-foreground">{ln.qtyReceived}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{ln.uom}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{lnCons ? (ln.batchNo || "-") : <span className="text-muted-foreground/40">N/A</span>}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{lnCons ? (ln.lotNumber || "-") : <span className="text-muted-foreground/40">N/A</span>}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{lnSpAcc ? (ln.serialNumbers || "-") : <span className="text-muted-foreground/40">N/A</span>}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{ln.mfgDate || "-"}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{ln.shelfLifeMonths ? `${ln.shelfLifeMonths}M` : "-"}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{ln.expiryDate || <span className="text-[#F59E0B] font-semibold">Auto</span>}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{lnSpAcc ? (ln.warrantyMonths ? `${ln.warrantyMonths}M` : "-") : <span className="text-muted-foreground/40">N/A</span>}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground py-0.5 px-2">{lnSpAcc ? (ln.warrantyExpiry || <span className="text-[#F59E0B] font-semibold">Auto</span>) : <span className="text-muted-foreground/40">N/A</span>}</TableCell>
                        {inwardSource === "Direct Purchase" && (
                          <>
                            <TableCell className="text-[11px] text-muted-foreground text-right py-0.5 px-2">{ln.unitRate > 0 ? `$${ln.unitRate}` : "-"}</TableCell>
                            <TableCell className="text-[11px] font-semibold text-foreground text-right py-0.5 px-2">{ln.lineAmount > 0 ? `$${ln.lineAmount.toLocaleString()}` : "-"}</TableCell>
                          </>
                        )}
                        <TableCell className="text-center py-0.5 px-1">
                          <div className="flex items-center justify-center gap-0">
                            <button onClick={() => removeLine(ln.id)} title="Remove" className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Inline add row */}
                  {showQuickAdd && (
                    <TableRow className="h-8 bg-[#00BCD4]/[0.03] border-t border-dashed border-[#00BCD4]/30">
                      <TableCell className="py-0.5 px-2 text-[11px] text-[#00BCD4]">+</TableCell>
                      <TableCell className="py-0.5 px-2">
                        <Select value={qaItem} onValueChange={handleItemChange}>
                          <SelectTrigger className="h-6 text-[11px] px-2">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {biomedItemLookup.map((i) => (
                              <SelectItem key={i.code} value={i.code}>
                                <span className="font-semibold">{i.name}</span>
                                <span className="text-muted-foreground ml-1">({i.itemType})</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-0.5 px-2 text-[11px] text-muted-foreground">
                        {qaSelectedItem ? (
                          <Badge className={cn("text-[9px] font-bold border-0 px-1.5 py-0", isConsumable ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#8B5CF6]/10 text-[#8B5CF6]")}>{qaSelectedItem.itemType}</Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="py-0.5 px-2">
                        <Input type="number" className="h-6 text-[11px] w-12 text-right px-1" placeholder="Qty" min="1" value={qaQty} onChange={(e) => setQaQty(e.target.value)} />
                      </TableCell>
                      <TableCell className="py-0.5 px-2 text-[11px] text-muted-foreground">{qaSelectedItem?.uom || "-"}</TableCell>
                      {/* Batch - Consumable only */}
                      <TableCell className="py-0.5 px-2">
                        {isConsumable ? (
                          <Input className="h-6 text-[11px] w-20 px-1" placeholder="Batch *" value={qaBatch} onChange={(e) => setQaBatch(e.target.value)} />
                        ) : <span className="text-[11px] text-muted-foreground/40">N/A</span>}
                      </TableCell>
                      {/* Lot Number - Consumable only */}
                      <TableCell className="py-0.5 px-2">
                        {isConsumable ? (
                          <Input className="h-6 text-[11px] w-20 px-1" placeholder="Lot No" value={qaLotNumber} onChange={(e) => setQaLotNumber(e.target.value)} />
                        ) : <span className="text-[11px] text-muted-foreground/40">N/A</span>}
                      </TableCell>
                      {/* Serial - Spare/Accessory only */}
                      <TableCell className="py-0.5 px-2">
                        {isSpareOrAccessory ? (
                          <Input className="h-6 text-[11px] w-20 px-1" placeholder="Serial *" value={qaSerial} onChange={(e) => setQaSerial(e.target.value)} />
                        ) : <span className="text-[11px] text-muted-foreground/40">N/A</span>}
                      </TableCell>
                      {/* Mfg Date - Common */}
                      <TableCell className="py-0.5 px-2">
                        <Input type="date" className="h-6 text-[11px] w-24 px-1" value={qaMfgDate} onChange={(e) => setQaMfgDate(e.target.value)} />
                      </TableCell>
                      {/* Shelf Life - auto from Store Master */}
                      <TableCell className="py-0.5 px-2">
                        <Input type="number" className="h-6 text-[11px] w-14 px-1" placeholder="60" value={qaShelfLife} onChange={(e) => setQaShelfLife(e.target.value)} />
                      </TableCell>
                      {/* Exp Date - auto-calculated */}
                      <TableCell className="py-0.5 px-2 text-[11px]">
                        {qaComputedExpiry ? <span className="text-[#10B981] font-semibold">{qaComputedExpiry}</span> : <span className="text-muted-foreground">Auto</span>}
                      </TableCell>
                      {/* Warranty - Spare/Accessory only */}
                      <TableCell className="py-0.5 px-2">
                        {isSpareOrAccessory ? (
                          <Input type="number" className="h-6 text-[11px] w-14 px-1" placeholder="Months" value={qaWarranty} onChange={(e) => setQaWarranty(e.target.value)} />
                        ) : <span className="text-[11px] text-muted-foreground/40">N/A</span>}
                      </TableCell>
                      {/* Warranty Expiry - auto-calculated */}
                      <TableCell className="py-0.5 px-2 text-[11px]">
                        {isSpareOrAccessory ? (qaComputedWarrantyExpiry ? <span className="text-[#10B981] font-semibold">{qaComputedWarrantyExpiry}</span> : <span className="text-muted-foreground">Auto</span>) : <span className="text-muted-foreground/40">N/A</span>}
                      </TableCell>
                      {inwardSource === "Direct Purchase" && (
                        <>
                          <TableCell className="py-0.5 px-2">
                            <Input type="number" className="h-6 text-[11px] w-14 text-right px-1" placeholder="0.00" step="0.01" value={qaRate} onChange={(e) => setQaRate(e.target.value)} />
                          </TableCell>
                          <TableCell className="py-0.5 px-2 text-[11px] text-muted-foreground text-right">
                            {qaRate && qaQty ? `$${(parseFloat(qaRate) * parseInt(qaQty)).toLocaleString()}` : "-"}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="py-0.5 px-1 text-center">
                        <button onClick={handleQuickAdd} title="Add item" className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-[#00BCD4] text-white hover:bg-[#00838F] transition-colors">
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Summary Row */}
                  {inwardSource === "Direct Purchase" && lines.length > 0 && (
                    <TableRow className="bg-muted/20 h-7">
                      <TableCell colSpan={13} className="text-right text-[11px] font-extrabold text-foreground py-0.5 px-2">
                        Total
                      </TableCell>
                      <TableCell className="text-right text-[11px] font-extrabold text-foreground py-0.5 px-2" colSpan={2}>
                        ${totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="py-0.5" />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {/* Tiny + button to open the inline add row */}
            {!showQuickAdd && (
              <div className="border-t border-border px-3 py-1">
                <button
                  onClick={() => {
                    resetQuickAdd();
                    setShowQuickAdd(true);
                  }}
                  className="h-4 w-4 inline-flex items-center justify-center rounded-full border border-[#00BCD4] text-[#00BCD4] hover:bg-[#00BCD4] hover:text-white transition-colors"
                  title="Add line item"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* GRN Documents */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Documents for GRN
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { key: "po", label: "Purchase Order (PO)" },
              { key: "invoice", label: "Invoice" },
              { key: "dc", label: "Delivery Challan (DC)" },
              { key: "warranty", label: "Warranty Certificate" },
              { key: "msds", label: "MSDS" },
              { key: "additional", label: "Additional Docs, If Any" },
            ].map((doc) => (
              <div key={doc.key} className="flex flex-col gap-1">
                <Label className="text-[11px] font-bold text-foreground">{doc.label}</Label>
                <label className="h-16 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:border-[#00BCD4] hover:bg-[#00BCD4]/[0.02] transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">Upload file</span>
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pb-2">
        <p className="text-[11px] text-muted-foreground">
          {lines.length} line item(s){" "}
          {lines.length > 0 && inwardSource === "Direct Purchase"
            ? `| Total: $${totalAmount.toLocaleString()}`
            : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-xs font-semibold h-8 px-3"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button variant="outline" className="text-xs font-semibold h-8 px-3">
            <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
          </Button>
          <Button
            className="text-white border-0 text-xs font-semibold h-8 px-4"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Post GRN
          </Button>
        </div>
      </div>
    </div>
  );
}

// ----- Main Export -----
export function GrnPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editGrn, setEditGrn] = useState<GrnHeader | null>(null);
  const [grns] = useState<GrnHeader[]>(mockGrns);

  return view === "list" ? (
    <GrnListView
      grns={grns}
      onAdd={() => {
        setEditGrn(null);
        setView("form");
      }}
      onView={(grn) => {
        setEditGrn(grn);
        setView("form");
      }}
    />
  ) : (
    <GrnForm
      editGrn={editGrn}
      onBack={() => {
        setEditGrn(null);
        setView("list");
      }}
    />
  );
}
