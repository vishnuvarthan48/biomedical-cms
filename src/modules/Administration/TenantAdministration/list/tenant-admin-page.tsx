import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import {
  Building2,
  Plus,
  Search,
  Eye,
  EyeOff,
  Pencil,
  MoreVertical,
  KeyRound,
  ScrollText,
  ArrowLeft,
  Save,
  Send,
  Users,
  X,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ChevronRight,
  ChevronDown,
  Lock,
  Power,
  Trash2,
  UserPlus,
  Settings2,
  FileText,
  Clock,
  Zap,
  Database,
  FolderTree,
} from "lucide-react";
import {
  mockOrganizations,
  mockUsers,
  mockRoles,
  mockRolePermissions,
  mockAuditLogs,
  seededResources,
  seededActions,
  getResourceChildren,
  getTopLevelResources,
  hasPermission,
  type Organization,
  type TenantUser,
  type Role,
  type ResourceDef,
  type ActionDef,
} from "@/src/lib/rbac-data";
import { PermissionsView } from "@/src/components/cmms/permissions-view";

// =====================================
// SUB-SECTION: Organization Management
// =====================================
function OrgManagement() {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [search, setSearch] = useState("");
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
                  onClick={() => resetOrgForm()}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!orgSubmitted && (
          <>
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
                        name="orgPwModeTenant"
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
                        name="orgPwModeTenant"
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
              for this org. A user can be Org Admin in multiple orgs.
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
// SUB-SECTION: User Management
// =====================================
function UserManagement() {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [search, setSearch] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [userRoleId, setUserRoleId] = useState("");
  const [userUseAutoPassword, setUserUseAutoPassword] = useState(true);
  const [userPassword, setUserPassword] = useState("");
  const [userShowPassword, setUserShowPassword] = useState(false);
  const [userSubmitted, setUserSubmitted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [userDefaultOrg, setUserDefaultOrg] = useState("");

  const generateUserPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    const specials = "!@#$%&*";
    let pw = "";
    for (let i = 0; i < 10; i++)
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    pw += specials.charAt(Math.floor(Math.random() * specials.length));
    pw += Math.floor(Math.random() * 10);
    return pw;
  };

  const handleUserCreate = () => {
    const pw = userUseAutoPassword ? generateUserPassword() : userPassword;
    setGeneratedPassword(pw);
    setUserSubmitted(true);
  };

  const resetUserForm = () => {
    setUserName("");
    setUserEmail("");
    setUserMobile("");
    setUserDefaultOrg("");
    setUserRoleId("");
    setUserUseAutoPassword(true);
    setUserPassword("");
    setUserShowPassword(false);
    setGeneratedPassword(null);
    setCopied(false);
    setUserSubmitted(false);
  };

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
              resetUserForm();
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h3 className="text-xl font-extrabold text-foreground">
              Create User
            </h3>
            <p className="text-sm text-muted-foreground">
              Create a new user with role assignment and credentials
            </p>
          </div>
        </div>

        {/* Success State */}
        {userSubmitted && generatedPassword && (
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
                    User Created Successfully
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Save the credentials below. The password is shown only once.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-bold text-foreground mb-4">
                  User Login Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Name
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {userName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Email
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {userEmail || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Role
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs font-bold border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10"
                    >
                      {mockRoles.find((r) => r.id === userRoleId)?.name || "-"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Email (Login)
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">
                        {userEmail}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-2.5"
                        onClick={() => {
                          navigator.clipboard.writeText(userEmail);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
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
                        onClick={() => {
                          navigator.clipboard.writeText(generatedPassword || "");
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
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <p className="text-xs text-[#F59E0B] font-medium">
                    MustChangePassword = true. The user must change this
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
                    resetUserForm();
                  }}
                >
                  Done
                </Button>
                <Button
                  variant="outline"
                  className="text-sm font-semibold h-10 px-4"
                  onClick={() => resetUserForm()}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        {!userSubmitted && (
          <>
            {/* User Details Card */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
                  User Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Full Name <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      className="h-10"
                      placeholder="e.g. Rajesh Kumar"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Email <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Input
                      type="email"
                      className="h-10"
                      placeholder="user@hospital.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for login. Must be unique across the system.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Mobile
                    </Label>
                    <Input
                      className="h-10"
                      placeholder="+91 XXXXX XXXXX"
                      value={userMobile}
                      onChange={(e) => setUserMobile(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-bold text-foreground">
                      Default Organization
                    </Label>
                    <Select value={userDefaultOrg} onValueChange={setUserDefaultOrg}>
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
                <div className="mt-5">
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
              </CardContent>
            </Card>

            {/* Role Assignment Card */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-[#00BCD4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      Role Assignment
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Assign a role to define what this user can access
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-md mb-4">
                  <Label className="text-sm font-bold text-foreground">
                    Role <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Select value={userRoleId} onValueChange={setUserRoleId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{r.name}</span>
                            <span className="text-muted-foreground text-xs font-mono">({r.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userRoleId && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="text-xs font-bold border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10"
                      >
                        {mockRoles.find((r) => r.id === userRoleId)?.scope}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        {mockRoles.find((r) => r.id === userRoleId)?.code}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {mockRoles.find((r) => r.id === userRoleId)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Card */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                  <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-[#00BCD4]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      Password
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Set the initial password for this user
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                    style={{
                      borderColor: userUseAutoPassword
                        ? "rgba(0,188,212,0.4)"
                        : "var(--border)",
                      background: userUseAutoPassword
                        ? "rgba(0,188,212,0.05)"
                        : "transparent",
                      color: userUseAutoPassword
                        ? "#00BCD4"
                        : "var(--muted-foreground)",
                    }}
                    onClick={() => setUserUseAutoPassword(true)}
                  >
                    <input
                      type="radio"
                      name="userPwMode"
                      checked={userUseAutoPassword}
                      onChange={() => setUserUseAutoPassword(true)}
                      className="accent-[#00BCD4]"
                    />
                    Auto-generate password
                  </label>
                  <label
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                    style={{
                      borderColor: !userUseAutoPassword
                        ? "rgba(0,188,212,0.4)"
                        : "var(--border)",
                      background: !userUseAutoPassword
                        ? "rgba(0,188,212,0.05)"
                        : "transparent",
                      color: !userUseAutoPassword
                        ? "#00BCD4"
                        : "var(--muted-foreground)",
                    }}
                    onClick={() => setUserUseAutoPassword(false)}
                  >
                    <input
                      type="radio"
                      name="userPwMode"
                      checked={!userUseAutoPassword}
                      onChange={() => setUserUseAutoPassword(false)}
                      className="accent-[#00BCD4]"
                    />
                    Set password manually
                  </label>
                </div>

                {userUseAutoPassword ? (
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
                          type={userShowPassword ? "text" : "password"}
                          className="h-10 pr-10 font-mono"
                          placeholder="Min 8 chars, uppercase, number, special"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setUserShowPassword(!userShowPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {userShowPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {userPassword.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1">
                          {[
                            {
                              label: "At least 8 characters",
                              valid: userPassword.length >= 8,
                            },
                            {
                              label: "Uppercase letter",
                              valid: /[A-Z]/.test(userPassword),
                            },
                            {
                              label: "Number",
                              valid: /[0-9]/.test(userPassword),
                            },
                            {
                              label: "Special character",
                              valid: /[^A-Za-z0-9]/.test(userPassword),
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
                    MustChangePassword = true. The user must change this
                    password on first login.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                className="text-white border-0 text-sm font-semibold h-10 px-5"
                style={{
                  background: "linear-gradient(135deg, #00BCD4, #00838F)",
                }}
                onClick={handleUserCreate}
                disabled={!userName.trim() || !userEmail.trim() || !userRoleId}
              >
                <Send className="w-4 h-4 mr-1.5" /> Create User
              </Button>
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setView("list");
                  resetUserForm();
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
// SUB-SECTION: Role Management (with permission matrix)
// =====================================
function RoleManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [search, setSearch] = useState("");
  const [permMatrix, setPermMatrix] = useState<Record<string, boolean>>({});

  const filtered = mockRoles.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()),
  );

  // Build permission matrix key
  const permKey = (resourceId: string, actionId: string) =>
    `${resourceId}::${actionId}`;

  // Initialize perm matrix when editing
  const initPermMatrix = (roleId: string) => {
    const matrix: Record<string, boolean> = {};
    mockRolePermissions
      .filter((rp) => rp.roleId === roleId && rp.isAllowed)
      .forEach((rp) => {
        matrix[permKey(rp.resourceId, rp.actionId)] = true;
      });
    setPermMatrix(matrix);
  };

  const togglePerm = (resourceId: string, actionId: string) => {
    const key = permKey(resourceId, actionId);
    setPermMatrix((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Get leaf resources (those with no children) grouped by parent
  const topResources = getTopLevelResources();

  // Count permissions for a role
  const countPerms = (roleId: string) =>
    mockRolePermissions.filter((rp) => rp.roleId === roleId && rp.isAllowed)
      .length;

  // The core actions to display in the matrix (most common ones)
  const matrixActions = seededActions.slice(0, 8); // VIEW, CREATE, UPDATE, DELETE, APPROVE, ASSIGN, CLOSE, CANCEL

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setEditRole(null);
              setPermMatrix({});
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

        {/* Role Details */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <h4 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">
              Role Details
            </h4>
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
                  Scope
                </Label>
                <Select defaultValue={editRole?.scope || "Org-level"}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Org-level">Org-level</SelectItem>
                    <SelectItem value="Tenant-level">Tenant-level</SelectItem>
                  </SelectContent>
                </Select>
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
          </CardContent>
        </Card>

        {/* Permission Matrix: Role -> Resource -> Action */}
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
              <div>
                <h4 className="text-base font-extrabold text-foreground">
                  Permission Matrix
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Assign actions on each resource for this role
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-xs font-semibold border-[#00BCD4]/30 text-[#00BCD4]"
              >
                {Object.values(permMatrix).filter(Boolean).length} permissions
              </Badge>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b border-border"
                      style={{ background: "rgba(0,188,212,0.03)" }}
                    >
                      <th className="text-left py-3 px-4 font-bold text-foreground text-sm w-56 sticky left-0 bg-card z-10">
                        Resource
                      </th>
                      {matrixActions.map((a) => (
                        <th
                          key={a.id}
                          className="text-center py-3 px-2 font-bold text-foreground text-xs min-w-[70px]"
                        >
                          {a.actionName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topResources.map((parent) => {
                      const children = getResourceChildren(parent.id);
                      return (
                        <Fragment key={parent.id}>
                          {/* Parent group header */}
                          <tr className="border-b border-border bg-muted/40">
                            <td
                              colSpan={matrixActions.length + 1}
                              className="py-2.5 px-4"
                            >
                              <div className="flex items-center gap-2">
                                <FolderTree className="w-3.5 h-3.5 text-[#00BCD4]" />
                                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                                  {parent.resourceName}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  ({children.length} resources)
                                </span>
                              </div>
                            </td>
                          </tr>
                          {/* Child resources */}
                          {children.map((child) => (
                            <tr
                              key={child.id}
                              className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm font-semibold text-foreground pl-8 sticky left-0 bg-card">
                                {child.resourceName}
                              </td>
                              {matrixActions.map((a) => (
                                <td
                                  key={a.id}
                                  className="text-center py-3 px-2"
                                >
                                  <Checkbox
                                    checked={
                                      !!permMatrix[permKey(child.id, a.id)]
                                    }
                                    onCheckedChange={() =>
                                      togglePerm(child.id, a.id)
                                    }
                                    className="mx-auto"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            className="text-white border-0 text-sm font-semibold h-10 px-5"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
            onClick={() => {
              setView("list");
              setEditRole(null);
              setPermMatrix({});
            }}
          >
            <Save className="w-4 h-4 mr-1.5" /> Save Role
          </Button>
          <Button
            variant="outline"
            className="text-sm font-semibold h-10 px-4"
            onClick={() => {
              setView("list");
              setEditRole(null);
              setPermMatrix({});
            }}
          >
            Cancel
          </Button>
        </div>
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
          onClick={() => {
            setPermMatrix({});
            setView("form");
          }}
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

      <Card className="border border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                className="border-b border-border"
                style={{ background: "rgba(0,188,212,0.03)" }}
              >
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Role
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Code
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Scope
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Permissions
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Users
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Status
                </th>
                <th className="text-right py-4 px-5 font-bold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setEditRole(role);
                    initPermMatrix(role.id);
                    setView("form");
                  }}
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-[#00BCD4]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {role.name}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm font-mono text-muted-foreground">
                    {role.code}
                  </td>
                  <td className="py-4 px-5">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold",
                        role.scope === "Tenant-level"
                          ? "border-[#8B5CF6]/30 text-[#8B5CF6] bg-[#8B5CF6]/10"
                          : "border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10",
                      )}
                    >
                      {role.scope}
                    </Badge>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-sm font-semibold text-foreground">
                      {countPerms(role.id)}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      grants
                    </span>
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-foreground">
                    {role.assignedUsersCount}
                  </td>
                  <td className="py-4 px-5">
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
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="w-4 h-4" />
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
// SUB-SECTION: Resource Management
// =====================================
function ResourceManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editRes, setEditRes] = useState<ResourceDef | null>(null);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    getTopLevelResources().map((r) => r.id), // all expanded by default
  );

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const topResources = getTopLevelResources();

  const matchesSearch = (r: ResourceDef) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.resourceName.toLowerCase().includes(s) ||
      r.resourceKey.toLowerCase().includes(s)
    );
  };

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setEditRes(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">
            {editRes ? `Edit: ${editRes.resourceName}` : "Create Resource"}
          </h3>
        </div>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Resource Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  className="h-10"
                  placeholder="e.g. Asset Transfer"
                  defaultValue={editRes?.resourceName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Resource Key <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  className="h-10 font-mono"
                  placeholder="e.g. ASSET_TRANSFER"
                  defaultValue={editRes?.resourceKey}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Parent Resource
                </Label>
                <Select defaultValue={editRes?.parentId || ""}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="None (Top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top-level group)</SelectItem>
                    {topResources.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.resourceName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a parent to make this a child resource, or leave empty
                  for a new group.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Status
                </Label>
                <Select
                  defaultValue={editRes?.isActive ? "active" : "inactive"}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-sm font-bold text-foreground">
                  Description
                </Label>
                <Textarea
                  className="min-h-[60px]"
                  placeholder="Resource description..."
                  defaultValue={editRes?.description}
                />
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
                  setEditRes(null);
                }}
              >
                <Save className="w-4 h-4 mr-1.5" /> Save
              </Button>
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setView("list");
                  setEditRes(null);
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
          <h3 className="text-xl font-extrabold text-foreground">Resources</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {seededResources.length} resources in {topResources.length} groups
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={() => setView("form")}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Resource
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col">
            {topResources.map((parent) => {
              const children = getResourceChildren(parent.id);
              const filteredChildren = children.filter(matchesSearch);
              const parentMatches = matchesSearch(parent);
              const isExpanded = expandedGroups.includes(parent.id);

              if (!parentMatches && filteredChildren.length === 0) return null;

              return (
                <div
                  key={parent.id}
                  className="border-b border-border last:border-0"
                >
                  {/* Group Header */}
                  <div
                    className="flex items-center gap-3 py-4 px-5 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => toggleGroup(parent.id)}
                  >
                    <button className="text-muted-foreground hover:text-foreground">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                      <FolderTree className="w-4 h-4 text-[#00BCD4]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">
                        {parent.resourceName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {parent.resourceKey}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold border-[#00BCD4]/30 text-[#00BCD4]"
                    >
                      {children.length} children
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold",
                        parent.isActive
                          ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                          : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
                      )}
                    >
                      {parent.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditRes(parent);
                        setView("form");
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Children */}
                  {isExpanded && (
                    <div className="bg-muted/10">
                      {(search ? filteredChildren : children).map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 py-3 px-5 pl-16 border-t border-border/50 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                            <Database className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {child.resourceName}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {child.resourceKey}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate hidden md:block">
                            {child.description}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold",
                              child.isActive
                                ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10"
                                : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10",
                            )}
                          >
                            {child.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-[#00BCD4] opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setEditRes(child);
                              setView("form");
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================
// SUB-SECTION: Action Management
// =====================================
function ActionManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [editAction, setEditAction] = useState<ActionDef | null>(null);
  const [search, setSearch] = useState("");

  const filtered = seededActions.filter(
    (a) =>
      !search ||
      a.actionName.toLowerCase().includes(search.toLowerCase()) ||
      a.actionKey.toLowerCase().includes(search.toLowerCase()),
  );

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => {
              setView("list");
              setEditAction(null);
            }}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">
            {editAction ? `Edit: ${editAction.actionName}` : "Create Action"}
          </h3>
        </div>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Action Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  className="h-10"
                  placeholder="e.g. Transfer"
                  defaultValue={editAction?.actionName}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-bold text-foreground">
                  Action Key <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  className="h-10 font-mono"
                  placeholder="e.g. TRANSFER"
                  defaultValue={editAction?.actionKey}
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-sm font-bold text-foreground">
                  Description
                </Label>
                <Textarea
                  className="min-h-[60px]"
                  placeholder="Action description..."
                  defaultValue={editAction?.description}
                />
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
                  setEditAction(null);
                }}
              >
                <Save className="w-4 h-4 mr-1.5" /> Save
              </Button>
              <Button
                variant="outline"
                className="text-sm font-semibold h-10 px-4"
                onClick={() => {
                  setView("list");
                  setEditAction(null);
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
          <h3 className="text-xl font-extrabold text-foreground">Actions</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {seededActions.length} actions defined
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold h-10 px-5"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
          onClick={() => setView("form")}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Action
        </Button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search actions..."
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
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm w-12">
                  #
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Action Key
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Display Name
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Description
                </th>
                <th className="text-right py-4 px-5 font-bold text-foreground text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    setEditAction(a);
                    setView("form");
                  }}
                >
                  <td className="py-4 px-5 text-sm text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#F59E0B]" />
                      </div>
                      <span className="text-sm font-mono font-bold text-foreground">
                        {a.actionKey}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-foreground">
                    {a.actionName}
                  </td>
                  <td className="py-4 px-5 text-sm text-muted-foreground max-w-xs truncate">
                    {a.description}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil className="w-4 h-4" />
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
// SUB-SECTION: Tenant Audit Logs
// =====================================
function TenantAuditLogs() {
  const [search, setSearch] = useState("");
  const tenantLogs = mockAuditLogs.filter(
    (l) => l.tenant === "Apollo Hospitals Group",
  );
  const filtered = tenantLogs.filter(
    (l) =>
      !search ||
      l.summary.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-extrabold text-foreground">
          Tenant Audit Logs
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track all actions within this tenant
        </p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
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
                  Timestamp
                </th>
                <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                  Actor
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
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="py-4 px-5 text-sm text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-5 text-sm font-semibold text-foreground">
                    {log.actor}
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
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// =====================================
// MAIN: Tenant Admin Page
// =====================================
import { Fragment } from "react";

type TenantAdminTab = "dashboard" | "orgs" | "users" | "permissions" | "audit";

const tabs: { id: TenantAdminTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: Settings2 },
  { id: "orgs", label: "Organizations", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];

export function TenantAdminPage() {
  const [activeTab, setActiveTab] = useState<TenantAdminTab>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <TenantDashboard onNavigate={setActiveTab} />;
      case "orgs":
        return <OrgManagement />;
      case "users":
        return <UserManagement />;
      case "permissions":
        return <PermissionsView />;
      case "audit":
        return <TenantAuditLogs />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground">
          Tenant Administration
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          Manage organizations, users, roles, resources, and permissions
        </p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "text-white shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
            style={
              activeTab === tab.id
                ? { background: "linear-gradient(135deg, #00BCD4, #00838F)" }
                : {}
            }
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}

// =====================================
// Tenant Dashboard
// =====================================
function TenantDashboard({
  onNavigate,
}: {
  onNavigate: (tab: TenantAdminTab) => void;
}) {
  const stats = [
    {
      label: "Organizations",
      value: mockOrganizations.length,
      icon: Building2,
      color: "#00BCD4",
      tab: "orgs" as const,
    },
    {
      label: "Active Users",
      value: mockUsers.filter((u) => u.status === "Active").length,
      icon: Users,
      color: "#10B981",
      tab: "users" as const,
    },
    {
      label: "Roles",
      value: mockRoles.length,
      icon: Shield,
      color: "#8B5CF6",
      tab: "permissions" as const,
    },
    {
      label: "Resources",
      value: seededResources.length,
      icon: FolderTree,
      color: "#F59E0B",
      tab: "permissions" as const,
    },
  ];

  const quickLinks = [
    { label: "Create Organization", icon: Building2, tab: "orgs" as const },
    { label: "Create User", icon: UserPlus, tab: "users" as const },
    { label: "Permissions & Roles", icon: Shield, tab: "permissions" as const },
    { label: "Audit Logs", icon: ScrollText, tab: "audit" as const },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="border border-border shadow-sm cursor-pointer hover:border-[#00BCD4]/30 transition-all"
            onClick={() => onNavigate(s.tab)}
          >
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}15` }}
              >
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">
                  {s.value}
                </p>
                <p className="text-sm font-semibold text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
            Quick Links
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.tab)}
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-[#00BCD4]/40 hover:bg-[#00BCD4]/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center shrink-0">
                  <link.icon className="w-5 h-5 text-[#00BCD4]" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {link.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">
            Recent Activity
          </h3>
          <div className="flex flex-col gap-0">
            {mockAuditLogs
              .filter((l) => l.tenant === "Apollo Hospitals Group")
              .slice(0, 5)
              .map((log) => (
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
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
