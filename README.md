# Bakua Finance

Bakua Finance is an on-chain infrastructure capital marketplace that transforms real-world infrastructure projects in emerging markets into standardised Special Purpose Vehicles (SPVs) on Base Network, connecting them to global DeFi capital. The platform bridges traditional project finance with blockchain-native settlement, enabling transparent, milestone-gated funding for agriculture, trade finance, real estate, and renewable energy assets across Africa.

🌐 **Live deployment:** [bakua-finance.lovable.app](https://bakua-finance.lovable.app)

---

## Repository Structure

```
bakua-finance/
├── contracts/                  # Solidity smart contracts deployed on Base Network
│   ├── SPVVault.sol            # Investor USDC vault with milestone-gated disbursements
│   ├── InvestorPositionToken.sol  # ERC-20 LP token representing investor claims
│   ├── OracleAdapter.sol       # IoT sensor & mobile money payment oracle
│   └── DistributionWaterfall.sol  # Pro-rata yield & principal distributions
├── src/                        # React + TypeScript frontend (Vite + TailwindCSS)
│   ├── components/             # UI components (dashboard, investor views, SPV cards)
│   ├── pages/                  # Route pages (marketplace, dashboards, auth)
│   ├── hooks/                  # React hooks (auth, data fetching, deployment)
│   ├── data/                   # Mock data and configuration
│   └── integrations/           # Backend client and type definitions
├── supabase/                   # Backend functions (edge functions, email templates)
│   └── functions/              # Serverless functions (analysis, deployment, verification)
├── public/                     # Static assets
└── index.html                  # Entry point
```

---

## Tech Stack

| Layer         | Technology                                           |
| ------------- | ---------------------------------------------------- |
| Frontend      | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui   |
| Backend       | Lovable Cloud (Supabase), Edge Functions (Deno)       |
| Smart Contracts | Solidity 0.8.28, OpenZeppelin patterns (inlined)    |
| Blockchain    | Base Network (Coinbase L2), EVM-compatible            |
| AI/ML         | Gemini, GPT-5 (document analysis, contract generation)|
| Payments      | USDC (Circle), MTN Mobile Money, Yellow Card          |

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/bakaborobudur/bakua-finance.git
cd bakua-finance

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Required variables:
#   VITE_SUPABASE_URL=<your-backend-url>
#   VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Smart Contracts

### Architecture

The Bakua SPV contract suite consists of four interconnected contracts that together manage the full lifecycle of an infrastructure investment:

```
Investor (MetaMask)
    │
    ▼
┌──────────────┐    mint tokens    ┌────────────────────────┐
│   SPVVault   │ ───────────────▶  │  InvestorPositionToken │
│  (USDC in)   │                   │     (ERC-20 LP)        │
└──────┬───────┘                   └────────────────────────┘
       │                                      │
       │ milestone                             │ pro-rata
       │ disbursements                         │ balances
       ▼                                       ▼
┌──────────────┐    confirms       ┌────────────────────────┐
│ OracleAdapter│ ───────────────▶  │ DistributionWaterfall  │
│ (IoT/MoMo)   │                   │   (yield payouts)      │
└──────────────┘                   └────────────────────────┘
```

### Contract Descriptions

#### SPVVault
Holds investor USDC deposits and manages milestone-gated disbursements. Investors deposit USDC and receive InvestorPositionTokens 1:1. Funds are released to project operators only when oracle-verified milestones are met. Supports withdrawal before disbursement begins, auto-closes funding when target is reached, and tracks all investor positions.

#### InvestorPositionToken
An ERC-20 token representing each investor's proportional claim on SPV cash flows. Transfer-restricted via an on-chain whitelist registry — only KYC-verified wallet addresses may hold tokens. Minted by SPVVault on deposit, burned on redemption. Visible in MetaMask and any ERC-20 compatible wallet after adding the token contract address.

#### OracleAdapter
Receives and validates IoT sensor data (temperature, humidity, NDVI vegetation indices) and mobile money payment confirmations on-chain. Supports multiple reporter addresses for decentralised data submission. Tracks payment volumes, sensor thresholds, and emits events that trigger milestone approvals in the SPVVault.

#### DistributionWaterfall
Executes pro-rata yield and principal distributions to token holders following a structured waterfall: (1) operating expenses, (2) DSRA reserve funding, (3) investor yield distribution, (4) principal repayment. Supports both pull (investor claims) and push (admin batch distribution) models.

### Deployed Contract Addresses

#### Base Sepolia Testnet (Chain ID: 84532)

| Contract                | Address | Basescan |
| ----------------------- | ------- | -------- |
| InvestorPositionToken   | `TBD`   | [View](https://sepolia.basescan.org/address/TBD) |
| SPVVault                | `TBD`   | [View](https://sepolia.basescan.org/address/TBD) |
| OracleAdapter           | `TBD`   | [View](https://sepolia.basescan.org/address/TBD) |
| DistributionWaterfall   | `TBD`   | [View](https://sepolia.basescan.org/address/TBD) |

#### Base Mainnet (Chain ID: 8453)

| Contract                | Address | Basescan |
| ----------------------- | ------- | -------- |
| InvestorPositionToken   | `TBD`   | [View](https://basescan.org/address/TBD) |
| SPVVault                | `TBD`   | [View](https://basescan.org/address/TBD) |
| OracleAdapter           | `TBD`   | [View](https://basescan.org/address/TBD) |
| DistributionWaterfall   | `TBD`   | [View](https://basescan.org/address/TBD) |

> Contract addresses will be populated after deployment. Run pre-flight checks and deploy via the admin dashboard.

---

## Payment Flow

```
┌─────────────┐     MTN MoMo      ┌──────────────┐     API callback     ┌────────────────┐
│  Borrower / │ ──────────────▶   │   MTN MoMo   │ ──────────────────▶  │  Yellow Card   │
│  Off-taker  │    payment in     │   Gateway    │    payment confirmed │  Financial     │
│  (XAF/XOF)  │    local currency │              │                      │                │
└─────────────┘                   └──────────────┘                      └───────┬────────┘
                                                                                │
                                                                    XAF → USDC  │ conversion
                                                                    + settlement│
                                                                                ▼
┌─────────────┐   USDC on-chain   ┌──────────────┐    event emission    ┌────────────────┐
│ Distribution│ ◀──────────────   │  SPVVault    │ ◀────────────────── │ OracleAdapter  │
│  Waterfall  │   pro-rata payout │  (Base L2)   │   payment confirmed │ (on-chain)     │
│             │   to investors    │              │                      │                │
└─────────────┘                   └──────────────┘                      └────────────────┘
```

1. **Collection**: Borrowers or off-takers make payments in local currency (XAF/XOF) via MTN Mobile Money.
2. **Confirmation**: The payment gateway confirms receipt and notifies the Yellow Card Financial API.
3. **Conversion**: Yellow Card converts local currency to USDC at market rate and settles on Base Network.
4. **Oracle Recording**: The OracleAdapter contract records the payment confirmation on-chain with amount, currency, source, and transaction hash.
5. **Milestone Verification**: When cumulative payments meet milestone thresholds, the OracleAdapter triggers milestone approval in the SPVVault.
6. **Distribution**: The DistributionWaterfall executes pro-rata USDC distributions to all InvestorPositionToken holders based on their proportional ownership.

---

## Licence

MIT Licence — Bakua Finance Limited, 2025. See [LICENSE](./LICENSE) for details.
