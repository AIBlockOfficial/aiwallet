# Supabase Authentication Setup for PeerStone Wallet

This guide will help you set up Supabase authentication for the PeerStone wallet application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create an account
2. Click "New Project" 
3. Choose your organization
4. Enter project details:
   - **Name**: `peerstone-wallet` (or your preferred name)
   - **Database Password**: Generate a secure password
   - **Region**: Choose the closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Once your project is created, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (something like `https://abc123.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGci...`)

## 3. Configure Environment Variables

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Configure Authentication Providers

### Email Authentication (Already Enabled)
Email/password authentication is enabled by default.

### Google OAuth (Optional)
To enable Google OAuth:

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Find **Google** and click the toggle to enable it
3. You'll need to:
   - Create a Google OAuth app in [Google Cloud Console](https://console.cloud.google.com/)
   - Add your Client ID and Client Secret to Supabase
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

## 5. Configure Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Try creating a new account with email/password
4. Check your email for the confirmation link
5. Try signing in with your confirmed account

## Authentication Flow

The implemented authentication flow includes:

1. **Sign Up**: Users create accounts with email/password
2. **Email Confirmation**: Users must verify their email address
3. **Sign In**: Users sign in with confirmed credentials
4. **Google OAuth**: Optional Google sign-in (if configured)
5. **Session Management**: Automatic session refresh and persistence
6. **Sign Out**: Secure sign out that clears all local data

## Security Features

- ✅ **Secure Session Management**: Uses HTTP-only cookies
- ✅ **Email Verification**: Prevents unverified accounts
- ✅ **Password Requirements**: Minimum 6 characters
- ✅ **OAuth Integration**: Secure third-party authentication
- ✅ **Auto-refresh**: Automatic token refresh
- ✅ **Clean Logout**: Clears all local wallet data on sign out

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables are correct
2. **"Site URL not allowed"**: Add your domain to the allowed redirect URLs
3. **Email not sending**: Check your email settings in Authentication > Settings
4. **OAuth errors**: Verify your OAuth provider configuration

### Need Help?

- Check the [Supabase Documentation](https://supabase.com/docs/guides/auth)
- Review your Supabase project logs for detailed error messages
- Ensure your `.env.local` file is not committed to git (it's in `.gitignore`)

---

**Next Steps**: After setting up authentication, users will be able to create and manage their blockchain wallets securely within the PeerStone application. 