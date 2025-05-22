import {GameView} from "./GameView";
import * as PIXI from "pixi.js";
import {GameObject} from "./GameObject";
import {BackgroundEffect} from "../screens/effects/BackgroundEffect.ts";
import {RectangleUtils, ScaleMode} from "./utils/RectangleUtils.ts";
import {Main} from "../main.ts";
import {AssetsLoader} from "../services/assets/AssetsLoader.ts";

export class GameScreen extends GameView {

  protected _assetsLoader?: AssetsLoader | null;
  protected _bgImage?: PIXI.Sprite | null;
  protected _bgParticleEffect?: BackgroundEffect | null;
  protected _isAdded = false;

  public get assetsLoader() {
    return this._assetsLoader;
  }

  override destroy() {
    super.destroy();
    this._bgImage = GameObject.destroy(this._bgImage);
    this._bgParticleEffect = GameObject.destroy(this._bgParticleEffect);
    this._assetsLoader = GameObject.destroy(this._assetsLoader);
  }

  public onAdded():void {
    this._isAdded = true;
  }

  public async loadAssets(onLoad?: () => void) {
    if (onLoad) {
      onLoad();
    }
  }

  public createBg() {
    this._bgImage = new PIXI.Sprite(this.getBgTexture());
    this._bgImage.interactive = false;

    const launchImageSize = RectangleUtils.fitRectangle(
      new PIXI.Rectangle(0, 0, this._bgImage!.width, this._bgImage!.height),
      new PIXI.Rectangle(0, 0, Main.fixedStageWidth, Main.fixedStageHeight),
      ScaleMode.NO_BORDER
    );

    this._bgImage!.width = launchImageSize.width;
    this._bgImage!.height = launchImageSize.height;
    this.addChild(this._bgImage!);
  }

  protected getBgTexture() {
    return this._assetsLoader?.getTextureByName('bg');
  }

  protected createBgEffect(): void {
    this._bgParticleEffect = new BackgroundEffect(80, this.assetsLoader!.getTextureByName('petal')!);
    this.addChild(this._bgParticleEffect)
  }

}
