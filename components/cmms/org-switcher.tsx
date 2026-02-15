"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Building2, ChevronDown, CheckCircle2 } from "lucide-react"
import { mockOrganizations } from "@/lib/rbac-data"

export function OrgSwitcher() {
  const [activeOrgId, setActiveOrgId] = useState("ORG-001")
  const activeOrg = mockOrganizations.find(o => o.id === activeOrgId)
  const availableOrgs = mockOrganizations.filter(o => o.status === "Active")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "rgba(0,188,212,0.1)", border: "1px solid rgba(0,188,212,0.2)" }}>
          <div className="w-2 h-2 rounded-full bg-[#00BCD4] animate-pulse" />
          <span className="text-sm font-semibold" style={{ color: "#00BCD4" }}>
            {activeOrg?.name || "Select Organization"}
          </span>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "#00BCD4" }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-3 py-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Switch Organization</p>
        </div>
        <DropdownMenuSeparator />
        {availableOrgs.map(org => (
          <DropdownMenuItem key={org.id} className="cursor-pointer px-3 py-2.5 gap-3" onClick={() => setActiveOrgId(org.id)}>
            <div className="w-8 h-8 rounded-lg bg-[#00BCD4]/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-[#00BCD4]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{org.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{org.code}</p>
            </div>
            {org.id === activeOrgId && <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
