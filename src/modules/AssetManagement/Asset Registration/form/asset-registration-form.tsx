"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Plus,
  Trash2,
  Upload,
  Monitor,
  Cpu,
  MapPin,
  Building,
  FileText,
  Wrench as WrenchIcon,
  HardDrive,
  ScrollText,
  FolderOpen,
  Settings2,
  ArrowLeft,
  CheckCircle2,
  Bluetooth,
  Radio,
  MapPinned,
  Signal,
  Wifi,
  BatteryMedium,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Switch } from "@/src/components/ui/switch";

const TABS = [
  { id: "generic", label: "Generic", icon: Monitor, mandatory: true },
  {
    id: "accessories",
    label: "Accessories",
    icon: Settings2,
    mandatory: false,
  },
  { id: "child-assets", label: "Child Assets", icon: Cpu, mandatory: false },
  {
    id: "sw-network",
    label: "S/W & Network",
    icon: HardDrive,
    mandatory: false,
  },
  { id: "location", label: "Location", icon: MapPin, mandatory: true },
  {
    id: "tracking",
    label: "Asset Tracking",
    icon: Bluetooth,
    mandatory: false,
  },
  { id: "vendor", label: "Vendor", icon: Building, mandatory: true },
  {
    id: "installation",
    label: "Inst. Records",
    icon: FileText,
    mandatory: false,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: WrenchIcon,
    mandatory: false,
  },
  { id: "contract", label: "Contract", icon: ScrollText, mandatory: false },
  { id: "documents", label: "Documents", icon: FolderOpen, mandatory: false },
  { id: "barcode-qr", label: "Barcode / QR", icon: QrCode, mandatory: false },
];

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
        {label}
        {required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

// Registered devices from Device Management (data source for auto-populate)
const registeredDevices = [
  {
    id: "DEV-001",
    deviceName: "Patient Monitor",
    deviceType: "Monitoring",
    genericName: "Multi-Parameter Patient Monitor",
    manufacturer: "Philips Medical",
    countryOfOrigin: "Netherlands",
    depreciationMethod: "SLM",
    usefulLifeYears: "10",
    salvageValue: "5000",
    depreciationRate: "10",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-002",
    deviceName: "Ventilator",
    deviceType: "Life Support",
    genericName: "Mechanical Ventilator",
    manufacturer: "Draeger",
    countryOfOrigin: "Germany",
    depreciationMethod: "SLM",
    usefulLifeYears: "8",
    salvageValue: "8000",
    depreciationRate: "12.5",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-003",
    deviceName: "Infusion Pump",
    deviceType: "Infusion",
    genericName: "Volumetric Infusion Pump",
    manufacturer: "BD (Becton Dickinson)",
    countryOfOrigin: "USA",
    depreciationMethod: "SLM",
    usefulLifeYears: "7",
    salvageValue: "500",
    depreciationRate: "14.3",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-004",
    deviceName: "Ultrasound System",
    deviceType: "Imaging",
    genericName: "Diagnostic Ultrasound Scanner",
    manufacturer: "GE Healthcare",
    countryOfOrigin: "South Korea",
    depreciationMethod: "WDV",
    usefulLifeYears: "10",
    salvageValue: "15000",
    depreciationRate: "15",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-005",
    deviceName: "Defibrillator",
    deviceType: "Emergency",
    genericName: "External Defibrillator/Monitor",
    manufacturer: "Philips Medical",
    countryOfOrigin: "USA",
    depreciationMethod: "SLM",
    usefulLifeYears: "8",
    salvageValue: "2000",
    depreciationRate: "12.5",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-006",
    deviceName: "Anesthesia Machine",
    deviceType: "Life Support",
    genericName: "Anesthesia Delivery System",
    manufacturer: "GE Healthcare",
    countryOfOrigin: "USA",
    depreciationMethod: "SLM",
    usefulLifeYears: "12",
    salvageValue: "20000",
    depreciationRate: "8.3",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-007",
    deviceName: "MRI Scanner",
    deviceType: "Imaging",
    genericName: "Magnetic Resonance Imaging System",
    manufacturer: "Siemens Healthineers",
    countryOfOrigin: "Germany",
    depreciationMethod: "SLM",
    usefulLifeYears: "15",
    salvageValue: "50000",
    depreciationRate: "6.7",
    depreciationFrequency: "ANNUAL",
  },
  {
    id: "DEV-008",
    deviceName: "CT Scanner",
    deviceType: "Imaging",
    genericName: "Computed Tomography Scanner",
    manufacturer: "Siemens Healthineers",
    countryOfOrigin: "Germany",
    depreciationMethod: "WDV",
    usefulLifeYears: "12",
    salvageValue: "40000",
    depreciationRate: "15",
    depreciationFrequency: "ANNUAL",
  },
];

const DEFAULT_DEVICE_IMAGE = "/images/default-device.jpg";

// Tab 1: Generic
function GenericTab() {
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [genericName, setGenericName] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  // Depreciation fields auto-populated from Device Registration
  const [depMethod, setDepMethod] = useState("");
  const [usefulLife, setUsefulLife] = useState("");
  const [salvageValue, setSalvageValue] = useState("");
  const [depRate, setDepRate] = useState("");
  const [depFrequency, setDepFrequency] = useState("");
  // Asset image
  const [assetImageUrl, setAssetImageUrl] = useState<string | null>(null);
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAssetImageUrl(url);
      setUseDefaultImage(false);
    }
  };

  const handleRemoveImage = () => {
    setAssetImageUrl(null);
    setUseDefaultImage(true);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const displayImage = assetImageUrl || (useDefaultImage ? DEFAULT_DEVICE_IMAGE : null);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    const found = registeredDevices.find((d) => d.id === deviceId);
    if (found) {
      setDeviceType(found.deviceType);
      setManufacturer(found.manufacturer);
      setGenericName(found.genericName);
      setCountryOfOrigin(found.countryOfOrigin);
      setDepMethod(found.depreciationMethod);
      setUsefulLife(found.usefulLifeYears);
      setSalvageValue(found.salvageValue);
      setDepRate(found.depreciationRate);
      setDepFrequency(found.depreciationFrequency);
    } else {
      setDeviceType("");
      setManufacturer("");
      setGenericName("");
      setCountryOfOrigin("");
      setDepMethod("");
      setUsefulLife("");
      setSalvageValue("");
      setDepRate("");
      setDepFrequency("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Device Identification */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Device Identification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Hospital / Clinic" required>
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apollo-chennai">
                  Apollo Hospital - Chennai
                </SelectItem>
                <SelectItem value="apollo-delhi">
                  Apollo Hospital - Delhi
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Asset ID">
            <Input
              className="h-10 bg-muted/30"
              placeholder="Auto-generated"
              readOnly
            />
          </FormField>
          <FormField label="Device" required>
            <Select value={selectedDevice} onValueChange={handleDeviceChange}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {registeredDevices.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.deviceName} ({d.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Device Type">
            <Input
              className={cn(
                "h-10",
                selectedDevice && "bg-muted/30 font-semibold",
              )}
              placeholder="Auto-populated from device"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              readOnly={!!selectedDevice}
            />
          </FormField>
          <FormField label="Manufacturer">
            <Input
              className={cn(
                "h-10",
                selectedDevice && "bg-muted/30 font-semibold",
              )}
              placeholder="Auto-populated from device"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              readOnly={!!selectedDevice}
            />
          </FormField>
          <FormField label="Generic Name">
            <Input
              className={cn(
                "h-10",
                selectedDevice && "bg-muted/30 font-semibold",
              )}
              placeholder="Auto-populated from device"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              readOnly={!!selectedDevice}
            />
          </FormField>
          <FormField label="Country of Origin" required>
            <Select
              value={countryOfOrigin}
              onValueChange={(v) => setCountryOfOrigin(v)}
              disabled={!!selectedDevice}
            >
              <SelectTrigger
                className={cn(
                  "h-10",
                  selectedDevice && "bg-muted/30 font-semibold",
                )}
              >
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">United States</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Netherlands">Netherlands</SelectItem>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="South Korea">South Korea</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="France">France</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Serial No" required>
            <Input className="h-10" placeholder="Manufacturer serial number" />
          </FormField>
        </div>
      </div>

      {/* Asset Image Section */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Asset Image
        </h3>
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Image preview */}
          <div className="relative w-48 h-48 shrink-0 rounded-xl border-2 border-dashed border-border bg-muted/20 overflow-hidden group">
            {displayImage ? (
              <>
                <img
                  src={displayImage}
                  alt="Asset"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                {useDefaultImage && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/70 text-background">
                    Default
                  </span>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Monitor className="w-10 h-10" />
                <span className="text-xs font-medium">No image</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 justify-center">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 text-sm font-semibold gap-2"
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {assetImageUrl ? "Change Image" : "Upload Image"}
            </Button>

            {assetImageUrl && (
              <Button
                type="button"
                variant="outline"
                className="h-10 text-sm font-semibold gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                onClick={handleRemoveImage}
              >
                <Trash2 className="w-4 h-4" />
                Remove Image
              </Button>
            )}

            <div className="flex items-center gap-2 mt-1">
              <Switch
                checked={useDefaultImage && !assetImageUrl}
                onCheckedChange={(checked) => {
                  if (!assetImageUrl) setUseDefaultImage(checked);
                }}
                disabled={!!assetImageUrl}
              />
              <Label className="text-sm text-muted-foreground font-medium cursor-pointer">
                Use default image when no photo uploaded
              </Label>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Upload a photo of the asset. If no image is uploaded, a default
              device image will be displayed across the system for this asset.
            </p>
          </div>
        </div>
      </div>

      {/* Device Classification */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Device Classification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Device Type">
            <Input
              className={cn(
                "h-10",
                selectedDevice && "bg-muted/30 font-semibold",
              )}
              value={deviceType}
              readOnly
              placeholder="Auto-populated from device"
            />
          </FormField>
          <FormField label="Manufactured Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Tag No">
            <Input className="h-10" placeholder="Internal tag number" />
          </FormField>
          <FormField label="Lot No">
            <Input className="h-10" placeholder="Manufacturing lot/batch" />
          </FormField>
          <FormField label="Firmware Version">
            <Input className="h-10" placeholder="e.g., v3.2.1" />
          </FormField>
          <FormField label="Software Version">
            <Input className="h-10" placeholder="e.g., v5.0" />
          </FormField>
        </div>
      </div>

      {/* Configuration */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Option in Device" className="lg:col-span-2">
            <Textarea
              className="min-h-[60px]"
              placeholder="Installed options, modules, configurations..."
            />
          </FormField>
          <FormField label="Connection Type">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WIRED">Wired</SelectItem>
                <SelectItem value="WIRELESS">Wireless</SelectItem>
                <SelectItem value="BLUETOOTH">Bluetooth</SelectItem>
                <SelectItem value="USB">USB</SelectItem>
                <SelectItem value="SERIAL">Serial</SelectItem>
                <SelectItem value="NONE">None</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Control No">
            <Input className="h-10" placeholder="Internal control number" />
          </FormField>
          <FormField label="Reference No">
            <Input className="h-10" placeholder="PO or project code" />
          </FormField>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <Checkbox /> Capital Equipment
            </label>
          </div>
        </div>
      </div>

      {/* Purchase Cost */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Purchase Cost
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Purchase Price" required>
            <Input
              type="number"
              className="h-10"
              placeholder="0.00"
              step="0.01"
            />
          </FormField>
          <FormField label="Currency">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Tax / GST (%)">
            <Input
              type="number"
              className="h-10"
              placeholder="e.g. 18"
              step="0.01"
            />
          </FormField>
          <FormField label="Tax Amount">
            <Input
              type="number"
              className="h-10 bg-muted/30"
              placeholder="Auto-calculated"
              readOnly
            />
          </FormField>
          <FormField label="Total Cost (Incl. Tax)">
            <Input
              type="number"
              className="h-10 bg-muted/30 font-semibold"
              placeholder="Auto-calculated"
              readOnly
            />
          </FormField>
          <FormField label="Funding Source">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAPEX">
                  Capital Expenditure (CAPEX)
                </SelectItem>
                <SelectItem value="OPEX">
                  Operating Expenditure (OPEX)
                </SelectItem>
                <SelectItem value="GRANT">Grant / Donation</SelectItem>
                <SelectItem value="LEASE">Lease</SelectItem>
                <SelectItem value="LOAN">Loan Funded</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Budget Code">
            <Input className="h-10" placeholder="e.g. CAPEX-BME-2026-001" />
          </FormField>
        </div>
      </div>

      {/* Depreciation - Auto-populated from Device Registration */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Depreciation
        </h3>
        {selectedDevice && depMethod ? (
          <div className="rounded-lg bg-[#00BCD4]/5 border border-[#00BCD4]/20 px-4 py-3 mb-4 text-sm text-[#00838F] font-semibold">
            Depreciation configuration auto-populated from Device Registration.
            These values are read-only.
          </div>
        ) : !selectedDevice ? (
          <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 mb-4 text-sm text-muted-foreground font-semibold">
            Select a Device above to auto-populate depreciation details from
            Device Registration master data.
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Depreciation Method" required>
            <Select
              value={depMethod}
              onValueChange={(v) => !selectedDevice && setDepMethod(v)}
              disabled={!!selectedDevice}
            >
              <SelectTrigger
                className={cn(
                  "h-10",
                  selectedDevice && depMethod && "bg-muted/30 font-semibold",
                )}
              >
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SLM">Straight Line Method (SLM)</SelectItem>
                <SelectItem value="WDV">Written Down Value (WDV)</SelectItem>
                <SelectItem value="DDB">Double Declining Balance</SelectItem>
                <SelectItem value="SYD">Sum of Years Digits</SelectItem>
                <SelectItem value="UOP">Units of Production</SelectItem>
                <SelectItem value="NONE">No Depreciation</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Useful Life (Years)" required>
            <Input
              type="number"
              className={cn(
                "h-10",
                selectedDevice && "bg-muted/30 font-semibold",
              )}
              placeholder="e.g. 10"
              min="1"
              max="50"
              value={usefulLife}
              onChange={(e) => !selectedDevice && setUsefulLife(e.target.value)}
              readOnly={!!selectedDevice}
            />
          </FormField>
          <FormField label="Salvage / Residual Value">
            <Input
              type="number"
              className={cn(
                "h-10",
                selectedDevice && "bg-muted/30 font-semibold",
              )}
              placeholder="0.00"
              step="0.01"
              value={salvageValue}
              onChange={(e) =>
                !selectedDevice && setSalvageValue(e.target.value)
              }
              readOnly={!!selectedDevice}
            />
          </FormField>
          <FormField label="Depreciation Rate (%)">
            <Input
              type="number"
              className={cn(
                "h-10",
                selectedDevice ? "bg-muted/30 font-semibold" : "bg-muted/30",
              )}
              placeholder="Auto-calculated"
              value={depRate}
              onChange={(e) => !selectedDevice && setDepRate(e.target.value)}
              readOnly={!!selectedDevice}
            />
          </FormField>
          <FormField label="Depreciation Frequency" required>
            <Select
              value={depFrequency}
              onValueChange={(v) => !selectedDevice && setDepFrequency(v)}
              disabled={!!selectedDevice}
            >
              <SelectTrigger
                className={cn(
                  "h-10",
                  selectedDevice && depFrequency && "bg-muted/30 font-semibold",
                )}
              >
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Depreciation Start Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Accumulated Depreciation">
            <Input
              type="number"
              className="h-10 bg-muted/30"
              placeholder="Auto-calculated"
              readOnly
            />
          </FormField>
          <FormField label="Current Book Value">
            <Input
              type="number"
              className="h-10 bg-muted/30 font-semibold"
              placeholder="Auto-calculated"
              readOnly
            />
          </FormField>
        </div>
      </div>

      {/* Classification & Status */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Classification & Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Asset Category">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="life-support">Life Support</SelectItem>
                <SelectItem value="lab">Laboratory</SelectItem>
                <SelectItem value="surgical">Surgical</SelectItem>
                <SelectItem value="monitoring">Patient Monitoring</SelectItem>
                <SelectItem value="sterilization">Sterilization</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Asset Sub-Category">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select sub-category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mri">MRI</SelectItem>
                <SelectItem value="ct">CT</SelectItem>
                <SelectItem value="xray">X-Ray</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Asset Owner BME">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select BME" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rajesh">Dr. Rajesh K.</SelectItem>
                <SelectItem value="anand">Tech. Anand S.</SelectItem>
                <SelectItem value="priya">Tech. Priya M.</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Asset Status">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="working">Working Fine</SelectItem>
                <SelectItem value="repair">Under Repair</SelectItem>
                <SelectItem value="condemned">Condemned</SelectItem>
                <SelectItem value="standby">Standby</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="not-installed">Not Installed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Tab 2: Accessories
function AccessoriesTab() {
  const [accessories, setAccessories] = useState([{ id: 1 }]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-base text-muted-foreground">
          Add peripherals, probes, cables, and other accessories.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAccessories([...accessories, { id: Date.now() }])}
        >
          <Plus className="w-4 h-4 mr-1" /> Add Accessory
        </Button>
      </div>
      {accessories.map((acc, idx) => (
        <Card key={acc.id} className="border border-border shadow-none">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">
              Accessory {idx + 1}
            </CardTitle>
            {accessories.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[#EF4444] h-7 w-7 p-0"
                onClick={() =>
                  setAccessories(accessories.filter((a) => a.id !== acc.id))
                }
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField label="Type">
                <Select>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROBE">Probe</SelectItem>
                    <SelectItem value="CABLE">Cable</SelectItem>
                    <SelectItem value="ADAPTER">Adapter</SelectItem>
                    <SelectItem value="BATTERY">Battery</SelectItem>
                    <SelectItem value="SENSOR">Sensor</SelectItem>
                    <SelectItem value="TRANSDUCER">Transducer</SelectItem>
                    <SelectItem value="PERIPHERAL">Peripheral</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Item Name">
                <Input className="h-10" placeholder="Accessory name" />
              </FormField>
              <FormField label="Serial No">
                <Input className="h-10" placeholder="Serial number" />
              </FormField>
              <FormField label="Manufacturer">
                <Input className="h-10" placeholder="Manufacturer" />
              </FormField>
              <FormField label="Part No">
                <Input className="h-10" placeholder="OEM part number" />
              </FormField>
              <FormField label="Quantity">
                <Input
                  type="number"
                  className="h-10"
                  placeholder="1"
                  defaultValue="1"
                />
              </FormField>
              <FormField label="Installation Date">
                <Input type="date" className="h-10" />
              </FormField>
              <FormField label="Warranty Expiry">
                <Input type="date" className="h-10" />
              </FormField>
              <FormField label="Condition">
                <Select>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="FAIR">Fair</SelectItem>
                    <SelectItem value="REPLACE">Needs Replacement</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Cost (AED)">
                <Input type="number" className="h-10" placeholder="0.00" />
              </FormField>
              <FormField label="Notes">
                <Input className="h-10" placeholder="Additional notes" />
              </FormField>
              <FormField label="Status">
                <Select>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Tab 3: Child Assets
function ChildAssetsTab() {
  const [children, setChildren] = useState([{ id: 1 }]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-base text-muted-foreground">
          Link sub-assets or component equipment to this parent device.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChildren([...children, { id: Date.now() }])}
        >
          <Plus className="w-4 h-4 mr-1" /> Link Child Asset
        </Button>
      </div>
      {children.map((child, idx) => (
        <Card key={child.id} className="border border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">
                Child Asset {idx + 1}
              </span>
              {children.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#EF4444] h-7 w-7 p-0"
                  onClick={() =>
                    setChildren(children.filter((c) => c.id !== child.id))
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField label="Asset No.">
                <Select>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eq001">EQ-001 - MRI Scanner</SelectItem>
                    <SelectItem value="eq002">EQ-002 - CT Scanner</SelectItem>
                    <SelectItem value="eq003">EQ-003 - Ventilator</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Device Name">
                <Input
                  className="h-10 bg-muted/30"
                  placeholder="Auto-populated"
                  readOnly
                />
              </FormField>
              <FormField label="Model">
                <Input
                  className="h-10 bg-muted/30"
                  placeholder="Auto-populated"
                  readOnly
                />
              </FormField>
              <FormField label="Serial No">
                <Input
                  className="h-10 bg-muted/30"
                  placeholder="Auto-populated"
                  readOnly
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Tab 4: S/W & Network
function SWNetworkTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Network Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Device Identifier (UDI)">
            <Input className="h-10" placeholder="DICOM/HL7 identifier" />
          </FormField>
          <FormField label="AE Title">
            <Input className="h-10" placeholder="DICOM AE Title" />
          </FormField>
          <FormField label="FQDN">
            <Input className="h-10" placeholder="Fully Qualified Domain Name" />
          </FormField>
          <FormField label="IP Type">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STATIC">Static</SelectItem>
                <SelectItem value="DHCP">DHCP</SelectItem>
                <SelectItem value="NONE">None</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Network Port">
            <Input className="h-10" placeholder="Port number" />
          </FormField>
          <FormField label="IP Address">
            <Input className="h-10" placeholder="192.168.x.x" />
          </FormField>
          <FormField label="Subnet Mask">
            <Input className="h-10" placeholder="255.255.255.0" />
          </FormField>
          <FormField label="Default Gateway">
            <Input className="h-10" placeholder="Gateway IP" />
          </FormField>
          <FormField label="Domain Name">
            <Input className="h-10" placeholder="Network domain" />
          </FormField>
          <FormField label="NTP Server">
            <Input className="h-10" placeholder="Time server" />
          </FormField>
        </div>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          MAC Addresses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Ethernet MAC 1">
            <Input className="h-10" placeholder="XX:XX:XX:XX:XX:XX" />
          </FormField>
          <FormField label="Ethernet MAC 2">
            <Input className="h-10" placeholder="XX:XX:XX:XX:XX:XX" />
          </FormField>
          <FormField label="Wireless MAC">
            <Input className="h-10" placeholder="XX:XX:XX:XX:XX:XX" />
          </FormField>
          <FormField label="Bluetooth MAC">
            <Input className="h-10" placeholder="XX:XX:XX:XX:XX:XX" />
          </FormField>
        </div>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Software License
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Software License">
            <Input className="h-10" placeholder="License name" />
          </FormField>
          <FormField label="License Type">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERPETUAL">Perpetual</SelectItem>
                <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="OEM">OEM</SelectItem>
                <SelectItem value="OPEN_SOURCE">Open Source</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="License Start Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Validity (Months)">
            <Input type="number" className="h-10" placeholder="12" />
          </FormField>
          <FormField label="License Key">
            <Input className="h-10" placeholder="Activation code" />
          </FormField>
          <FormField label="Renewal Date">
            <Input type="date" className="h-10" />
          </FormField>
        </div>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Integration License
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Integration License">
            <Input className="h-10" placeholder="Integration license name" />
          </FormField>
          <FormField label="License Type">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DICOM">DICOM</SelectItem>
                <SelectItem value="HL7">HL7</SelectItem>
                <SelectItem value="API">API</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Start Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Validity (Months)">
            <Input type="number" className="h-10" placeholder="12" />
          </FormField>
          <FormField label="License Key">
            <Input className="h-10" placeholder="Integration key" />
          </FormField>
          <FormField label="Renewal Date">
            <Input type="date" className="h-10" />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Tab 5: Location
function LocationTab() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">
        Location Hierarchy
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label="Hospital / Clinic" required>
          <Select>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apollo-chennai">
                Apollo Hospital - Chennai
              </SelectItem>
              <SelectItem value="apollo-delhi">
                Apollo Hospital - Delhi
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Department" required>
          <Select>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radiology">Radiology</SelectItem>
              <SelectItem value="icu">ICU</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="obgyn">OB/GYN</SelectItem>
              <SelectItem value="cssd">CSSD</SelectItem>
              <SelectItem value="general">General Ward</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Floor">
          <Input className="h-10" placeholder="Floor number or name" />
        </FormField>
        <FormField label="Room No">
          <Input className="h-10" placeholder="Room / bay number" />
        </FormField>
        <FormField label="Bed No">
          <Input className="h-10" placeholder="Bed / bay assignment" />
        </FormField>
        <FormField label="Device Label">
          <Input className="h-10" placeholder="Physical label" />
        </FormField>
        <FormField label="Device Custom ID">
          <Input className="h-10" placeholder="Facility-specific ID" />
        </FormField>
        <FormField label="End User">
          <Input className="h-10" placeholder="Primary clinical user" />
        </FormField>
        <FormField label="End User Contact">
          <Input className="h-10" placeholder="Phone / email" />
        </FormField>
      </div>
    </div>
  );
}

// Tab 6: Asset Tracking (BLE Controller)
function AssetTrackingTab() {
  const [bleEnabled, setBleEnabled] = useState(false);
  const [geoFenceEnabled, setGeoFenceEnabled] = useState(false);
  const [beacons, setBeacons] = useState([{ id: 1 }]);

  return (
    <div className="flex flex-col gap-6">
      {/* BLE Controller Configuration */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-[#00BCD4]" /> BLE Controller
          Configuration
        </h3>
        <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-border bg-card">
          <Switch checked={bleEnabled} onCheckedChange={setBleEnabled} />
          <div>
            <p className="text-sm font-bold text-foreground">
              Enable BLE Asset Tracking
            </p>
            <p className="text-xs text-muted-foreground">
              Attach a Bluetooth Low Energy beacon to this asset for real-time
              location tracking
            </p>
          </div>
        </div>
        {bleEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="BLE Controller ID" required>
              <Input className="h-10" placeholder="e.g. BLE-CTL-001" />
            </FormField>
            <FormField label="Beacon Type" required>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select beacon type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IBEACON">Apple iBeacon</SelectItem>
                  <SelectItem value="EDDYSTONE">Google Eddystone</SelectItem>
                  <SelectItem value="ALTBEACON">AltBeacon</SelectItem>
                  <SelectItem value="CUSTOM">Custom BLE Beacon</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Beacon MAC Address" required>
              <Input className="h-10" placeholder="XX:XX:XX:XX:XX:XX" />
            </FormField>
            <FormField label="UUID">
              <Input
                className="h-10"
                placeholder="e.g. f7826da6-4fa2-4e98-8024-bc5b71e0893e"
              />
            </FormField>
            <FormField label="Major Value">
              <Input
                type="number"
                className="h-10"
                placeholder="e.g. 100"
                min="0"
                max="65535"
              />
            </FormField>
            <FormField label="Minor Value">
              <Input
                type="number"
                className="h-10"
                placeholder="e.g. 1"
                min="0"
                max="65535"
              />
            </FormField>
            <FormField label="Firmware Version">
              <Input className="h-10" placeholder="e.g. v2.1.0" />
            </FormField>
            <FormField label="Hardware Model">
              <Input
                className="h-10"
                placeholder="e.g. Kontakt.io Smart Beacon"
              />
            </FormField>
            <FormField label="Manufacturer">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KONTAKT">Kontakt.io</SelectItem>
                  <SelectItem value="ESTIMOTE">Estimote</SelectItem>
                  <SelectItem value="MINEW">Minew</SelectItem>
                  <SelectItem value="ARUBA">Aruba Networks</SelectItem>
                  <SelectItem value="CISCO">Cisco Meraki</SelectItem>
                  <SelectItem value="ZEBRA">Zebra Technologies</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        )}
      </div>

      {/* Signal Configuration */}
      {bleEnabled && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
            <Signal className="w-5 h-5 text-[#00BCD4]" /> Signal Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="TX Power (dBm)" required>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select power" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-30">-30 dBm (Lowest)</SelectItem>
                  <SelectItem value="-20">-20 dBm</SelectItem>
                  <SelectItem value="-16">-16 dBm</SelectItem>
                  <SelectItem value="-12">-12 dBm</SelectItem>
                  <SelectItem value="-8">-8 dBm</SelectItem>
                  <SelectItem value="-4">-4 dBm</SelectItem>
                  <SelectItem value="0">0 dBm (Default)</SelectItem>
                  <SelectItem value="4">+4 dBm (Highest)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Advertising Interval (ms)">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 ms (Fast)</SelectItem>
                  <SelectItem value="250">250 ms</SelectItem>
                  <SelectItem value="500">500 ms</SelectItem>
                  <SelectItem value="1000">1000 ms (Default)</SelectItem>
                  <SelectItem value="2000">2000 ms</SelectItem>
                  <SelectItem value="5000">5000 ms (Battery Saver)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="RSSI Threshold (dBm)">
              <Input type="number" className="h-10" placeholder="e.g. -70" />
            </FormField>
            <FormField label="Scan Range (meters)">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1m (Near)</SelectItem>
                  <SelectItem value="3">3m (Short)</SelectItem>
                  <SelectItem value="5">5m (Medium)</SelectItem>
                  <SelectItem value="10">10m (Default)</SelectItem>
                  <SelectItem value="20">20m (Long)</SelectItem>
                  <SelectItem value="30">30m (Max)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      )}

      {/* Battery & Maintenance */}
      {bleEnabled && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
            <BatteryMedium className="w-5 h-5 text-[#00BCD4]" /> Battery &
            Maintenance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Battery Type">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CR2032">CR2032 (Coin Cell)</SelectItem>
                  <SelectItem value="CR2477">CR2477</SelectItem>
                  <SelectItem value="AA">AA Battery</SelectItem>
                  <SelectItem value="AAA">AAA Battery</SelectItem>
                  <SelectItem value="RECHARGEABLE">
                    Rechargeable Li-Ion
                  </SelectItem>
                  <SelectItem value="USB_POWERED">USB Powered</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Battery Level (%)">
              <Input
                type="number"
                className="h-10"
                placeholder="e.g. 95"
                min="0"
                max="100"
              />
            </FormField>
            <FormField label="Battery Installed Date">
              <Input type="date" className="h-10" />
            </FormField>
            <FormField label="Expected Battery Life (Months)">
              <Input type="number" className="h-10" placeholder="e.g. 24" />
            </FormField>
            <FormField label="Low Battery Alert Threshold (%)">
              <Input
                type="number"
                className="h-10"
                placeholder="e.g. 20"
                min="1"
                max="50"
              />
            </FormField>
            <FormField label="Last Signal Received">
              <Input
                type="datetime-local"
                className="h-10 bg-muted/30"
                readOnly
              />
            </FormField>
            <FormField label="Beacon Status">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="LOW_BATTERY">Low Battery</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Beacon Attach Date">
              <Input type="date" className="h-10" />
            </FormField>
          </div>
        </div>
      )}

      {/* Zone Mapping & Geo-Fence */}
      {bleEnabled && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-[#00BCD4]" /> Zone Mapping &
            Geo-Fence
          </h3>
          <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-border bg-card">
            <Switch
              checked={geoFenceEnabled}
              onCheckedChange={setGeoFenceEnabled}
            />
            <div>
              <p className="text-sm font-bold text-foreground">
                Enable Geo-Fence Alerts
              </p>
              <p className="text-xs text-muted-foreground">
                Trigger alerts when the asset moves outside its assigned zone or
                floor
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Assigned Zone" required>
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ZONE_A">Zone A - ICU Wing</SelectItem>
                  <SelectItem value="ZONE_B">Zone B - Emergency</SelectItem>
                  <SelectItem value="ZONE_C">Zone C - Radiology</SelectItem>
                  <SelectItem value="ZONE_D">Zone D - OT Complex</SelectItem>
                  <SelectItem value="ZONE_E">Zone E - General Ward</SelectItem>
                  <SelectItem value="ZONE_F">Zone F - CSSD</SelectItem>
                  <SelectItem value="ZONE_G">
                    Zone G - Store / Utility
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Assigned Floor">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B1">Basement 1</SelectItem>
                  <SelectItem value="GF">Ground Floor</SelectItem>
                  <SelectItem value="1F">1st Floor</SelectItem>
                  <SelectItem value="2F">2nd Floor</SelectItem>
                  <SelectItem value="3F">3rd Floor</SelectItem>
                  <SelectItem value="4F">4th Floor</SelectItem>
                  <SelectItem value="5F">5th Floor</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Nearest Gateway / Reader">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select gateway" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GW-001">GW-001 - ICU Corridor</SelectItem>
                  <SelectItem value="GW-002">GW-002 - ER Entrance</SelectItem>
                  <SelectItem value="GW-003">
                    GW-003 - Radiology Lobby
                  </SelectItem>
                  <SelectItem value="GW-004">GW-004 - OT Corridor</SelectItem>
                  <SelectItem value="GW-005">GW-005 - Store Room</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {geoFenceEnabled && (
              <>
                <FormField label="Geo-Fence Radius (meters)">
                  <Input
                    type="number"
                    className="h-10"
                    placeholder="e.g. 50"
                    min="1"
                  />
                </FormField>
                <FormField label="Exit Alert Type">
                  <Select>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email Notification</SelectItem>
                      <SelectItem value="SMS">SMS Alert</SelectItem>
                      <SelectItem value="PUSH">Push Notification</SelectItem>
                      <SelectItem value="DASHBOARD">Dashboard Alert</SelectItem>
                      <SelectItem value="ALL">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Alert Recipients">
                  <Input
                    className="h-10"
                    placeholder="e.g. bme-head@hospital.com"
                  />
                </FormField>
              </>
            )}
          </div>
        </div>
      )}

      {/* Multiple BLE Beacons */}
      {bleEnabled && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#00BCD4]" /> Additional BLE Beacons
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Attach multiple beacons for higher accuracy or multi-point tracking
            on large equipment.
          </p>
          {beacons.map((beacon, idx) => (
            <Card
              key={beacon.id}
              className="border border-border shadow-none mb-3"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-foreground">
                    Beacon {idx + 1}
                  </span>
                  {beacons.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#EF4444] h-7 w-7 p-0"
                      onClick={() =>
                        setBeacons(beacons.filter((b) => b.id !== beacon.id))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField label="Beacon MAC">
                    <Input className="h-10" placeholder="XX:XX:XX:XX:XX:XX" />
                  </FormField>
                  <FormField label="Placement on Asset">
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOP">Top</SelectItem>
                        <SelectItem value="FRONT">Front Panel</SelectItem>
                        <SelectItem value="REAR">Rear Panel</SelectItem>
                        <SelectItem value="SIDE_L">Left Side</SelectItem>
                        <SelectItem value="SIDE_R">Right Side</SelectItem>
                        <SelectItem value="BOTTOM">Bottom / Chassis</SelectItem>
                        <SelectItem value="INTERNAL">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Purpose">
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIMARY">
                          Primary Tracking
                        </SelectItem>
                        <SelectItem value="SECONDARY">
                          Secondary / Redundancy
                        </SelectItem>
                        <SelectItem value="TAMPER">Tamper Detection</SelectItem>
                        <SelectItem value="ENVIRONMENT">
                          Environmental Sensor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status">
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            className="text-sm font-semibold h-10 px-4"
            onClick={() => setBeacons([...beacons, { id: Date.now() }])}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Beacon
          </Button>
        </div>
      )}

      {/* Not enabled state */}
      {!bleEnabled && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bluetooth className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-bold text-foreground mb-2">
            BLE Tracking Not Enabled
          </h4>
          <p className="text-sm text-muted-foreground max-w-md">
            Enable BLE Asset Tracking above to configure beacon details, signal
            parameters, battery monitoring, zone mapping, and geo-fence alerts
            for this asset.
          </p>
        </div>
      )}
    </div>
  );
}

// Tab 7: Vendor
function VendorTab() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-sm font-bold text-foreground pb-2 border-b border-border">
        Vendor Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label="Vendor Name" required>
          <Select>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Search vendor master" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="siemens">Siemens Healthineers</SelectItem>
              <SelectItem value="ge">GE Healthcare</SelectItem>
              <SelectItem value="philips">Philips Medical</SelectItem>
              <SelectItem value="draeger">Draeger</SelectItem>
              <SelectItem value="bbraun">B. Braun</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Vendor POC">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled from vendor master"
            readOnly
          />
        </FormField>
        <FormField label="Vendor Mobile">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Vendor Email">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
      </div>
      <p className="text-xs text-muted-foreground">
        Vendor details auto-populate from the vendor master when a vendor is
        selected.
      </p>
    </div>
  );
}

// Tab 7: Installation Records
function InstallationTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Procurement Trail
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="PR No">
            <Input className="h-10" placeholder="Purchase Requisition" />
          </FormField>
          <FormField label="PR Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Quote No">
            <Input className="h-10" placeholder="Quotation number" />
          </FormField>
          <FormField label="Quote Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="PO No">
            <Input className="h-10" placeholder="Purchase Order" />
          </FormField>
          <FormField label="PO Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Invoice No">
            <Input className="h-10" placeholder="Invoice number" />
          </FormField>
          <FormField label="Invoice Date">
            <Input type="date" className="h-10" />
          </FormField>
        </div>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Delivery & Installation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Delivery Note">
            <Input className="h-10" placeholder="Delivery note number" />
          </FormField>
          <FormField label="Delivery Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Installed By">
            <Input className="h-10" placeholder="Installer name" />
          </FormField>
          <FormField label="Installation Date">
            <Input type="date" className="h-10" />
          </FormField>
        </div>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Warranty
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Warranty Period (Years)">
            <Input type="number" className="h-10" placeholder="e.g., 2" />
          </FormField>
          <FormField label="Warranty Start Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Warranty End Date">
            <Input type="date" className="h-10" />
          </FormField>
          <FormField label="Warranty Status">
            <Select>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Auto-calculated" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="EXTENDED">Extended</SelectItem>
                <SelectItem value="NA">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>
    </div>
  );
}

// Tab 8: Maintenance
function MaintenanceScheduleRow({ label, id }: { label: string; id: string }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <Card
      className={cn(
        "border shadow-none transition-all",
        enabled ? "border-[#00BCD4]/30 bg-[#00BCD4]/5" : "border-border",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Checkbox
            checked={enabled}
            onCheckedChange={(v) => setEnabled(!!v)}
          />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        {enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pl-7">
            <FormField label="Start Date">
              <Input type="date" className="h-10" />
            </FormField>
            <FormField label="Frequency">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="BI_MONTHLY">2 Months</SelectItem>
                  <SelectItem value="QUARTERLY">3 Months</SelectItem>
                  <SelectItem value="SEMI_ANNUAL">6 Months</SelectItem>
                  <SelectItem value="ANNUAL">Yearly</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Next Due Date">
              <Input
                type="date"
                className="h-10 bg-muted/30"
                placeholder="Auto-calculated"
                readOnly
              />
            </FormField>
            <FormField label="Assigned To">
              <Select>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inhouse">In-House BME</SelectItem>
                  <SelectItem value="vendor">Vendor / OEM</SelectItem>
                  <SelectItem value="third_party">Third Party</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MaintenanceTab() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-muted-foreground mb-3">
        Enable and configure maintenance schedules. Each type follows: Enable,
        Start Date, Frequency, Next Due Date.
      </p>
      <MaintenanceScheduleRow
        label="External PM (Service Provider)"
        id="ext_pm"
      />
      <MaintenanceScheduleRow label="Internal PM (In-House BME)" id="int_pm" />
      <MaintenanceScheduleRow label="Electrical Safety Test (EST)" id="est" />
      <MaintenanceScheduleRow label="QA/QC/Calibration" id="calibration" />
      <MaintenanceScheduleRow label="Battery Replacement" id="battery" />
      <MaintenanceScheduleRow label="Filter Replacement" id="filter" />
      <MaintenanceScheduleRow label="Other Maintenance" id="other" />
    </div>
  );
}

// Tab 9: Contract
function ContractTab() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-base text-muted-foreground">
        Link this equipment to an active service contract. Contract details are
        read-only and managed through the Contracts module.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label="Contract Number">
          <Select>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select contract" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amc-001">
                AMC-2026-001 - Siemens AMC
              </SelectItem>
              <SelectItem value="cmc-001">CMC-2026-001 - GE CMC</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Contract Type">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Contract Start">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Contract Period">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Contract End">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Contract Status">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Vendor">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
        <FormField label="Coverage Type">
          <Input
            className="h-10 bg-muted/30"
            placeholder="Auto-filled"
            readOnly
          />
        </FormField>
      </div>
    </div>
  );
}

// Tab 10: Documents
const docCategories = [
  {
    name: "Specifications",
    desc: "Product specifications, datasheets, and technical documentation",
    formats: "PDF, DOC",
  },
  {
    name: "Quotations",
    desc: "Vendor quotations and price comparisons",
    formats: "PDF, XLS",
  },
  {
    name: "Pre-evaluation",
    desc: "Pre-purchase evaluation reports and assessments",
    formats: "PDF, DOC",
  },
  {
    name: "Technical Comparison Report",
    desc: "Technical comparison between shortlisted equipment",
    formats: "PDF, XLS",
  },
  {
    name: "Supplier Integrity Checklist",
    desc: "Supplier verification and due diligence records",
    formats: "PDF, DOC",
  },
  {
    name: "Tax Invoice",
    desc: "Purchase invoice and tax documentation",
    formats: "PDF",
  },
  {
    name: "Delivery Note",
    desc: "Goods receipt and delivery confirmation documents",
    formats: "PDF",
  },
  {
    name: "Factory Calibration Certificate",
    desc: "OEM calibration certificates and test reports",
    formats: "PDF",
  },
  {
    name: "Contract Agreement",
    desc: "Service contracts, AMC/CMC agreements",
    formats: "PDF, DOC",
  },
  {
    name: "PPM Schedule",
    desc: "Planned preventive maintenance schedule documents",
    formats: "PDF, XLS",
  },
  {
    name: "Authorized Distributor Letter / LOA",
    desc: "Letter of authorization from manufacturer",
    formats: "PDF",
  },
  {
    name: "Trade License",
    desc: "Vendor trade license and registration certificates",
    formats: "PDF",
  },
  {
    name: "Post Evaluation Report",
    desc: "Post-installation performance evaluation",
    formats: "PDF, DOC",
  },
  {
    name: "Safety Assessment",
    desc: "Electrical safety and risk assessment reports",
    formats: "PDF",
  },
  {
    name: "Discard Report",
    desc: "Equipment condemnation and disposal documentation",
    formats: "PDF, DOC",
  },
  {
    name: "Beyond Economical Report",
    desc: "BER analysis and cost justification for replacement",
    formats: "PDF, XLS",
  },
];

function DocumentsTab() {
  const [categories, setCategories] = useState(docCategories);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(
    {},
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatFormats, setNewCatFormats] = useState("PDF, DOC");

  const handleSimulateUpload = (catName: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [catName]: [
        ...(prev[catName] || []),
        `${catName.replace(/\s+/g, "_")}_${Date.now()}.pdf`,
      ],
    }));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      name: newCatName.trim(),
      desc: newCatDesc.trim() || "Custom document category",
      formats: newCatFormats.trim() || "PDF, DOC",
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCatName("");
    setNewCatDesc("");
    setNewCatFormats("PDF, DOC");
    setShowAddForm(false);
  };

  const handleRemoveCategory = (catName: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== catName));
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[catName];
      return next;
    });
  };

  const uploadedCount = Object.keys(uploadedFiles).filter(
    (k) => uploadedFiles[k]?.length > 0,
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-muted-foreground">
            Upload documents by category. Click the upload area or drag and drop
            files.
          </p>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {uploadedCount} of {categories.length} categories have uploads
          </p>
        </div>
        <Button
          variant="outline"
          className="text-sm font-semibold h-10 px-4"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Additional Category
        </Button>
      </div>

      {/* Add Category Inline Form */}
      {showAddForm && (
        <div className="rounded-xl border-2 border-dashed border-[#00BCD4]/40 bg-[#00BCD4]/5 p-5">
          <h4 className="text-sm font-bold text-foreground mb-4">
            Add New Document Category
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">
                Category Name <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                placeholder="e.g. Warranty Certificate"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">
                Description
              </Label>
              <Input
                placeholder="e.g. Equipment warranty documents"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-bold text-foreground">
                Accepted Formats
              </Label>
              <Input
                placeholder="e.g. PDF, DOC, XLS"
                value={newCatFormats}
                onChange={(e) => setNewCatFormats(e.target.value)}
                className="h-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              className="text-white border-0 text-sm font-semibold h-10 px-5"
              style={{
                background: "linear-gradient(135deg, #00BCD4, #00838F)",
              }}
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add Category
            </Button>
            <Button
              variant="outline"
              className="text-sm font-semibold h-10 px-4"
              onClick={() => {
                setShowAddForm(false);
                setNewCatName("");
                setNewCatDesc("");
                setNewCatFormats("PDF, DOC");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {categories.map((cat, idx) => {
          const isEven = idx % 2 === 0;
          const files = uploadedFiles[cat.name] || [];
          const hasFiles = files.length > 0;
          const isCustom = !docCategories.some((d) => d.name === cat.name);

          return (
            <div
              key={cat.name}
              className={cn(
                "flex rounded-xl border overflow-hidden transition-all",
                hasFiles
                  ? "border-[#10B981]/30 bg-[#10B981]/5"
                  : "border-border",
                isEven ? "flex-row" : "flex-row-reverse",
              )}
            >
              {/* Info side */}
              <div
                className={cn(
                  "flex-1 p-4 flex flex-col justify-center",
                  isEven ? "pr-2" : "pl-2",
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0",
                      hasFiles
                        ? "bg-[#10B981] text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {hasFiles ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </h4>
                  {isCustom && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00BCD4]/10 text-[#00BCD4]">
                      Custom
                    </span>
                  )}
                  {isCustom && (
                    <button
                      className="ml-auto text-muted-foreground hover:text-[#EF4444] transition-colors"
                      onClick={() => handleRemoveCategory(cat.name)}
                      title="Remove category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs text-muted-foreground ml-8",
                    isEven ? "text-left" : "text-right",
                  )}
                >
                  {cat.desc}
                </p>
                {hasFiles && (
                  <div
                    className={cn(
                      "flex flex-wrap gap-1.5 mt-2 ml-8",
                      isEven ? "justify-start" : "justify-end",
                    )}
                  >
                    {files.map((f, fIdx) => (
                      <span
                        key={fIdx}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground"
                      >
                        <FileText className="w-3 h-3 text-[#00BCD4]" />
                        {f.length > 25 ? f.substring(0, 25) + "..." : f}
                        <button
                          className="ml-0.5 text-muted-foreground hover:text-[#EF4444]"
                          onClick={() =>
                            setUploadedFiles((prev) => ({
                              ...prev,
                              [cat.name]: prev[cat.name].filter(
                                (_, i) => i !== fIdx,
                              ),
                            }))
                          }
                        >
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
                  hasFiles
                    ? "border-[#10B981]/30 hover:border-[#10B981]"
                    : "border-border hover:border-[#00BCD4]",
                )}
                onClick={() => handleSimulateUpload(cat.name)}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    hasFiles
                      ? "bg-[#10B981]/10 group-hover:bg-[#10B981]/20"
                      : "bg-muted group-hover:bg-[#00BCD4]/10",
                  )}
                >
                  <Upload
                    className={cn(
                      "w-4 h-4 transition-colors",
                      hasFiles
                        ? "text-[#10B981]"
                        : "text-muted-foreground group-hover:text-[#00BCD4]",
                    )}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground text-center">
                  {hasFiles ? "Add more" : "Drop file here"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.formats}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================
// Tab 12: Barcode / QR Code
// ============================

// Minimal Code128B barcode encoder (pure canvas, no dependencies)
function encodeCode128B(text: string): number[] {
  const START_B = 104;
  const STOP = 106;
  const CODE128_PATTERNS: number[][] = [
    [2, 1, 2, 2, 2, 2],
    [2, 2, 2, 1, 2, 2],
    [2, 2, 2, 2, 2, 1],
    [1, 2, 1, 2, 2, 3],
    [1, 2, 1, 3, 2, 2],
    [1, 3, 1, 2, 2, 2],
    [1, 2, 2, 2, 1, 3],
    [1, 2, 2, 3, 1, 2],
    [1, 3, 2, 2, 1, 2],
    [2, 2, 1, 2, 1, 3],
    [2, 2, 1, 3, 1, 2],
    [2, 3, 1, 2, 1, 2],
    [1, 1, 2, 2, 3, 2],
    [1, 2, 2, 1, 3, 2],
    [1, 2, 2, 2, 3, 1],
    [1, 1, 3, 2, 2, 2],
    [1, 2, 3, 1, 2, 2],
    [1, 2, 3, 2, 2, 1],
    [2, 2, 3, 2, 1, 1],
    [2, 2, 1, 1, 3, 2],
    [2, 2, 1, 2, 3, 1],
    [2, 1, 3, 2, 1, 2],
    [2, 2, 3, 1, 1, 2],
    [3, 1, 2, 1, 3, 1],
    [3, 1, 1, 2, 2, 2],
    [3, 2, 1, 1, 2, 2],
    [3, 2, 1, 2, 2, 1],
    [3, 1, 2, 2, 1, 2],
    [3, 2, 2, 1, 1, 2],
    [3, 2, 2, 2, 1, 1],
    [2, 1, 2, 1, 2, 3],
    [2, 1, 2, 3, 2, 1],
    [2, 3, 2, 1, 2, 1],
    [1, 1, 1, 3, 2, 3],
    [1, 3, 1, 1, 2, 3],
    [1, 3, 1, 3, 2, 1],
    [1, 1, 2, 3, 1, 3],
    [1, 3, 2, 1, 1, 3],
    [1, 3, 2, 3, 1, 1],
    [2, 1, 1, 3, 1, 3],
    [2, 3, 1, 1, 1, 3],
    [2, 3, 1, 3, 1, 1],
    [1, 1, 2, 1, 3, 3],
    [1, 1, 2, 3, 3, 1],
    [1, 3, 2, 1, 3, 1],
    [1, 1, 3, 1, 2, 3],
    [1, 1, 3, 3, 2, 1],
    [1, 3, 3, 1, 2, 1],
    [3, 1, 3, 1, 2, 1],
    [2, 1, 1, 3, 3, 1],
    [2, 3, 1, 1, 3, 1],
    [2, 1, 3, 1, 1, 3],
    [2, 1, 3, 3, 1, 1],
    [2, 1, 3, 1, 3, 1],
    [3, 1, 1, 1, 2, 3],
    [3, 1, 1, 3, 2, 1],
    [3, 3, 1, 1, 2, 1],
    [3, 1, 2, 1, 1, 3],
    [3, 1, 2, 3, 1, 1],
    [3, 3, 2, 1, 1, 1],
    [3, 1, 4, 1, 1, 1],
    [2, 2, 1, 4, 1, 1],
    [4, 3, 1, 1, 1, 1],
    [1, 1, 1, 2, 2, 4],
    [1, 1, 1, 4, 2, 2],
    [1, 2, 1, 1, 2, 4],
    [1, 2, 1, 4, 2, 1],
    [1, 4, 1, 1, 2, 2],
    [1, 4, 1, 2, 2, 1],
    [1, 1, 2, 2, 1, 4],
    [1, 1, 2, 4, 1, 2],
    [1, 2, 2, 1, 1, 4],
    [1, 2, 2, 4, 1, 1],
    [1, 4, 2, 1, 1, 2],
    [1, 4, 2, 2, 1, 1],
    [2, 4, 1, 2, 1, 1],
    [2, 2, 1, 1, 1, 4],
    [4, 1, 3, 1, 1, 1],
    [2, 4, 1, 1, 1, 2],
    [1, 3, 4, 1, 1, 1],
    [1, 1, 1, 2, 4, 2],
    [1, 2, 1, 1, 4, 2],
    [1, 2, 1, 2, 4, 1],
    [1, 1, 4, 2, 1, 2],
    [1, 2, 4, 1, 1, 2],
    [1, 2, 4, 2, 1, 1],
    [4, 1, 1, 2, 1, 2],
    [4, 2, 1, 1, 1, 2],
    [4, 2, 1, 2, 1, 1],
    [2, 1, 2, 1, 4, 1],
    [2, 1, 4, 1, 2, 1],
    [4, 1, 2, 1, 2, 1],
    [1, 1, 1, 1, 4, 3],
    [1, 1, 1, 3, 4, 1],
    [1, 3, 1, 1, 4, 1],
    [1, 1, 4, 1, 1, 3],
    [1, 1, 4, 3, 1, 1],
    [4, 1, 1, 1, 1, 3],
    [4, 1, 1, 3, 1, 1],
    [1, 1, 3, 1, 4, 1],
    [1, 1, 4, 1, 3, 1],
    [3, 1, 1, 1, 4, 1],
    [4, 1, 1, 1, 3, 1],
    [2, 1, 1, 4, 1, 2],
    [2, 1, 1, 2, 1, 4],
    [2, 1, 1, 2, 3, 2],
    [2, 3, 3, 1, 1, 1, 2],
  ];
  const values: number[] = [];
  for (let i = 0; i < text.length; i++) {
    values.push(text.charCodeAt(i) - 32);
  }
  let checksum = START_B;
  values.forEach((v, i) => {
    checksum += v * (i + 1);
  });
  checksum = checksum % 103;
  const allCodes = [START_B, ...values, checksum, STOP];
  const bars: number[] = [];
  allCodes.forEach((code) => {
    const pattern = CODE128_PATTERNS[code];
    if (pattern) bars.push(...pattern);
  });
  return bars;
}

function drawBarcode(
  canvas: HTMLCanvasElement,
  text: string,
  w: number,
  h: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, w, h);
  const bars = encodeCode128B(text);
  const barWidth = Math.max(1.5, (w - 40) / bars.length);
  let x = 20;
  const barH = h - 40;
  bars.forEach((b, i) => {
    ctx.fillStyle = i % 2 === 0 ? "#1B2A4A" : "#FFFFFF";
    ctx.fillRect(x, 10, b * barWidth, barH);
    x += b * barWidth;
  });
  ctx.fillStyle = "#1B2A4A";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";
  ctx.fillText(text, w / 2, h - 6);
}

// Minimal QR Code generator (pure canvas, no dependencies)
function drawQRCode(canvas: HTMLCanvasElement, text: string, size: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  // Generate a deterministic QR-like pattern from the text
  const hash = (s: string, seed: number) => {
    let h = seed;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h;
  };

  const modules = 25;
  const cellSize = (size - 20) / modules;
  const padding = 10;
  const grid: boolean[][] = Array.from({ length: modules }, () =>
    Array(modules).fill(false),
  );

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        const border = i === 0 || i === 6 || j === 0 || j === 6;
        const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        if (border || inner) grid[r + i][c + j] = true;
      }
  };
  drawFinder(0, 0);
  drawFinder(0, modules - 7);
  drawFinder(modules - 7, 0);

  // Timing patterns
  for (let i = 8; i < modules - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Data area filled with deterministic pseudo-random pattern from text
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder pattern areas + timing
      if (r < 9 && c < 9) continue;
      if (r < 9 && c >= modules - 8) continue;
      if (r >= modules - 8 && c < 9) continue;
      if (r === 6 || c === 6) continue;
      const v = hash(text, r * 31 + c * 17 + r * c);
      grid[r][c] = (v & 1) === 1;
    }
  }

  // Draw
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (grid[r][c]) {
        ctx.fillStyle = "#1B2A4A";
        ctx.fillRect(
          padding + c * cellSize,
          padding + r * cellSize,
          cellSize,
          cellSize,
        );
      }
    }
  }
}

function BarcodeQRTab() {
  const barcodeRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Mock data -- in real app these come from form state / DB
  const assetId = "AST-2026-00147";
  const tenantId = "TEN-APL-001";
  const combinedCode = `${tenantId}:${assetId}`;
  const generatedAt = new Date().toISOString().split("T")[0];

  const renderCodes = useCallback(() => {
    if (barcodeRef.current)
      drawBarcode(barcodeRef.current, combinedCode, 400, 100);
    if (qrRef.current) drawQRCode(qrRef.current, combinedCode, 200);
  }, [combinedCode]);

  useEffect(() => {
    renderCodes();
  }, [renderCodes]);

  const handleDownload = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    filename: string,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(combinedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const barcodeData = barcodeRef.current?.toDataURL("image/png") || "";
    const qrData = qrRef.current?.toDataURL("image/png") || "";
    printWindow.document.write(`
      <html><head><title>Asset Label - ${assetId}</title>
      <style>body{font-family:sans-serif;padding:40px;text-align:center}
      .label{border:2px solid #1B2A4A;border-radius:12px;padding:24px;display:inline-block;max-width:420px}
      h2{margin:0 0 4px;font-size:18px}p{margin:4px 0;color:#666;font-size:12px}
      img{margin:12px auto;display:block}.code{font-family:monospace;font-size:14px;background:#f5f5f5;padding:6px 12px;border-radius:6px;display:inline-block;margin:8px 0}
      .divider{height:1px;background:#e0e0e0;margin:16px 0}</style></head>
      <body><div class="label">
      <h2>Biomedical CMMS</h2>
      <p>Asset Identification Label</p>
      <div class="divider"></div>
      <img src="${barcodeData}" width="360" height="90" />
      <div class="code">${combinedCode}</div>
      <div class="divider"></div>
      <img src="${qrData}" width="160" height="160" />
      <p style="margin-top:12px"><strong>Asset ID:</strong> ${assetId}</p>
      <p><strong>Tenant:</strong> ${tenantId}</p>
      <p><strong>Generated:</strong> ${generatedAt}</p>
      </div>
      <script>setTimeout(function(){window.print();window.close()},500)<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Info Banner */}
      <div className="rounded-lg border border-[#00BCD4]/20 bg-[#00BCD4]/5 px-4 py-3 flex items-start gap-3">
        <QrCode className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
        <div className="text-sm text-foreground leading-relaxed">
          <span className="font-bold">Asset Identification Codes.</span> Barcode
          (Code 128) and QR Code are auto-generated from the{" "}
          <span className="font-mono font-semibold text-[#00BCD4]">
            Tenant ID
          </span>{" "}
          +{" "}
          <span className="font-mono font-semibold text-[#00BCD4]">
            Asset ID
          </span>{" "}
          combination. Print labels or download images for physical asset
          tagging.
        </div>
      </div>

      {/* Code Details */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Code Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Tenant ID">
            <Input
              className="h-10 bg-muted/30 font-mono font-semibold"
              value={tenantId}
              readOnly
            />
          </FormField>
          <FormField label="Asset ID">
            <Input
              className="h-10 bg-muted/30 font-mono font-semibold"
              value={assetId}
              readOnly
            />
          </FormField>
          <FormField label="Combined Code">
            <div className="flex gap-2">
              <Input
                className="h-10 bg-muted/30 font-mono font-semibold flex-1"
                value={combinedCode}
                readOnly
              />
              <Button
                variant="outline"
                className="h-10 w-10 p-0 shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </FormField>
          <FormField label="Generated On">
            <Input
              className="h-10 bg-muted/30 font-semibold"
              value={generatedAt}
              readOnly
            />
          </FormField>
        </div>
      </div>

      {/* Barcode and QR side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={printRef}>
        {/* Barcode */}
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
            Barcode (Code 128)
          </h3>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="bg-white rounded-xl p-4 border border-border w-full flex justify-center">
                <canvas ref={barcodeRef} />
              </div>
              <p className="text-xs text-muted-foreground text-center font-medium">
                Code 128B encoding of{" "}
                <span className="font-mono font-semibold text-foreground">
                  {combinedCode}
                </span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-sm font-semibold h-9 px-4"
                  onClick={() =>
                    handleDownload(barcodeRef, `barcode-${assetId}.png`)
                  }
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code */}
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
            QR Code
          </h3>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="bg-white rounded-xl p-4 border border-border flex justify-center">
                <canvas ref={qrRef} />
              </div>
              <p className="text-xs text-muted-foreground text-center font-medium">
                Encodes{" "}
                <span className="font-mono font-semibold text-foreground">
                  {combinedCode}
                </span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-sm font-semibold h-9 px-4"
                  onClick={() => handleDownload(qrRef, `qrcode-${assetId}.png`)}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
          Print & Export
        </h3>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Print Label */}
              <button
                onClick={handlePrint}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border hover:border-[#00BCD4]/40 hover:bg-[#00BCD4]/5 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00BCD4]/10 flex items-center justify-center group-hover:bg-[#00BCD4]/20 transition-colors">
                  <Printer className="w-6 h-6 text-[#00BCD4]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    Print Asset Label
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full label with barcode + QR + asset info for physical
                    tagging
                  </p>
                </div>
              </button>

              {/* Download All */}
              <button
                onClick={() => {
                  handleDownload(barcodeRef, `barcode-${assetId}.png`);
                  handleDownload(qrRef, `qrcode-${assetId}.png`);
                }}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/5 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Download className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    Download Both
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Download barcode and QR code as separate PNG files
                  </p>
                </div>
              </button>

              {/* Regenerate */}
              <button
                onClick={renderCodes}
                className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border hover:border-[#10B981]/40 hover:bg-[#10B981]/5 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
                  <RefreshCw className="w-6 h-6 text-[#10B981]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">
                    Regenerate Codes
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Re-render barcode and QR code canvases from current data
                  </p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Label Preview Info */}
      <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">Tip:</span> The printed
        label includes both barcode and QR code on a single sticker-ready
        layout. Use barcode scanners for quick lookup or mobile QR scanners for
        full asset detail access.
      </div>
    </div>
  );
}

// Full-Page Form Component
export function AssetRegistrationForm({
  onBack,
  editAssetId,
}: {
  onBack: () => void;
  editAssetId?: string | null;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const isEditMode = !!editAssetId;

  const renderTab = () => {
    switch (activeTab) {
      case 0:
        return <GenericTab />;
      case 1:
        return <AccessoriesTab />;
      case 2:
        return <ChildAssetsTab />;
      case 3:
        return <SWNetworkTab />;
      case 4:
        return <LocationTab />;
      case 5:
        return <AssetTrackingTab />;
      case 6:
        return <VendorTab />;
      case 7:
        return <InstallationTab />;
      case 8:
        return <MaintenanceTab />;
      case 9:
        return <ContractTab />;
      case 10:
        return <DocumentsTab />;
      case 11:
        return <BarcodeQRTab />;
      default:
        return <GenericTab />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assets
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-xl font-extrabold text-foreground">
              {isEditMode
                ? `Edit Asset - ${editAssetId}`
                : "Register New Asset"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditMode
                ? "Update the asset details across tabs below."
                : "Complete the tabs below. Tabs marked with * are mandatory."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground mr-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            Step {activeTab + 1} of {TABS.length}
          </span>
          <Button variant="outline" className="text-sm font-semibold h-10 px-4">
            <Save className="w-4 h-4 mr-1.5" /> Save Draft
          </Button>
          <Button
            className="text-white border-0 text-sm font-semibold h-10 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          >
            <Send className="w-4 h-4 mr-1.5" />{" "}
            {isEditMode ? "Update" : "Submit"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation - scrollable horizontal tabs with step indicators */}
      <div className="border-b border-border shrink-0 bg-card">
        <div className="flex overflow-x-auto px-4">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isCompleted = idx < activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all relative",
                  activeTab === idx
                    ? "border-[#00BCD4] text-[#00BCD4]"
                    : isCompleted
                      ? "border-transparent text-[#10B981]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0",
                    activeTab === idx
                      ? "bg-[#00BCD4] text-white"
                      : isCompleted
                        ? "bg-[#10B981] text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                </span>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.mandatory && <span className="text-[#EF4444]">*</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted shrink-0">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${((activeTab + 1) / TABS.length) * 100}%`,
            background: "linear-gradient(90deg, #00BCD4, #00E5CC)",
          }}
        />
      </div>

      {/* Tab Content - scrollable area */}
      <div className="flex-1 overflow-y-auto p-6 bg-background">
        <div className="max-w-6xl mx-auto">{renderTab()}</div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border px-6 py-4 flex items-center justify-between shrink-0 bg-card">
        <Button
          variant="outline"
          className="text-sm font-semibold h-10 px-4"
          disabled={activeTab === 0}
          onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </Button>
        <div className="flex items-center gap-1.5">
          {TABS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeTab === idx
                  ? "bg-[#00BCD4] w-6"
                  : idx < activeTab
                    ? "bg-[#10B981]"
                    : "bg-muted",
              )}
            />
          ))}
        </div>
        {activeTab < TABS.length - 1 ? (
          <Button
            className="text-white border-0 text-sm font-semibold h-10 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={() =>
              setActiveTab(Math.min(TABS.length - 1, activeTab + 1))
            }
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            className="text-white border-0 text-sm font-semibold h-10 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          >
            <Send className="w-4 h-4 mr-1.5" /> Submit
          </Button>
        )}
      </div>
    </div>
  );
}
