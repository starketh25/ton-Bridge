/**
 * TON Bridge Setup Scripts
 * 
 * This directory contains scripts to set up and configure the TON Bridge system.
 * Follow these steps in order to complete the setup:
 * 
 * 1. Configure blockchain parameters (script 1)
 * 2. Configure oracle keys (script 2)
 * 3. Fund contracts (script 3)
 * 4. Connect EVM side (script 4)
 * 
 * To run each script, use the following command:
 * 
 * ```
 * npx blueprint run setupBridge/1-configureBlockchainParams
 * npx blueprint run setupBridge/2-configureOracleKeys
 * npx blueprint run setupBridge/3-fundContracts
 * npx blueprint run setupBridge/4-connectEVMSide
 * ```
 * 
 * Make sure to run them in order and follow the instructions provided by each script.
 */

import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    console.log('TON Bridge Setup Instructions');
    console.log('============================\n');
    
    console.log('This is a guide to set up your TON Bridge system.');
    console.log('Please run each script in the following order:\n');
    
    console.log('1. Configure blockchain parameters:');
    console.log('   npx blueprint run setupBridge/1-configureBlockchainParams');
    console.log('   - This will set up the bridge configuration in TON blockchain config parameter #79\n');
    
    console.log('2. Configure oracle keys:');
    console.log('   npx blueprint run setupBridge/2-configureOracleKeys');
    console.log('   - This will configure the real oracle public keys in the multisig contract\n');
    
    console.log('3. Fund contracts:');
    console.log('   npx blueprint run setupBridge/3-fundContracts');
    console.log('   - This will ensure all contracts have sufficient funds\n');
    
    console.log('4. Connect EVM side:');
    console.log('   npx blueprint run setupBridge/4-connectEVMSide');
    console.log('   - This will help you connect the EVM side of the bridge\n');
    
    console.log('For more information, refer to the documentation in each script file.');
} 