import {GameDispatcher} from "../../../base/GameDispatcher.ts";

// @ts-ignore
export enum SymbolType {
    low_1 = 'l1',
    low_2 = 'l2',
    low_3 = 'l3',
    low_4 = 'l4',
    low_5 = 'l5',
    low_6 = 'l6',

    high_1 = 'high_1',
    high_2 = 'high_2',
    high_3 = 'high_3',
    high_4 = 'high_4',

    wild = 'wild',
    scatter = 'scatter',
    bonus = 'bonus',
}

export interface ISlotsConfigState {
    get reelCount():number;
    get symbolCount():number;
    get reelSpeed():number;
}

export class SlotsConfigModel implements ISlotsConfigState {

    public readonly reelCountChange = new GameDispatcher();
    public readonly symbolCountChange = new GameDispatcher();
    public readonly reelSpeedChange = new GameDispatcher();

    private _reelCount = 5;
    private _symbolCount = 5;
    private _reelSpeed = 1500;

    get reelSpeed() {
        return this._reelSpeed;
    }

    set reelSpeed(speedCount: number) {
        if(speedCount !== this._reelSpeed) {
            this._reelSpeed = speedCount;
            this.reelSpeedChange.dispatch();
        }
    }

    get reelCount() {
        return this._reelCount;
    }

    set reelCount(reelCount: number) {
        if(reelCount !== this._reelCount && reelCount <= 10 && reelCount >= 5) {
            this._reelCount = reelCount;
            this.reelCountChange.dispatch();
        }
    }

    get symbolCount() {
        return this._symbolCount;
    }

    set symbolCount(symbolCount: number) {
        if(symbolCount !== this._symbolCount && symbolCount <= 5 && symbolCount >= 3) {
            this._symbolCount = symbolCount;
            this.symbolCountChange.dispatch();
        }
    }
}