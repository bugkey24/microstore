'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  loading: boolean
  setIsLoggedIn: (val: boolean) => void
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      setIsLoggedIn(data.success === true)
    } catch (err) {
      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsLoggedIn(false)
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, setIsLoggedIn, refreshSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
