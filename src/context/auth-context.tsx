import { createContext, useContext } from "react"
import type { LoginRole } from "@/components/cmms/login-screen"

type AuthContextType = {
  userRole: LoginRole
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ value, children }: { value: AuthContextType; children: React.ReactNode }) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
