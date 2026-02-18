"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Checkbox } from "@/src/components/ui/checkbox";
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
  ArrowLeft,
  Save,
  Send,
  Building,
  Globe,
  Phone,
  Mail,
  User,
  MapPin,
  ShieldCheck,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  FolderOpen,
} from "lucide-react";

// ----- Types -----
interface Vendor {
  id: string;
  vendorType: "Local" | "International";
  country: string;
  hospital: string;
  department: string;
  vendorName: string;
  legalName: string;
  website: string;
  companyPhone: string;
  companyMobile: string;
  companyEmail: string;
  fax: string;
  poc1Name: string;
  poc1Mobile: string;
  poc1Email: string;
  poc2Name: string;
  poc2Mobile: string;
  poc2Email: string;
  contactDetails: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  tradeLicenseNo: string;
  tradeLicenseIssue: string;
  tradeLicenseExpiry: string;
  vatTrn: string;
  vatCertNo: string;
  vatCertIssue: string;
  vatCertExpiry: string;
  isActive: boolean;
  notes: string;
  status: "Active" | "Inactive" | "Pending";
  createdAt: string;
}

// ----- Mock Data -----
const mockVendors: Vendor[] = [
  {
    id: "VND-001",
    vendorType: "Local",
    country: "UAE",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical Engineering",
    vendorName: "MedEquip Solutions LLC",
    legalName: "MedEquip Solutions LLC",
    website: "www.medequip.ae",
    companyPhone: "+971-4-3456789",
    companyMobile: "+971-50-1234567",
    companyEmail: "info@medequip.ae",
    fax: "+971-4-3456780",
    poc1Name: "Ahmed Al Rashid",
    poc1Mobile: "+971-50-1111111",
    poc1Email: "ahmed@medequip.ae",
    poc2Name: "Sara Khan",
    poc2Mobile: "+971-50-2222222",
    poc2Email: "sara@medequip.ae",
    contactDetails: "Available 9AM-6PM, Sun-Thu",
    address1: "Office 501, Business Bay Tower",
    address2: "Al Abraj Street",
    city: "Dubai",
    state: "Dubai",
    postalCode: "123456",
    tradeLicenseNo: "TL-2024-78901",
    tradeLicenseIssue: "2024-01-15",
    tradeLicenseExpiry: "2026-01-14",
    vatTrn: "100234567890003",
    vatCertNo: "VAT-2024-001",
    vatCertIssue: "2024-02-01",
    vatCertExpiry: "2026-01-31",
    isActive: true,
    notes: "Preferred vendor for patient monitors and ventilators",
    status: "Active",
    createdAt: "2024-01-20",
  },
  {
    id: "VND-002",
    vendorType: "International",
    country: "Germany",
    hospital: "Apollo Hospital - Delhi",
    department: "Biomedical Engineering",
    vendorName: "Siemens Healthineers AG",
    legalName: "Siemens Healthineers AG",
    website: "www.siemens-healthineers.com",
    companyPhone: "+49-9131-840",
    companyMobile: "+49-170-1234567",
    companyEmail: "orders@siemens-healthineers.com",
    fax: "+49-9131-841",
    poc1Name: "Dr. Klaus Weber",
    poc1Mobile: "+49-170-3333333",
    poc1Email: "klaus.weber@siemens.com",
    poc2Name: "Maria Schmidt",
    poc2Mobile: "+49-170-4444444",
    poc2Email: "maria.schmidt@siemens.com",
    contactDetails: "Contact via regional office",
    address1: "Henkestrasse 127",
    address2: "",
    city: "Erlangen",
    state: "Bavaria",
    postalCode: "91052",
    tradeLicenseNo: "DE-HRB-12345",
    tradeLicenseIssue: "2020-06-01",
    tradeLicenseExpiry: "2030-05-31",
    vatTrn: "DE123456789",
    vatCertNo: "",
    vatCertIssue: "",
    vatCertExpiry: "",
    isActive: true,
    notes:
      "OEM for MRI and CT scanners. Annual maintenance contract available.",
    status: "Active",
    createdAt: "2023-06-15",
  },
  {
    id: "VND-003",
    vendorType: "Local",
    country: "UAE",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical Engineering",
    vendorName: "Gulf Medical Supplies",
    legalName: "Gulf Medical Supplies Trading LLC",
    website: "www.gulfmedsupplies.ae",
    companyPhone: "+971-4-2345678",
    companyMobile: "+971-55-9876543",
    companyEmail: "sales@gulfmedsupplies.ae",
    fax: "",
    poc1Name: "Rashid Hamdan",
    poc1Mobile: "+971-55-5555555",
    poc1Email: "rashid@gulfmedsupplies.ae",
    poc2Name: "",
    poc2Mobile: "",
    poc2Email: "",
    contactDetails: "",
    address1: "Warehouse 12, Jebel Ali Free Zone",
    address2: "",
    city: "Dubai",
    state: "Dubai",
    postalCode: "262345",
    tradeLicenseNo: "TL-2023-45678",
    tradeLicenseIssue: "2023-03-10",
    tradeLicenseExpiry: "2025-03-09",
    vatTrn: "100987654321003",
    vatCertNo: "VAT-2023-045",
    vatCertIssue: "2023-04-01",
    vatCertExpiry: "2025-03-31",
    isActive: true,
    notes: "Biomedical consumables and disposables",
    status: "Active",
    createdAt: "2023-04-01",
  },
  {
    id: "VND-004",
    vendorType: "International",
    country: "USA",
    hospital: "Apollo Hospital - Bangalore",
    department: "Radiology",
    vendorName: "GE HealthCare Technologies",
    legalName: "GE HealthCare Technologies Inc.",
    website: "www.gehealthcare.com",
    companyPhone: "+1-262-544-3011",
    companyMobile: "+1-312-5551234",
    companyEmail: "orders@gehealthcare.com",
    fax: "+1-262-544-3000",
    poc1Name: "John Miller",
    poc1Mobile: "+1-312-5556666",
    poc1Email: "john.miller@ge.com",
    poc2Name: "Emily Davis",
    poc2Mobile: "+1-312-5557777",
    poc2Email: "emily.davis@ge.com",
    contactDetails: "US HQ - Central time zone",
    address1: "500 W Monroe Street",
    address2: "Suite 4200",
    city: "Chicago",
    state: "Illinois",
    postalCode: "60661",
    tradeLicenseNo: "US-EIN-36-2345678",
    tradeLicenseIssue: "2019-01-01",
    tradeLicenseExpiry: "2029-12-31",
    vatTrn: "",
    vatCertNo: "",
    vatCertIssue: "",
    vatCertExpiry: "",
    isActive: true,
    notes: "OEM for ultrasound, anesthesia machines, patient monitors",
    status: "Active",
    createdAt: "2023-01-10",
  },
  {
    id: "VND-005",
    vendorType: "Local",
    country: "India",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical Engineering",
    vendorName: "BPL Medical Technologies",
    legalName: "BPL Medical Technologies Pvt Ltd",
    website: "www.bplmedicaltechnologies.com",
    companyPhone: "+91-80-26729500",
    companyMobile: "+91-98451-23456",
    companyEmail: "sales@bplmed.com",
    fax: "+91-80-26729510",
    poc1Name: "Suresh Reddy",
    poc1Mobile: "+91-98451-78900",
    poc1Email: "suresh@bplmed.com",
    poc2Name: "Kavitha Nair",
    poc2Mobile: "+91-98451-34567",
    poc2Email: "kavitha@bplmed.com",
    contactDetails: "Bangalore HQ office",
    address1: "11th KM, Bannerghatta Road",
    address2: "Arakere",
    city: "Bangalore",
    state: "Karnataka",
    postalCode: "560076",
    tradeLicenseNo: "KA-CIN-U33112KA",
    tradeLicenseIssue: "2018-04-01",
    tradeLicenseExpiry: "2028-03-31",
    vatTrn: "29AABCB1234F1Z5",
    vatCertNo: "GST-KA-2023-789",
    vatCertIssue: "2023-04-01",
    vatCertExpiry: "2025-03-31",
    isActive: true,
    notes: "Indian OEM - defibrillators, patient monitors, ECG machines",
    status: "Active",
    createdAt: "2023-05-20",
  },
  {
    id: "VND-006",
    vendorType: "International",
    country: "Japan",
    hospital: "Apollo Hospital - Delhi",
    department: "Biomedical Engineering",
    vendorName: "Nihon Kohden Corporation",
    legalName: "Nihon Kohden Corporation",
    website: "www.nihonkohden.com",
    companyPhone: "+81-3-5996-8000",
    companyMobile: "+81-90-1234-5678",
    companyEmail: "intl-sales@nihonkohden.co.jp",
    fax: "+81-3-5996-8010",
    poc1Name: "Takeshi Yamamoto",
    poc1Mobile: "+81-90-8888-9999",
    poc1Email: "t.yamamoto@nihonkohden.co.jp",
    poc2Name: "",
    poc2Mobile: "",
    poc2Email: "",
    contactDetails: "Tokyo HQ, contact via regional distributor",
    address1: "1-31-4 Nishiochiai",
    address2: "Shinjuku-ku",
    city: "Tokyo",
    state: "Tokyo",
    postalCode: "161-8560",
    tradeLicenseNo: "JP-REG-NK-001",
    tradeLicenseIssue: "2015-01-01",
    tradeLicenseExpiry: "2030-12-31",
    vatTrn: "",
    vatCertNo: "",
    vatCertIssue: "",
    vatCertExpiry: "",
    isActive: true,
    notes: "EEG, EMG, patient monitoring systems. Premium quality.",
    status: "Active",
    createdAt: "2023-08-01",
  },
  {
    id: "VND-007",
    vendorType: "Local",
    country: "UAE",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical Engineering",
    vendorName: "Al Futtaim Health",
    legalName: "Al Futtaim Health Division LLC",
    website: "www.alfuttaimhealth.ae",
    companyPhone: "+971-4-2020202",
    companyMobile: "+971-56-7890123",
    companyEmail: "health@alfuttaim.ae",
    fax: "",
    poc1Name: "Mohammed Al Futtaim",
    poc1Mobile: "+971-56-1010101",
    poc1Email: "mohammed@alfuttaimhealth.ae",
    poc2Name: "Fatima Hassan",
    poc2Mobile: "+971-56-2020202",
    poc2Email: "fatima@alfuttaimhealth.ae",
    contactDetails: "",
    address1: "Dubai Festival City",
    address2: "P.O. Box 152",
    city: "Dubai",
    state: "Dubai",
    postalCode: "00152",
    tradeLicenseNo: "TL-2022-99887",
    tradeLicenseIssue: "2022-07-01",
    tradeLicenseExpiry: "2024-06-30",
    vatTrn: "100555666777003",
    vatCertNo: "VAT-2022-567",
    vatCertIssue: "2022-08-01",
    vatCertExpiry: "2024-07-31",
    isActive: false,
    notes: "Trade license expired. Renewal pending.",
    status: "Inactive",
    createdAt: "2022-07-15",
  },
  {
    id: "VND-008",
    vendorType: "International",
    country: "Netherlands",
    hospital: "Apollo Hospital - Bangalore",
    department: "Biomedical Engineering",
    vendorName: "Philips Medical Systems",
    legalName: "Koninklijke Philips N.V.",
    website: "www.philips.com/healthcare",
    companyPhone: "+31-40-2788888",
    companyMobile: "+31-6-12345678",
    companyEmail: "healthcare.orders@philips.com",
    fax: "+31-40-2788889",
    poc1Name: "Jan de Vries",
    poc1Mobile: "+31-6-44445555",
    poc1Email: "jan.devries@philips.com",
    poc2Name: "Anna Bakker",
    poc2Mobile: "+31-6-66667777",
    poc2Email: "anna.bakker@philips.com",
    contactDetails: "Eindhoven HQ, EMEA sales",
    address1: "High Tech Campus 5",
    address2: "",
    city: "Eindhoven",
    state: "North Brabant",
    postalCode: "5656 AE",
    tradeLicenseNo: "NL-KVK-17085670",
    tradeLicenseIssue: "2010-01-01",
    tradeLicenseExpiry: "2030-12-31",
    vatTrn: "NL002456789B01",
    vatCertNo: "",
    vatCertIssue: "",
    vatCertExpiry: "",
    isActive: true,
    notes:
      "OEM - patient monitors, ultrasound, defibrillators, imaging systems",
    status: "Active",
    createdAt: "2022-03-10",
  },
  {
    id: "VND-009",
    vendorType: "Local",
    country: "India",
    hospital: "Apollo Hospital - Delhi",
    department: "Biomedical Engineering",
    vendorName: "Trivitron Healthcare",
    legalName: "Trivitron Healthcare Pvt Ltd",
    website: "www.trivitron.com",
    companyPhone: "+91-44-42091500",
    companyMobile: "+91-98840-56789",
    companyEmail: "info@trivitron.com",
    fax: "+91-44-42091501",
    poc1Name: "Ravi Chandran",
    poc1Mobile: "+91-98840-11111",
    poc1Email: "ravi@trivitron.com",
    poc2Name: "Deepa Mohan",
    poc2Mobile: "+91-98840-22222",
    poc2Email: "deepa@trivitron.com",
    contactDetails: "Chennai HQ, pan-India service network",
    address1: "6th Floor, TIDEL Park",
    address2: "Taramani",
    city: "Chennai",
    state: "Tamil Nadu",
    postalCode: "600113",
    tradeLicenseNo: "TN-CIN-U85100TN",
    tradeLicenseIssue: "2019-07-01",
    tradeLicenseExpiry: "2029-06-30",
    vatTrn: "33AABCT5678K1ZP",
    vatCertNo: "GST-TN-2023-456",
    vatCertIssue: "2023-07-01",
    vatCertExpiry: "2025-06-30",
    isActive: true,
    notes: "Lab equipment, radiology, imaging devices",
    status: "Active",
    createdAt: "2023-09-12",
  },
  {
    id: "VND-010",
    vendorType: "Local",
    country: "UAE",
    hospital: "Apollo Hospital - Chennai",
    department: "Maintenance",
    vendorName: "ProServ Technical Services",
    legalName: "ProServ Technical Services LLC",
    website: "www.proservuae.com",
    companyPhone: "+971-4-3311122",
    companyMobile: "+971-52-9998877",
    companyEmail: "service@proservuae.com",
    fax: "",
    poc1Name: "Imran Malik",
    poc1Mobile: "+971-52-1112233",
    poc1Email: "imran@proservuae.com",
    poc2Name: "",
    poc2Mobile: "",
    poc2Email: "",
    contactDetails: "Third party maintenance service provider",
    address1: "Unit 8, Techno Hub",
    address2: "Dubai Silicon Oasis",
    city: "Dubai",
    state: "Dubai",
    postalCode: "341234",
    tradeLicenseNo: "TL-2024-11223",
    tradeLicenseIssue: "2024-05-01",
    tradeLicenseExpiry: "2026-04-30",
    vatTrn: "100111222333003",
    vatCertNo: "VAT-2024-112",
    vatCertIssue: "2024-06-01",
    vatCertExpiry: "2026-05-31",
    isActive: true,
    notes: "Biomedical equipment repair, calibration, PPM services",
    status: "Pending",
    createdAt: "2024-05-10",
  },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  Active: { bg: "bg-[#10B981]/10", text: "text-[#10B981]" },
  Inactive: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]" },
  Pending: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]" },
};

const countryList = [
  "UAE",
  "India",
  "USA",
  "Germany",
  "Japan",
  "Netherlands",
  "UK",
  "France",
  "South Korea",
  "China",
  "Singapore",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Bahrain",
];

// ----- Document categories (matching asset registration pattern) -----
const vendorDocCategories = [
  {
    name: "Trade License",
    desc: "Valid trade license / commercial registration certificate",
    formats: "PDF, JPG",
  },
  {
    name: "VAT Certificate",
    desc: "VAT / TRN registration certificate",
    formats: "PDF",
  },
  {
    name: "Company Profile",
    desc: "Company profile, brochure, or capability statement",
    formats: "PDF, DOC",
  },
  {
    name: "Authorization Letter",
    desc: "OEM authorization / distributor appointment letter",
    formats: "PDF",
  },
  {
    name: "Insurance Certificate",
    desc: "Liability insurance or indemnity certificate",
    formats: "PDF",
  },
];

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
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="text-[11px] font-bold text-foreground">
        {label}
        {required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ==================== LIST VIEW ====================
function VendorListView({
  vendors,
  onAdd,
  onView,
}: {
  vendors: Vendor[];
  onAdd: () => void;
  onView: (v: Vendor) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const filtered = vendors.filter((v) => {
    const matchSearch =
      !searchQuery ||
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.companyEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || v.status === filterStatus;
    const matchType = filterType === "all" || v.vendorType === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const activeCount = vendors.filter((v) => v.status === "Active").length;
  const pendingCount = vendors.filter((v) => v.status === "Pending").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Vendor Registration
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage biomedical equipment vendors, suppliers, and service
            providers
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7] text-[#D97706] text-xs font-bold">
              <Clock className="w-3.5 h-3.5" /> {pendingCount} pending
            </div>
          )}
          <Button
            className="text-white border-0 text-xs font-semibold px-4 h-8"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onAdd}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register Vendor
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Vendors",
            value: vendors.length,
            icon: Building,
            color: "#00BCD4",
          },
          {
            label: "Active",
            value: activeCount,
            icon: CheckCircle2,
            color: "#10B981",
          },
          {
            label: "Local",
            value: vendors.filter((v) => v.vendorType === "Local").length,
            icon: MapPin,
            color: "#8B5CF6",
          },
          {
            label: "International",
            value: vendors.filter((v) => v.vendorType === "International")
              .length,
            icon: Globe,
            color: "#F59E0B",
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
            placeholder="Search vendor name, ID, email, city..."
            className="pl-9 h-8 bg-card border-border text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-[130px] bg-card text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-8 w-[150px] bg-card text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Local">Local</SelectItem>
            <SelectItem value="International">International</SelectItem>
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
                    Vendor ID
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Vendor Name
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Type
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    City / Country
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Contact Person
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Mobile
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Email
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Trade License Exp.
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
                      No vendors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((v) => {
                    const sc = statusConfig[v.status];
                    const isExpired =
                      v.tradeLicenseExpiry &&
                      new Date(v.tradeLicenseExpiry) < new Date();
                    return (
                      <TableRow
                        key={v.id}
                        className="h-8 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono font-bold text-[#00BCD4] text-xs py-0.5 px-2">
                          {v.id}
                        </TableCell>
                        <TableCell className="py-0.5 px-2">
                          <span className="text-xs font-semibold text-foreground">
                            {v.vendorName}
                          </span>
                        </TableCell>
                        <TableCell className="py-0.5 px-2">
                          <Badge
                            className={cn(
                              "text-[9px] font-bold border-0 px-1.5 py-0",
                              v.vendorType === "Local"
                                ? "bg-[#8B5CF6]/10 text-[#8B5CF6]"
                                : "bg-[#F59E0B]/10 text-[#F59E0B]",
                            )}
                          >
                            {v.vendorType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-0.5 px-2">
                          {v.city}, {v.country}
                        </TableCell>
                        <TableCell className="text-xs text-foreground py-0.5 px-2">
                          {v.poc1Name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-0.5 px-2">
                          {v.companyMobile}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground py-0.5 px-2 truncate max-w-[140px]">
                          {v.companyEmail}
                        </TableCell>
                        <TableCell className="py-0.5 px-2">
                          <span
                            className={cn(
                              "text-xs",
                              isExpired
                                ? "text-[#EF4444] font-bold"
                                : "text-muted-foreground",
                            )}
                          >
                            {v.tradeLicenseExpiry || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center py-0.5 px-2">
                          <Badge
                            className={cn(
                              "text-[9px] font-bold border-0 px-1.5 py-0",
                              sc.bg,
                              sc.text,
                            )}
                          >
                            {v.status}
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
                              <DropdownMenuItem onClick={() => onView(v)}>
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

// ==================== FORM VIEW ====================
function VendorForm({
  onBack,
  editVendor,
}: {
  onBack: () => void;
  editVendor?: Vendor | null;
}) {
  const isEdit = !!editVendor;

  // A) Vendor Setup
  const [vendorType, setVendorType] = useState(editVendor?.vendorType || "");
  const [country, setCountry] = useState(editVendor?.country || "");
  const [hospital, setHospital] = useState(editVendor?.hospital || "");
  const [department, setDepartment] = useState(editVendor?.department || "");

  // B) Vendor Identity
  const [vendorName, setVendorName] = useState(editVendor?.vendorName || "");
  const [legalName, setLegalName] = useState(editVendor?.legalName || "");
  const [website, setWebsite] = useState(editVendor?.website || "");

  // C) Company Contact
  const [companyPhone, setCompanyPhone] = useState(
    editVendor?.companyPhone || "",
  );
  const [companyMobile, setCompanyMobile] = useState(
    editVendor?.companyMobile || "",
  );
  const [companyEmail, setCompanyEmail] = useState(
    editVendor?.companyEmail || "",
  );
  const [fax, setFax] = useState(editVendor?.fax || "");

  // D) Contact Persons
  const [poc1Name, setPoc1Name] = useState(editVendor?.poc1Name || "");
  const [poc1Mobile, setPoc1Mobile] = useState(editVendor?.poc1Mobile || "");
  const [poc1Email, setPoc1Email] = useState(editVendor?.poc1Email || "");
  const [poc2Name, setPoc2Name] = useState(editVendor?.poc2Name || "");
  const [poc2Mobile, setPoc2Mobile] = useState(editVendor?.poc2Mobile || "");
  const [poc2Email, setPoc2Email] = useState(editVendor?.poc2Email || "");
  const [contactDetails, setContactDetails] = useState(
    editVendor?.contactDetails || "",
  );

  // E) Address
  const [address1, setAddress1] = useState(editVendor?.address1 || "");
  const [address2, setAddress2] = useState(editVendor?.address2 || "");
  const [city, setCity] = useState(editVendor?.city || "");
  const [state, setState] = useState(editVendor?.state || "");
  const [postalCode, setPostalCode] = useState(editVendor?.postalCode || "");

  // F) Compliance
  const [tradeLicenseNo, setTradeLicenseNo] = useState(
    editVendor?.tradeLicenseNo || "",
  );
  const [tradeLicenseIssue, setTradeLicenseIssue] = useState(
    editVendor?.tradeLicenseIssue || "",
  );
  const [tradeLicenseExpiry, setTradeLicenseExpiry] = useState(
    editVendor?.tradeLicenseExpiry || "",
  );
  const [vatTrn, setVatTrn] = useState(editVendor?.vatTrn || "");
  const [vatCertNo, setVatCertNo] = useState(editVendor?.vatCertNo || "");
  const [vatCertIssue, setVatCertIssue] = useState(
    editVendor?.vatCertIssue || "",
  );
  const [vatCertExpiry, setVatCertExpiry] = useState(
    editVendor?.vatCertExpiry || "",
  );
  const [isActive, setIsActive] = useState(editVendor?.isActive ?? true);

  // G) Notes
  const [notes, setNotes] = useState(editVendor?.notes || "");

  // H) Documents (asset-registration pattern)
  const [docCategories, setDocCategories] = useState(vendorDocCategories);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(
    {},
  );
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [newDocCatName, setNewDocCatName] = useState("");
  const [newDocCatDesc, setNewDocCatDesc] = useState("");
  const [newDocCatFormats, setNewDocCatFormats] = useState("PDF, DOC");

  const handleSimulateUpload = (catName: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [catName]: [
        ...(prev[catName] || []),
        `${catName.replace(/\s+/g, "_")}_${Date.now()}.pdf`,
      ],
    }));
  };

  const handleAddDocCategory = () => {
    if (!newDocCatName.trim()) return;
    setDocCategories((prev) => [
      ...prev,
      {
        name: newDocCatName.trim(),
        desc: newDocCatDesc.trim() || "Custom document category",
        formats: newDocCatFormats.trim() || "PDF, DOC",
      },
    ]);
    setNewDocCatName("");
    setNewDocCatDesc("");
    setNewDocCatFormats("PDF, DOC");
    setShowAddDocForm(false);
  };

  const handleRemoveDocCategory = (catName: string) => {
    setDocCategories((prev) => prev.filter((c) => c.name !== catName));
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
            {isEdit ? `Vendor: ${editVendor.id}` : "Register Vendor"}
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {isEdit
              ? `${editVendor.vendorName} - ${editVendor.status}`
              : "Add a new biomedical vendor / supplier"}
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
            <Send className="w-3.5 h-3.5 mr-1" /> Submit
          </Button>
        </div>
      </div>

      {/* A) Vendor Setup */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Vendor Setup
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField label="Vendor Type" required>
              <Select value={vendorType} onValueChange={setVendorType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">Local</SelectItem>
                  <SelectItem value="International">International</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {vendorType === "International" && (
              <FormField label="Country" required>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            )}
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
            <FormField label="Department">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biomedical Engineering">
                    Biomedical Engineering
                  </SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Procurement">Procurement</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Vendor ID">
              <Input
                className="h-8 text-xs bg-muted/30 font-mono font-semibold"
                placeholder="Auto-generated"
                readOnly
                value={isEdit ? editVendor.id : "VND-XXX"}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* B) Vendor Identity */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Vendor Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField label="Vendor Name" required>
              <Input
                className="h-8 text-xs"
                placeholder="Vendor / company name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
              />
            </FormField>
            <FormField label="Legal / Registered Name">
              <Input
                className="h-8 text-xs"
                placeholder="Official registered name"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </FormField>
            <FormField label="Website">
              <Input
                className="h-8 text-xs"
                placeholder="www.example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* C) Company Contact */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Company Contact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FormField label="Company Phone (Landline)">
              <Input
                className="h-8 text-xs"
                placeholder="+971-4-XXXXXXX"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </FormField>
            <FormField label="Company Mobile" required>
              <Input
                className="h-8 text-xs"
                placeholder="+971-5X-XXXXXXX"
                value={companyMobile}
                onChange={(e) => setCompanyMobile(e.target.value)}
              />
            </FormField>
            <FormField label="Company Email" required>
              <Input
                type="email"
                className="h-8 text-xs"
                placeholder="info@company.com"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
              />
            </FormField>
            <FormField label="Fax">
              <Input
                className="h-8 text-xs"
                placeholder="Fax number"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* D) Contact Persons */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Contact Persons
          </h3>
          {/* POC 1 */}
          <div className="mb-3">
            <p className="text-[11px] font-bold text-[#00BCD4] mb-2">
              Point of Contact 1 (Primary)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField label="Name" required>
                <Input
                  className="h-8 text-xs"
                  placeholder="Full name"
                  value={poc1Name}
                  onChange={(e) => setPoc1Name(e.target.value)}
                />
              </FormField>
              <FormField label="Mobile" required>
                <Input
                  className="h-8 text-xs"
                  placeholder="Mobile number"
                  value={poc1Mobile}
                  onChange={(e) => setPoc1Mobile(e.target.value)}
                />
              </FormField>
              <FormField label="Email" required>
                <Input
                  type="email"
                  className="h-8 text-xs"
                  placeholder="Email address"
                  value={poc1Email}
                  onChange={(e) => setPoc1Email(e.target.value)}
                />
              </FormField>
            </div>
          </div>
          {/* POC 2 */}
          <div className="mb-3">
            <p className="text-[11px] font-bold text-muted-foreground mb-2">
              Point of Contact 2 (Optional)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField label="Name">
                <Input
                  className="h-8 text-xs"
                  placeholder="Full name"
                  value={poc2Name}
                  onChange={(e) => setPoc2Name(e.target.value)}
                />
              </FormField>
              <FormField label="Mobile">
                <Input
                  className="h-8 text-xs"
                  placeholder="Mobile number"
                  value={poc2Mobile}
                  onChange={(e) => setPoc2Mobile(e.target.value)}
                />
              </FormField>
              <FormField label="Email">
                <Input
                  type="email"
                  className="h-8 text-xs"
                  placeholder="Email address"
                  value={poc2Email}
                  onChange={(e) => setPoc2Email(e.target.value)}
                />
              </FormField>
            </div>
          </div>
          <FormField label="Additional Contact Details">
            <Textarea
              className="min-h-[50px] text-xs"
              placeholder="Any additional contact notes, availability, timezone..."
              value={contactDetails}
              onChange={(e) => setContactDetails(e.target.value)}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* E) Address */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Address
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <FormField label="Address Line 1" className="md:col-span-2">
              <Input
                className="h-8 text-xs"
                placeholder="Street, building, office"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </FormField>
            <FormField label="Address Line 2">
              <Input
                className="h-8 text-xs"
                placeholder="Area, landmark"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </FormField>
            <FormField label="City">
              <Input
                className="h-8 text-xs"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </FormField>
            <FormField label="State / Province / Emirate">
              <Input
                className="h-8 text-xs"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </FormField>
            <FormField label="Postal Code / PO Box">
              <Input
                className="h-8 text-xs"
                placeholder="Postal code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* F) Compliance */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Compliance
          </h3>
          {/* Trade License */}
          <div className="mb-3">
            <p className="text-[11px] font-bold text-[#00BCD4] mb-2">
              Trade License
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <FormField label="Trade License No" required>
                <Input
                  className="h-8 text-xs"
                  placeholder="License number"
                  value={tradeLicenseNo}
                  onChange={(e) => setTradeLicenseNo(e.target.value)}
                />
              </FormField>
              <FormField label="Issue Date" required>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={tradeLicenseIssue}
                  onChange={(e) => setTradeLicenseIssue(e.target.value)}
                />
              </FormField>
              <FormField label="Expiry Date" required>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={tradeLicenseExpiry}
                  onChange={(e) => setTradeLicenseExpiry(e.target.value)}
                />
              </FormField>
            </div>
          </div>
          {/* VAT */}
          <div className="mb-3">
            <p className="text-[11px] font-bold text-muted-foreground mb-2">
              VAT / Tax Registration (Optional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormField label="VAT / TRN Number">
                <Input
                  className="h-8 text-xs"
                  placeholder="VAT / TRN"
                  value={vatTrn}
                  onChange={(e) => setVatTrn(e.target.value)}
                />
              </FormField>
              <FormField label="VAT Certificate No">
                <Input
                  className="h-8 text-xs"
                  placeholder="Certificate no"
                  value={vatCertNo}
                  onChange={(e) => setVatCertNo(e.target.value)}
                />
              </FormField>
              <FormField label="Issue Date">
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={vatCertIssue}
                  onChange={(e) => setVatCertIssue(e.target.value)}
                />
              </FormField>
              <FormField label="Expiry Date">
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={vatCertExpiry}
                  onChange={(e) => setVatCertExpiry(e.target.value)}
                />
              </FormField>
            </div>
          </div>
          {/* Is Active */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isActive}
              onCheckedChange={(v) => setIsActive(!!v)}
            />
            <Label className="text-xs font-semibold text-foreground cursor-pointer">
              Vendor is Active
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* G) Notes */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-extrabold text-foreground mb-3 pb-2 border-b border-border">
            Vendor Notes
          </h3>
          <Textarea
            className="min-h-[60px] text-xs"
            placeholder="Internal notes, specialization, history..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* H) Documents -- following asset registration screen design */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Documents
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {uploadedCount} of {docCategories.length} categories have
                uploads
              </p>
            </div>
            <Button
              variant="outline"
              className="text-xs font-semibold h-7 px-3"
              onClick={() => setShowAddDocForm(!showAddDocForm)}
            >
              <Plus className="w-3 h-3 mr-1" /> Additional Category
            </Button>
          </div>

          {/* Add Category Inline Form */}
          {showAddDocForm && (
            <div className="rounded-lg border-2 border-dashed border-[#00BCD4]/40 bg-[#00BCD4]/5 p-3 mb-3">
              <p className="text-[11px] font-bold text-foreground mb-2">
                Add New Document Category
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField label="Category Name" required>
                  <Input
                    className="h-8 text-xs"
                    placeholder="e.g. ISO Certificate"
                    value={newDocCatName}
                    onChange={(e) => setNewDocCatName(e.target.value)}
                  />
                </FormField>
                <FormField label="Description">
                  <Input
                    className="h-8 text-xs"
                    placeholder="Brief description"
                    value={newDocCatDesc}
                    onChange={(e) => setNewDocCatDesc(e.target.value)}
                  />
                </FormField>
                <FormField label="Accepted Formats">
                  <Input
                    className="h-8 text-xs"
                    placeholder="PDF, DOC, XLS"
                    value={newDocCatFormats}
                    onChange={(e) => setNewDocCatFormats(e.target.value)}
                  />
                </FormField>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Button
                  className="text-white border-0 text-xs font-semibold h-7 px-4"
                  style={{
                    background: "linear-gradient(135deg, #00BCD4, #00838F)",
                  }}
                  onClick={handleAddDocCategory}
                  disabled={!newDocCatName.trim()}
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
                <Button
                  variant="outline"
                  className="text-xs font-semibold h-7 px-3"
                  onClick={() => {
                    setShowAddDocForm(false);
                    setNewDocCatName("");
                    setNewDocCatDesc("");
                    setNewDocCatFormats("PDF, DOC");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Document Category Cards -- asset registration zigzag pattern */}
          <div className="flex flex-col gap-2">
            {docCategories.map((cat, idx) => {
              const isEven = idx % 2 === 0;
              const files = uploadedFiles[cat.name] || [];
              const hasFiles = files.length > 0;
              const isCustom = !vendorDocCategories.some(
                (d) => d.name === cat.name,
              );

              return (
                <div
                  key={cat.name}
                  className={cn(
                    "flex rounded-lg border overflow-hidden transition-all",
                    hasFiles
                      ? "border-[#10B981]/30 bg-[#10B981]/5"
                      : "border-border",
                    isEven ? "flex-row" : "flex-row-reverse",
                  )}
                >
                  {/* Info side */}
                  <div
                    className={cn(
                      "flex-1 px-3 py-2 flex flex-col justify-center",
                      isEven ? "pr-2" : "pl-2",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={cn(
                          "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
                          hasFiles
                            ? "bg-[#10B981] text-white"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {hasFiles ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          idx + 1
                        )}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground">
                        {cat.name}
                      </h4>
                      {isCustom && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0 rounded bg-[#00BCD4]/10 text-[#00BCD4]">
                          Custom
                        </span>
                      )}
                      {isCustom && (
                        <button
                          className="ml-auto text-muted-foreground hover:text-[#EF4444] transition-colors"
                          onClick={() => handleRemoveDocCategory(cat.name)}
                          title="Remove category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[10px] text-muted-foreground ml-7",
                        isEven ? "text-left" : "text-right",
                      )}
                    >
                      {cat.desc}
                    </p>
                    {hasFiles && (
                      <div
                        className={cn(
                          "flex flex-wrap gap-1 mt-1.5 ml-7",
                          isEven ? "justify-start" : "justify-end",
                        )}
                      >
                        {files.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-border text-[10px] text-foreground"
                          >
                            <FileText className="w-2.5 h-2.5 text-[#00BCD4]" />
                            {f.length > 20 ? f.substring(0, 20) + "..." : f}
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
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload zone side */}
                  <div
                    className={cn(
                      "w-36 shrink-0 border-dashed flex flex-col items-center justify-center gap-1 py-2 px-3 cursor-pointer transition-colors group",
                      isEven ? "border-l" : "border-r",
                      hasFiles
                        ? "border-[#10B981]/30 hover:border-[#10B981]"
                        : "border-border hover:border-[#00BCD4]",
                    )}
                    onClick={() => handleSimulateUpload(cat.name)}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                        hasFiles
                          ? "bg-[#10B981]/10 group-hover:bg-[#10B981]/20"
                          : "bg-muted group-hover:bg-[#00BCD4]/10",
                      )}
                    >
                      <Upload
                        className={cn(
                          "w-3 h-3 transition-colors",
                          hasFiles
                            ? "text-[#10B981]"
                            : "text-muted-foreground group-hover:text-[#00BCD4]",
                        )}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground text-center">
                      {hasFiles ? "Add more" : "Drop file"}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {cat.formats}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pb-2">
        <p className="text-[11px] text-muted-foreground">
          {isEdit
            ? `Editing vendor ${editVendor.id}`
            : "New vendor registration"}
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
            <Send className="w-3.5 h-3.5 mr-1" /> Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN EXPORT ====================
export function VendorRegistrationPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [vendors] = useState<Vendor[]>(mockVendors);

  if (view === "form") {
    return (
      <VendorForm
        onBack={() => {
          setView("list");
          setEditVendor(null);
        }}
        editVendor={editVendor}
      />
    );
  }

  return (
    <VendorListView
      vendors={vendors}
      onAdd={() => {
        setEditVendor(null);
        setView("form");
      }}
      onView={(v) => {
        setEditVendor(v);
        setView("form");
      }}
    />
  );
}
