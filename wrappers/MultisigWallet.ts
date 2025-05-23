import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary, DictionaryValue } from '@ton/core';

export type MultisigWalletConfig = {
    walletId: number;
    n: number; // Total number of owners
    k: number; // Required signatures
    ownerInfos: Dictionary<number, { publicKey: bigint; flood: number }>;
    pendingQueries: Dictionary<bigint, Cell>;
    lastCleaned: bigint;
    lockUntil: number;
};

// Define dictionary value types with both serialize and parse functions
const OwnerInfoValue: DictionaryValue<{ publicKey: bigint; flood: number }> = {
    serialize: (src, builder) => {
        builder.storeUint(src.publicKey, 256).storeUint(src.flood, 8);
    },
    parse: (src) => {
        return {
            publicKey: src.loadUintBig(256),
            flood: src.loadUint(8)
        };
    }
};

const PendingQueryValue: DictionaryValue<Cell> = {
    serialize: (src, builder) => {
        builder.storeRef(src);
    },
    parse: (src) => {
        return src.loadRef();
    }
};

export function multisigWalletConfigToCell(config: MultisigWalletConfig): Cell {
    return beginCell()
        .storeUint(config.walletId, 32)
        .storeUint(config.n, 8)
        .storeUint(config.k, 8)
        .storeUint(config.lastCleaned, 64)
        .storeDict(config.ownerInfos, Dictionary.Keys.Uint(8), OwnerInfoValue)
        .storeDict(config.pendingQueries, Dictionary.Keys.BigUint(256), PendingQueryValue)
        .storeUint(config.lockUntil, 32)
        .endCell();
}

export class MultisigWallet implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new MultisigWallet(address);
    }

    static createFromConfig(config: MultisigWalletConfig, code: Cell, workchain = 0) {
        const data = multisigWalletConfigToCell(config);
        const init = { code, data };
        return new MultisigWallet(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
    
    // Get methods
    async getPublicKeys(provider: ContractProvider) {
        const result = await provider.get('get_public_keys', []);
        return result.stack.readCell();
    }
    
    async getNK(provider: ContractProvider) {
        const result = await provider.get('get_n_k', []);
        return {
            n: result.stack.readNumber(),
            k: result.stack.readNumber()
        };
    }
    
    async getLockTimeout(provider: ContractProvider) {
        const result = await provider.get('get_lock_timeout', []);
        return result.stack.readNumber();
    }
} 