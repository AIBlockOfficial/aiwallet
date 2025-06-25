#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Checks if all required environment variables are set for PeerStone wallet
 */

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_MEMPOOL_HOST',
  'NEXT_PUBLIC_STORAGE_HOST', 
  'NEXT_PUBLIC_VALENCE_HOST'
]

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY' // For future server-side operations
]

console.log('🔍 Checking PeerStone environment variables...\n')

let hasErrors = false
let hasWarnings = false

// Check required variables
console.log('📋 Required Variables:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: Missing`)
    hasErrors = true
  } else if (value.includes('your_') || value.includes('abc123')) {
    console.log(`⚠️  ${varName}: Contains placeholder value`)
    hasWarnings = true
  } else {
    console.log(`✅ ${varName}: Set`)
  }
})

// Check optional variables
console.log('\n📋 Optional Variables:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`ℹ️  ${varName}: Not set (optional)`)
  } else {
    console.log(`✅ ${varName}: Set`)
  }
})

// Validate Supabase URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (supabaseUrl && !supabaseUrl.match(/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/)) {
  console.log(`⚠️  NEXT_PUBLIC_SUPABASE_URL: Invalid format (should be https://xxx.supabase.co)`)
  hasWarnings = true
}

// Validate Supabase anon key format
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
  console.log(`⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY: Invalid format (should start with 'eyJ')`)
  hasWarnings = true
}

// Summary
console.log('\n📊 Summary:')
if (hasErrors) {
  console.log('❌ Missing required environment variables')
  console.log('💡 See SUPABASE_SETUP.md and DEPLOYMENT.md for setup instructions')
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️  Some variables may need attention')
  console.log('💡 Check placeholder values and formats')
} else {
  console.log('✅ All environment variables are properly configured!')
}

console.log('\n📚 Resources:')
console.log('   • SUPABASE_SETUP.md - Authentication setup')
console.log('   • DEPLOYMENT.md - Deployment configuration')
console.log('   • .env.local.example - Local development template') 