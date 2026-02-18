"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  X,
  ChevronDown,
  Pencil,
  Eye,
  Trash2,
  MoreVertical,
  Copy,
} from "lucide-react";
import { equipmentList } from "@/src/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

const statusColors: Record<string, string> = {
  "Working Fine": "bg-[#D1FAE5] text-[#059669]",
  "Under Repair": "bg-[#FEF3C7] text-[#D97706]",
  Condemned: "bg-[#FEE2E2] text-[#DC2626]",
  Standby: "bg-[#DBEAFE] text-[#2563EB]",
  New: "bg-[#E0E7FF] text-[#4338CA]",
  "Not Installed": "bg-[#F3F4F6] text-[#6B7280]",
};

const riskColors: Record<string, string> = {
  Critical: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  High: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  Medium: "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]",
  Low: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
};

const categories = [
  "All",
  "Imaging",
  "Life Support",
  "Patient Monitoring",
  "Sterilization",
];
const statuses = [
  "All",
  "Working Fine",
  "Under Repair",
  "Condemned",
  "Standby",
  "New",
  "Not Installed",
];
const riskLevels = ["All", "Critical", "High", "Medium", "Low"];
const departments = [
  "All",
  ...Array.from(new Set(equipmentList.map((e) => e.dept))),
];

export function AssetRegistrationPage({
  onRegister,
  onEdit,
}: {
  onRegister: () => void;
  onEdit: (assetId: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const activeFilterCount = [statusFilter, riskFilter, deptFilter].filter(
    (f) => f !== "All",
  ).length;

  const filtered = useMemo(() => {
    return equipmentList.filter((e) => {
      // Category chip filter
      if (activeCategory !== "All" && e.category !== activeCategory)
        return false;

      // Status filter
      if (statusFilter !== "All" && e.status !== statusFilter) return false;

      // Risk filter
      if (riskFilter !== "All" && e.risk !== riskFilter) return false;

      // Department filter
      if (deptFilter !== "All" && e.dept !== deptFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.serial.toLowerCase().includes(q) ||
          e.dept.toLowerCase().includes(q) ||
          e.manufacturer.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [activeCategory, searchQuery, statusFilter, riskFilter, deptFilter]);

  const clearAllFilters = () => {
    setActiveCategory("All");
    setSearchQuery("");
    setStatusFilter("All");
    setRiskFilter("All");
    setDeptFilter("All");
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Asset Registration
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Register, view, and manage biomedical equipment assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-11 text-sm font-semibold">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button variant="outline" className="h-11 text-sm font-semibold">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            className="text-white border-0 h-11 text-sm font-semibold px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={onRegister}
          >
            <Plus className="w-5 h-5 mr-2" /> Register Asset
          </Button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[#00BCD4] text-white shadow-md"
                : "bg-card text-foreground border border-border hover:border-[#00BCD4] hover:text-[#00BCD4]"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5 text-xs opacity-75">
                ({equipmentList.filter((e) => e.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, serial, department, manufacturer..."
              className="pl-11 h-11 bg-card border-border text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            className={`h-11 text-sm font-semibold px-4 ${showFilters ? "text-white border-0" : ""}`}
            style={
              showFilters
                ? { background: "linear-gradient(135deg, #00BCD4, #00838F)" }
                : undefined
            }
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-white text-[#00BCD4] text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-foreground">
                  Advanced Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-semibold text-[#00BCD4] hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Status Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          statusFilter === s
                            ? "bg-[#00BCD4] text-white border-[#00BCD4]"
                            : "bg-card text-foreground border-border hover:border-[#00BCD4]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">
                    Risk Level
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {riskLevels.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRiskFilter(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          riskFilter === r
                            ? "bg-[#00BCD4] text-white border-[#00BCD4]"
                            : "bg-card text-foreground border-border hover:border-[#00BCD4]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-foreground">
                    Department
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {departments.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDeptFilter(d)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          deptFilter === d
                            ? "bg-[#00BCD4] text-white border-[#00BCD4]"
                            : "bg-card text-foreground border-border hover:border-[#00BCD4]"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filter Tags */}
        {(activeFilterCount > 0 || searchQuery || activeCategory !== "All") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Active:
            </span>
            {activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] text-sm font-semibold border border-[#00BCD4]/20">
                Category: {activeCategory}
                <button
                  onClick={() => setActiveCategory("All")}
                  className="hover:text-[#00838F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] text-sm font-semibold border border-[#00BCD4]/20">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("All")}
                  className="hover:text-[#00838F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {riskFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] text-sm font-semibold border border-[#00BCD4]/20">
                Risk: {riskFilter}
                <button
                  onClick={() => setRiskFilter("All")}
                  className="hover:text-[#00838F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {deptFilter !== "All" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] text-sm font-semibold border border-[#00BCD4]/20">
                Dept: {deptFilter}
                <button
                  onClick={() => setDeptFilter("All")}
                  className="hover:text-[#00838F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BCD4]/10 text-[#00BCD4] text-sm font-semibold border border-[#00BCD4]/20">
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-[#00838F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <span className="text-sm font-semibold text-foreground ml-1">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Asset ID
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Equipment Name
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Category
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Dept
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Serial No
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Risk
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Next PM
                  </th>
                  <th className="text-right py-4 px-5 font-bold text-foreground text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-10 h-10 text-muted-foreground/40" />
                        <p className="text-base font-semibold text-foreground">
                          No assets found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-sm font-semibold"
                          onClick={clearAllFilters}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((eq) => (
                    <tr
                      key={eq.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">
                        {eq.id}
                      </td>
                      <td className="py-4 px-5 text-foreground font-semibold text-sm max-w-[260px] truncate">
                        {eq.name}
                      </td>
                      <td className="py-4 px-5 text-foreground text-sm">
                        {eq.category}
                      </td>
                      <td className="py-4 px-5 text-foreground text-sm">
                        {eq.dept}
                      </td>
                      <td className="py-4 px-5 font-mono text-sm text-foreground">
                        {eq.serial}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${riskColors[eq.risk]}`}
                        >
                          {eq.risk}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[eq.status]}`}
                        >
                          {eq.status}
                        </span>
                      </td>
                      <td
                        className={`py-4 px-5 text-sm font-semibold ${eq.nextPM === "Overdue" ? "text-[#DC2626]" : "text-foreground"}`}
                      >
                        {eq.nextPM}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                            title="Edit Asset"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(eq.id);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                            title="View Asset"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(eq.id);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={() => onEdit(eq.id)}
                              >
                                <Pencil className="w-4 h-4" /> Edit Asset
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Eye className="w-4 h-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Copy className="w-4 h-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <Download className="w-4 h-4" /> Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 cursor-pointer text-[#DC2626] focus:text-[#DC2626]">
                                <Trash2 className="w-4 h-4" /> Delete Asset
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
