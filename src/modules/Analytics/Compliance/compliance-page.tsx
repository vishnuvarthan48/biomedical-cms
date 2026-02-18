"use client";

import { Card, CardContent } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const complianceFrameworks = [
  {
    name: "NABH",
    fullName: "National Accreditation Board for Hospitals",
    score: 94,
    status: "Compliant",
    items: 48,
    completed: 45,
  },
  {
    name: "AERB",
    fullName: "Atomic Energy Regulatory Board",
    score: 100,
    status: "Compliant",
    items: 12,
    completed: 12,
  },
  {
    name: "IEC 62353",
    fullName: "Medical Electrical Equipment Testing",
    score: 88,
    status: "Attention",
    items: 32,
    completed: 28,
  },
  {
    name: "ISO 13485",
    fullName: "Medical Devices Quality Management",
    score: 92,
    status: "Compliant",
    items: 56,
    completed: 52,
  },
  {
    name: "FDA 21 CFR",
    fullName: "FDA Medical Device Regulations",
    score: 78,
    status: "Attention",
    items: 40,
    completed: 31,
  },
  {
    name: "IEC 60601",
    fullName: "Medical Electrical Equipment Safety",
    score: 96,
    status: "Compliant",
    items: 24,
    completed: 23,
  },
];

export function CompliancePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Compliance
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Regulatory compliance tracking and status
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#10B981]/10">
              <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">4</p>
              <p className="text-sm text-foreground font-semibold mt-0.5">
                Fully Compliant
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F59E0B]/10">
              <AlertTriangle className="w-7 h-7 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">2</p>
              <p className="text-sm text-foreground font-semibold mt-0.5">
                Needs Attention
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#00BCD4]/10">
              <Clock className="w-7 h-7 text-[#00BCD4]" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-foreground">91%</p>
              <p className="text-sm text-foreground font-semibold mt-0.5">
                Average Score
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {complianceFrameworks.map((fw) => (
          <Card
            key={fw.name}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-extrabold text-foreground text-xl">
                    {fw.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {fw.fullName}
                  </p>
                </div>
                <span
                  className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold ${fw.status === "Compliant" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"}`}
                >
                  {fw.status}
                </span>
              </div>
              <div className="flex items-center gap-5 mb-4">
                <div
                  className="text-4xl font-extrabold"
                  style={{
                    color:
                      fw.score >= 90
                        ? "#10B981"
                        : fw.score >= 80
                          ? "#F59E0B"
                          : "#EF4444",
                  }}
                >
                  {fw.score}%
                </div>
                <div className="flex-1">
                  <Progress value={fw.score} className="h-3" />
                </div>
              </div>
              <p className="text-sm text-foreground font-medium">
                {fw.completed} of {fw.items} requirements met
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
