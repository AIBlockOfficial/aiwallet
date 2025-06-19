"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
// Remove static import to prevent SDK loading on page load
// import { walletService } from "@/lib/wallet"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  nftCount: number | string
  walletData: WalletData | null
  balanceError: string | null
  connect: () => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

interface WalletData {
  address: string
  privateKey: string
  mnemonic: string[]
  passphrase: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("")
  const [nftCount, setNftCount] = useState(0)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  useEffect(() => {
    // Mark as client-side
    setIsClient(true)
  }, [])

  const formatBalance = (tokens: string): string => {
    // Handle loading state
    if (tokens === "Loading...") return tokens
    
    // Parse and format the balance
    const numTokens = parseFloat(tokens)
    if (isNaN(numTokens)) return "0.00"
    
    // Format with commas and appropriate decimal places for AIBX
    return numTokens.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8 // Show more decimals for AIBX since it can have fractional amounts
    })
  }

  const refreshBalance = useCallback(async (walletAddress?: string) => {
    const targetAddress = walletAddress || address
    if (!targetAddress || !isClient) return

    setBalanceError(null) // Clear previous errors
    console.log("Fetching balance for address:", targetAddress)

    try {
      // Dynamic import to avoid loading SDK until needed
      const { walletService } = await import("@/lib/wallet")
      const balanceData = await walletService.getBalance(targetAddress)
      console.log("Balance data received:", balanceData)
      
      setBalance(balanceData.tokens)
      setNftCount(balanceData.nfts)
      setBalanceError(null) // Clear error on success
      setHasInitialLoad(true) // Mark that we've completed initial load
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setBalanceError(errorMessage)
      // Don't update balance/nftCount on error - keep previous values or show error state
    }
  }, [address, isClient])

  useEffect(() => {
    // Only access localStorage on client side
    if (!isClient) return

    try {
      const savedAddress = localStorage.getItem("wallet_address")
      const walletSetup = localStorage.getItem("wallet_setup")

      if (savedAddress && walletSetup) {
        setAddress(savedAddress)
        setIsConnected(true)
        // Refresh balance immediately when wallet is loaded
        refreshBalance(savedAddress)
      }
    } catch (error) {
      console.error("Failed to load wallet from storage:", error)
    }
  }, [isClient, refreshBalance])

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!isConnected || !address || balanceError) return // Don't auto-refresh if there's an error

    const interval = setInterval(() => {
      refreshBalance()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isConnected, address, balanceError, refreshBalance])

  const connect = async () => {
    if (!isClient) return

    try {
      const savedAddress = localStorage.getItem("wallet_address")
      if (savedAddress) {
        setAddress(savedAddress)
        setIsConnected(true)
        // Refresh balance immediately on connect
        await refreshBalance(savedAddress)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const disconnect = () => {
    if (!isClient) return

    setAddress(null)
    setIsConnected(false)
    setWalletData(null)
    setBalanceError(null)
    
    try {
      localStorage.removeItem("wallet_address")
      localStorage.removeItem("wallet_setup")
      localStorage.removeItem("wallet_encrypted")
      localStorage.removeItem("wallet_passphrase")
      localStorage.removeItem("user_logged_in")
      localStorage.removeItem("login_method")
      localStorage.removeItem("user_email")
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
    
    setBalance("0.00")
    setNftCount(0)

    // Reload the page to return to login
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const getDisplayBalance = () => {
    if (balanceError) return "Error"
    // Show "Loading..." only if we have no balance data at all (initial state)
    if (!hasInitialLoad && balance === "") return "Loading..."
    // Otherwise always show the current balance, even during refresh
    return formatBalance(balance || "0.00")
  }

  const getDisplayNftCount = (): number | string => {
    if (balanceError) return "Error"
    return nftCount
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance: getDisplayBalance(),
        nftCount: getDisplayNftCount(),
        walletData,
        balanceError,
        connect,
        disconnect,
        refreshBalance: () => refreshBalance(),
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
