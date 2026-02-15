"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Building2, Plus, Search, Eye, EyeOff, Pencil, MoreVertical, KeyRound, ScrollText,
  ArrowLeft, Save, Send, Users, X, Copy, CheckCircle2, AlertTriangle, Shield, Menu as MenuIcon,
  ChevronRight, ChevronDown, Layers, Lock, GripVertical, Power, Trash2,
  UserPlus, Settings2, FileText, Clock
} from "lucide-react"
import {
  mockOrganizations, mockUsers, mockRoles, mockPrivileges, mockMenus,
  mockAuditLogs, seededResources, seededActions,
  type Organization, type TenantUser, type Role, type Privilege, type MenuItem as MenuItemType,
  type ResourceDef, type ActionDef
} from "@/lib/rbac-data"

// =====================================
// SUB-SECTION: Organization Management
// =====================================
function OrgManagement() {
  const [view, setView] = useState<"list" | "create" | "detail">("list")
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [search, setSearch] = useState("")
  // Org admin states
  const [orgAdminName, setOrgAdminName] = useState("")
  const [orgAdminEmail, setOrgAdminEmail] = useState("")
  const [orgAdminUsername, setOrgAdminUsername] = useState("")
  const [orgAdminPassword, setOrgAdminPassword] = useState("")
  const [orgUseAutoPassword, setOrgUseAutoPassword] = useState(true)
  const [orgShowPassword, setOrgShowPassword] = useState(false)
  const [orgGenPassword, setOrgGenPassword] = useState<string | null>(null)
  const [orgCopied, setOrgCopied] = useState(false)
  const [orgSubmitted, setOrgSubmitted] = useState(false)

  const filtered = mockOrganizations.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase())
  )

  const generateOrgPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    const specials = "!@#$%&*"
    let pw = ""
    for (let i = 0; i < 10; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
    pw += specials.charAt(Math.floor(Math.random() * specials.length))
    pw += Math.floor(Math.random() * 10)
    return pw
  }

  const handleOrgCreate = () => {
    const pw = orgUseAutoPassword ? generateOrgPassword() : orgAdminPassword
    setOrgGenPassword(pw)
    setOrgSubmitted(true)
  }

  const handleOrgCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setOrgCopied(true)
    setTimeout(() => setOrgCopied(false), 2000)
  }

  const resetOrgForm = () => {
    setOrgAdminName(""); setOrgAdminEmail(""); setOrgAdminUsername("")
    setOrgAdminPassword(""); setOrgUseAutoPassword(true); setOrgShowPassword(false)
    setOrgGenPassword(null); setOrgCopied(false); setOrgSubmitted(false)
  }

  if (view === "create") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setView("list"); resetOrgForm() }} className="text-muted-foreground hover:text-foreground text-sm font-semibold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h3 className="text-xl font-extrabold text-foreground">Create Organization</h3>
            <p className="text-sm text-muted-foreground">Create a new organization with an Organization Admin account</p>
          </div>
        </div>

        {/* Success State */}
        {orgSubmitted && orgGenPassword && (
          <Card className="border-2 border-[#10B981]/30 shadow-sm" style={{ background: "rgba(16,185,129,0.03)" }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Organization Created Successfully</h3>
                  <p className="text-sm text-muted-foreground">Save the admin credentials below. The password is shown only once.</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-sm font-bold text-foreground mb-4">Organization Admin Login Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Admin Name</p>
                    <p className="text-sm font-bold text-foreground">{orgAdminName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-foreground">{orgAdminEmail || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Username</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">{orgAdminUsername}</code>
                      <Button variant="outline" size="sm" className="h-9 px-2.5" onClick={() => handleOrgCopy(orgAdminUsername)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Password <span className="text-[#EF4444] font-normal normal-case">(shown once)</span></p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm font-mono font-bold text-foreground">{orgGenPassword}</code>
                      <Button variant="outline" size="sm" className="h-9 px-2.5" onClick={() => handleOrgCopy(orgGenPassword || "")}>
                        {orgCopied ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                  <p className="text-xs text-[#F59E0B] font-medium">MustChangePassword = true. The admin must change this password on first login.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => { setView("list"); resetOrgForm() }}>Done</Button>
                <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => resetOrgForm()}>Create Another</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!orgSubmitted && (
          <>
            {/* Organization Details Card */}
            <Card className="border border-border shadow-sm"><CardContent className="p-6">
              <h3 className="text-base font-extrabold text-foreground mb-5 pb-3 border-b border-border">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Org Name <span className="text-[#EF4444]">*</span></Label><Input className="h-10" placeholder="e.g. Apollo Chennai - Main Campus" /></div>
                <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Org Code <span className="text-[#EF4444]">*</span></Label><Input className="h-10 font-mono" placeholder="e.g. APL-CHN-MAIN" /></div>
                <div className="flex flex-col gap-2 md:col-span-2"><Label className="text-sm font-bold text-foreground">Address</Label><Textarea className="min-h-[80px]" placeholder="Full address..." /></div>
                <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Contact Email</Label><Input type="email" className="h-10" placeholder="org-admin@hospital.com" /></div>
                <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Contact Phone</Label><Input className="h-10" placeholder="+91 XXXXX XXXXX" /></div>
                <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Status</Label>
                  <Select><SelectTrigger className="h-10"><SelectValue placeholder="Active" /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
                </div>
              </div>
            </CardContent></Card>

            {/* Organization Admin Account Card */}
            <Card className="border border-border shadow-sm"><CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-[#00BCD4]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Organization Admin Account</h3>
                  <p className="text-xs text-muted-foreground">This user will be the first admin for this organization. They can manage users and resources within the org.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Admin Full Name <span className="text-[#EF4444]">*</span></Label>
                  <Input className="h-10" placeholder="e.g. Dr. Priya Sharma" value={orgAdminName} onChange={e => setOrgAdminName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Admin Email <span className="text-[#EF4444]">*</span></Label>
                  <Input type="email" className="h-10" placeholder="e.g. priya.sharma@hospital.com" value={orgAdminEmail} onChange={e => setOrgAdminEmail(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Username <span className="text-[#EF4444]">*</span></Label>
                  <Input className="h-10 font-mono" placeholder="e.g. priya.sharma" value={orgAdminUsername} onChange={e => setOrgAdminUsername(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Used for login. Must be unique across the system.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Mobile Number</Label>
                  <Input className="h-10" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              {/* Password Section */}
              <div className="mt-5 pt-4 border-t border-border">
                <Label className="text-sm font-bold text-foreground mb-3 block">Password</Label>
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                    style={{ borderColor: orgUseAutoPassword ? "rgba(0,188,212,0.4)" : "var(--border)", background: orgUseAutoPassword ? "rgba(0,188,212,0.05)" : "transparent", color: orgUseAutoPassword ? "#00BCD4" : "var(--muted-foreground)" }}
                    onClick={() => setOrgUseAutoPassword(true)}>
                    <input type="radio" name="orgPwModeTenant" checked={orgUseAutoPassword} onChange={() => setOrgUseAutoPassword(true)} className="accent-[#00BCD4]" />
                    Auto-generate password
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm font-semibold"
                    style={{ borderColor: !orgUseAutoPassword ? "rgba(0,188,212,0.4)" : "var(--border)", background: !orgUseAutoPassword ? "rgba(0,188,212,0.05)" : "transparent", color: !orgUseAutoPassword ? "#00BCD4" : "var(--muted-foreground)" }}
                    onClick={() => setOrgUseAutoPassword(false)}>
                    <input type="radio" name="orgPwModeTenant" checked={!orgUseAutoPassword} onChange={() => setOrgUseAutoPassword(false)} className="accent-[#00BCD4]" />
                    Set password manually
                  </label>
                </div>

                {orgUseAutoPassword ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">A strong password will be auto-generated and shown once after creation.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-bold text-foreground">Password <span className="text-[#EF4444]">*</span></Label>
                      <div className="relative">
                        <Input type={orgShowPassword ? "text" : "password"} className="h-10 pr-10 font-mono" placeholder="Min 8 chars, uppercase, number, special"
                          value={orgAdminPassword} onChange={e => setOrgAdminPassword(e.target.value)} />
                        <button type="button" onClick={() => setOrgShowPassword(!orgShowPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {orgShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {orgAdminPassword.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1">
                          {[
                            { label: "At least 8 characters", valid: orgAdminPassword.length >= 8 },
                            { label: "Uppercase letter", valid: /[A-Z]/.test(orgAdminPassword) },
                            { label: "Number", valid: /[0-9]/.test(orgAdminPassword) },
                            { label: "Special character", valid: /[^A-Za-z0-9]/.test(orgAdminPassword) },
                          ].map(rule => (
                            <div key={rule.label} className="flex items-center gap-2">
                              {rule.valid ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                              <span className={`text-xs font-medium ${rule.valid ? "text-[#10B981]" : "text-[#F59E0B]"}`}>{rule.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-bold text-foreground">Confirm Password <span className="text-[#EF4444]">*</span></Label>
                      <Input type="password" className="h-10 font-mono" placeholder="Re-enter password" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                  <p className="text-xs text-[#F59E0B] font-medium">MustChangePassword will be set to true. The admin must change this password on first login.</p>
                </div>
              </div>
            </CardContent></Card>

            <div className="flex items-center gap-3">
              <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                onClick={handleOrgCreate} disabled={!orgAdminUsername.trim() || !orgAdminEmail.trim() || (!orgUseAutoPassword && orgAdminPassword.length < 8)}>
                <Save className="w-4 h-4 mr-1.5" /> Create Organization & Admin Account
              </Button>
              <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => { setView("list"); resetOrgForm() }}>Cancel</Button>
            </div>
          </>
        )}
      </div>
    )
  }

  if (view === "detail" && selectedOrg) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setView("list"); setSelectedOrg(null) }} className="text-muted-foreground hover:text-foreground text-sm font-semibold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1"><h3 className="text-xl font-extrabold text-foreground">{selectedOrg.name}</h3><p className="text-sm text-muted-foreground font-mono">{selectedOrg.code}</p></div>
          <Badge variant="outline" className={cn("text-sm font-semibold", selectedOrg.status === "Active" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10")}>{selectedOrg.status}</Badge>
        </div>
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Organization Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p><p className="text-sm font-bold text-foreground mt-1">{selectedOrg.address || "-"}</p></div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</p><p className="text-sm font-bold text-foreground mt-1">{selectedOrg.usersCount}</p></div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</p><p className="text-sm font-bold text-foreground mt-1">{selectedOrg.createdDate}</p></div>
          </div>
        </CardContent></Card>
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h4 className="text-base font-extrabold text-foreground">Assign Org Admins</h4>
            <Button variant="outline" className="text-sm font-semibold h-9 px-3"><UserPlus className="w-4 h-4 mr-1.5" /> Assign User</Button>
          </div>
          <p className="text-sm text-muted-foreground">Select existing tenant users and assign them as Organization Admin for this org. A user can be Org Admin in multiple orgs.</p>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-foreground">Organizations</h3><p className="text-sm text-muted-foreground mt-0.5">{mockOrganizations.length} organizations</p></div>
        <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => setView("create")}><Plus className="w-4 h-4 mr-1.5" /> Create Organization</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search organizations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
      <Card className="border border-border shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border" style={{ background: "rgba(0,188,212,0.03)" }}>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Org Name</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Code</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Users</th>
        <th className="text-right py-4 px-5 font-bold text-foreground text-sm">Actions</th>
      </tr></thead><tbody>
        {filtered.map(org => (
          <tr key={org.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedOrg(org); setView("detail") }}>
            <td className="py-4 px-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center"><Building2 className="w-4 h-4 text-[#00BCD4]" /></div><span className="text-sm font-bold text-foreground">{org.name}</span></div></td>
            <td className="py-4 px-5 text-sm font-mono text-muted-foreground">{org.code}</td>
            <td className="py-4 px-5"><Badge variant="outline" className={cn("text-xs font-semibold", org.status === "Active" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10")}>{org.status}</Badge></td>
            <td className="py-4 px-5 text-sm font-semibold text-foreground">{org.usersCount}</td>
            <td className="py-4 px-5 text-right"><Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]" onClick={e => { e.stopPropagation(); setSelectedOrg(org); setView("detail") }}><Eye className="w-4 h-4" /></Button></td>
          </tr>
        ))}
      </tbody></table></div></Card>
    </div>
  )
}

// =====================================
// SUB-SECTION: User Management
// =====================================
function UserManagement() {
  const [view, setView] = useState<"list" | "create" | "detail">("list")
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null)
  const [search, setSearch] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const filtered = mockUsers.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (view === "create") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setView("list"); setGeneratedPassword(null) }} className="text-muted-foreground hover:text-foreground text-sm font-semibold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">Create User</h3>
        </div>
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Full Name <span className="text-[#EF4444]">*</span></Label><Input className="h-10" placeholder="Full name" /></div>
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Email <span className="text-[#EF4444]">*</span></Label><Input type="email" className="h-10" placeholder="user@hospital.com" /></div>
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Mobile</Label><Input className="h-10" placeholder="+91 XXXXX XXXXX" /></div>
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Default Organization</Label>
              <Select><SelectTrigger className="h-10"><SelectValue placeholder="Select org" /></SelectTrigger><SelectContent>{mockOrganizations.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div className="mb-5"><Label className="text-sm font-bold text-foreground mb-2 block">Initial Org Memberships</Label>
            <div className="flex flex-wrap gap-2">{mockOrganizations.map(o => (
              <label key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-[#00BCD4]/40 cursor-pointer text-sm"><Checkbox />{o.name}</label>
            ))}</div>
          </div>

          {generatedPassword && (
            <div className="rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 p-4 mb-5">
              <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-5 h-5 text-[#10B981]" /><p className="text-sm font-bold text-[#10B981]">User Created Successfully</p></div>
              <p className="text-xs text-muted-foreground mb-2">Default password (shown once only):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm font-mono font-bold text-foreground">{generatedPassword}</code>
                <Button variant="outline" size="sm" className="h-9" onClick={() => { navigator.clipboard.writeText(generatedPassword); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                  {copied ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">MustChangePassword = true</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-5 border-t border-border">
            {!generatedPassword ? (
              <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                onClick={() => setGeneratedPassword(`Temp@${Math.random().toString(36).slice(2, 10).toUpperCase()}`)}><Send className="w-4 h-4 mr-1.5" /> Create User</Button>
            ) : null}
            <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => { setView("list"); setGeneratedPassword(null) }}>{generatedPassword ? "Done" : "Cancel"}</Button>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  if (view === "detail" && selectedUser) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setView("list"); setSelectedUser(null) }} className="text-muted-foreground hover:text-foreground text-sm font-semibold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex-1"><h3 className="text-xl font-extrabold text-foreground">{selectedUser.name}</h3><p className="text-sm text-muted-foreground">{selectedUser.email}</p></div>
          <Badge variant="outline" className={cn("text-sm font-semibold", selectedUser.status === "Active" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10")}>{selectedUser.status}</Badge>
        </div>

        {/* Profile */}
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile</p><p className="text-sm font-bold text-foreground mt-1">{selectedUser.mobile || "-"}</p></div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</p><p className="text-sm font-bold text-foreground mt-1">{selectedUser.createdDate}</p></div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Login</p><p className="text-sm font-bold text-foreground mt-1">{selectedUser.lastLogin || "-"}</p></div>
          </div>
        </CardContent></Card>

        {/* Org Memberships */}
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Organization Memberships</h4>
          <table className="w-full"><thead><tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-bold text-foreground text-sm">Organization</th>
            <th className="text-left py-3 px-4 font-bold text-foreground text-sm">Status</th>
            <th className="text-left py-3 px-4 font-bold text-foreground text-sm">Roles</th>
            <th className="text-left py-3 px-4 font-bold text-foreground text-sm">Default</th>
          </tr></thead><tbody>
            {selectedUser.orgMemberships.map(m => (
              <tr key={m.orgId} className="border-b border-border last:border-0">
                <td className="py-3 px-4 text-sm font-semibold text-foreground">{m.orgName}</td>
                <td className="py-3 px-4"><Badge variant="outline" className={cn("text-xs font-semibold", m.status === "Active" ? "border-[#10B981]/30 text-[#10B981]" : "border-[#EF4444]/30 text-[#EF4444]")}>{m.status}</Badge></td>
                <td className="py-3 px-4"><div className="flex flex-wrap gap-1">{m.roles.map(r => { const role = mockRoles.find(rl => rl.id === r); return <Badge key={r} variant="outline" className="text-xs font-medium border-[#00BCD4]/30 text-[#00BCD4]">{role?.name || r}</Badge> })}</div></td>
                <td className="py-3 px-4">{m.isDefault ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <span className="text-xs text-muted-foreground">-</span>}</td>
              </tr>
            ))}
          </tbody></table>
        </CardContent></Card>

        {/* Security */}
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <h4 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Security</h4>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-sm font-semibold h-10 px-4"><KeyRound className="w-4 h-4 mr-1.5" /> Reset Password</Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">MustChangePassword:</span>
              <Badge variant="outline" className={cn("text-xs font-semibold", selectedUser.mustChangePassword ? "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10" : "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10")}>{selectedUser.mustChangePassword ? "Yes" : "No"}</Badge>
            </div>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-foreground">Users</h3><p className="text-sm text-muted-foreground mt-0.5">{mockUsers.length} users</p></div>
        <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => setView("create")}><Plus className="w-4 h-4 mr-1.5" /> Create User</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
      <Card className="border border-border shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border" style={{ background: "rgba(0,188,212,0.03)" }}>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Name</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Email</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Default Org</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Memberships</th>
        <th className="text-right py-4 px-5 font-bold text-foreground text-sm">Actions</th>
      </tr></thead><tbody>
        {filtered.map(u => (
          <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setSelectedUser(u); setView("detail") }}>
            <td className="py-4 px-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-[#00BCD4]/10 flex items-center justify-center text-xs font-bold text-[#00BCD4]">{u.name.split(" ").map(n => n[0]).join("")}</div><span className="text-sm font-bold text-foreground">{u.name}</span></div></td>
            <td className="py-4 px-5 text-sm text-muted-foreground">{u.email}</td>
            <td className="py-4 px-5"><Badge variant="outline" className={cn("text-xs font-semibold", u.status === "Active" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10")}>{u.status}</Badge></td>
            <td className="py-4 px-5 text-sm text-foreground">{mockOrganizations.find(o => o.id === u.defaultOrgId)?.name || "-"}</td>
            <td className="py-4 px-5 text-sm font-semibold text-foreground">{u.orgMemberships.length}</td>
            <td className="py-4 px-5 text-right">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]" onClick={e => { e.stopPropagation(); setSelectedUser(u); setView("detail") }}><Eye className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]" onClick={e => e.stopPropagation()}><KeyRound className="w-4 h-4" /></Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody></table></div></Card>
    </div>
  )
}

// =====================================
// SUB-SECTION: Role Management
// =====================================
function RoleManagement() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [search, setSearch] = useState("")

  const filtered = mockRoles.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()))

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setView("list"); setEditRole(null) }} className="text-muted-foreground hover:text-foreground text-sm font-semibold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">{editRole ? "Edit Role" : "Create Role"}</h3>
        </div>
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Role Name <span className="text-[#EF4444]">*</span></Label><Input className="h-10" placeholder="e.g. Maintenance Manager" defaultValue={editRole?.name} /></div>
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Role Code <span className="text-[#EF4444]">*</span></Label><Input className="h-10 font-mono" placeholder="e.g. MAINT_MANAGER" defaultValue={editRole?.code} /></div>
            <div className="flex flex-col gap-2 md:col-span-2"><Label className="text-sm font-bold text-foreground">Description</Label><Textarea className="min-h-[60px]" placeholder="Role description..." defaultValue={editRole?.description} /></div>
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Status</Label>
              <Select defaultValue={editRole?.status || "Active"}><SelectTrigger className="h-10"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select>
            </div>
          </div>
          <div className="mb-5">
            <Label className="text-sm font-bold text-foreground mb-3 block">Privileges (multi-select)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mockPrivileges.map(p => (
                <label key={p.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-[#00BCD4]/40 cursor-pointer transition-colors">
                  <Checkbox className="mt-0.5" defaultChecked={editRole?.privileges.includes(p.id)} />
                  <div><p className="text-sm font-semibold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.description}</p></div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-5 border-t border-border">
            <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => { setView("list"); setEditRole(null) }}><Save className="w-4 h-4 mr-1.5" /> Save</Button>
            <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => { setView("list"); setEditRole(null) }}>Cancel</Button>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-foreground">Roles</h3><p className="text-sm text-muted-foreground mt-0.5">{mockRoles.length} roles</p></div>
        <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => setView("form")}><Plus className="w-4 h-4 mr-1.5" /> Create Role</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search roles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(role => (
          <Card key={role.id} className="border border-border shadow-sm hover:border-[#00BCD4]/30 transition-all cursor-pointer" onClick={() => { setEditRole(role); setView("form") }}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00BCD4]/10 flex items-center justify-center"><Shield className="w-5 h-5 text-[#00BCD4]" /></div>
                  <div><p className="text-sm font-bold text-foreground">{role.name}</p><p className="text-xs text-muted-foreground font-mono">{role.code}</p></div>
                </div>
                <Badge variant="outline" className={cn("text-xs font-semibold", role.status === "Active" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/10")}>{role.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{role.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">{role.privileges.slice(0, 3).map(pId => { const p = mockPrivileges.find(pr => pr.id === pId); return <Badge key={pId} variant="outline" className="text-[10px] font-medium">{p?.name || pId}</Badge> })}{role.privileges.length > 3 && <Badge variant="outline" className="text-[10px] font-medium">+{role.privileges.length - 3}</Badge>}</div>
                <span className="text-xs text-muted-foreground font-medium">{role.assignedUsersCount} users</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// =====================================
// SUB-SECTION: Privilege Management
// =====================================
function PrivilegeManagement() {
  const [view, setView] = useState<"list" | "form">("list")
  const [editPriv, setEditPriv] = useState<Privilege | null>(null)
  const [search, setSearch] = useState("")

  const filtered = mockPrivileges.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))

  if (view === "form") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setView("list"); setEditPriv(null) }} className="text-muted-foreground hover:text-foreground text-sm font-semibold"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="h-6 w-px bg-border" />
          <h3 className="text-xl font-extrabold text-foreground">{editPriv ? `Edit: ${editPriv.name}` : "Create Privilege"}</h3>
        </div>
        <Card className="border border-border shadow-sm"><CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Privilege Name <span className="text-[#EF4444]">*</span></Label><Input className="h-10" placeholder="e.g. Asset Management" defaultValue={editPriv?.name} /></div>
            <div className="flex flex-col gap-2"><Label className="text-sm font-bold text-foreground">Code <span className="text-[#EF4444]">*</span></Label><Input className="h-10 font-mono" placeholder="e.g. ASSET_MGMT" defaultValue={editPriv?.code} /></div>
            <div className="flex flex-col gap-2 md:col-span-2"><Label className="text-sm font-bold text-foreground">Description</Label><Textarea className="min-h-[60px]" defaultValue={editPriv?.description} /></div>
          </div>

          {/* Mapped Menus */}
          <div className="mb-5">
            <Label className="text-sm font-bold text-foreground mb-3 block">Mapped Menus</Label>
            <div className="flex flex-wrap gap-2">
              {editPriv?.menus.map(m => <Badge key={m} variant="outline" className="text-sm font-medium border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/5 px-3 py-1">{m}</Badge>) || <p className="text-sm text-muted-foreground">No menus mapped yet</p>}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="mb-5">
            <Label className="text-sm font-bold text-foreground mb-3 block">Permissions (Resource + Actions)</Label>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-bold text-foreground text-sm w-48">Resource</th>
                  {seededActions.slice(0, 8).map(a => <th key={a.code} className="text-center py-3 px-2 font-bold text-foreground text-xs">{a.name}</th>)}
                </tr></thead>
                <tbody>
                  {(editPriv?.permissions || []).map(perm => (
                    <tr key={perm.resource} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="py-3 px-4 text-sm font-semibold text-foreground">{seededResources.find(r => r.code === perm.resource)?.name || perm.resource}</td>
                      {seededActions.slice(0, 8).map(a => (
                        <td key={a.code} className="text-center py-3 px-2">
                          <Checkbox checked={perm.actions.includes(a.code)} className="mx-auto" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-5 border-t border-border">
            <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => { setView("list"); setEditPriv(null) }}><Save className="w-4 h-4 mr-1.5" /> Save</Button>
            <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => { setView("list"); setEditPriv(null) }}>Cancel</Button>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-foreground">Privileges</h3><p className="text-sm text-muted-foreground mt-0.5">{mockPrivileges.length} privilege bundles</p></div>
        <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={() => setView("form")}><Plus className="w-4 h-4 mr-1.5" /> Create Privilege</Button>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search privileges..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
      <Card className="border border-border shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border" style={{ background: "rgba(0,188,212,0.03)" }}>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Privilege</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Code</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Menus</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Permissions</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
        <th className="text-right py-4 px-5 font-bold text-foreground text-sm">Actions</th>
      </tr></thead><tbody>
        {filtered.map(p => (
          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => { setEditPriv(p); setView("form") }}>
            <td className="py-4 px-5"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center"><Layers className="w-4 h-4 text-[#00BCD4]" /></div><div><p className="text-sm font-bold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.description.substring(0, 50)}...</p></div></div></td>
            <td className="py-4 px-5 text-sm font-mono text-muted-foreground">{p.code}</td>
            <td className="py-4 px-5"><div className="flex flex-wrap gap-1">{p.menus.slice(0, 2).map(m => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}{p.menus.length > 2 && <Badge variant="outline" className="text-[10px]">+{p.menus.length - 2}</Badge>}</div></td>
            <td className="py-4 px-5 text-sm font-semibold text-foreground">{p.permissions.length} resources</td>
            <td className="py-4 px-5"><Badge variant="outline" className="text-xs font-semibold border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10">{p.status}</Badge></td>
            <td className="py-4 px-5 text-right"><Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#00BCD4]"><Pencil className="w-4 h-4" /></Button></td>
          </tr>
        ))}
      </tbody></table></div></Card>
    </div>
  )
}

// =====================================
// SUB-SECTION: Menu Builder
// =====================================
function MenuBuilder() {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["M-002", "M-006"])

  const topMenus = mockMenus.filter(m => !m.parentId)

  const toggleExpand = (id: string) => {
    setExpandedMenus(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-foreground">Menu Builder</h3><p className="text-sm text-muted-foreground mt-0.5">Configure navigation menu structure and privilege mapping</p></div>
        <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}><Plus className="w-4 h-4 mr-1.5" /> Add Menu Item</Button>
      </div>

      <Card className="border border-border shadow-sm"><CardContent className="p-6">
        <div className="flex flex-col gap-1">
          {topMenus.map(menu => {
            const isExpanded = expandedMenus.includes(menu.id)
            const hasChildren = menu.children && menu.children.length > 0

            return (
              <div key={menu.id}>
                <div className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted/30 transition-colors group">
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                  {hasChildren ? (
                    <button onClick={() => toggleExpand(menu.id)} className="text-muted-foreground hover:text-foreground">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : <div className="w-4" />}
                  <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center"><MenuIcon className="w-4 h-4 text-[#00BCD4]" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{menu.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{menu.route}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs font-semibold", menu.status === "Active" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" : "border-[#EF4444]/30 text-[#EF4444]")}>{menu.status}</Badge>
                    <span className="text-xs text-muted-foreground">Order: {menu.sortOrder}</span>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-[#00BCD4] opacity-0 group-hover:opacity-100"><Pencil className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-14 border-l-2 border-[#00BCD4]/15 pl-4">
                    {menu.children!.map(child => (
                      <div key={child.id} className="flex items-center gap-3 py-2.5 px-4 rounded-lg hover:bg-muted/30 transition-colors group">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                        <div className="w-6 h-6 rounded bg-muted flex items-center justify-center"><MenuIcon className="w-3 h-3 text-muted-foreground" /></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{child.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{child.route}</p>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10">{child.status}</Badge>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-[#00BCD4] opacity-0 group-hover:opacity-100"><Pencil className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent></Card>
    </div>
  )
}

// =====================================
// SUB-SECTION: Resource & Action Catalog
// =====================================
function ResourceCatalog() {
  const [activeView, setActiveView] = useState<"resources" | "actions">("resources")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-extrabold text-foreground">Resource & Action Catalog</h3>
        <p className="text-sm text-muted-foreground mt-0.5">View seeded resources and actions for RBAC configuration</p>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border w-fit">
        {[{ id: "resources" as const, label: "Resources", count: seededResources.length }, { id: "actions" as const, label: "Actions", count: seededActions.length }].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              activeView === tab.id ? "text-white shadow-md" : "text-muted-foreground hover:text-foreground"
            )} style={activeView === tab.id ? { background: "linear-gradient(135deg, #00BCD4, #00838F)" } : {}}>
            {tab.label} <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full", activeView === tab.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeView === "resources" ? (
        <Card className="border border-border shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border" style={{ background: "rgba(0,188,212,0.03)" }}>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm w-12">#</th>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Resource Code</th>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Display Name</th>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
        </tr></thead><tbody>
          {seededResources.map((r, i) => (
            <tr key={r.code} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="py-3 px-5 text-sm text-muted-foreground">{i + 1}</td>
              <td className="py-3 px-5 text-sm font-mono font-bold text-foreground">{r.code}</td>
              <td className="py-3 px-5 text-sm text-foreground">{r.name}</td>
              <td className="py-3 px-5"><Badge variant="outline" className="text-xs font-semibold border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10">{r.status}</Badge></td>
            </tr>
          ))}
        </tbody></table></div></Card>
      ) : (
        <Card className="border border-border shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border" style={{ background: "rgba(0,188,212,0.03)" }}>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm w-12">#</th>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Action Code</th>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Display Name</th>
          <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
        </tr></thead><tbody>
          {seededActions.map((a, i) => (
            <tr key={a.code} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="py-3 px-5 text-sm text-muted-foreground">{i + 1}</td>
              <td className="py-3 px-5 text-sm font-mono font-bold text-foreground">{a.code}</td>
              <td className="py-3 px-5 text-sm text-foreground">{a.name}</td>
              <td className="py-3 px-5"><Badge variant="outline" className="text-xs font-semibold border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10">{a.status}</Badge></td>
            </tr>
          ))}
        </tbody></table></div></Card>
      )}
    </div>
  )
}

// =====================================
// SUB-SECTION: Tenant Audit Logs
// =====================================
function TenantAuditLogs() {
  const [search, setSearch] = useState("")
  const tenantLogs = mockAuditLogs.filter(l => l.tenant === "Apollo Hospitals Group")
  const filtered = tenantLogs.filter(l =>
    !search || l.summary.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div><h3 className="text-xl font-extrabold text-foreground">Tenant Audit Logs</h3><p className="text-sm text-muted-foreground mt-0.5">Track all actions within this tenant</p></div>
      <div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-10" /></div>
      <Card className="border border-border shadow-sm"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border" style={{ background: "rgba(0,188,212,0.03)" }}>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Timestamp</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Actor</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Entity</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Action</th>
        <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Summary</th>
      </tr></thead><tbody>
        {filtered.map(log => (
          <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30">
            <td className="py-4 px-5 text-sm text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
            <td className="py-4 px-5 text-sm font-semibold text-foreground">{log.actor}</td>
            <td className="py-4 px-5 text-sm text-foreground">{log.entity}</td>
            <td className="py-4 px-5"><Badge variant="outline" className={cn("text-xs font-semibold",
              log.action === "CREATE" ? "border-[#10B981]/30 text-[#10B981] bg-[#10B981]/10" :
              log.action === "UPDATE" ? "border-[#00BCD4]/30 text-[#00BCD4] bg-[#00BCD4]/10" :
              "border-border"
            )}>{log.action}</Badge></td>
            <td className="py-4 px-5 text-sm text-foreground max-w-xs truncate">{log.summary}</td>
          </tr>
        ))}
      </tbody></table></div></Card>
    </div>
  )
}

// =====================================
// MAIN: Tenant Admin Page
// =====================================
type TenantAdminTab = "dashboard" | "orgs" | "users" | "roles" | "privileges" | "menus" | "resources" | "audit"

const tabs: { id: TenantAdminTab, label: string, icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: Settings2 },
  { id: "orgs", label: "Organizations", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "privileges", label: "Privileges", icon: Layers },
  { id: "menus", label: "Menu Builder", icon: MenuIcon },
  { id: "resources", label: "Resources", icon: Lock },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
]

export function TenantAdminPage() {
  const [activeTab, setActiveTab] = useState<TenantAdminTab>("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <TenantDashboard onNavigate={setActiveTab} />
      case "orgs": return <OrgManagement />
      case "users": return <UserManagement />
      case "roles": return <RoleManagement />
      case "privileges": return <PrivilegeManagement />
      case "menus": return <MenuBuilder />
      case "resources": return <ResourceCatalog />
      case "audit": return <TenantAuditLogs />
      default: return null
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-foreground">Tenant Administration</h2>
        <p className="text-base text-muted-foreground mt-1">Manage organizations, users, roles, privileges, and menus</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === tab.id ? "text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )} style={activeTab === tab.id ? { background: "linear-gradient(135deg, #00BCD4, #00838F)" } : {}}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

// =====================================
// Tenant Dashboard
// =====================================
function TenantDashboard({ onNavigate }: { onNavigate: (tab: TenantAdminTab) => void }) {
  const stats = [
    { label: "Organizations", value: mockOrganizations.length, icon: Building2, color: "#00BCD4", tab: "orgs" as const },
    { label: "Active Users", value: mockUsers.filter(u => u.status === "Active").length, icon: Users, color: "#10B981", tab: "users" as const },
    { label: "Inactive Users", value: mockUsers.filter(u => u.status === "Inactive").length, icon: Users, color: "#F59E0B", tab: "users" as const },
    { label: "Roles", value: mockRoles.length, icon: Shield, color: "#8B5CF6", tab: "roles" as const },
  ]

  const quickLinks = [
    { label: "Create Organization", icon: Building2, tab: "orgs" as const },
    { label: "Create User", icon: UserPlus, tab: "users" as const },
    { label: "Roles & Privileges", icon: Shield, tab: "roles" as const },
    { label: "Menu Builder", icon: MenuIcon, tab: "menus" as const },
    { label: "Audit Logs", icon: ScrollText, tab: "audit" as const },
    { label: "Resource Catalog", icon: Lock, tab: "resources" as const },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="border border-border shadow-sm cursor-pointer hover:border-[#00BCD4]/30 transition-all" onClick={() => onNavigate(s.tab)}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-sm font-semibold text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickLinks.map(link => (
              <button key={link.label} onClick={() => onNavigate(link.tab)}
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-[#00BCD4]/40 hover:bg-[#00BCD4]/5 transition-all text-left">
                <div className="w-10 h-10 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center flex-shrink-0">
                  <link.icon className="w-5 h-5 text-[#00BCD4]" />
                </div>
                <span className="text-sm font-semibold text-foreground">{link.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-base font-extrabold text-foreground mb-4 pb-3 border-b border-border">Recent Activity</h3>
          <div className="flex flex-col gap-0">
            {mockAuditLogs.filter(l => l.tenant === "Apollo Hospitals Group").slice(0, 5).map(log => (
              <div key={log.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5"><Clock className="w-4 h-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{log.summary}</p>
                  <p className="text-xs text-muted-foreground">{log.actor} &middot; {log.timestamp}</p>
                </div>
                <Badge variant="outline" className="text-xs font-medium flex-shrink-0">{log.action}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
