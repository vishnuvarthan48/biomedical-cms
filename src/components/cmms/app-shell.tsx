"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/src/lib/utils";
import {
  Activity,
  LayoutDashboard,
  Wrench,
  ClipboardList,
  CalendarClock,
  Gauge,
  Package,
  BarChart3,
  ShieldCheck,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Menu,
  Cpu,
  Warehouse,
  ClipboardCheck,
  Building,
  ArrowRightLeft,
  Shield,
  KeyRound,
  Ticket,
  Smartphone,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { OrgSwitcher } from "@/src/components/cmms/org-switcher";
import { MODULES, ROUTES } from "@/src/constants/modules";
import { useAuth } from "@/src/context/auth-context";
import type { LoginRole } from "@/src/components/cmms/login-screen";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  section: string;
  path: string;
  roles?: LoginRole[];
};

const allRolesExceptEndUser: LoginRole[] = ["platform-admin", "tenant-admin", "user"];

const navItems: NavItem[] = [
  {
    id: MODULES.DASHBOARD,
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
    path: ROUTES.DASHBOARD,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.ASSETS,
    label: "Asset Registration",
    icon: Wrench,
    section: "Asset Management",
    path: ROUTES.ASSETS,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.DEVICES,
    label: "Device Management",
    icon: Cpu,
    section: "Asset Management",
    path: ROUTES.DEVICES,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.ASSET_TRANSFER,
    label: "Asset Transfer",
    icon: ArrowRightLeft,
    section: "Asset Management",
    path: ROUTES.ASSET_TRANSFER,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.WORK_ORDERS,
    label: "Work Orders",
    icon: ClipboardList,
    section: "Maintenance",
    path: ROUTES.WORK_ORDERS,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.PM,
    label: "Preventive Maintenance",
    icon: CalendarClock,
    section: "Maintenance",
    path: ROUTES.PM,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.TICKET_REGISTRATION,
    label: "Ticket Registration",
    icon: Ticket,
    section: "Ticket Management",
    path: ROUTES.TICKET_REGISTRATION,
  },
  {
    id: MODULES.TICKET_MOBILE,
    label: "Ticket Generation (Mobile)",
    icon: Smartphone,
    section: "Ticket Management",
    path: ROUTES.TICKET_MOBILE,
  },
  {
    id: MODULES.CALIBRATION,
    label: "Calibration",
    icon: Gauge,
    section: "Maintenance",
    path: ROUTES.CALIBRATION,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.STORE_MASTER,
    label: "Store Master",
    icon: Warehouse,
    section: "Operations",
    path: ROUTES.STORE_MASTER,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.ITEM_MASTER,
    label: "Item Master",
    icon: Package,
    section: "Operations",
    path: ROUTES.ITEM_MASTER,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.GRN,
    label: "GRN",
    icon: ClipboardCheck,
    section: "Operations",
    path: ROUTES.GRN,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.VENDORS,
    label: "Vendor Registration",
    icon: Building,
    section: "Operations",
    path: ROUTES.VENDORS,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.REPORTS,
    label: "Reports",
    icon: BarChart3,
    section: "Analytics",
    path: ROUTES.REPORTS,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.COMPLIANCE,
    label: "Compliance",
    icon: ShieldCheck,
    section: "Analytics",
    path: ROUTES.COMPLIANCE,
    roles: allRolesExceptEndUser,
  },
  {
    id: MODULES.TENANT_ADMIN,
    label: "Administration",
    icon: Shield,
    section: "Administration",
    path: ROUTES.TENANT_ADMIN,
    roles: ["tenant-admin", "platform-admin"],
  },
  {
    id: MODULES.PLATFORM_ADMIN,
    label: "Platform Console",
    icon: KeyRound,
    section: "Platform",
    path: ROUTES.PLATFORM_ADMIN,
    roles: ["platform-admin"],
  },
];

function isActiveRoute(currentPath: string, navPath: string) {
  return currentPath === navPath || currentPath.startsWith(`${navPath}/`);
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const visibleNavItems = useMemo(
    () => navItems.filter((n) => !n.roles || n.roles.includes(userRole)),
    [userRole],
  );

  const sections = useMemo(
    () => Array.from(new Set(visibleNavItems.map((n) => n.section))),
    [visibleNavItems],
  );

  const activeItem = visibleNavItems.find((n) =>
    isActiveRoute(location.pathname, n.path),
  );
  const activeLabel = activeItem?.label ?? "Dashboard";

  const roleLabel =
    userRole === "platform-admin"
      ? "Platform Admin"
      : userRole === "tenant-admin"
        ? "Tenant Admin"
        : userRole === "cmms-enduser"
          ? "CMMS End User"
          : "BME Manager";

  const roleInitials =
    userRole === "platform-admin"
      ? "PA"
      : userRole === "tenant-admin"
        ? "TA"
        : userRole === "cmms-enduser"
          ? "EU"
          : "AK";
  const userName =
    userRole === "platform-admin"
      ? "Platform Admin"
      : userRole === "tenant-admin"
        ? "Arjun Kumar"
        : userRole === "cmms-enduser"
          ? "End User"
          : "Admin User";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00E5CC)" }}
        >
          <Activity className="w-5 h-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-extrabold text-white leading-tight tracking-tight">
              Bio<span style={{ color: "#00BCD4" }}>Med</span>
            </h1>
            <p
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: "#00BCD4" }}
            >
              CMMS Platform
            </p>
          </div>
        )}
      </div>

      <div
        className="mx-4 mb-2"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(0,188,212,0.2), transparent)",
        }}
      />

      {!sidebarCollapsed && (
        <div className="mx-4 mb-3">
          <div
            className="px-3 py-2 rounded-lg"
            style={{
              background: "rgba(0,188,212,0.08)",
              border: "1px solid rgba(0,188,212,0.15)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#00BCD4" }}
            >
              Logged in as
            </p>
            <p className="text-sm font-bold text-white mt-0.5">{roleLabel}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {sections.map((section) => (
          <div key={section} className="mb-5">
            {!sidebarCollapsed && (
              <p
                className="px-3 mb-2.5 text-[11px] font-bold tracking-[0.15em] uppercase"
                style={{ color: "#00BCD4" }}
              >
                {section}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {visibleNavItems
                .filter((n) => n.section === section)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(location.pathname, item.path);
                  const isAdmin =
                    item.section === "Administration" ||
                    item.section === "Platform";

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left",
                        isActive
                          ? "text-white"
                          : "text-[#8899B0] hover:text-white hover:bg-white/5",
                      )}
                      style={
                        isActive
                          ? {
                              background: isAdmin
                                ? "linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.08))"
                                : "linear-gradient(135deg, rgba(0,188,212,0.18), rgba(0,188,212,0.08))",
                              borderLeft: `3px solid ${isAdmin ? "#8B5CF6" : "#00BCD4"}`,
                            }
                          : { borderLeft: "3px solid transparent" }
                      }
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isActive
                            ? isAdmin
                              ? "text-[#8B5CF6]"
                              : "text-[#00BCD4]"
                            : "",
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className="p-4"
        style={{ borderTop: "1px solid rgba(0,188,212,0.1)" }}
      >
        <div
          className={cn(
            "flex items-center",
            sidebarCollapsed ? "justify-center" : "gap-3",
          )}
        >
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #00BCD4, #00838F)",
              }}
            >
              {roleInitials}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {userName}
              </p>
              <p
                className="text-xs font-medium truncate"
                style={{ color: "#00BCD4" }}
              >
                {roleLabel}
              </p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={logout}
              className="text-[#64748B] hover:text-[#EF4444] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#EDF2F7" }}
    >
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 transition-all duration-300 relative z-10",
          sidebarCollapsed ? "w-[72px]" : "w-[270px]",
        )}
        style={{
          background: "linear-gradient(180deg, #0D1B2A 0%, #152238 100%)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3.5 top-20 w-7 h-7 rounded-full flex items-center justify-center border-2 text-white transition-all z-20"
          style={{ background: "#1B2A4A", borderColor: "#00BCD4" }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 h-full w-[270px] z-50"
            style={{
              background: "linear-gradient(180deg, #0D1B2A 0%, #152238 100%)",
            }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header
          className="h-16 flex items-center justify-between px-6 shrink-0 border-b"
          style={{
            background: "linear-gradient(135deg, #1B2A4A, #1E3050)",
            borderColor: "rgba(0,188,212,0.15)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span
                className="text-sm font-medium"
                style={{ color: "#8899B0" }}
              >
                Home
              </span>
              <ChevronRight
                className="w-3.5 h-3.5"
                style={{ color: "#4A5E78" }}
              />
              <span className="text-sm font-bold text-white">
                {activeLabel}
              </span>
            </div>
            <div className="hidden md:block relative ml-4">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#4A5E78" }}
              />
              <input
                placeholder="Search assets, work orders..."
                className="pl-10 w-72 h-9 rounded-lg text-sm text-white placeholder:text-[#4A5E78] outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {userRole !== "platform-admin" && (
              <div className="hidden lg:block">
                <OrgSwitcher />
              </div>
            )}
            {userRole === "platform-admin" && (
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#8B5CF6" }}
                >
                  Platform Console
                </span>
              </div>
            )}
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: "#8899B0" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button>
            <button
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#8899B0" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div
          className="h-[2px] shrink-0"
          style={{
            background:
              "linear-gradient(90deg, #00BCD4, #00E5CC, transparent 80%)",
          }}
        />

        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: "#EDF2F7" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
