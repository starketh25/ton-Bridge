import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { BridgeTonEvm } from '../wrappers/BridgeTonEvm';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('BridgeTonEvm', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('BridgeTonEvm');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let bridgeTonEvm: SandboxContract<BridgeTonEvm>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        bridgeTonEvm = blockchain.openContract(BridgeTonEvm.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await bridgeTonEvm.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: bridgeTonEvm.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and bridgeTonEvm are ready to use
    });
});
