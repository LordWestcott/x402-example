import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { facilitator } from "@coinbase/x402"

import { paymentMiddleware } from 'x402-hono'

const NETWORK = (process.env.NETWORK || 'base-sepolia') as 'base' | 'base-sepolia'

const app = new Hono()

const payTo = '0x8fb6bd5e6deb10f360c7681d594657df5d4aaf8f'
const routes = {
    '/locked': {
        price: '$0.001',
        network: NETWORK,
        config: {
            description: 'Access to the answer to life, the universe, and everything.',
            maxTimeoutSeconds: 300,
            mimeType: 'application/json',

        }
    }
}

app.use(paymentMiddleware(
    payTo,
    routes,
    facilitator
))

app.get('/locked', (c) => c.json({ message: '42' }))

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running on port ${info.port}`)
})
