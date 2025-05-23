import { toNano, Address, beginCell, Cell, Dictionary } from '@ton/core';
import { MultisigWallet } from '../../wrappers/MultisigWallet';
import { compile, NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * This script configures the real oracle public keys in the multisig contract
 * 
 * Note: This requires access to the real oracle keys that will be used in production
 */

// Load the latest deployment info
function loadLatestDeployment() {
    const deploymentDir = path.join(__dirname, '../../deployment');
    const files = fs.readdirSync(deploymentDir)
        .filter(file => file.startsWith('deployment_'))
        .sort((a, b) => b.localeCompare(a)); // Sort in descending order
    
    if (files.length === 0) {
        throw new Error('No deployment files found');
    }
    
    const latestFile = path.join(deploymentDir, files[0]);
    return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
}

// Ask for oracle public keys interactively
async function askForOracleKeys(n: number): Promise<bigint[]> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const keys: bigint[] = [];
    
    for (let i = 0; i < n; i++) {
        const key = await new Promise<string>((resolve) => {
            rl.question(`Enter Oracle ${i} public key (hex format without 0x prefix): `, resolve);
        });
        
        try {
            keys.push(BigInt('0x' + key));
        } catch (e) {
            console.error(`Invalid key format for Oracle ${i}. Please use hex format.`);
            i--; // Retry this key
        }
    }
    
    rl.close();
    return keys;
}

export async function run(provider: NetworkProvider) {
    // Load deployment info
    const deploymentInfo = loadLatestDeployment();
    const multisigAddress = Address.parse(deploymentInfo.contracts.multisigAddress);
    const n = deploymentInfo.multisigConfig.n;
    const k = deploymentInfo.multisigConfig.k;
    
    console.log(`Configuring ${n} oracle keys for multisig wallet at ${multisigAddress}`);
    console.log(`Required signatures (k): ${k}`);
    
    // Get the current multisig contract
    const multisigCode = await compile('MultisigWallet');
    const multisig = provider.open(MultisigWallet.createFromAddress(multisigAddress));
    
    // Ask for the real oracle public keys
    console.log('\nYou will now be asked to enter the real oracle public keys.');
    console.log('These should be the actual keys that will be used in production.');
    console.log('Keys should be provided in hex format without 0x prefix.\n');
    
    const oracleKeys = await askForOracleKeys(n);
    
    // Create the new owner info dictionary
    const ownerInfos = Dictionary.empty<number, { publicKey: bigint; flood: number }>();
    for (let i = 0; i < n; i++) {
        ownerInfos.set(i, { publicKey: oracleKeys[i], flood: 0 });
        console.log(`Oracle ${i}: Public Key = ${oracleKeys[i]}`);
    }
    
    // Get the current wallet ID and other parameters from the existing contract
    const nk = await multisig.getNK(provider);
    
    // Create a new multisig wallet configuration
    const newConfig = {
        walletId: deploymentInfo.multisigConfig.walletId,
        n: nk.n,
        k: nk.k,
        ownerInfos,
        pendingQueries: Dictionary.empty<bigint, Cell>(),
        lastCleaned: 0n,
        lockUntil: 0
    };
    
    // Create a message to update the multisig wallet
    // Note: This would typically require a special admin message or governance action
    // Here we're just preparing the data that would be needed
    
    console.log('\nPrepared new multisig configuration with updated oracle keys.');
    console.log('To update the multisig contract, you need to:');
    console.log('1. Create a new MultisigWallet contract with the updated configuration');
    console.log('2. Transfer ownership and funds from the old contract to the new one');
    console.log('3. Update references to the multisig wallet in other contracts');
    
    // Save the updated configuration for reference
    const updatedConfigPath = path.join(__dirname, '../../deployment', `updated_multisig_config_${Date.now()}.json`);
    fs.writeFileSync(updatedConfigPath, JSON.stringify({
        multisigAddress: multisigAddress.toString(),
        multisigConfig: {
            walletId: newConfig.walletId,
            n: newConfig.n,
            k: newConfig.k,
            oracles: Array.from({ length: n }, (_, i) => {
                return {
                    index: i,
                    publicKey: oracleKeys[i].toString(16)
                };
            })
        }
    }, null, 2));
    
    console.log(`\nUpdated configuration saved to: ${updatedConfigPath}`);
    
    // For a real implementation, you would deploy a new multisig contract with the updated keys
    // const newMultisig = provider.open(
    //     MultisigWallet.createFromConfig(newConfig, multisigCode)
    // );
    // await newMultisig.sendDeploy(provider.sender(), toNano('0.5'));
    // console.log(`New MultisigWallet deployed at address: ${newMultisig.address}`);
} 