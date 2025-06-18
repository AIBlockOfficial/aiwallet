"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/login-page"
import { WalletSetup } from "@/components/wallet-setup"
import { WalletInterface } from "@/components/wallet-interface"
import { WalletProvider } from "@/components/wallet-provider"

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  if (!hasWallet) {
    return <WalletSetup onSetupComplete={handleWalletSetupComplete} />
  }

  return (
    <WalletProvider>
      <WalletInterface />
    </WalletProvider>
  )
}
