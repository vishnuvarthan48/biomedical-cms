"use client"

import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Plus, Search, Eye, MoreVertical, Download, X, Save, Send, ArrowLeft,
  Upload, Trash2, Pencil, CheckCircle2, Clock, XCircle, Package, Info,
  ArrowRightLeft, FileText, Inbox, AlertTriangle, Truck, RotateCcw,
  Building2, MapPin, UserCheck, Ban, MessageSquare, ClipboardCheck,
  ChevronDown, Printer, Filter
} from "lucide-react"
import { equipmentList } from "@/lib/mock-data"

// =====================
// Types
// =====================
type TransferStatus = "Draft" | "Submitted" | "Approved" | "Dispatched" | "Received" | "Accepted" | "Rejected" | "Cancelled" | "Returned"

interface TransferHeader {
  id: string
  transferNo: string
  sourceOrg: string
  destOrg: string
  sourceLocation: string
  destLocation: string
  requestedBy: string
  requestedDate: string
  reason: string
  status: TransferStatus
  lineCount: number
  submittedAt: string
  dispatchedAt: string
  receivedAt: string
  acceptedAt: string
  createdAt: string
}

interface TransferLine {
  id: string
  assetTag: string
  assetName: string
  serialNo: string
  model: string
  category: string
  handoverCondition: "Good" | "Fair" | "Damaged"
  receiverCondition: "Good" | "Fair" | "Damaged" | ""
  accessories: string
  discrepancyNotes: string
  lineStatus: "Pending" | "Accepted" | "Rejected"
}

// =====================
// Mock Data (10 transfers)
// =====================
const mockTransfers: TransferHeader[] = [
  {
    id: "ATR-001", transferNo: "ATR-2026-001", sourceOrg: "Apollo Hospital - Chennai",
    destOrg: "Apollo Hospital - Delhi", sourceLocation: "ICU - Block A",
    destLocation: "ICU - Building 2", requestedBy: "Dr. Arun Mehta",
    requestedDate: "2026-01-10", reason: "Surplus ventilators redeployed to Delhi ICU expansion",
    status: "Accepted", lineCount: 3, submittedAt: "2026-01-10", dispatchedAt: "2026-01-12",
    receivedAt: "2026-01-14", acceptedAt: "2026-01-15", createdAt: "2026-01-10"
  },
  {
    id: "ATR-002", transferNo: "ATR-2026-002", sourceOrg: "Apollo Hospital - Delhi",
    destOrg: "Apollo Hospital - Bangalore", sourceLocation: "OT Complex",
    destLocation: "Surgical Ward", requestedBy: "Ramesh Kumar",
    requestedDate: "2026-01-18", reason: "OT equipment rotation per quarterly plan",
    status: "Dispatched", lineCount: 2, submittedAt: "2026-01-18", dispatchedAt: "2026-01-20",
    receivedAt: "", acceptedAt: "", createdAt: "2026-01-18"
  },
  {
    id: "ATR-003", transferNo: "ATR-2026-003", sourceOrg: "Apollo Hospital - Chennai",
    destOrg: "Apollo Hospital - Hyderabad", sourceLocation: "Biomedical Dept",
    destLocation: "Radiology", requestedBy: "Priya Sharma",
    requestedDate: "2026-02-01", reason: "X-ray machine relocation for new radiology wing",
    status: "Submitted", lineCount: 1, submittedAt: "2026-02-01", dispatchedAt: "",
    receivedAt: "", acceptedAt: "", createdAt: "2026-02-01"
  },
  {
    id: "ATR-004", transferNo: "ATR-2026-004", sourceOrg: "Apollo Hospital - Bangalore",
    destOrg: "Apollo Hospital - Chennai", sourceLocation: "Emergency Ward",
    destLocation: "Emergency - Block B", requestedBy: "Dr. Vijay Rao",
    requestedDate: "2026-02-05", reason: "Emergency defibrillator reallocation",
    status: "Received", lineCount: 2, submittedAt: "2026-02-05", dispatchedAt: "2026-02-06",
    receivedAt: "2026-02-08", acceptedAt: "", createdAt: "2026-02-05"
  },
  {
    id: "ATR-005", transferNo: "ATR-2026-005", sourceOrg: "Apollo Hospital - Hyderabad",
    destOrg: "Apollo Hospital - Delhi", sourceLocation: "Pathology Lab",
    destLocation: "Central Lab", requestedBy: "Sneha Patel",
    requestedDate: "2026-02-10", reason: "Blood analyzer upgrade swap between labs",
    status: "Rejected", lineCount: 1, submittedAt: "2026-02-10", dispatchedAt: "",
    receivedAt: "", acceptedAt: "", createdAt: "2026-02-10"
  },
  {
    id: "ATR-006", transferNo: "ATR-2026-006", sourceOrg: "Apollo Hospital - Chennai",
    destOrg: "Apollo Hospital - Mumbai", sourceLocation: "NICU",
    destLocation: "NICU - Wing C", requestedBy: "Dr. Meera Nair",
    requestedDate: "2026-02-12", reason: "Neonatal incubator surplus redistribution",
    status: "Draft", lineCount: 4, submittedAt: "", dispatchedAt: "",
    receivedAt: "", acceptedAt: "", createdAt: "2026-02-12"
  },
  {
    id: "ATR-007", transferNo: "ATR-2026-007", sourceOrg: "Apollo Hospital - Delhi",
    destOrg: "Apollo Hospital - Chennai", sourceLocation: "Dialysis Center",
    destLocation: "Nephrology - Floor 3", requestedBy: "Suresh Reddy",
    requestedDate: "2026-02-14", reason: "Dialysis machine fleet rotation",
    status: "Approved", lineCount: 3, submittedAt: "2026-02-14", dispatchedAt: "",
    receivedAt: "", acceptedAt: "", createdAt: "2026-02-14"
  },
  {
    id: "ATR-008", transferNo: "ATR-2026-008", sourceOrg: "Apollo Hospital - Mumbai",
    destOrg: "Apollo Hospital - Hyderabad", sourceLocation: "Cardiac Cath Lab",
    destLocation: "Cardiac Ward", requestedBy: "Dr. Karthik Menon",
    requestedDate: "2026-01-25", reason: "Cardiac monitor redeployment",
    status: "Cancelled", lineCount: 1, submittedAt: "2026-01-25", dispatchedAt: "",
    receivedAt: "", acceptedAt: "", createdAt: "2026-01-25"
  },
  {
    id: "ATR-009", transferNo: "ATR-2026-009", sourceOrg: "Apollo Hospital - Bangalore",
    destOrg: "Apollo Hospital - Mumbai", sourceLocation: "Physiotherapy",
    destLocation: "Rehab Center", requestedBy: "Anita Desai",
    requestedDate: "2026-02-08", reason: "Physiotherapy equipment consolidation",
    status: "Dispatched", lineCount: 5, submittedAt: "2026-02-08", dispatchedAt: "2026-02-10",
    receivedAt: "", acceptedAt: "", createdAt: "2026-02-08"
  },
  {
    id: "ATR-010", transferNo: "ATR-2026-010", sourceOrg: "Apollo Hospital - Hyderabad",
    destOrg: "Apollo Hospital - Bangalore", sourceLocation: "Pulmonology",
    destLocation: "Respiratory - ICU B", requestedBy: "Dr. Leela Rao",
    requestedDate: "2026-02-15", reason: "BiPAP machines for new respiratory ICU",
    status: "Submitted", lineCount: 2, submittedAt: "2026-02-15", dispatchedAt: "",
    receivedAt: "", acceptedAt: "", createdAt: "2026-02-15"
  },
]

// Asset lookup from registered assets
const assetLookup = equipmentList.filter(e => e.status !== "Condemned").map(e => ({
  tag: e.id, name: e.name, serial: e.serial, model: e.manufacturer, category: e.category
}))

const orgList = [
  "Apollo Hospital - Chennai",
  "Apollo Hospital - Delhi",
  "Apollo Hospital - Bangalore",
  "Apollo Hospital - Hyderabad",
  "Apollo Hospital - Mumbai",
]

const locationsByOrg: Record<string, string[]> = {
  "Apollo Hospital - Chennai": ["ICU - Block A", "Biomedical Dept", "NICU", "Emergency - Block B", "Nephrology - Floor 3", "Radiology - Block C"],
  "Apollo Hospital - Delhi": ["ICU - Building 2", "Central Lab", "Dialysis Center", "OT Complex - Floor 2"],
  "Apollo Hospital - Bangalore": ["Surgical Ward", "Emergency Ward", "Physiotherapy", "Respiratory - ICU B"],
  "Apollo Hospital - Hyderabad": ["Radiology", "Pathology Lab", "Cardiac Ward", "Pulmonology"],
  "Apollo Hospital - Mumbai": ["NICU - Wing C", "Cardiac Cath Lab", "Rehab Center", "General Ward - Floor 4"],
}

// =====================
// Helpers
// =====================
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-bold text-foreground">
        {label} {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  )
}

function SelectField({ value, onChange, options, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={cn(
          "w-full h-11 px-3 pr-8 rounded-md border border-input bg-background text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring",
          disabled && "opacity-50 cursor-not-allowed"
        )}>
        <option value="">{placeholder || "Select..."}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}

const statusColors: Record<string, string> = {
  "Draft": "bg-muted text-muted-foreground",
  "Submitted": "bg-[#DBEAFE] text-[#2563EB]",
  "Approved": "bg-[#E0E7FF] text-[#4338CA]",
  "Dispatched": "bg-[#FEF3C7] text-[#D97706]",
  "Received": "bg-[#D1FAE5] text-[#059669]",
  "Accepted": "bg-[#D1FAE5] text-[#047857]",
  "Rejected": "bg-[#FEE2E2] text-[#DC2626]",
  "Cancelled": "bg-[#F3F4F6] text-[#6B7280]",
  "Returned": "bg-[#FEF3C7] text-[#F97316]",
}

const conditionColors: Record<string, string> = {
  "Good": "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
  "Fair": "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  "Damaged": "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
}

const lineStatusColors: Record<string, string> = {
  "Pending": "bg-[#FEF3C7] text-[#D97706]",
  "Accepted": "bg-[#D1FAE5] text-[#059669]",
  "Rejected": "bg-[#FEE2E2] text-[#DC2626]",
}

const statusTabs = ["All", "Draft", "Submitted", "Approved", "Dispatched", "Received", "Accepted", "Rejected", "Cancelled"] as const

// =====================
// List View
// =====================
function TransferListView({ transfers, onAdd, onView }: {
  transfers: TransferHeader[]; onAdd: () => void; onView: (t: TransferHeader) => void
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState("All")
  const [viewMode, setViewMode] = useState<"outgoing" | "incoming">("outgoing")

  const myOrg = "Apollo Hospital - Chennai"

  const filtered = useMemo(() => {
    return transfers.filter(t => {
      const matchView = viewMode === "outgoing" ? t.sourceOrg === myOrg : t.destOrg === myOrg
      if (!matchView) return false
      if (activeStatus !== "All" && t.status !== activeStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return t.transferNo.toLowerCase().includes(q) || t.sourceOrg.toLowerCase().includes(q) ||
          t.destOrg.toLowerCase().includes(q) || t.requestedBy.toLowerCase().includes(q)
      }
      return true
    })
  }, [transfers, viewMode, activeStatus, searchQuery])

  const incomingPending = transfers.filter(t => t.destOrg === myOrg && ["Submitted", "Dispatched", "Received"].includes(t.status)).length
  const outgoingDrafts = transfers.filter(t => t.sourceOrg === myOrg && t.status === "Draft").length

  const statusCounts = useMemo(() => {
    const base = transfers.filter(t => viewMode === "outgoing" ? t.sourceOrg === myOrg : t.destOrg === myOrg)
    const counts: Record<string, number> = { All: base.length }
    base.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
    return counts
  }, [transfers, viewMode])

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Asset Transfer</h1>
          <p className="text-base text-muted-foreground mt-1">Transfer assets between organizations with full audit trail</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 text-sm font-semibold"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button className="text-white border-0 h-11 text-sm font-semibold px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={onAdd}>
            <Plus className="w-5 h-5 mr-2" /> New Transfer
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border border-[#00BCD4]/20 bg-[#00BCD4]/5 px-5 py-3 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
        <div className="text-sm text-foreground leading-relaxed">
          <span className="font-bold">Asset Transfer Request (ATR).</span> Move registered assets from source org/location to destination.
          Asset ownership updates <span className="font-bold text-[#10B981]">only after destination accepts</span>.
          Status: Draft &rarr; Submitted &rarr; Approved &rarr; Dispatched &rarr; Received &rarr; Accepted.
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/50 border border-border w-fit">
        {(["outgoing", "incoming"] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
              viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            {mode === "outgoing" ? <Send className="w-4 h-4" /> : <Inbox className="w-4 h-4" />}
            {mode === "outgoing" ? "Outgoing" : "Incoming"}
            {mode === "incoming" && incomingPending > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#3B82F6] text-white text-xs font-bold flex items-center justify-center">{incomingPending}</span>
            )}
            {mode === "outgoing" && outgoingDrafts > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#D97706] text-white text-xs font-bold flex items-center justify-center">{outgoingDrafts}</span>
            )}
          </button>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2.5">
        {statusTabs.map(tab => (
          <button key={tab} onClick={() => setActiveStatus(tab)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all",
              activeStatus === tab
                ? "bg-[#00BCD4] text-white shadow-md"
                : "bg-card text-foreground border border-border hover:border-[#00BCD4] hover:text-[#00BCD4]"
            )}>
            {tab}
            {statusCounts[tab] !== undefined && (
              <span className="ml-1.5 text-xs opacity-75">({statusCounts[tab] || 0})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="Search by transfer no, organization, requester..." className="pl-11 h-11 bg-card border-border text-base"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total ATRs", value: transfers.length, icon: ArrowRightLeft, color: "#00BCD4" },
          { label: "In Transit", value: transfers.filter(t => t.status === "Dispatched").length, icon: Truck, color: "#F59E0B" },
          { label: "Pending Accept", value: transfers.filter(t => t.status === "Received").length, icon: Clock, color: "#3B82F6" },
          { label: "Completed", value: transfers.filter(t => t.status === "Accepted").length, icon: CheckCircle2, color: "#10B981" },
          { label: "Rejected", value: transfers.filter(t => t.status === "Rejected").length, icon: XCircle, color: "#EF4444" },
        ].map(stat => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Transfer No</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Date</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Source Org</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Dest Org</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Source Loc</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Dest Loc</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Requested By</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Assets</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
                  <th className="text-right py-4 px-5 font-bold text-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-10 h-10 text-muted-foreground/40" />
                        <p className="text-base font-semibold text-foreground">No transfers found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        <Button variant="outline" size="sm" className="mt-2 text-sm font-semibold" onClick={() => { setSearchQuery(""); setActiveStatus("All") }}>
                          Clear all filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(t => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => onView(t)}>
                    <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">{t.transferNo}</td>
                    <td className="py-4 px-5 text-sm text-muted-foreground">{t.requestedDate}</td>
                    <td className="py-4 px-5 text-foreground font-semibold text-sm max-w-[180px] truncate">{t.sourceOrg}</td>
                    <td className="py-4 px-5 text-foreground font-semibold text-sm max-w-[180px] truncate">{t.destOrg}</td>
                    <td className="py-4 px-5 text-sm text-muted-foreground max-w-[140px] truncate">{t.sourceLocation}</td>
                    <td className="py-4 px-5 text-sm text-muted-foreground max-w-[140px] truncate">{t.destLocation}</td>
                    <td className="py-4 px-5 text-foreground text-sm">{t.requestedBy}</td>
                    <td className="py-4 px-5">
                      <Badge variant="outline" className="text-xs font-semibold">{t.lineCount}</Badge>
                    </td>
                    <td className="py-4 px-5">
                      <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-semibold", statusColors[t.status])}>{t.status}</span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                          title="View" onClick={e => { e.stopPropagation(); onView(t) }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={e => e.stopPropagation()}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onView(t)}>
                              <Eye className="w-4 h-4" /> View Details
                            </DropdownMenuItem>
                            {t.status === "Draft" && (
                              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onView(t)}>
                                <Pencil className="w-4 h-4" /> Edit Draft
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Printer className="w-4 h-4" /> Print Transfer Note
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Download className="w-4 h-4" /> Export PDF
                            </DropdownMenuItem>
                            {t.status === "Draft" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 cursor-pointer text-[#DC2626] focus:text-[#DC2626]">
                                  <Trash2 className="w-4 h-4" /> Cancel Transfer
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =====================
// Create / Edit / Detail Form
// =====================
function TransferForm({ editTransfer, onBack }: { editTransfer: TransferHeader | null; onBack: () => void }) {
  const isEdit = !!editTransfer
  const isViewOnly = isEdit && !["Draft"].includes(editTransfer.status)
  const myOrg = "Apollo Hospital - Chennai"

  const [sourceOrg] = useState(editTransfer?.sourceOrg || myOrg)
  const [destOrg, setDestOrg] = useState(editTransfer?.destOrg || "")
  const [sourceLocation, setSourceLocation] = useState(editTransfer?.sourceLocation || "")
  const [destLocation, setDestLocation] = useState(editTransfer?.destLocation || "")
  const [requestedDate, setRequestedDate] = useState(editTransfer?.requestedDate || new Date().toISOString().split("T")[0])
  const [reason, setReason] = useState(editTransfer?.reason || "")
  const [expectedDate, setExpectedDate] = useState("")

  // Lines
  const [lines, setLines] = useState<TransferLine[]>([])
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [assetSearch, setAssetSearch] = useState("")

  // Receive/Accept state
  const isIncoming = isEdit && editTransfer.destOrg === myOrg
  const canReceive = isIncoming && editTransfer.status === "Dispatched"
  const canAcceptReject = isIncoming && ["Received", "Submitted"].includes(editTransfer.status)
  const [selectedForAccept, setSelectedForAccept] = useState<Set<string>>(new Set())
  const [rejectReason, setRejectReason] = useState("")

  const toggleSelect = (id: string) => {
    setSelectedForAccept(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next })
  }
  const selectAll = () => {
    if (selectedForAccept.size === lines.length) setSelectedForAccept(new Set())
    else setSelectedForAccept(new Set(lines.map(l => l.id)))
  }

  const addAsset = (tag: string) => {
    const found = assetLookup.find(a => a.tag === tag)
    if (!found || lines.some(l => l.assetTag === tag)) return
    setLines(prev => [...prev, {
      id: `TL-${Date.now()}`, assetTag: found.tag, assetName: found.name, serialNo: found.serial,
      model: found.model, category: found.category, handoverCondition: "Good", receiverCondition: "",
      accessories: "", discrepancyNotes: "", lineStatus: "Pending",
    }])
    setShowAssetPicker(false)
    setAssetSearch("")
  }

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id))

  const filteredAssets = useMemo(() => {
    if (!assetSearch.trim()) return assetLookup
    const q = assetSearch.toLowerCase()
    return assetLookup.filter(a => a.name.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q) || a.serial.toLowerCase().includes(q))
  }, [assetSearch])

  // Timeline
  const timeline = [
    { label: "Created", date: editTransfer?.createdAt, icon: FileText },
    { label: "Submitted", date: editTransfer?.submittedAt, icon: Send },
    { label: "Dispatched", date: editTransfer?.dispatchedAt, icon: Truck },
    { label: "Received", date: editTransfer?.receivedAt, icon: Package },
    { label: "Accepted", date: editTransfer?.acceptedAt, icon: CheckCircle2 },
  ]

  const sourceLocOptions = (locationsByOrg[sourceOrg] || []).map(l => ({ value: l, label: l }))
  const destLocOptions = (locationsByOrg[destOrg] || []).map(l => ({ value: l, label: l }))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground text-sm font-semibold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              {isEdit ? editTransfer.transferNo : "Create Asset Transfer"}
            </h1>
            {isEdit && (
              <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-semibold", statusColors[editTransfer.status])}>{editTransfer.status}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? `Requested by ${editTransfer.requestedBy} on ${editTransfer.requestedDate}` : "Transfer registered assets between organizations"}
          </p>
        </div>
      </div>

      {/* In-transit warning */}
      {isEdit && ["Submitted", "Dispatched"].includes(editTransfer.status) && (
        <div className="rounded-xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-5 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
          <div className="text-sm text-foreground leading-relaxed">
            <span className="font-bold">Assets in transit.</span> Ownership remains with <span className="font-bold text-[#00BCD4]">{editTransfer.sourceOrg}</span> until
            destination accepts. Physical custody is with logistics/carrier.
          </div>
        </div>
      )}

      {/* Status Flow */}
      {isEdit && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              {["Draft", "Submitted", "Dispatched", "Received", "Accepted"].map((step, idx) => {
                const stepOrder = ["Draft", "Submitted", "Dispatched", "Received", "Accepted"]
                const currentIdx = stepOrder.indexOf(editTransfer.status)
                const isRejected = editTransfer.status === "Rejected" || editTransfer.status === "Cancelled"
                const isComplete = !isRejected && currentIdx >= idx
                const isCurrent = !isRejected && currentIdx === idx
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                        isComplete ? "bg-[#00BCD4] border-[#00BCD4] text-white" :
                        isCurrent ? "border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/10" :
                        "border-border text-muted-foreground bg-muted/30"
                      )}>
                        {isComplete && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={cn("text-xs font-semibold mt-2", isComplete ? "text-foreground" : "text-muted-foreground")}>{step}</span>
                    </div>
                    {idx < 4 && (
                      <div className={cn("h-0.5 flex-1 mx-1", isComplete && idx < currentIdx ? "bg-[#00BCD4]" : "bg-border")} />
                    )}
                  </div>
                )
              })}
            </div>
            {(editTransfer.status === "Rejected" || editTransfer.status === "Cancelled") && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <XCircle className="w-5 h-5 text-destructive shrink-0" />
                <span className="text-sm font-semibold text-destructive">Transfer {editTransfer.status.toLowerCase()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {(!isEdit || editTransfer.status === "Draft") && (
          <>
            <Button className="text-white border-0 text-sm font-semibold h-11 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
              onClick={onBack}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button className="text-white border-0 text-sm font-semibold h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8]"
              onClick={onBack}>
              <Send className="w-4 h-4 mr-2" /> Submit to Destination
            </Button>
          </>
        )}
        {isEdit && editTransfer.status === "Submitted" && !isIncoming && (
          <Button className="text-white border-0 text-sm font-semibold h-11 px-5" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
            onClick={onBack}>
            <Truck className="w-4 h-4 mr-2" /> Mark Dispatched
          </Button>
        )}
        {isEdit && editTransfer.status === "Approved" && !isIncoming && (
          <Button className="text-white border-0 text-sm font-semibold h-11 px-5" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)" }}
            onClick={onBack}>
            <Truck className="w-4 h-4 mr-2" /> Dispatch
          </Button>
        )}
        {canReceive && (
          <Button className="text-white border-0 text-sm font-semibold h-11 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onBack}>
            <Package className="w-4 h-4 mr-2" /> Mark Received
          </Button>
        )}
        {canAcceptReject && (
          <>
            <Button className="text-white border-0 text-sm font-semibold h-11 px-5" style={{ background: "linear-gradient(135deg, #10B981, #047857)" }}
              onClick={onBack}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Transfer
            </Button>
            <Button variant="outline" className="text-sm font-semibold h-11 px-5 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={onBack}>
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
          </>
        )}
        {isEdit && editTransfer.status === "Draft" && (
          <Button variant="outline" className="text-sm font-semibold h-11 px-5 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={onBack}>
            Cancel Transfer
          </Button>
        )}
      </div>

      {/* Transfer Details */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">Transfer Details</h3>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormField label="Transfer No" required>
                <Input className="h-11 bg-muted/30 font-mono font-semibold" readOnly
                  value={isEdit ? editTransfer.transferNo : "ATR-2026-011 (Auto)"} />
              </FormField>
              <FormField label="Source Organization" required>
                <Input className="h-11 bg-muted/30 font-semibold" value={sourceOrg} readOnly />
              </FormField>
              <FormField label="Destination Organization" required>
                <SelectField value={destOrg} onChange={v => { setDestOrg(v); setDestLocation("") }}
                  options={orgList.filter(o => o !== sourceOrg).map(o => ({ value: o, label: o }))}
                  placeholder="Select destination org..." disabled={isViewOnly} />
              </FormField>
              <FormField label="Source Location" required>
                <SelectField value={sourceLocation} onChange={setSourceLocation}
                  options={sourceLocOptions} placeholder="Select source location..." disabled={isViewOnly} />
              </FormField>
              <FormField label="Destination Location" required>
                <SelectField value={destLocation} onChange={setDestLocation}
                  options={destLocOptions} placeholder="Select destination location..."
                  disabled={isViewOnly || !destOrg} />
              </FormField>
              <FormField label="Expected Transfer Date" required>
                <Input type="date" className="h-11" value={isEdit ? editTransfer.requestedDate : expectedDate}
                  onChange={e => setExpectedDate(e.target.value)} disabled={isViewOnly} />
              </FormField>
              <FormField label="Requested By">
                <Input className="h-11 bg-muted/30 font-semibold" value={isEdit ? editTransfer.requestedBy : "Arjun Kumar (Auto)"} readOnly />
              </FormField>
              <FormField label="Request Date">
                <Input className="h-11 bg-muted/30 font-semibold" value={requestedDate} readOnly />
              </FormField>
            </div>
            <div className="mt-5">
              <FormField label="Reason / Remarks">
                <Textarea className="min-h-[80px]" placeholder="Why are these assets being transferred?" value={reason}
                  onChange={e => setReason(e.target.value)} disabled={isViewOnly} />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source / Destination Info (for detail view) */}
      {isEdit && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00BCD4]" /> Source
            </h3>
            <Card className="border border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Organization</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{editTransfer.sourceOrg}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{editTransfer.sourceLocation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#10B981]" /> Destination
            </h3>
            <Card className="border border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Organization</span>
                    <p className="text-sm font-bold text-foreground mt-0.5">{editTransfer.destOrg}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{editTransfer.destLocation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Timeline */}
      {isEdit && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Timeline</h3>
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {timeline.map(ev => (
                  <div key={ev.label} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    ev.date ? "border-[#00BCD4]/20 bg-[#00BCD4]/5" : "border-border bg-muted/20"
                  )}>
                    <ev.icon className={cn("w-5 h-5 shrink-0", ev.date ? "text-[#00BCD4]" : "text-muted-foreground/40")} />
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">{ev.label}</p>
                      <p className={cn("text-sm font-semibold", ev.date ? "text-foreground" : "text-muted-foreground")}>{ev.date || "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject reason */}
      {canAcceptReject && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-destructive" /> Rejection Reason (if rejecting)
          </h3>
          <Card className="border border-destructive/20 shadow-sm">
            <CardContent className="p-5">
              <Textarea className="min-h-[80px] border-destructive/20 focus:border-destructive" placeholder="Enter reason for rejection..."
                value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Asset Lines */}
      <div>
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-extrabold text-foreground">Transfer Assets</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{lines.length} asset(s) in this transfer</p>
          </div>
          <div className="flex items-center gap-3">
            {canAcceptReject && lines.length > 0 && (
              <Button variant="outline" size="sm" className="text-sm font-semibold" onClick={selectAll}>
                {selectedForAccept.size === lines.length ? "Deselect All" : "Select All"}
              </Button>
            )}
            {!isViewOnly && (
              <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => setShowAssetPicker(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Asset
              </Button>
            )}
          </div>
        </div>

        {/* Asset Picker */}
        {showAssetPicker && (
          <Card className="border border-[#00BCD4]/30 shadow-sm mb-5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-foreground">Search & Add Registered Assets</h4>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setShowAssetPicker(false); setAssetSearch("") }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by asset tag, name, serial..." className="pl-10 h-10" value={assetSearch} onChange={e => setAssetSearch(e.target.value)} autoFocus />
              </div>
              <div className="max-h-[240px] overflow-y-auto border border-border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-bold text-foreground text-xs">Asset Tag</th>
                      <th className="text-left py-3 px-4 font-bold text-foreground text-xs">Equipment Name</th>
                      <th className="text-left py-3 px-4 font-bold text-foreground text-xs">Serial No</th>
                      <th className="text-left py-3 px-4 font-bold text-foreground text-xs">Category</th>
                      <th className="text-right py-3 px-4 font-bold text-foreground text-xs">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.map(a => {
                      const alreadyAdded = lines.some(l => l.assetTag === a.tag)
                      return (
                        <tr key={a.tag} className={cn("border-b border-border/50 transition-colors", alreadyAdded ? "opacity-40" : "hover:bg-muted/20 cursor-pointer")}>
                          <td className="py-2.5 px-4 font-mono font-bold text-[#00BCD4] text-xs">{a.tag}</td>
                          <td className="py-2.5 px-4 text-foreground text-xs font-semibold truncate max-w-[220px]">{a.name}</td>
                          <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">{a.serial}</td>
                          <td className="py-2.5 px-4 text-xs text-foreground">{a.category}</td>
                          <td className="py-2.5 px-4 text-right">
                            <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-semibold text-[#00BCD4]"
                              disabled={alreadyAdded} onClick={() => addAsset(a.tag)}>
                              {alreadyAdded ? "Added" : "+ Add"}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lines Table */}
        {lines.length === 0 ? (
          <Card className="border border-dashed border-border">
            <CardContent className="p-12 text-center">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-base font-semibold text-foreground">No assets added</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Asset" to search and add registered assets for transfer</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border bg-muted/30">
                      {canAcceptReject && <th className="py-4 px-4 w-12" />}
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Asset Tag</th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Equipment Name</th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Serial No</th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Category</th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Handover Cond.</th>
                      {(canReceive || canAcceptReject || (isEdit && ["Received", "Accepted", "Rejected"].includes(editTransfer.status))) && (
                        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Receiver Cond.</th>
                      )}
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Accessories</th>
                      {canAcceptReject && <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Discrepancy</th>}
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Line Status</th>
                      {!isViewOnly && <th className="text-right py-4 px-5 font-bold text-foreground text-sm">Remove</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map(ln => (
                      <tr key={ln.id} className={cn(
                        "border-b border-border/50 hover:bg-muted/20 transition-colors",
                        canAcceptReject && selectedForAccept.has(ln.id) && "bg-[#10B981]/5"
                      )}>
                        {canAcceptReject && (
                          <td className="py-4 px-4">
                            <Checkbox checked={selectedForAccept.has(ln.id)} onCheckedChange={() => toggleSelect(ln.id)} />
                          </td>
                        )}
                        <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">{ln.assetTag}</td>
                        <td className="py-4 px-5 text-foreground font-semibold text-sm max-w-[220px] truncate">{ln.assetName}</td>
                        <td className="py-4 px-5 font-mono text-sm text-muted-foreground">{ln.serialNo}</td>
                        <td className="py-4 px-5 text-sm text-foreground">{ln.category}</td>
                        <td className="py-4 px-5">
                          {!isViewOnly ? (
                            <SelectField value={ln.handoverCondition}
                              onChange={v => setLines(prev => prev.map(l => l.id === ln.id ? { ...l, handoverCondition: v as "Good" | "Fair" | "Damaged" } : l))}
                              options={[{ value: "Good", label: "Good" }, { value: "Fair", label: "Fair" }, { value: "Damaged", label: "Damaged" }]} />
                          ) : (
                            <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-semibold border", conditionColors[ln.handoverCondition])}>{ln.handoverCondition}</span>
                          )}
                        </td>
                        {(canReceive || canAcceptReject || (isEdit && ["Received", "Accepted", "Rejected"].includes(editTransfer.status))) && (
                          <td className="py-4 px-5">
                            {canReceive ? (
                              <SelectField value={ln.receiverCondition || "Good"}
                                onChange={v => setLines(prev => prev.map(l => l.id === ln.id ? { ...l, receiverCondition: v as "Good" | "Fair" | "Damaged" } : l))}
                                options={[{ value: "Good", label: "Good" }, { value: "Fair", label: "Fair" }, { value: "Damaged", label: "Damaged" }]} />
                            ) : ln.receiverCondition ? (
                              <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-semibold border", conditionColors[ln.receiverCondition])}>{ln.receiverCondition}</span>
                            ) : <span className="text-sm text-muted-foreground">-</span>}
                          </td>
                        )}
                        <td className="py-4 px-5">
                          {!isViewOnly ? (
                            <Input className="h-10 text-sm" placeholder="Accessories..."
                              value={ln.accessories} onChange={e => setLines(prev => prev.map(l => l.id === ln.id ? { ...l, accessories: e.target.value } : l))} />
                          ) : (
                            <span className="text-sm text-muted-foreground">{ln.accessories || "-"}</span>
                          )}
                        </td>
                        {canAcceptReject && (
                          <td className="py-4 px-5">
                            <Input className="h-10 text-sm" placeholder="Discrepancy notes..."
                              value={ln.discrepancyNotes} onChange={e => setLines(prev => prev.map(l => l.id === ln.id ? { ...l, discrepancyNotes: e.target.value } : l))} />
                          </td>
                        )}
                        <td className="py-4 px-5">
                          <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-semibold", lineStatusColors[ln.lineStatus])}>{ln.lineStatus}</span>
                        </td>
                        {!isViewOnly && (
                          <td className="py-4 px-5 text-right">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeLine(ln.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Attachments */}
      {(!isEdit || editTransfer.status === "Draft") && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">Attachments</h3>
          <Card className="border border-dashed border-border hover:border-[#00BCD4]/30 transition-colors cursor-pointer">
            <CardContent className="p-10 text-center">
              <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Handover note, photos, approval documents (Max 10MB each)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completed banner */}
      {isEdit && editTransfer.status === "Accepted" && (
        <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 px-5 py-3 flex items-start gap-3">
          <ClipboardCheck className="w-5 h-5 text-[#10B981] mt-0.5 shrink-0" />
          <div className="text-sm text-foreground leading-relaxed">
            <span className="font-bold">Transfer Completed.</span> Asset ownership has been updated:
            Organization changed to <span className="font-bold text-[#00BCD4]">{editTransfer.destOrg}</span>,
            Location changed to <span className="font-bold text-[#00BCD4]">{editTransfer.destLocation}</span>.
            Depreciation continues unchanged per tenant policy. Immutable audit log entry recorded.
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {lines.length} asset(s) in transfer
          {canAcceptReject && selectedForAccept.size > 0 && (
            <span className="ml-2 font-bold text-[#10B981]">{selectedForAccept.size} selected for accept</span>
          )}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm font-semibold h-11 px-5" onClick={onBack}>
            {isViewOnly ? "Back to List" : "Cancel"}
          </Button>
          {(!isEdit || editTransfer.status === "Draft") && (
            <>
              <Button className="text-white border-0 text-sm font-semibold h-11 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                onClick={onBack}>
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              <Button className="text-white border-0 text-sm font-semibold h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8]"
                onClick={onBack}>
                <Send className="w-4 h-4 mr-2" /> Submit to Destination
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// =====================
// Main Export
// =====================
export function AssetTransferPage() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editTransfer, setEditTransfer] = useState<TransferHeader | null>(null)
  const [transfers] = useState<TransferHeader[]>(mockTransfers)

  return view === "list" ? (
    <TransferListView
      transfers={transfers}
      onAdd={() => { setEditTransfer(null); setView("form") }}
      onView={(t) => { setEditTransfer(t); setView("form") }}
    />
  ) : (
    <TransferForm editTransfer={editTransfer} onBack={() => { setEditTransfer(null); setView("list") }} />
  )
}
