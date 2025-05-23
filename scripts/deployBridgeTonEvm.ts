import { toNano } from '@ton/core';
import { BridgeTonEvm } from '../wrappers/BridgeTonEvm';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const bridgeTonEvm = provider.open(BridgeTonEvm.createFromConfig({}, await compile('BridgeTonEvm')));

    await bridgeTonEvm.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(bridgeTonEvm.address);

    // run methods on `bridgeTonEvm`
}
