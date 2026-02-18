"use client";

import React, { useState, useMemo, Fragment } from "react";
import {
  Shield,
  Users,
  Layers,
  Grid3X3,
  History,
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
} from "lucide-react";
import {
  mockRoles as initialRolesData,
  seededResources as initialResourcesData,
  seededActions,
  mockRolePermissions as initialPermissionsData,
  mockUsers as initialUsersData,
  mockAuditLogs,
  getTopLevelResources,
  getResourceChildren,
  type Role,
  type ResourceDef,
  type ActionDef,
  type RolePermission,
  type TenantUser,
} from "@/src/lib/rbac-data";

type TabKey = "roles" | "resources" | "matrix" | "user-roles" | "audit";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "roles", label: "Roles", icon: <Shield className="h-4 w-4" /> },
  {
    key: "resources",
    label: "Resources",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    key: "matrix",
    label: "Permission Matrix",
    icon: <Grid3X3 className="h-4 w-4" />,
  },
  {
    key: "user-roles",
    label: "User Roles",
    icon: <Users className="h-4 w-4" />,
  },
  { key: "audit", label: "Audit Log", icon: <History className="h-4 w-4" /> },
];

// ======== ROLES TAB ========
function RolesTab() {
  const [roles, setRoles] = useState<Role[]>(initialRolesData);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    setRoles((prev) => [
      ...prev,
      {
        id: `R-${Date.now()}`,
        tenantId: "T-001",
        name: newName.trim(),
        code:
          newCode.trim() || newName.trim().toUpperCase().replace(/\s+/g, "_"),
        description: newDesc.trim(),
        scope: "Org-level",
        status: "Active",
        assignedUsersCount: 0,
      },
    ]);
    setNewName("");
    setNewCode("");
    setNewDesc("");
    setShowAdd(false);
  };

  const startEdit = (r: Role) => {
    setEditId(r.id);
    setEditName(r.name);
    setEditDesc(r.description);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setRoles((prev) =>
      prev.map((r) =>
        r.id === editId
          ? { ...r, name: editName.trim(), description: editDesc.trim() }
          : r,
      ),
    );
    setEditId(null);
  };

  const toggleActive = (id: string) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" }
          : r,
      ),
    );
  };

  const deleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Define roles for your organization. Roles group permissions that can
          be assigned to users.
        </p>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Role
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">New Role</h3>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Role Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Supervisor"
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Role Code
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="e.g. SUPERVISOR"
                className="h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Description
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description..."
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="h-8 rounded-md border border-input bg-transparent px-3 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create Role
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Code
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Scope
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Users
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-border last:border-0 hover:bg-secondary/20"
              >
                {editId === role.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                      />
                    </td>
                    <td className="px-4 py-2 text-xs font-mono text-muted-foreground">
                      {role.code}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                      />
                    </td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-success/10"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {role.code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {role.description}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          role.scope === "Tenant-level"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent-foreground"
                        }`}
                      >
                        {role.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(role.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          role.status === "Active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {role.status === "Active" ? (
                          <Unlock className="h-2.5 w-2.5" />
                        ) : (
                          <Lock className="h-2.5 w-2.5" />
                        )}
                        {role.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {role.assignedUsersCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(role)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRole(role.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======== RESOURCES TAB ========
function ResourcesTab() {
  const [resources, setResources] =
    useState<ResourceDef[]>(initialResourcesData);
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editParent, setEditParent] = useState("");

  const topLevel = resources.filter((r) => r.parentId === null);
  const getChildren = (parentId: string) =>
    resources.filter((r) => r.parentId === parentId);

  const initExpanded = useMemo(() => {
    const s = new Set<string>();
    for (const r of resources) {
      if (r.parentId === null && resources.some((c) => c.parentId === r.id)) {
        s.add(r.id);
      }
    }
    return s;
  }, [resources]);

  const expanded = expandedGroups.size === 0 ? initExpanded : expandedGroups;

  const toggleExpand = (id: string) => {
    setExpandedGroups((prev) => {
      const base = prev.size === 0 ? new Set(initExpanded) : new Set(prev);
      if (base.has(id)) base.delete(id);
      else base.add(id);
      return base;
    });
  };

  const filteredTopLevel = topLevel.filter(
    (r) =>
      r.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      r.resourceKey.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      getChildren(r.id).some(
        (c) =>
          c.resourceName.toLowerCase().includes(search.toLowerCase()) ||
          c.resourceKey.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const resetAddForm = () => {
    setShowAdd(false);
    setNewKey("");
    setNewName("");
    setNewParent("");
    setNewDesc("");
  };

  const handleAdd = () => {
    if (!newKey.trim() || !newName.trim()) return;
    const parentId = newParent || null;
    setResources((prev) => [
      ...prev,
      {
        id: `RES-${Date.now()}`,
        resourceKey: newKey.trim(),
        resourceName: newName.trim(),
        parentId,
        description: newDesc.trim(),
        isActive: true,
      },
    ]);
    if (parentId) {
      setExpandedGroups((prev) => {
        const base = prev.size === 0 ? new Set(initExpanded) : new Set(prev);
        base.add(parentId);
        return base;
      });
    }
    resetAddForm();
  };

  const startEdit = (r: ResourceDef) => {
    setEditId(r.id);
    setEditKey(r.resourceKey);
    setEditName(r.resourceName);
    setEditDesc(r.description);
    setEditParent(r.parentId || "");
  };

  const saveEdit = () => {
    if (!editKey.trim() || !editName.trim()) return;
    setResources((prev) =>
      prev.map((r) =>
        r.id === editId
          ? {
              ...r,
              resourceKey: editKey.trim(),
              resourceName: editName.trim(),
              description: editDesc.trim(),
              parentId: editParent || null,
            }
          : r,
      ),
    );
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  const toggleActive = (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
    );
  };

  const deleteResource = (id: string) => {
    setResources((prev) =>
      prev.filter((r) => r.id !== id && r.parentId !== id),
    );
  };

  const totalResources = resources.length;
  const activeResources = resources.filter((r) => r.isActive).length;
  const parentCount = topLevel.length;
  const childCount = resources.filter((r) => r.parentId !== null).length;

  return (
    <div>
      {/* Stats bar */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total Resources
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {totalResources}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Active
          </p>
          <p className="mt-1 text-xl font-bold text-success">
            {activeResources}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Parent Modules
          </p>
          <p className="mt-1 text-xl font-bold text-foreground">
            {parentCount}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Sub-Resources
          </p>
          <p className="mt-1 text-xl font-bold text-muted-foreground">
            {childCount}
          </p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources by name, key, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Resource
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {newParent ? "New Sub-Resource" : "New Resource"}
            </h3>
            <button
              type="button"
              onClick={resetAddForm}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Resource Key <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. ASSET_TRANSFER"
                className="h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Unique identifier used in code
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Display Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Asset Transfer"
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Human-readable name shown in UI
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Parent Resource
              </label>
              <select
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="">None (Top-level Module)</option>
                {topLevel.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.resourceName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Group under a parent module
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Description
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Brief description..."
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Describe this screen or module
              </p>
            </div>
          </div>
          {newParent && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">
                Will be added as a sub-resource under{" "}
                <span className="font-semibold text-foreground">
                  {topLevel.find((r) => r.id === newParent)?.resourceName}
                </span>
              </span>
            </div>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetAddForm}
              className="h-8 rounded-md border border-input bg-transparent px-3 text-xs font-medium text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newKey.trim() || !newName.trim()}
              className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {newParent ? "Create Sub-Resource" : "Create Resource"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="w-8 px-2 py-3" />
                <th className="min-w-[200px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resource Name
                </th>
                <th className="min-w-[160px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Resource Key
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Parent
                </th>
                <th className="min-w-[200px] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTopLevel.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No resources found matching your search.
                  </td>
                </tr>
              )}
              {filteredTopLevel.map((res) => {
                const children = getChildren(res.id);
                const isExpanded = expanded.has(res.id);
                const isEditing = editId === res.id;

                return (
                  <Fragment key={res.id}>
                    {/* Parent row */}
                    <tr
                      className={`border-b border-border transition-colors hover:bg-secondary/20 ${
                        children.length > 0 ? "bg-secondary/5" : ""
                      }`}
                    >
                      <td className="px-2 py-3 text-center">
                        {children.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(res.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ) : (
                          <span className="inline-block h-6 w-6" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            <span className="text-sm font-medium text-foreground">
                              {res.resourceName}
                            </span>
                            {children.length > 0 && (
                              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                {children.length}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editKey}
                            onChange={(e) => setEditKey(e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-card px-2 font-mono text-sm text-foreground outline-none focus:border-ring"
                          />
                        ) : (
                          <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {res.resourceKey}
                          </code>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={editParent}
                            onChange={(e) => setEditParent(e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                          >
                            <option value="">None</option>
                            {topLevel
                              .filter((r) => r.id !== res.id)
                              .map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.resourceName}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            --
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {res.description}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Module
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleActive(res.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                            res.isActive
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {res.isActive ? (
                            <Unlock className="h-2.5 w-2.5" />
                          ) : (
                            <Lock className="h-2.5 w-2.5" />
                          )}
                          {res.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={saveEdit}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-success/10"
                                title="Save"
                              >
                                <Save className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(res)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                                title="Edit resource"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteResource(res.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Delete resource and children"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Child rows */}
                    {isExpanded &&
                      children.map((child) => {
                        const isChildEditing = editId === child.id;
                        return (
                          <tr
                            key={child.id}
                            className="border-b border-border bg-secondary/5 transition-colors hover:bg-secondary/15"
                          >
                            <td className="px-2 py-2.5" />
                            <td className="py-2.5 pl-10 pr-4">
                              {isChildEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="inline-block h-px w-3 bg-border" />
                                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                                  <span className="text-sm text-foreground">
                                    {child.resourceName}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {isChildEditing ? (
                                <input
                                  type="text"
                                  value={editKey}
                                  onChange={(e) => setEditKey(e.target.value)}
                                  className="h-8 w-full rounded-md border border-input bg-card px-2 font-mono text-sm text-foreground outline-none focus:border-ring"
                                />
                              ) : (
                                <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                                  {child.resourceKey}
                                </code>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {isChildEditing ? (
                                <select
                                  value={editParent}
                                  onChange={(e) =>
                                    setEditParent(e.target.value)
                                  }
                                  className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                                >
                                  <option value="">None</option>
                                  {topLevel.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.resourceName}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-xs text-foreground">
                                  {res.resourceName}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {isChildEditing ? (
                                <input
                                  type="text"
                                  value={editDesc}
                                  onChange={(e) => setEditDesc(e.target.value)}
                                  className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground outline-none focus:border-ring"
                                />
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {child.description}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                                Screen
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                type="button"
                                onClick={() => toggleActive(child.id)}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                                  child.isActive
                                    ? "bg-success/10 text-success hover:bg-success/20"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {child.isActive ? (
                                  <Unlock className="h-2.5 w-2.5" />
                                ) : (
                                  <Lock className="h-2.5 w-2.5" />
                                )}
                                {child.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-1">
                                {isChildEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={saveEdit}
                                      className="flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-success/10"
                                      title="Save"
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                                      title="Cancel"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => startEdit(child)}
                                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                                      title="Edit"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteResource(child.id)}
                                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-secondary/10 px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            Showing {filteredTopLevel.length} of {topLevel.length} top-level
            resources
            {childCount > 0 && <> with {childCount} sub-resources</>}
          </p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary/40" />{" "}
              Module
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-accent/40" />{" "}
              Screen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== PERMISSION MATRIX TAB ========
function PermissionMatrixTab() {
  const [roles] = useState<Role[]>(initialRolesData);
  const [resources] = useState<ResourceDef[]>(initialResourcesData);
  const [permissions, setPermissions] = useState<RolePermission[]>(
    initialPermissionsData,
  );
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.id ?? "");
  const [search, setSearch] = useState("");

  const topLevel = resources.filter((r) => r.parentId === null);
  const getChildren = (parentId: string) =>
    resources.filter((r) => r.parentId === parentId);

  // Use a subset of actions for the matrix columns (most common 8)
  const matrixActions = seededActions.slice(0, 8);

  const isGranted = (resourceId: string, actionId: string) => {
    return permissions.some(
      (p) =>
        p.roleId === selectedRole &&
        p.resourceId === resourceId &&
        p.actionId === actionId &&
        p.isAllowed,
    );
  };

  const togglePermission = (resourceId: string, actionId: string) => {
    const existing = permissions.find(
      (p) =>
        p.roleId === selectedRole &&
        p.resourceId === resourceId &&
        p.actionId === actionId,
    );
    if (existing) {
      setPermissions((prev) =>
        prev.map((p) =>
          p.roleId === selectedRole &&
          p.resourceId === resourceId &&
          p.actionId === actionId
            ? { ...p, isAllowed: !p.isAllowed }
            : p,
        ),
      );
    } else {
      setPermissions((prev) => [
        ...prev,
        { roleId: selectedRole, resourceId, actionId, isAllowed: true },
      ]);
    }
  };

  const grantAllForResource = (resourceId: string) => {
    setPermissions((prev) => {
      const updated = [...prev];
      for (const action of matrixActions) {
        const idx = updated.findIndex(
          (p) =>
            p.roleId === selectedRole &&
            p.resourceId === resourceId &&
            p.actionId === action.id,
        );
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], isAllowed: true };
        } else {
          updated.push({
            roleId: selectedRole,
            resourceId,
            actionId: action.id,
            isAllowed: true,
          });
        }
      }
      return updated;
    });
  };

  const revokeAllForResource = (resourceId: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.roleId === selectedRole && p.resourceId === resourceId
          ? { ...p, isAllowed: false }
          : p,
      ),
    );
  };

  const filteredTopLevel = topLevel.filter(
    (r) =>
      r.resourceName.toLowerCase().includes(search.toLowerCase()) ||
      r.resourceKey.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedRoleName = roles.find((r) => r.id === selectedRole)?.name ?? "";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Configure which actions each role can perform on each resource/screen.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-foreground">Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="h-9 rounded-md border border-input bg-card px-3 text-sm font-medium text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="sticky left-0 z-10 min-w-[200px] bg-secondary/30 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Resource / Screen
              </th>
              {matrixActions.map((a) => (
                <th
                  key={a.id}
                  className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {a.actionName}
                </th>
              ))}
              <th className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTopLevel.map((res) => {
              const children = getChildren(res.id);
              return (
                <Fragment key={res.id}>
                  {/* Parent group header */}
                  <tr className="border-b border-border bg-secondary/5">
                    <td
                      className="sticky left-0 z-10 bg-secondary/5 px-4 py-2.5"
                      colSpan={matrixActions.length + 2}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {res.resourceName}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          ({children.length} resources)
                        </span>
                      </div>
                    </td>
                  </tr>
                  {children.map((child) => (
                    <tr
                      key={child.id}
                      className="border-b border-border hover:bg-secondary/20"
                    >
                      <td className="sticky left-0 z-10 bg-card px-4 py-2.5 pl-10">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                          <span className="text-sm text-foreground">
                            {child.resourceName}
                          </span>
                        </div>
                      </td>
                      {matrixActions.map((a) => {
                        const granted = isGranted(child.id, a.id);
                        return (
                          <td key={a.id} className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => togglePermission(child.id, a.id)}
                              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                                granted
                                  ? "border-success bg-success/10 text-success"
                                  : "border-border bg-card text-muted-foreground/30 hover:border-muted-foreground/50"
                              }`}
                              aria-label={`${granted ? "Revoke" : "Grant"} ${a.actionName} on ${child.resourceName} for ${selectedRoleName}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => grantAllForResource(child.id)}
                            className="h-6 rounded bg-success/10 px-2 text-[10px] font-medium text-success hover:bg-success/20"
                            title="Grant all"
                          >
                            All
                          </button>
                          <button
                            type="button"
                            onClick={() => revokeAllForResource(child.id)}
                            className="h-6 rounded bg-destructive/10 px-2 text-[10px] font-medium text-destructive hover:bg-destructive/20"
                            title="Revoke all"
                          >
                            None
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======== USER ROLES TAB ========
function UserRolesTab() {
  const [users, setUsers] = useState<TenantUser[]>(initialUsersData);
  const [roles] = useState<Role[]>(initialRolesData);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const startEdit = (u: TenantUser) => {
    setEditUserId(u.id);
    // Flatten all roles from orgMemberships
    const allRoles = u.orgMemberships.flatMap((m) => m.roles);
    setEditRoles([...new Set(allRoles)]);
  };

  const toggleRole = (roleId: string) => {
    setEditRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId],
    );
  };

  const saveRoles = () => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== editUserId) return u;
        // Update first orgMembership roles as a simple demo
        const updated = { ...u };
        if (updated.orgMemberships.length > 0) {
          updated.orgMemberships = updated.orgMemberships.map((m, i) =>
            i === 0 ? { ...m, roles: [...editRoles] } : m,
          );
        }
        return updated;
      }),
    );
    setEditUserId(null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Assign roles to users. A user can hold multiple roles.
        </p>
        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                User
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Roles
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const userRoleIds = [
                ...new Set(user.orgMemberships.flatMap((m) => m.roles)),
              ];
              return (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        user.status === "Active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editUserId === user.id ? (
                      <div className="flex flex-wrap gap-1.5">
                        {roles.map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => toggleRole(role.id)}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              editRoles.includes(role.id)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                            }`}
                          >
                            {editRoles.includes(role.id) && (
                              <Check className="h-2.5 w-2.5" />
                            )}
                            {role.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {userRoleIds.map((rId) => {
                          const role = roles.find((r) => r.id === rId);
                          return role ? (
                            <span
                              key={rId}
                              className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                            >
                              {role.name}
                            </span>
                          ) : null;
                        })}
                        {userRoleIds.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">
                            No roles assigned
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editUserId === user.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={saveRoles}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-success hover:bg-success/10"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditUserId(null)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======== AUDIT LOG TAB ========
function AuditLogTab() {
  const tenantLogs = mockAuditLogs.filter(
    (l) => l.tenant === "Apollo Hospitals Group",
  );

  const changeTypeStyles: Record<string, string> = {
    CREATE: "bg-success/10 text-success",
    UPDATE: "bg-primary/10 text-primary",
    APPROVE: "bg-primary/10 text-primary",
    RESET_PASSWORD: "bg-warning/10 text-warning",
    DELETE: "bg-destructive/10 text-destructive",
  };

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Track all permission and role assignment changes for compliance and
        auditing.
      </p>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Changed By
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {tenantLogs.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-border last:border-0 hover:bg-secondary/20"
              >
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {entry.timestamp}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {entry.actor}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      changeTypeStyles[entry.action] ??
                      "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {entry.action.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {entry.entity}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {entry.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======== MAIN PERMISSIONS VIEW ========
export function PermissionsView() {
  const [activeTab, setActiveTab] = useState<TabKey>("matrix");

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "roles" && <RolesTab />}
      {activeTab === "resources" && <ResourcesTab />}
      {activeTab === "matrix" && <PermissionMatrixTab />}
      {activeTab === "user-roles" && <UserRolesTab />}
      {activeTab === "audit" && <AuditLogTab />}
    </div>
  );
}
