import 'dotenv/config'
import { wrapFetchWithPayment, decodeXPaymentResponse } from 'x402-fetch'
import { CdpClient } from '@coinbase/cdp-sdk'
import { toAccount, privateKeyToAccount } from 'viem/accounts'

/**
 * Example x402 client that purchases from a paywall-protected endpoint
 * 
 * This client demonstrates how to:
 * 1. Set up a wallet (CDP Server Wallet or standalone viem wallet)
 * 2. Automatically handle 402 Payment Required responses
 * 3. Complete payments and access protected resources
 */

// Configuration: Choose wallet type
// Set USE_CDP_WALLET=true to use CDP Server Wallet (recommended)
// Set USE_CDP_WALLET=false to use a standalone viem wallet with private key
const USE_CDP_WALLET = process.env.USE_CDP_WALLET !== 'false'

/**
 * Create a wallet account using CDP Server Wallet (recommended)
 * Requires: CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET in .env
 * The CDP Client automatically reads from environment variables
 */
async function createCdpAccount() {
    if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET || !process.env.CDP_WALLET_SECRET) {
        throw new Error(
            'CDP Server Wallet requires CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET environment variables.\n' +
            'Get these from https://cdp.coinbase.com/ or set USE_CDP_WALLET=false to use a private key wallet.'
        )
    }

    // CDP Client reads from environment variables automatically
    const cdp = new CdpClient()
    const cdpAccount = await cdp.evm.createAccount()
    const account = toAccount(cdpAccount)

    console.log('✅ CDP Server Wallet initialized')
    console.log(`   Address: ${account.address}`)
    
    return account
}

/**
 * Create a wallet account using a private key (viem)
 * Requires: PRIVATE_KEY in .env
 */
function createPrivateKeyAccount() {
    if (!process.env.PRIVATE_KEY) {
        throw new Error(
            'Private key wallet requires PRIVATE_KEY environment variable.\n' +
            'Set USE_CDP_WALLET=true to use CDP Server Wallet instead.'
        )
    }

    // Remove '0x' prefix if present
    const privateKey = process.env.PRIVATE_KEY.startsWith('0x') 
        ? process.env.PRIVATE_KEY 
        : `0x${process.env.PRIVATE_KEY}`

    const account = privateKeyToAccount(privateKey as `0x${string}`)

    console.log('✅ Private key wallet initialized')
    console.log(`   Address: ${account.address}`)
    console.log('   ⚠️  Make sure this wallet has USDC on the network you\'re using!')

    return account
}

/**
 * Main function to make a paid request
 */
try {
    console.log('🚀 Starting x402 payment client...\n')

    // Create wallet account
    const account = USE_CDP_WALLET 
        ? await createCdpAccount()
        : createPrivateKeyAccount()

    // Wrap fetch with payment handling
    // This automatically handles 402 responses and creates payment headers
    const fetchWithPayment = wrapFetchWithPayment(fetch, account)

    console.log('\n📡 Making request to protected endpoint...')
    const url = process.env.API_URL || 'http://localhost:3000/locked'
    
    const response = await fetchWithPayment(url, {
        method: 'GET',
    })

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
    }

    // Parse response body
    const data = await response.json()
    console.log('\n✅ Successfully accessed protected resource!')
    console.log('📦 Response data:', JSON.stringify(data, null, 2))

    // Decode payment response header (if present)
    const paymentResponseHeader = response.headers.get('x-payment-response')
    if (paymentResponseHeader) {
        const paymentResponse = decodeXPaymentResponse(paymentResponseHeader)
        console.log('\n💰 Payment details:')
        console.log(JSON.stringify(paymentResponse, null, 2))
    }

} catch (error: any) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
}
