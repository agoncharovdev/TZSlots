import {GameView} from "../../../base/GameView.ts";
import type {SymbolType} from "../model/SlotsConfigModel.ts";

export class SymbolView extends GameView {

    private _type!: SymbolType;

    constructor(symbolType:SymbolType) {
        super();
        this._type = symbolType;
        console.log('symbolView');
    }

    get type() {
        return this._type;
    }

    onReturnToPool() {
        this.removeFromParent();
    }
}