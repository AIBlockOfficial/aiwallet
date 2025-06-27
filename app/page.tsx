"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginPage } from "@/components/login-page"
import { WalletProvider, useWallet } from "@/components/wallet-provider"

// Lazy load heavy wallet components
const WalletSetup = lazy(() => import("@/components/wallet-setup").then(module => ({ default: module.WalletSetup })))
const WalletInterface = lazy(() => import("@/components/wallet-interface").then(module => ({ default: module.WalletInterface })))

// Loading component with PeerStone branding
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <img 
        src="/logo_spinner.svg" 
        alt="Loading" 
        className="h-8 w-8 animate-spin"
      />
      <p className="text-sm text-muted-foreground">Loading PeerStone...</p>
    </div>
  </div>
)

// Wallet flow types
type WalletFlow = 'create' | 'unlock' | 'recover' | 'interface'

// Inner component that has access to wallet context
function WalletFlowHandler({ walletFlow, setWalletFlow }: { 
  walletFlow: WalletFlow, 
  setWalletFlow: (flow: WalletFlow) => void 
}) {
  const { setWalletData } = useWallet()

  const handleWalletSetupComplete = (walletData: any) => {
    if (walletData) {
      setWalletData(walletData) // Use the function from context
    }
    setWalletFlow('interface')
  }

  // Show wallet interface if user already has a wallet setup
  if (walletFlow === 'interface') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <WalletInterface />
      </Suspense>
    )
  }

  // Show wallet setup for create/unlock/recover flows
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WalletSetup 
        mode={walletFlow as 'create' | 'unlock' | 'recover'}
        onSetupComplete={handleWalletSetupComplete}
      />
    </Suspense>
  )
}

export default function Home() {
  const { user, isLoading: authLoading, isConfigured } = useAuth()
  const [walletFlow, setWalletFlow] = useState<WalletFlow>('create')

  // Determine wallet flow based on existing wallet data
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

  useEffect(() => {
    // Only determine wallet flow after user is authenticated
    if (user && !authLoading && isConfigured) {
      determineWalletFlow()
    }
  }, [user, authLoading, isConfigured])

  // Configuration warning component
  const ConfigurationWarning = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Peerstone.svg" 
              alt="PeerStone" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PeerStone Setup Required</h1>
          <p className="text-gray-600 mt-2">Supabase authentication is not configured</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">1. Create a Supabase Project</h3>
              <p className="text-gray-600">Visit <a href="https://supabase.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">supabase.com</a> and create a new project</p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Get Your Credentials</h3>
              <p className="text-gray-600">Copy your Project URL and API Key from Settings → API</p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Create Environment File</h3>
              <p className="text-gray-600">Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file with:</p>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium">4. Restart Development Server</h3>
              <p className="text-gray-600">Run <code className="bg-gray-100 px-1 rounded">npm run dev</code> again</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              📖 For detailed setup instructions, see <code className="bg-blue-100 px-1 rounded">SUPABASE_SETUP.md</code> in your project root.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Show configuration warning if Supabase is not configured
  if (!isConfigured) {
    return <ConfigurationWarning />
  }

  // Show loading spinner while checking authentication
  if (authLoading) {
    return <LoadingSpinner />
  }

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          // After login, determine what wallet flow to show
          determineWalletFlow()
        }} 
      />
    )
  }

  // User is authenticated, show wallet flows
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WalletProvider>
        <WalletFlowHandler walletFlow={walletFlow} setWalletFlow={setWalletFlow} />
      </WalletProvider>
    </Suspense>
  )
}
