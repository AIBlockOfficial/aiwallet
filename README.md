# AIWallet

A secure blockchain wallet application built with Next.js 14 and integrated with the AIBlock 2Way.js SDK.

## Features

- 🔐 **Secure Wallet Management**: Create, unlock, and recover wallets with bank-grade AES-GCM encryption
- 🔑 **Multiple Access Methods**: 
  - Create new wallet with mnemonic generation
  - Unlock existing wallet with passphrase
  - Recover wallet from 12-word recovery phrase
- 💰 **AIBX Token Support**: Real balance fetching and token management
- 🌐 **2Way.js SDK Integration**: Direct integration with AIBlock blockchain network
- 🔒 **Google OAuth**: Secure authentication system
- 📱 **Responsive Design**: Modern UI with Tailwind CSS
- 🤖 **AI Assistant**: Built-in wallet assistant for user guidance

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: AIBlock 2Way.js SDK
- **Authentication**: Google OAuth
- **Encryption**: Web Crypto API (AES-GCM + PBKDF2)
- **Deployment**: Vercel with GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:AIBlockOfficial/aiwallet.git
   cd aiwallet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   NEXT_PUBLIC_MEMPOOL_HOST=https://mempool.aiblock.dev
   NEXT_PUBLIC_STORAGE_HOST=https://storage.aiblock.dev
   NEXT_PUBLIC_VALENCE_HOST=https://valence.aiblock.dev
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Automatic Deployment with GitHub Actions

This project is configured for automatic deployment to Vercel using GitHub Actions.

#### Setup Steps:

1. **Create a Vercel Project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Note down your Project ID and Org ID

2. **Get Vercel Token**
   - Go to Vercel Settings → Tokens
   - Create a new token with appropriate permissions

3. **Configure GitHub Secrets**
   In your GitHub repository settings → Secrets and variables → Actions, add:
   
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_project_id
   NEXT_PUBLIC_MEMPOOL_HOST=https://mempool.aiblock.dev
   NEXT_PUBLIC_STORAGE_HOST=https://storage.aiblock.dev
   NEXT_PUBLIC_VALENCE_HOST=https://valence.aiblock.dev
   ```

4. **Configure Vercel Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables, add:
   ```
   @mempool_host → https://mempool.aiblock.dev
   @storage_host → https://storage.aiblock.dev  
   @valence_host → https://valence.aiblock.dev
   ```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

## Project Structure

```
aiwallet/
├── app/                    # Next.js 14 app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page with authentication flow
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── login-page.tsx    # Google OAuth login
│   ├── wallet-setup.tsx  # Wallet creation/recovery
│   ├── wallet-interface.tsx # Main wallet UI
│   └── wallet-provider.tsx  # Wallet state management
├── lib/                  # Utility libraries
│   ├── wallet.ts        # Core wallet service
│   ├── keypairs.ts      # Keypair utilities
│   └── utils.ts         # General utilities
├── .github/workflows/   # GitHub Actions
└── vercel.json         # Vercel configuration
```

## Security Features

- **AES-GCM Encryption**: Industry-standard encryption for wallet data
- **PBKDF2 Key Derivation**: 100,000 iterations for password-based encryption
- **Mnemonic Validation**: BIP39-compliant seed phrase generation and validation
- **Secure Headers**: XSS protection, content type sniffing prevention
- **No Private Key Exposure**: Private keys never leave the encrypted storage

## API Integration

The wallet integrates with AIBlock's infrastructure:

- **Mempool**: Transaction broadcasting and monitoring
- **Storage**: Blockchain data storage and retrieval  
- **Valence**: Network validation and consensus

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- GitHub Issues: [Create an issue](https://github.com/AIBlockOfficial/aiwallet/issues)
- Documentation: [AIBlock 2Way.js SDK](https://github.com/AIBlockOfficial/2Way.js)

---

Built with ❤️ by the AIBlock team
