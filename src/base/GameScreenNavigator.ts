import {GameScreen} from './GameScreen';
import {GameDispatcher} from './GameDispatcher';
import {GameObject} from "./GameObject";
import {GameView} from "./GameView.ts";

export class GameScreenNavigator extends GameScreen {

  public onScreenChanged = new GameDispatcher(this);

  protected _isScreenChangingProcess: boolean = false;
  protected _screenLayer = new GameView();
  protected _incomingScreen: GameScreen | null = null;

  constructor() {
    super();
    this.addChild(this._screenLayer);
  }

  protected _currentScreen: GameScreen | null = null;

  public get currentScreen(): GameScreen | null {
    return this._currentScreen;
  }

  public get isLoadingIncomingScreen(): boolean {
    return Boolean(this._incomingScreen);
  }

  override destroy(): void {
    super.destroy();
    GameObject.destroy(this.onScreenChanged);
    GameObject.destroy(this._screenLayer);
    GameObject.destroy(this._incomingScreen);
  }

  public async changeScreen(screen: GameScreen) {
    if (this.destroyed) {
      return;
    }
    if (this._incomingScreen || this._isScreenChangingProcess) {
      return;
    }

    this._incomingScreen = screen;
    this._isScreenChangingProcess = true;

    this.loadIncomingScreen();
  }

  protected loadIncomingScreen(): void {
    if (this._currentScreen) {
      this._currentScreen = GameObject.destroy(this._currentScreen);
    }
    if (this._incomingScreen) {
      setTimeout(() => this._incomingScreen?.loadAssets(this.onIncomingScreenLoaded.bind(this)), 50); // time for GC
    }
  }

  protected onIncomingScreenLoaded(): void {
    this._currentScreen = this._incomingScreen;
    this._isScreenChangingProcess = false;
    this._incomingScreen = null;

    if (this.currentScreen) {
      this._screenLayer.addChild(this.currentScreen);
      this.currentScreen.onAdded();
      this.onScreenChanged.dispatch();
    }

    // if (DeviceManager.isLowMemory()) {
    //   this.showDialog(new ErrorDialog(Locale.getText(Locale.low_device_memory)));
    // }
  }
}
