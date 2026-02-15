"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Download } from "lucide-react"
import { recentWorkOrders } from "@/lib/mock-data"

const priorityColors: Record<string, string> = {
  Critical: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  High: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  Medium: "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]",
  Low: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
}

const statusColors: Record<string, string> = {
  "In Progress": "bg-[#DBEAFE] text-[#2563EB]",
  "Open": "bg-[#FEF3C7] text-[#D97706]",
  "Completed": "bg-[#D1FAE5] text-[#059669]",
}

const pipeline = [
  { label: "Created", count: 8, color: "#94A3B8" },
  { label: "Assigned", count: 5, color: "#3B82F6" },
  { label: "In Progress", count: 6, color: "#00BCD4" },
  { label: "Pending Parts", count: 3, color: "#F59E0B" },
  { label: "Completed", count: 42, color: "#10B981" },
]

export function WorkOrdersPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Work Orders</h1>
          <p className="text-base text-muted-foreground mt-1">Manage corrective and preventive work orders</p>
        </div>
        <Button className="text-white border-0 text-sm font-semibold px-5 py-2.5 h-auto" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
          <Plus className="w-5 h-5 mr-2" /> Create Work Order
        </Button>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {pipeline.map(p => (
          <Card key={p.label} className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-3xl font-extrabold" style={{ color: p.color }}>{p.count}</p>
              <p className="text-sm font-semibold text-foreground mt-1.5">{p.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search work orders..." className="pl-11 h-11 bg-card border-border text-base" />
        </div>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4"><Download className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">WO #</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Equipment</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Dept</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Priority</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Status</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Assignee</th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkOrders.map(wo => (
                  <tr key={wo.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">{wo.id}</td>
                    <td className="py-4 px-5 text-foreground text-sm font-medium max-w-[240px] truncate">{wo.equipment}</td>
                    <td className="py-4 px-5 text-foreground text-sm">{wo.dept}</td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[wo.priority]}`}>{wo.priority}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[wo.status]}`}>{wo.status}</span>
                    </td>
                    <td className="py-4 px-5 text-foreground text-sm">{wo.assignee}</td>
                    <td className="py-4 px-5 text-foreground text-sm">{wo.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
