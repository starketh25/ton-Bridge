import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'func',
    targets: [
        'contracts/func/jetton-bridge/jetton-bridge.fc',
    ],
    sources: {
        'contracts/func/jetton-bridge/jetton-bridge.fc': 'contracts/func/jetton-bridge/jetton-bridge.fc',
        'stdlib.fc': 'contracts/func/jetton-bridge/stdlib.fc',
        'params.fc': 'contracts/func/jetton-bridge/params.fc',
        'op-codes.fc': 'contracts/func/jetton-bridge/op-codes.fc',
        'errors.fc': 'contracts/func/jetton-bridge/errors.fc',
        'messages.fc': 'contracts/func/jetton-bridge/messages.fc',
        'utils.fc': 'contracts/func/jetton-bridge/utils.fc',
        'config.fc': 'contracts/func/jetton-bridge/config.fc',
    }
}; 