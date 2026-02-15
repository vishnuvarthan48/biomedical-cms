"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Eye, EyeOff, Loader2, Lock, CheckCircle2, AlertTriangle } from "lucide-react"

export type LoginRole = "platform-admin" | "tenant-admin" | "user"

interface LoginResult {
  role: LoginRole
  mustChangePassword: boolean
}

export function LoginScreen({ onLogin }: { onLogin: (result: LoginResult) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  // Force Change Password state
  const [showForceChange, setShowForceChange] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showNewPw, setShowNewPw] = useState(false)
  const [changePwRole, setChangePwRole] = useState<LoginRole>("user")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      // Determine role from email
      const emailLower = email.toLowerCase()
      if (emailLower.includes("platform") || emailLower.includes("superadmin")) {
        onLogin({ role: "platform-admin", mustChangePassword: false })
      } else if (emailLower.includes("tenant") || emailLower.includes("admin")) {
        // Simulate forced password change for tenant admin demo
        if (emailLower.includes("new") || emailLower.includes("reset")) {
          setChangePwRole("tenant-admin")
          setShowForceChange(true)
        } else {
          onLogin({ role: "tenant-admin", mustChangePassword: false })
        }
      } else {
        onLogin({ role: "user", mustChangePassword: false })
      }
    }, 1000)
  }

  const handleForceChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw !== confirmPw) return
    if (newPw.length < 8) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowForceChange(false)
      onLogin({ role: changePwRole, mustChangePassword: false })
    }, 800)
  }

  const passwordValid = newPw.length >= 8
  const passwordMatch = newPw === confirmPw && confirmPw.length > 0
  const hasUppercase = /[A-Z]/.test(newPw)
  const hasNumber = /[0-9]/.test(newPw)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPw)

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1B2A4A 50%, #00838F 100%)" }}>
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #00BCD4, transparent)", animation: "pulse 4s ease-in-out infinite" }} />
        <div className="absolute bottom-[15%] right-[15%] w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #00E5CC, transparent)", animation: "pulse 5s ease-in-out infinite reverse" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(0,188,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,188,212,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.2} 50%{transform:scale(1.1);opacity:0.4} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00BCD4, #00E5CC)", boxShadow: "0 8px 32px rgba(0,188,212,0.4)", animation: "heartbeat 2s ease-in-out infinite" }}>
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Bio<span style={{ color: "#00BCD4" }}>Med</span> CMMS
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>Biomedical Equipment Management System</p>
        </div>

        {/* Force Change Password Screen */}
        {showForceChange ? (
          <Card className="border-0 shadow-2xl" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-1">
                <Lock className="w-5 h-5 text-[#F59E0B]" />
                <h2 className="text-xl font-bold text-white">Change Password Required</h2>
              </div>
              <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>You must change your password before continuing.</p>

              <form onSubmit={handleForceChangeSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    className="h-12 rounded-xl border-0 text-white placeholder:text-[#64748B]"
                    style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>New Password</Label>
                  <div className="relative">
                    <Input type={showNewPw ? "text" : "password"} placeholder="Enter new password" value={newPw}
                      onChange={e => setNewPw(e.target.value)}
                      className="h-12 rounded-xl border-0 text-white pr-12 placeholder:text-[#64748B]"
                      style={{ background: "rgba(255,255,255,0.06)" }} />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                      {showNewPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password policy indicators */}
                  {newPw.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {[
                        { label: "At least 8 characters", valid: passwordValid },
                        { label: "Contains uppercase letter", valid: hasUppercase },
                        { label: "Contains a number", valid: hasNumber },
                        { label: "Contains special character", valid: hasSpecial },
                      ].map(rule => (
                        <div key={rule.label} className="flex items-center gap-2">
                          {rule.valid ? <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />}
                          <span className={`text-xs ${rule.valid ? "text-[#10B981]" : "text-[#F59E0B]"}`}>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>Confirm Password</Label>
                  <Input type="password" placeholder="Confirm new password" value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    className="h-12 rounded-xl border-0 text-white placeholder:text-[#64748B]"
                    style={{ background: "rgba(255,255,255,0.06)" }} />
                  {confirmPw.length > 0 && !passwordMatch && (
                    <p className="text-xs text-[#EF4444] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" disabled={loading || !passwordValid || !passwordMatch || !hasUppercase || !hasNumber || !hasSpecial || !currentPw}
                  className="h-12 rounded-xl text-base font-bold text-white border-0 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)", boxShadow: "0 4px 20px rgba(0,188,212,0.4)" }}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Change Password & Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Normal Login */
          <Card className="border-0 shadow-2xl" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>Sign in to your account to continue</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>Email Address</Label>
                  <Input type="email" placeholder="admin@hospital.org" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 rounded-xl border-0 text-white placeholder:text-[#64748B]"
                    style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold" style={{ color: "#CBD5E1" }}>Password</Label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} placeholder="Enter your password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-12 rounded-xl border-0 text-white pr-12 placeholder:text-[#64748B]"
                      style={{ background: "rgba(255,255,255,0.06)" }} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors">
                      {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "#94A3B8" }}>
                    <input type="checkbox" className="w-4 h-4 rounded accent-[#00BCD4]" />
                    Remember me
                  </label>
                  <button type="button" className="text-sm font-semibold hover:underline" style={{ color: "#00BCD4" }}>
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" disabled={loading}
                  className="h-12 rounded-xl text-base font-bold text-white border-0 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #00BCD4, #00838F)", boxShadow: "0 4px 20px rgba(0,188,212,0.4)" }}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </Button>
              </form>

              {/* Demo login hints */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-xs font-semibold mb-3" style={{ color: "#64748B" }}>Demo Logins:</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Platform Admin", email: "platform@admin.com", hint: "Full platform access" },
                    { label: "Tenant Admin", email: "tenant.admin@hospital.com", hint: "Tenant-level admin" },
                    { label: "CMMS User", email: "user@hospital.com", hint: "Standard CMMS access" },
                  ].map(demo => (
                    <button key={demo.email} onClick={() => { setEmail(demo.email); setPassword("demo123") }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,188,212,0.08)"; e.currentTarget.style.borderColor = "rgba(0,188,212,0.2)" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)" }}>
                      <div>
                        <p className="text-xs font-bold text-white">{demo.label}</p>
                        <p className="text-[10px]" style={{ color: "#64748B" }}>{demo.hint}</p>
                      </div>
                      <code className="text-[10px] font-mono" style={{ color: "#00BCD4" }}>{demo.email}</code>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs" style={{ color: "#64748B" }}>
                  Enterprise Healthcare Platform by <span className="font-semibold" style={{ color: "#00BCD4" }}>Nexflow Technologies</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
          NABH / AERB / IEC 62353 Compliant
        </p>
      </div>
    </div>
  )
}
