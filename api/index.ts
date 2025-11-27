import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { paymentMiddleware } from 'x402-hono'

// Environment configuration
// Set NETWORK in .env to switch between 'base' (mainnet) and 'base-sepolia' (testnet)
// Optionally set FACILITATOR_URL to use a custom facilitator
// See .env.example for configuration options
const NETWORK = (process.env.NETWORK || 'base-sepolia') as 'base' | 'base-sepolia'
const FACILITATOR_URL = process.env.FACILITATOR_URL || (
    NETWORK === 'base' 
        ? 'https://open.x402.host' // Mainnet facilitator
        : undefined // Use default testnet facilitator
)

const app = new Hono()

// Configure facilitator if URL is provided
const facilitatorConfig = FACILITATOR_URL ? {
    url: FACILITATOR_URL as `${string}://${string}`,
} : undefined

app.use(paymentMiddleware(
    '0xC755328409dDcE7703646C2f26ED42B8Fe2C87D0', // Receipient wallet address
    {
        '/super-secret-knowledge': {
            price: '$0.001',
            network: NETWORK,
            config: {
                description: 'Access to the answer to life, the universe, and everything.',
                // Explicitly set resource URL to match what the wallet will use
                // This ensures the payment authorization matches the resource being accessed
                resource: `http://localhost:3000/super-secret-knowledge`,
                // Increase timeout to allow for blockchain settlement
                // Note: This is the paywall timeout, not settlement wait time
                // The facilitator verifies immediately, but transactions may take 10-30 seconds to confirm
                maxTimeoutSeconds: 300, // 5 minutes - gives user time to complete payment and wait for confirmation
            }
        },
    },
    facilitatorConfig // Use default facilitator for testnet if undefined
))

app.get('/super-secret-knowledge', (c) => c.json({ message: '42' }))

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running on port ${info.port}`)
})
