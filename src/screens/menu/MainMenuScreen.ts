import {Align, ViewUtils} from "../../base/utils/ViewUtils";
import {Easing} from "@tweenjs/tween.js";
import {GameScreen} from "../../base/GameScreen.ts";
import type {Button} from "../../base/flump/display/Button.ts";
import type {Container} from "../../base/flump/display/Container.ts";
import type {GameTween} from "../../base/GameJuggler.ts";
import {AssetsLoader} from "../../services/assets/AssetsLoader.ts";
import {Main} from "../../main.ts";
import {SoundService} from "../../services/SoundService.ts";
import {SlotsScreen} from "../slots/SlotsScreen.ts";

export class MainMenuScreen extends GameScreen {

  private _playBtn?: Button;
  private _logo!: Container;
  private _logoTween?: GameTween;

  override async loadAssets(onLoad?: () => void) {
    this._assetsLoader = new AssetsLoader();
    this._assetsLoader.enqueueAtlas('bg');
    this._assetsLoader.enqueueFlumpLib('menu');
    await this._assetsLoader?.loadAssets(onLoad);
  }

  override onAdded(): void {
    this.createBg();
    this.createBgEffect();
    this.createPlayButton();
  }

  override destroy(): void {
    this._playBtn?.destroy();
    this._logo?.destroy();
    this._logoTween?.destroy();
    super.destroy();
  }

  private createPlayButton() {
    let content = this.assetsLoader!.getFlumpLib('menu').createContainer('screen_content');
    ViewUtils.alignPivot(content);
    content.x = Main.fixedStageWidth / 2;
    content.y = Main.fixedStageHeight / 2 - Main.adapt(100);
    this.addChild(content);

    this._playBtn = content.getContainerByLabel('btn_play') as Button;
    this._playBtn.setText('Play');
    this._playBtn.shouldClickOnlyOnce = true;
    this._playBtn.clickCallback = this.onPlayGameTouchedHandler.bind(this);
    ViewUtils.alignPivot(this._playBtn, Align.CENTER, Align.TOP);
    this._playBtn.startPulsating(0.02);
    this._playBtn.startShimmer(this.assetsLoader!.getTextureByName('shimmer')!);

    this._playBtn.alpha = 0;
    Main.juggler.tween(this._playBtn, 0.3, {
      alpha: 1
    }).delay(0.3).start();

    this._logo = content.getContainerByLabel('logo_container');
    this._logo.alpha = 0;

    Main.juggler.tween(this._logo, 0.3, {
      alpha: 1
    }).delay(0.3).start();

    this._logoTween = Main.juggler.tween(this._logo, 3, {
      y: this._logo.y + Main.adapt(30),
    }).repeat(Infinity)
      .yoyoFix((t:any) => Easing.Linear.InOut(t))
      .repeatDelay(0).start();
  }

  private onPlayGameTouchedHandler(): void {
    setTimeout(() => {
      void Main.sound.playSound(SoundService.Click);
      void Main.rootNavigator.changeScreen(new SlotsScreen());
    }, 200);
  }

}
