export class Wallet {
  private address = ""
  private privateKey = ""

  constructor() {
    // Empty constructor
  }

  async fromMnemonic(mnemonic: string, passphrase: string): Promise<void> {
    console.log("Creating wallet from mnemonic:", { mnemonic: mnemonic.substring(0, 20) + "...", passphrase: "***" })

    // Generate mock address and private key based on mnemonic
    const seed = mnemonic + passphrase
    this.address = "0x" + this.generateHash(seed + "address").substring(0, 40)
    this.privateKey = "0x" + this.generateHash(seed + "privatekey").substring(0, 64)
  }

  async fromPrivateKey(privateKey: string): Promise<void> {
    console.log("Creating wallet from private key")
    this.privateKey = privateKey
    this.address = "0x" + this.generateHash(privateKey + "address").substring(0, 40)
  }

  async generateMnemonic(): Promise<string> {
    console.log("Generating mnemonic")
    return "abandon ability able about above absent absorb abstract absurd abuse access accident"
  }

  async validateMnemonic(mnemonic: string): Promise<boolean> {
    console.log("Validating mnemonic:", mnemonic.substring(0, 20) + "...")
    return mnemonic.split(" ").length === 12
  }

  getAddress(): string {
    return this.address
  }

  getPrivateKey(): string {
    return this.privateKey
  }

  async getBalance(address?: string): Promise<number> {
    console.log("Getting balance for address:", address || this.address)
    return 1234.56
  }

  async sendTransaction(params: { to: string; amount: number }): Promise<string> {
    console.log("Sending transaction:", params)
    return "0x" + this.generateHash(JSON.stringify(params) + Date.now()).substring(0, 64)
  }

  async getTransactionHistory(address?: string): Promise<any[]> {
    console.log("Getting transaction history for:", address || this.address)
    return []
  }

  private generateHash(input: string): string {
    // Simple hash function for mock purposes
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(64, "0")
  }
}

// Ensure named export is available
export { Wallet as default }
