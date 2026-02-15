"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Plus, Search, Eye, Pencil, MoreVertical, ArrowLeft, Save, Send,
  Upload, ChevronDown, ChevronUp, Cpu, Filter, Download, Trash2,
  Monitor, FileText, X, CheckCircle2, Home, RotateCcw
} from "lucide-react"

// ----- Types -----
interface DeviceMaster {
  id: string
  deviceName: string
  deviceType: string
  genericName: string
  deviceModel: string
  manufacturer: string
  ecri: string
  modelNumber: string
  catalogNumber: string
  countryOfOrigin: string
  equipmentClass: string
  equipmentType: string
  status: "Active" | "Draft" | "Inactive"
  assetsLinked: number
  createdAt: string
}

// ----- Mock Data -----
const mockDevices: DeviceMaster[] = [
  {
    id: "DEV-001", deviceName: "Patient Monitor", deviceType: "Monitoring", genericName: "Multi-Parameter Patient Monitor",
    deviceModel: "IntelliVue MX800", manufacturer: "Philips Medical", ecri: "16-164", modelNumber: "MX800-A01",
    catalogNumber: "CAT-PHI-MX800", countryOfOrigin: "Netherlands", equipmentClass: "Class II",
    equipmentType: "Diagnostic", status: "Active", assetsLinked: 24, createdAt: "2025-12-15"
  },
  {
    id: "DEV-002", deviceName: "Ventilator", deviceType: "Life Support", genericName: "Mechanical Ventilator",
    deviceModel: "Evita V800", manufacturer: "Draeger", ecri: "10-134", modelNumber: "V800-ICU",
    catalogNumber: "CAT-DRG-V800", countryOfOrigin: "Germany", equipmentClass: "Class III",
    equipmentType: "Therapeutic", status: "Active", assetsLinked: 12, createdAt: "2025-11-20"
  },
  {
    id: "DEV-003", deviceName: "Infusion Pump", deviceType: "Infusion", genericName: "Volumetric Infusion Pump",
    deviceModel: "Alaris GP", manufacturer: "BD (Becton Dickinson)", ecri: "18-201", modelNumber: "GP-8015",
    catalogNumber: "CAT-BD-ALARIS", countryOfOrigin: "USA", equipmentClass: "Class II",
    equipmentType: "Therapeutic", status: "Active", assetsLinked: 56, createdAt: "2025-10-05"
  },
  {
    id: "DEV-004", deviceName: "Ultrasound System", deviceType: "Imaging", genericName: "Diagnostic Ultrasound Scanner",
    deviceModel: "LOGIQ E10s", manufacturer: "GE Healthcare", ecri: "12-112", modelNumber: "E10S-R3",
    catalogNumber: "CAT-GE-LOGIQ", countryOfOrigin: "South Korea", equipmentClass: "Class II",
    equipmentType: "Diagnostic", status: "Active", assetsLinked: 8, createdAt: "2025-09-18"
  },
  {
    id: "DEV-005", deviceName: "Defibrillator", deviceType: "Emergency", genericName: "External Defibrillator/Monitor",
    deviceModel: "HeartStart MRx", manufacturer: "Philips Medical", ecri: "14-155", modelNumber: "MRX-M3536A",
    catalogNumber: "CAT-PHI-MRX", countryOfOrigin: "USA", equipmentClass: "Class III",
    equipmentType: "Therapeutic", status: "Draft", assetsLinked: 0, createdAt: "2026-01-10"
  },
  {
    id: "DEV-006", deviceName: "Anesthesia Machine", deviceType: "Life Support", genericName: "Anesthesia Delivery System",
    deviceModel: "Aisys CS2", manufacturer: "GE Healthcare", ecri: "11-109", modelNumber: "CS2-ANES",
    catalogNumber: "CAT-GE-AISYS", countryOfOrigin: "USA", equipmentClass: "Class III",
    equipmentType: "Therapeutic", status: "Active", assetsLinked: 6, createdAt: "2025-08-22"
  },
]

// ----- Device Model Master (auto-populate source) -----
interface DeviceModelData {
  model: string
  deviceName: string
  deviceType: string
  genericName: string
  manufacturer: string
  ecri: string
  modelNumber: string
  catalogNumber: string
  countryOfOrigin: string
  powerRating: string
  powerRatingTypical: string
  powerRatingMax: string
  inletPower: string
  voltage: string
  equipmentClass: string
  equipmentType: string
  powerSupplyType: string
  depreciationMethod: string
  usefulLifeYears: string
  salvageValue: string
  depreciationRate: string
  depreciationFrequency: string
}

const deviceModelMaster: DeviceModelData[] = [
  {
    model: "IntelliVue MX800", deviceName: "Patient Monitor", deviceType: "monitoring", genericName: "Multi-Parameter Patient Monitor",
    manufacturer: "Philips Medical", ecri: "16-164", modelNumber: "MX800-A01", catalogNumber: "CAT-PHI-MX800",
    countryOfOrigin: "netherlands", powerRating: "150W", powerRatingTypical: "90W", powerRatingMax: "180W",
    inletPower: "ac_battery", voltage: "110-240v", equipmentClass: "class ii", equipmentType: "diagnostic", powerSupplyType: "internal",
    depreciationMethod: "SLM", usefulLifeYears: "10", salvageValue: "5000", depreciationRate: "10", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Evita V800", deviceName: "Ventilator", deviceType: "life support", genericName: "Mechanical Ventilator",
    manufacturer: "Draeger", ecri: "10-134", modelNumber: "V800-ICU", catalogNumber: "CAT-DRG-V800",
    countryOfOrigin: "germany", powerRating: "250W", powerRatingTypical: "180W", powerRatingMax: "300W",
    inletPower: "ac_battery", voltage: "220v", equipmentClass: "class iii", equipmentType: "life support", powerSupplyType: "internal",
    depreciationMethod: "SLM", usefulLifeYears: "8", salvageValue: "8000", depreciationRate: "12.5", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Alaris GP", deviceName: "Infusion Pump", deviceType: "infusion", genericName: "Volumetric Infusion Pump",
    manufacturer: "BD (Becton Dickinson)", ecri: "18-201", modelNumber: "GP-8015", catalogNumber: "CAT-BD-ALARIS",
    countryOfOrigin: "usa", powerRating: "30W", powerRatingTypical: "15W", powerRatingMax: "35W",
    inletPower: "ac_battery", voltage: "110-240v", equipmentClass: "class ii", equipmentType: "therapeutic", powerSupplyType: "external",
    depreciationMethod: "SLM", usefulLifeYears: "7", salvageValue: "500", depreciationRate: "14.3", depreciationFrequency: "ANNUAL"
  },
  {
    model: "LOGIQ E10s", deviceName: "Ultrasound System", deviceType: "imaging", genericName: "Diagnostic Ultrasound Scanner",
    manufacturer: "GE Healthcare", ecri: "12-112", modelNumber: "E10S-R3", catalogNumber: "CAT-GE-LOGIQ",
    countryOfOrigin: "south korea", powerRating: "700W", powerRatingTypical: "400W", powerRatingMax: "850W",
    inletPower: "ac", voltage: "110-240v", equipmentClass: "class ii", equipmentType: "diagnostic", powerSupplyType: "internal",
    depreciationMethod: "WDV", usefulLifeYears: "10", salvageValue: "15000", depreciationRate: "15", depreciationFrequency: "ANNUAL"
  },
  {
    model: "HeartStart MRx", deviceName: "Defibrillator", deviceType: "emergency", genericName: "External Defibrillator/Monitor",
    manufacturer: "Philips Medical", ecri: "14-155", modelNumber: "MRX-M3536A", catalogNumber: "CAT-PHI-MRX",
    countryOfOrigin: "usa", powerRating: "200W", powerRatingTypical: "50W", powerRatingMax: "360J",
    inletPower: "ac_battery", voltage: "110-240v", equipmentClass: "class iii", equipmentType: "therapeutic", powerSupplyType: "hybrid",
    depreciationMethod: "SLM", usefulLifeYears: "8", salvageValue: "2000", depreciationRate: "12.5", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Aisys CS2", deviceName: "Anesthesia Machine", deviceType: "life support", genericName: "Anesthesia Delivery System",
    manufacturer: "GE Healthcare", ecri: "11-109", modelNumber: "CS2-ANES", catalogNumber: "CAT-GE-AISYS",
    countryOfOrigin: "usa", powerRating: "500W", powerRatingTypical: "300W", powerRatingMax: "600W",
    inletPower: "ac", voltage: "220v", equipmentClass: "class iii", equipmentType: "therapeutic", powerSupplyType: "internal",
    depreciationMethod: "SLM", usefulLifeYears: "12", salvageValue: "20000", depreciationRate: "8.3", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Purelan 20", deviceName: "Water Purification System", deviceType: "laboratory", genericName: "Laboratory Water Purifier",
    manufacturer: "ELGA LabWater", ecri: "17-180", modelNumber: "PL5125", catalogNumber: "CAT-ELGA-PL20",
    countryOfOrigin: "uk", powerRating: "120W", powerRatingTypical: "80W", powerRatingMax: "150W",
    inletPower: "ac", voltage: "220v", equipmentClass: "class i", equipmentType: "laboratory", powerSupplyType: "internal",
    depreciationMethod: "SLM", usefulLifeYears: "10", salvageValue: "1000", depreciationRate: "10", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Primus IE", deviceName: "Anesthesia Workstation", deviceType: "life support", genericName: "Anesthesia Workstation",
    manufacturer: "Draeger", ecri: "11-110", modelNumber: "PRIMUS-IE", catalogNumber: "CAT-DRG-PRIMUS",
    countryOfOrigin: "germany", powerRating: "600W", powerRatingTypical: "350W", powerRatingMax: "750W",
    inletPower: "ac", voltage: "220v", equipmentClass: "class iii", equipmentType: "life support", powerSupplyType: "internal",
    depreciationMethod: "WDV", usefulLifeYears: "12", salvageValue: "25000", depreciationRate: "15", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Venue Go", deviceName: "Point-of-Care Ultrasound", deviceType: "imaging", genericName: "Portable Ultrasound System",
    manufacturer: "GE Healthcare", ecri: "12-115", modelNumber: "VENUE-GO-R2", catalogNumber: "CAT-GE-VENUE",
    countryOfOrigin: "south korea", powerRating: "180W", powerRatingTypical: "80W", powerRatingMax: "200W",
    inletPower: "ac_battery", voltage: "110-240v", equipmentClass: "class ii", equipmentType: "diagnostic", powerSupplyType: "hybrid",
    depreciationMethod: "SLM", usefulLifeYears: "8", salvageValue: "5000", depreciationRate: "12.5", depreciationFrequency: "ANNUAL"
  },
  {
    model: "Perfusor Space", deviceName: "Syringe Pump", deviceType: "infusion", genericName: "Syringe Infusion Pump",
    manufacturer: "B. Braun", ecri: "18-205", modelNumber: "SPACE-8713070", catalogNumber: "CAT-BB-SPACE",
    countryOfOrigin: "germany", powerRating: "20W", powerRatingTypical: "10W", powerRatingMax: "25W",
    inletPower: "ac_battery", voltage: "110-240v", equipmentClass: "class ii", equipmentType: "therapeutic", powerSupplyType: "external",
    depreciationMethod: "SLM", usefulLifeYears: "7", salvageValue: "300", depreciationRate: "14.3", depreciationFrequency: "ANNUAL"
  },
]

// ----- Device Document Categories -----
const deviceDocCategories = [
  { name: "PPM Checklist", desc: "Planned preventive maintenance checklists", formats: "PDF, DOC" },
  { name: "Calibration Report", desc: "Calibration test reports and certificates", formats: "PDF" },
  { name: "User Manual / Instruction Manual", desc: "Operator instructions and user guides", formats: "PDF" },
  { name: "Technical Manual / Service Manual", desc: "Technical and service documentation", formats: "PDF" },
  { name: "Quick User Guide (SOP)", desc: "Standard operating procedures and quick reference", formats: "PDF, DOC" },
  { name: "Equipment Specification", desc: "Product specifications and datasheets", formats: "PDF, DOC" },
  { name: "Equipment Related Risk Register", desc: "Risk assessment and hazard analysis", formats: "PDF, XLS" },
  { name: "Cleaning & Disinfection Procedures", desc: "IPC cleaning and disinfection protocols", formats: "PDF, DOC" },
  { name: "CE Certificate", desc: "European conformity marking certificate", formats: "PDF" },
  { name: "FDA Certificate", desc: "FDA 510(k) clearance or approval documents", formats: "PDF" },
  { name: "Spare Parts List", desc: "OEM spare parts catalog and part numbers", formats: "PDF, XLS" },
  { name: "Cyber Security Compliance Certificate", desc: "Medical device cybersecurity compliance", formats: "PDF" },
  { name: "MOH Registration / Classification", desc: "Ministry of Health device registration", formats: "PDF" },
]

// ----- Device Documents Section (follows Asset Registration zigzag pattern) -----
function DeviceDocumentsSection({ docsOpen, setDocsOpen }: { docsOpen: boolean; setDocsOpen: (v: boolean) => void }) {
  const [categories, setCategories] = useState(deviceDocCategories)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")
  const [newCatFormats, setNewCatFormats] = useState("PDF, DOC")

  const handleSimulateUpload = (catName: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [catName]: [...(prev[catName] || []), `${catName.replace(/\s+/g, '_')}_${Date.now()}.pdf`]
    }))
  }

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    setCategories(prev => [...prev, {
      name: newCatName.trim(),
      desc: newCatDesc.trim() || "Custom document category",
      formats: newCatFormats.trim() || "PDF, DOC",
    }])
    setNewCatName(""); setNewCatDesc(""); setNewCatFormats("PDF, DOC"); setShowAddForm(false)
  }

  const handleRemoveCategory = (catName: string) => {
    setCategories(prev => prev.filter(c => c.name !== catName))
    setUploadedFiles(prev => { const next = { ...prev }; delete next[catName]; return next })
  }

  const uploadedCount = Object.keys(uploadedFiles).filter(k => uploadedFiles[k]?.length > 0).length

  return (
    <Card className="border border-border shadow-sm">
      <button onClick={() => setDocsOpen(!docsOpen)} className="w-full flex items-center justify-between p-6 text-left">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-extrabold text-foreground">Documents Section</h3>
          <Badge variant="secondary" className="text-xs font-semibold">
            {uploadedCount} / {categories.length} uploaded
          </Badge>
        </div>
        {docsOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {docsOpen && (
        <CardContent className="px-6 pb-6 pt-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground">Upload documents by category. Click the upload area or drag and drop files.</p>
            <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-1.5" /> Additional Category
            </Button>
          </div>

          {/* Add Category Inline Form */}
          {showAddForm && (
            <div className="rounded-xl border-2 border-dashed border-[#00BCD4]/40 bg-[#00BCD4]/5 p-5 mb-5">
              <h4 className="text-sm font-bold text-foreground mb-4">Add New Document Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Category Name <span className="text-[#EF4444]">*</span></Label>
                  <Input placeholder="e.g. Warranty Certificate" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="h-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Description</Label>
                  <Input placeholder="e.g. Equipment warranty documents" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} className="h-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Accepted Formats</Label>
                  <Input placeholder="e.g. PDF, DOC, XLS" value={newCatFormats} onChange={e => setNewCatFormats(e.target.value)} className="h-10" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                  onClick={handleAddCategory} disabled={!newCatName.trim()}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Category
                </Button>
                <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => { setShowAddForm(false); setNewCatName(""); setNewCatDesc(""); setNewCatFormats("PDF, DOC") }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Zigzag Document Rows (same as Asset Registration) */}
          <div className="flex flex-col gap-3">
            {categories.map((cat, idx) => {
              const isEven = idx % 2 === 0
              const files = uploadedFiles[cat.name] || []
              const hasFiles = files.length > 0
              const isCustom = !deviceDocCategories.some(d => d.name === cat.name)

              return (
                <div key={cat.name} className={cn(
                  "flex rounded-xl border overflow-hidden transition-all",
                  hasFiles ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-border",
                  isEven ? "flex-row" : "flex-row-reverse"
                )}>
                  {/* Info side */}
                  <div className={cn("flex-1 p-4 flex flex-col justify-center", isEven ? "pr-2" : "pl-2")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0",
                        hasFiles ? "bg-[#10B981] text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {hasFiles ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                      {isCustom && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00BCD4]/10 text-[#00BCD4]">Custom</span>
                      )}
                      {isCustom && (
                        <button className="ml-auto text-muted-foreground hover:text-[#EF4444] transition-colors" onClick={() => handleRemoveCategory(cat.name)} title="Remove category">
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
                            {f.length > 25 ? f.substring(0, 25) + '...' : f}
                            <button className="ml-0.5 text-muted-foreground hover:text-[#EF4444]"
                              onClick={() => setUploadedFiles(prev => ({ ...prev, [cat.name]: prev[cat.name].filter((_, i) => i !== fIdx) }))}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload zone side */}
                  <div className={cn(
                    "w-48 flex-shrink-0 border-dashed flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors group",
                    isEven ? "border-l" : "border-r",
                    hasFiles ? "border-[#10B981]/30 hover:border-[#10B981]" : "border-border hover:border-[#00BCD4]"
                  )} onClick={() => handleSimulateUpload(cat.name)}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      hasFiles ? "bg-[#10B981]/10 group-hover:bg-[#10B981]/20" : "bg-muted group-hover:bg-[#00BCD4]/10"
                    )}>
                      <Upload className={cn(
                        "w-4 h-4 transition-colors",
                        hasFiles ? "text-[#10B981]" : "text-muted-foreground group-hover:text-[#00BCD4]"
                      )} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground text-center">
                      {hasFiles ? "Add more" : "Drop file here"}
                    </span>
                    <span className="text-xs text-muted-foreground">{cat.formats}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ----- Service Mapping Types -----
interface ServiceMapping {
  id: string
  serviceName: string
  himsProcedureCode: string
  standardPrice: number
  active: boolean
}

// ----- Service Mapping Section -----
function ServiceMappingSection({ servicesOpen, setServicesOpen }: { servicesOpen: boolean; setServicesOpen: (v: boolean) => void }) {
  const [services, setServices] = useState<ServiceMapping[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formError, setFormError] = useState("")

  // Modal form state
  const [svcName, setSvcName] = useState("")
  const [himsCode, setHimsCode] = useState("")
  const [price, setPrice] = useState("")
  const [isActive, setIsActive] = useState(true)

  const resetModal = () => {
    setSvcName(""); setHimsCode(""); setPrice(""); setIsActive(true)
    setEditingId(null); setFormError(""); setShowModal(false)
  }

  const openAdd = () => {
    setSvcName(""); setHimsCode(""); setPrice(""); setIsActive(true)
    setEditingId(null); setFormError("")
    setShowModal(true)
  }

  const openEdit = (svc: ServiceMapping) => {
    setSvcName(svc.serviceName)
    setHimsCode(svc.himsProcedureCode)
    setPrice(String(svc.standardPrice))
    setIsActive(svc.active)
    setEditingId(svc.id)
    setFormError("")
    setShowModal(true)
  }

  const handleSave = () => {
    setFormError("")
    if (!svcName.trim()) { setFormError("Service Name is required."); return }
    if (!himsCode.trim()) { setFormError("HIMS Procedure Code is required."); return }
    const numPrice = parseFloat(price)
    if (!price || isNaN(numPrice) || numPrice <= 0) { setFormError("Standard Price must be greater than 0."); return }

    // Duplicate check - Service Name
    const dupName = services.find(s => s.serviceName.toLowerCase() === svcName.trim().toLowerCase() && s.id !== editingId)
    if (dupName) { setFormError(`Service "${svcName.trim()}" already exists for this device.`); return }

    // Duplicate check - HIMS Code
    const dupCode = services.find(s => s.himsProcedureCode.toLowerCase() === himsCode.trim().toLowerCase() && s.id !== editingId)
    if (dupCode) { setFormError(`HIMS Procedure Code "${himsCode.trim()}" is already mapped to "${dupCode.serviceName}".`); return }

    if (editingId) {
      setServices(prev => prev.map(s => s.id === editingId ? {
        ...s, serviceName: svcName.trim(), himsProcedureCode: himsCode.trim(),
        standardPrice: numPrice, active: isActive,
      } : s))
    } else {
      setServices(prev => [...prev, {
        id: `SVC-${Date.now()}`, serviceName: svcName.trim(), himsProcedureCode: himsCode.trim(),
        standardPrice: numPrice, active: isActive,
      }])
    }
    resetModal()
  }

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const toggleActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  const activeCount = services.filter(s => s.active).length

  return (
    <>
      <Card className="border border-border shadow-sm">
        <button onClick={() => setServicesOpen(!servicesOpen)} className="w-full flex items-center justify-between p-6 text-left">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-extrabold text-foreground">Service Mapping</h3>
            <Badge variant="secondary" className="text-xs font-semibold">
              {activeCount} active / {services.length} total
            </Badge>
          </div>
          {servicesOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>
        {servicesOpen && (
          <CardContent className="px-6 pb-6 pt-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">Map services this device can perform with HIMS procedure codes and pricing.</p>
              <Button className="text-white border-0 text-sm font-semibold h-10 px-4"
                style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={openAdd}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Service
              </Button>
            </div>

            {services.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border py-12 flex flex-col items-center gap-3 text-muted-foreground">
                <Monitor className="w-8 h-8 opacity-40" />
                <p className="text-sm font-semibold">No services mapped yet</p>
                <p className="text-xs">Click "Add Service" to map a service to this device.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-xs font-bold text-foreground">#</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Service Name</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">HIMS Procedure Code</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-right">Standard Price</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-center">Status</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((svc, idx) => (
                      <TableRow key={svc.id} className={cn(!svc.active && "opacity-50")}>
                        <TableCell className="text-sm font-medium text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell className="text-sm font-semibold text-foreground">{svc.serviceName}</TableCell>
                        <TableCell>
                          <code className="px-2 py-0.5 rounded bg-muted text-xs font-mono font-semibold text-foreground">{svc.himsProcedureCode}</code>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-foreground text-right">
                          {svc.standardPrice.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </TableCell>
                        <TableCell className="text-center">
                          <button onClick={() => toggleActive(svc.id)} title={svc.active ? "Deactivate" : "Activate"}>
                            <Badge className={cn("text-[10px] font-bold cursor-pointer transition-colors",
                              svc.active ? "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border-0" :
                                "bg-muted text-muted-foreground hover:bg-muted/80 border-0")}>
                              {svc.active ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                              onClick={() => openEdit(svc)} title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#EF4444]"
                              onClick={() => handleDelete(svc.id)} title="Delete">
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
          </CardContent>
        )}
      </Card>

      {/* Add/Edit Service Modal - rendered via portal to avoid overflow clipping */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={resetModal} />
          <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-[600px] mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-extrabold text-foreground">{editingId ? "Edit Service" : "Add Service"}</h3>
              <button onClick={resetModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {formError && (
                <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-4 py-3 text-sm font-semibold text-[#EF4444]">{formError}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Service Name <span className="text-[#EF4444]">*</span></Label>
                  <Input className="h-10" placeholder="e.g. CT Brain, CT Head"
                    value={svcName} onChange={e => setSvcName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">HIMS Procedure Code <span className="text-[#EF4444]">*</span></Label>
                  <Input className="h-10" placeholder="e.g. RAD-CT-001"
                    value={himsCode} onChange={e => setHimsCode(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Standard Price <span className="text-[#EF4444]">*</span></Label>
                  <Input className="h-10" type="number" min="0.01" step="0.01" placeholder="e.g. 2500.00"
                    value={price} onChange={e => setPrice(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-[#00BCD4] focus:ring-[#00BCD4] accent-[#00BCD4]" />
                  <span className="text-sm font-semibold text-foreground">Active</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={resetModal}>Cancel</Button>
              <Button className="text-white border-0 text-sm font-semibold h-10 px-5"
                style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={handleSave}>
                <Save className="w-4 h-4 mr-1.5" /> {editingId ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ----- Form Field -----
function FormField({ label, required, children, className }: {
  label: string; required?: boolean; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-sm font-bold text-foreground">
        {label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}

// ----- Device Registration Form -----
function DeviceRegistrationForm({ onBack, editId }: { onBack: () => void; editId?: string | null }) {
  const [docsOpen, setDocsOpen] = useState(true)
  const [servicesOpen, setServicesOpen] = useState(true)
  const isEdit = !!editId
  const device = isEdit ? mockDevices.find(d => d.id === editId) : null

  // Form state - all controlled inputs
  const [form, setForm] = useState({
    deviceName: device?.deviceName || "",
    deviceType: device?.deviceType?.toLowerCase() || "",
    genericName: device?.genericName || "",
    deviceModel: device?.deviceModel || "",
    ecri: device?.ecri || "",
    manufacturer: device?.manufacturer || "",
    modelNumber: device?.modelNumber || "",
    catalogNumber: device?.catalogNumber || "",
    countryOfOrigin: device?.countryOfOrigin?.toLowerCase() || "",
    powerRating: "",
    powerRatingTypical: "",
    powerRatingMax: "",
    inletPower: "",
    voltage: "",
    equipmentClass: device?.equipmentClass?.toLowerCase() || "",
    equipmentType: device?.equipmentType?.toLowerCase() || "",
    powerSupplyType: "",
    hospital: "",
    department: "",
    description: device ? `${device.genericName} - ${device.manufacturer}` : "",
  depreciationMethod: "",
  usefulLifeYears: "",
  salvageValue: "",
  depreciationRate: "",
  depreciationFrequency: "",
  })

  const updateField = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }



  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 border-b"
        style={{ background: "linear-gradient(135deg, #1B2A4A, #1E3050)", borderColor: "rgba(0,188,212,0.15)" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#8899B0] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#8899B0]">Home</span>
            <span className="text-[#4A5E78]">/</span>
            <span className="text-[#8899B0]">Device Management</span>
            <span className="text-[#4A5E78]">/</span>
            <span className="font-bold text-white">{isEdit ? "Edit Device" : "Device Registration"}</span>
          </div>
        </div>
      </header>
      <div className="h-[2px] flex-shrink-0" style={{ background: "linear-gradient(90deg, #00BCD4, #00E5CC, transparent 80%)" }} />

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6" style={{ background: "#EDF2F7" }}>
        <div className="flex flex-col gap-6 max-w-[1400px]">

          {/* Main Form Card */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Row 1 */}
                <FormField label="Device Name" required>
                  <Input className="h-10" placeholder="Device Name"
                    value={form.deviceName} onChange={e => updateField("deviceName", e.target.value)} />
                </FormField>
                <FormField label="Device Type" required>
                  <Select value={form.deviceType} onValueChange={v => updateField("deviceType", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select device type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="life support">Life Support</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                      <SelectItem value="infusion">Infusion</SelectItem>
                      <SelectItem value="surgical">Surgical</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="sterilization">Sterilization</SelectItem>
                      <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Generic Name" required>
                  <Input className="h-10" placeholder="Generic Name"
                    value={form.genericName} onChange={e => updateField("genericName", e.target.value)} />
                </FormField>
                <FormField label="Device Model" required>
                  <Input className="h-10" placeholder="Device Model"
                    value={form.deviceModel} onChange={e => {
                      const val = e.target.value
                      // Check for exact match to auto-populate all fields
                      const found = deviceModelMaster.find(m =>
                        m.model.toLowerCase() === val.toLowerCase() ||
                        m.model.toLowerCase() === val.split(' - ')[0]?.toLowerCase()
                      )
                      if (found) {
                        setForm(prev => ({
                          ...prev,
                          deviceModel: found.model,
                          deviceName: found.deviceName,
                          deviceType: found.deviceType,
                          genericName: found.genericName,
                          ecri: found.ecri,
                          manufacturer: found.manufacturer,
                          modelNumber: found.modelNumber,
                          catalogNumber: found.catalogNumber,
                          countryOfOrigin: found.countryOfOrigin,
                          powerRating: found.powerRating,
                          powerRatingTypical: found.powerRatingTypical,
                          powerRatingMax: found.powerRatingMax,
                          inletPower: found.inletPower,
                          voltage: found.voltage,
                          equipmentClass: found.equipmentClass,
                          equipmentType: found.equipmentType,
                          powerSupplyType: found.powerSupplyType,
                          depreciationMethod: found.depreciationMethod,
                          usefulLifeYears: found.usefulLifeYears,
                          salvageValue: found.salvageValue,
                          depreciationRate: found.depreciationRate,
                          depreciationFrequency: found.depreciationFrequency,
                          description: `${found.genericName} - ${found.manufacturer}`,
                        }))
                      } else {
                        setForm(prev => ({ ...prev, deviceModel: val }))
                      }
                    }} list="device-model-list" />
                  <datalist id="device-model-list">
                    {deviceModelMaster.map(m => (
                      <option key={m.model} value={m.model} />
                    ))}
                  </datalist>
                </FormField>

                {/* Row 2 */}
                <FormField label="ECRI">
                  <Input className="h-10" placeholder="ECRI"
                    value={form.ecri} onChange={e => updateField("ecri", e.target.value)} />
                </FormField>
                <FormField label="Manufacturer" required>
                  <Input className="h-10" placeholder="Manufacturer"
                    value={form.manufacturer} onChange={e => updateField("manufacturer", e.target.value)} />
                </FormField>
                <FormField label="Model Number">
                  <Input className="h-10" placeholder="Model Number"
                    value={form.modelNumber} onChange={e => updateField("modelNumber", e.target.value)} />
                </FormField>
                <FormField label="Catalog Number">
                  <Input className="h-10" placeholder="Catalog Number"
                    value={form.catalogNumber} onChange={e => updateField("catalogNumber", e.target.value)} />
                </FormField>

                {/* Row 3 */}
                <FormField label="Country of Origin" required>
                  <Select value={form.countryOfOrigin} onValueChange={v => updateField("countryOfOrigin", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">USA</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="netherlands">Netherlands</SelectItem>
                      <SelectItem value="japan">Japan</SelectItem>
                      <SelectItem value="south korea">South Korea</SelectItem>
                      <SelectItem value="china">China</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="uk">UK</SelectItem>
                      <SelectItem value="france">France</SelectItem>
                      <SelectItem value="italy">Italy</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Power Rating">
                  <Input className="h-10" placeholder="Power rating"
                    value={form.powerRating} onChange={e => updateField("powerRating", e.target.value)} />
                </FormField>
                <FormField label="Power Rating Typical">
                  <Input className="h-10" placeholder="Power rating Typical"
                    value={form.powerRatingTypical} onChange={e => updateField("powerRatingTypical", e.target.value)} />
                </FormField>
                <FormField label="Power Rating Max">
                  <Input className="h-10" placeholder="Power rating Max"
                    value={form.powerRatingMax} onChange={e => updateField("powerRatingMax", e.target.value)} />
                </FormField>

                {/* Row 4 */}
                <FormField label="Inlet Power">
                  <Select value={form.inletPower} onValueChange={v => updateField("inletPower", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select inlet power" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac">AC Mains</SelectItem>
                      <SelectItem value="dc">DC</SelectItem>
                      <SelectItem value="battery">Battery Only</SelectItem>
                      <SelectItem value="ac_battery">AC + Battery</SelectItem>
                      <SelectItem value="ups">UPS Required</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Voltage">
                  <Select value={form.voltage} onValueChange={v => updateField("voltage", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select voltage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="110v">110V</SelectItem>
                      <SelectItem value="220v">220V</SelectItem>
                      <SelectItem value="110-240v">110-240V (Universal)</SelectItem>
                      <SelectItem value="380v">380V (3-Phase)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Equipment Class">
                  <Select value={form.equipmentClass} onValueChange={v => updateField("equipmentClass", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class i">Class I</SelectItem>
                      <SelectItem value="class ii">Class II</SelectItem>
                      <SelectItem value="class iii">Class III</SelectItem>
                      <SelectItem value="class iv">Class IV</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Equipment Type">
                  <Select value={form.equipmentType} onValueChange={v => updateField("equipmentType", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="therapeutic">Therapeutic</SelectItem>
                      <SelectItem value="life support">Life Support</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="surgical">Surgical</SelectItem>
                      <SelectItem value="sterilization">Sterilization</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Row 5 */}
                <FormField label="Power Supply Type">
                  <Select value={form.powerSupplyType} onValueChange={v => updateField("powerSupplyType", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal SMPS</SelectItem>
                      <SelectItem value="external">External Adapter</SelectItem>
                      <SelectItem value="battery">Battery Operated</SelectItem>
                      <SelectItem value="hybrid">Hybrid (AC + Battery)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Hospital / Clinic Name" required>
                  <Select value={form.hospital} onValueChange={v => updateField("hospital", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select hospital" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apollo-chennai">Apollo Hospital - Chennai</SelectItem>
                      <SelectItem value="apollo-delhi">Apollo Hospital - Delhi</SelectItem>
                      <SelectItem value="apollo-bangalore">Apollo Hospital - Bangalore</SelectItem>
                      <SelectItem value="apollo-hyderabad">Apollo Hospital - Hyderabad</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Department Name">
                  <Select value={form.department} onValueChange={v => updateField("department", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="icu">ICU</SelectItem>
                      <SelectItem value="ot">Operation Theatre</SelectItem>
                      <SelectItem value="er">Emergency Room</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="general">General Ward</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <FormField label="Description" required className="lg:col-span-2">
                  <Textarea className="min-h-[90px]" placeholder="Description"
                    value={form.description} onChange={e => updateField("description", e.target.value)} />
                </FormField>
              </div>

              {/* Depreciation Configuration */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-base font-extrabold text-foreground mb-5">Depreciation Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <FormField label="Depreciation Method" required>
                    <Select value={form.depreciationMethod} onValueChange={v => updateField("depreciationMethod", v)}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select method" /></SelectTrigger>
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
                    <Input type="number" className="h-10" placeholder="e.g. 10" min="1" max="50"
                      value={form.usefulLifeYears} onChange={e => updateField("usefulLifeYears", e.target.value)} />
                  </FormField>
                  <FormField label="Salvage / Residual Value">
                    <Input type="number" className="h-10" placeholder="0.00" step="0.01"
                      value={form.salvageValue} onChange={e => updateField("salvageValue", e.target.value)} />
                  </FormField>
                  <FormField label="Depreciation Rate (%)">
                    <Input type="number" className="h-10" placeholder="Auto or manual" step="0.1"
                      value={form.depreciationRate} onChange={e => updateField("depreciationRate", e.target.value)} />
                  </FormField>
                  <FormField label="Depreciation Frequency" required>
                    <Select value={form.depreciationFrequency} onValueChange={v => updateField("depreciationFrequency", v)}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                        <SelectItem value="ANNUAL">Annual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section - Collapsible */}
          <DeviceDocumentsSection docsOpen={docsOpen} setDocsOpen={setDocsOpen} />

          {/* Service Mapping Section - Collapsible */}
          <ServiceMappingSection servicesOpen={servicesOpen} setServicesOpen={setServicesOpen} />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
              <Save className="w-4 h-4 mr-1.5" /> {isEdit ? "Update Device" : "Save as Draft"}
            </Button>
            <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
              <Send className="w-4 h-4 mr-1.5" /> {isEdit ? "Update & Activate" : "Save & Activate"}
            </Button>
            <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={onBack}>Cancel</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ----- Device Detail View -----
function DeviceDetailView({ device, onBack, onEdit }: { device: DeviceMaster; onBack: () => void; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h2 className="text-xl font-extrabold text-foreground">{device.deviceName}</h2>
            <p className="text-sm text-muted-foreground">{device.id} | {device.manufacturer} - {device.deviceModel}</p>
          </div>
        </div>
        <Button onClick={onEdit} className="text-white border-0 text-sm font-semibold h-10 px-4" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
          <Pencil className="w-4 h-4 mr-1.5" /> Edit Device
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Device Type", value: device.deviceType },
          { label: "Equipment Class", value: device.equipmentClass },
          { label: "Manufacturer", value: device.manufacturer },
          { label: "Assets Linked", value: device.assetsLinked.toString(), highlight: true },
        ].map(item => (
          <Card key={item.label} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
              <p className={cn("text-lg font-extrabold", item.highlight ? "text-[#00BCD4]" : "text-foreground")}>{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Device Details Grid */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">Device Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Device Name", value: device.deviceName },
              { label: "Device Type", value: device.deviceType },
              { label: "Generic Name", value: device.genericName },
              { label: "Device Model", value: device.deviceModel },
              { label: "ECRI Code", value: device.ecri },
              { label: "Manufacturer", value: device.manufacturer },
              { label: "Model Number", value: device.modelNumber },
              { label: "Catalog Number", value: device.catalogNumber },
              { label: "Country of Origin", value: device.countryOfOrigin },
              { label: "Equipment Class", value: device.equipmentClass },
              { label: "Equipment Type", value: device.equipmentType },
              { label: "Status", value: device.status },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-bold text-foreground">{item.value || "-"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Linked Assets */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
            <h3 className="text-base font-extrabold text-foreground">Linked Assets ({device.assetsLinked})</h3>
            <Badge variant="outline" className="text-xs font-bold" style={{ borderColor: "rgba(0,188,212,0.3)", color: "#00BCD4" }}>
              {device.assetsLinked} assets using this device
            </Badge>
          </div>
          {device.assetsLinked > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset ID</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Serial No</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: Math.min(device.assetsLinked, 5) }, (_, i) => (
                    <TableRow key={i} className="hover:bg-muted/20">
                      <TableCell className="text-sm font-semibold text-[#00BCD4]">AST-{String(i + 1).padStart(4, "0")}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">SN-{device.id}-{String(i + 1).padStart(3, "0")}</TableCell>
                      <TableCell className="text-sm text-foreground">ICU - Floor {i + 1}</TableCell>
                      <TableCell>
                        <Badge className="text-[10px] font-bold px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] border-0">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">No assets linked to this device yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ----- Device List View -----
function DeviceListView({ onRegister, onView, onEdit }: {
  onRegister: () => void; onView: (d: DeviceMaster) => void; onEdit: (id: string) => void
}) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = mockDevices.filter(d => {
    const matchSearch = !search ||
      d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      d.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.deviceModel.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || d.deviceType === typeFilter
    const matchStatus = statusFilter === "all" || d.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const statusColor = (s: string) => {
    switch (s) {
      case "Active": return "bg-[#10B981]/10 text-[#10B981]"
      case "Draft": return "bg-[#F59E0B]/10 text-[#F59E0B]"
      case "Inactive": return "bg-[#EF4444]/10 text-[#EF4444]"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(0,188,212,0.15), rgba(0,188,212,0.05))" }}>
            <Cpu className="w-5 h-5 text-[#00BCD4]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">Device Management</h2>
            <p className="text-sm text-muted-foreground">Manage device master catalog for asset association</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-sm font-semibold h-9 px-3">
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
          <Button onClick={onRegister} className="text-white border-0 text-sm font-semibold h-9 px-4" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
            <Plus className="w-4 h-4 mr-1.5" /> Register Device
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Devices", value: mockDevices.length, color: "#1B2A4A" },
          { label: "Active", value: mockDevices.filter(d => d.status === "Active").length, color: "#10B981" },
          { label: "Draft", value: mockDevices.filter(d => d.status === "Draft").length, color: "#F59E0B" },
          { label: "Total Assets Linked", value: mockDevices.reduce((sum, d) => sum + d.assetsLinked, 0), color: "#00BCD4" },
        ].map(stat => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: stat.color }}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9 h-10" placeholder="Search devices..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-10 w-[180px]"><Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /><SelectValue placeholder="Device Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Life Support">Life Support</SelectItem>
                <SelectItem value="Imaging">Imaging</SelectItem>
                <SelectItem value="Infusion">Infusion</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Device ID</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Device Name</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manufacturer</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Model</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Assets</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(device => (
                  <TableRow key={device.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => onView(device)}>
                    <TableCell className="text-sm font-bold text-[#00BCD4]">{device.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-bold text-foreground">{device.deviceName}</p>
                        <p className="text-xs text-muted-foreground">{device.genericName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5">{device.deviceType}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{device.manufacturer}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{device.deviceModel}</TableCell>
                    <TableCell className="text-sm text-foreground">{device.equipmentClass}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm font-bold text-[#00BCD4]">{device.assetsLinked}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[10px] font-bold px-2 py-0.5 border-0", statusColor(device.status))}>{device.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(device) }}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(device.id) }}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-[#EF4444]"><Trash2 className="w-4 h-4 mr-2" /> Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ----- Main Export -----
export function DeviceManagementPage() {
  const [view, setView] = useState<"list" | "register" | "detail">("list")
  const [selectedDevice, setSelectedDevice] = useState<DeviceMaster | null>(null)
  const [editDeviceId, setEditDeviceId] = useState<string | null>(null)

  if (view === "register") {
    return <DeviceRegistrationForm onBack={() => { setView("list"); setEditDeviceId(null) }} editId={editDeviceId} />
  }

  if (view === "detail" && selectedDevice) {
    return (
      <DeviceDetailView
        device={selectedDevice}
        onBack={() => setView("list")}
        onEdit={() => { setEditDeviceId(selectedDevice.id); setView("register") }}
      />
    )
  }

  return (
    <DeviceListView
      onRegister={() => { setEditDeviceId(null); setView("register") }}
      onView={(d) => { setSelectedDevice(d); setView("detail") }}
      onEdit={(id) => { setEditDeviceId(id); setView("register") }}
    />
  )
}
