import {GameView} from "../../../../base/GameView.ts";
import  {type SlotsViewFactory} from "../../factory/SlotsViewFactory.ts";
import  {type SymbolView} from "./SymbolView.ts";
import  {type SymbolType} from "../../model/SlotsConfigModel.ts";
import {SlotsStateModel} from "../../model/SlotsStateModel.ts";
import type {GameTween} from "../../../../base/GameJuggler.ts";
import {Main} from "../../../../main.ts";
import * as PIXI from 'pixi.js';
import {GameObject} from "../../../../base/GameObject.ts";
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

export class SlotsReelView extends GameView {

    viewFactory:SlotsViewFactory;

    private _reelsSymbolViews:ReelSymbolView[] = [];
    private _spinTween:GameTween | null = null;
    private _initialReelHeight = 0

    private _totalTweenDistance = 0;
    private _currentTweenDistance = 0;
    private _prevCurrentTweenDIstance = 0;

    constructor(viewFactory:SlotsViewFactory) {
        super();
        this.viewFactory = viewFactory;
    }

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

        this._initialReelHeight = this.height;

        const mask = new PIXI.Graphics()
            .beginFill(0xffffff)
            .drawRect(0, 0, this.width, this.height)
            .endFill();
        this.mask = mask;
        this.addChild(mask);

        // в самый низ добавляем дополнительный символ чтобы при анимации поставить его на место верхнего
        let overlaySymbolView = new ReelSymbolView(this.viewFactory);
        overlaySymbolView.setSymbolType(SlotsStateModel.getRandomSymbolType());
        overlaySymbolView.y = this.height;
        this.addChild(overlaySymbolView);
        this._reelsSymbolViews.push(overlaySymbolView);
    }

    public showSpinAnimation(duration:number, speedPixelsPerSecond:number, completeSymbols:SymbolType[], onComplete:(reelView:SlotsReelView) => void) {

        // высота символа
        let reelViewHeight = this._reelsSymbolViews[0].height;
        // символы которые нужно добавить вконце при завершении анимации (то что получили от сервера после нажатия на спин)
        let spinCompleteSymbols = completeSymbols.slice();
        // финишная дистанция для completeSymbols
        let spinCompleteAnimDistance = reelViewHeight * completeSymbols.length;

        // вычисляем полную дистанцию, которое пройдет рил за это время и при этой скорости
        this._totalTweenDistance = Math.max(duration * speedPixelsPerSecond, spinCompleteAnimDistance);

        // делаем дистанцию, чтобы она была кратной высоте символов, чтобы символы при анимации останавливались четко в рамках рила
        this._totalTweenDistance -= this._totalTweenDistance % reelViewHeight;

        // у нас есть гетер и сетер для currentTweenDistance, таким образом можно через твин анимировать это проперти
        this._currentTweenDistance = -this._totalTweenDistance;
        this._prevCurrentTweenDIstance = this._currentTweenDistance;

        this._spinTween?.destroy();

        this._spinTween = Main.juggler.tween(this, duration, {
            currentTweenDistance: 0,
        })
            .onUpdate(() => {
                // расчитываем шаг. на какое значение поменялось currentTweenDistance с предыдущего update - это будет растояние на которое сдвинуть рил
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
                    // если символ вышел за границы
                    if (reelSymbolView.y >= this._initialReelHeight) {
                        // если осталась дистанция только для финишных символов - то втсавляем их один за другим
                        if (spinCompleteSymbols.length && Math.abs(this.currentTweenDistance) <= spinCompleteAnimDistance) {
                            reelSymbolView.setSymbolType(spinCompleteSymbols.pop()!);
                        }
                        // иначе просто меняем символ на рандомный
                        else {
                            reelSymbolView.setSymbolType(SlotsStateModel.getRandomSymbolType());
                        }
                        // находим первый символ сверху и перед ним ставим этот
                        let topmostReel = this.getTopReelView();
                        reelSymbolView.y = topmostReel.y - reelSymbolView.height;
                    }
                }

                // сортируем символы по высоте ()
                this._reelsSymbolViews.sort((a, b) => a.y - b.y);
            })
            .easing(Easing.Cubic.Out)
            .onComplete(() => {
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