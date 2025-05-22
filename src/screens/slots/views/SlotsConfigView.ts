import {Container} from "../../../base/flump/display/Container.ts";
import type {Placer} from "../../../base/flump/display/Placer.ts";
import {GameObject} from "../../../base/GameObject.ts";
import {Main} from "../../../main.ts";
import type {ISlotsConfigState} from "../model/SlotsConfigModel.ts";
import {GameDispatcher} from "../../../base/GameDispatcher.ts";
import type {Button} from "../../../base/flump/display/Button.ts";

export class SlotsConfigView extends Container {

    public readonly onReelsMinus = new GameDispatcher();
    public readonly onReelsPlus = new GameDispatcher();
    public readonly onSymbolsMinus = new GameDispatcher();
    public readonly onSymbolsPlus = new GameDispatcher();
    public readonly onSpeedMinus = new GameDispatcher();
    public readonly onSpeedPlus = new GameDispatcher();

    private _reelsCountView: Container | null = null;
    private _symbolsCountView: Container | null = null;
    private _speedCountView: Container | null = null;

    public updateState(state:ISlotsConfigState){
        this.setPlacerText(this._reelsCountView, 'text', state.reelCount);
        this.setPlacerText(this._symbolsCountView, 'text', state.symbolCount);
        this.setPlacerText(this._speedCountView, 'text', state.reelSpeed);
    }

    override destroy() {
        super.destroy();
        this._reelsCountView = GameObject.destroy(this._reelsCountView);
        this._symbolsCountView = GameObject.destroy(this._symbolsCountView);
        this._speedCountView = GameObject.destroy(this._speedCountView);
        GameObject.destroy(this.onReelsMinus);
        GameObject.destroy(this.onReelsPlus);
        GameObject.destroy(this.onSymbolsMinus);
        GameObject.destroy(this.onSymbolsPlus);
        GameObject.destroy(this.onSpeedMinus);
        GameObject.destroy(this.onSpeedPlus);
    }

    build() {
        super.build();

        this._reelsCountView = this.getContainerByLabel('reels_count');
        this._symbolsCountView = this.getContainerByLabel('symbols_count');
        this._speedCountView = this.getContainerByLabel('speed_count');

        this.setPlacerText(this, 'txt_reels', 'Reels Count:');
        this.setPlacerText(this, 'txt_symbols', 'Symbols Count:');
        this.setPlacerText(this, 'txt_speed', 'Speed:');

        this.setButtonDispatcher('btn_reels_minus', this.onReelsMinus);
        this.setButtonDispatcher('btn_reels_plus', this.onReelsPlus);
        this.setButtonDispatcher('btn_symbol_minus', this.onSymbolsMinus);
        this.setButtonDispatcher('btn_symbol_plus', this.onSymbolsPlus);
        this.setButtonDispatcher('btn_speed_minus', this.onSpeedMinus);
        this.setButtonDispatcher('btn_speed_plus', this.onSpeedPlus);
    }

    private setButtonDispatcher(buttonName: string, dispatcher:GameDispatcher): void {
        const button = this.getChildByLabel(buttonName) as Button;
        button.clickCallback = (): void => {
            dispatcher.dispatch();
        }
    }

    private setPlacerText(container:Container | null, placerName: string, txt:string | number): void {
        if (container) {
            const placer = container.getChildByLabel(placerName) as Placer;
            placer.clear();
            placer.place(Main.text.plainText(txt + '', placer.width, placer.height));
            placer.alignCenter();
        }
    }
}