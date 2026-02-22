"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
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
  Plus,
  Search,
  Pencil,
  MapPin,
  X,
  Save,
  Building2,
  Upload,
  Trash2,
  ImageIcon,
  Layers,
  DoorOpen,
  BedDouble,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  mockUsers,
  mockOrganizations,
} from "@/src/lib/rbac-data";

/* ------------------------------------------------------------------ */
/*  Simulated logged-in user (replace with real auth context)          */
/* ------------------------------------------------------------------ */
const CURRENT_USER_ID = "U-001"; // Arjun Kumar -- memberships: ORG-001, ORG-002

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Department {
  id: string;
  name: string;
  floor: string;
  roomNo: string;
  bedNo: string;
  isActive: boolean;
}

interface LocationRow {
  id: string;
  orgId: string;
  orgName: string;
  building: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  email: string;
  costType: string;
  logoUrl: string;
  isActive: boolean;
  endUserNotes: string;
  departments: Department[];
}

/* ------------------------------------------------------------------ */
/*  Org dropdown: filtered by current user's active org memberships    */
/* ------------------------------------------------------------------ */
const currentUser = mockUsers.find((u) => u.id === CURRENT_USER_ID)!;
const userActiveOrgIds = currentUser.orgMemberships
  .filter((m) => m.status === "Active")
  .map((m) => m.orgId);
const organizationOptions = mockOrganizations
  .filter((o) => userActiveOrgIds.includes(o.id) && o.status === "Active")
  .map((o) => ({ id: o.id, name: o.name, code: o.code }));

/* ------------------------------------------------------------------ */
/*  Mock Data  (Tenant = Apollo Group, already created)                */
/* ------------------------------------------------------------------ */
const initialLocations: LocationRow[] = [
  {
    id: "LOC-001",
    orgId: "ORG-001",
    orgName: "Apollo Chennai - Main Campus",
    building: "Main Tower",
    address: "21, Greams Lane, Off Greams Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600006",
    email: "mainblock@apollochennai.com",
    costType: "Cost Center",
    logoUrl: "",
    isActive: true,
    endUserNotes: "Primary campus, 8-floor main tower.",
    departments: [
      { id: "D-001", name: "Emergency", floor: "Ground Floor", roomNo: "ER-001", bedNo: "8", isActive: true },
      { id: "D-002", name: "OPD", floor: "Ground Floor", roomNo: "OPD-002", bedNo: "", isActive: true },
      { id: "D-003", name: "Ward A", floor: "1st Floor", roomNo: "WA-101", bedNo: "20", isActive: true },
      { id: "D-004", name: "Ward B", floor: "1st Floor", roomNo: "WB-102", bedNo: "20", isActive: true },
      { id: "D-005", name: "Ward C", floor: "2nd Floor", roomNo: "WC-201", bedNo: "18", isActive: true },
      { id: "D-006", name: "Ward D", floor: "2nd Floor", roomNo: "WD-202", bedNo: "18", isActive: true },
      { id: "D-007", name: "MICU", floor: "3rd Floor", roomNo: "MICU-301", bedNo: "12", isActive: true },
      { id: "D-008", name: "NICU", floor: "3rd Floor", roomNo: "NICU-302", bedNo: "8", isActive: true },
      { id: "D-009", name: "CICU", floor: "3rd Floor", roomNo: "CICU-303", bedNo: "6", isActive: true },
      { id: "D-010", name: "CCU", floor: "4th Floor", roomNo: "CCU-401", bedNo: "6", isActive: true },
      { id: "D-011", name: "General Surgery OT", floor: "5th Floor", roomNo: "OT-501", bedNo: "", isActive: true },
      { id: "D-012", name: "Cardiac Surgery OT", floor: "5th Floor", roomNo: "OT-502", bedNo: "", isActive: true },
      { id: "D-013", name: "Neuro Surgery OT", floor: "5th Floor", roomNo: "OT-503", bedNo: "", isActive: true },
      { id: "D-014", name: "Uro Surgery OT", floor: "5th Floor", roomNo: "OT-504", bedNo: "", isActive: true },
      { id: "D-015", name: "Ortho Surgery OT", floor: "6th Floor", roomNo: "OT-601", bedNo: "", isActive: true },
      { id: "D-016", name: "Gyne Surgery OT", floor: "6th Floor", roomNo: "OT-602", bedNo: "", isActive: true },
      { id: "D-017", name: "CSSD", floor: "Basement", roomNo: "CSSD-B01", bedNo: "", isActive: true },
      { id: "D-018", name: "Radiology", floor: "Ground Floor", roomNo: "RAD-003", bedNo: "", isActive: true },
      { id: "D-019", name: "Laboratory", floor: "1st Floor", roomNo: "LAB-103", bedNo: "", isActive: true },
    ],
  },
  {
    id: "LOC-002",
    orgId: "ORG-001",
    orgName: "Apollo Chennai - Main Campus",
    building: "Diagnostic Block",
    address: "21, Greams Lane, Off Greams Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600006",
    email: "diagnostics@apollochennai.com",
    costType: "Cost Center",
    logoUrl: "",
    isActive: true,
    endUserNotes: "Houses Radiology, Pathology, Blood Bank, and Dialysis.",
    departments: [
      { id: "D-020", name: "Radiology & Imaging", floor: "Ground Floor", roomNo: "RD-001", bedNo: "", isActive: true },
      { id: "D-021", name: "Pathology Lab", floor: "1st Floor", roomNo: "LAB-101", bedNo: "", isActive: true },
      { id: "D-022", name: "Blood Bank", floor: "2nd Floor", roomNo: "BB-201", bedNo: "", isActive: true },
      { id: "D-023", name: "Dialysis Unit", floor: "3rd Floor", roomNo: "DU-301", bedNo: "10", isActive: true },
      { id: "D-024", name: "Microbiology Lab", floor: "1st Floor", roomNo: "LAB-102", bedNo: "", isActive: true },
    ],
  },
  {
    id: "LOC-003",
    orgId: "ORG-002",
    orgName: "Apollo Chennai - OMR Branch",
    building: "Block A - Main Hospital",
    address: "Sarita Vihar, Delhi - Mathura Road",
    city: "New Delhi",
    state: "Delhi",
    pinCode: "110076",
    email: "blocka@apollodelhi.com",
    costType: "Profit Center",
    logoUrl: "",
    isActive: true,
    endUserNotes: "10-floor main hospital block with all clinical departments.",
    departments: [
      { id: "D-101", name: "Emergency", floor: "Ground Floor", roomNo: "ER-G01", bedNo: "6", isActive: true },
      { id: "D-102", name: "General OPD", floor: "Ground Floor", roomNo: "OPD-G02", bedNo: "", isActive: true },
      { id: "D-103", name: "Cardiology OPD", floor: "1st Floor", roomNo: "C-101", bedNo: "", isActive: true },
      { id: "D-104", name: "ICU", floor: "2nd Floor", roomNo: "ICU-201", bedNo: "10", isActive: true },
      { id: "D-105", name: "OT Complex", floor: "3rd Floor", roomNo: "OT-301", bedNo: "", isActive: true },
      { id: "D-106", name: "Radiology", floor: "1st Floor", roomNo: "RAD-101", bedNo: "", isActive: true },
      { id: "D-107", name: "Cardiology", floor: "4th Floor", roomNo: "C-401", bedNo: "16", isActive: true },
      { id: "D-108", name: "Neurology", floor: "5th Floor", roomNo: "N-501", bedNo: "12", isActive: true },
      { id: "D-109", name: "CSSD", floor: "Basement", roomNo: "CSSD-B01", bedNo: "", isActive: true },
      { id: "D-110", name: "Pharmacy", floor: "Ground Floor", roomNo: "PH-G03", bedNo: "", isActive: true },
    ],
  },
  {
    id: "LOC-004",
    orgId: "ORG-001",
    orgName: "Apollo Chennai - Main Campus",
    building: "Tower A",
    address: "154/11, Bannerghatta Road",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560076",
    email: "towera@apolloblr.com",
    costType: "Cost Center",
    logoUrl: "",
    isActive: true,
    endUserNotes: "ICU, OT, Radiology, Orthopaedics, Emergency.",
    departments: [
      { id: "D-201", name: "Emergency", floor: "Ground Floor", roomNo: "ER-G01", bedNo: "6", isActive: true },
      { id: "D-202", name: "ICU", floor: "2nd Floor", roomNo: "ICU-201", bedNo: "8", isActive: true },
      { id: "D-203", name: "OT", floor: "3rd Floor", roomNo: "OT-301", bedNo: "", isActive: true },
      { id: "D-204", name: "Radiology", floor: "Ground Floor", roomNo: "RD-G01", bedNo: "", isActive: true },
      { id: "D-205", name: "Orthopaedics", floor: "4th Floor", roomNo: "ORTH-401", bedNo: "14", isActive: true },
    ],
  },
  {
    id: "LOC-005",
    orgId: "ORG-002",
    orgName: "Apollo Chennai - OMR Branch",
    building: "Single Building",
    address: "Road No. 36, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    pinCode: "500033",
    email: "clinic@apollohyd.com",
    costType: "Cost Center",
    logoUrl: "",
    isActive: true,
    endUserNotes: "Clinic mode - single building, limited biomedical scope.",
    departments: [
      { id: "D-301", name: "General Consultation", floor: "Ground Floor", roomNo: "GC-G01", bedNo: "", isActive: true },
      { id: "D-302", name: "Pharmacy", floor: "Ground Floor", roomNo: "PH-G02", bedNo: "", isActive: true },
      { id: "D-303", name: "Minor OT", floor: "1st Floor", roomNo: "MOT-101", bedNo: "2", isActive: true },
      { id: "D-304", name: "Diagnostics", floor: "1st Floor", roomNo: "DX-102", bedNo: "", isActive: false },
    ],
  },
];

const costTypeOptions = ["Cost Center", "Profit Center", "Revenue Center"];

/* ------------------------------------------------------------------ */
/*  FormField helper                                                   */
/* ------------------------------------------------------------------ */
function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-bold text-foreground">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function LocationMasterPage() {
  const [locations, setLocations] = useState<LocationRow[]>(initialLocations);
  const [search, setSearch] = useState("");

  // Add / Edit location modal
  const [showLocModal, setShowLocModal] = useState(false);
  const [editLocId, setEditLocId] = useState<string | null>(null);
  const [lOrgId, setLOrgId] = useState("");
  const [lBuilding, setLBuilding] = useState("");
  const [lAddress, setLAddress] = useState("");
  const [lCity, setLCity] = useState("");
  const [lState, setLState] = useState("");
  const [lPinCode, setLPinCode] = useState("");
  const [lEmail, setLEmail] = useState("");
  const [lCostType, setLCostType] = useState("");
  const [lNotes, setLNotes] = useState("");
  const [lActive, setLActive] = useState(true);
  const [lError, setLError] = useState("");

  // Add / Edit department modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptLocId, setDeptLocId] = useState<string | null>(null);
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [dName, setDName] = useState("");
  const [dFloor, setDFloor] = useState("");
  const [dRoom, setDRoom] = useState("");
  const [dBed, setDBed] = useState("");
  const [dActive, setDActive] = useState(true);
  const [dError, setDError] = useState("");

  // Expanded rows (to toggle department visibility)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["LOC-001"]));

  /* --- Location CRUD --- */
  const resetLocModal = () => {
    setLOrgId(""); setLBuilding(""); setLAddress(""); setLCity("");
    setLState(""); setLPinCode(""); setLEmail(""); setLCostType("");
    setLNotes(""); setLActive(true); setLError(""); setEditLocId(null);
  };

  const openAddLocation = () => { resetLocModal(); setShowLocModal(true); };

  const openEditLocation = (loc: LocationRow) => {
    setEditLocId(loc.id);
    setLOrgId(loc.orgId); setLBuilding(loc.building); setLAddress(loc.address);
    setLCity(loc.city); setLState(loc.state); setLPinCode(loc.pinCode);
    setLEmail(loc.email); setLCostType(loc.costType); setLNotes(loc.endUserNotes);
    setLActive(loc.isActive); setLError("");
    setShowLocModal(true);
  };

  const saveLocation = () => {
    if (!lOrgId) { setLError("Hospital / Clinic / Organization is required."); return; }
    if (!lBuilding.trim()) { setLError("Building / Block name is required."); return; }

    const selectedOrg = organizationOptions.find((o) => o.id === lOrgId);
    const orgName = selectedOrg?.name || "";

    if (editLocId) {
      setLocations((prev) =>
        prev.map((l) =>
          l.id === editLocId
            ? { ...l, orgId: lOrgId, orgName, building: lBuilding.trim(), address: lAddress.trim(), city: lCity.trim(), state: lState.trim(), pinCode: lPinCode.trim(), email: lEmail.trim(), costType: lCostType, endUserNotes: lNotes.trim(), isActive: lActive }
            : l,
        ),
      );
    } else {
      const newLoc: LocationRow = {
        id: `LOC-${Date.now()}`,
        orgId: lOrgId,
        orgName,
        building: lBuilding.trim(),
        address: lAddress.trim(),
        city: lCity.trim(),
        state: lState.trim(),
        pinCode: lPinCode.trim(),
        email: lEmail.trim(),
        costType: lCostType,
        logoUrl: "",
        isActive: lActive,
        endUserNotes: lNotes.trim(),
        departments: [],
      };
      setLocations((prev) => [...prev, newLoc]);
    }
    setShowLocModal(false);
    resetLocModal();
  };

  /* --- Department CRUD --- */
  const resetDeptModal = () => {
    setDName(""); setDFloor(""); setDRoom(""); setDBed("");
    setDActive(true); setDError(""); setEditDeptId(null); setDeptLocId(null);
  };

  const openAddDept = (locId: string) => {
    resetDeptModal();
    setDeptLocId(locId);
    setShowDeptModal(true);
  };

  const openEditDept = (locId: string, dept: Department) => {
    setDeptLocId(locId);
    setEditDeptId(dept.id);
    setDName(dept.name); setDFloor(dept.floor);
    setDRoom(dept.roomNo); setDBed(dept.bedNo);
    setDActive(dept.isActive); setDError("");
    setShowDeptModal(true);
  };

  const saveDept = () => {
    if (!dName.trim()) { setDError("Department name is required."); return; }
    if (!deptLocId) return;

    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id !== deptLocId) return loc;
        if (editDeptId) {
          return {
            ...loc,
            departments: loc.departments.map((d) =>
              d.id === editDeptId
                ? { ...d, name: dName.trim(), floor: dFloor.trim(), roomNo: dRoom.trim(), bedNo: dBed.trim(), isActive: dActive }
                : d,
            ),
          };
        }
        return {
          ...loc,
          departments: [
            ...loc.departments,
            {
              id: `D-${Date.now()}`,
              name: dName.trim(),
              floor: dFloor.trim(),
              roomNo: dRoom.trim(),
              bedNo: dBed.trim(),
              isActive: dActive,
            },
          ],
        };
      }),
    );
    setShowDeptModal(false);
    resetDeptModal();
  };

  const removeDept = (locId: string, deptId: string) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locId
          ? { ...loc, departments: loc.departments.filter((d) => d.id !== deptId) }
          : loc,
      ),
    );
  };

  const toggleExpand = (locId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(locId)) next.delete(locId); else next.add(locId);
      return next;
    });
  };

  /* --- Filter --- */
  const filtered = locations.filter(
    (l) =>
      l.orgName.toLowerCase().includes(search.toLowerCase()) ||
      l.building.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.departments.some((d) => d.name.toLowerCase().includes(search.toLowerCase())),
  );

  const totalDepts = locations.reduce((s, l) => s + l.departments.length, 0);
  const totalBeds = locations.reduce(
    (s, l) => s + l.departments.reduce((s2, d) => s2 + (parseInt(d.bedNo) || 0), 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00BCD4]" /> Location & Department Master
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {locations.length} location(s) | {totalDepts} department(s) | {totalBeds} bed(s)
          </p>
        </div>
        <Button size="sm" onClick={openAddLocation} className="bg-[#00BCD4] hover:bg-[#00838F] text-white gap-1.5 h-8 text-xs font-bold">
          <Plus className="w-3.5 h-3.5" /> Add Location
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          className="pl-8 h-8 text-xs"
          placeholder="Search location, building, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Main Table */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1E293B] hover:bg-[#1E293B] [&>th]:h-9 [&>th]:py-0 [&>th]:text-[11px] [&>th]:text-white [&>th]:font-bold">
                  <TableHead className="w-8">#</TableHead>
                  <TableHead className="min-w-[180px]">Hospital / Clinic / Organization</TableHead>
                  <TableHead className="min-w-[120px]">Building / Block</TableHead>
                  <TableHead className="min-w-[140px]">Address</TableHead>
                  <TableHead className="min-w-[260px]">Departments</TableHead>
                  <TableHead className="w-14 text-center">Logo</TableHead>
                  <TableHead className="w-14 text-center">Status</TableHead>
                  <TableHead className="w-28 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                      No locations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((loc, idx) => {
                    const isExpanded = expandedRows.has(loc.id);
                    const deptList = loc.departments;
                    const visibleDepts = isExpanded ? deptList : deptList.slice(0, 4);
                    const hasMore = deptList.length > 4;

                    return (
                      <TableRow key={loc.id} className="align-top border-b border-border hover:bg-muted/20">
                        <TableCell className="text-[11px] text-muted-foreground py-2.5 px-3 font-mono">
                          {idx + 1}
                        </TableCell>

                        {/* Hospital / Clinic / Organization */}
                        <TableCell className="py-2.5 px-3">
                          <span className="text-xs font-bold text-foreground leading-tight block">{loc.orgName}</span>
                          <span className="text-[10px] text-muted-foreground">{loc.city}, {loc.state}</span>
                        </TableCell>

                        {/* Building */}
                        <TableCell className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-[#00BCD4] shrink-0" />
                            <span className="text-xs text-foreground font-medium">{loc.building}</span>
                          </div>
                        </TableCell>

                        {/* Address */}
                        <TableCell className="py-2.5 px-3">
                          <span className="text-[11px] text-muted-foreground leading-snug block">{loc.address}</span>
                          <span className="text-[10px] text-muted-foreground">{loc.pinCode}</span>
                        </TableCell>

                        {/* Departments - vertical stack */}
                        <TableCell className="py-2 px-3">
                          {deptList.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground/50 italic">No departments added</span>
                          ) : (
                            <div className="space-y-0.5">
                              {visibleDepts.map((dept) => (
                                <div key={dept.id} className="flex items-center gap-1.5 group py-0.5">
                                  <span className={cn(
                                    "text-[11px] leading-tight",
                                    dept.isActive ? "text-foreground" : "text-muted-foreground line-through",
                                  )}>
                                    {dept.name}
                                  </span>
                                  {dept.floor && (
                                    <span className="text-[9px] text-muted-foreground/60 hidden group-hover:inline">
                                      F:{dept.floor}
                                    </span>
                                  )}
                                  {dept.roomNo && (
                                    <span className="text-[9px] text-muted-foreground/60 hidden group-hover:inline">
                                      R:{dept.roomNo}
                                    </span>
                                  )}
                                  {dept.bedNo && (
                                    <Badge className="text-[8px] px-1 py-0 h-3.5 border-0 bg-[#00BCD4]/10 text-[#00BCD4] font-bold hidden group-hover:inline-flex">
                                      {dept.bedNo} beds
                                    </Badge>
                                  )}
                                  <button
                                    onClick={() => openEditDept(loc.id, dept)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#3B82F6] hover:text-[#2563EB]"
                                    title="Edit department"
                                  >
                                    <Pencil className="w-2.5 h-2.5" />
                                  </button>
                                  <button
                                    onClick={() => removeDept(loc.id, dept.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444] hover:text-[#DC2626]"
                                    title="Remove department"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ))}
                              {hasMore && (
                                <button
                                  onClick={() => toggleExpand(loc.id)}
                                  className="flex items-center gap-1 text-[10px] font-semibold text-[#3B82F6] hover:text-[#2563EB] mt-0.5"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-3 h-3" /> Show less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3 h-3" /> +{deptList.length - 4} more
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Logo */}
                        <TableCell className="py-2.5 px-3 text-center">
                          {loc.logoUrl ? (
                            <img src={loc.logoUrl} alt="" className="w-8 h-8 rounded object-cover mx-auto" />
                          ) : (
                            <label className="cursor-pointer inline-flex flex-col items-center gap-0.5 text-muted-foreground hover:text-[#00BCD4] transition-colors" title="Upload logo">
                              <ImageIcon className="w-4 h-4" />
                              <span className="text-[8px] font-semibold">Upload</span>
                              <input type="file" className="hidden" accept="image/*" />
                            </label>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-2.5 px-3 text-center">
                          <Badge className={cn(
                            "text-[9px] font-bold border-0 px-2 py-0.5",
                            loc.isActive
                              ? "bg-[#10B981]/10 text-[#10B981]"
                              : "bg-[#EF4444]/10 text-[#EF4444]",
                          )}>
                            {loc.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openAddDept(loc.id)}
                              className="inline-flex items-center gap-1 h-6 px-2 rounded text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 hover:bg-[#10B981]/20 transition-colors"
                              title="Add Department"
                            >
                              <Plus className="w-3 h-3" /> Dept
                            </button>
                            <button
                              onClick={() => openEditLocation(loc)}
                              className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-colors"
                              title="Edit Location"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
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

      {/* ============================================================ */}
      {/*  ADD / EDIT LOCATION MODAL                                    */}
      {/* ============================================================ */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-background z-10">
              <h2 className="text-sm font-extrabold text-foreground">
                {editLocId ? "Edit Location" : "Add New Location"}
              </h2>
              <button onClick={() => { setShowLocModal(false); resetLocModal(); }} className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {lError && (
                <div className="text-xs font-semibold text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg px-3 py-2">{lError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Hospital / Clinic / Organization" required hint="Only your assigned organizations are shown">
                  <Select value={lOrgId} onValueChange={setLOrgId}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select organization" /></SelectTrigger>
                    <SelectContent>
                      {organizationOptions.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          <span className="font-semibold">{org.name}</span>
                          <span className="text-muted-foreground ml-1.5 font-mono text-[10px]">{org.code}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Building / Block" required hint="e.g. Main Tower, Block A, Diagnostic Block">
                  <Input className="h-9 text-xs" placeholder="e.g. Main Tower" value={lBuilding} onChange={(e) => setLBuilding(e.target.value)} />
                </FormField>
              </div>

              <FormField label="Address">
                <Textarea className="text-xs min-h-[60px]" placeholder="Street address" value={lAddress} onChange={(e) => setLAddress(e.target.value)} />
              </FormField>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="City">
                  <Input className="h-9 text-xs" placeholder="City" value={lCity} onChange={(e) => setLCity(e.target.value)} />
                </FormField>
                <FormField label="State">
                  <Input className="h-9 text-xs" placeholder="State" value={lState} onChange={(e) => setLState(e.target.value)} />
                </FormField>
                <FormField label="Pin Code">
                  <Input className="h-9 text-xs" placeholder="600006" value={lPinCode} onChange={(e) => setLPinCode(e.target.value)} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email">
                  <Input className="h-9 text-xs" placeholder="location@hospital.com" value={lEmail} onChange={(e) => setLEmail(e.target.value)} />
                </FormField>
                <FormField label="Cost Type">
                  <Select value={lCostType} onValueChange={setLCostType}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {costTypeOptions.map((ct) => (
                        <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="End-User Notes">
                <Textarea className="text-xs min-h-[50px]" placeholder="Optional notes" value={lNotes} onChange={(e) => setLNotes(e.target.value)} />
              </FormField>

              <div className="flex items-center gap-2">
                <Checkbox checked={lActive} onCheckedChange={(v) => setLActive(!!v)} id="locActive" />
                <Label htmlFor="locActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
              </div>

              {/* Logo upload */}
              <FormField label="Location Logo">
                <label className="h-16 border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:border-[#00BCD4] hover:bg-[#00BCD4]/[0.02] transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Click to upload logo</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </FormField>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border sticky bottom-0 bg-background">
              <Button variant="outline" size="sm" onClick={() => { setShowLocModal(false); resetLocModal(); }} className="h-8 text-xs font-bold">
                Cancel
              </Button>
              <Button size="sm" onClick={saveLocation} className="h-8 text-xs font-bold bg-[#00BCD4] hover:bg-[#00838F] text-white gap-1.5">
                <Save className="w-3 h-3" /> {editLocId ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  ADD / EDIT DEPARTMENT MODAL                                  */}
      {/* ============================================================ */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-extrabold text-foreground">
                {editDeptId ? "Edit Department" : "Add Department"}
              </h2>
              <button onClick={() => { setShowDeptModal(false); resetDeptModal(); }} className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {dError && (
                <div className="text-xs font-semibold text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg px-3 py-2">{dError}</div>
              )}

              {/* Show which location this dept belongs to */}
              {deptLocId && (
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00BCD4]" />
                  <span className="text-[11px] font-semibold text-foreground">
                    {locations.find((l) => l.id === deptLocId)?.orgName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    - {locations.find((l) => l.id === deptLocId)?.building}
                  </span>
                </div>
              )}

              <FormField label="Department Name" required hint="e.g. ICU, Emergency, Ward A, General Surgery OT, CSSD, Radiology">
                <Input className="h-9 text-xs" placeholder="Department name" value={dName} onChange={(e) => setDName(e.target.value)} />
              </FormField>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="Floor" hint="e.g. Ground, 1st, 2nd, Basement">
                  <div className="relative">
                    <Layers className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input className="h-9 text-xs pl-7" placeholder="Floor" value={dFloor} onChange={(e) => setDFloor(e.target.value)} />
                  </div>
                </FormField>
                <FormField label="Room No" hint="e.g. ICU-301, OT-501">
                  <div className="relative">
                    <DoorOpen className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input className="h-9 text-xs pl-7" placeholder="Room" value={dRoom} onChange={(e) => setDRoom(e.target.value)} />
                  </div>
                </FormField>
                <FormField label="Bed No" hint="Total beds in dept">
                  <div className="relative">
                    <BedDouble className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input className="h-9 text-xs pl-7" placeholder="0" value={dBed} onChange={(e) => setDBed(e.target.value)} />
                  </div>
                </FormField>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox checked={dActive} onCheckedChange={(v) => setDActive(!!v)} id="deptActive" />
                <Label htmlFor="deptActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => { setShowDeptModal(false); resetDeptModal(); }} className="h-8 text-xs font-bold">
                Cancel
              </Button>
              <Button size="sm" onClick={saveDept} className="h-8 text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white gap-1.5">
                <Save className="w-3 h-3" /> {editDeptId ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
