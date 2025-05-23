import {GameObject} from "../../../base/GameObject.ts";
import type {SlotsScreen} from "../SlotsScreen.ts";
import {SlotsConfigModel} from "../model/SlotsConfigModel.ts";
import {Main} from "../../../main.ts";
import {SlotsStateModel} from "../model/SlotsStateModel.ts";
import {SoundService} from "../../../services/SoundService.ts";

// @ts-ignore
export enum SpinState {
    idle, spinning, stopping
}

export class SlotsScreenController extends GameObject {

    private _configModel = new SlotsConfigModel();
    private _stateModel = new SlotsStateModel();
    private _view:SlotsScreen;
    private _spinState = SpinState.stopping;

    constructor(view:SlotsScreen) {
        super();
        this._view = view;
        this._stateModel.reelsState = SlotsStateModel.generateRandomReelsState(this._configModel);
    }

    public init() {
        this._configModel.reelCountChange.add(this.onSlotConfigChange, this);
        this._configModel.symbolCountChange.add(this.onSlotConfigChange, this);
        this._configModel.reelSpeedChange.add(this.onSlotConfigChange, this);

        this._view.slotsView!.updateState(this._stateModel);
        this._view.configView!.updateState(this._configModel);

        this._view.configView!.onReelsMinus.add(()=> {
            this._configModel.reelCount -= 1;
        }, this);
        this._view.configView!.onReelsPlus.add(()=> {
            this._configModel.reelCount += 1;
        }, this);
        this._view.configView!.onSymbolsMinus.add(()=> {
            this._configModel.symbolCount -= 1;
        }, this);
        this._view.configView!.onSymbolsPlus.add(()=> {
            this._configModel.symbolCount += 1;
        }, this);
        this._view.configView!.onSpeedMinus.add(()=> {
            this._configModel.reelSpeed -= 100;
        }, this);
        this._view.configView!.onSpeedPlus.add(()=> {
            this._configModel.reelSpeed += 100;
        }, this);

        this.spinState = SpinState.idle;
    }

    set spinState(value:SpinState) {
        if(this._spinState !== value) {
            this._spinState = value;
            this._view.btnSpin!.clickCallback = (this._spinState == SpinState.idle) ? this.doSpin.bind(this) : null;
            this._view.btnSpin!.isEnabled = (this._spinState == SpinState.idle);
        }
    }

    private async doSpin() {
        if (this._spinState == SpinState.idle) {
            Main.sound.playSound(SoundService.Click);
            this._view.serverResponseView?.clear();
            this.spinState = SpinState.spinning;

            let responseSpinState = await Main.server.getUserSpinResponse(this._configModel);
            this._stateModel.reelsState = responseSpinState;
            this._view.serverResponseView!.updateState(this._stateModel);
            // this._view.slotsView!.updateState(this._stateModel);
            this._view.slotsView!.spin(
                responseSpinState,
                Main.adapt(this._configModel.reelSpeed),
                () => {
                    this.spinState = SpinState.idle;
                });
        }
    }

    private onSlotConfigChange() {
        this._view.serverResponseView?.clear();
        this._stateModel.reelsState = SlotsStateModel.generateRandomReelsState(this._configModel);

        this._view.configView?.updateState(this._configModel);
        this._view.slotsView!.updateState(this._stateModel);
        this.spinState = SpinState.idle;
    }
}