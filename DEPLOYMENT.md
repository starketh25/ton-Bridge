# Jetton Bridge Deployment Guide

This guide explains how to deploy the TON-EVM Token Bridge system using Blueprint.

## Prerequisites

- Node.js 18+ installed
- TON wallet with sufficient funds for deployment

## Setup

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd Ton-Bridge
npm install
```

2. Configure your deployment wallet:

Create a `.env` file in the root directory with your wallet mnemonic:

```
MNEMONIC="your mnemonic phrase here"
NETWORK="testnet" # or "mainnet"
```

## Contract Structure

The TON-EVM Token Bridge system consists of several contracts:

1. **Jetton Bridge** - The main contract that handles cross-chain token transfers.
2. **Jetton Minter** - Creates and manages wrapped tokens on TON.
3. **Jetton Wallet** - Stores user token balances.
4. **Multisig Wallet** - Collects oracle votes for transfers from EVM to TON.
5. **Votes Collector** - Collects oracle signatures for transfers from TON to EVM.

## Deployment Options

### Basic Deployment (Jetton Bridge Only)

To deploy just the Jetton Bridge contract, run:

```bash
npm run start deployJettonBridge
```

This script will:
1. Compile the Jetton Bridge, Jetton Minter, and Jetton Wallet contracts
2. Deploy the Jetton Bridge contract with your wallet as the collector address
3. Print the deployed contract address and bridge data

### Full Bridge System Deployment

For a complete deployment of the entire bridge system, run:

```bash
npm run start deployFullBridgeSystem
```

This script will:
1. Compile all necessary contracts
2. Deploy the Jetton Bridge contract
3. Deploy the Multisig Wallet contract with mock oracle keys
4. Deploy the Votes Collector contract
5. Create an example wrapped token configuration
6. Save all deployment information to a JSON file in the `deployment` directory
7. Provide next steps for configuring the bridge

## Bridge Architecture

### EVM to TON Flow:

1. User locks ERC-20 tokens in the EVM bridge contract
2. Oracles detect the lock event and submit votes to the Multisig contract
3. When enough votes are collected, the Multisig sends an execute_voting message to the Jetton Bridge
4. Jetton Bridge mints wrapped tokens to the user's TON address

### TON to EVM Flow:

1. User burns wrapped tokens from their Jetton Wallet
2. Jetton Bridge emits a burn log
3. Oracles detect the burn log and submit signatures to the Votes Collector
4. User calls the unlock method on the EVM bridge contract with the collected signatures
5. EVM bridge releases the original tokens to the user

## Contract Configuration

The Jetton Bridge contract requires configuration in the TON blockchain config parameter #79. This must be set by validators or through governance mechanisms.

The config should include:
- Bridge address hash
- Oracles address hash
- Oracles public keys
- State flags
- Bridge fees and parameters

### Configuration Parameters

The following parameters are set in the deployment script:

| Parameter | Description | Default Value |
|-----------|-------------|---------------|
| MY_CHAIN_ID | Chain ID for TON | 1 |
| BRIDGE_BURN_FEE | Fee for burning tokens | 0.1 TON |
| BRIDGE_MINT_FEE | Fee for minting tokens | 0.15 TON |
| WALLET_MIN_TONS_FOR_STORAGE | Minimum TON for wallet storage | 0.01 TON |
| WALLET_GAS_CONSUMPTION | Gas consumption for wallet operations | 0.01 TON |
| MINTER_MIN_TONS_FOR_STORAGE | Minimum TON for minter storage | 0.05 TON |
| DISCOVER_GAS_CONSUMPTION | Gas consumption for discovery | 0.05 TON |

### Multisig Configuration

The Multisig contract requires:
- N: Total number of oracle keys (default: 3)
- K: Required number of signatures (default: 2)
- Oracle public keys

## Post-Deployment Steps

After deploying the bridge system, you need to:

1. Configure the TON blockchain parameter #79 with the bridge configuration
2. Configure real oracle public keys in the multisig contract
3. Ensure all contracts have sufficient funds
4. Connect the EVM side of the bridge (deploy the corresponding Solidity contracts)

## Testing

To run tests for the bridge contracts:

```bash
npm test
```

## Interacting with the Contracts

After deployment, you can interact with the contracts using the provided wrapper functions:

### Jetton Bridge:
- `getMinterAddress` - Get the address of a token minter
- `getBridgeData` - Get bridge configuration data

### Multisig Wallet:
- `getPublicKeys` - Get the list of oracle public keys
- `getNK` - Get the N and K parameters
- `getLockTimeout` - Get the lock timeout

### Votes Collector:
- `getExternalVotingData` - Get data about a specific voting
- `sendVoteOnExternalChain` - Submit a signature for a TON->EVM transfer
- `sendRemoveOutdatedVotings` - Clean up old voting data

## Security Considerations

- The bridge contracts handle cross-chain transfers and should be audited thoroughly
- Ensure proper configuration of the bridge parameters in the TON blockchain config
- The multisig contract should have carefully selected N and K parameters
- Oracle private keys should be securely stored
- The collector address has special privileges and should be properly secured