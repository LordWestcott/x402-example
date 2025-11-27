# x402 Client Example

An example client implementation demonstrating how to interact with x402-protected endpoints using automatic payment handling.

## Overview

This client demonstrates how to:
1. Set up a wallet (CDP Server Wallet or standalone viem wallet)
2. Automatically handle `402 Payment Required` responses
3. Complete payments and access protected resources

The client uses `x402-fetch` to wrap the native `fetch` API, automatically detecting `402` responses, creating payment headers, and completing transactions on your behalf.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A wallet with USDC funds (for private key wallet) OR CDP Server Wallet credentials

## Installation

```bash
npm install
```

## Configuration

The client supports two wallet types:

### Option 1: CDP Server Wallet (Recommended)

CDP Server Wallet is Coinbase's managed wallet solution that handles key management securely.

**Required Environment Variables:**
- `CDP_API_KEY_ID` - Your CDP API Key ID
- `CDP_API_KEY_SECRET` - Your CDP API Key Secret
- `CDP_WALLET_SECRET` - Your CDP Wallet Secret

Get these credentials from [https://cdp.coinbase.com/](https://cdp.coinbase.com/)

**Configuration:**
```bash
USE_CDP_WALLET=true  # or omit (defaults to true)
```

### Option 2: Private Key Wallet

Use a standalone wallet with a private key (requires manual USDC funding).

**Required Environment Variables:**
- `PRIVATE_KEY` - Your wallet's private key (with or without `0x` prefix)

**Configuration:**
```bash
USE_CDP_WALLET=false
```

### Additional Configuration

- `API_URL` - The URL of the protected endpoint (defaults to `http://localhost:3000/locked`)

## Environment Variables

Create a `.env` file in the `client` directory:

```env
# Wallet Configuration (choose one)
USE_CDP_WALLET=true

# CDP Server Wallet (if USE_CDP_WALLET=true)
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret

# OR Private Key Wallet (if USE_CDP_WALLET=false)
PRIVATE_KEY=your_private_key_here

# API Configuration
API_URL=http://localhost:3000/locked
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## How It Works

1. **Wallet Initialization**: The client creates a wallet account based on your configuration (CDP or private key)

2. **Fetch Wrapping**: The native `fetch` is wrapped with `wrapFetchWithPayment`, which:
   - Intercepts `402 Payment Required` responses
   - Extracts payment requirements from the response
   - Creates and signs payment payloads
   - Automatically retries the request with the `X-PAYMENT` header

3. **Request Execution**: Makes a GET request to the protected endpoint

4. **Payment Handling**: If a `402` response is received:
   - Payment requirements are parsed
   - A payment transaction is created and signed
   - The request is retried with payment headers
   - Payment is verified and settled by the server

5. **Response Processing**: 
   - Parses the successful response body
   - Decodes and displays payment details from the `X-PAYMENT-RESPONSE` header (if present)

## Example Output

```
🚀 Starting x402 payment client...

✅ CDP Server Wallet initialized
   Address: 0x1234...5678

📡 Making request to protected endpoint...

✅ Successfully accessed protected resource!
📦 Response data: {
  "message": "Welcome to the protected resource!",
  "timestamp": "2024-01-01T00:00:00Z"
}

💰 Payment details: {
  "transactionHash": "0xabcd...efgh",
  "amount": "1.00",
  "currency": "USDC"
}
```

## Error Handling

The client will display helpful error messages if:
- Required environment variables are missing
- Wallet initialization fails
- Payment cannot be completed
- The request fails for any reason

## Dependencies

- `x402-fetch` - x402 protocol fetch wrapper
- `@coinbase/cdp-sdk` - CDP Server Wallet SDK
- `viem` - Ethereum library for wallet operations
- `dotenv` - Environment variable management

## Related Documentation
- [x402 Coinbase - Quick start for buyers](https://docs.cdp.coinbase.com/x402/quickstart-for-buyers)
- [x402 Protocol Sequencing](../documentation/x402-Protocol-Sequencing.md)
- [CDP Server Wallet Documentation](https://docs.cdp.coinbase.com/)
