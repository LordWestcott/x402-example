# x402 Payment Example

This repository demonstrates a complete example of the **x402** payment protocol, showcasing both the seller (API) and buyer (client) perspectives of implementing crypto payments for API access.

## What is x402?

x402 is a payment protocol that enables APIs and services to charge for access using cryptocurrency. It implements the HTTP 402 Payment Required status code, allowing seamless integration of payment barriers into web APIs.

## Repository Structure

This example consists of two main components:

- **`api/`** - A Hono-based API server that demonstrates how to protect endpoints with x402 payment middleware
- **`client/`** - A TypeScript client that demonstrates how to programmatically handle 402 Payment Required responses and complete payments

## Quick Start

### Prerequisites

- Node.js and npm installed
- A crypto wallet with USDC (for testnet: Base Sepolia USDC)
- A private key for your wallet (keep this secure!)

### 1. Set Up the API Server

```bash
cd api
npm install
```

Create a `.env` file in the `api/` directory:

```env
NETWORK=base-sepolia
# Optional: Set a custom facilitator URL
# FACILITATOR_URL=https://x402.org/facilitator
```

Start the server:

```bash
npm run dev
```

The server will run on `http://localhost:3000` and protect the `/super-secret-knowledge` endpoint with a $0.001 payment requirement.

### 2. Set Up the Client

```bash
cd client
npm install
```

Configure your wallet in `client/index.ts` (see the client README for details).

Run the client:

```bash
npm run dev
```

The client will automatically detect the payment requirement, complete the payment, and access the protected resource.

## How It Works

1. **API Server** (`api/`): When a request is made to a protected endpoint without payment, the server responds with HTTP 402 Payment Required, including payment instructions.

2. **Client** (`client/`): The client detects the 402 response, extracts payment instructions, signs a payment payload using the configured wallet, and retries the request with the `X-PAYMENT` header containing the cryptographic proof of payment.

3. **Verification**: The API server verifies the payment via the facilitator service and, if valid, returns the protected resource.

## Testing

1. Start the API server in one terminal
2. Run the client in another terminal
3. The client should automatically handle the payment flow and display the protected content

You can also test manually using `curl`:

```bash
# First request - should return 402 Payment Required
curl http://localhost:3000/super-secret-knowledge

# After completing payment (using a wallet or the client), retry with X-PAYMENT header
curl -H "X-PAYMENT: <payment-payload>" http://localhost:3000/super-secret-knowledge
```

## Network Configuration

- **Testnet**: Use `base-sepolia` network (default). Get testnet USDC from Base Sepolia faucets.
- **Mainnet**: Change `NETWORK=base` in the API `.env` file. Requires real USDC.

## Documentation

- [x402 Seller Quickstart](https://x402.gitbook.io/x402/getting-started/quickstart-for-sellers)
- [x402 Buyer Quickstart](https://x402.gitbook.io/x402/getting-started/quickstart-for-buyers)
- [x402 Documentation](https://x402.gitbook.io/x402)
