import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from '@ton/core';

export type VotesCollectorConfig = {
    externalVotings: Dictionary<bigint, Cell>;
};

export function votesCollectorConfigToCell(config: VotesCollectorConfig): Cell {
    return beginCell()
        .storeDict(config.externalVotings)
        .endCell();
}

export class VotesCollector implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new VotesCollector(address);
    }

    static createFromConfig(config: VotesCollectorConfig, code: Cell, workchain = 0) {
        const data = votesCollectorConfigToCell(config);
        const init = { code, data };
        return new VotesCollector(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
    
    // Get methods
    async getExternalVotingData(provider: ContractProvider, votingId: bigint) {
        const result = await provider.get('get_external_voting_data', [
            { type: 'int', value: votingId }
        ]);
        return result.stack.readTuple();
    }
    
    // Message methods
    async sendVoteOnExternalChain(
        provider: ContractProvider, 
        via: Sender, 
        opts: {
            value: bigint;
            queryId: bigint;
            votingId: bigint;
            signature: Buffer;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(5, 32) // op code for vote_on_external_chain
                .storeUint(opts.queryId, 64)
                .storeUint(opts.votingId, 256)
                .storeBuffer(opts.signature)
                .endCell(),
        });
    }
    
    async sendRemoveOutdatedVotings(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryId: bigint;
            externalIds: bigint[];
        }
    ) {
        const idsCell = beginCell();
        for (const id of opts.externalIds) {
            idsCell.storeUint(id, 256);
        }
        
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(6, 32) // op code for remove_outdated_votings
                .storeUint(opts.queryId, 64)
                .storeBuilder(idsCell)
                .endCell(),
        });
    }
} 