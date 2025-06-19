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

// Wallet flow types
type WalletFlow = 'unlock' | 'create' | 'interface' | 'loading'

// Inner component that has access to wallet context
function WalletFlowHandler({ walletFlow, setWalletFlow }: { 
  walletFlow: WalletFlow
  setWalletFlow: (flow: WalletFlow) => void 
}) {
  // Dynamic import to get wallet context
  const [useWallet, setUseWallet] = useState<any>(null)
  
  useEffect(() => {
    const loadWalletContext = async () => {
      const walletModule = await import("@/components/wallet-provider")
      setUseWallet(() => walletModule.useWallet)
    }
    loadWalletContext()
  }, [])

  const walletContext = useWallet?.()

  const handleWalletSetupComplete = (walletData: any) => {
    // Set the wallet data in the provider context
    if (walletContext?.setWalletData) {
      walletContext.setWalletData(walletData)
    }
    setWalletFlow('interface')
  }

  if (walletFlow === 'loading') {
    return <LoadingSpinner />
  }

  if (walletFlow === 'interface') {
    return <WalletInterface />
  }

  // For unlock and create flows - handled by WalletSetup
  return (
    <WalletSetup 
      mode={walletFlow === 'unlock' ? 'unlock' : 'create'}
      onSetupComplete={handleWalletSetupComplete} 
    />
  )
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [walletFlow, setWalletFlow] = useState<WalletFlow>('loading')
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
      
      if (userLoggedIn === "true") {
        setIsLoggedIn(true)
        determineWalletFlow()
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error)
    }
    
    setIsLoading(false)
  }, [])

  const determineWalletFlow = () => {
    try {
      const encryptedWallet = localStorage.getItem("encrypted_wallet_data")
      const walletSetup = localStorage.getItem("wallet_setup")
      
      // SECURITY FIX: No more auto-open flow since we don't store passphrases
      // Always require passphrase entry if wallet exists
      
      // Flow 2: User has encrypted wallet and needs to unlock with passphrase
      if (encryptedWallet && walletSetup === "true") {
        setWalletFlow('unlock')
        return
      }

      // Flow 3 & 4: No existing wallet data - user needs to recover or create
      setWalletFlow('create')
    } catch (error) {
      console.error("Failed to determine wallet flow:", error)
      setWalletFlow('create')
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    determineWalletFlow()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  // Handle wallet flows
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WalletProvider>
        <WalletFlowHandler walletFlow={walletFlow} setWalletFlow={setWalletFlow} />
      </WalletProvider>
    </Suspense>
  )
}
