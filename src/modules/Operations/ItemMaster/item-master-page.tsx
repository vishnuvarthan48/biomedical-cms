"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
  Eye,
  MoreVertical,
  Filter,
  Download,
  X,
  Save,
  Package,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Cpu,
  Warehouse,
  Settings,
} from "lucide-react";

// ----- Types & Data (shared from item-master-data) -----
import { type ItemMaster, mockItems as _sharedMockItems } from "@/src/lib/item-master-data";
export type { ItemMaster };

// Local mutable copy for this page's CRUD operations
const mockItems: ItemMaster[] = [..._sharedMockItems];

const deviceOptions = [
  "Patient Monitor",
  "Ventilator",
  "Infusion Pump",
  "Ultrasound System",
  "Defibrillator",
  "Anesthesia Machine",
  "MRI Scanner",
  "CT Scanner",
];

// Mock stores for multi-store hospitals
const mockStores = [
  { id: "S001", name: "Central Biomedical Store", isDefault: true },
  { id: "S002", name: "ICU Store", isDefault: false },
  { id: "S003", name: "OT Store", isDefault: false },
  { id: "S004", name: "Emergency Store", isDefault: false },
];

// Mock store inventory configs
interface StoreInventoryConfig {
  storeId: string;
  rackNumber: string;
  shelfNumber: string;
  binLocation: string;
  reorderLevel: number;
  minOrderQty: number;
  reorderTimeDays: number;
}

const mockStoreConfigs: Record<string, StoreInventoryConfig> = {
  S001: {
    storeId: "S001",
    rackNumber: "R-001",
    shelfNumber: "S-01",
    binLocation: "BIN-001",
    reorderLevel: 50,
    minOrderQty: 10,
    reorderTimeDays: 14,
  },
  S002: {
    storeId: "S002",
    rackNumber: "R-002",
    shelfNumber: "S-02",
    binLocation: "BIN-002",
    reorderLevel: 20,
    minOrderQty: 5,
    reorderTimeDays: 7,
  },
};

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
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-sm font-bold text-foreground">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ----- List View -----
function ItemListView({
  items,
  onAdd,
  onEdit,
  onView,
}: {
  items: ItemMaster[];
  onAdd: () => void;
  onEdit: (item: ItemMaster) => void;
  onView: (item: ItemMaster) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const lowStockCount = items.filter(
    (i) => i.status === "Active" && i.currentStock <= i.reorderLevel,
  ).length;

  const filtered = items.filter((i) => {
    const matchSearch =
      !searchQuery ||
      i.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || i.itemType === filterCategory;
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Item Master
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage biomedical spares, consumables, and accessories
          </p>
        </div>
        <div className="flex gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FEF3C7] text-[#D97706] text-sm font-bold">
              <AlertTriangle className="w-4 h-4" /> {lowStockCount} below
              reorder level
            </div>
          )}
          <Button
            className="text-white border-0 text-sm font-semibold px-5 py-2.5 h-auto"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onAdd}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Items",
            value: items.length,
            icon: Package,
            color: "#00BCD4",
          },
          {
            label: "Spares",
            value: items.filter((i) => i.itemType === "Spare").length,
            icon: Cpu,
            color: "#8B5CF6",
          },
          {
            label: "Consumables",
            value: items.filter((i) => i.itemType === "Consumable").length,
            icon: Package,
            color: "#F59E0B",
          },
          {
            label: "Accessories",
            value: items.filter((i) => i.itemType === "Accessory").length,
            icon: Package,
            color: "#10B981",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, part number, or ID..."
            className="pl-11 h-11 bg-card border-border text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-11 w-[180px] bg-card">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Spare">Spare</SelectItem>
            <SelectItem value="Consumable">Consumable</SelectItem>
            <SelectItem value="Accessory">Accessory</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-11 w-[150px] bg-card">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
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
                    Item Code
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Item Name
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Part Number
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Category
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    Manufacturer
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground">
                    UOM
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-right">
                    Stock
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-right">
                    ROL
                  </TableHead>
                  <TableHead className="text-xs font-bold text-foreground text-center">
                    Tracking
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
                      colSpan={11}
                      className="text-center py-12 text-muted-foreground text-sm font-semibold"
                    >
                      No items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const isLow =
                      item.status === "Active" &&
                      item.currentStock <= item.reorderLevel;
                    return (
                      <TableRow
                        key={item.id}
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          isLow && "bg-[#FEF3C7]/20",
                        )}
                      >
                        <TableCell className="font-mono font-bold text-[#00BCD4] text-sm">
                          {item.itemCode}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-foreground max-w-[200px] truncate">
                          {item.itemName}
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-0.5 rounded bg-muted text-xs font-mono font-semibold">
                            {item.partNumber}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border-0",
                              item.itemType === "Spare"
                                ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                                : item.itemType === "Consumable"
                                  ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                                  : "bg-[#10B981]/10 text-[#10B981]",
                            )}
                          >
                            {item.itemType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">
                          {item.manufacturer}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.stockUom}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-sm font-bold text-right",
                            isLow ? "text-[#DC2626]" : "text-foreground",
                          )}
                        >
                          {item.currentStock}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground text-right">
                          {item.reorderLevel}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.batchRequired && (
                              <Badge className="text-[9px] font-bold border-0 bg-muted text-muted-foreground px-1.5">
                                B
                              </Badge>
                            )}
                            {item.expiryRequired && (
                              <Badge className="text-[9px] font-bold border-0 bg-[#EF4444]/10 text-[#EF4444] px-1.5">
                                E
                              </Badge>
                            )}
                            {item.serialTracking && (
                              <Badge className="text-[9px] font-bold border-0 bg-[#00BCD4]/10 text-[#00BCD4] px-1.5">
                                S
                              </Badge>
                            )}
                            {!item.batchRequired &&
                              !item.expiryRequired &&
                              !item.serialTracking && (
                                <span className="text-xs text-muted-foreground">
                                  -
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border-0",
                              item.status === "Active"
                                ? "bg-[#10B981]/10 text-[#10B981]"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {item.status}
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
                              <DropdownMenuItem onClick={() => onView(item)}>
                                <Eye className="w-4 h-4 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(item)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit
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

// ----- Form View -----
function ItemForm({
  editItem,
  onBack,
}: {
  editItem: ItemMaster | null;
  onBack: () => void;
}) {
  const isEdit = !!editItem;
  const [basicOpen, setBasicOpen] = useState(true);
  const [trackingOpen, setTrackingOpen] = useState(true);
  const [storeConfigOpen, setStoreConfigOpen] = useState(true);
  const [storeConfigModalOpen, setStoreConfigModalOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Form state
  const [hospital, setHospital] = useState(editItem?.hospital || "");
  const [department, setDepartment] = useState(editItem?.department || "");
  const [itemType, setItemType] = useState(editItem?.itemType || "");
  const [itemName, setItemName] = useState(editItem?.itemName || "");
  const [partNumber, setPartNumber] = useState(editItem?.partNumber || "");
  const [devices, setDevices] = useState<string[]>(
    editItem?.compatibleDevices || [],
  );
  const [description, setDescription] = useState(editItem?.description || "");
  const [itemCode, setItemCode] = useState(editItem?.itemCode || "");
  const [catalogueNumber, setCatalogueNumber] = useState(
    editItem?.catalogueNumber || "",
  );
  const [manufacturer, setManufacturer] = useState(
    editItem?.manufacturer || "",
  );
  const [stockUom, setStockUom] = useState(editItem?.stockUom || "");
  const [purchaseUom, setPurchaseUom] = useState(editItem?.purchaseUom || "");
  const [batchReq, setBatchReq] = useState(editItem?.batchRequired || false);
  const [expiryReq, setExpiryReq] = useState(editItem?.expiryRequired || false);
  const [serialReq, setSerialReq] = useState(editItem?.serialTracking || false);
  const [status, setStatus] = useState(editItem?.status || "Active");

  // Store inventory configs
  const [storeConfigs, setStoreConfigs] = useState<Record<string, StoreInventoryConfig>>(mockStoreConfigs);

  // Store config form state
  const [configRackNum, setConfigRackNum] = useState("");
  const [configShelfNum, setConfigShelfNum] = useState("");
  const [configBinLoc, setConfigBinLoc] = useState("");
  const [configReorderLvl, setConfigReorderLvl] = useState(0);
  const [configMinQty, setConfigMinQty] = useState(1);
  const [configReorderDays, setConfigReorderDays] = useState(14);

  const [devicesOpen, setDevicesOpen] = useState(false);

  const toggleDevice = (d: string) => {
    setDevices((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleStoreConfigEdit = (storeId: string) => {
    const config = storeConfigs[storeId];
    if (config) {
      setSelectedStoreId(storeId);
      setConfigRackNum(config.rackNumber);
      setConfigShelfNum(config.shelfNumber);
      setConfigBinLoc(config.binLocation);
      setConfigReorderLvl(config.reorderLevel);
      setConfigMinQty(config.minOrderQty);
      setConfigReorderDays(config.reorderTimeDays);
      setStoreConfigModalOpen(true);
    }
  };

  const handleStoreConfigSave = () => {
    if (selectedStoreId) {
      setStoreConfigs((prev) => ({
        ...prev,
        [selectedStoreId]: {
          storeId: selectedStoreId,
          rackNumber: configRackNum,
          shelfNumber: configShelfNum,
          binLocation: configBinLoc,
          reorderLevel: configReorderLvl,
          minOrderQty: configMinQty,
          reorderTimeDays: configReorderDays,
        },
      }));
      setStoreConfigModalOpen(false);
      setSelectedStoreId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {isEdit ? "Edit Item" : "New Item"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? `Editing ${editItem.itemCode} - ${editItem.itemName}`
              : "Create a new biomedical item in the master"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="text-sm font-semibold h-10 px-4"
            onClick={onBack}
          >
            Cancel
          </Button>
          <Button
            className="text-white border-0 text-sm font-semibold h-10 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          >
            <Save className="w-4 h-4 mr-1.5" />{" "}
            {isEdit ? "Update Item" : "Save Item"}
          </Button>
        </div>
      </div>

      {/* Section A: Basic Identification */}
      <Card className="border border-border shadow-sm">
        <button
          onClick={() => setBasicOpen(!basicOpen)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h3 className="text-base font-extrabold text-foreground">
            Basic Identification & UOM
          </h3>
          {basicOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {basicOpen && (
          <CardContent className="px-6 pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField label="Hospital / Clinic" required>
                <Select value={hospital} onValueChange={setHospital}>
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
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Department">
                <Input
                  className="h-10"
                  placeholder="e.g. Biomedical"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </FormField>
              <FormField label="Item Type (Category)" required>
                <Select value={itemType} onValueChange={setItemType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spare">Spare</SelectItem>
                    <SelectItem value="Consumable">Consumable</SelectItem>
                    <SelectItem value="Accessory">Accessory</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Item Code">
                <Input
                  className="h-10 bg-muted/30"
                  placeholder="Auto-generated"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                />
              </FormField>
              <FormField label="Item Name" required>
                <Input
                  className="h-10"
                  placeholder="Item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </FormField>
              <FormField label="Part Number" required>
                <Input
                  className="h-10"
                  placeholder="Unique part number"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                />
              </FormField>
              <FormField label="Catalogue Number">
                <Input
                  className="h-10"
                  placeholder="Catalogue number"
                  value={catalogueNumber}
                  onChange={(e) => setCatalogueNumber(e.target.value)}
                />
              </FormField>
              <FormField label="Manufacturer">
                <Input
                  className="h-10"
                  placeholder="Manufacturer name"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </FormField>

              {/* Compatible Devices - multi-select */}
              <FormField
                label="Compatible Devices"
                required
                className="lg:col-span-2"
              >
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDevicesOpen(!devicesOpen)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center justify-between text-left"
                  >
                    <span
                      className={
                        devices.length
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {devices.length
                        ? devices.join(", ")
                        : "Select compatible devices"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {devicesOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
                      {deviceOptions.map((d) => (
                        <label
                          key={d}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={devices.includes(d)}
                            onChange={() => toggleDevice(d)}
                            className="w-4 h-4 rounded border-border accent-[#00BCD4]"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {d}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>

              <FormField label="Stock / Issue UOM" required>
                <Select value={stockUom} onValueChange={setStockUom}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Box (50)">Box (50)</SelectItem>
                    <SelectItem value="Box (100)">Box (100)</SelectItem>
                    <SelectItem value="Pair">Pair</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                    <SelectItem value="Litre">Litre</SelectItem>
                    <SelectItem value="Roll">Roll</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Purchase UOM">
                <Select value={purchaseUom} onValueChange={setPurchaseUom}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Same as stock UOM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Box (50)">Box (50)</SelectItem>
                    <SelectItem value="Box (100)">Box (100)</SelectItem>
                    <SelectItem value="Pair">Pair</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                    <SelectItem value="Litre">Litre</SelectItem>
                    <SelectItem value="Roll">Roll</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <FormField label="Description" className="lg:col-span-2">
                <Textarea
                  className="min-h-[80px]"
                  placeholder="Item description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormField>
              <FormField label="Status" required>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Store-wise Configuration Section */}
      <Card className="border border-border shadow-sm">
        <button
          onClick={() => setStoreConfigOpen(!storeConfigOpen)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <div className="flex items-center gap-3">
            <Warehouse className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-base font-extrabold text-foreground">
              Storage Location & Inventory Policies
            </h3>
          </div>
          {storeConfigOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {storeConfigOpen && (
          <CardContent className="px-6 pb-6 pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              Configure storage location and reorder policies for each store. In multi-store hospitals, different policies can be set per location.
            </p>

            {/* Store Configuration Table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Store Name</TableHead>
                    <TableHead className="font-bold">Rack #</TableHead>
                    <TableHead className="font-bold">Shelf #</TableHead>
                    <TableHead className="font-bold">Bin Location</TableHead>
                    <TableHead className="font-bold text-right">Reorder Level</TableHead>
                    <TableHead className="font-bold text-right">Min Qty</TableHead>
                    <TableHead className="font-bold text-right">Lead Time (Days)</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStores.map((store) => {
                    const config = storeConfigs[store.id];
                    const configured = !!config;
                    return (
                      <TableRow
                        key={store.id}
                        className={!configured ? "bg-muted/30 opacity-60" : ""}
                      >
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            {store.name}
                            {store.isDefault && (
                              <Badge className="text-[9px] font-bold bg-[#10B981]/10 text-[#10B981] border-0 px-1.5">
                                Default
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={configured ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {config?.rackNumber || "—"}
                        </TableCell>
                        <TableCell className={configured ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {config?.shelfNumber || "—"}
                        </TableCell>
                        <TableCell className={configured ? "text-foreground font-medium" : "text-muted-foreground"}>
                          {config?.binLocation || "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#00BCD4]">
                          {config?.reorderLevel || "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-[#8B5CF6]">
                          {config?.minOrderQty || "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-foreground">
                          {config?.reorderTimeDays || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-[#00BCD4]/10 hover:text-[#00BCD4]"
                            onClick={() => handleStoreConfigEdit(store.id)}
                          >
                            {configured ? (
                              <Pencil className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Click the icon to configure storage location and reorder planning for each store.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Section B: Traceability Controls */}
      <Card className="border border-border shadow-sm">
        <button
          onClick={() => setTrackingOpen(!trackingOpen)}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h3 className="text-base font-extrabold text-foreground">
            Biomedical Traceability Controls
          </h3>
          {trackingOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        {trackingOpen && (
          <CardContent className="px-6 pb-6 pt-0">
            <p className="text-sm text-muted-foreground mb-4">
              These flags control what details must be captured during GRN
              inward.
            </p>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-3 rounded-lg border border-border hover:border-[#00BCD4]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={batchReq}
                  onChange={(e) => setBatchReq(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-[#00BCD4]"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Batch / Lot Required
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Batch number must be captured during GRN
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-3 rounded-lg border border-border hover:border-[#EF4444]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={expiryReq}
                  onChange={(e) => setExpiryReq(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-[#EF4444]"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Expiry Required
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expiry date must be captured during GRN
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-3 rounded-lg border border-border hover:border-[#8B5CF6]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={serialReq}
                  onChange={(e) => setSerialReq(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-[#8B5CF6]"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Serial Tracking Required
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Serial number per unit captured during GRN
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button
          variant="outline"
          className="text-sm font-semibold h-10 px-5"
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-6"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
        >
          <Save className="w-4 h-4 mr-1.5" />{" "}
          {isEdit ? "Update Item" : "Save Item"}
        </Button>
      </div>

      {/* Store Configuration Modal */}
      {storeConfigModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl border border-border shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Warehouse className="w-5 h-5 text-[#F59E0B]" />
                  <h3 className="text-lg font-extrabold text-foreground">
                    {mockStores.find((s) => s.id === selectedStoreId)?.name}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setStoreConfigModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Define storage location and reorder policies for this item at{" "}
                  <span className="font-semibold text-foreground">
                    {mockStores.find((s) => s.id === selectedStoreId)?.name}
                  </span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Rack Number" required>
                    <Input
                      className="h-10"
                      placeholder="e.g. R-001"
                      value={configRackNum}
                      onChange={(e) => setConfigRackNum(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Shelf Number" required>
                    <Input
                      className="h-10"
                      placeholder="e.g. S-01"
                      value={configShelfNum}
                      onChange={(e) => setConfigShelfNum(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Bin Location">
                    <Input
                      className="h-10"
                      placeholder="e.g. BIN-001"
                      value={configBinLoc}
                      onChange={(e) => setConfigBinLoc(e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="border-t border-border pt-4 mt-4">
                  <h4 className="text-sm font-bold text-foreground mb-4">
                    Reorder Planning
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Reorder Level" required>
                      <Input
                        className="h-10"
                        type="number"
                        min="0"
                        placeholder="Qty to trigger reorder"
                        value={configReorderLvl}
                        onChange={(e) =>
                          setConfigReorderLvl(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormField>

                    <FormField label="Minimum Order Qty" required>
                      <Input
                        className="h-10"
                        type="number"
                        min="1"
                        placeholder="Min qty to order"
                        value={configMinQty}
                        onChange={(e) =>
                          setConfigMinQty(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormField>

                    <FormField label="Lead Time (Days)" required>
                      <Input
                        className="h-10"
                        type="number"
                        min="1"
                        placeholder="Reorder lead time"
                        value={configReorderDays}
                        onChange={(e) =>
                          setConfigReorderDays(parseInt(e.target.value) || 14)
                        }
                      />
                    </FormField>
                  </div>
                </div>
              </CardContent>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                <Button
                  variant="outline"
                  className="text-sm font-semibold h-9 px-4"
                  onClick={() => setStoreConfigModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="text-white border-0 text-sm font-semibold h-9 px-5"
                  style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                  onClick={handleStoreConfigSave}
                >
                  <Save className="w-4 h-4 mr-1.5" /> Save Configuration
                </Button>
              </div>
            </Card>
          </div>,
          document.body,
        )}
    </div>
  );
}

// ----- Main Export -----
export function ItemMasterPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editItem, setEditItem] = useState<ItemMaster | null>(null);
  const [items] = useState<ItemMaster[]>(mockItems);

  return view === "list" ? (
    <ItemListView
      items={items}
      onAdd={() => {
        setEditItem(null);
        setView("form");
      }}
      onEdit={(item) => {
        setEditItem(item);
        setView("form");
      }}
      onView={(item) => {
        setEditItem(item);
        setView("form");
      }}
    />
  ) : (
    <ItemForm
      editItem={editItem}
      onBack={() => {
        setEditItem(null);
        setView("list");
      }}
    />
  );
}
