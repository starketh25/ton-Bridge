import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type BridgeTonEvmConfig = {};

export function bridgeTonEvmConfigToCell(config: BridgeTonEvmConfig): Cell {
    return beginCell().endCell();
}

export class BridgeTonEvm implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new BridgeTonEvm(address);
    }

    static createFromConfig(config: BridgeTonEvmConfig, code: Cell, workchain = 0) {
        const data = bridgeTonEvmConfigToCell(config);
        const init = { code, data };
        return new BridgeTonEvm(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
