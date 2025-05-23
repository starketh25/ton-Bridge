import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type JettonBridgeConfig = {
    collectorAddress: Address;
    jettonMinterCode: Cell;
    jettonWalletCode: Cell;
};

export function jettonBridgeConfigToCell(config: JettonBridgeConfig): Cell {
    return beginCell()
        .storeAddress(config.collectorAddress)
        .storeRef(config.jettonMinterCode)
        .storeRef(config.jettonWalletCode)
        .endCell();
}

export class JettonBridge implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new JettonBridge(address);
    }

    static createFromConfig(config: JettonBridgeConfig, code: Cell, workchain = 0) {
        const data = jettonBridgeConfigToCell(config);
        const init = { code, data };
        return new JettonBridge(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    // Get methods
    async getMinterAddress(provider: ContractProvider, wrappedTokenData: Cell) {
        const result = await provider.get('get_minter_address', [
            { type: 'cell', cell: wrappedTokenData }
        ]);
        return result.stack.readAddress();
    }

    async getBridgeData(provider: ContractProvider) {
        const result = await provider.get('get_bridge_data', []);
        return {
            workchain: result.stack.readNumber(),
            address: result.stack.readNumber(),
            jettonMinterCode: result.stack.readCell(),
            jettonWalletCode: result.stack.readCell(),
            chainId: result.stack.readNumber(),
        };
    }
} 