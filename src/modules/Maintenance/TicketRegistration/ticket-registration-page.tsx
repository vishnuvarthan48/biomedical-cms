"use client";

import { useState, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Upload,
  FileText,
  ArrowLeft,
  Send,
  RotateCcw,
  Image as ImageIcon,
  X,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/modules";

const mockAssets = [
  { id: "AST-001", serialNo: "MAG-2023-1001", deviceName: "MRI Scanner", deviceModel: "Magnetom Vida", deviceType: "Imaging", department: "Radiology", hospital: "Apollo Hospital - Chennai" },
  { id: "AST-002", serialNo: "REV-2022-3044", deviceName: "CT Scanner", deviceModel: "Revolution EVO", deviceType: "Imaging", department: "Radiology", hospital: "Apollo Hospital - Chennai" },
  { id: "AST-003", serialNo: "SAV-2024-8811", deviceName: "Ventilator", deviceModel: "Savina 300", deviceType: "Life Support", department: "ICU", hospital: "Apollo Hospital - Delhi" },
  { id: "AST-004", serialNo: "EPQ-2023-5522", deviceName: "Ultrasound System", deviceModel: "EPIQ Elite", deviceType: "Imaging", department: "OB/GYN", hospital: "Apollo Hospital - Chennai" },
  { id: "AST-005", serialNo: "INF-2024-7733", deviceName: "Infusion Pump", deviceModel: "Infusomat Space", deviceType: "Infusion", department: "General Ward", hospital: "Apollo Hospital - Delhi" },
  { id: "AST-006", serialNo: "HRT-2023-4456", deviceName: "Defibrillator", deviceModel: "HeartStart MRx", deviceType: "Emergency", department: "Emergency", hospital: "Apollo Hospital - Chennai" },
  { id: "AST-007", serialNo: "CAR-2024-9900", deviceName: "Patient Monitor", deviceModel: "Carescape B650", deviceType: "Monitoring", department: "ICU", hospital: "Apollo Hospital - Delhi" },
  { id: "AST-008", serialNo: "ANS-2023-6677", deviceName: "Anesthesia Machine", deviceModel: "Aisys CS2", deviceType: "Life Support", department: "OT", hospital: "Apollo Hospital - Chennai" },
];

const ticketDocCategories = [
  { name: "Purchase Order", desc: "Purchase order documentation for the equipment", formats: "PDF, DOC" },
  { name: "Invoice", desc: "Vendor invoice and billing documents", formats: "PDF" },
  { name: "Delivery Note", desc: "Goods receipt and delivery confirmation", formats: "PDF" },
  { name: "Issue Document", desc: "Documents describing the reported issue", formats: "PDF, DOC, JPG" },
];

function FormField({ label, required, children, className }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label className="text-sm font-bold text-foreground">
        {label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function TicketRegistrationPage() {
  const navigate = useNavigate();

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [department, setDepartment] = useState("");
  const [hospital, setHospital] = useState("");

  const [requestType, setRequestType] = useState("Generic");
  const [priority, setPriority] = useState("Low");
  const [rootProblem, setRootProblem] = useState("");
  const [assetStatus, setAssetStatus] = useState("Not Working");
  const [problem, setProblem] = useState("");
  const [remarks, setRemarks] = useState("");

  const [issueImagePreview, setIssueImagePreview] = useState<string | null>(null);
  const issueImageRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState(ticketDocCategories);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatFormats, setNewCatFormats] = useState("PDF, DOC");

  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId);
    const found = mockAssets.find((a) => a.id === assetId);
    if (found) {
      setSerialNo(found.serialNo);
      setDeviceName(found.deviceName);
      setDeviceModel(found.deviceModel);
      setDeviceType(found.deviceType);
      setDepartment(found.department);
      setHospital(found.hospital);
    } else {
      setSerialNo(""); setDeviceName(""); setDeviceModel("");
      setDeviceType(""); setDepartment(""); setHospital("");
    }
  };

  const handleIssueImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIssueImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSimulateUpload = (catName: string) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [catName]: [...(prev[catName] || []), `${catName.replace(/\s+/g, "_")}_${Date.now()}.pdf`],
    }));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    setCategories((prev) => [...prev, { name: newCatName.trim(), desc: newCatDesc.trim() || "Custom document category", formats: newCatFormats.trim() || "PDF, DOC" }]);
    setNewCatName(""); setNewCatDesc(""); setNewCatFormats("PDF, DOC"); setShowAddForm(false);
  };

  const handleRemoveCategory = (catName: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== catName));
    setUploadedFiles((prev) => { const next = { ...prev }; delete next[catName]; return next; });
  };

  const uploadedCount = Object.keys(uploadedFiles).filter((k) => uploadedFiles[k]?.length > 0).length;

  const clearForm = () => {
    setSelectedAssetId(""); setSerialNo(""); setDeviceName(""); setDeviceModel("");
    setDeviceType(""); setDepartment(""); setHospital("");
    setRequestType("Generic"); setPriority("Low"); setRootProblem("");
    setAssetStatus("Not Working"); setProblem(""); setRemarks("");
    setIssueImagePreview(null); setCategories(ticketDocCategories); setUploadedFiles({});
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(ROUTES.WORK_ORDERS)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-card hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Ticket Generation</h1>
          <p className="text-base text-muted-foreground mt-1">Create a new corrective maintenance ticket</p>
        </div>
      </div>

      {/* Form + Side Panel */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <FormField label="Asset ID" required>
                  <Select value={selectedAssetId} onValueChange={handleAssetChange}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select Asset" /></SelectTrigger>
                    <SelectContent>{mockAssets.map((a) => <SelectItem key={a.id} value={a.id}>{a.id} - {a.deviceName}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Serial No" required>
                  <Input className={cn("h-10", selectedAssetId && "bg-muted/30 font-semibold")} placeholder="Auto-populated from asset" value={serialNo} readOnly={!!selectedAssetId} onChange={(e) => setSerialNo(e.target.value)} />
                </FormField>
                <FormField label="Device Name" required>
                  <Input className={cn("h-10", selectedAssetId && "bg-muted/30 font-semibold")} placeholder="Auto-populated from asset" value={deviceName} readOnly={!!selectedAssetId} onChange={(e) => setDeviceName(e.target.value)} />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <FormField label="Device Model" required>
                  <Input className={cn("h-10", selectedAssetId && "bg-muted/30 font-semibold")} placeholder="Auto-populated from asset" value={deviceModel} readOnly={!!selectedAssetId} onChange={(e) => setDeviceModel(e.target.value)} />
                </FormField>
                <FormField label="Device Type" required>
                  <Input className={cn("h-10", selectedAssetId && "bg-muted/30 font-semibold")} placeholder="Auto-populated from asset" value={deviceType} readOnly={!!selectedAssetId} onChange={(e) => setDeviceType(e.target.value)} />
                </FormField>
                <FormField label="Department" required>
                  <Input className={cn("h-10", selectedAssetId && "bg-muted/30 font-semibold")} placeholder="Auto-populated from asset" value={department} readOnly={!!selectedAssetId} onChange={(e) => setDepartment(e.target.value)} />
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <FormField label="Hospital" required>
                  <Input className={cn("h-10", selectedAssetId && "bg-muted/30 font-semibold")} placeholder="Auto-populated from asset" value={hospital} readOnly={!!selectedAssetId} onChange={(e) => setHospital(e.target.value)} />
                </FormField>
                <FormField label="Request Type" required>
                  <Select value={requestType} onValueChange={setRequestType}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Generic">Generic</SelectItem>
                      <SelectItem value="Breakdown">Breakdown</SelectItem>
                      <SelectItem value="Calibration">Calibration</SelectItem>
                      <SelectItem value="Installation">Installation</SelectItem>
                      <SelectItem value="Inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Priority" required>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <FormField label="Root Problem" required>
                  <Select value={rootProblem} onValueChange={setRootProblem}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select root problem" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Calibration">Calibration Issue</SelectItem>
                      <SelectItem value="Sensor">Sensor Failure</SelectItem>
                      <SelectItem value="User Error">User Error</SelectItem>
                      <SelectItem value="Wear_Tear">{"Wear & Tear"}</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Asset Status" required>
                  <Select value={assetStatus} onValueChange={setAssetStatus}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Working">Not Working</SelectItem>
                      <SelectItem value="Partially Working">Partially Working</SelectItem>
                      <SelectItem value="Intermittent">Intermittent Fault</SelectItem>
                      <SelectItem value="Performance Degraded">Performance Degraded</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Problem" required>
                  <Textarea className="min-h-[80px] resize-none" placeholder="Describe the issue in detail..." value={problem} onChange={(e) => setProblem(e.target.value)} />
                </FormField>
              </div>
              <FormField label="Remarks" className="mb-0">
                <Textarea className="min-h-[80px] resize-y" placeholder="Additional remarks or observations..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Panel */}
        <div className="w-full xl:w-[280px] flex flex-col gap-4 shrink-0">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-bold text-foreground mb-3">Issue Image</p>
              <div
                className={cn("relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center min-h-[200px] transition-all cursor-pointer", issueImagePreview ? "border-[#00BCD4]/40 bg-[#00BCD4]/5" : "border-border hover:border-[#00BCD4]/50 hover:bg-[#00BCD4]/5")}
                onClick={() => issueImageRef.current?.click()}
              >
                <input ref={issueImageRef} type="file" className="hidden" accept="image/*" onChange={handleIssueImage} />
                {issueImagePreview ? (
                  <>
                    <img src={issueImagePreview} alt="Issue preview" className="w-full h-[200px] object-cover rounded-lg" />
                    <button onClick={(e) => { e.stopPropagation(); setIssueImagePreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/90 border border-border hover:bg-destructive/10 text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,188,212,0.08)" }}>
                      <ImageIcon className="w-8 h-8 text-[#00BCD4]/50" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium text-center">Click to upload an Issue image</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4 h-10 text-sm font-semibold gap-2">
                <Eye className="w-4 h-4" /> View Device Documents
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documents Section - Asset Registration Style */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-foreground pb-3 border-b border-border">Documents Section</h3>
              <p className="text-sm text-muted-foreground mt-2 font-medium">{uploadedCount} of {categories.length} categories have uploads</p>
            </div>
            <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 mr-1.5" /> Additional Category
            </Button>
          </div>

          {showAddForm && (
            <div className="rounded-xl border-2 border-dashed border-[#00BCD4]/40 bg-[#00BCD4]/5 p-5 mb-5">
              <h4 className="text-sm font-bold text-foreground mb-4">Add New Document Category</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Category Name <span className="text-[#EF4444]">*</span></Label>
                  <Input placeholder="e.g. Warranty Certificate" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="h-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Description</Label>
                  <Input placeholder="e.g. Equipment warranty documents" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} className="h-10" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold text-foreground">Accepted Formats</Label>
                  <Input placeholder="e.g. PDF, DOC, XLS" value={newCatFormats} onChange={(e) => setNewCatFormats(e.target.value)} className="h-10" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button className="text-white border-0 text-sm font-semibold h-10 px-5" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }} onClick={handleAddCategory} disabled={!newCatName.trim()}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Category
                </Button>
                <Button variant="outline" className="text-sm font-semibold h-10 px-4" onClick={() => { setShowAddForm(false); setNewCatName(""); setNewCatDesc(""); setNewCatFormats("PDF, DOC"); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {categories.map((cat, idx) => {
              const isEven = idx % 2 === 0;
              const files = uploadedFiles[cat.name] || [];
              const hasFiles = files.length > 0;
              const isCustom = !ticketDocCategories.some((d) => d.name === cat.name);

              return (
                <div key={cat.name} className={cn("flex rounded-xl border overflow-hidden transition-all", hasFiles ? "border-[#10B981]/30 bg-[#10B981]/5" : "border-border", isEven ? "flex-row" : "flex-row-reverse")}>
                  <div className={cn("flex-1 p-4 flex flex-col justify-center", isEven ? "pr-2" : "pl-2")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0", hasFiles ? "bg-[#10B981] text-white" : "bg-muted text-muted-foreground")}>
                        {hasFiles ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground">{cat.name}</h4>
                      {isCustom && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00BCD4]/10 text-[#00BCD4]">Custom</span>}
                      {isCustom && (
                        <button className="ml-auto text-muted-foreground hover:text-[#EF4444] transition-colors" onClick={() => handleRemoveCategory(cat.name)} title="Remove category">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className={cn("text-xs text-muted-foreground ml-8", isEven ? "text-left" : "text-right")}>{cat.desc}</p>
                    {hasFiles && (
                      <div className={cn("flex flex-wrap gap-1.5 mt-2 ml-8", isEven ? "justify-start" : "justify-end")}>
                        {files.map((f, fIdx) => (
                          <span key={fIdx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground">
                            <FileText className="w-3 h-3 text-[#00BCD4]" />
                            {f.length > 25 ? f.substring(0, 25) + "..." : f}
                            <button className="ml-0.5 text-muted-foreground hover:text-[#EF4444]" onClick={() => setUploadedFiles((prev) => ({ ...prev, [cat.name]: prev[cat.name].filter((_, i) => i !== fIdx) }))}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={cn("w-48 shrink-0 border-dashed flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-colors group", isEven ? "border-l" : "border-r", hasFiles ? "border-[#10B981]/30 hover:border-[#10B981]" : "border-border hover:border-[#00BCD4]")} onClick={() => handleSimulateUpload(cat.name)}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", hasFiles ? "bg-[#10B981]/10 group-hover:bg-[#10B981]/20" : "bg-muted group-hover:bg-[#00BCD4]/10")}>
                      <Upload className={cn("w-4 h-4 transition-colors", hasFiles ? "text-[#10B981]" : "text-muted-foreground group-hover:text-[#00BCD4]")} />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground text-center">{hasFiles ? "Add more" : "Drop file here"}</span>
                    <span className="text-xs text-muted-foreground">{cat.formats}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <h4 className="text-sm font-bold text-foreground mb-2">View Uploaded Documents</h4>
            {uploadedCount > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(uploadedFiles).map(([catName, files]) => files.map((f, fIdx) => (
                  <span key={`${catName}-${fIdx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs text-foreground font-medium">
                    <FileText className="w-3.5 h-3.5 text-[#00BCD4]" />
                    {f.length > 30 ? f.substring(0, 30) + "..." : f}
                  </span>
                )))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No checklists uploaded for this ticket.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button className="text-white border-0 text-sm font-semibold px-8 py-2.5 h-auto" style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}>
          <Send className="w-4 h-4 mr-2" /> Submit
        </Button>
        <Button variant="outline" className="text-sm font-semibold px-8 py-2.5 h-auto" onClick={clearForm}>
          <RotateCcw className="w-4 h-4 mr-2" /> Clear
        </Button>
      </div>
    </div>
  );
}
