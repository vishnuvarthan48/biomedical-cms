"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Activity, LayoutDashboard, Wrench, ClipboardList, CalendarClock,
  Gauge, Package, BarChart3, ShieldCheck, Bell, Search, ChevronLeft,
  ChevronRight, LogOut, Settings, Menu, X, Building2, Users, Shield,
  Layers, ScrollText, Lock, KeyRound, Cpu, Warehouse, ClipboardCheck, Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DashboardPage } from "./dashboard-page"
import { AssetRegistrationPage } from "./asset-registration-page"
import { AssetRegistrationForm } from "./asset-registration-form"
import { WorkOrdersPage } from "./work-orders-page"
import { PreventiveMaintenancePage } from "./preventive-maintenance-page"
import { CalibrationPage } from "./calibration-page"
import { ReportsPage } from "./reports-page"
import { CompliancePage } from "./compliance-page"
import { PlatformAdminPage } from "./platform-admin-page"
import { TenantAdminPage } from "./tenant-admin-page"
import { DeviceManagementPage } from "./device-management-page"
import { StoreMasterPage } from "./store-master-page"
import { ItemMasterPage } from "./item-master-page"
import { GrnPage } from "./grn-page"
import { VendorRegistrationPage } from "./vendor-registration-page"
import { OrgSwitcher } from "./org-switcher"
import type { LoginRole } from "./login-screen"

type NavItem = {
  id: string
  label: string
  icon: React.ElementType
  section: string
  roles?: LoginRole[]
}

const navItems: NavItem[] = [
  // CMMS Operations
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { id: "assets", label: "Asset Registration", icon: Wrench, section: "Asset Management" },
  { id: "devices", label: "Device Management", icon: Cpu, section: "Asset Management" },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList, section: "Maintenance" },
  { id: "pm", label: "Preventive Maintenance", icon: CalendarClock, section: "Maintenance" },
  { id: "calibration", label: "Calibration", icon: Gauge, section: "Maintenance" },
  { id: "store-master", label: "Store Master", icon: Warehouse, section: "Operations" },
  { id: "item-master", label: "Item Master", icon: Package, section: "Operations" },
  { id: "grn", label: "GRN", icon: ClipboardCheck, section: "Operations" },
  { id: "vendors", label: "Vendor Registration", icon: Building, section: "Operations" },
  { id: "reports", label: "Reports", icon: BarChart3, section: "Analytics" },
  { id: "compliance", label: "Compliance", icon: ShieldCheck, section: "Analytics" },
  // Tenant Admin
  { id: "tenant-admin", label: "Administration", icon: Shield, section: "Administration", roles: ["tenant-admin", "platform-admin"] },
  // Platform Admin
  { id: "platform-admin", label: "Platform Console", icon: KeyRound, section: "Platform", roles: ["platform-admin"] },
]

export function AppShell({ onLogout, userRole = "user" }: { onLogout: () => void; userRole?: LoginRole }) {
  const [activePage, setActivePage] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [editAssetId, setEditAssetId] = useState<string | null>(null)

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(n => !n.roles || n.roles.includes(userRole))
  const sections = Array.from(new Set(visibleNavItems.map(n => n.section)))

  const renderPage = () => {
    if (showAssetForm) return null
    switch (activePage) {
      case "dashboard": return <DashboardPage onNavigate={setActivePage} />
      case "assets": return <AssetRegistrationPage
        onRegister={() => { setEditAssetId(null); setShowAssetForm(true) }}
        onEdit={(id) => { setEditAssetId(id); setShowAssetForm(true) }}
      />
      case "devices": return <DeviceManagementPage />
      case "work-orders": return <WorkOrdersPage />
      case "pm": return <PreventiveMaintenancePage />
      case "calibration": return <CalibrationPage />
      case "store-master": return <StoreMasterPage />
      case "item-master": return <ItemMasterPage />
      case "grn": return <GrnPage />
      case "vendors": return <VendorRegistrationPage />
      case "reports": return <ReportsPage />
      case "compliance": return <CompliancePage />
      case "tenant-admin": return <TenantAdminPage />
      case "platform-admin": return <PlatformAdminPage />
      default: return <DashboardPage onNavigate={setActivePage} />
    }
  }

  const activeLabel = visibleNavItems.find(n => n.id === activePage)?.label || "Dashboard"

  const roleLabel = userRole === "platform-admin" ? "Platform Admin" : userRole === "tenant-admin" ? "Tenant Admin" : "BME Manager"
  const roleInitials = userRole === "platform-admin" ? "PA" : userRole === "tenant-admin" ? "TA" : "AK"
  const userName = userRole === "platform-admin" ? "Platform Admin" : userRole === "tenant-admin" ? "Arjun Kumar" : "Admin User"

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00E5CC)" }}>
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-extrabold text-white leading-tight tracking-tight">
              Bio<span style={{ color: "#00BCD4" }}>Med</span>
            </h1>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#00BCD4" }}>CMMS Platform</p>
          </div>
        )}
      </div>

      <div className="mx-4 mb-2" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,188,212,0.2), transparent)" }} />

      {/* Role Badge */}
      {!sidebarCollapsed && (
        <div className="mx-4 mb-3">
          <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(0,188,212,0.08)", border: "1px solid rgba(0,188,212,0.15)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00BCD4" }}>Logged in as</p>
            <p className="text-sm font-bold text-white mt-0.5">{roleLabel}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {sections.map(section => (
          <div key={section} className="mb-5">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2.5 text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: "#00BCD4" }}>
                {section}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {visibleNavItems.filter(n => n.section === section).map(item => {
                const Icon = item.icon
                const isActive = activePage === item.id
                const isAdmin = item.section === "Administration" || item.section === "Platform"
                return (
                  <button key={item.id}
                    onClick={() => { setActivePage(item.id); setShowAssetForm(false); setMobileOpen(false) }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left",
                      isActive
                        ? "text-white"
                        : "text-[#8899B0] hover:text-white hover:bg-white/5"
                    )}
                    style={isActive ? {
                      background: isAdmin
                        ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.08))"
                        : "linear-gradient(135deg, rgba(0,188,212,0.18), rgba(0,188,212,0.08))",
                      borderLeft: `3px solid ${isAdmin ? "#8B5CF6" : "#00BCD4"}`,
                    } : { borderLeft: "3px solid transparent" }}
                  >
                    <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? (isAdmin ? "text-[#8B5CF6]" : "text-[#00BCD4]") : "")} />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4" style={{ borderTop: "1px solid rgba(0,188,212,0.1)" }}>
        <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-3")}>
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="text-xs font-bold text-white" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
              {roleInitials}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-xs font-medium truncate" style={{ color: "#00BCD4" }}>{roleLabel}</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button onClick={onLogout} className="text-[#64748B] hover:text-[#EF4444] transition-colors" title="Sign out">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#EDF2F7" }}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 relative z-10",
        sidebarCollapsed ? "w-[72px]" : "w-[270px]"
      )} style={{
        background: "linear-gradient(180deg, #0D1B2A 0%, #152238 100%)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
      }}>
        <SidebarContent />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full flex items-center justify-center border-2 text-white transition-all z-20"
          style={{ background: "#1B2A4A", borderColor: "#00BCD4" }}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[270px] z-50" style={{ background: "linear-gradient(180deg, #0D1B2A 0%, #152238 100%)" }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {showAssetForm ? (
          <AssetRegistrationForm onBack={() => { setShowAssetForm(false); setEditAssetId(null) }} editAssetId={editAssetId} />
        ) : (
          <>
            {/* Top Bar */}
            <header className="h-16 flex items-center justify-between px-6 flex-shrink-0 border-b"
              style={{
                background: "linear-gradient(135deg, #1B2A4A, #1E3050)",
                borderColor: "rgba(0,188,212,0.15)"
              }}>
              <div className="flex items-center gap-4">
                <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: "#8899B0" }}>Home</span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "#4A5E78" }} />
                  <span className="text-sm font-bold text-white">{activeLabel}</span>
                </div>
                <div className="hidden md:block relative ml-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#4A5E78" }} />
                  <input
                    placeholder="Search assets, work orders..."
                    className="pl-10 w-72 h-9 rounded-lg text-sm text-white placeholder:text-[#4A5E78] outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Org Switcher -- only for non-platform-admin */}
                {userRole !== "platform-admin" && (
                  <div className="hidden lg:block">
                    <OrgSwitcher />
                  </div>
                )}
                {userRole === "platform-admin" && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                    <span className="text-sm font-semibold" style={{ color: "#8B5CF6" }}>Platform Console</span>
                  </div>
                )}
                <button className="relative p-2 rounded-lg transition-colors" style={{ color: "#8899B0" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                </button>
                <button className="p-2 rounded-lg transition-colors" style={{ color: "#8899B0" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Teal accent line */}
            <div className="h-[2px] flex-shrink-0" style={{ background: "linear-gradient(90deg, #00BCD4, #00E5CC, transparent 80%)" }} />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6" style={{ background: "#EDF2F7" }}>
              {renderPage()}
            </main>
          </>
        )}
      </div>
    </div>
  )
}
