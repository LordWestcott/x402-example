# x402 API Server Example

A Hono-based API server demonstrating how to protect endpoints with x402 payment middleware.

## Overview

This server implements the **seller** side of the x402 payment protocol. It uses the `x402-hono` middleware to automatically handle payment verification for protected routes.

## Implementation

The server protects the `/locked` endpoint with payment middleware:

```typescript
app.use(paymentMiddleware(
    '0x8fb6bd5e6deb10f360c7681d594657df5d4aaf8f', // Recipient wallet address
    {
        '/locked': {
            price: '$0.001',
            network: NETWORK,
            config: {
                description: 'Access to the answer to life, the universe, and everything.',
                maxTimeoutSeconds: 300,
                mimeType: 'application/json',
            }
        }
    },
    facilitator // From @coinbase/x402
))
```

## Configuration

### Environment Variables

Create a `.env` file in this directory:

```env
# Network: 'base-sepolia' (testnet) or 'base' (mainnet)
# Defaults to 'base-sepolia' if not set
NETWORK=base-sepolia
```

### Route Configuration

Each protected route requires:
- `price`: The price in USD (e.g., `"$0.001"`)
- `network`: The blockchain network (`"base-sepolia"` or `"base"`)
- `config`: Additional options:
  - `description`: Description of the payment
  - `maxTimeoutSeconds`: Maximum time for payment confirmation (default: 60)
  - `mimeType`: MIME type of the resource

## How It Works

1. **Unpaid Request**: Returns HTTP `402 Payment Required` with payment instructions
2. **Payment Verification**: Validates the `X-PAYMENT` header via the facilitator service
3. **Protected Resource**: If payment is valid, returns the protected content

## Running the Server

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build and run production
npm run build
npm start
```

The server runs on `http://localhost:3000` by default.

## Testing

### Without Payment (returns 402)

```bash
curl http://localhost:3000/locked
```

### With Payment

Use the [client](../client/) example or include the `X-PAYMENT` header:

```bash
curl -H "X-PAYMENT: <payment-payload>" http://localhost:3000/locked
```

### Expected Responses

**402 Payment Required:**
```json
{
  "status": 402,
  "message": "Payment Required",
  "payment": {
    "amount": "0.001",
    "currency": "USDC",
    "recipient": "0x8fb6bd5e6deb10f360c7681d594657df5d4aaf8f",
    "network": "base-sepolia"
  }
}
```

**200 OK (after payment):**
```json
{
  "message": "42"
}
```

## Adding More Protected Routes

Add routes to the `routes` object:

```typescript
const routes = {
    '/locked': {
        price: '$0.001',
        network: NETWORK,
        config: { /* ... */ }
    },
    '/premium-data': {
        price: '$0.01',
        network: NETWORK,
        config: {
            description: 'Access to premium data',
            maxTimeoutSeconds: 300,
            mimeType: 'application/json',
        }
    }
}
```

## References
- [x402 Coinbase - Quick start for sellers](https://docs.cdp.coinbase.com/x402/quickstart-for-sellers)
- [x402 Documentation](https://x402.gitbook.io/x402)
- [x402 Protocol Sequencing](../documentation/x402-Protocol-Sequencing.md)
