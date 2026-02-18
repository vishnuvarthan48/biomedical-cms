"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Plus, Search, Filter, Download } from "lucide-react";
import { calibrationList } from "@/src/lib/mock-data";

const statusColors: Record<string, string> = {
  Scheduled: "bg-[#DBEAFE] text-[#2563EB]",
  Completed: "bg-[#D1FAE5] text-[#059669]",
  "In Progress": "bg-[#FEF3C7] text-[#D97706]",
  Failed: "bg-[#FEE2E2] text-[#DC2626]",
};

const resultColors: Record<string, string> = {
  Pass: "text-[#059669] font-bold",
  Fail: "text-[#DC2626] font-bold",
  "-": "text-muted-foreground",
};

const referenceStandards = [
  {
    id: "STD-001",
    name: "Digital Multimeter - Fluke 87V",
    type: "Working",
    certNo: "NABL-2241",
    calibratedBy: "NABL Lab - Mumbai",
    expiry: "2026-08-15",
    status: "Active",
  },
  {
    id: "STD-002",
    name: "Electrical Safety Analyzer - Rigel 288+",
    type: "Reference",
    certNo: "NABL-2242",
    calibratedBy: "NABL Lab - Delhi",
    expiry: "2026-06-30",
    status: "Active",
  },
  {
    id: "STD-003",
    name: "SpO2 Simulator - Fluke ProSim 8",
    type: "Working",
    certNo: "NABL-2243",
    calibratedBy: "NABL Lab - Mumbai",
    expiry: "2026-09-20",
    status: "Active",
  },
  {
    id: "STD-004",
    name: "Defibrillator Analyzer - Fluke QED 6",
    type: "Reference",
    certNo: "NABL-2244",
    calibratedBy: "NABL Lab - Chennai",
    expiry: "2026-04-10",
    status: "Expiring Soon",
  },
];

export function CalibrationPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Calibration
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            QA/QC calibration schedules and reference standards
          </p>
        </div>
        <Button
          className="text-white border-0 text-sm font-semibold px-5 py-2.5 h-auto"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
        >
          <Plus className="w-5 h-5 mr-2" /> Schedule Calibration
        </Button>
      </div>

      <Tabs defaultValue="schedules">
        <TabsList className="bg-muted/50 h-11">
          <TabsTrigger value="schedules" className="text-sm font-semibold px-5">
            Calibration Schedules
          </TabsTrigger>
          <TabsTrigger value="standards" className="text-sm font-semibold px-5">
            Reference Standards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="flex flex-col gap-5 mt-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search calibrations..."
                className="pl-11 h-11 bg-card border-border text-base"
              />
            </div>
            <Button
              variant="outline"
              className="h-11 text-sm font-semibold px-4"
            >
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
            <Button
              variant="outline"
              className="h-11 text-sm font-semibold px-4"
            >
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border bg-muted/30">
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        CAL #
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Equipment
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Parameter
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Standard
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Due Date
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Result
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Assignee
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {calibrationList.map((cal) => (
                      <tr
                        key={cal.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">
                          {cal.id}
                        </td>
                        <td className="py-4 px-5 text-foreground font-medium text-sm">
                          {cal.equipment}
                        </td>
                        <td className="py-4 px-5 text-foreground text-sm">
                          {cal.parameter}
                        </td>
                        <td className="py-4 px-5 font-mono text-sm text-foreground">
                          {cal.standard}
                        </td>
                        <td className="py-4 px-5 text-foreground text-sm">
                          {cal.dueDate}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[cal.status]}`}
                          >
                            {cal.status}
                          </span>
                        </td>
                        <td
                          className={`py-4 px-5 text-sm ${resultColors[cal.result]}`}
                        >
                          {cal.result}
                        </td>
                        <td className="py-4 px-5 text-foreground text-sm">
                          {cal.assignee}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="flex flex-col gap-5 mt-5">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-border bg-muted/30">
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        ID
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Instrument
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Type
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Certificate
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Calibrated By
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Expiry
                      </th>
                      <th className="text-left py-4 px-5 font-bold text-foreground text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {referenceStandards.map((std) => (
                      <tr
                        key={std.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-5 font-mono font-bold text-[#00BCD4] text-sm">
                          {std.id}
                        </td>
                        <td className="py-4 px-5 text-foreground font-medium text-sm">
                          {std.name}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${std.type === "Reference" ? "bg-[#DBEAFE] text-[#2563EB]" : "bg-[#D1FAE5] text-[#059669]"}`}
                          >
                            {std.type}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-mono text-sm text-foreground">
                          {std.certNo}
                        </td>
                        <td className="py-4 px-5 text-foreground text-sm">
                          {std.calibratedBy}
                        </td>
                        <td className="py-4 px-5 text-foreground text-sm">
                          {std.expiry}
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${std.status === "Active" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"}`}
                          >
                            {std.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
