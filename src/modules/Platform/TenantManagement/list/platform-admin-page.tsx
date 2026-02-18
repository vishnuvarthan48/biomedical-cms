"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Building2,
  Plus,
  Search,
  Eye,
  EyeOff,
  Pencil,
  MoreVertical,
  Power,
  ShieldAlert,
  KeyRound,
  ScrollText,
  ArrowLeft,
  Save,
  Send,
  ChevronRight,
  Users,
  Calendar,
  Globe,
  Mail,
  Phone,
  Clock,
  X,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Ban,
  FileText,
  Filter,
  Shield,
  Lock,
  Settings2,
  ChevronDown,
  UserPlus,
  Trash2,
} from "lucide-react";
import {
  mockTenants,
  mockAuditLogs,
  mockOrganizations,
  mockUsers,
  mockRoles,
  mockRolePermissions,
  seededResources,
  seededActions,
  getTopLevelResources,
  getResourceChildren,
  type Tenant,
  type TenantStatus,
  type AuditLog,
  type Organization,
  type TenantUser,
  type Role,
  type ResourceDef,
  type ActionDef,
} from "@/src/lib/rbac-data";

// -- Tenant Status Badge --
function TenantStatusBadge({ status }: { status: TenantStatus }) {
  const config = {
    Active: {
      bg: "bg-[#10B981]/10",
      text: "text-[#10B981]",
      border: "border-[#10B981]/30",
    },
    Draft: {
      bg: "bg-[#F59E0B]/10",
      text: "text-[#F59E0B]",
      border: "border-[#F59E0B]/30",
    },
    Suspended: {
      bg: "bg-[#EF4444]/10",
      text: "text-[#EF4444]",
      border: "border-[#EF4444]/30",
    },
  }[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-sm font-semibold border px-2.5 py-0.5",
        config.bg,
        config.text,
        config.border,
      )}
    >
      {status}
    </Badge>
  );
}

// == VIEW: Tenant List ==
function TenantListView({
  tenants,
  onView,
  onCreate,
}: {
  tenants: Tenant[];
  onView: (t: Tenant) => void;
  onCreate: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filtered = tenants.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    All: tenants.length,
    Active: tenants.filter((t) => t.status === "Active").length,
    Draft: tenants.filter((t) => t.status === "Draft").length,
    Suspended: tenants.filter((t) => t.status === "Suspended").length,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">
            Tenant Management
          </h2>
          <p className="text-base text-muted-foreground mt-1">
            Manage all tenants on the platform
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={onCreate}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Tenant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["All", "Active", "Draft", "Suspended"] as const).map((s) => (
          <Card
            key={s}
            className={cn(
              "cursor-pointer transition-all border-2",
              filterStatus === s
                ? "border-[#00BCD4] shadow-lg"
                : "border-border hover:border-[#00BCD4]/30",
            )}
            onClick={() => setFilterStatus(s)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  s === "All"
                    ? "bg-[#00BCD4]/10"
                    : s === "Active"
                      ? "bg-[#10B981]/10"
                      : s === "Draft"
                        ? "bg-[#F59E0B]/10"
                        : "bg-[#EF4444]/10",
                )}
              >
                {s === "All" ? (
                  <Building2 className="w-5 h-5 text-[#00BCD4]" />
                ) : s === "Active" ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : s === "Draft" ? (
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                ) : (
                  <Ban className="w-5 h-5 text-[#EF4444]" />
                )}
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">
                  {statusCounts[s]}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">
                  {s === "All" ? "Total" : s}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by tenant name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "rgba(0,188,212,0.03)" }}
              >
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Tenant Name
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Code
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Status
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Primary Contact
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Created
                </th>
                <th className="text-right py-4 px-5 font-bold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onView(t)}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(0,188,212,0.1), rgba(0,188,212,0.05))",
                        }}
                      >
                        <Building2 className="w-4 h-4 text-[#00BCD4]" />
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {t.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm font-medium text-muted-foreground font-mono">
                    {t.code}
                  </td>
                  <td className="py-4 px-5">
                    <TenantStatusBadge status={t.status} />
                  </td>
                  <td className="py-4 px-5 text-sm text-foreground">
                    {t.primaryContact || "-"}
                  </td>
                  <td className="py-4 px-5 text-sm text-muted-foreground">
                    {t.createdDate}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(t);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => onView(t)}
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Pencil className="w-4 h-4" /> Edit Tenant
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {t.status === "Draft" && (
                            <DropdownMenuItem className="gap-2 cursor-pointer text-[#10B981]">
                              <Power className="w-4 h-4" /> Activate
                            </DropdownMenuItem>
                          )}
                          {t.status === "Active" && (
                            <DropdownMenuItem className="gap-2 cursor-pointer text-[#EF4444]">
                              <Ban className="w-4 h-4" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {t.status === "Suspended" && (
                            <DropdownMenuItem className="gap-2 cursor-pointer text-[#10B981]">
                              <Power className="w-4 h-4" /> Re-activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <KeyRound className="w-4 h-4" /> Reset Admin
                            Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <ScrollText className="w-4 h-4" /> Audit Logs
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No tenants found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// == VIEW: Create Tenant ==
function CreateTenantView({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: () => void;
}) {
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [useAutoPassword, setUseAutoPassword] = useState(true);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const specials = "!@#$%&*";
    let pw = "";
    for (let i = 0; i < 10; i++)
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    pw += specials.charAt(Math.floor(Math.random() * specials.length));
    pw += Math.floor(Math.random() * 10);
    return pw;
  };

  const handleCreate = () => {
    const pw = useAutoPassword ? generatePassword() : adminPassword;
    setGeneratedPassword(pw);
    setSubmitted(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">
            Create New Tenant
          </h2>
          <p className="text-sm text-muted-foreground">
            Create a new tenant in Draft status with Tenant Group Admin
            credentials
          </p>
        </div>
      </div>

      {/* Success State */}
      {submitted && generatedPassword && (
        <Card
          className="border-2 border-[#10B981]/30 shadow-sm"
          style={{ background: "rgba(16,185,129,0.03)" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Tenant Created Successfully
                </h3>
                <p className="text-sm text-muted-foreground">
                  Save the credentials below. The password is shown only once.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-sm font-bold text-foreground mb-4">
                Tenant Group Admin Login Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Admin Name
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {adminName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {adminEmail || "-"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Username
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">
                      {adminUsername}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-2.5"
                      onClick={() => handleCopy(adminUsername)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Password{" "}
                    <span className="text-[#EF4444] font-normal normal-case">
                      (shown once)
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">
                      {generatedPassword}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-2.5"
                      onClick={() => handleCopy(generatedPassword || "")}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <p className="text-xs text-[#F59E0B] font-medium">
                  MustChangePassword = true. The admin will be forced to change
                  this password on first login.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Button
                className="text-white border-0 text-sm font-semibold h-10 px-5"
                style={{
                  background: "linear-gradient(135deg, #00BCD4, #00838F)",
                }}
                onClick={onSave}
              >
                Done
              </Button>
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setSubmitted(false);
                  setGeneratedPassword(null);
                }}
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!submitted && (
        <>
          {/* Tenant Details */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
                Tenant Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Tenant Name <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    className="h-10"
                    placeholder="e.g. Apollo Hospitals Group"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Tenant Code / Slug <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    className="h-10 font-mono"
                    placeholder="e.g. apollo-hospitals (URL-safe)"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Timezone
                  </Label>
                  <Select>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Asia/Kolkata (default)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">
                        Asia/Kolkata (IST)
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">
                        Asia/Dubai (GST)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York (EST)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London (GMT)
                      </SelectItem>
                      <SelectItem value="Asia/Singapore">
                        Asia/Singapore (SGT)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Locale
                  </Label>
                  <Select>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select locale" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-IN">English (India)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="hi-IN">Hindi</SelectItem>
                      <SelectItem value="ta-IN">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Contact Email
                  </Label>
                  <Input
                    type="email"
                    className="h-10"
                    placeholder="admin@hospital.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Contact Phone
                  </Label>
                  <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label className="text-sm font-bold text-foreground">
                    Notes
                  </Label>
                  <Textarea
                    className="min-h-[80px]"
                    placeholder="Any additional information..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Group Admin Account */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Tenant Group Admin Account
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    This user will be the first admin for the tenant. They can
                    manage organizations, users, roles, and privileges.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Admin Full Name <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    className="h-10"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Admin Email <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    type="email"
                    className="h-10"
                    placeholder="e.g. rajesh.kumar@hospital.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Username <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    className="h-10 font-mono"
                    placeholder="e.g. rajesh.kumar"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for login. Must be unique across the system.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Mobile Number
                  </Label>
                  <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              {/* Password Section */}
              <div className="mt-5 pt-4 border-t border-border">
                <Label className="text-sm font-bold text-foreground mb-3 block">
                  Password
                </Label>
                <div className="flex items-center gap-4 mb-4">
                  <label
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                    style={{
                      borderColor: useAutoPassword
                        ? "rgba(0,188,212,0.4)"
                        : "var(--border)",
                      background: useAutoPassword
                        ? "rgba(0,188,212,0.05)"
                        : "transparent",
                      color: useAutoPassword
                        ? "#00BCD4"
                        : "var(--muted-foreground)",
                    }}
                    onClick={() => setUseAutoPassword(true)}
                  >
                    <input
                      type="radio"
                      name="pwMode"
                      checked={useAutoPassword}
                      onChange={() => setUseAutoPassword(true)}
                      className="accent-[#00BCD4]"
                    />
                    Auto-generate password
                  </label>
                  <label
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                    style={{
                      borderColor: !useAutoPassword
                        ? "rgba(0,188,212,0.4)"
                        : "var(--border)",
                      background: !useAutoPassword
                        ? "rgba(0,188,212,0.05)"
                        : "transparent",
                      color: !useAutoPassword
                        ? "#00BCD4"
                        : "var(--muted-foreground)",
                    }}
                    onClick={() => setUseAutoPassword(false)}
                  >
                    <input
                      type="radio"
                      name="pwMode"
                      checked={!useAutoPassword}
                      onChange={() => setUseAutoPassword(false)}
                      className="accent-[#00BCD4]"
                    />
                    Set password manually
                  </label>
                </div>

                {useAutoPassword ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      A strong password will be auto-generated and shown once
                      after creation.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-bold text-foreground">
                        Password <span className="text-[#EF4444]">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-10 pr-10 font-mono"
                          placeholder="Min 8 chars, uppercase, number, special"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {adminPassword.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1">
                          {[
                            {
                              label: "At least 8 characters",
                              valid: adminPassword.length >= 8,
                            },
                            {
                              label: "Uppercase letter",
                              valid: /[A-Z]/.test(adminPassword),
                            },
                            {
                              label: "Number",
                              valid: /[0-9]/.test(adminPassword),
                            },
                            {
                              label: "Special character",
                              valid: /[^A-Za-z0-9]/.test(adminPassword),
                            },
                          ].map((rule) => (
                            <div
                              key={rule.label}
                              className="flex items-center gap-2"
                            >
                              {rule.valid ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                              )}
                              <span
                                className={`text-xs font-medium ${rule.valid ? "text-[#10B981]" : "text-[#F59E0B]"}`}
                              >
                                {rule.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-bold text-foreground">
                        Confirm Password{" "}
                        <span className="text-[#EF4444]">*</span>
                      </Label>
                      <Input
                        type="password"
                        className="h-10 font-mono"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <p className="text-xs text-[#F59E0B] font-medium">
                    MustChangePassword will be set to true. The admin must
                    change this password on first login.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button
              className="text-white border-0 text-sm font-semibold h-10 px-5"
              style={{
                background: "linear-gradient(135deg, #00BCD4, #00838F)",
              }}
              onClick={handleCreate}
              disabled={
                !adminUsername.trim() ||
                !adminEmail.trim() ||
                (!useAutoPassword && adminPassword.length < 8)
              }
            >
              <Save className="w-4 h-4 mr-1.5" /> Create Tenant & Admin Account
            </Button>
            <Button
              variant="outline"
              className="text-sm font-semibold h-10 px-4"
              onClick={onBack}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// == VIEW: Tenant Details ==
function TenantDetailView({
  tenant,
  onBack,
}: {
  tenant: Tenant;
  onBack: () => void;
}) {
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const handleCreateAdmin = () => {
    const pw = `Temp@${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    setGeneratedPassword(pw);
  };

  const tenantLogs = mockAuditLogs.filter((l) => l.tenant === tenant.name);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tenants
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-foreground">
              {tenant.name}
            </h2>
            <TenantStatusBadge status={tenant.status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {tenant.code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tenant.status === "Draft" && (
            <Button className="text-white border-0 text-sm font-semibold h-10 px-4 bg-[#10B981] hover:bg-[#059669]">
              <Power className="w-4 h-4 mr-1.5" /> Activate
            </Button>
          )}
          {tenant.status === "Active" && (
            <Button
              variant="outline"
              className="text-sm font-semibold h-10 px-4 text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/5"
            >
              <Ban className="w-4 h-4 mr-1.5" /> Suspend
            </Button>
          )}
          {tenant.status === "Suspended" && (
            <Button className="text-white border-0 text-sm font-semibold h-10 px-4 bg-[#10B981] hover:bg-[#059669]">
              <Power className="w-4 h-4 mr-1.5" /> Re-activate
            </Button>
          )}
          <Button variant="outline" className="text-sm font-semibold h-10 px-4">
            <Pencil className="w-4 h-4 mr-1.5" /> Edit
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
            Tenant Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Timezone
                </p>
                <p className="text-sm font-bold text-foreground">
                  {tenant.timezone}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact Email
                </p>
                <p className="text-sm font-bold text-foreground">
                  {tenant.contactEmail || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Contact Phone
                </p>
                <p className="text-sm font-bold text-foreground">
                  {tenant.contactPhone || "-"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </p>
                <p className="text-sm font-bold text-foreground">
                  {tenant.createdDate}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Primary Contact
                </p>
                <p className="text-sm font-bold text-foreground">
                  {tenant.primaryContact || "-"}
                </p>
              </div>
            </div>
            {tenant.notes && (
              <div className="flex items-start gap-3 md:col-span-3">
                <FileText className="w-5 h-5 text-[#00BCD4] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes
                  </p>
                  <p className="text-sm text-foreground">{tenant.notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Section */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h3 className="text-base font-extrabold text-foreground">
              Tenant Group Admins
            </h3>
            <Button
              className="text-white border-0 text-sm font-semibold h-9 px-4"
              style={{
                background: "linear-gradient(135deg, #00BCD4, #00838F)",
              }}
              onClick={() => setShowCreateAdmin(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Create Admin
            </Button>
          </div>

          {/* Create Admin Form */}
          {showCreateAdmin && (
            <div className="rounded-xl border-2 border-dashed border-[#00BCD4]/40 bg-[#00BCD4]/5 p-5 mb-4">
              <h4 className="text-sm font-bold text-foreground mb-4">
                Create Tenant Group Admin
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Full Name <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input className="h-10" placeholder="Full name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Email <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    type="email"
                    className="h-10"
                    placeholder="admin@hospital.com"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">
                    Mobile
                  </Label>
                  <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                <Label className="text-sm font-bold text-foreground">
                  Role
                </Label>
                <Input
                  className="h-10 bg-muted/30"
                  value="Tenant Group Admin"
                  readOnly
                />
              </div>

              {/* Generated Password Display */}
              {generatedPassword && (
                <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    <p className="text-sm font-bold text-[#10B981]">
                      Admin Created Successfully
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Default password (shown once only - copy it now):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm font-mono font-bold text-foreground">
                      {generatedPassword}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    User must change password on first login (MustChangePassword
                    = true)
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!generatedPassword && (
                  <Button
                    className="text-white border-0 text-sm font-semibold h-10 px-5"
                    style={{
                      background: "linear-gradient(135deg, #00BCD4, #00838F)",
                    }}
                    onClick={handleCreateAdmin}
                  >
                    <Send className="w-4 h-4 mr-1.5" /> Create Admin User
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="text-sm font-semibold h-10 px-4"
                  onClick={() => {
                    setShowCreateAdmin(false);
                    setGeneratedPassword(null);
                  }}
                >
                  {generatedPassword ? "Done" : "Cancel"}
                </Button>
              </div>
            </div>
          )}

          {/* Admins Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                  Status
                </th>
                <th className="text-right py-3 px-4 font-bold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="py-3 px-4 text-sm font-semibold text-foreground">
                  Arjun Kumar
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  arjun.kumar@apollohospitals.com
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold border-[#00BCD4]/30 text-[#00BCD4]"
                  >
                    Tenant Group Admin
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge
                    variant="outline"
                    className="text-xs font-semibold border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                  >
                    Active
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-sm text-muted-foreground hover:text-[#00BCD4] gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Activity / Audit Logs */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
            Recent Activity
          </h3>
          <div className="flex flex-col gap-0">
            {tenantLogs.length > 0 ? (
              tenantLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {log.summary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.actor} &middot; {log.timestamp}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium shrink-0"
                  >
                    {log.action}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No activity yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// == VIEW: Audit Logs ==
function AuditLogsView({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState("");
  const [filterEntity, setFilterEntity] = useState("All");
  const [filterAction, setFilterAction] = useState("All");

  const entityTypes = [
    "All",
    ...Array.from(new Set(logs.map((l) => l.entityType))),
  ];
  const actionTypes = [
    "All",
    ...Array.from(new Set(logs.map((l) => l.action))),
  ];

  const filtered = logs.filter((l) => {
    const matchSearch =
      !search ||
      l.summary.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase());
    const matchEntity = filterEntity === "All" || l.entityType === filterEntity;
    const matchAction = filterAction === "All" || l.action === filterAction;
    return matchSearch && matchEntity && matchAction;
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground">
          Platform Audit Logs
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          Track all platform-wide actions and changes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-44 h-10">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-44 h-10">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {actionTypes.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "rgba(0,188,212,0.03)" }}
              >
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Timestamp
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Actor
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Tenant
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Entity
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Action
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-5 text-sm text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-foreground">
                    {log.actor}
                  </td>
                  <td className="py-4 px-5 text-sm text-foreground">
                    {log.tenant}
                  </td>
                  <td className="py-4 px-5 text-sm text-foreground">
                    {log.entity}
                  </td>
                  <td className="py-4 px-5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold",
                        log.action === "CREATE"
                          ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                          : log.action === "UPDATE"
                            ? "border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10"
                            : log.action === "DELETE"
                              ? "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10"
                              : log.action === "RESET_PASSWORD"
                                ? "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10"
                                : "border-border",
                      )}
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-sm text-foreground max-w-xs truncate">
                    {log.summary}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <ScrollText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No logs found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================
// SUB-SECTION: Organization Management (embedded)
// =====================================
function OrgManagement() {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [search, setSearch] = useState("");
  // Org admin states for create view
  const [orgAdminName, setOrgAdminName] = useState("");
  const [orgAdminEmail, setOrgAdminEmail] = useState("");
  const [orgAdminUsername, setOrgAdminUsername] = useState("");
  const [orgAdminPassword, setOrgAdminPassword] = useState("");
  const [orgUseAutoPassword, setOrgUseAutoPassword] = useState(true);
  const [orgShowPassword, setOrgShowPassword] = useState(false);
  const [orgGenPassword, setOrgGenPassword] = useState<string | null>(null);
  const [orgCopied, setOrgCopied] = useState(false);
  const [orgSubmitted, setOrgSubmitted] = useState(false);

  const filtered = mockOrganizations.filter(
    (o) =>
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()),
  );

  const generateOrgPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const specials = "!@#$%&*";
    let pw = "";
    for (let i = 0; i < 10; i++)
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    pw += specials.charAt(Math.floor(Math.random() * specials.length));
    pw += Math.floor(Math.random() * 10);
    return pw;
  };

  const handleOrgCreate = () => {
    const pw = orgUseAutoPassword ? generateOrgPassword() : orgAdminPassword;
    setOrgGenPassword(pw);
    setOrgSubmitted(true);
  };

  const handleOrgCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setOrgCopied(true);
    setTimeout(() => setOrgCopied(false), 2000);
  };

  const resetOrgForm = () => {
    setOrgAdminName("");
    setOrgAdminEmail("");
    setOrgAdminUsername("");
    setOrgAdminPassword("");
    setOrgUseAutoPassword(true);
    setOrgShowPassword(false);
    setOrgGenPassword(null);
    setOrgCopied(false);
    setOrgSubmitted(false);
  };

  if (view === "create") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              resetOrgForm();
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h3 className="text-xl font-extrabold text-foreground">
              Create Organization
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a new organization with an Organization Admin account
            </p>
          </div>
        </div>

        {/* Success State */}
        {orgSubmitted && orgGenPassword && (
          <Card
            className="border-2 border-[#10B981]/30 shadow-sm"
            style={{ background: "rgba(16,185,129,0.03)" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Organization Created Successfully
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Save the admin credentials below. The password is shown only
                    once.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-bold text-foreground mb-4">
                  Organization Admin Login Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Admin Name
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {orgAdminName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {orgAdminEmail || "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Username
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">
                        {orgAdminUsername}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5"
                        onClick={() => handleOrgCopy(orgAdminUsername)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Password{" "}
                      <span className="text-[#EF4444] font-normal normal-case">
                        (shown once)
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">
                        {orgGenPassword}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5"
                        onClick={() => handleOrgCopy(orgGenPassword || "")}
                      >
                        {orgCopied ? (
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <p className="text-xs text-[#F59E0B] font-medium">
                    MustChangePassword = true. The admin must change this
                    password on first login.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <Button
                  className="text-white border-0 text-sm font-semibold h-10 px-5"
                  style={{
                    background: "linear-gradient(135deg, #00BCD4, #00838F)",
                  }}
                  onClick={() => {
                    setView("list");
                    resetOrgForm();
                  }}
                >
                  Done
                </Button>
                <Button
                  variant="outline"
                  className="text-sm font-semibold h-10 px-4"
                  onClick={() => {
                    resetOrgForm();
                  }}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!orgSubmitted && (
          <>
            {/* Organization Details */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
                  Organization Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Org Name <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      className="h-10"
                      placeholder="e.g. Apollo Chennai - Main Campus"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Org Code <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      className="h-10 font-mono"
                      placeholder="e.g. APL-CHN-MAIN"
                    />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <Label className="text-sm font-bold text-foreground">
                      Address
                    </Label>
                    <Textarea
                      className="min-h-[80px]"
                      placeholder="Full address..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Contact Email
                    </Label>
                    <Input
                      type="email"
                      className="h-10"
                      placeholder="org-admin@hospital.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Contact Phone
                    </Label>
                    <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Status
                    </Label>
                    <Select>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Active" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Admin Account */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-[#00BCD4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      Organization Admin Account
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      This user will be the first admin for this organization.
                      They can manage users and resources within the org.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Admin Full Name <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      className="h-10"
                      placeholder="e.g. Dr. Priya Sharma"
                      value={orgAdminName}
                      onChange={(e) => setOrgAdminName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Admin Email <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      type="email"
                      className="h-10"
                      placeholder="e.g. priya.sharma@hospital.com"
                      value={orgAdminEmail}
                      onChange={(e) => setOrgAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Username <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      className="h-10 font-mono"
                      placeholder="e.g. priya.sharma"
                      value={orgAdminUsername}
                      onChange={(e) => setOrgAdminUsername(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for login. Must be unique across the system.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Mobile Number
                    </Label>
                    <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>

                {/* Password Section */}
                <div className="mt-5 pt-4 border-t border-border">
                  <Label className="text-sm font-bold text-foreground mb-3 block">
                    Password
                  </Label>
                  <div className="flex items-center gap-4 mb-4">
                    <label
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                      style={{
                        borderColor: orgUseAutoPassword
                          ? "rgba(0,188,212,0.4)"
                          : "var(--border)",
                        background: orgUseAutoPassword
                          ? "rgba(0,188,212,0.05)"
                          : "transparent",
                        color: orgUseAutoPassword
                          ? "#00BCD4"
                          : "var(--muted-foreground)",
                      }}
                      onClick={() => setOrgUseAutoPassword(true)}
                    >
                      <input
                        type="radio"
                        name="orgPwMode"
                        checked={orgUseAutoPassword}
                        onChange={() => setOrgUseAutoPassword(true)}
                        className="accent-[#00BCD4]"
                      />
                      Auto-generate password
                    </label>
                    <label
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                      style={{
                        borderColor: !orgUseAutoPassword
                          ? "rgba(0,188,212,0.4)"
                          : "var(--border)",
                        background: !orgUseAutoPassword
                          ? "rgba(0,188,212,0.05)"
                          : "transparent",
                        color: !orgUseAutoPassword
                          ? "#00BCD4"
                          : "var(--muted-foreground)",
                      }}
                      onClick={() => setOrgUseAutoPassword(false)}
                    >
                      <input
                        type="radio"
                        name="orgPwMode"
                        checked={!orgUseAutoPassword}
                        onChange={() => setOrgUseAutoPassword(false)}
                        className="accent-[#00BCD4]"
                      />
                      Set password manually
                    </label>
                  </div>

                  {orgUseAutoPassword ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        A strong password will be auto-generated and shown once
                        after creation.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-bold text-foreground">
                          Password <span className="text-[#EF4444]">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            type={orgShowPassword ? "text" : "password"}
                            className="h-10 pr-10 font-mono"
                            placeholder="Min 8 chars, uppercase, number, special"
                            value={orgAdminPassword}
                            onChange={(e) =>
                              setOrgAdminPassword(e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setOrgShowPassword(!orgShowPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {orgShowPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {orgAdminPassword.length > 0 && (
                          <div className="flex flex-col gap-1 mt-1">
                            {[
                              {
                                label: "At least 8 characters",
                                valid: orgAdminPassword.length >= 8,
                              },
                              {
                                label: "Uppercase letter",
                                valid: /[A-Z]/.test(orgAdminPassword),
                              },
                              {
                                label: "Number",
                                valid: /[0-9]/.test(orgAdminPassword),
                              },
                              {
                                label: "Special character",
                                valid: /[^A-Za-z0-9]/.test(orgAdminPassword),
                              },
                            ].map((rule) => (
                              <div
                                key={rule.label}
                                className="flex items-center gap-2"
                              >
                                {rule.valid ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                                )}
                                <span
                                  className={`text-xs font-medium ${rule.valid ? "text-[#10B981]" : "text-[#F59E0B]"}`}
                                >
                                  {rule.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label className="text-sm font-bold text-foreground">
                          Confirm Password{" "}
                          <span className="text-[#EF4444]">*</span>
                        </Label>
                        <Input
                          type="password"
                          className="h-10 font-mono"
                          placeholder="Re-enter password"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                    <p className="text-xs text-[#F59E0B] font-medium">
                      MustChangePassword will be set to true. The admin must
                      change this password on first login.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button
                className="text-white border-0 text-sm font-semibold h-10 px-5"
                style={{
                  background: "linear-gradient(135deg, #00BCD4, #00838F)",
                }}
                onClick={handleOrgCreate}
                disabled={
                  !orgAdminUsername.trim() ||
                  !orgAdminEmail.trim() ||
                  (!orgUseAutoPassword && orgAdminPassword.length < 8)
                }
              >
                <Save className="w-4 h-4 mr-1.5" /> Create Organization & Admin
                Account
              </Button>
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setView("list");
                  resetOrgForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (view === "detail" && selectedOrg) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setSelectedOrg(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-foreground">
              {selectedOrg.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {selectedOrg.code}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-semibold",
              selectedOrg.status === "Active"
                ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
            )}
          >
            {selectedOrg.status}
          </Badge>
        </div>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
              Organization Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Address
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedOrg.address || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Users
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedOrg.usersCount}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedOrg.createdDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h4 className="text-base font-extrabold text-foreground">
                Assign Org Admins
              </h4>
              <Button
                variant="outline"
                className="text-sm font-semibold h-9 px-3"
              >
                <UserPlus className="w-4 h-4 mr-1.5" /> Assign User
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Select existing tenant users and assign them as Organization Admin
              for this org.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-foreground">
            Organizations
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockOrganizations.length} organizations
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={() => setView("create")}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Organization
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "rgba(0,188,212,0.03)" }}
              >
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Org Name
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Code
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Status
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Users
                </th>
                <th className="text-right py-4 px-5 font-bold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr
                  key={org.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedOrg(org);
                    setView("detail");
                  }}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-[#00BCD4]" />
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {org.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm font-mono text-muted-foreground">
                    {org.code}
                  </td>
                  <td className="py-4 px-5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold",
                        org.status === "Active"
                          ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                          : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
                      )}
                    >
                      {org.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-foreground">
                    {org.usersCount}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrg(org);
                        setView("detail");
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================
// SUB-SECTION: User Management (embedded)
// =====================================
function UserManagement() {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [search, setSearch] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const filtered = mockUsers.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (view === "create") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setGeneratedPassword(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">
            Create User
          </h3>
        </div>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Full Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input className="h-10" placeholder="Full name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Email <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  type="email"
                  className="h-10"
                  placeholder="user@hospital.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Mobile
                </Label>
                <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Default Organization
                </Label>
                <Select>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select org" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOrganizations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-5">
              <Label className="text-sm font-bold text-foreground mb-2 block">
                Initial Org Memberships
              </Label>
              <div className="flex flex-wrap gap-2">
                {mockOrganizations.map((o) => (
                  <label
                    key={o.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-[#00BCD4]/40 cursor-pointer text-sm"
                  >
                    <Checkbox />
                    {o.name}
                  </label>
                ))}
              </div>
            </div>
            {generatedPassword && (
              <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <p className="text-sm font-bold text-[#10B981]">
                    User Created Successfully
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Default password (shown once only):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm font-mono font-bold text-foreground">
                    {generatedPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  MustChangePassword = true
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 pt-5 border-t border-border">
              {!generatedPassword ? (
                <Button
                  className="text-white border-0 text-sm font-semibold h-10 px-5"
                  style={{
                    background: "linear-gradient(135deg, #00BCD4, #00838F)",
                  }}
                  onClick={() =>
                    setGeneratedPassword(
                      `Temp@${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
                    )
                  }
                >
                  <Send className="w-4 h-4 mr-1.5" /> Create User
                </Button>
              ) : null}
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setView("list");
                  setGeneratedPassword(null);
                }}
              >
                {generatedPassword ? "Done" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === "detail" && selectedUser) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setSelectedUser(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-foreground">
              {selectedUser.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedUser.email}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-semibold",
              selectedUser.status === "Active"
                ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
            )}
          >
            {selectedUser.status}
          </Badge>
        </div>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
              Profile
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mobile
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedUser.mobile || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Created
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedUser.createdDate}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Login
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {selectedUser.lastLogin || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
              Organization Memberships
            </h4>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                    Organization
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                    Roles
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-foreground text-sm">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedUser.orgMemberships.map((m) => (
                  <tr
                    key={m.orgId}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">
                      {m.orgName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold",
                          m.status === "Active"
                            ? "border-[#10B981]/30 text-[#10B981]"
                            : "border-[#EF4444]/30 text-[#EF4444]",
                        )}
                      >
                        {m.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {m.roles.map((r) => {
                          const role = mockRoles.find((rl) => rl.id === r);
                          return (
                            <Badge
                              key={r}
                              variant="outline"
                              className="text-xs font-medium border-[#00BCD4]/30 text-[#00BCD4]"
                            >
                              {role?.name || r}
                            </Badge>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {m.isDefault ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
              Security
            </h4>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
              >
                <KeyRound className="w-4 h-4 mr-1.5" /> Reset Password
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  MustChangePassword:
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    selectedUser.mustChangePassword
                      ? "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10"
                      : "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10",
                  )}
                >
                  {selectedUser.mustChangePassword ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-foreground">Users</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockUsers.length} users
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={() => setView("create")}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create User
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "rgba(0,188,212,0.03)" }}
              >
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Name
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Email
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Status
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Default Org
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Memberships
                </th>
                <th className="text-right py-4 px-5 font-bold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedUser(u);
                    setView("detail");
                  }}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#00BCD4]/10 flex items-center justify-center text-xs font-bold text-[#00BCD4]">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="py-4 px-5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold",
                        u.status === "Active"
                          ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                          : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
                      )}
                    >
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-sm text-foreground">
                    {mockOrganizations.find((o) => o.id === u.defaultOrgId)
                      ?.name || "-"}
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-foreground">
                    {u.orgMemberships.length}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(u);
                          setView("detail");
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================
// SUB-SECTION: Role Management (embedded)
// =====================================
function RoleManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [search, setSearch] = useState("");

  const filtered = mockRoles.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  );

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setEditRole(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">
            {editRole ? "Edit Role" : "Create Role"}
          </h3>
        </div>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Role Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  className="h-10"
                  placeholder="e.g. Maintenance Manager"
                  defaultValue={editRole?.name}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Role Code <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  className="h-10 font-mono"
                  placeholder="e.g. MAINT_MANAGER"
                  defaultValue={editRole?.code}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-sm font-bold text-foreground">
                  Description
                </Label>
                <Textarea
                  className="min-h-[60px]"
                  placeholder="Role description..."
                  defaultValue={editRole?.description}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Status
                </Label>
                <Select defaultValue={editRole?.status || "Active"}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mb-5">
              <Label className="text-sm font-bold text-foreground mb-3 block">
                Permission Matrix (Resource + Actions)
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Permissions are assigned directly on the role. Select which
                actions this role can perform on each resource.
              </p>
              <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-bold text-foreground text-sm w-48">
                        Resource
                      </th>
                      {seededActions.slice(0, 8).map((a) => (
                        <th
                          key={a.id}
                          className="text-center py-3 px-2 font-bold text-foreground text-xs"
                        >
                          {a.actionName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seededResources
                      .filter((r) => r.parentId !== null)
                      .map((res) => (
                        <tr
                          key={res.id}
                          className="border-b border-border last:border-0 hover:bg-muted/20"
                        >
                          <td className="py-3 px-4 text-sm font-semibold text-foreground">
                            {res.resourceName}
                          </td>
                          {seededActions.slice(0, 8).map((a) => (
                            <td key={a.id} className="text-center py-3 px-2">
                              <Checkbox
                                checked={
                                  editRole
                                    ? mockRolePermissions.some(
                                        (rp) =>
                                          rp.roleId === editRole.id &&
                                          rp.resourceId === res.id &&
                                          rp.actionId === a.id &&
                                          rp.isAllowed,
                                      )
                                    : false
                                }
                                className="mx-auto"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-5 border-t border-border">
              <Button
                className="text-white border-0 text-sm font-semibold h-10 px-5"
                style={{
                  background: "linear-gradient(135deg, #00BCD4, #00838F)",
                }}
                onClick={() => {
                  setView("list");
                  setEditRole(null);
                }}
              >
                <Save className="w-4 h-4 mr-1.5" /> Save
              </Button>
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setView("list");
                  setEditRole(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-foreground">Roles</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {mockRoles.length} roles
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={() => setView("form")}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Create Role
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((role) => (
          <Card
            key={role.id}
            className="border border-border shadow-sm hover:border-[#00BCD4]/30 transition-all cursor-pointer"
            onClick={() => {
              setEditRole(role);
              setView("form");
            }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00BCD4]/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#00BCD4]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {role.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {role.code}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    role.status === "Active"
                      ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                      : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
                  )}
                >
                  {role.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {role.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium border-[#00BCD4]/30 text-[#00BCD4]"
                >
                  {
                    mockRolePermissions.filter(
                      (rp) => rp.roleId === role.id && rp.isAllowed,
                    ).length
                  }{" "}
                  permissions
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {role.assignedUsersCount} users
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================
// SUB-SECTION: Resource & Action Catalog (embedded)
// =====================================
function ResourceCatalogEmbedded() {
  const [catalogTab, setCatalogTab] = useState<"resources" | "actions">(
    "resources",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-foreground">
            Resource & Action Catalog
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Resources and actions used in role permission definitions
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border w-fit">
        {[
          {
            id: "resources" as const,
            label: "Resources",
            count: seededResources.length,
          },
          {
            id: "actions" as const,
            label: "Actions",
            count: seededActions.length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCatalogTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              catalogTab === tab.id
                ? "text-white shadow-md"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={
              catalogTab === tab.id
                ? { background: "linear-gradient(135deg, #00BCD4, #00838F)" }
                : {}
            }
          >
            {tab.label}{" "}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] ml-1",
                catalogTab === tab.id ? "border-white/30 text-white" : "",
              )}
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>
      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "rgba(0,188,212,0.03)" }}
              >
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Name
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Key / Code
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Description
                </th>
                {catalogTab === "resources" && (
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Parent
                  </th>
                )}
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {catalogTab === "resources"
                ? seededResources.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                        !r.parentId && "bg-muted/20 font-bold",
                      )}
                    >
                      <td className="py-4 px-5 text-sm font-bold text-foreground">
                        {r.parentId ? (
                          <span className="pl-4">{r.resourceName}</span>
                        ) : (
                          r.resourceName
                        )}
                      </td>
                      <td className="py-4 px-5 text-sm font-mono text-muted-foreground">
                        {r.resourceKey}
                      </td>
                      <td className="py-4 px-5 text-sm text-muted-foreground">
                        {r.description}
                      </td>
                      <td className="py-4 px-5 text-sm text-muted-foreground">
                        {r.parentId ? (
                          seededResources.find((p) => p.id === r.parentId)
                            ?.resourceName || "-"
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold"
                          >
                            Group
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-semibold",
                            r.isActive
                              ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                              : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
                          )}
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                : seededActions.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 px-5 text-sm font-bold text-foreground">
                        {a.actionName}
                      </td>
                      <td className="py-4 px-5 text-sm font-mono text-muted-foreground">
                        {a.actionKey}
                      </td>
                      <td className="py-4 px-5 text-sm text-muted-foreground">
                        {a.description}
                      </td>
                      <td className="py-4 px-5">
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10"
                        >
                          Action
                        </Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// == MAIN PLATFORM ADMIN PAGE ==
type PlatformTab = "tenants" | "orgs" | "users" | "roles" | "catalog" | "audit";

export function PlatformAdminPage() {
  const [view, setView] = useState<"list" | "create" | "detail" | "audit">(
    "list",
  );
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState<PlatformTab>("tenants");

  const tabs: {
    id: PlatformTab;
    label: string;
    icon: React.ElementType;
    section: string;
  }[] = [
    { id: "tenants", label: "Tenants", icon: Building2, section: "Platform" },
    {
      id: "orgs",
      label: "Organizations",
      icon: Building2,
      section: "Tenant Admin",
    },
    { id: "users", label: "Users", icon: Users, section: "Tenant Admin" },
    { id: "roles", label: "Roles", icon: Shield, section: "Tenant Admin" },
    {
      id: "catalog",
      label: "Resources & Actions",
      icon: Settings2,
      section: "Tenant Admin",
    },
    { id: "audit", label: "Audit Logs", icon: ScrollText, section: "Platform" },
  ];

  const tabSections = Array.from(new Set(tabs.map((t) => t.section)));

  const renderTabContent = () => {
    switch (activeTab) {
      case "tenants":
        if (view === "create")
          return (
            <CreateTenantView
              onBack={() => setView("list")}
              onSave={() => setView("list")}
            />
          );
        if (view === "detail" && selectedTenant)
          return (
            <TenantDetailView
              tenant={selectedTenant}
              onBack={() => {
                setView("list");
                setSelectedTenant(null);
              }}
            />
          );
        return (
          <TenantListView
            tenants={mockTenants}
            onView={(t) => {
              setSelectedTenant(t);
              setView("detail");
            }}
            onCreate={() => setView("create")}
          />
        );
      case "orgs":
        return <OrgManagement />;
      case "users":
        return <UserManagement />;
      case "roles":
        return <RoleManagement />;
      case "catalog":
        return <ResourceCatalogEmbedded />;
      case "audit":
        return <AuditLogsView logs={mockAuditLogs} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Switcher - Grouped by Section */}
      <div className="flex flex-col gap-3">
        {tabSections.map((section) => (
          <div key={section} className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground w-24 shrink-0">
              {section}
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border flex-wrap">
              {tabs
                .filter((t) => t.section === section)
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === "tenants") setView("list");
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                      activeTab === tab.id
                        ? "text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    style={
                      activeTab === tab.id
                        ? {
                            background:
                              section === "Platform"
                                ? "linear-gradient(135deg, #8B5CF6, #6D28D9)"
                                : "linear-gradient(135deg, #00BCD4, #00838F)",
                          }
                        : {}
                    }
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
}
