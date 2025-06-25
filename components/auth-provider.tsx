'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, type AuthUser, type AuthSession } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured || !supabase) {
      console.warn('Supabase not configured. Please add environment variables.')
      setIsLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) return
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user as AuthUser || null)
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user as AuthUser || null)
        setIsLoading(false)
      })

      return () => subscription.unsubscribe()
    }
  }, [configured])

  const signUp = async (email: string, password: string) => {
    if (!configured || !supabase) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    if (!configured || !supabase) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    if (!configured || !supabase) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { error }
  }

  const signOut = async () => {
    if (!configured || !supabase) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    if (!configured || !supabase) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: !!configured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 