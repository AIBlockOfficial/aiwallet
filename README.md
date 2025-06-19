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

### Recommended: Vercel GitHub Integration

The easiest way to deploy this project is using Vercel's GitHub integration:

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

2. **Environment Variables**
   The environment variables are already configured in `vercel.json`:
   ```json
   {
     "NEXT_PUBLIC_MEMPOOL_HOST": "https://mempool.aiblock.dev",
     "NEXT_PUBLIC_STORAGE_HOST": "https://storage.aiblock.dev", 
     "NEXT_PUBLIC_VALENCE_HOST": "https://valence.aiblock.dev"
   }
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

### Alternative: GitHub Actions (Advanced)

If you prefer GitHub Actions deployment, configure these secrets in your repository:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

Get these values from:
- **Token**: Vercel Dashboard → Settings → Tokens
- **Org ID**: Vercel Dashboard → Settings → General
- **Project ID**: Project Settings → General

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel  
vercel --prod
```

### Build Verification

The GitHub Actions workflow automatically:
- ✅ Runs ESLint checks
- ✅ Performs TypeScript compilation
- ✅ Builds the production bundle
- ✅ Verifies all environment variables

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
