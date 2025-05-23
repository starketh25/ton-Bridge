import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, beginCell } from '@ton/core';
import { JettonBridge } from '../wrappers/JettonBridge';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('JettonBridge', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonBridge: SandboxContract<JettonBridge>;
    let jettonMinterCode: Cell;
    let jettonWalletCode: Cell;

    beforeAll(async () => {
        // Compile contracts
        jettonMinterCode = await compile('JettonMinter');
        jettonWalletCode = await compile('JettonWallet');
    });

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');

        // Deploy JettonBridge contract
        const jettonBridgeCode = await compile('JettonBridge');
        jettonBridge = blockchain.openContract(
            JettonBridge.createFromConfig({
                collectorAddress: deployer.address,
                jettonMinterCode,
                jettonWalletCode
            }, jettonBridgeCode)
        );

        const deployResult = await jettonBridge.sendDeploy(deployer.getSender(), toNano('0.05'));
        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonBridge.address,
            deploy: true,
            success: true,
        });
    });

    it('should return correct bridge data', async () => {
        const bridgeData = await jettonBridge.getBridgeData();
        
        expect(bridgeData.workchain).toBe(0); // Assuming workchain is 0
        expect(bridgeData.chainId).toBe(1); // Based on params.fc MY_CHAIN_ID = 1
    });

    it('should calculate correct minter address', async () => {
        // Create a sample wrapped token data cell
        const wrappedTokenData = beginCell()
            .storeUint(1, 32) // chain_id (1 = MY_CHAIN_ID from params.fc)
            .storeUint(123456789, 160) // token_address (160 bits)
            .storeUint(18, 8) // token_decimals (8 bits)
            .endCell();
        
        const minterAddress = await jettonBridge.getMinterAddress(wrappedTokenData);
        
        // The address should be a valid TON address
        expect(minterAddress.toString()).toMatch(/^[0-9A-Z:_-]+$/i);
    });
}); 