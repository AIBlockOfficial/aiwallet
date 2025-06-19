"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { LoginPage } from "@/components/login-page"

// Lazy load heavy wallet components
const WalletSetup = lazy(() => import("@/components/wallet-setup").then(module => ({ default: module.WalletSetup })))
const WalletInterface = lazy(() => import("@/components/wallet-interface").then(module => ({ default: module.WalletInterface })))
const WalletProvider = lazy(() => import("@/components/wallet-provider").then(module => ({ default: module.WalletProvider })))

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <img 
        src="/logo_spinner.svg" 
        alt="Loading" 
        className="h-12 w-12 animate-spin"
      />
      <div className="text-lg">Loading PeerStone...</div>
    </div>
  </div>
)

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasWallet, setHasWallet] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    try {
      // Check if user is already logged in
      const userLoggedIn = localStorage.getItem("user_logged_in")
      const walletSetup = localStorage.getItem("wallet_setup")
      
      if (userLoggedIn === "true") {
        setIsLoggedIn(true)
        if (walletSetup === "true") {
          setHasWallet(true)
        }
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error)
    }
    
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  const handleWalletSetupComplete = (walletData: any) => {
    setHasWallet(true)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  if (!hasWallet) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <WalletSetup onSetupComplete={handleWalletSetupComplete} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WalletProvider>
        <WalletInterface />
      </WalletProvider>
    </Suspense>
  )
}
