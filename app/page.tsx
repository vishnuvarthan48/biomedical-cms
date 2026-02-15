"use client"

import { useState } from "react"
import { LoginScreen, type LoginRole } from "@/components/cmms/login-screen"
import { AppShell } from "@/components/cmms/app-shell"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<LoginRole>("user")

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={({ role }) => {
          setUserRole(role)
          setIsLoggedIn(true)
        }}
      />
    )
  }

  return (
    <AppShell
      onLogout={() => {
        setIsLoggedIn(false)
        setUserRole("user")
      }}
      userRole={userRole}
    />
  )
}
