import {GameScreen} from "../../base/GameScreen.ts";
import {AssetsLoader} from "../../services/assets/AssetsLoader.ts";
import {ViewUtils} from "../../base/utils/ViewUtils.ts";
import {Main} from "../../main.ts";
import {type SlotsConfigView} from "./views/SlotsConfigView.ts";
import {type SlotsMainView} from "./views/main/SlotsMainView.ts";
import {SlotsServerResponseView} from "./views/SlotsServerResponseView.ts";
import {type Button} from "../../base/flump/display/Button.ts";
import {GameObject} from "../../base/GameObject.ts";
import {SlotsScreenController} from "./controllers/SlotsScreenController.ts";
import {SlotsViewFactory} from "./factory/SlotsViewFactory.ts";

export class SlotsScreen extends GameScreen {

    private _screenController:SlotsScreenController | null = null;

    private _slotsViewFactory:SlotsViewFactory | null = null;

    private _btnSpin:Button | null = null;
    private _slotsView:SlotsMainView | null = null;
    private _configView:SlotsConfigView | null = null;
    private _serverResponseView:SlotsServerResponseView | null = null;

    override destroy() {
        super.destroy();
        this._btnSpin = GameObject.destroy(this._btnSpin);
        this._slotsView = GameObject.destroy(this._slotsView);
        this._configView = GameObject.destroy(this._configView);
        this._serverResponseView = GameObject.destroy(this._serverResponseView);
    }

    override async loadAssets(onLoad?: () => void) {
        this._slotsViewFactory = new SlotsViewFactory();

        this._assetsLoader = new AssetsLoader();
        this._assetsLoader.enqueueAtlas('bgBlur');
        this._assetsLoader.enqueueFlumpLib('slots',false, this._slotsViewFactory);
        this._assetsLoader?.loadAssets(onLoad);
    }

    override onAdded(): void {
        super.onAdded();
        this.createBg();
        this.createBgEffect();
        this.initContent();
        this.initControllers();
    }

    override getBgTexture() {
        return this._assetsLoader?.getTextureByName("bgBlur");
    }

    private initContent() {
        let content = this._slotsViewFactory!.createContainer('slots_screen');
        ViewUtils.alignPivot(content);
        ViewUtils.fitToHeight(content, Main.fixedStageHeight * 0.9, true, true);
        content.x = Main.fixedStageWidth / 2;
        content.y = Main.fixedStageHeight / 2;
        this.addChild(content);

        this._btnSpin = content.getContainerByLabel('btn_spin') as Button;
        this._slotsView = content.getContainerByLabel('slots_view') as SlotsMainView;
        this._slotsView!.viewFactory = this._slotsViewFactory!;
        this._configView = content.getContainerByLabel('config_view') as SlotsConfigView;
        this._serverResponseView = content.getContainerByLabel('server_response_view') as SlotsServerResponseView;
        this._serverResponseView!.viewFactory = this._slotsViewFactory!;
    }

    private initControllers() {
        this._screenController = new SlotsScreenController(this);
        this._screenController.init();
    }

    get btnSpin(): Button | null {
        return this._btnSpin;
    }

    get slotsView(): SlotsMainView | null {
        return this._slotsView;
    }

    get configView(): SlotsConfigView | null {
        return this._configView;
    }

    get serverResponseView(): SlotsServerResponseView | null {
        return this._serverResponseView;
    }
}