// Keypair management utilities for 2Way.js SDK

export interface IKeypairEncrypted {
  address: string
  privateKey: string
  publicKey?: string
}

export interface IAssetToken {
  Token: number
}

export interface IAssetItem {
  Item: {
    amount: number
    genesis_hash: string
  }
}

// Initialize token asset as per 2Way.js documentation
export const initIAssetToken = (tokenData: { Token: number }): IAssetToken => {
  return tokenData
}

// Initialize item asset as per 2Way.js documentation  
export const initIAssetItem = (itemData: { Item: { amount: number; genesis_hash: string } }): IAssetItem => {
  return itemData
}

// Generate keypair from wallet data
export const generateKeypairFromWallet = (walletData: { address: string; privateKey: string; publicKey?: string }): IKeypairEncrypted => {
  return {
    address: walletData.address,
    privateKey: walletData.privateKey,
    publicKey: walletData.publicKey || "",
  }
}

// Helper to create test keypairs for development
export const createTestKeypairs = (count: number = 1): IKeypairEncrypted[] => {
  const keypairs: IKeypairEncrypted[] = []
  
  for (let i = 0; i < count; i++) {
    // Generate test keypair (in production, these would come from real wallet creation)
    const testAddress = `0x${'0'.repeat(40 - i.toString().length)}${i}`
    const testPrivateKey = `0x${'0'.repeat(64 - i.toString().length)}${i}`
    
    keypairs.push({
      address: testAddress,
      privateKey: testPrivateKey,
    })
  }
  
  return keypairs
}

// Default genesis hash for testing (as mentioned in 2Way.js docs)
export const DEFAULT_GENESIS_HASH = "default_genesis_hash"

// Helper to validate keypair structure
export const validateKeypair = (keypair: IKeypairEncrypted): boolean => {
  return (
    typeof keypair.address === 'string' &&
    typeof keypair.privateKey === 'string' &&
    keypair.address.length > 0 &&
    keypair.privateKey.length > 0
  )
}

// Helper to get all keypairs from wallet storage
export const getStoredKeypairs = (): IKeypairEncrypted[] => {
  try {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      return []
    }

    const walletAddress = localStorage.getItem("wallet_address")
    const walletData = localStorage.getItem("wallet_encrypted")
    
    if (walletAddress && walletData) {
      // In a real implementation, you'd decrypt the wallet data here
      // For now, return a test keypair
      return [{
        address: walletAddress,
        privateKey: "test_private_key", // This would be decrypted in real implementation
      }]
    }
    
    return []
  } catch (error) {
    console.error("Failed to get stored keypairs:", error)
    return []
  }
} 