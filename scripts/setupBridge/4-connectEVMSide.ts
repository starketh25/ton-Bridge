import { Address } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * This script provides guidance on connecting the EVM side of the bridge
 * 
 * Note: The actual EVM side implementation will depend on the specific Ethereum
 * network you're connecting to and the smart contracts you're using there.
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

// Ask for EVM network details
async function askForEVMDetails(): Promise<{
    network: string;
    chainId: number;
    rpcUrl: string;
    bridgeContractAddress: string;
}> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const network = await new Promise<string>((resolve) => {
        rl.question('Enter EVM network name (e.g., Ethereum, BSC, Polygon): ', resolve);
    });
    
    const chainId = await new Promise<number>((resolve) => {
        rl.question('Enter EVM chain ID (e.g., 1 for Ethereum Mainnet): ', (answer) => {
            resolve(parseInt(answer));
        });
    });
    
    const rpcUrl = await new Promise<string>((resolve) => {
        rl.question('Enter EVM RPC URL: ', resolve);
    });
    
    const bridgeContractAddress = await new Promise<string>((resolve) => {
        rl.question('Enter EVM bridge contract address (0x format): ', resolve);
    });
    
    rl.close();
    
    return {
        network,
        chainId,
        rpcUrl,
        bridgeContractAddress
    };
}

export async function run(provider: NetworkProvider) {
    // Load deployment info
    const deploymentInfo = loadLatestDeployment();
    
    console.log('TON Bridge Deployment Information:');
    console.log(`- Bridge Address: ${deploymentInfo.contracts.bridgeAddress}`);
    console.log(`- Multisig Address: ${deploymentInfo.contracts.multisigAddress}`);
    console.log(`- Votes Collector Address: ${deploymentInfo.contracts.votesCollectorAddress}`);
    console.log(`- Chain ID: ${deploymentInfo.configParameters.myChainId}`);
    
    console.log('\nTo connect the EVM side of the bridge, you will need to:');
    console.log('1. Deploy the corresponding bridge contract on the EVM network');
    console.log('2. Configure the EVM bridge with the TON bridge information');
    console.log('3. Set up the oracle services to monitor both chains');
    console.log('4. Test the bridge with small transfers before full deployment');
    
    console.log('\nWould you like to provide information about the EVM side of the bridge?');
    
    // Get EVM details
    const evmDetails = await askForEVMDetails();
    
    // Save the bridge configuration
    const bridgeConfig = {
        ton: {
            network: deploymentInfo.network,
            chainId: deploymentInfo.configParameters.myChainId,
            bridgeAddress: deploymentInfo.contracts.bridgeAddress,
            multisigAddress: deploymentInfo.contracts.multisigAddress,
            votesCollectorAddress: deploymentInfo.contracts.votesCollectorAddress
        },
        evm: {
            network: evmDetails.network,
            chainId: evmDetails.chainId,
            rpcUrl: evmDetails.rpcUrl,
            bridgeContractAddress: evmDetails.bridgeContractAddress
        },
        oracles: deploymentInfo.multisigConfig.oracles.map((oracle: any) => ({
            index: oracle.index,
            publicKey: oracle.publicKey
        }))
    };
    
    // Save the bridge configuration
    const configPath = path.join(__dirname, '../../deployment', `bridge_config_${Date.now()}.json`);
    fs.writeFileSync(configPath, JSON.stringify(bridgeConfig, null, 2));
    
    console.log(`\nBridge configuration saved to: ${configPath}`);
    
    console.log('\nNext Steps:');
    console.log('1. Use this configuration to set up your oracle services');
    console.log('2. Ensure the EVM bridge contract is correctly configured with:');
    console.log(`   - TON Chain ID: ${deploymentInfo.configParameters.myChainId}`);
    console.log(`   - TON Bridge Address: ${Address.parse(deploymentInfo.contracts.bridgeAddress).toString()}`);
    console.log('3. Configure the oracle services to monitor both chains');
    console.log('4. Test the bridge with small transfers before allowing larger amounts');
    
    console.log('\nIMPORTANT: The actual implementation of the EVM side depends on your specific requirements.');
    console.log('You may need to develop custom smart contracts for the EVM side of the bridge.');
    console.log('For a production bridge, ensure thorough security audits are conducted on both sides.');
} 