import { toNano, Address, beginCell, Cell, Dictionary } from '@ton/core';
import { JettonBridge } from '../wrappers/JettonBridge';
import { MultisigWallet } from '../wrappers/MultisigWallet';
import { VotesCollector } from '../wrappers/VotesCollector';
import { compile, NetworkProvider } from '@ton/blueprint';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

dotenv.config();

// Configuration parameters
const MY_CHAIN_ID = 1; // From params.fc
const BRIDGE_BURN_FEE = toNano('0.1');
const BRIDGE_MINT_FEE = toNano('0.15');
const WALLET_MIN_TONS_FOR_STORAGE = toNano('0.01');
const WALLET_GAS_CONSUMPTION = toNano('0.01');
const MINTER_MIN_TONS_FOR_STORAGE = toNano('0.05');
const DISCOVER_GAS_CONSUMPTION = toNano('0.05');

// State flags
const STATE_BURN_SUSPENDED = 1;
const STATE_SWAPS_SUSPENDED = 2;
const STATE_GOVERNANCE_SUSPENDED = 4;
const STATE_COLLECTOR_SIGNATURE_REMOVAL_SUSPENDED = 8;

// Initial state - no suspensions
const INITIAL_STATE_FLAGS = 0;

// Multisig parameters
const WALLET_ID = Math.floor(Math.random() * 2**32); // Random wallet ID
const N = 3; // Total number of owners (oracles)
const K = 2; // Required signatures (k of n)
const LOCK_UNTIL = 0; // No lock

async function saveDeploymentInfo(info: any) {
    const deploymentDir = path.join(__dirname, '../deployment');
    if (!fs.existsSync(deploymentDir)) {
        fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const filePath = path.join(deploymentDir, `deployment_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(info, null, 2));
    console.log(`Deployment info saved to ${filePath}`);
}

export async function run(provider: NetworkProvider) {
    // Compile contracts
    console.log('Compiling contracts...');
    const jettonMinterCode = await compile('JettonMinter');
    const jettonWalletCode = await compile('JettonWallet');
    const jettonBridgeCode = await compile('JettonBridge');
    const multisigCode = await compile('MultisigWallet');
    const votesCollectorCode = await compile('VotesCollector');
    
    console.log('Contracts compiled successfully');
    
    // Get deployer address
    const deployerAddress = provider.sender().address!;
    console.log(`Deployer address: ${deployerAddress}`);
    
    // Create and deploy JettonBridge contract
    console.log('Deploying JettonBridge contract...');
    const jettonBridge = provider.open(
        JettonBridge.createFromConfig({
            collectorAddress: deployerAddress,
            jettonMinterCode,
            jettonWalletCode
        }, jettonBridgeCode)
    );

    await jettonBridge.sendDeploy(provider.sender(), toNano('0.5'));
    const bridgeAddress = jettonBridge.address;
    console.log(`JettonBridge deployed at address: ${bridgeAddress}`);
    
    // Generate mock oracle public keys for demonstration
    console.log('Generating oracle public keys...');
    const ownerInfos = Dictionary.empty<number, { publicKey: bigint; flood: number }>();
    
    // Generate 3 mock oracle keys for demonstration
    for (let i = 0; i < N; i++) {
        const publicKeyBytes = randomBytes(32);
        const publicKey = BigInt('0x' + publicKeyBytes.toString('hex'));
        ownerInfos.set(i, { publicKey, flood: 0 });
        console.log(`Oracle ${i}: Public Key = ${publicKey}`);
    }
    
    // Create and deploy MultisigWallet contract
    console.log('Deploying MultisigWallet contract...');
    const multisigWallet = provider.open(
        MultisigWallet.createFromConfig({
            walletId: WALLET_ID,
            n: N,
            k: K,
            ownerInfos,
            pendingQueries: Dictionary.empty(),
            lastCleaned: 0n,
            lockUntil: LOCK_UNTIL
        }, multisigCode)
    );
    
    await multisigWallet.sendDeploy(provider.sender(), toNano('0.5'));
    const multisigAddress = multisigWallet.address;
    console.log(`MultisigWallet deployed at address: ${multisigAddress}`);
    
    // Create and deploy VotesCollector contract
    console.log('Deploying VotesCollector contract...');
    const votesCollector = provider.open(
        VotesCollector.createFromConfig({
            externalVotings: Dictionary.empty()
        }, votesCollectorCode)
    );
    
    await votesCollector.sendDeploy(provider.sender(), toNano('0.5'));
    const votesCollectorAddress = votesCollector.address;
    console.log(`VotesCollector deployed at address: ${votesCollectorAddress}`);
    
    // Get bridge data to verify deployment
    const bridgeData = await jettonBridge.getBridgeData();
    console.log('Bridge Data:', {
        workchain: bridgeData.workchain,
        address: bridgeData.address,
        chainId: bridgeData.chainId
    });
    
    // Example of creating a wrapped token
    console.log('Creating example wrapped token data...');
    const exampleTokenData = beginCell()
        .storeUint(MY_CHAIN_ID, 32) // chain_id
        .storeUint(123456789, 160) // token_address (example)
        .storeUint(18, 8) // token_decimals
        .endCell();
    
    const minterAddress = await jettonBridge.getMinterAddress(exampleTokenData);
    console.log(`Example token minter address: ${minterAddress}`);
    
    // Save deployment information
    const deploymentInfo = {
        timestamp: new Date().toISOString(),
        network: process.env.NETWORK || 'unknown',
        contracts: {
            bridgeAddress: bridgeAddress.toString(),
            multisigAddress: multisigAddress.toString(),
            votesCollectorAddress: votesCollectorAddress.toString(),
            exampleMinterAddress: minterAddress.toString(),
        },
        collectorAddress: deployerAddress.toString(),
        multisigConfig: {
            walletId: WALLET_ID,
            n: N,
            k: K,
            oracles: Array.from({ length: N }, (_, i) => {
                const oracle = ownerInfos.get(i);
                return {
                    index: i,
                    publicKey: oracle?.publicKey.toString(16)
                };
            })
        },
        configParameters: {
            myChainId: MY_CHAIN_ID,
            bridgeBurnFee: BRIDGE_BURN_FEE.toString(),
            bridgeMintFee: BRIDGE_MINT_FEE.toString(),
            walletMinTonsForStorage: WALLET_MIN_TONS_FOR_STORAGE.toString(),
            walletGasConsumption: WALLET_GAS_CONSUMPTION.toString(),
            minterMinTonsForStorage: MINTER_MIN_TONS_FOR_STORAGE.toString(),
            discoverGasConsumption: DISCOVER_GAS_CONSUMPTION.toString(),
            stateFlags: INITIAL_STATE_FLAGS
        }
    };
    
    await saveDeploymentInfo(deploymentInfo);
    
    console.log('\nDeployment completed successfully!');
    console.log('\nIMPORTANT: For the bridge to function properly, you need to:');
    console.log('1. Set up the bridge configuration in TON blockchain config parameter #79');
    console.log('2. Configure the real oracle public keys in the multisig contract');
    console.log('3. Ensure all contracts have sufficient funds');
    console.log('4. Connect the EVM side of the bridge');
} 