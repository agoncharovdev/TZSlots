import {SymbolView} from "../views/SymbolView.ts";
import * as PIXI from "pixi.js";
import {SymbolType} from "../model/SlotsConfigModel.ts";
import {GamePool} from "../../../base/GamePool.ts";
import {LibraryFlump} from "../../../base/flump/library/LibraryFlump.ts";
import type {MovieMold} from "../../../base/flump/library/MovieMold.ts";
import {SlotsServerResponseView} from "../views/SlotsServerResponseView.ts";
import {SlotsConfigView} from "../views/SlotsConfigView.ts";
import {SlotsMainView} from "../views/SlotsMainView.ts";

export class SlotsViewFactory extends LibraryFlump {

    private _symbolPools: Map<SymbolType, GamePool> = new Map();

    getFromPool(type: SymbolType) {
        let pool = this.getPoolForSymbol(type);
        return pool.getFromPool() as SymbolView;
    }

    returnToPool(symbolView:SymbolView | null){
        if (symbolView) {
            this.getPoolForSymbol(symbolView.type).returnToPool(symbolView);
        }
    }

    protected createContainerByClassName(className: string, movieMold: MovieMold) {
        let container =  super.createContainerByClassName(className, movieMold);
        if(!container) {
            switch (className) {
                case 'SlotsServerResponseView':
                    container = new SlotsServerResponseView(movieMold, this);
                    break;
                case 'SlotsConfigView':
                    container = new SlotsConfigView(movieMold, this);
                    break;
                case 'SlotsMainView':
                    container = new SlotsMainView(movieMold, this);
                    break;
            }
        }
        return container;
    }

    private getPoolForSymbol(symbolType: SymbolType) {
        let pool = this._symbolPools.get(symbolType);
        if(!pool) {
            pool = new GamePool(()=>{
                return this.createSymbol(symbolType);
            });
            this._symbolPools.set(symbolType, pool);
        }
        return pool;
    }

    createSymbol(type: SymbolType) {
        let symbol = new SymbolView(type);
        let view!:PIXI.Container;
        switch (type) {
            case SymbolType.low_1:
                view = this.create('symbol_low_1');
                break;
            case SymbolType.low_2:
                view = this.create('symbol_low_2');
                break;
            case SymbolType.low_3:
                view = this.create('symbol_low_3');
                break;
            case SymbolType.low_4:
                view = this.create('symbol_low_4');
                break;
            case SymbolType.low_5:
                view = this.create('symbol_low_5');
                break;
            case SymbolType.low_6:
                view = this.create('symbol_low_6');
                break;

            case SymbolType.high_1:
                view = this.create('symbol_high_1');
                break;
            case SymbolType.high_2:
                view = this.create('symbol_high_2');
                break;
            case SymbolType.high_3:
                view = this.create('symbol_high_3');
                break;
            case SymbolType.high_4:
                view = this.create('symbol_high_4');
                break;

            case SymbolType.wild:
                view = this.create('symbol_wild');
                break;
            case SymbolType.scatter:
                view = this.create('symbol_scatter');
                break;
            case SymbolType.bonus:
                view = this.create('symbol_bonus');
                break;
        }
        symbol.addChild(view);
        return symbol;
    }
}