import {Container} from "../../../base/flump/display/Container.ts";
import type {ISlotsState} from "../model/SlotsStateModel.ts";
import {GameView} from "../../../base/GameView.ts";
import {GameObject} from "../../../base/GameObject.ts";
import type {Placer} from "../../../base/flump/display/Placer.ts";
import type {SlotsViewFactory} from "../factory/SlotsViewFactory.ts";
import {Main} from "../../../main.ts";
import {ReelView} from "./ReelView.ts";

export class SlotsServerResponseView extends Container {

    viewFactory!:SlotsViewFactory;

    private _reelsContainer:GameView | null = null;

    override destroy() {
        super.destroy();
        this.clear();
    }

    build() {
        super.build();

        const placer = this.getChildByLabel('title') as Placer;
        placer.place(Main.text.plainText('Spin server response:', placer.width, placer.height));
        placer.alignCenter();
    }

    clear() {
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
        }

        let placer = this.getChildByLabel('content') as Placer;
        placer
            .place(this._reelsContainer!)
            .fitHeight(true, true)
            .fitWidth(true, false)
            .alignCenter();
    }
}