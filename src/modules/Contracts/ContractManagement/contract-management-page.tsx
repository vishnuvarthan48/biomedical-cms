"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
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
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/modules";

interface Contract {
  id: string;
  contractNumber: string;
  type: string;
  vendor: string;
  startDate: string;
  endDate: string;
  value: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "TERMINATED";
  assetCount: number;
}

const mockContracts: Contract[] = [
  {
    id: "CTR-001",
    contractNumber: "AMC-2024-001",
    type: "Annual Maintenance Contract",
    vendor: "GE Healthcare",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    value: 250000,
    status: "ACTIVE",
    assetCount: 12,
  },
  {
    id: "CTR-002",
    contractNumber: "WAR-2024-001",
    type: "Warranty",
    vendor: "Siemens Medical",
    startDate: "2024-02-01",
    endDate: "2026-02-01",
    value: 180000,
    status: "ACTIVE",
    assetCount: 8,
  },
  {
    id: "CTR-003",
    contractNumber: "SVC-2023-002",
    type: "Service Agreement",
    vendor: "Philips Healthcare",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    value: 120000,
    status: "EXPIRED",
    assetCount: 5,
  },
];

const statusConfig = {
  ACTIVE: { label: "Active", color: "text-green-600", bg: "bg-green-50" },
  INACTIVE: { label: "Inactive", color: "text-yellow-600", bg: "bg-yellow-50" },
  EXPIRED: { label: "Expired", color: "text-red-600", bg: "bg-red-50" },
  TERMINATED: { label: "Terminated", color: "text-gray-600", bg: "bg-gray-50" },
};

export function ContractManagementPage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredContracts = contracts.filter(
    (c) =>
      (c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.vendor.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "ALL" || c.status === statusFilter),
  );

  const handleDelete = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEdit = (contract: Contract) => {
    navigate(`${ROUTES.CONTRACT_MANAGEMENT}/edit/${contract.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold">Contract Management</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contract number, vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => navigate(ROUTES.CONTRACT_CREATE)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">Contract Number</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="font-bold">Vendor</TableHead>
                <TableHead className="font-bold text-center">Start Date</TableHead>
                <TableHead className="font-bold text-center">End Date</TableHead>
                <TableHead className="font-bold text-right">Value</TableHead>
                <TableHead className="font-bold">Assets</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No contracts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-bold">{contract.contractNumber}</TableCell>
                    <TableCell className="text-sm">{contract.type}</TableCell>
                    <TableCell className="text-sm">{contract.vendor}</TableCell>
                    <TableCell className="text-sm text-center">{contract.startDate}</TableCell>
                    <TableCell className="text-sm text-center">{contract.endDate}</TableCell>
                    <TableCell className="text-sm text-right font-mono">₹{contract.value.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-center">{contract.assetCount}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "font-bold text-xs",
                          statusConfig[contract.status].color,
                          statusConfig[contract.status].bg,
                        )}
                      >
                        {statusConfig[contract.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contract.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Total Contracts</div>
            <div className="text-2xl font-bold mt-2">{contracts.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              {contracts.filter((c) => c.status === "ACTIVE").length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Total Assets Covered</div>
            <div className="text-2xl font-bold mt-2">{contracts.reduce((s, c) => s + c.assetCount, 0)}</div>
          </div>
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold mt-2">₹{contracts.reduce((s, c) => s + c.value, 0).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContractManagementPage;
