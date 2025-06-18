"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Copy, Check, Loader2, AlertCircle, Wallet, KeyRound, RefreshCw } from "lucide-react"
import { walletService, generateMnemonic, encryptWalletData, validateMnemonic, decryptWalletData } from "@/lib/wallet"

interface WalletSetupProps {
  onSetupComplete: (walletData: WalletData) => void
}

interface WalletData {
  address: string
  privateKey: string
  mnemonic: string[]
  passphrase: string
}

export function WalletSetup({ onSetupComplete }: WalletSetupProps) {
  // Check if there's existing encrypted wallet data
  const hasExistingWallet = typeof window !== 'undefined' && localStorage.getItem("wallet_encrypted")
  
  const [mode, setMode] = useState<"create" | "unlock" | "recover">(hasExistingWallet ? "unlock" : "create")
  const [step, setStep] = useState(1)
  const [passphrase, setPassphrase] = useState("")
  const [confirmPassphrase, setConfirmPassphrase] = useState("")
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [mnemonic, setMnemonic] = useState<string[]>([])
  const [recoveryMnemonic, setRecoveryMnemonic] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [error, setError] = useState<string>("")

  // Get user info from login
  const userEmail = localStorage.getItem("user_email") || "user@example.com"
  const loginMethod = localStorage.getItem("login_method") || "email"

  const handleCreateWallet = async () => {
    setError("")

    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match")
      return
    }
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters")
      return
    }

    setIsCreating(true)
    try {
      const generatedMnemonic = await generateMnemonic()

      // Validate the generated mnemonic
      const isValid = await validateMnemonic(generatedMnemonic)
      if (!isValid) {
        throw new Error("Generated mnemonic is invalid")
      }

      setMnemonic(generatedMnemonic)
      setStep(2)
    } catch (error) {
      console.error("Failed to generate mnemonic:", error)
      setError("Failed to generate wallet. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleUnlockWallet = async () => {
    setError("")
    setIsCreating(true)
    try {
      const encryptedData = localStorage.getItem("wallet_encrypted")
      if (!encryptedData) {
        throw new Error("No wallet data found")
      }

      const walletData = await decryptWalletData(encryptedData, passphrase)
      localStorage.setItem("wallet_address", walletData.address)
      localStorage.setItem("wallet_setup", "true")
      localStorage.setItem("wallet_passphrase", passphrase)

      onSetupComplete(walletData)
    } catch (error) {
      console.error("Failed to unlock wallet:", error)
      setError("Invalid passphrase or corrupted wallet data")
    } finally {
      setIsCreating(false)
    }
  }

  const handleRecoverWallet = async () => {
    setError("")
    setIsCreating(true)
    try {
      // Parse and validate the recovery mnemonic
      const mnemonicWords = recoveryMnemonic.trim().split(/\s+/)
      if (mnemonicWords.length !== 12) {
        throw new Error("Recovery phrase must be exactly 12 words")
      }

      const isValid = await validateMnemonic(mnemonicWords)
      if (!isValid) {
        throw new Error("Invalid recovery phrase")
      }

      if (passphrase.length < 8) {
        throw new Error("New passphrase must be at least 8 characters")
      }

      // Create wallet from recovery mnemonic
      const wallet = await walletService.importWallet(mnemonicWords, passphrase)
      
      // Encrypt and save the recovered wallet
      const encryptedData = await encryptWalletData(wallet, passphrase)
      localStorage.setItem("wallet_encrypted", encryptedData)
      localStorage.setItem("wallet_address", wallet.address)
      localStorage.setItem("wallet_setup", "true")
      localStorage.setItem("wallet_passphrase", passphrase)

      onSetupComplete(wallet)
    } catch (error) {
      console.error("Failed to recover wallet:", error)
      setError(error instanceof Error ? error.message : "Failed to recover wallet")
    } finally {
      setIsCreating(false)
    }
  }

  const copyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic.join(" "))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmMnemonic = async () => {
    setError("")
    setIsCreating(true)
    try {
      // Validate mnemonic before creating wallet
      const isValid = await validateMnemonic(mnemonic)
      if (!isValid) {
        throw new Error("Invalid mnemonic phrase")
      }

      const wallet = await walletService.createWallet(mnemonic, passphrase)
      setWalletData(wallet)
      setStep(3)
    } catch (error) {
      console.error("Failed to create wallet:", error)
      setError("Failed to create wallet. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleFinishSetup = async () => {
    setError("")
    if (!walletData) return
    
    try {
      const encryptedData = await encryptWalletData(walletData, passphrase)
      localStorage.setItem("wallet_encrypted", encryptedData)
      localStorage.setItem("wallet_address", walletData.address)
      localStorage.setItem("wallet_setup", "true")
      // Store the passphrase for later use in balance fetching and other operations
      // Note: In production, this should be more securely handled
      localStorage.setItem("wallet_passphrase", passphrase)

      onSetupComplete(walletData)
    } catch (error) {
      console.error("Failed to save wallet:", error)
      setError("Failed to save wallet. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-[400px] gap-6">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>

        {/* Header */}
        <div className="grid gap-2 text-center">
          <h1 className="text-3xl font-bold">
            {mode === "create" && step === 1 && "Create AIWallet"}
            {mode === "create" && step === 2 && "Backup Phrase"}
            {mode === "create" && step === 3 && "Setup Complete"}
            {mode === "unlock" && "Unlock Wallet"}
            {mode === "recover" && "Recover Wallet"}
          </h1>
          <p className="text-balance text-muted-foreground">
            {mode === "create" && step === 1 &&
              `Welcome ${loginMethod === "google" ? userEmail : "back"}! Let's create your secure blockchain wallet.`}
            {mode === "create" && step === 2 && "Write down these 12 words in order. Keep them safe and secret."}
            {mode === "create" && step === 3 && "Your AIWallet is now ready to use."}
            {mode === "unlock" && "Enter your passphrase to unlock your existing wallet."}
            {mode === "recover" && "Enter your 12-word recovery phrase and create a new passphrase."}
          </p>
        </div>

        {/* Mode Selection - Show only if not in wallet creation flow */}
        {step === 1 && (
          <div className="grid gap-3">
            {hasExistingWallet && (
              <Button
                variant={mode === "unlock" ? "default" : "outline"}
                onClick={() => setMode("unlock")}
                className="w-full h-12"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Unlock Existing Wallet
              </Button>
            )}
            
            <Button
              variant={mode === "create" ? "default" : "outline"}
              onClick={() => setMode("create")}
              className="w-full h-12"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Create New Wallet
            </Button>
            
            <Button
              variant={mode === "recover" ? "default" : "outline"}
              onClick={() => setMode("recover")}
              className="w-full h-12"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recover from Phrase
            </Button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Create Wallet Passphrase Creation */}
        {mode === "create" && step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="passphrase">Wallet Passphrase</Label>
              <div className="relative">
                <Input
                  id="passphrase"
                  type={showPassphrase ? "text" : "password"}
                  placeholder="Create a secure passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  disabled={isCreating}
                >
                  {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
              <Input
                id="confirm-passphrase"
                type={showPassphrase ? "text" : "password"}
                placeholder="Confirm your passphrase"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Security Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Use letters, numbers, and symbols</li>
                <li>• Never share with anyone</li>
                <li>• Store securely - we cannot recover it</li>
              </ul>
            </div>

            <Button
              onClick={handleCreateWallet}
              className="w-full"
              disabled={!passphrase || !confirmPassphrase || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Wallet...
                </>
              ) : (
                "Create Wallet"
              )}
            </Button>
          </div>
        )}

        {/* Unlock Wallet Form */}
        {mode === "unlock" && step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="unlock-passphrase">Wallet Passphrase</Label>
              <div className="relative">
                <Input
                  id="unlock-passphrase"
                  type={showPassphrase ? "text" : "password"}
                  placeholder="Enter your wallet passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  disabled={isCreating}
                >
                  {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Unlock Your Wallet</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enter the passphrase you created</li>
                <li>• This will decrypt your wallet data</li>
                <li>• Make sure you're on a secure device</li>
              </ul>
            </div>

            <Button
              onClick={handleUnlockWallet}
              className="w-full"
              disabled={!passphrase || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                "Unlock Wallet"
              )}
            </Button>
          </div>
        )}

        {/* Recover Wallet Form */}
        {mode === "recover" && step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="recovery-phrase">12-Word Recovery Phrase</Label>
              <textarea
                id="recovery-phrase"
                placeholder="Enter your 12-word recovery phrase separated by spaces"
                value={recoveryMnemonic}
                onChange={(e) => setRecoveryMnemonic(e.target.value)}
                disabled={isCreating}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-passphrase">New Wallet Passphrase</Label>
              <div className="relative">
                <Input
                  id="new-passphrase"
                  type={showPassphrase ? "text" : "password"}
                  placeholder="Create a new secure passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  disabled={isCreating}
                >
                  {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Wallet Recovery</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enter your exact 12-word recovery phrase</li>
                <li>• Words must be in the correct order</li>
                <li>• Create a new secure passphrase</li>
                <li>• This will restore your wallet completely</li>
              </ul>
            </div>

            <Button
              onClick={handleRecoverWallet}
              className="w-full"
              disabled={!recoveryMnemonic.trim() || !passphrase || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recovering Wallet...
                </>
              ) : (
                "Recover Wallet"
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Mnemonic Display */}
        {mode === "create" && step === 2 && (
          <div className="grid gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-4">Recovery Phrase</h3>
              <div className="grid grid-cols-3 gap-2">
                {mnemonic.map((word, index) => (
                  <div key={index} className="rounded border bg-muted p-2 text-center">
                    <div className="text-xs text-muted-foreground">{index + 1}</div>
                    <div className="font-mono text-sm">{word}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Critical Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Write these words in exact order</li>
                <li>• Store in a safe, offline location</li>
                <li>• Never share your recovery phrase</li>
                <li>• This is the only way to recover your wallet</li>
              </ul>
            </div>

            <div className="grid gap-2">
              <Button onClick={copyMnemonic} variant="outline" className="w-full" disabled={isCreating}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>

              <Button onClick={handleConfirmMnemonic} className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Wallet...
                  </>
                ) : (
                  "I&apos;ve Saved My Phrase"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Completion */}
        {mode === "create" && step === 3 && walletData && (
          <div className="grid gap-4">
            <div className="rounded-lg border p-4 text-center">
              <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <Check className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-medium mb-2">AIWallet Created Successfully</h3>
              <p className="text-sm text-muted-foreground mb-4">Your blockchain wallet is ready to use.</p>
              <div className="rounded border bg-muted p-3">
                <div className="text-xs text-muted-foreground mb-1">Wallet Address</div>
                <div className="font-mono text-xs break-all">{walletData.address}</div>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Important Reminders</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your passphrase unlocks your wallet</li>
                <li>• Your recovery phrase restores your wallet</li>
                <li>• Both are required to access your assets</li>
                <li>• We cannot recover them if lost</li>
              </ul>
            </div>

            <Button onClick={handleFinishSetup} className="w-full">
              Continue to AIWallet
            </Button>
          </div>
        )}

        {/* Brand Footer */}
        <div className="text-center text-xs text-muted-foreground">© 2025 AIWallet. Powered by wallet.aiblock.net</div>
      </div>
    </div>
  )
}
