import { toNano, Address, beginCell, Cell } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This script sets up the bridge configuration in TON blockchain config parameter #79
 * 
 * Note: This requires validator permissions to update blockchain config parameters
 * For testnet/mainnet, you'll need to submit a proposal that validators will vote on
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

// Create the bridge configuration cell for parameter #79
function createBridgeConfigCell(deploymentInfo: any): Cell {
    const {
        contracts: { bridgeAddress, multisigAddress, votesCollectorAddress },
        configParameters: {
            myChainId,
            bridgeBurnFee,
            bridgeMintFee,
            walletMinTonsForStorage,
            walletGasConsumption,
            minterMinTonsForStorage,
            discoverGasConsumption,
            stateFlags
        }
    } = deploymentInfo;

    return beginCell()
        // Bridge parameters
        .storeUint(myChainId, 32) // chain_id
        .storeAddress(Address.parse(bridgeAddress))
        .storeAddress(Address.parse(multisigAddress))
        .storeAddress(Address.parse(votesCollectorAddress))
        // Fee parameters
        .storeCoins(BigInt(bridgeBurnFee))
        .storeCoins(BigInt(bridgeMintFee))
        .storeCoins(BigInt(walletMinTonsForStorage))
        .storeCoins(BigInt(walletGasConsumption))
        .storeCoins(BigInt(minterMinTonsForStorage))
        .storeCoins(BigInt(discoverGasConsumption))
        .storeUint(stateFlags, 8)
        .endCell();
}

export async function run(provider: NetworkProvider) {
    const deploymentInfo = loadLatestDeployment();
    const bridgeConfigCell = createBridgeConfigCell(deploymentInfo);
    
    console.log('Bridge configuration cell created successfully');
    console.log('Cell BOC (Base64):', bridgeConfigCell.toBoc().toString('base64'));
    
    console.log('\nIMPORTANT: To update parameter #79, you need validator permissions.');
    console.log('For testnet/mainnet, submit this configuration as a proposal for validators to vote on.');
    console.log('For a local network where you control the validators, you can use the following:');
    
    console.log(`\nExample validator-console.fif command:
    "config.param#79" $>smca <b
      ${deploymentInfo.configParameters.myChainId} 32 u,
      "${deploymentInfo.contracts.bridgeAddress}" $>smca addr,
      "${deploymentInfo.contracts.multisigAddress}" $>smca addr,
      "${deploymentInfo.contracts.votesCollectorAddress}" $>smca addr,
      ${deploymentInfo.configParameters.bridgeBurnFee} Gram,
      ${deploymentInfo.configParameters.bridgeMintFee} Gram,
      ${deploymentInfo.configParameters.walletMinTonsForStorage} Gram,
      ${deploymentInfo.configParameters.walletGasConsumption} Gram,
      ${deploymentInfo.configParameters.minterMinTonsForStorage} Gram,
      ${deploymentInfo.configParameters.discoverGasConsumption} Gram,
      ${deploymentInfo.configParameters.stateFlags} 8 u,
    b> set_param
    `);
    
    // For a real implementation with validator permissions:
    // const result = await setConfigParam79(provider, bridgeConfigCell);
    // console.log('Parameter #79 updated successfully:', result);
}

// Note: This is a placeholder for the actual implementation
// In a real scenario, this would involve creating and submitting a configuration proposal
async function setConfigParam79(provider: NetworkProvider, configCell: Cell) {
    // This would require validator permissions and would typically be done through
    // a governance mechanism like a proposal that validators vote on
    console.log('Setting config parameter #79 would be implemented here');
    return { success: true, message: 'Config parameter #79 updated' };
} 