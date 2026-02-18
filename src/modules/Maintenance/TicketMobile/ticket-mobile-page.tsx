"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  ScanLine,
  QrCode,
  Camera,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  FileText,
  Image as ImageIcon,
  Send,
  RotateCcw,
  Smartphone,
  Zap,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/src/constants/modules";

/* ─── Mock asset data (same as asset registration) ─── */
const mockAssets = [
  { id: "AST-001", serialNo: "MAG-2023-1001", deviceName: "MRI Scanner", deviceModel: "Magnetom Vida", deviceType: "Imaging", department: "Radiology", hospital: "Apollo Hospital - Chennai", barcode: "2310011001", qrCode: "AST-001-MAG-2023-1001" },
  { id: "AST-002", serialNo: "REV-2022-3044", deviceName: "CT Scanner", deviceModel: "Revolution EVO", deviceType: "Imaging", department: "Radiology", hospital: "Apollo Hospital - Chennai", barcode: "2220223044", qrCode: "AST-002-REV-2022-3044" },
  { id: "AST-003", serialNo: "SAV-2024-8811", deviceName: "Ventilator", deviceModel: "Savina 300", deviceType: "Life Support", department: "ICU", hospital: "Apollo Hospital - Delhi", barcode: "2420248811", qrCode: "AST-003-SAV-2024-8811" },
  { id: "AST-004", serialNo: "EPQ-2023-5522", deviceName: "Ultrasound System", deviceModel: "EPIQ Elite", deviceType: "Imaging", department: "OB/GYN", hospital: "Apollo Hospital - Chennai", barcode: "2320235522", qrCode: "AST-004-EPQ-2023-5522" },
  { id: "AST-005", serialNo: "INF-2024-7733", deviceName: "Infusion Pump", deviceModel: "Infusomat Space", deviceType: "Infusion", department: "General Ward", hospital: "Apollo Hospital - Delhi", barcode: "2420247733", qrCode: "AST-005-INF-2024-7733" },
  { id: "AST-006", serialNo: "HRT-2023-4456", deviceName: "Defibrillator", deviceModel: "HeartStart MRx", deviceType: "Emergency", department: "Emergency", hospital: "Apollo Hospital - Chennai", barcode: "2320234456", qrCode: "AST-006-HRT-2023-4456" },
  { id: "AST-007", serialNo: "CAR-2024-9900", deviceName: "Patient Monitor", deviceModel: "Carescape B650", deviceType: "Monitoring", department: "ICU", hospital: "Apollo Hospital - Delhi", barcode: "2420249900", qrCode: "AST-007-CAR-2024-9900" },
  { id: "AST-008", serialNo: "ANS-2023-6677", deviceName: "Anesthesia Machine", deviceModel: "Aisys CS2", deviceType: "Life Support", department: "OT", hospital: "Apollo Hospital - Chennai", barcode: "2320236677", qrCode: "AST-008-ANS-2023-6677" },
];

type Step = "scan" | "details" | "photo" | "review";

const steps: { key: Step; label: string }[] = [
  { key: "scan", label: "Scan Asset" },
  { key: "details", label: "Issue Details" },
  { key: "photo", label: "Attach Photo" },
  { key: "review", label: "Review" },
];

/* ─── Info Row Helper ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border/60 last:border-0">
      <span className="text-xs font-medium text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right ml-3 break-words">{value || "-"}</span>
    </div>
  );
}

export function TicketMobilePage() {
  const navigate = useNavigate();

  /* ─── Step state ─── */
  const [currentStep, setCurrentStep] = useState<Step>("scan");
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  /* ─── Step 1: Scan / Select asset ─── */
  const [scanMode, setScanMode] = useState<"barcode" | "qr" | "manual">("barcode");
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  /* ─── Asset data ─── */
  const [selectedAsset, setSelectedAsset] = useState<typeof mockAssets[0] | null>(null);

  /* ─── Step 2: Issue details ─── */
  const [requestType, setRequestType] = useState("Generic");
  const [priority, setPriority] = useState("Low");
  const [assetStatus, setAssetStatus] = useState("Not Working");
  const [rootProblem, setRootProblem] = useState("");
  const [problem, setProblem] = useState("");
  const [remarks, setRemarks] = useState("");

  /* ─── Step 3: Photo ─── */
  const [photos, setPhotos] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /* ─── Step 4: Review submitted ─── */
  const [submitted, setSubmitted] = useState(false);

  /* ─── Simulate barcode / QR scan ─── */
  const simulateScan = () => {
    setScanning(true);
    setScanError("");
    setTimeout(() => {
      const randomAsset = mockAssets[Math.floor(Math.random() * mockAssets.length)];
      setSelectedAsset(randomAsset);
      setScanning(false);
    }, 1800);
  };

  /* ─── Manual lookup ─── */
  const handleManualLookup = () => {
    setScanError("");
    const code = manualCode.trim();
    if (!code) return;
    const found = mockAssets.find(
      (a) =>
        a.barcode === code ||
        a.qrCode.toLowerCase() === code.toLowerCase() ||
        a.id.toLowerCase() === code.toLowerCase() ||
        a.serialNo.toLowerCase() === code.toLowerCase()
    );
    if (found) {
      setSelectedAsset(found);
    } else {
      setScanError("No asset found. Try a different code or select manually.");
    }
  };

  /* ─── Manual select ─── */
  const handleManualSelect = (assetId: string) => {
    const found = mockAssets.find((a) => a.id === assetId);
    if (found) setSelectedAsset(found);
  };

  /* ─── Photo capture ─── */
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  /* ─── Navigation ─── */
  const canGoNext = () => {
    if (currentStep === "scan") return !!selectedAsset;
    if (currentStep === "details") return !!problem.trim();
    return true;
  };

  const goNext = () => {
    const idx = steps.findIndex((s) => s.key === currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].key);
  };

  const goBack = () => {
    const idx = steps.findIndex((s) => s.key === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].key);
  };

  const handleSubmit = () => setSubmitted(true);

  const handleReset = () => {
    setCurrentStep("scan");
    setScanMode("barcode");
    setManualCode("");
    setScanning(false);
    setScanError("");
    setSelectedAsset(null);
    setRequestType("Generic");
    setPriority("Low");
    setAssetStatus("Not Working");
    setRootProblem("");
    setProblem("");
    setRemarks("");
    setPhotos([]);
    setSubmitted(false);
  };

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
        >
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground tracking-tight">
            Quick Ticket
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Mobile Ticket Generation
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1 px-1">
        {steps.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx || submitted;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-center">
                <div
                  className={cn(
                    "w-full h-1.5 rounded-full transition-all duration-300",
                    isDone
                      ? "bg-[#10B981]"
                      : isActive
                        ? "bg-[#00BCD4]"
                        : "bg-muted",
                  )}
                />
              </div>
              <div className="flex items-center gap-1">
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <span
                    className={cn(
                      "w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center",
                      isActive
                        ? "bg-[#00BCD4] text-white"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {idx + 1}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] font-semibold hidden sm:inline",
                    isActive ? "text-[#00BCD4]" : isDone ? "text-[#10B981]" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── STEP 1: SCAN ASSET ─── */}
      {currentStep === "scan" && !submitted && (
        <div className="flex flex-col gap-4">
          {/* Scan Mode Selector */}
          <div
            className="rounded-2xl p-1 flex gap-1"
            style={{ background: "rgba(0,188,212,0.06)", border: "1px solid rgba(0,188,212,0.12)" }}
          >
            {(["barcode", "qr", "manual"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setScanMode(mode); setScanError(""); setSelectedAsset(null); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  scanMode === mode
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode === "barcode" && <ScanLine className="w-3.5 h-3.5" />}
                {mode === "qr" && <QrCode className="w-3.5 h-3.5" />}
                {mode === "manual" && <FileText className="w-3.5 h-3.5" />}
                {mode === "barcode" ? "Barcode" : mode === "qr" ? "QR Code" : "Manual"}
              </button>
            ))}
          </div>

          {/* Scanner Area (barcode or QR) */}
          {(scanMode === "barcode" || scanMode === "qr") && !selectedAsset && (
            <div
              className="rounded-2xl overflow-hidden relative"
              style={{ background: "#0D1B2A" }}
            >
              <div className="flex flex-col items-center justify-center py-12 px-6 gap-5">
                {/* Viewfinder */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Corner marks */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-[#00BCD4] rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-[#00BCD4] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-[#00BCD4] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-[#00BCD4] rounded-br-lg" />

                  {/* Scan line animation */}
                  {scanning && (
                    <div
                      className="absolute left-2 right-2 h-0.5 bg-[#00BCD4] rounded-full"
                      style={{
                        animation: "scanLine 1.5s ease-in-out infinite",
                        boxShadow: "0 0 12px rgba(0,188,212,0.6)",
                      }}
                    />
                  )}

                  {/* Center icon */}
                  {!scanning ? (
                    <div className="flex flex-col items-center gap-2">
                      {scanMode === "barcode" ? (
                        <ScanLine className="w-12 h-12 text-[#00BCD4]/40" />
                      ) : (
                        <QrCode className="w-12 h-12 text-[#00BCD4]/40" />
                      )}
                    </div>
                  ) : (
                    <Loader2 className="w-8 h-8 text-[#00BCD4] animate-spin" />
                  )}
                </div>

                <p className="text-sm text-white/60 font-medium text-center">
                  {scanning
                    ? "Scanning... Hold steady"
                    : scanMode === "barcode"
                      ? "Position the barcode within the frame"
                      : "Align QR code within the viewfinder"
                  }
                </p>

                <Button
                  className="text-white border-0 text-sm font-bold h-11 px-8 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                  onClick={simulateScan}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      {scanMode === "barcode" ? "Scan Barcode" : "Scan QR Code"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Manual Entry */}
          {scanMode === "manual" && !selectedAsset && (
            <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-foreground">
                  Enter Asset ID, Serial No, or Barcode
                </Label>
                <div className="flex gap-2">
                  <Input
                    className="h-11 flex-1 text-sm"
                    placeholder="e.g. AST-001 or MAG-2023-1001"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualLookup()}
                  />
                  <Button
                    className="h-11 px-4 text-white border-0 shrink-0"
                    style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
                    onClick={handleManualLookup}
                  >
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">or select from list</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Select onValueChange={handleManualSelect}>
                <SelectTrigger className="h-11 text-sm">
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {mockAssets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.id} - {a.deviceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Scan Error */}
          {scanError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#EF4444]/8 border border-[#EF4444]/20">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <p className="text-xs font-medium text-[#EF4444]">{scanError}</p>
            </div>
          )}

          {/* Asset Found Card */}
          {selectedAsset && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.04)" }}
            >
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: "rgba(16,185,129,0.08)" }}
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-bold text-[#10B981]">Asset Identified</span>
                <button
                  onClick={() => { setSelectedAsset(null); setManualCode(""); }}
                  className="ml-auto text-muted-foreground hover:text-[#EF4444] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-2">
                <InfoRow label="Asset ID" value={selectedAsset.id} />
                <InfoRow label="Serial No" value={selectedAsset.serialNo} />
                <InfoRow label="Device" value={`${selectedAsset.deviceName} - ${selectedAsset.deviceModel}`} />
                <InfoRow label="Type" value={selectedAsset.deviceType} />
                <InfoRow label="Department" value={selectedAsset.department} />
                <InfoRow label="Hospital" value={selectedAsset.hospital} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── STEP 2: ISSUE DETAILS ─── */}
      {currentStep === "details" && !submitted && (
        <div className="flex flex-col gap-4">
          {/* Asset summary chip */}
          {selectedAsset && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#00BCD4]/5 border border-[#00BCD4]/15">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(0,188,212,0.12)" }}>
                <ScanLine className="w-3 h-3 text-[#00BCD4]" />
              </div>
              <span className="text-xs font-semibold text-foreground truncate">
                {selectedAsset.id} - {selectedAsset.deviceName}
              </span>
            </div>
          )}

          <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-foreground">
                Problem Description <span className="text-[#EF4444]">*</span>
              </Label>
              <Textarea
                className="min-h-[100px] resize-none text-sm"
                placeholder="Describe what is wrong with the equipment..."
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-foreground">Request Type</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Generic">Generic</SelectItem>
                    <SelectItem value="Breakdown">Breakdown</SelectItem>
                    <SelectItem value="Calibration">Calibration</SelectItem>
                    <SelectItem value="Installation">Installation</SelectItem>
                    <SelectItem value="Inspection">Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-foreground">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-foreground">Asset Status</Label>
                <Select value={assetStatus} onValueChange={setAssetStatus}>
                  <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Working">Not Working</SelectItem>
                    <SelectItem value="Partially Working">Partially</SelectItem>
                    <SelectItem value="Intermittent">Intermittent</SelectItem>
                    <SelectItem value="Performance Degraded">Degraded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-foreground">Root Cause</Label>
                <Select value={rootProblem} onValueChange={setRootProblem}>
                  <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Calibration">Calibration</SelectItem>
                    <SelectItem value="Sensor">Sensor</SelectItem>
                    <SelectItem value="Wear_Tear">{"Wear & Tear"}</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-foreground">Remarks</Label>
              <Textarea
                className="min-h-[70px] resize-none text-sm"
                placeholder="Any additional notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: ATTACH PHOTO ─── */}
      {currentStep === "photo" && !submitted && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Issue Photos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Take a photo or upload from gallery</p>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{photos.length}/5</span>
            </div>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                    <img src={src} alt={`Issue photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-card/90 border border-border flex items-center justify-center hover:bg-[#EF4444]/10 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-[#EF4444]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            {photos.length < 5 && (
              <div
                className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center py-10 gap-3 cursor-pointer hover:border-[#00BCD4]/50 hover:bg-[#00BCD4]/3 transition-all"
                onClick={() => photoInputRef.current?.click()}
              >
                <input
                  ref={photoInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                />
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(0,188,212,0.08)" }}
                >
                  <Camera className="w-7 h-7 text-[#00BCD4]/60" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">Tap to capture or upload</p>
                  <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG up to 10MB</p>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center">
              Photos help the biomedical team diagnose the issue faster
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 4: REVIEW ─── */}
      {currentStep === "review" && !submitted && (
        <div className="flex flex-col gap-4">
          {/* Asset Card */}
          {selectedAsset && (
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "rgba(0,188,212,0.06)", borderBottom: "1px solid rgba(0,188,212,0.1)" }}>
                <ScanLine className="w-3.5 h-3.5 text-[#00BCD4]" />
                <span className="text-xs font-bold text-[#00BCD4]">Asset Details</span>
              </div>
              <div className="px-4 py-1">
                <InfoRow label="Asset ID" value={selectedAsset.id} />
                <InfoRow label="Device" value={`${selectedAsset.deviceName} - ${selectedAsset.deviceModel}`} />
                <InfoRow label="Department" value={selectedAsset.department} />
                <InfoRow label="Hospital" value={selectedAsset.hospital} />
              </div>
            </div>
          )}

          {/* Issue Card */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "rgba(245,158,11,0.06)", borderBottom: "1px solid rgba(245,158,11,0.1)" }}>
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-xs font-bold text-[#F59E0B]">Issue Details</span>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="Problem" value={problem} />
              <InfoRow label="Request Type" value={requestType} />
              <InfoRow label="Priority" value={priority} />
              <InfoRow label="Asset Status" value={assetStatus} />
              {rootProblem && <InfoRow label="Root Cause" value={rootProblem} />}
              {remarks && <InfoRow label="Remarks" value={remarks} />}
            </div>
          </div>

          {/* Photos Card */}
          {photos.length > 0 && (
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "rgba(0,188,212,0.06)", borderBottom: "1px solid rgba(0,188,212,0.1)" }}>
                <ImageIcon className="w-3.5 h-3.5 text-[#00BCD4]" />
                <span className="text-xs font-bold text-[#00BCD4]">Attached Photos ({photos.length})</span>
              </div>
              <div className="p-3 grid grid-cols-4 gap-2">
                {photos.map((src, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SUCCESS STATE ─── */}
      {submitted && (
        <div className="flex flex-col items-center gap-5 py-10">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)" }}
          >
            <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-foreground">Ticket Submitted</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your ticket has been created successfully.
              <br />
              The biomedical team will review it shortly.
            </p>
            <p className="text-lg font-bold text-[#00BCD4] mt-3">
              TKT-{Date.now().toString().slice(-6)}
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="h-11 px-5 text-sm font-semibold rounded-xl"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" /> New Ticket
            </Button>
            <Button
              className="h-11 px-5 text-sm font-bold text-white border-0 rounded-xl"
              style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)" }}
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* ─── BOTTOM NAV ─── */}
      {!submitted && (
        <div className="flex items-center gap-3 pt-2">
          {currentIdx > 0 && (
            <Button
              variant="outline"
              className="h-12 flex-1 text-sm font-semibold rounded-xl"
              onClick={goBack}
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>
          )}
          {currentStep === "review" ? (
            <Button
              className="h-12 flex-1 text-sm font-bold text-white border-0 rounded-xl"
              style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
              onClick={handleSubmit}
              disabled={!selectedAsset}
            >
              <Send className="w-4 h-4 mr-2" /> Submit Ticket
            </Button>
          ) : (
            <Button
              className="h-12 flex-1 text-sm font-bold text-white border-0 rounded-xl"
              style={{ background: canGoNext() ? "linear-gradient(135deg, #00BCD4, #00838F)" : undefined }}
              disabled={!canGoNext()}
              onClick={goNext}
            >
              Next <ChevronRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      )}

      {/* Keyframe for scan line animation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
