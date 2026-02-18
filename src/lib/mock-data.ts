export const workOrderTrends = [
  { month: "Jul", open: 45, completed: 38, pending: 12 },
  { month: "Aug", open: 52, completed: 47, pending: 9 },
  { month: "Sep", open: 38, completed: 35, pending: 14 },
  { month: "Oct", open: 61, completed: 55, pending: 11 },
  { month: "Nov", open: 49, completed: 44, pending: 8 },
  { month: "Dec", open: 55, completed: 51, pending: 6 },
  { month: "Jan", open: 42, completed: 39, pending: 10 },
]

export const equipmentStatusData = [
  { name: "Operational", value: 142, fill: "#10B981" },
  { name: "Under Maintenance", value: 23, fill: "#F59E0B" },
  { name: "Out of Service", value: 8, fill: "#EF4444" },
  { name: "Decommissioned", value: 5, fill: "#718096" },
]

export const complianceScores = [
  { month: "Jul", score: 92 },
  { month: "Aug", score: 88 },
  { month: "Sep", score: 95 },
  { month: "Oct", score: 91 },
  { month: "Nov", score: 97 },
  { month: "Dec", score: 94 },
  { month: "Jan", score: 96 },
]

export const pmComplianceData = [
  { category: "Imaging", scheduled: 24, completed: 22 },
  { category: "Lab", scheduled: 18, completed: 16 },
  { category: "Surgical", scheduled: 12, completed: 12 },
  { category: "Patient Mon.", scheduled: 30, completed: 27 },
  { category: "Life Support", scheduled: 15, completed: 15 },
  { category: "Diagnostic", scheduled: 20, completed: 18 },
]

export const recentWorkOrders = [
  { id: "WO-2026-0412", equipment: "MRI Scanner - Siemens Magnetom", priority: "Critical" as const, status: "In Progress" as const, assignee: "Dr. Rajesh K.", dept: "Radiology", date: "2026-02-12" },
  { id: "WO-2026-0411", equipment: "Ventilator - Draeger Savina 300", priority: "High" as const, status: "Open" as const, assignee: "Tech. Anand S.", dept: "ICU", date: "2026-02-12" },
  { id: "WO-2026-0410", equipment: "Infusion Pump - B.Braun Infusomat", priority: "Medium" as const, status: "Completed" as const, assignee: "Tech. Priya M.", dept: "General Ward", date: "2026-02-11" },
  { id: "WO-2026-0409", equipment: "CT Scanner - GE Revolution", priority: "High" as const, status: "In Progress" as const, assignee: "Dr. Suresh V.", dept: "Radiology", date: "2026-02-11" },
  { id: "WO-2026-0408", equipment: "Defibrillator - Philips HeartStart", priority: "Critical" as const, status: "Completed" as const, assignee: "Tech. Kumar R.", dept: "Emergency", date: "2026-02-10" },
]

export const equipmentList = [
  { id: "EQ-001", name: "MRI Scanner - Siemens Magnetom Vida", category: "Imaging", dept: "Radiology", status: "Working Fine" as const, serial: "MAG-2023-1001", manufacturer: "Siemens Healthineers", lastPM: "2026-01-15", nextPM: "2026-04-15", risk: "High" as const },
  { id: "EQ-002", name: "CT Scanner - GE Revolution EVO", category: "Imaging", dept: "Radiology", status: "Under Repair" as const, serial: "REV-2022-3044", manufacturer: "GE Healthcare", lastPM: "2025-12-20", nextPM: "2026-03-20", risk: "High" as const },
  { id: "EQ-003", name: "Ventilator - Draeger Savina 300", category: "Life Support", dept: "ICU", status: "Working Fine" as const, serial: "SAV-2024-8811", manufacturer: "Draeger", lastPM: "2026-02-01", nextPM: "2026-05-01", risk: "Critical" as const },
  { id: "EQ-004", name: "Ultrasound - Philips EPIQ Elite", category: "Imaging", dept: "OB/GYN", status: "Working Fine" as const, serial: "EPQ-2023-5522", manufacturer: "Philips", lastPM: "2026-01-28", nextPM: "2026-04-28", risk: "Medium" as const },
  { id: "EQ-005", name: "Infusion Pump - B.Braun Infusomat", category: "Patient Monitoring", dept: "General Ward", status: "Working Fine" as const, serial: "INF-2024-7733", manufacturer: "B. Braun", lastPM: "2026-02-05", nextPM: "2026-05-05", risk: "Medium" as const },
  { id: "EQ-006", name: "Defibrillator - Philips HeartStart MRx", category: "Life Support", dept: "Emergency", status: "Working Fine" as const, serial: "HRT-2023-4456", manufacturer: "Philips", lastPM: "2026-01-22", nextPM: "2026-04-22", risk: "Critical" as const },
  { id: "EQ-007", name: "Autoclave - Tuttnauer 3870 EA", category: "Sterilization", dept: "CSSD", status: "Condemned" as const, serial: "TUT-2020-1122", manufacturer: "Tuttnauer", lastPM: "2025-11-30", nextPM: "Overdue", risk: "Medium" as const },
  { id: "EQ-008", name: "Patient Monitor - GE Carescape B650", category: "Patient Monitoring", dept: "ICU", status: "Working Fine" as const, serial: "CAR-2024-9900", manufacturer: "GE Healthcare", lastPM: "2026-02-08", nextPM: "2026-05-08", risk: "High" as const },
]

export const pmScheduleList = [
  { id: "PM-301", equipment: "MRI Scanner - Siemens Magnetom", type: "External PM", dueDate: "2026-02-20", assignee: "Dr. Rajesh K.", status: "Scheduled" as const, priority: "High" as const, frequency: "Quarterly" },
  { id: "PM-302", equipment: "Ventilator Bank (ICU - 12 units)", type: "Internal PM", dueDate: "2026-02-15", assignee: "Tech. Anand S.", status: "Overdue" as const, priority: "Critical" as const, frequency: "Monthly" },
  { id: "PM-303", equipment: "Patient Monitors (Floor 3)", type: "Internal PM", dueDate: "2026-02-28", assignee: "Tech. Priya M.", status: "Scheduled" as const, priority: "Medium" as const, frequency: "Semi-Annual" },
  { id: "PM-304", equipment: "Infusion Pumps (Gen Ward)", type: "Calibration", dueDate: "2026-03-10", assignee: "Tech. Kumar R.", status: "Scheduled" as const, priority: "Medium" as const, frequency: "Annual" },
  { id: "PM-305", equipment: "Defibrillators (All Floors)", type: "EST", dueDate: "2026-02-14", assignee: "Tech. Meena J.", status: "In Progress" as const, priority: "Critical" as const, frequency: "Monthly" },
]

export const calibrationList = [
  { id: "CAL-101", equipment: "Patient Monitor - GE Carescape", parameter: "SpO2, NIBP, ECG", standard: "NABL Ref #2241", dueDate: "2026-02-18", status: "Scheduled" as const, result: "-", assignee: "Tech. Priya M." },
  { id: "CAL-102", equipment: "Infusion Pump - B.Braun", parameter: "Flow Rate", standard: "NABL Ref #2242", dueDate: "2026-02-14", status: "Completed" as const, result: "Pass", assignee: "Tech. Kumar R." },
  { id: "CAL-103", equipment: "Defibrillator - Philips MRx", parameter: "Energy Output", standard: "NABL Ref #2243", dueDate: "2026-02-16", status: "In Progress" as const, result: "-", assignee: "Tech. Meena J." },
  { id: "CAL-104", equipment: "Ventilator - Draeger Savina", parameter: "Tidal Volume, Pressure", standard: "NABL Ref #2244", dueDate: "2026-03-01", status: "Scheduled" as const, result: "-", assignee: "Tech. Anand S." },
]

export const inventoryItems = [
  { id: "INV-001", name: "X-Ray Tubes (Varian)", category: "Imaging Parts", qty: 4, minQty: 2, unitCost: 12500, status: "In Stock" as const },
  { id: "INV-002", name: "Ventilator Flow Sensors", category: "Respiratory", qty: 12, minQty: 5, unitCost: 320, status: "In Stock" as const },
  { id: "INV-003", name: "ECG Electrode Pads (Box/100)", category: "Monitoring", qty: 1, minQty: 5, unitCost: 45, status: "Low Stock" as const },
  { id: "INV-004", name: "Infusion Pump Batteries", category: "Power", qty: 8, minQty: 4, unitCost: 180, status: "In Stock" as const },
  { id: "INV-005", name: "Ultrasound Probe - Linear", category: "Imaging Parts", qty: 0, minQty: 1, unitCost: 8900, status: "Out of Stock" as const },
  { id: "INV-006", name: "Defibrillator Pads (Adult)", category: "Emergency", qty: 15, minQty: 10, unitCost: 95, status: "In Stock" as const },
  { id: "INV-007", name: "Autoclave Gaskets (Set)", category: "Sterilization", qty: 2, minQty: 3, unitCost: 210, status: "Low Stock" as const },
]
