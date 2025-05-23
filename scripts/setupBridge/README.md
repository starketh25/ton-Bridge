# TON Bridge Setup Guide

This directory contains scripts to help you set up and configure the TON Bridge system. Follow these steps in order to complete the setup process.

## Prerequisites

1. A deployed TON Bridge system (using `deployFullBridgeSystem.ts`)
2. Access to the TON network (mainnet or testnet)
3. Node.js and npm installed
4. For the EVM side, access to an Ethereum-compatible network

## Setup Steps

### 1. Configure Blockchain Parameters

This step sets up the bridge configuration in TON blockchain config parameter #79.

```bash
npx blueprint run setupBridge/1-configureBlockchainParams
```

**Note:** This requires validator permissions to update blockchain config parameters. For testnet/mainnet, you'll need to submit a proposal that validators will vote on.

### 2. Configure Oracle Keys

This step configures the real oracle public keys in the multisig contract.

```bash
npx blueprint run setupBridge/2-configureOracleKeys
```

You will be prompted to enter the real oracle public keys. These should be the actual keys that will be used in production.

### 3. Fund Contracts

This step ensures all contracts have sufficient funds to operate.

```bash
npx blueprint run setupBridge/3-fundContracts
```

The script will check the balance of each contract and prompt you to fund them if necessary.

### 4. Connect EVM Side

This step helps you connect the EVM side of the bridge.

```bash
npx blueprint run setupBridge/4-connectEVMSide
```

You will be prompted to enter information about the EVM network and bridge contract.

## Contract Addresses

After running the deployment script, you can find the contract addresses in the deployment JSON file in the `deployment` directory. The most recent deployment file will be used by the setup scripts.

## Monitoring and Maintenance

After setting up the bridge, it's important to:

1. Monitor contract balances regularly
2. Set up oracle services to monitor both chains
3. Test the bridge with small transfers before allowing larger amounts
4. Have a plan for handling emergencies (e.g., pausing the bridge)

## Security Considerations

For a production bridge, ensure:

1. Thorough security audits are conducted on both sides
2. Oracle keys are stored securely
3. Bridge parameters are set correctly
4. Monitoring and alerting systems are in place

## Troubleshooting

If you encounter issues:

1. Check contract balances
2. Verify oracle configurations
3. Ensure blockchain parameters are set correctly
4. Check logs from oracle services

For more detailed information, refer to the documentation in each script file. 