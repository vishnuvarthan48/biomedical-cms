"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Wrench, ClipboardList, CalendarClock, AlertTriangle, TrendingUp, TrendingDown,
  ArrowRight, CheckCircle2
} from "lucide-react"
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { workOrderTrends, equipmentStatusData, complianceScores, pmComplianceData, recentWorkOrders } from "@/lib/mock-data"

function StatCard({ title, value, change, isUp, icon: Icon, color }: {
  title: string; value: string; change: string; isUp: boolean; icon: React.ElementType; color: string
}) {
  return (
    <Card className="group hover:-translate-y-1 transition-all duration-300 border-0 shadow-sm hover:shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-28 h-28 rounded-bl-full opacity-10" style={{ background: color }} />
      <CardContent className="p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</p>
            <h3 className="text-4xl font-extrabold text-foreground tracking-tight">{value}</h3>
            <div className="flex items-center gap-1.5 mt-3">
              {isUp ? <TrendingUp className="w-4 h-4 text-[#10B981]" /> : <TrendingDown className="w-4 h-4 text-[#EF4444]" />}
              <span className={`text-sm font-bold ${isUp ? "text-[#10B981]" : "text-[#EF4444]"}`}>{change}</span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)`, boxShadow: `0 4px 14px ${color}40` }}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

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

export function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-base text-muted-foreground mt-1">Biomedical equipment overview and KPIs</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm py-1.5 px-4 border-[#10B981]/30 text-[#10B981] bg-[#10B981]/5 font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Assets" value="178" change="12%" isUp={true} icon={Wrench} color="#00BCD4" />
        <StatCard title="Open Work Orders" value="23" change="8%" isUp={false} icon={ClipboardList} color="#F59E0B" />
        <StatCard title="PM Compliance" value="94%" change="3%" isUp={true} icon={CalendarClock} color="#10B981" />
        <StatCard title="Critical Alerts" value="5" change="2" isUp={false} icon={AlertTriangle} color="#EF4444" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-7 pt-6">
            <CardTitle className="text-lg font-bold">Work Order Trends</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workOrderTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#4A5568" }} />
                <YAxis tick={{ fontSize: 13, fill: "#4A5568" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 14 }} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="open" fill="#00BCD4" radius={[4, 4, 0, 0]} name="Open" />
                <Bar dataKey="pending" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-7 pt-6">
            <CardTitle className="text-lg font-bold">Equipment Status</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={equipmentStatusData} cx="50%" cy="50%" innerRadius={65} outerRadius={110} paddingAngle={4} dataKey="value">
                  {equipmentStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 14 }} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-7 pt-6">
            <CardTitle className="text-lg font-bold">PM Compliance by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pmComplianceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 13, fill: "#4A5568" }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 13, fill: "#4A5568" }} width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 14 }} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="scheduled" fill="#E2E8F0" radius={[0, 4, 4, 0]} name="Scheduled" />
                <Bar dataKey="completed" fill="#00BCD4" radius={[0, 4, 4, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 px-7 pt-6">
            <CardTitle className="text-lg font-bold">Compliance Score Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-7 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={complianceScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 13, fill: "#4A5568" }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 13, fill: "#4A5568" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 14 }} />
                <Line type="monotone" dataKey="score" stroke="#00BCD4" strokeWidth={3} dot={{ fill: "#00BCD4", r: 5 }} name="Score %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 px-7 pt-6 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Recent Work Orders</CardTitle>
          <Button variant="ghost" size="sm" className="text-[#00BCD4] hover:text-[#00838F] text-sm font-semibold" onClick={() => onNavigate("work-orders")}>
            View All <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </CardHeader>
        <CardContent className="px-7 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-4 px-4 font-bold text-foreground text-sm">WO #</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground text-sm">Equipment</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground text-sm">Priority</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground text-sm">Status</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground text-sm">Assignee</th>
                  <th className="text-left py-4 px-4 font-bold text-foreground text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkOrders.map(wo => (
                  <tr key={wo.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#00BCD4] text-sm">{wo.id}</td>
                    <td className="py-4 px-4 text-foreground text-sm font-medium max-w-[240px] truncate">{wo.equipment}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[wo.priority]}`}>{wo.priority}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[wo.status]}`}>{wo.status}</span>
                    </td>
                    <td className="py-4 px-4 text-foreground text-sm">{wo.assignee}</td>
                    <td className="py-4 px-4 text-foreground text-sm">{wo.date}</td>
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
