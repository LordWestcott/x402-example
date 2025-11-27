# x402 API Server Example

This directory contains a Hono-based API server that demonstrates how to protect endpoints with x402 payment middleware.

## Overview

This server implements the **seller** side of the x402 payment protocol. It uses the `x402-hono` middleware to automatically handle payment verification for protected routes.

## Implementation Details

### Payment Middleware Setup

The server uses `paymentMiddleware` from `x402-hono` to protect the `/super-secret-knowledge` endpoint:

```typescript
app.use(paymentMiddleware(
    '0xC755328409dDcE7703646C2f26ED42B8Fe2C87D0', // Recipient wallet address
    {
        '/super-secret-knowledge': {
            price: '$0.001',
            network: NETWORK,
            config: {
                description: 'Access to the answer to life, the universe, and everything.',
                resource: `http://localhost:3000/super-secret-knowledge`,
                maxTimeoutSeconds: 300, // 5 minutes for payment confirmation
            }
        },
    },
    facilitatorConfig
))
```

### Configuration Options

The middleware accepts three main parameters:

1. **Recipient Address**: The wallet address that will receive payments
2. **Route Configuration**: An object mapping route patterns to payment settings:
   - `price`: The price in USD (e.g., `"$0.001"`)
   - `network`: The blockchain network (`"base-sepolia"` for testnet, `"base"` for mainnet)
   - `config`: Additional configuration options (see below)

3. **Facilitator Config**: Optional facilitator URL. If not provided, uses the default testnet facilitator.

### Payment Middleware Config Options

```typescript
interface PaymentMiddlewareConfig {
  description?: string;               // Description of the payment
  mimeType?: string;                  // MIME type of the resource
  maxTimeoutSeconds?: number;         // Maximum time for payment (default: 60)
  outputSchema?: Record;              // JSON schema for the response
  customPaywallHtml?: string;         // Custom HTML for the paywall
  resource?: string;                  // Resource URL (defaults to request URL)
}
```

### Environment Variables

Create a `.env` file in this directory:

```env
# Network: 'base-sepolia' (testnet) or 'base' (mainnet)
NETWORK=base-sepolia

# Optional: Custom facilitator URL
# For testnet, defaults to https://x402.org/facilitator
# For mainnet, set to https://open.x402.host
FACILITATOR_URL=https://x402.org/facilitator
```

## How It Works

1. **Unpaid Request**: When a client makes a request without payment, the middleware intercepts it and returns HTTP 402 Payment Required with payment instructions in the response body.

2. **Payment Verification**: When a request includes the `X-PAYMENT` header with a valid payment payload, the middleware:
   - Verifies the payment signature
   - Checks payment amount and recipient
   - Validates the payment via the facilitator service
   - Allows the request to proceed if valid

3. **Protected Resource**: If payment is verified, the request reaches the actual route handler and returns the protected content.

## Running the Server

```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm run dev

# Build
npm run build

# Production mode
npm start
```

The server runs on `http://localhost:3000` by default.

## Testing

### Manual Testing

1. **Without Payment** (should return 402):
   ```bash
   curl http://localhost:3000/super-secret-knowledge
   ```

2. **With Payment** (using the client or a wallet):
   ```bash
   curl -H "X-PAYMENT: <payment-payload>" http://localhost:3000/super-secret-knowledge
   ```

### Expected Response (402 Payment Required)

```json
{
  "status": 402,
  "message": "Payment Required",
  "payment": {
    "amount": "0.001",
    "currency": "USDC",
    "recipient": "0xC755328409dDcE7703646C2f26ED42B8Fe2C87D0",
    "network": "base-sepolia",
    // ... additional payment instructions
  }
}
```

### Expected Response (After Payment)

```json
{
  "message": "42"
}
```

## Adding More Protected Routes

To protect additional routes, add them to the route configuration object:

```typescript
app.use(paymentMiddleware(
    '0xYourAddress',
    {
        '/super-secret-knowledge': {
            price: '$0.001',
            network: NETWORK,
            config: { /* ... */ }
        },
        '/premium-data': {
            price: '$0.01',
            network: NETWORK,
            config: {
                description: 'Access to premium data',
            }
        },
        // Add more routes as needed
    },
    facilitatorConfig
))
```

## References

- [x402 Seller Quickstart - Hono](https://x402.gitbook.io/x402/getting-started/quickstart-for-sellers#hono)
- [x402 Documentation](https://x402.gitbook.io/x402)

