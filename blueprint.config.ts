import { Config } from '@ton/blueprint';

export const config: Config = {};

export const compile = {
    'JettonMinter': {
        lang: 'func',
        targets: ['contracts/func/jetton-bridge/jetton-minter.fc'],
    },
    'JettonWallet': {
        lang: 'func',
        targets: ['contracts/func/jetton-bridge/jetton-wallet.fc'],
    },
    'JettonBridge': {
        lang: 'func',
        targets: ['contracts/func/jetton-bridge/jetton-bridge.fc'],
    },
    'MultisigWallet': {
        lang: 'func',
        targets: ['contracts/func/jetton-bridge/multisig.fc'],
    },
    'VotesCollector': {
        lang: 'func',
        targets: ['contracts/func/jetton-bridge/votes-collector.fc'],
    }
}; 