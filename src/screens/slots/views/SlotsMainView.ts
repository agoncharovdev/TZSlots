import {Container} from "../../../base/flump/display/Container.ts";
import type {SlotsViewFactory} from "../factory/SlotsViewFactory.ts";
import {GameObject} from "../../../base/GameObject.ts";
import {GameView} from "../../../base/GameView.ts";
import type {Placer} from "../../../base/flump/display/Placer.ts";
import {type ISlotsState, ReelState} from "../model/SlotsStateModel.ts";
import {ReelView} from "./ReelView.ts";
import {ArrayUtils} from "../../../base/utils/ArrayUtils.ts";
import {MathUtils} from "../../../base/utils/MathUtils.ts";
import {FuncUtil} from "../../../base/utils/FuncUtil.ts";

export class SlotsMainView extends Container {

    viewFactory!:SlotsViewFactory;

    private _reelsContainer:GameView | null = null;
    private _reels:ReelView[] = [];
    private _spinningReels:ReelView[] = [];
    private _onReelsSpinEnd:(()=>void) | null = null;

    override destroy() {
        super.destroy();
        this.clear();
    }

    clear() {
        GameObject.destroy(this._reels);
        this._reelsContainer = GameObject.destroy(this._reelsContainer);
    }

    public updateState(state:ISlotsState){
        this.clear();

        this._reelsContainer = new GameView();

        for (const reel of state.reelsState) {
            let reelView = new ReelView(this.viewFactory);
            reelView.setInitialSymbols(reel.symbols);
            reelView.x = this._reelsContainer.width;
            this._reelsContainer?.addChild(reelView);
            this._reels.push(reelView);
        }

        let placer = this.getChildByLabel('slots') as Placer;
        placer
            .place(this._reelsContainer!)
            .fitHeight(true, true)
            .fitWidth(true, false)
            .alignCenter();
    }

    public spin(endReelStates:ReelState[], speedPixelsPerSecond:number, onSpinEnd:() => void) {
        this._onReelsSpinEnd = onSpinEnd;
        this._spinningReels = this._reels.slice();
        for (let i = 0; i < this._reels.length; i++) {
            let reel = this._reels[i];
            reel.showSpinAnimation(
                MathUtils.getRandomNumber(1, 5),
                speedPixelsPerSecond,
                endReelStates[i].symbols,
                this.onReelAnimationEnd.bind(this)
            );

        }
    }

    private onReelAnimationEnd(reel: ReelView) {
        ArrayUtils.remove(this._spinningReels, reel);
        if (!this._spinningReels.length) {
            FuncUtil.call(this._onReelsSpinEnd);
        }
    }

}