"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
// Remove static import to prevent SDK loading on page load
// import { walletService } from "@/lib/wallet"

interface WalletData {
  address: string
  privateKey: string
  mnemonic: string[]
  passphrase: string
}

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
  setWalletData: (data: WalletData) => void
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

  // Track window visibility for auto-refresh
  const [isWindowVisible, setIsWindowVisible] = useState(true)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsWindowVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

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
      
      // SECURITY FIX: Use in-memory wallet data for balance fetching
      if (walletData) {
        const balanceData = await walletService.getBalanceWithWalletData(targetAddress, walletData)
        console.log("Balance data received:", balanceData)
        
        setBalance(balanceData.tokens)
        setNftCount(balanceData.nfts)
        setBalanceError(null) // Clear error on success
        setHasInitialLoad(true) // Mark that we've completed initial load
      } else {
        // No wallet data in memory - balance cannot be fetched securely
        throw new Error("Wallet not unlocked - please enter your passphrase")
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setBalanceError(errorMessage)
      // Don't update balance/nftCount on error - keep previous values or show error state
    }
  }, [address, isClient, walletData])

  // Only fetch balance when walletData is set (unlocked)
  useEffect(() => {
    if (walletData && address && isClient) {
      refreshBalance(address)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletData, address, isClient])

  // Auto-refresh balance every 30 seconds when connected, wallet is unlocked, and window is visible
  useEffect(() => {
    if (!isConnected || !address || !walletData || balanceError || !isWindowVisible) return
    const interval = setInterval(() => {
      refreshBalance(address)
    }, 30000)
    return () => clearInterval(interval)
  }, [isConnected, address, walletData, balanceError, isWindowVisible, refreshBalance])

  useEffect(() => {
    if (!isClient) return

    const initializeWallet = async () => {
      try {
        // Check for existing wallet setup
        const walletAddress = localStorage.getItem("wallet_address")
        const walletSetup = localStorage.getItem("wallet_setup")

        if (walletAddress && walletSetup === "true") {
          setAddress(walletAddress)
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Failed to initialize wallet:", error)
      }
    }

    initializeWallet()
  }, [isClient])

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

  const disconnect = async () => {
    if (!isClient) return

    setAddress(null)
    setIsConnected(false)
    setWalletData(null) // SECURITY FIX: Clear wallet data from memory
    setBalanceError(null)
    
    try {
      // SECURITY FIX: Use consistent storage keys and remove passphrase
      localStorage.removeItem("wallet_address")
      localStorage.removeItem("wallet_setup")
      localStorage.removeItem("encrypted_wallet_data") // Fixed: was "wallet_encrypted"
      // SECURITY FIX: No longer storing passphrase
      // localStorage.removeItem("wallet_passphrase")
      
      // Clear Supabase session data
      const { supabase } = await import("@/lib/supabase")
      if (supabase) {
        await supabase.auth.signOut()
      }
      
    } catch (error) {
      console.error("Failed to clear data or sign out:", error)
    }
    
    setBalance("0")
    setNftCount(0)
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

  const updateWalletData = (data: WalletData) => {
    setWalletData(data)
    // No need to call refreshBalance here; handled by useEffect above
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
        setWalletData: updateWalletData,
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
