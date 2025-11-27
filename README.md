# x402 Payment Example

This repository demonstrates a complete example of the **x402** payment protocol, showcasing both the seller (API) and buyer (client) perspectives of implementing crypto payments for API access.

## What is x402?

x402 is a payment protocol that enables APIs and services to charge for access using cryptocurrency. It implements the HTTP 402 Payment Required status code, allowing seamless integration of payment barriers into web APIs.

## Repository Structure

This example consists of two main components:

- **`api/`** - A Hono-based API server that demonstrates how to protect endpoints with x402 payment middleware
- **`client/`** - A TypeScript client that demonstrates how to programmatically handle 402 Payment Required responses and complete payments

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A wallet with USDC funds (for client) OR CDP Server Wallet credentials
- Both services must use the same blockchain network (e.g., `base-sepolia` for testnet)

## Quick Start

### 1. Set Up the API Server

```bash
cd api
npm install
```

Create `api/.env`:
```env
NETWORK=base-sepolia
```

Start the server:
```bash
npm run dev
```

The API server will run on `http://localhost:3000` and protect the `/locked` endpoint.

### 2. Set Up the Client

In a new terminal:

```bash
cd client
npm install
```

Create `client/.env`:

**Option A: CDP Server Wallet (Recommended)**
```env
USE_CDP_WALLET=true
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret
API_URL=http://localhost:3000/locked
```

Get CDP credentials from [https://cdp.coinbase.com/](https://cdp.coinbase.com/)

**Option B: Private Key Wallet**
```env
USE_CDP_WALLET=false
PRIVATE_KEY=your_private_key_here
API_URL=http://localhost:3000/locked
```

> ⚠️ **Important**: If using a private key wallet, ensure it has USDC on the same network as the API (`base-sepolia` for testnet).

### 3. Run the Client

```bash
npm run dev
```

The client will automatically:
1. Initialize your wallet
2. Make a request to the protected endpoint
3. Detect the `402 Payment Required` response
4. Create and sign a payment transaction
5. Retry the request with payment headers
6. Display the protected resource and payment details

## How the Services Connect

The client and API communicate through the x402 protocol:

1. **Client Request**: Client makes a GET request to `http://localhost:3000/locked`
2. **402 Response**: API returns `402 Payment Required` with payment instructions
3. **Payment Creation**: Client's `wrapFetchWithPayment` automatically:
   - Parses payment requirements
   - Creates a signed payment payload
   - Adds `X-PAYMENT` header to the request
4. **Payment Verification**: API middleware verifies the payment via the facilitator service
5. **Resource Access**: If payment is valid, API returns the protected resource (`{ "message": "42" }`)
6. **Payment Confirmation**: API includes payment details in the `X-PAYMENT-RESPONSE` header

### Network Configuration

Both services must use the same network:
- **Testnet**: `base-sepolia` (default, recommended for testing)
- **Mainnet**: `base` (requires real USDC)

The API uses the `NETWORK` environment variable, and the client automatically uses the network specified in the payment requirements from the API.

### Endpoint Configuration

The client defaults to `http://localhost:3000/locked`, which matches the API's protected route. You can change this by setting `API_URL` in the client's `.env` file.

## Testing the Connection

### Test 1: API Without Payment

```bash
curl http://localhost:3000/locked
```

Expected: `402 Payment Required` response with payment instructions

### Test 2: Full Flow with Client

Run the client:
```bash
cd client
npm run dev
```

Expected output:
```
🚀 Starting x402 payment client...

✅ CDP Server Wallet initialized
   Address: 0x1234...5678

📡 Making request to protected endpoint...

✅ Successfully accessed protected resource!
📦 Response data: {
  "message": "42"
}

💰 Payment details: {
  "transactionHash": "0xabcd...efgh",
  "amount": "0.001",
  "currency": "USDC"
}
```

## Project Structure

```
x402-example/
├── api/                 # API server (seller)
│   ├── index.ts        # Server implementation
│   ├── package.json
│   └── README.md       # Detailed API documentation
├── client/             # Client application (buyer)
│   ├── index.ts        # Client implementation
│   ├── package.json
│   └── README.md       # Detailed client documentation
├── documentation/      # Protocol documentation
│   └── x402-Protocol-Sequencing.md
└── README.md           # This file
```

## Troubleshooting

### Client can't connect to API
- Ensure the API server is running on `http://localhost:3000`
- Check that `API_URL` in client `.env` matches the API server URL

### Payment fails
- Verify both services use the same network (`base-sepolia` or `base`)
- Ensure your wallet has sufficient USDC balance
- Check that CDP credentials are correct (if using CDP Server Wallet)

### 402 response but payment not processing
- Verify network configuration matches between API and client
- Check wallet has USDC on the correct network
- Review console output for specific error messages

## Next Steps

- Read the [API README](api/README.md) for detailed server-side implementation
- Read the [Client README](client/README.md) for detailed client-side implementation
- Review the [x402 Protocol Sequencing](documentation/x402-Protocol-Sequencing.md) for protocol details
- Explore adding more protected routes in the API
- Customize payment amounts and configurations

## Documentation

- [x402 Coinbase - Quick start for sellers](https://docs.cdp.coinbase.com/x402/quickstart-for-sellers)
- [x402 Coinbase - Quick start for buyers](https://docs.cdp.coinbase.com/x402/quickstart-for-buyers)
- [x402 Documentation](https://x402.gitbook.io/x402)
- [x402 Protocol Sequencing](documentation/x402-Protocol-Sequencing.md)
