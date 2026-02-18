"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Plus, Search, Filter, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { pmComplianceData, pmScheduleList } from "@/src/lib/mock-data";

const statusColors: Record<string, string> = {
  Scheduled: "bg-[#DBEAFE] text-[#2563EB]",
  Overdue: "bg-[#FEE2E2] text-[#DC2626]",
  "In Progress": "bg-[#FEF3C7] text-[#D97706]",
  Completed: "bg-[#D1FAE5] text-[#059669]",
};
const priorityColors: Record<string, string> = {
  Critical: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
  High: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
  Medium: "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]",
  Low: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
};

export function PreventiveMaintenancePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Preventive Maintenance
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            PM schedules, compliance tracking, and execution
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold px-5 py-2.5 h-auto"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
        >
          <Plus className="w-5 h-5 mr-2" /> Create PM Schedule
        </Button>
      </div>

      {/* Compliance Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2 px-7 pt-6">
          <CardTitle className="text-lg font-bold">
            PM Compliance by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pmComplianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 13, fill: "#4A5568" }}
              />
              <YAxis tick={{ fontSize: 13, fill: "#4A5568" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  fontSize: 14,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar
                dataKey="scheduled"
                fill="#E2E8F0"
                radius={[4, 4, 0, 0]}
                name="Scheduled"
              />
              <Bar
                dataKey="completed"
                fill="#00BCD4"
                radius={[4, 4, 0, 0]}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search PM schedules..."
            className="pl-11 h-11 bg-card border-border text-base"
          />
        </div>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
        <Button variant="outline" className="h-11 text-sm font-semibold px-4">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-muted/30">
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    PM #
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Equipment
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Type
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Frequency
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Due Date
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Priority
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody>
                {pmScheduleList.map((pm) => (
                  <tr
                    key={pm.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">
                      {pm.id}
                    </td>
                    <td className="py-4 px-5 text-foreground font-medium text-sm max-w-[240px] truncate">
                      {pm.equipment}
                    </td>
                    <td className="py-4 px-5 text-foreground text-sm">
                      {pm.type}
                    </td>
                    <td className="py-4 px-5 text-foreground text-sm">
                      {pm.frequency}
                    </td>
                    <td className="py-4 px-5 text-foreground text-sm">
                      {pm.dueDate}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[pm.priority]}`}
                      >
                        {pm.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[pm.status]}`}
                      >
                        {pm.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-foreground text-sm">
                      {pm.assignee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
