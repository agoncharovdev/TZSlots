import {type ISlotsConfigState, SymbolType} from "./SlotsConfigModel.ts";

export interface ISlotsState {
    get reelsState():ReelState[];
    set reelsState(value: ReelState[]);
}

export class ReelState {
    readonly symbols: SymbolType[] = [];
    constructor(symbols: SymbolType[]) {
        this.symbols = symbols;
    }
}

export class SlotsStateModel implements ISlotsState {

    private _reelsState: ReelState[] = [];

    get reelsState(): ReelState[] {
        return this._reelsState;
    }

    set reelsState(value: ReelState[]) {
        this._reelsState = value;
    }

    static generateRandomReelsState(config: ISlotsConfigState) {
        let reels: ReelState[] = [];
        for (let i = 0; i < config.reelCount; i++) {
            let symbols: SymbolType[] = [];
            for (let j = 0; j < config.symbolCount; j++) {
                symbols.push(this.getRandomSymbolType());
            }
            reels.push(new ReelState(symbols));
        }
        return reels;
    }

    static getRandomSymbolType() {
        const values = Object.values(SymbolType);
        const index = Math.floor(Math.random() * values.length);
        return values[index] as SymbolType;
    }
}