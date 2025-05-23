import { NetworkProvider } from '@ton/blueprint';

/**
 * This script provides a unified interface to set up the TON Bridge system
 */

export async function run(provider: NetworkProvider) {
    console.log('TON Bridge Setup');
    console.log('===============\n');
    
    console.log('This script will guide you through the process of setting up your TON Bridge system.');
    console.log('Please follow the steps below:\n');
    
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
    
    console.log('For detailed instructions, please refer to the README.md file in the setupBridge directory.');
    console.log('For more information about each step, check the individual script files.');
} 