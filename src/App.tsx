import { useState } from "react"
import { RouterProvider } from "react-router-dom"
import { LoginScreen, type LoginRole } from "@/components/cmms/login-screen"
import { AuthProvider } from "@/context/auth-context"
import { router } from "@/router"

const AUTH_STORAGE_KEY = "biomed_cmms_auth"

type PersistedAuth = {
  isLoggedIn: boolean
  userRole: LoginRole
}

function loadPersistedAuth(): PersistedAuth {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, userRole: "user" }
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return { isLoggedIn: false, userRole: "user" }
  }

  try {
    const parsed = JSON.parse(raw) as PersistedAuth
    return {
      isLoggedIn: Boolean(parsed.isLoggedIn),
      userRole: parsed.userRole ?? "user",
    }
  } catch {
    return { isLoggedIn: false, userRole: "user" }
  }
}

export default function App() {
  const [authState, setAuthState] = useState<PersistedAuth>(() => loadPersistedAuth())

  const saveAuth = (nextState: PersistedAuth) => {
    setAuthState(nextState)
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState))
  }

  const clearAuth = () => {
    setAuthState({ isLoggedIn: false, userRole: "user" })
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  if (!authState.isLoggedIn) {
    return (
      <LoginScreen
        onLogin={({ role }) => {
          saveAuth({ isLoggedIn: true, userRole: role })
        }}
      />
    )
  }

  return (
    <AuthProvider
      value={{
        userRole: authState.userRole,
        logout: clearAuth,
      }}
    >
      <RouterProvider router={router} />
    </AuthProvider>
  )
}