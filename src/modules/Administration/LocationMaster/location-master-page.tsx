"use client";

import React, { useState, useMemo } from "react";
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
  Trash2,
  Layers,
  DoorOpen,
  BedDouble,
  ChevronRight,
  ChevronDown,
  Link2,
  LayoutGrid,
  GitBranch,
} from "lucide-react";


/* ------------------------------------------------------------------ */
/*  Types (aligned with new DB schema)                                 */
/* ------------------------------------------------------------------ */
interface Bed {
  id: string;
  bedNo: string;
  bedCode: string;
  isActive: boolean;
}

interface Room {
  id: string;
  roomNo: string;
  roomName: string;
  roomTypeId: string;
  roomTypeName: string;
  isActive: boolean;
  beds: Bed[];
}

interface Floor {
  id: string;
  floorNo: number;         // -1=Basement, 0=Ground, 1,2,...
  floorName: string;
  isActive: boolean;
  rooms: Room[];
}

interface Building {
  id: string;
  orgId: string;
  buildingName: string;
  buildingCode: string;
  description: string;
  isActive: boolean;
  floors: Floor[];
}

interface Organization {
  id: string;
  orgName: string;
  orgCode: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  email: string;
  isActive: boolean;
  buildings: Building[];
}

interface Department {
  id: string;
  orgId: string;
  deptName: string;
  deptCode: string;
  description: string;
  isActive: boolean;
  mappings: DeptLocationMap[];
}

interface DeptLocationMap {
  id: string;
  level: "BUILDING" | "FLOOR" | "ROOM" | "BED";
  locationId: string;
  isPrimary: boolean;
}

/* ------------------------------------------------------------------ */
/*  Room Type master data                                              */
/* ------------------------------------------------------------------ */
const roomTypes = [
  { id: "RT-01", code: "ICU",    name: "Intensive Care Unit" },
  { id: "RT-02", code: "MICU",   name: "Medical ICU" },
  { id: "RT-03", code: "NICU",   name: "Neonatal ICU" },
  { id: "RT-04", code: "CICU",   name: "Cardiac ICU" },
  { id: "RT-05", code: "CCU",    name: "Coronary Care Unit" },
  { id: "RT-06", code: "OT",     name: "Operation Theatre" },
  { id: "RT-07", code: "WARD",   name: "General Ward" },
  { id: "RT-08", code: "PVT",    name: "Private Room" },
  { id: "RT-09", code: "ER",     name: "Emergency Room" },
  { id: "RT-10", code: "OPD",    name: "Out-Patient Department" },
  { id: "RT-11", code: "LAB",    name: "Laboratory" },
  { id: "RT-12", code: "RAD",    name: "Radiology" },
  { id: "RT-13", code: "PHARM",  name: "Pharmacy" },
  { id: "RT-14", code: "STORE",  name: "Store Room" },
  { id: "RT-15", code: "CSSD",   name: "CSSD" },
  { id: "RT-16", code: "DIAL",   name: "Dialysis Unit" },
  { id: "RT-17", code: "BB",     name: "Blood Bank" },
  { id: "RT-18", code: "ADMIN",  name: "Administrative" },
];

/* ------------------------------------------------------------------ */
/*  Mock Data: Facilities with hierarchical buildings/floors/rooms/beds*/
/* ------------------------------------------------------------------ */
const initialOrganizations: Organization[] = [
  {
    id: "ORG-001",
    orgName: "Apollo Chennai - Main Campus",
    orgCode: "APL-CHN-MAIN",
    address: "21, Greams Lane, Off Greams Road",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600006",
    email: "admin@apollochennai.com",
    isActive: true,
    buildings: [
      {
        id: "BLD-001", orgId: "ORG-001", buildingName: "Main Tower", buildingCode: "MT",
        description: "Primary 8-floor main tower", isActive: true,
        floors: [
          { id: "FL-001", floorNo: -1, floorName: "Basement", isActive: true, rooms: [
            { id: "RM-017", roomNo: "CSSD-B01", roomName: "CSSD", roomTypeId: "RT-15", roomTypeName: "CSSD", isActive: true, beds: [] },
          ]},
          { id: "FL-002", floorNo: 0, floorName: "Ground Floor", isActive: true, rooms: [
            { id: "RM-001", roomNo: "ER-001", roomName: "Emergency", roomTypeId: "RT-09", roomTypeName: "Emergency Room", isActive: true,
              beds: Array.from({ length: 8 }, (_, i) => ({ id: `BD-001-${i + 1}`, bedNo: `${i + 1}`, bedCode: `ER-B${i + 1}`, isActive: true })),
            },
            { id: "RM-002", roomNo: "OPD-002", roomName: "OPD", roomTypeId: "RT-10", roomTypeName: "Out-Patient Department", isActive: true, beds: [] },
            { id: "RM-018", roomNo: "RAD-003", roomName: "Radiology", roomTypeId: "RT-12", roomTypeName: "Radiology", isActive: true, beds: [] },
          ]},
          { id: "FL-003", floorNo: 1, floorName: "1st Floor", isActive: true, rooms: [
            { id: "RM-003", roomNo: "WA-101", roomName: "Ward A", roomTypeId: "RT-07", roomTypeName: "General Ward", isActive: true,
              beds: Array.from({ length: 20 }, (_, i) => ({ id: `BD-003-${i + 1}`, bedNo: `${i + 1}`, bedCode: `WA-B${i + 1}`, isActive: true })),
            },
            { id: "RM-004", roomNo: "WB-102", roomName: "Ward B", roomTypeId: "RT-07", roomTypeName: "General Ward", isActive: true,
              beds: Array.from({ length: 20 }, (_, i) => ({ id: `BD-004-${i + 1}`, bedNo: `${i + 1}`, bedCode: `WB-B${i + 1}`, isActive: true })),
            },
            { id: "RM-019", roomNo: "LAB-103", roomName: "Laboratory", roomTypeId: "RT-11", roomTypeName: "Laboratory", isActive: true, beds: [] },
          ]},
          { id: "FL-004", floorNo: 2, floorName: "2nd Floor", isActive: true, rooms: [
            { id: "RM-005", roomNo: "WC-201", roomName: "Ward C", roomTypeId: "RT-07", roomTypeName: "General Ward", isActive: true,
              beds: Array.from({ length: 18 }, (_, i) => ({ id: `BD-005-${i + 1}`, bedNo: `${i + 1}`, bedCode: `WC-B${i + 1}`, isActive: true })),
            },
            { id: "RM-006", roomNo: "WD-202", roomName: "Ward D", roomTypeId: "RT-07", roomTypeName: "General Ward", isActive: true,
              beds: Array.from({ length: 18 }, (_, i) => ({ id: `BD-006-${i + 1}`, bedNo: `${i + 1}`, bedCode: `WD-B${i + 1}`, isActive: true })),
            },
          ]},
          { id: "FL-005", floorNo: 3, floorName: "3rd Floor", isActive: true, rooms: [
            { id: "RM-007", roomNo: "MICU-301", roomName: "MICU", roomTypeId: "RT-02", roomTypeName: "Medical ICU", isActive: true,
              beds: Array.from({ length: 12 }, (_, i) => ({ id: `BD-007-${i + 1}`, bedNo: `${i + 1}`, bedCode: `MICU-B${i + 1}`, isActive: true })),
            },
            { id: "RM-008", roomNo: "NICU-302", roomName: "NICU", roomTypeId: "RT-03", roomTypeName: "Neonatal ICU", isActive: true,
              beds: Array.from({ length: 8 }, (_, i) => ({ id: `BD-008-${i + 1}`, bedNo: `${i + 1}`, bedCode: `NICU-B${i + 1}`, isActive: true })),
            },
            { id: "RM-009", roomNo: "CICU-303", roomName: "CICU", roomTypeId: "RT-04", roomTypeName: "Cardiac ICU", isActive: true,
              beds: Array.from({ length: 6 }, (_, i) => ({ id: `BD-009-${i + 1}`, bedNo: `${i + 1}`, bedCode: `CICU-B${i + 1}`, isActive: true })),
            },
          ]},
          { id: "FL-006", floorNo: 4, floorName: "4th Floor", isActive: true, rooms: [
            { id: "RM-010", roomNo: "CCU-401", roomName: "CCU", roomTypeId: "RT-05", roomTypeName: "Coronary Care Unit", isActive: true,
              beds: Array.from({ length: 6 }, (_, i) => ({ id: `BD-010-${i + 1}`, bedNo: `${i + 1}`, bedCode: `CCU-B${i + 1}`, isActive: true })),
            },
          ]},
          { id: "FL-007", floorNo: 5, floorName: "5th Floor", isActive: true, rooms: [
            { id: "RM-011", roomNo: "OT-501", roomName: "General Surgery OT", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
            { id: "RM-012", roomNo: "OT-502", roomName: "Cardiac Surgery OT", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
            { id: "RM-013", roomNo: "OT-503", roomName: "Neuro Surgery OT", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
            { id: "RM-014", roomNo: "OT-504", roomName: "Uro Surgery OT", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
          ]},
          { id: "FL-008", floorNo: 6, floorName: "6th Floor", isActive: true, rooms: [
            { id: "RM-015", roomNo: "OT-601", roomName: "Ortho Surgery OT", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
            { id: "RM-016", roomNo: "OT-602", roomName: "Gyne Surgery OT", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
          ]},
        ],
      },
      {
        id: "BLD-002", orgId: "ORG-001", buildingName: "Diagnostic Block", buildingCode: "DX",
        description: "Radiology, Pathology, Blood Bank, Dialysis", isActive: true,
        floors: [
          { id: "FL-020", floorNo: 0, floorName: "Ground Floor", isActive: true, rooms: [
            { id: "RM-030", roomNo: "RD-001", roomName: "Radiology & Imaging", roomTypeId: "RT-12", roomTypeName: "Radiology", isActive: true, beds: [] },
          ]},
          { id: "FL-021", floorNo: 1, floorName: "1st Floor", isActive: true, rooms: [
            { id: "RM-031", roomNo: "LAB-101", roomName: "Pathology Lab", roomTypeId: "RT-11", roomTypeName: "Laboratory", isActive: true, beds: [] },
            { id: "RM-032", roomNo: "LAB-102", roomName: "Microbiology Lab", roomTypeId: "RT-11", roomTypeName: "Laboratory", isActive: true, beds: [] },
          ]},
          { id: "FL-022", floorNo: 2, floorName: "2nd Floor", isActive: true, rooms: [
            { id: "RM-033", roomNo: "BB-201", roomName: "Blood Bank", roomTypeId: "RT-17", roomTypeName: "Blood Bank", isActive: true, beds: [] },
          ]},
          { id: "FL-023", floorNo: 3, floorName: "3rd Floor", isActive: true, rooms: [
            { id: "RM-034", roomNo: "DU-301", roomName: "Dialysis Unit", roomTypeId: "RT-16", roomTypeName: "Dialysis Unit", isActive: true,
              beds: Array.from({ length: 10 }, (_, i) => ({ id: `BD-034-${i + 1}`, bedNo: `${i + 1}`, bedCode: `DU-B${i + 1}`, isActive: true })),
            },
          ]},
        ],
      },
    ],
  },
  {
    id: "ORG-002",
    orgName: "Apollo Chennai - OMR Branch",
    orgCode: "APL-CHN-OMR",
    address: "Perungudi, OMR",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600096",
    email: "admin@apolloomr.com",
    isActive: true,
    buildings: [
      {
        id: "BLD-010", orgId: "ORG-002", buildingName: "Block A - Main Hospital", buildingCode: "BA",
        description: "10-floor main hospital block", isActive: true,
        floors: [
          { id: "FL-050", floorNo: -1, floorName: "Basement", isActive: true, rooms: [
            { id: "RM-060", roomNo: "CSSD-B01", roomName: "CSSD", roomTypeId: "RT-15", roomTypeName: "CSSD", isActive: true, beds: [] },
          ]},
          { id: "FL-051", floorNo: 0, floorName: "Ground Floor", isActive: true, rooms: [
            { id: "RM-050", roomNo: "ER-G01", roomName: "Emergency", roomTypeId: "RT-09", roomTypeName: "Emergency Room", isActive: true,
              beds: Array.from({ length: 6 }, (_, i) => ({ id: `BD-050-${i + 1}`, bedNo: `${i + 1}`, bedCode: `ER-B${i + 1}`, isActive: true })),
            },
            { id: "RM-051", roomNo: "OPD-G02", roomName: "General OPD", roomTypeId: "RT-10", roomTypeName: "Out-Patient Department", isActive: true, beds: [] },
            { id: "RM-061", roomNo: "PH-G03", roomName: "Pharmacy", roomTypeId: "RT-13", roomTypeName: "Pharmacy", isActive: true, beds: [] },
          ]},
          { id: "FL-052", floorNo: 1, floorName: "1st Floor", isActive: true, rooms: [
            { id: "RM-052", roomNo: "C-101", roomName: "Cardiology OPD", roomTypeId: "RT-10", roomTypeName: "Out-Patient Department", isActive: true, beds: [] },
            { id: "RM-053", roomNo: "RAD-101", roomName: "Radiology", roomTypeId: "RT-12", roomTypeName: "Radiology", isActive: true, beds: [] },
          ]},
          { id: "FL-053", floorNo: 2, floorName: "2nd Floor", isActive: true, rooms: [
            { id: "RM-054", roomNo: "ICU-201", roomName: "ICU", roomTypeId: "RT-01", roomTypeName: "Intensive Care Unit", isActive: true,
              beds: Array.from({ length: 10 }, (_, i) => ({ id: `BD-054-${i + 1}`, bedNo: `${i + 1}`, bedCode: `ICU-B${i + 1}`, isActive: true })),
            },
          ]},
          { id: "FL-054", floorNo: 3, floorName: "3rd Floor", isActive: true, rooms: [
            { id: "RM-055", roomNo: "OT-301", roomName: "OT Complex", roomTypeId: "RT-06", roomTypeName: "Operation Theatre", isActive: true, beds: [] },
          ]},
          { id: "FL-055", floorNo: 4, floorName: "4th Floor", isActive: true, rooms: [
            { id: "RM-056", roomNo: "C-401", roomName: "Cardiology", roomTypeId: "RT-01", roomTypeName: "Intensive Care Unit", isActive: true,
              beds: Array.from({ length: 16 }, (_, i) => ({ id: `BD-056-${i + 1}`, bedNo: `${i + 1}`, bedCode: `CARD-B${i + 1}`, isActive: true })),
            },
          ]},
          { id: "FL-056", floorNo: 5, floorName: "5th Floor", isActive: true, rooms: [
            { id: "RM-057", roomNo: "N-501", roomName: "Neurology", roomTypeId: "RT-07", roomTypeName: "General Ward", isActive: true,
              beds: Array.from({ length: 12 }, (_, i) => ({ id: `BD-057-${i + 1}`, bedNo: `${i + 1}`, bedCode: `NEURO-B${i + 1}`, isActive: true })),
            },
          ]},
        ],
      },
    ],
  },
];

const initialDepartments: Department[] = [
  { id: "DEPT-001", orgId: "ORG-001", deptName: "Emergency Medicine", deptCode: "EM", description: "Emergency department", isActive: true,
    mappings: [
      { id: "DLM-001", level: "ROOM", locationId: "RM-001", isPrimary: true },
      { id: "DLM-001a", level: "BED", locationId: "BD-001-1", isPrimary: false },
      { id: "DLM-001b", level: "BED", locationId: "BD-001-2", isPrimary: false },
      { id: "DLM-001c", level: "BED", locationId: "BD-001-3", isPrimary: false },
      { id: "DLM-001d", level: "BED", locationId: "BD-001-5", isPrimary: false },
    ],
  },
  { id: "DEPT-002", orgId: "ORG-001", deptName: "General Surgery", deptCode: "GS", description: "General surgery department", isActive: true,
    mappings: [
      { id: "DLM-002", level: "ROOM", locationId: "RM-011", isPrimary: true },
      { id: "DLM-003", level: "ROOM", locationId: "RM-012", isPrimary: false },
      { id: "DLM-003a", level: "BED", locationId: "BD-003-1", isPrimary: false },
      { id: "DLM-003b", level: "BED", locationId: "BD-003-5", isPrimary: false },
      { id: "DLM-003c", level: "BED", locationId: "BD-003-10", isPrimary: false },
    ],
  },
  { id: "DEPT-003", orgId: "ORG-001", deptName: "Radiology", deptCode: "RAD", description: "Imaging & diagnostics", isActive: true,
    mappings: [
      { id: "DLM-004", level: "ROOM", locationId: "RM-018", isPrimary: true },
      { id: "DLM-005", level: "ROOM", locationId: "RM-030", isPrimary: false },
    ],
  },
  { id: "DEPT-004", orgId: "ORG-001", deptName: "Critical Care", deptCode: "CC", description: "ICU, MICU, NICU, CICU, CCU", isActive: true,
    mappings: [
      { id: "DLM-006", level: "FLOOR", locationId: "FL-005", isPrimary: true },
      { id: "DLM-007", level: "ROOM", locationId: "RM-010", isPrimary: false },
      { id: "DLM-007a", level: "BED", locationId: "BD-007-1", isPrimary: false },
      { id: "DLM-007b", level: "BED", locationId: "BD-007-3", isPrimary: false },
      { id: "DLM-007c", level: "BED", locationId: "BD-007-6", isPrimary: false },
      { id: "DLM-007d", level: "BED", locationId: "BD-008-1", isPrimary: false },
      { id: "DLM-007e", level: "BED", locationId: "BD-008-4", isPrimary: false },
      { id: "DLM-007f", level: "BED", locationId: "BD-009-2", isPrimary: false },
      { id: "DLM-007g", level: "BED", locationId: "BD-010-1", isPrimary: false },
      { id: "DLM-007h", level: "BED", locationId: "BD-010-3", isPrimary: false },
    ],
  },
  { id: "DEPT-005", orgId: "ORG-001", deptName: "CSSD", deptCode: "CSSD", description: "Central Sterile Supply", isActive: true,
    mappings: [{ id: "DLM-008", level: "ROOM", locationId: "RM-017", isPrimary: true }],
  },
  { id: "DEPT-006", orgId: "ORG-001", deptName: "Dialysis Unit", deptCode: "DU", description: "Renal dialysis services", isActive: true,
    mappings: [
      { id: "DLM-020", level: "ROOM", locationId: "RM-034", isPrimary: true },
      { id: "DLM-020a", level: "BED", locationId: "BD-034-1", isPrimary: false },
      { id: "DLM-020b", level: "BED", locationId: "BD-034-2", isPrimary: false },
      { id: "DLM-020c", level: "BED", locationId: "BD-034-4", isPrimary: false },
      { id: "DLM-020d", level: "BED", locationId: "BD-034-7", isPrimary: false },
      { id: "DLM-020e", level: "BED", locationId: "BD-034-10", isPrimary: false },
    ],
  },
  { id: "DEPT-007", orgId: "ORG-001", deptName: "General Medicine", deptCode: "GM", description: "General medicine wards", isActive: true,
    mappings: [
      { id: "DLM-030", level: "ROOM", locationId: "RM-003", isPrimary: true },
      { id: "DLM-030a", level: "BED", locationId: "BD-003-2", isPrimary: false },
      { id: "DLM-030b", level: "BED", locationId: "BD-003-8", isPrimary: false },
      { id: "DLM-030c", level: "BED", locationId: "BD-003-15", isPrimary: false },
      { id: "DLM-031", level: "ROOM", locationId: "RM-004", isPrimary: false },
      { id: "DLM-031a", level: "BED", locationId: "BD-004-3", isPrimary: false },
      { id: "DLM-031b", level: "BED", locationId: "BD-004-12", isPrimary: false },
    ],
  },
  { id: "DEPT-010", orgId: "ORG-002", deptName: "Emergency Medicine", deptCode: "EM", description: "OMR emergency department", isActive: true,
    mappings: [
      { id: "DLM-010", level: "ROOM", locationId: "RM-050", isPrimary: true },
      { id: "DLM-010a", level: "BED", locationId: "BD-050-1", isPrimary: false },
      { id: "DLM-010b", level: "BED", locationId: "BD-050-3", isPrimary: false },
      { id: "DLM-010c", level: "BED", locationId: "BD-050-5", isPrimary: false },
    ],
  },
  { id: "DEPT-011", orgId: "ORG-002", deptName: "Cardiology", deptCode: "CARD", description: "Cardiology department", isActive: true,
    mappings: [
      { id: "DLM-011", level: "ROOM", locationId: "RM-052", isPrimary: false },
      { id: "DLM-012", level: "ROOM", locationId: "RM-056", isPrimary: true },
      { id: "DLM-012a", level: "BED", locationId: "BD-056-1", isPrimary: false },
      { id: "DLM-012b", level: "BED", locationId: "BD-056-4", isPrimary: false },
      { id: "DLM-012c", level: "BED", locationId: "BD-056-8", isPrimary: false },
      { id: "DLM-012d", level: "BED", locationId: "BD-056-12", isPrimary: false },
    ],
  },
  { id: "DEPT-012", orgId: "ORG-002", deptName: "Neurology", deptCode: "NEURO", description: "Neurology ward", isActive: true,
    mappings: [
      { id: "DLM-040", level: "ROOM", locationId: "RM-057", isPrimary: true },
      { id: "DLM-040a", level: "BED", locationId: "BD-057-1", isPrimary: false },
      { id: "DLM-040b", level: "BED", locationId: "BD-057-5", isPrimary: false },
      { id: "DLM-040c", level: "BED", locationId: "BD-057-9", isPrimary: false },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: resolve location breadcrumb from mapping                   */
/* ------------------------------------------------------------------ */
function resolveBreadcrumb(mapping: DeptLocationMap, organizations: Organization[]): string {
  for (const fac of organizations) {
    for (const bld of fac.buildings) {
      if (mapping.level === "BUILDING" && mapping.locationId === bld.id) return bld.buildingName;
      for (const fl of bld.floors) {
        if (mapping.level === "FLOOR" && mapping.locationId === fl.id) return `${bld.buildingName} > ${fl.floorName}`;
        for (const rm of fl.rooms) {
          if (mapping.level === "ROOM" && mapping.locationId === rm.id) return `${bld.buildingName} > ${fl.floorName} > ${rm.roomNo}`;
          for (const bd of rm.beds) {
            if (mapping.level === "BED" && mapping.locationId === bd.id) return `${bld.buildingName} > ${fl.floorName} > ${rm.roomNo} > Bed ${bd.bedNo}`;
          }
        }
      }
    }
  }
  return "Unknown";
}

/* ------------------------------------------------------------------ */
/*  FormField helper                                                   */
/* ------------------------------------------------------------------ */
function FormField({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string; }) {
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
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"hierarchy" | "departments">("hierarchy");

  // Organization selector
  const [selectedOrgId, setSelectedOrgId] = useState<string>("ORG-001");
  const selectedOrg = organizations.find((f) => f.id === selectedOrgId);

  // Expand states
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(new Set(["BLD-001"]));
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set(["FL-002"]));
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  // Modal states
  const [modal, setModal] = useState<{ type: "building" | "floor" | "room" | "bed" | "department" | "deptMap"; mode: "add" | "edit"; parentId?: string; editId?: string } | null>(null);
  const [formError, setFormError] = useState("");

  // Building form
  const [bName, setBName] = useState("");
  const [bCode, setBCode] = useState("");
  const [bDesc, setBDesc] = useState("");
  const [bActive, setBActive] = useState(true);

  // Floor form
  const [fNo, setFNo] = useState("");
  const [fName, setFName] = useState("");
  const [fActive, setFActive] = useState(true);

  // Room form
  const [rNo, setRNo] = useState("");
  const [rName, setRName] = useState("");
  const [rType, setRType] = useState("");
  const [rActive, setRActive] = useState(true);

  // Bed form
  const [bedNo, setBedNo] = useState("");
  const [bedCode, setBedCode] = useState("");
  const [bedActive, setBedActive] = useState(true);

  // Department form
  const [dName, setDName] = useState("");
  const [dCode, setDCode] = useState("");
  const [dDesc, setDDesc] = useState("");
  const [dActive, setDActive] = useState(true);

  // Inline mapping rows for department form
  const [deptInlineMappings, setDeptInlineMappings] = useState<DeptLocationMap[]>([]);
  const [inlineMapLevel, setInlineMapLevel] = useState<"BUILDING" | "FLOOR" | "ROOM" | "BED">("ROOM");
  const [inlineMapBldId, setInlineMapBldId] = useState("");
  const [inlineMapFlId, setInlineMapFlId] = useState("");
  const [inlineMapRmId, setInlineMapRmId] = useState("");
  const [inlineMapBdId, setInlineMapBdId] = useState("");
  const [inlineMapPrimary, setInlineMapPrimary] = useState(false);

  // Dept mapping form
  const [mapLevel, setMapLevel] = useState<"BUILDING" | "FLOOR" | "ROOM" | "BED">("ROOM");
  const [mapBuildingId, setMapBuildingId] = useState("");
  const [mapFloorId, setMapFloorId] = useState("");
  const [mapRoomId, setMapRoomId] = useState("");
  const [mapBedId, setMapBedId] = useState("");
  const [mapPrimary, setMapPrimary] = useState(false);

  // --- Toggle helpers ---
  const toggle = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setter(next);
  };

  // --- Stats ---
  const stats = useMemo(() => {
    if (!selectedOrg) return { buildings: 0, floors: 0, rooms: 0, beds: 0, depts: 0 };
    let floors = 0, rooms = 0, beds = 0;
    selectedOrg.buildings.forEach((b) => {
      floors += b.floors.length;
      b.floors.forEach((f) => {
        rooms += f.rooms.length;
        f.rooms.forEach((r) => { beds += r.beds.length; });
      });
    });
    const depts = departments.filter((d) => d.orgId === selectedOrgId).length;
    return { buildings: selectedOrg.buildings.length, floors, rooms, beds, depts };
  }, [selectedOrg, departments, selectedOrgId]);

  // --- Reset modals ---
  const resetModal = () => {
    setModal(null); setFormError("");
    setBName(""); setBCode(""); setBDesc(""); setBActive(true);
    setFNo(""); setFName(""); setFActive(true);
    setRNo(""); setRName(""); setRType(""); setRActive(true);
    setBedNo(""); setBedCode(""); setBedActive(true);
    setDName(""); setDCode(""); setDDesc(""); setDActive(true);
    setDeptInlineMappings([]); setInlineMapLevel("ROOM"); setInlineMapBldId(""); setInlineMapFlId(""); setInlineMapRmId(""); setInlineMapBdId(""); setInlineMapPrimary(false);
    setMapLevel("ROOM"); setMapBuildingId(""); setMapFloorId(""); setMapRoomId(""); setMapBedId(""); setMapPrimary(false);
  };

  // --- Building CRUD ---
  const openAddBuilding = () => { resetModal(); setModal({ type: "building", mode: "add" }); };
  const openEditBuilding = (b: Building) => {
    resetModal(); setBName(b.buildingName); setBCode(b.buildingCode); setBDesc(b.description); setBActive(b.isActive);
    setModal({ type: "building", mode: "edit", editId: b.id });
  };
  const saveBuilding = () => {
    if (!bName.trim()) { setFormError("Building name is required."); return; }
    if (!selectedOrgId) return;
    setOrganizations((prev) => prev.map((fac) => {
      if (fac.id !== selectedOrgId) return fac;
      if (modal?.mode === "edit" && modal.editId) {
        return { ...fac, buildings: fac.buildings.map((b) => b.id === modal.editId ? { ...b, buildingName: bName.trim(), buildingCode: bCode.trim(), description: bDesc.trim(), isActive: bActive } : b) };
      }
      return { ...fac, buildings: [...fac.buildings, { id: `BLD-${Date.now()}`, orgId: selectedOrgId, buildingName: bName.trim(), buildingCode: bCode.trim(), description: bDesc.trim(), isActive: bActive, floors: [] }] };
    }));
    resetModal();
  };

  // --- Floor CRUD ---
  const openAddFloor = (buildingId: string) => { resetModal(); setModal({ type: "floor", mode: "add", parentId: buildingId }); };
  const openEditFloor = (buildingId: string, fl: Floor) => {
    resetModal(); setFNo(String(fl.floorNo)); setFName(fl.floorName); setFActive(fl.isActive);
    setModal({ type: "floor", mode: "edit", parentId: buildingId, editId: fl.id });
  };
  const saveFloor = () => {
    if (!fName.trim()) { setFormError("Floor name is required."); return; }
    const floorNo = parseInt(fNo);
    if (isNaN(floorNo)) { setFormError("Floor number is required."); return; }
    setOrganizations((prev) => prev.map((fac) => {
      if (fac.id !== selectedOrgId) return fac;
      return { ...fac, buildings: fac.buildings.map((b) => {
        if (b.id !== modal?.parentId) return b;
        if (modal?.mode === "edit" && modal.editId) {
          return { ...b, floors: b.floors.map((f) => f.id === modal.editId ? { ...f, floorNo, floorName: fName.trim(), isActive: fActive } : f) };
        }
        return { ...b, floors: [...b.floors, { id: `FL-${Date.now()}`, floorNo, floorName: fName.trim(), isActive: fActive, rooms: [] }].sort((a, c) => a.floorNo - c.floorNo) };
      })};
    }));
    resetModal();
  };

  // --- Room CRUD ---
  const openAddRoom = (buildingId: string, floorId: string) => { resetModal(); setModal({ type: "room", mode: "add", parentId: `${buildingId}|${floorId}` }); };
  const openEditRoom = (buildingId: string, floorId: string, rm: Room) => {
    resetModal(); setRNo(rm.roomNo); setRName(rm.roomName); setRType(rm.roomTypeId); setRActive(rm.isActive);
    setModal({ type: "room", mode: "edit", parentId: `${buildingId}|${floorId}`, editId: rm.id });
  };
  const saveRoom = () => {
    if (!rNo.trim()) { setFormError("Room number is required."); return; }
    const [bId, flId] = (modal?.parentId || "").split("|");
    const selectedRt = roomTypes.find((rt) => rt.id === rType);
    setOrganizations((prev) => prev.map((fac) => {
      if (fac.id !== selectedOrgId) return fac;
      return { ...fac, buildings: fac.buildings.map((b) => {
        if (b.id !== bId) return b;
        return { ...b, floors: b.floors.map((f) => {
          if (f.id !== flId) return f;
          if (modal?.mode === "edit" && modal.editId) {
            return { ...f, rooms: f.rooms.map((r) => r.id === modal.editId ? { ...r, roomNo: rNo.trim(), roomName: rName.trim(), roomTypeId: rType, roomTypeName: selectedRt?.name || "", isActive: rActive } : r) };
          }
          return { ...f, rooms: [...f.rooms, { id: `RM-${Date.now()}`, roomNo: rNo.trim(), roomName: rName.trim(), roomTypeId: rType, roomTypeName: selectedRt?.name || "", isActive: rActive, beds: [] }] };
        })};
      })};
    }));
    resetModal();
  };

  // --- Bed CRUD ---
  const openAddBed = (buildingId: string, floorId: string, roomId: string) => { resetModal(); setModal({ type: "bed", mode: "add", parentId: `${buildingId}|${floorId}|${roomId}` }); };
  const saveBed = () => {
    if (!bedNo.trim()) { setFormError("Bed number is required."); return; }
    const [bId, flId, rmId] = (modal?.parentId || "").split("|");
    setOrganizations((prev) => prev.map((fac) => {
      if (fac.id !== selectedOrgId) return fac;
      return { ...fac, buildings: fac.buildings.map((b) => {
        if (b.id !== bId) return b;
        return { ...b, floors: b.floors.map((f) => {
          if (f.id !== flId) return f;
          return { ...f, rooms: f.rooms.map((r) => {
            if (r.id !== rmId) return r;
            return { ...r, beds: [...r.beds, { id: `BD-${Date.now()}`, bedNo: bedNo.trim(), bedCode: bedCode.trim(), isActive: bedActive }] };
          })};
        })};
      })};
    }));
    resetModal();
  };

  // --- Department CRUD ---
  const openAddDept = () => { resetModal(); setModal({ type: "department", mode: "add" }); };
  const openEditDept = (dept: Department) => {
    resetModal(); setDName(dept.deptName); setDCode(dept.deptCode); setDDesc(dept.description); setDActive(dept.isActive);
    setModal({ type: "department", mode: "edit", editId: dept.id });
  };
  const saveDept = () => {
    if (!dName.trim()) { setFormError("Department name is required."); return; }
    if (modal?.mode === "edit" && modal.editId) {
      setDepartments((prev) => prev.map((d) => d.id === modal.editId ? { ...d, deptName: dName.trim(), deptCode: dCode.trim(), description: dDesc.trim(), isActive: dActive, mappings: [...d.mappings, ...deptInlineMappings] } : d));
    } else {
      setDepartments((prev) => [...prev, { id: `DEPT-${Date.now()}`, orgId: selectedOrgId, deptName: dName.trim(), deptCode: dCode.trim(), description: dDesc.trim(), isActive: dActive, mappings: deptInlineMappings }]);
    }
    resetModal();
  };

  // --- Dept Location Map ---
  const openAddMapping = (deptId: string) => { resetModal(); setModal({ type: "deptMap", mode: "add", parentId: deptId }); };
  const saveMapping = () => {
    const locId = mapLevel === "BUILDING" ? mapBuildingId : mapLevel === "FLOOR" ? mapFloorId : mapLevel === "ROOM" ? mapRoomId : mapBedId;
    if (!locId) { setFormError("Please select a location."); return; }
    setDepartments((prev) => prev.map((d) => {
      if (d.id !== modal?.parentId) return d;
      return { ...d, mappings: [...d.mappings, { id: `DLM-${Date.now()}`, level: mapLevel, locationId: locId, isPrimary: mapPrimary }] };
    }));
    resetModal();
  };
  const removeMapping = (deptId: string, mapId: string) => {
    setDepartments((prev) => prev.map((d) => d.id === deptId ? { ...d, mappings: d.mappings.filter((m) => m.id !== mapId) } : d));
  };

  // --- Filter ---
  const facDepts = departments.filter((d) => d.orgId === selectedOrgId);
  const filteredBuildings = selectedOrg?.buildings.filter((b) =>
    b.buildingName.toLowerCase().includes(search.toLowerCase()) ||
    b.buildingCode.toLowerCase().includes(search.toLowerCase()) ||
    b.floors.some((f) => f.floorName.toLowerCase().includes(search.toLowerCase()) ||
      f.rooms.some((r) => r.roomNo.toLowerCase().includes(search.toLowerCase()) || r.roomName.toLowerCase().includes(search.toLowerCase()))
    )
  ) || [];

  // --- Helper for cascading dropdowns in mapping modal ---
  const mapBuildings = selectedOrg?.buildings || [];
  const mapFloors = mapBuildings.find((b) => b.id === mapBuildingId)?.floors || [];
  const mapRooms = mapFloors.find((f) => f.id === mapFloorId)?.rooms || [];
  const mapBeds = mapRooms.find((r) => r.id === mapRoomId)?.beds || [];

  // Inline mapping cascading dropdowns (inside department form)
  const inlineBlds = selectedOrg?.buildings || [];
  const inlineFls = inlineBlds.find((b) => b.id === inlineMapBldId)?.floors || [];
  const inlineRms = inlineFls.find((f) => f.id === inlineMapFlId)?.rooms || [];
  const inlineBds = inlineRms.find((r) => r.id === inlineMapRmId)?.beds || [];

  const addInlineMapping = () => {
    const locId = inlineMapLevel === "BUILDING" ? inlineMapBldId : inlineMapLevel === "FLOOR" ? inlineMapFlId : inlineMapLevel === "ROOM" ? inlineMapRmId : inlineMapBdId;
    if (!locId) return;
    // Prevent duplicate
    if (deptInlineMappings.some((m) => m.level === inlineMapLevel && m.locationId === locId)) return;
    setDeptInlineMappings((prev) => [...prev, { id: `DLM-${Date.now()}`, level: inlineMapLevel, locationId: locId, isPrimary: inlineMapPrimary }]);
    setInlineMapLevel("ROOM"); setInlineMapBldId(""); setInlineMapFlId(""); setInlineMapRmId(""); setInlineMapBdId(""); setInlineMapPrimary(false);
  };

  const removeInlineMapping = (id: string) => {
    setDeptInlineMappings((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00BCD4]" /> Location & Department Master
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage physical hierarchy and logical departments
          </p>
        </div>

        {/* Organization Selector */}
        <div className="flex items-center gap-3">
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="h-8 text-xs w-64 font-semibold">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  <span className="font-semibold">{f.orgName}</span>
                  <span className="text-muted-foreground ml-1 font-mono text-[10px]">{f.orgCode}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Buildings", value: stats.buildings, icon: Building2, color: "#00BCD4" },
          { label: "Floors", value: stats.floors, icon: Layers, color: "#3B82F6" },
          { label: "Rooms", value: stats.rooms, icon: DoorOpen, color: "#8B5CF6" },
          { label: "Beds", value: stats.beds, icon: BedDouble, color: "#F59E0B" },
          { label: "Departments", value: stats.depts, icon: GitBranch, color: "#10B981" },
        ].map((s) => (
          <Card key={s.label} className="border border-border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {([
          { id: "hierarchy" as const, label: "Physical Hierarchy", icon: LayoutGrid },
          { id: "departments" as const, label: "Departments", icon: GitBranch },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors -mb-px",
              activeTab === tab.id ? "border-[#00BCD4] text-[#00BCD4]" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input className="pl-8 h-8 text-xs" placeholder={activeTab === "hierarchy" ? "Search building, floor, room..." : "Search department..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {activeTab === "hierarchy" ? (
          <Button size="sm" onClick={openAddBuilding} className="bg-[#00BCD4] hover:bg-[#00838F] text-white gap-1.5 h-8 text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Building
          </Button>
        ) : (
          <Button size="sm" onClick={openAddDept} className="bg-[#10B981] hover:bg-[#059669] text-white gap-1.5 h-8 text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Department
          </Button>
        )}
      </div>

      {/* ====================== HIERARCHY TAB ====================== */}
      {activeTab === "hierarchy" && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E293B] hover:bg-[#1E293B] [&>th]:h-9 [&>th]:py-0 [&>th]:text-[11px] [&>th]:text-white [&>th]:font-bold">
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[100px]">Code / No</TableHead>
                    <TableHead className="min-w-[120px]">Type</TableHead>
                    <TableHead className="w-20 text-center">Items</TableHead>
                    <TableHead className="w-14 text-center">Status</TableHead>
                    <TableHead className="w-28 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuildings.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No buildings found for this organization.</TableCell></TableRow>
                  ) : (
                    filteredBuildings.map((bld) => {
                      const bldExpanded = expandedBuildings.has(bld.id);
                      const bldRoomCount = bld.floors.reduce((s, f) => s + f.rooms.length, 0);
                      const bldBedCount = bld.floors.reduce((s, f) => s + f.rooms.reduce((s2, r) => s2 + r.beds.length, 0), 0);
                      return (
                        <React.Fragment key={bld.id}>{/* Building Row */}
                          <TableRow className="bg-muted/20 hover:bg-muted/30 border-b border-border">
                            <TableCell className="py-2 px-3">
                              <button onClick={() => toggle(expandedBuildings, bld.id, setExpandedBuildings)} className="p-0.5 rounded hover:bg-muted/50">
                                {bldExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                              </button>
                            </TableCell>
                            <TableCell className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#00BCD4] shrink-0" />
                                <span className="text-xs font-bold text-foreground">{bld.buildingName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 px-3"><span className="text-[11px] font-mono text-muted-foreground">{bld.buildingCode}</span></TableCell>
                            <TableCell className="py-2 px-3"><Badge className="text-[9px] border-0 bg-[#00BCD4]/10 text-[#00BCD4] font-bold">Building</Badge></TableCell>
                            <TableCell className="py-2 px-3 text-center">
                              <span className="text-[10px] text-muted-foreground">{bld.floors.length}F / {bldRoomCount}R / {bldBedCount}B</span>
                            </TableCell>
                            <TableCell className="py-2 px-3 text-center">
                              <Badge className={cn("text-[9px] font-bold border-0 px-2 py-0.5", bld.isActive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]")}>{bld.isActive ? "Active" : "Inactive"}</Badge>
                            </TableCell>
                            <TableCell className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => openAddFloor(bld.id)} className="inline-flex items-center gap-1 h-6 px-2 rounded text-[10px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-colors" title="Add Floor"><Plus className="w-3 h-3" /> Floor</button>
                                <button onClick={() => openEditBuilding(bld)} className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-colors" title="Edit"><Pencil className="w-3 h-3" /></button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Floor Rows */}
                          {bldExpanded && bld.floors.map((fl) => {
                            const flExpanded = expandedFloors.has(fl.id);
                            const flBedCount = fl.rooms.reduce((s, r) => s + r.beds.length, 0);
                            return (
                              <React.Fragment key={fl.id}>{/* Floor Row */}
                                <TableRow className="hover:bg-muted/10 border-b border-border/50">
                                  <TableCell className="py-1.5 px-3">
                                    <div className="pl-4">
                                      <button onClick={() => toggle(expandedFloors, fl.id, setExpandedFloors)} className="p-0.5 rounded hover:bg-muted/50">
                                        {flExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                                      </button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-1.5 px-3">
                                    <div className="flex items-center gap-2 pl-4">
                                      <Layers className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                                      <span className="text-[11px] font-semibold text-foreground">{fl.floorName}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-1.5 px-3"><span className="text-[10px] font-mono text-muted-foreground">F{fl.floorNo}</span></TableCell>
                                  <TableCell className="py-1.5 px-3"><Badge className="text-[9px] border-0 bg-[#3B82F6]/10 text-[#3B82F6] font-bold">Floor</Badge></TableCell>
                                  <TableCell className="py-1.5 px-3 text-center"><span className="text-[10px] text-muted-foreground">{fl.rooms.length}R / {flBedCount}B</span></TableCell>
                                  <TableCell className="py-1.5 px-3 text-center">
                                    <Badge className={cn("text-[9px] font-bold border-0 px-2 py-0.5", fl.isActive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]")}>{fl.isActive ? "Active" : "Inactive"}</Badge>
                                  </TableCell>
                                  <TableCell className="py-1.5 px-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button onClick={() => openAddRoom(bld.id, fl.id)} className="inline-flex items-center gap-1 h-5 px-1.5 rounded text-[9px] font-bold text-[#8B5CF6] bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 transition-colors"><Plus className="w-2.5 h-2.5" /> Room</button>
                                      <button onClick={() => openEditFloor(bld.id, fl)} className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                                    </div>
                                  </TableCell>
                                </TableRow>

                                {/* Room Rows */}
                                {flExpanded && fl.rooms.map((rm) => {
                                  const rmExpanded = expandedRooms.has(rm.id);
                                  return (
                                    <React.Fragment key={rm.id}>{/* Room Row */}
                                      <TableRow className="hover:bg-muted/5 border-b border-border/30">
                                        <TableCell className="py-1 px-3">
                                          {rm.beds.length > 0 ? (
                                            <div className="pl-8">
                                              <button onClick={() => toggle(expandedRooms, rm.id, setExpandedRooms)} className="p-0.5 rounded hover:bg-muted/50">
                                                {rmExpanded ? <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" /> : <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />}
                                              </button>
                                            </div>
                                          ) : <div className="pl-8" />}
                                        </TableCell>
                                        <TableCell className="py-1 px-3">
                                          <div className="flex items-center gap-2 pl-8">
                                            <DoorOpen className="w-3 h-3 text-[#8B5CF6] shrink-0" />
                                            <span className="text-[11px] font-medium text-foreground">{rm.roomName || rm.roomNo}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-1 px-3"><span className="text-[10px] font-mono text-muted-foreground">{rm.roomNo}</span></TableCell>
                                        <TableCell className="py-1 px-3"><span className="text-[10px] text-muted-foreground">{rm.roomTypeName}</span></TableCell>
                                        <TableCell className="py-1 px-3 text-center"><span className="text-[10px] text-muted-foreground">{rm.beds.length}B</span></TableCell>
                                        <TableCell className="py-1 px-3 text-center">
                                          <Badge className={cn("text-[8px] font-bold border-0 px-1.5 py-0", rm.isActive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]")}>{rm.isActive ? "Active" : "Inactive"}</Badge>
                                        </TableCell>
                                        <TableCell className="py-1 px-3 text-center">
                                          <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openAddBed(bld.id, fl.id, rm.id)} className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded text-[9px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 transition-colors"><Plus className="w-2.5 h-2.5" /> Bed</button>
                                            <button onClick={() => openEditRoom(bld.id, fl.id, rm)} className="h-5 w-5 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors"><Pencil className="w-2.5 h-2.5" /></button>
                                          </div>
                                        </TableCell>
                                      </TableRow>

                                      {/* Bed Rows */}
                                      {rmExpanded && rm.beds.map((bd) => (
                                        <TableRow key={bd.id} className="hover:bg-muted/5 border-b border-border/20">
                                          <TableCell className="py-0.5 px-3"><div className="pl-12" /></TableCell>
                                          <TableCell className="py-0.5 px-3">
                                            <div className="flex items-center gap-2 pl-12">
                                              <BedDouble className="w-2.5 h-2.5 text-[#F59E0B] shrink-0" />
                                              <span className="text-[10px] text-foreground">Bed {bd.bedNo}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-0.5 px-3"><span className="text-[9px] font-mono text-muted-foreground">{bd.bedCode}</span></TableCell>
                                          <TableCell className="py-0.5 px-3"><span className="text-[9px] text-muted-foreground">Bed</span></TableCell>
                                          <TableCell className="py-0.5 px-3" />
                                          <TableCell className="py-0.5 px-3 text-center">
                                            <span className={cn("text-[8px] font-bold", bd.isActive ? "text-[#10B981]" : "text-[#EF4444]")}>{bd.isActive ? "Active" : "Inactive"}</span>
                                          </TableCell>
                                          <TableCell className="py-0.5 px-3" />
                                        </TableRow>
                                      ))}
                                    </React.Fragment>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====================== DEPARTMENTS TAB ====================== */}
      {activeTab === "departments" && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1E293B] hover:bg-[#1E293B] [&>th]:h-9 [&>th]:py-0 [&>th]:text-[11px] [&>th]:text-white [&>th]:font-bold">
                    <TableHead className="w-8">#</TableHead>
                    <TableHead className="min-w-[150px]">Department</TableHead>
                    <TableHead className="min-w-[80px]">Code</TableHead>
                    <TableHead className="min-w-[300px]">Mapped Locations</TableHead>
                    <TableHead className="w-14 text-center">Status</TableHead>
                    <TableHead className="w-28 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facDepts.filter((d) => d.deptName.toLowerCase().includes(search.toLowerCase()) || d.deptCode.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">No departments found.</TableCell></TableRow>
                  ) : (
                    facDepts.filter((d) => d.deptName.toLowerCase().includes(search.toLowerCase()) || d.deptCode.toLowerCase().includes(search.toLowerCase())).map((dept, idx) => (
                      <TableRow key={dept.id} className="align-top border-b border-border hover:bg-muted/20">
                        <TableCell className="text-[11px] text-muted-foreground py-2.5 px-3 font-mono">{idx + 1}</TableCell>
                        <TableCell className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-foreground block">{dept.deptName}</span>
                              {dept.description && <span className="text-[10px] text-muted-foreground">{dept.description}</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3"><span className="text-[11px] font-mono text-muted-foreground">{dept.deptCode}</span></TableCell>
                        <TableCell className="py-2 px-3">
                          {dept.mappings.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground/50 italic">No locations mapped</span>
                          ) : (
                            <div className="space-y-1">
                              {dept.mappings.map((m) => (
                                <div key={m.id} className="flex items-center gap-1.5 group">
                                  <Link2 className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                                  <span className="text-[10px] text-foreground">{resolveBreadcrumb(m, organizations)}</span>
                                  {m.isPrimary && <Badge className="text-[7px] border-0 bg-[#00BCD4]/10 text-[#00BCD4] font-bold px-1 py-0 h-3">Primary</Badge>}
                                  <Badge className="text-[7px] border-0 bg-muted/50 text-muted-foreground font-mono px-1 py-0 h-3">{m.level}</Badge>
                                  <button onClick={() => removeMapping(dept.id, m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444] hover:text-[#DC2626]"><Trash2 className="w-2.5 h-2.5" /></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-center">
                          <Badge className={cn("text-[9px] font-bold border-0 px-2 py-0.5", dept.isActive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#EF4444]/10 text-[#EF4444]")}>{dept.isActive ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openAddMapping(dept.id)} className="inline-flex items-center gap-1 h-6 px-2 rounded text-[10px] font-bold text-[#3B82F6] bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 transition-colors" title="Map Location"><Link2 className="w-3 h-3" /> Map</button>
                            <button onClick={() => openEditDept(dept)} className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-[#10B981] hover:bg-[#10B981]/10 transition-colors" title="Edit"><Pencil className="w-3 h-3" /></button>
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
      )}

      {/* ====================== MODALS ====================== */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-background z-10">
              <h2 className="text-sm font-extrabold text-foreground">
                {modal.mode === "edit" ? "Edit" : "Add"}{" "}
                {modal.type === "building" ? "Building" : modal.type === "floor" ? "Floor" : modal.type === "room" ? "Room" : modal.type === "bed" ? "Bed" : modal.type === "department" ? "Department" : "Location Mapping"}
              </h2>
              <button onClick={resetModal} className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted/50"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              {formError && <div className="text-xs font-semibold text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-lg px-3 py-2">{formError}</div>}

              {/* Building Form */}
              {modal.type === "building" && (
                <>
                  <FormField label="Building Name" required hint="e.g. Main Tower, Block A, Diagnostic Block">
                    <Input className="h-9 text-xs" placeholder="e.g. Main Tower" value={bName} onChange={(e) => setBName(e.target.value)} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Building Code" hint="Short unique code">
                      <Input className="h-9 text-xs font-mono" placeholder="e.g. MT" value={bCode} onChange={(e) => setBCode(e.target.value)} />
                    </FormField>
                    <div className="flex items-end pb-1">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={bActive} onCheckedChange={(v) => setBActive(!!v)} id="bActive" />
                        <Label htmlFor="bActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
                      </div>
                    </div>
                  </div>
                  <FormField label="Description">
                    <Textarea className="text-xs min-h-[60px]" placeholder="Optional description" value={bDesc} onChange={(e) => setBDesc(e.target.value)} />
                  </FormField>
                </>
              )}

              {/* Floor Form */}
              {modal.type === "floor" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Floor Number" required hint="-1 for Basement, 0 for Ground, 1, 2...">
                      <Input className="h-9 text-xs font-mono" type="number" placeholder="e.g. 0" value={fNo} onChange={(e) => setFNo(e.target.value)} />
                    </FormField>
                    <FormField label="Floor Name" required hint="e.g. Ground Floor, 1st Floor">
                      <Input className="h-9 text-xs" placeholder="e.g. Ground Floor" value={fName} onChange={(e) => setFName(e.target.value)} />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={fActive} onCheckedChange={(v) => setFActive(!!v)} id="fActive" />
                    <Label htmlFor="fActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
                  </div>
                </>
              )}

              {/* Room Form */}
              {modal.type === "room" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Room Number" required hint="e.g. ICU-301, OT-501">
                      <Input className="h-9 text-xs font-mono" placeholder="e.g. ICU-301" value={rNo} onChange={(e) => setRNo(e.target.value)} />
                    </FormField>
                    <FormField label="Room Name" hint="e.g. Medical ICU">
                      <Input className="h-9 text-xs" placeholder="e.g. Medical ICU" value={rName} onChange={(e) => setRName(e.target.value)} />
                    </FormField>
                  </div>
                  <FormField label="Room Type" hint="Select the type of room">
                    <Select value={rType} onValueChange={setRType}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select room type" /></SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((rt) => (
                          <SelectItem key={rt.id} value={rt.id}>
                            <span className="font-semibold">{rt.name}</span>
                            <span className="text-muted-foreground ml-1 font-mono text-[10px]">{rt.code}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={rActive} onCheckedChange={(v) => setRActive(!!v)} id="rActive" />
                    <Label htmlFor="rActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
                  </div>
                </>
              )}

              {/* Bed Form */}
              {modal.type === "bed" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Bed Number" required hint="e.g. 1, 2, A, B">
                      <Input className="h-9 text-xs font-mono" placeholder="e.g. 1" value={bedNo} onChange={(e) => setBedNo(e.target.value)} />
                    </FormField>
                    <FormField label="Bed Code" hint="Optional global code">
                      <Input className="h-9 text-xs font-mono" placeholder="e.g. ICU-B1" value={bedCode} onChange={(e) => setBedCode(e.target.value)} />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={bedActive} onCheckedChange={(v) => setBedActive(!!v)} id="bedActive" />
                    <Label htmlFor="bedActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
                  </div>
                </>
              )}

              {/* Department Form */}
              {modal.type === "department" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Department Name" required hint="e.g. Emergency Medicine, Radiology">
                      <Input className="h-9 text-xs" placeholder="Department name" value={dName} onChange={(e) => setDName(e.target.value)} />
                    </FormField>
                    <FormField label="Department Code" hint="Short unique code">
                      <Input className="h-9 text-xs font-mono" placeholder="e.g. EM" value={dCode} onChange={(e) => setDCode(e.target.value)} />
                    </FormField>
                  </div>
                  <FormField label="Description">
                    <Textarea className="text-xs min-h-[60px]" placeholder="Optional description" value={dDesc} onChange={(e) => setDDesc(e.target.value)} />
                  </FormField>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={dActive} onCheckedChange={(v) => setDActive(!!v)} id="dActive" />
                    <Label htmlFor="dActive" className="text-xs font-semibold text-foreground cursor-pointer">Active</Label>
                  </div>

                  {/* Inline Location Mapping Section */}
                  <div className="mt-2 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#10B981]" /> Location Mapping
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Map this department to physical locations</p>
                      </div>
                    </div>

                    {/* Pending mappings list */}
                    {deptInlineMappings.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {deptInlineMappings.map((m) => (
                          <div key={m.id} className="flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/30 rounded-md px-2 py-1 text-[10px] font-medium text-foreground group">
                            {m.isPrimary && <span className="bg-[#F59E0B] text-white rounded px-1 py-0.5 text-[8px] font-bold mr-0.5">PRIMARY</span>}
                            <span className="text-[#10B981] font-mono">{m.level}</span>
                            <span className="text-muted-foreground mx-0.5">&middot;</span>
                            <span>{resolveBreadcrumb(m, organizations)}</span>
                            <button
                              type="button"
                              onClick={() => removeInlineMapping(m.id)}
                              className="ml-1 text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline mapping form row */}
                    <div className="space-y-3 bg-muted/30 rounded-lg border border-border p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Location Level" hint="Hierarchy level to map">
                          <Select value={inlineMapLevel} onValueChange={(v) => { setInlineMapLevel(v as typeof inlineMapLevel); setInlineMapBldId(""); setInlineMapFlId(""); setInlineMapRmId(""); setInlineMapBdId(""); }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BUILDING">Building</SelectItem>
                              <SelectItem value="FLOOR">Floor</SelectItem>
                              <SelectItem value="ROOM">Room</SelectItem>
                              <SelectItem value="BED">Bed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                        <FormField label="Building">
                          <Select value={inlineMapBldId} onValueChange={(v) => { setInlineMapBldId(v); setInlineMapFlId(""); setInlineMapRmId(""); setInlineMapBdId(""); }}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select building" /></SelectTrigger>
                            <SelectContent>
                              {inlineBlds.map((b) => <SelectItem key={b.id} value={b.id}>{b.buildingName} <span className="text-muted-foreground font-mono text-[10px] ml-1">{b.buildingCode}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>
                      </div>

                      {(inlineMapLevel === "FLOOR" || inlineMapLevel === "ROOM" || inlineMapLevel === "BED") && inlineMapBldId && (
                        <div className="grid grid-cols-2 gap-3">
                          <FormField label="Floor">
                            <Select value={inlineMapFlId} onValueChange={(v) => { setInlineMapFlId(v); setInlineMapRmId(""); setInlineMapBdId(""); }}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select floor" /></SelectTrigger>
                              <SelectContent>
                                {inlineFls.map((f) => <SelectItem key={f.id} value={f.id}>{f.floorName}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormField>
                          {(inlineMapLevel === "ROOM" || inlineMapLevel === "BED") && inlineMapFlId && (
                            <FormField label="Room">
                              <Select value={inlineMapRmId} onValueChange={(v) => { setInlineMapRmId(v); setInlineMapBdId(""); }}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select room" /></SelectTrigger>
                                <SelectContent>
                                  {inlineRms.map((r) => <SelectItem key={r.id} value={r.id}>{r.roomNo} - {r.roomName}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </FormField>
                          )}
                        </div>
                      )}

                      {inlineMapLevel === "BED" && inlineMapRmId && (
                        <FormField label="Bed">
                          <Select value={inlineMapBdId} onValueChange={setInlineMapBdId}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select bed" /></SelectTrigger>
                            <SelectContent>
                              {inlineBds.map((b) => <SelectItem key={b.id} value={b.id}>Bed {b.bedNo} {b.bedCode ? `(${b.bedCode})` : ""}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormField>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={inlineMapPrimary} onCheckedChange={(v) => setInlineMapPrimary(!!v)} id="inlineMapPrimary" />
                          <Label htmlFor="inlineMapPrimary" className="text-[10px] font-semibold text-foreground cursor-pointer">Primary Location</Label>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] font-bold gap-1 border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/10"
                          onClick={addInlineMapping}
                          disabled={!(inlineMapLevel === "BUILDING" ? inlineMapBldId : inlineMapLevel === "FLOOR" ? inlineMapFlId : inlineMapLevel === "ROOM" ? inlineMapRmId : inlineMapBdId)}
                        >
                          <Plus className="w-3 h-3" /> Add Mapping
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Department Location Mapping Form */}
              {modal.type === "deptMap" && (
                <>
                  <FormField label="Location Level" required hint="Select the hierarchy level to map">
                    <Select value={mapLevel} onValueChange={(v) => { setMapLevel(v as typeof mapLevel); setMapBuildingId(""); setMapFloorId(""); setMapRoomId(""); setMapBedId(""); }}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUILDING">Building</SelectItem>
                        <SelectItem value="FLOOR">Floor</SelectItem>
                        <SelectItem value="ROOM">Room</SelectItem>
                        <SelectItem value="BED">Bed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Building selector (always shown) */}
                  <FormField label="Building" required>
                    <Select value={mapBuildingId} onValueChange={(v) => { setMapBuildingId(v); setMapFloorId(""); setMapRoomId(""); setMapBedId(""); }}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select building" /></SelectTrigger>
                      <SelectContent>
                        {mapBuildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.buildingName} <span className="text-muted-foreground font-mono text-[10px] ml-1">{b.buildingCode}</span></SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Floor selector */}
                  {(mapLevel === "FLOOR" || mapLevel === "ROOM" || mapLevel === "BED") && mapBuildingId && (
                    <FormField label="Floor" required>
                      <Select value={mapFloorId} onValueChange={(v) => { setMapFloorId(v); setMapRoomId(""); setMapBedId(""); }}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select floor" /></SelectTrigger>
                        <SelectContent>
                          {mapFloors.map((f) => <SelectItem key={f.id} value={f.id}>{f.floorName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {/* Room selector */}
                  {(mapLevel === "ROOM" || mapLevel === "BED") && mapFloorId && (
                    <FormField label="Room" required>
                      <Select value={mapRoomId} onValueChange={(v) => { setMapRoomId(v); setMapBedId(""); }}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select room" /></SelectTrigger>
                        <SelectContent>
                          {mapRooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.roomNo} - {r.roomName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  {/* Bed selector */}
                  {mapLevel === "BED" && mapRoomId && (
                    <FormField label="Bed" required>
                      <Select value={mapBedId} onValueChange={setMapBedId}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select bed" /></SelectTrigger>
                        <SelectContent>
                          {mapBeds.map((b) => <SelectItem key={b.id} value={b.id}>Bed {b.bedNo} {b.bedCode ? `(${b.bedCode})` : ""}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )}

                  <div className="flex items-center gap-2">
                    <Checkbox checked={mapPrimary} onCheckedChange={(v) => setMapPrimary(!!v)} id="mapPrimary" />
                    <Label htmlFor="mapPrimary" className="text-xs font-semibold text-foreground cursor-pointer">Primary Location</Label>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border sticky bottom-0 bg-background">
              <Button variant="outline" size="sm" onClick={resetModal} className="h-8 text-xs font-bold">Cancel</Button>
              <Button
                size="sm"
                onClick={() => {
                  if (modal.type === "building") saveBuilding();
                  else if (modal.type === "floor") saveFloor();
                  else if (modal.type === "room") saveRoom();
                  else if (modal.type === "bed") saveBed();
                  else if (modal.type === "department") saveDept();
                  else if (modal.type === "deptMap") saveMapping();
                }}
                className={cn(
                  "h-8 text-xs font-bold text-white gap-1.5",
                  modal.type === "department" || modal.type === "deptMap" ? "bg-[#10B981] hover:bg-[#059669]" : "bg-[#00BCD4] hover:bg-[#00838F]",
                )}
              >
                <Save className="w-3 h-3" /> {modal.mode === "edit" ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
