import {GameView} from "../../../base/GameView.ts";
import  {type SlotsViewFactory} from "../factory/SlotsViewFactory.ts";
import  {type SymbolView} from "./SymbolView.ts";
import  {type SymbolType} from "../model/SlotsConfigModel.ts";
import {SlotsStateModel} from "../model/SlotsStateModel.ts";
import type {GameTween} from "../../../base/GameJuggler.ts";
import {Main} from "../../../main.ts";
import * as PIXI from 'pixi.js';
import {GameObject} from "../../../base/GameObject.ts";
import {Easing} from "@tweenjs/tween.js";

export class ReelSymbolView extends GameView {

    viewFactory:SlotsViewFactory;

    private _type: SymbolType | null = null;
    private _symbolView:SymbolView | null = null;

    constructor(viewFactory:SlotsViewFactory) {
        super();
        this.viewFactory = viewFactory;
    }

    override destroy() {
        this.viewFactory.returnToPool(this._symbolView);
        super.destroy();
    }

    setSymbolType(type: SymbolType) {
        if(this._type !== type) {
            this._type = type;
            this.viewFactory.returnToPool(this._symbolView);
            this._symbolView = this.viewFactory.getFromPool(type);
            this.addChild(this._symbolView);
        }
    }
}

export class ReelView extends GameView {

    viewFactory:SlotsViewFactory;

    private _reelsSymbolViews:ReelSymbolView[] = [];
    private _spinTween:GameTween | null = null;
    private _initialHeight = 0

    constructor(viewFactory:SlotsViewFactory) {
        super();
        this.viewFactory = viewFactory;
    }

    private _totalTweenDistance = 0;
    private _prevCurrentTweenDIstance = 0;

    private _currentTweenDistance = 0;
    get currentTweenDistance(): number {
        return this._currentTweenDistance;
    }
    set currentTweenDistance(value: number) {
        this._currentTweenDistance = value;
    }

    override destroy() {
        this._spinTween = GameObject.destroy(this._spinTween);
        GameObject.destroy(this._reelsSymbolViews);
        super.destroy();
    }

    setInitialSymbols(symbols: SymbolType[]) {
        for (const symbol of symbols) {
            let symbolView = new ReelSymbolView(this.viewFactory);
            symbolView.setSymbolType(symbol);
            symbolView.y = this.height;
            this.addChild(symbolView);
            this._reelsSymbolViews.push(symbolView);
        }

        this._initialHeight = this.height;

        const mask = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRect(0, 0, this.width, this.height)
            .endFill();
        this.mask = mask;
        this.addChild(mask);

        let overlaySymbolView = new ReelSymbolView(this.viewFactory);
        overlaySymbolView.setSymbolType(SlotsStateModel.getRandomSymbolType());
        overlaySymbolView.y = this.height;
        this.addChild(overlaySymbolView);
        this._reelsSymbolViews.push(overlaySymbolView);
    }

    public showSpinAnimation(duration:number, speedPixelsPerSecond:number, onCompleteSymbols:SymbolType[], onComplete:(reelView:ReelView) => void) {

        let reelViewHeight = this._reelsSymbolViews[0].height;
        let spinCompleteSymbolsState = onCompleteSymbols.slice();

        // то что получили от сервера после нажатия на спин
        let spinCompleteStateAnimDistance = reelViewHeight * onCompleteSymbols.length;

        // вычисляем полную дистанцию, которое пройдет рил за это время и при этой скорости
        this._totalTweenDistance = Math.max(duration * speedPixelsPerSecond, spinCompleteStateAnimDistance);

        // делаем дистанцию, чтобы она была кратной высоте символов, чтобы символы в риле были четко
        this._totalTweenDistance -= this._totalTweenDistance % reelViewHeight;

        this._currentTweenDistance = -this._totalTweenDistance;
        this._prevCurrentTweenDIstance = this._currentTweenDistance;

        this._spinTween?.destroy();

        this._spinTween = Main.juggler.tween(this, duration, {
            currentTweenDistance: 0,
        })
            .onUpdate(()=>{
                let diff = Math.abs(this._prevCurrentTweenDIstance) - Math.abs(this._currentTweenDistance);
                this._prevCurrentTweenDIstance = this._currentTweenDistance;

                // сначала сдвигаем все символы на расчитанный шаг
                for (let i = 0; i < this._reelsSymbolViews.length; i++) {
                    let reelSymbolView = this._reelsSymbolViews[i];
                    reelSymbolView.y += diff;
                }

                // а потом уже находим того, кто за границей рила и делаем его первым
                for (let i = 0; i < this._reelsSymbolViews.length; i++) {
                    let reelSymbolView = this._reelsSymbolViews[i];
                    if(reelSymbolView.y >=  this._initialHeight) {
                        if (spinCompleteSymbolsState.length && Math.abs(this.currentTweenDistance) < spinCompleteStateAnimDistance) {
                            reelSymbolView.setSymbolType(spinCompleteSymbolsState.pop()!);
                        } else {
                            reelSymbolView.setSymbolType(SlotsStateModel.getRandomSymbolType());
                        }
                        let topmostReel = this.getTopReelView();
                        reelSymbolView.y = topmostReel.y - reelSymbolView.height;
                    }
                }

                // сортируем символы по высоте ()
                this._reelsSymbolViews.sort((a, b) => a.y - b.y);
            })
            .easing(Easing.Cubic.Out)
            .onComplete(()=>{
                onComplete(this);
            })
            .start();
    }

    private getTopReelView(){
        return this._reelsSymbolViews.reduce((topmost, current) => {
            return current.y < topmost.y ? current : topmost;
        });
    }

}