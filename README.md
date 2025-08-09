## Token-2022 AMM + Transfer Hook Demo

Build, pool, and trade Token-2022 assets with Transfer Hooks on Solana devnet in a simple web UI.

### Platform supports
- Token-2022 Transfer Hooks: whitelisting, KYC gating, conditional transfers, programmable behaviors
- Multiple hook programs (extensible)
- Permissionless but safe hook approval (safelisted/guarded flows)
- Integrations with existing AMMs (adapters for Raydium/Orca/Meteora)

### Prerequisites
- Node.js 22+
- Solana wallet on devnet (e.g., backpack)
- Devnet SOL for fees (airdrop if needed)

### Install
```
npm install
```

### Configure
Create `.env.local` in the project root:
```
NEXT_PUBLIC_TRANSFER_HOOK_PROGRAM_ID=DXroBepak55dVb4NzAKVGvvmrF5a63j6sEfgjzLTytFB
```
(Replace with your deployed transfer-hook program id.)

### Run
```
npm run dev       # development
npm run build     # production build
npm start         # serve production build
```

Open `http://localhost:3000` 

### Quick start
1) Connect your wallet (devnet)
2) Create a Token-2022 mint (Transfer Hook enabled)
3) Create a SOL/token pool (paste mint, set amounts)
4) Trade using the pool card (buy/sell)
5) Optional: use the Jupiter tab to preview routes on devnet

### Notes
- Devnet only; UI, not production. Hook enforcement resides in your on-chain program.

### Made with ❤️ by Rishav Mehra