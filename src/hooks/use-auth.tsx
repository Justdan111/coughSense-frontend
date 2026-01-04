"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useReducer,
} from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/api"
import Cookies from "js-cookie"

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  clearError: () => void
  verifyToken: () => Promise<void>
}

type AuthState = {
  user: User | null
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" }

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_USER":
      return { ...state, user: action.payload, error: null }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "LOGOUT":
      return { user: null, isLoading: false, error: null }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  // Verify token on mount and restore session
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true })

      const storedUser = localStorage.getItem("cough_triage_user")
      const token = Cookies.get("access_token")

      if (storedUser && token) {
        try {
          // Verify token is still valid
          await authService.getCurrentUser()
          dispatch({ type: "SET_USER", payload: JSON.parse(storedUser) })
        } catch {
          // Token invalid or expired
          authService.logout()
          Cookies.remove("access_token")
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "LOGOUT" })
      }
      dispatch({ type: "SET_LOADING", payload: false })
    }

    initializeAuth()
  }, [])

  const verifyToken = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser()
      dispatch({ type: "SET_USER", payload: user })
    } catch (error) {
      dispatch({ type: "LOGOUT" })
      throw error
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        const response = await authService.login(email, password)

        const userData: User = {
          id: response.user_id,
          email: response.email,
          name: response.name,
        }

        // Store token in cookie
        Cookies.set("access_token", response.access_token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          expires: 7, // 7 days
        })

        // Store user info in localStorage
        localStorage.setItem("cough_triage_user", JSON.stringify(userData))

        dispatch({ type: "SET_USER", payload: userData })
        router.push("/dashboard")
      } catch (error: Error | unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw error
      }
    },
    [router]
  )

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      dispatch({ type: "SET_LOADING", payload: true })
      try {
        const response = await authService.register(email, password, name)

        const userData: User = {
          id: response.user_id,
          email: response.email,
          name: response.name,
        }

        // Store token in cookie
        Cookies.set("access_token", response.access_token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          expires: 7,
        })

        // Store user info in localStorage
        localStorage.setItem("cough_triage_user", JSON.stringify(userData))

        dispatch({ type: "SET_USER", payload: userData })
        router.push("/dashboard")
      } catch (error: Error | unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Registration failed"
        dispatch({ type: "SET_ERROR", payload: errorMessage })
        throw error
      }
    },
    [router]
  )

  const logout = useCallback(() => {
    authService.logout()
    Cookies.remove("access_token")
    dispatch({ type: "LOGOUT" })
    router.push("/")
  }, [router])

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null })
  }, [])

  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: !!state.user,
    error: state.error,
    login,
    signup,
    logout,
    clearError,
    verifyToken,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
