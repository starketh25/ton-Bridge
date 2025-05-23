import { toNano, Address } from '@ton/core';
import { TonClient } from '@ton/ton';
import { NetworkProvider } from '@ton/blueprint';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * This script ensures all contracts have sufficient funds to operate
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

// Ask for confirmation before sending funds
async function askForConfirmation(message: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
        rl.question(`${message} (y/n): `, resolve);
    });
    
    rl.close();
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

export async function run(provider: NetworkProvider) {
    // Load deployment info
    const deploymentInfo = loadLatestDeployment();
    
    // Create a TonClient to check balances
    const client = new TonClient({
        endpoint: process.env.TON_ENDPOINT || 'https://toncenter.com/api/v2/jsonRPC',
        apiKey: process.env.TON_API_KEY
    });
    
    // Define the contracts and their required balances
    const contracts = [
        {
            name: 'JettonBridge',
            address: deploymentInfo.contracts.bridgeAddress,
            requiredBalance: toNano('5') // 5 TON
        },
        {
            name: 'MultisigWallet',
            address: deploymentInfo.contracts.multisigAddress,
            requiredBalance: toNano('10') // 10 TON
        },
        {
            name: 'VotesCollector',
            address: deploymentInfo.contracts.votesCollectorAddress,
            requiredBalance: toNano('3') // 3 TON
        }
    ];
    
    console.log('Checking contract balances...');
    
    // Check each contract's balance and fund if necessary
    for (const contract of contracts) {
        const address = Address.parse(contract.address);
        const balance = await client.getBalance(address);
        const balanceInTON = Number(balance) / 1e9;
        const requiredBalanceInTON = Number(contract.requiredBalance) / 1e9;
        
        console.log(`${contract.name} (${address}):`);
        console.log(`  Current balance: ${balanceInTON.toFixed(2)} TON`);
        console.log(`  Required balance: ${requiredBalanceInTON.toFixed(2)} TON`);
        
        if (balance < contract.requiredBalance) {
            const difference = contract.requiredBalance - balance;
            const differenceInTON = Number(difference) / 1e9;
            
            console.log(`  Needs additional ${differenceInTON.toFixed(2)} TON`);
            
            const shouldFund = await askForConfirmation(`Do you want to fund this contract with ${differenceInTON.toFixed(2)} TON?`);
            
            if (shouldFund) {
                console.log(`  Sending ${differenceInTON.toFixed(2)} TON to ${contract.name}...`);
                
                await provider.sender().send({
                    to: address,
                    value: difference,
                    bounce: false
                });
                
                console.log('  Transaction sent. Please check the balance after confirmation.');
            } else {
                console.log('  Skipping funding for this contract.');
            }
        } else {
            console.log('  ✓ Contract has sufficient funds');
        }
        
        console.log('');
    }
    
    console.log('Contract funding check completed.');
    console.log('Note: It\'s important to monitor contract balances regularly to ensure they have enough funds to operate.');
} 