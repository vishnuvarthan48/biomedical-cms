"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Wrench, FileText, CalendarClock, Gauge, Package, ShieldCheck, Download
} from "lucide-react"

const reportCategories = [
  {
    title: "Equipment Reports",
    icon: Wrench,
    color: "#00BCD4",
    reports: ["Asset Register", "Equipment Status Summary", "Equipment Lifecycle Report", "Downtime Analysis"]
  },
  {
    title: "Work Order Reports",
    icon: FileText,
    color: "#3B82F6",
    reports: ["Work Order Summary", "SLA Compliance Report", "Mean Time to Repair (MTTR)", "Cost Analysis"]
  },
  {
    title: "PM Reports",
    icon: CalendarClock,
    color: "#10B981",
    reports: ["PM Compliance Report", "PM Schedule Adherence", "Overdue PM Summary", "PM Cost Analysis"]
  },
  {
    title: "Calibration Reports",
    icon: Gauge,
    color: "#F59E0B",
    reports: ["Calibration Certificate Log", "Calibration Due Report", "Out-of-Tolerance Report", "Standards Traceability"]
  },
  {
    title: "Inventory Reports",
    icon: Package,
    color: "#8B5CF6",
    reports: ["Stock Level Report", "Consumption Report", "Reorder Alert Report", "Cost by Category"]
  },
  {
    title: "Compliance Reports",
    icon: ShieldCheck,
    color: "#EF4444",
    reports: ["NABH Compliance", "AERB License Report", "IEC 62353 Compliance", "Audit Trail Report"]
  },
]

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Reports</h1>
        <p className="text-base text-muted-foreground mt-1">Generate and download operational reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportCategories.map(cat => {
          const Icon = cat.icon
          return (
            <Card key={cat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: cat.color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{cat.title}</h3>
                </div>
                <div className="flex flex-col gap-1">
                  {cat.reports.map(r => (
                    <button key={r} className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors text-left group">
                      <span>{r}</span>
                      <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#00BCD4]" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
