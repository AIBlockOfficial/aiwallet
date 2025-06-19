"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Wallet, LogOut, Copy, Check, RefreshCw, AlertCircle } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const SDKLoadingIndicator = () => {
  const [isSDKLoading, setIsSDKLoading] = useState(false)

  useEffect(() => {
    // Only show loading indicator when SDK is actually being used
    // This prevents showing loading on initial page load when SDK isn't needed yet
    let mounted = true

    const checkSDKStatus = () => {
      // Don't show loading indicator immediately
      // Only show it if we're actually using wallet functions
      if (mounted) {
        setIsSDKLoading(false)
      }
    }

    // Small delay to avoid flash of loading state
    const timer = setTimeout(checkSDKStatus, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  if (!isSDKLoading) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        <span className="text-sm text-primary">Initializing wallet SDK...</span>
      </div>
    </div>
  )
}

export function WalletInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [addressCopied, setAddressCopied] = useState(false)
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { balance, nftCount, address, disconnect, refreshBalance, balanceError } = useWallet()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response with wallet context
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Hello! I'm your AI wallet assistant. I can see your wallet address is ${address?.slice(0, 6)}...${address?.slice(-4)}... and you currently have ${balance} AIBX and ${nftCount} NFTs. How can I help you manage your blockchain assets?`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = () => {
    disconnect()
  }

  const handleCopyAddress = async () => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      setAddressCopied(true)
      setShowCopyFeedback(true)

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setAddressCopied(false)
      }, 2000)

      // Hide feedback after 3 seconds
      setTimeout(() => {
        setShowCopyFeedback(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to copy address:", error)
    }
  }

  const formatAddress = (addr: string | null) => {
    if (!addr) return "Loading..."
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  const hasMessages = messages.length > 0

  const handleRefreshBalance = async () => {
    setIsRefreshingBalance(true)
    try {
      await refreshBalance()
    } catch (error) {
      console.error("Failed to refresh balance:", error)
    } finally {
      setIsRefreshingBalance(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SDKLoadingIndicator />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header with brand, balances, address and logout */}
        <div className="flex justify-between items-center p-6 border-b">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-lg">AIWallet</div>
              <div className="text-xs text-muted-foreground">wallet.aiblock.net</div>
            </div>
          </div>

          {/* Balances, Address and Logout */}
          <div className="flex items-center space-x-6">
            {/* Balances with Refresh Button */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-medium">AIBX</div>
                    <div className={`text-sm font-semibold ${balanceError ? 'text-red-500' : ''}`}>
                      {balance}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-medium">NFTS</div>
                    <div className={`text-sm font-semibold ${balanceError ? 'text-red-500' : ''}`}>
                      {nftCount}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshingBalance}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                    title={balanceError ? `Refresh balance (Error: ${balanceError})` : "Refresh balance"}
                  >
                    <RefreshCw 
                      className={`h-3.5 w-3.5 text-muted-foreground ${
                        isRefreshingBalance ? 'animate-spin' : ''
                      }`} 
                    />
                  </button>
                  {balanceError && (
                    <div title={`Balance error: ${balanceError}`}>
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div className="relative">
              <button
                onClick={handleCopyAddress}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-muted/50 hover:bg-muted transition-colors group"
                title="Click to copy full address"
              >
                <div className="text-center">
                  <div className="text-xs text-muted-foreground font-medium">ADDRESS</div>
                  <div className="text-sm font-mono font-medium">{formatAddress(address)}</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {addressCopied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Copy Feedback Toast */}
              {showCopyFeedback && (
                <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-primary text-primary-foreground text-xs rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center space-x-2">
                    <Check className="h-3 w-3" />
                    <span>Address copied!</span>
                  </div>
                  <div className="absolute top-0 right-4 -translate-y-1 w-2 h-2 bg-primary rotate-45"></div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main content area - focused on chat */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[500px]">
            {/* Empty state - chat-focused design */}
            {!hasMessages && (
              <div className="text-center space-y-8">
                {/* Welcome text - Chat focused */}
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold">How can I help you today?</h1>
                  <p className="text-lg text-muted-foreground">
                    Ask me anything about your wallet, transactions, or blockchain assets
                  </p>
                </div>

                {/* Chat input - More prominent */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="Type your message here..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="w-full h-12 text-base px-4 border-2 focus:border-primary"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>

                {/* Suggestions - Optional quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                  <button
                    onClick={() => setInputValue("Show my balance")}
                    className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm">Check Balance</div>
                    <div className="text-xs text-muted-foreground">View your current AIBX and NFTs</div>
                  </button>
                  <button
                    onClick={() => setInputValue("How do I send AIBX?")}
                    className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Send className="h-5 w-5 mb-2 text-primary" />
                    <div className="font-medium text-sm">Send AIBX</div>
                  </button>
                  <button
                    onClick={() => setInputValue("Show my transaction history")}
                    className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm">Transaction History</div>
                    <div className="text-xs text-muted-foreground">View recent activity</div>
                  </button>
                  <button
                    onClick={() => setInputValue("What is my wallet address?")}
                    className="p-3 text-left rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium text-sm">Wallet Address</div>
                    <div className="text-xs text-muted-foreground">Get your receiving address</div>
                  </button>
                </div>
              </div>
            )}

            {/* Messages view */}
            {hasMessages && (
              <div className="space-y-4">
                {/* Messages */}
                <div className="space-y-4 max-h-[65vh] overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-lg p-4 ${
                          message.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted border rounded-lg p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input area - Enhanced for active chat */}
                <div className="flex space-x-3 pt-4 border-t">
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1 h-11"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="h-11 w-11"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
