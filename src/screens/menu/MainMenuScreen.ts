import {Align, ViewUtils} from "../../base/utils/ViewUtils";
import {Easing} from "@tweenjs/tween.js";
import {GameScreen} from "../../base/GameScreen.ts";
import type {Button} from "../../base/flump/display/Button.ts";
import {AssetsLoader} from "../../services/assets/AssetsLoader.ts";
import {Main} from "../../main.ts";
import {SoundService} from "../../services/SoundService.ts";
import {SlotsScreen} from "../slots/SlotsScreen.ts";

export class MainMenuScreen extends GameScreen {

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

  private createPlayButton() {
    let content = this.assetsLoader!.getFlumpLib('menu').createContainer('screen_content');
    ViewUtils.alignPivot(content);
    ViewUtils.fitToHeight(content, Main.fixedStageHeight * 0.6, true, true);
    content.x = Main.fixedStageWidth / 2;
    content.y = Main.fixedStageHeight / 2 - Main.adapt(100);
    this.addChild(content);

    let btnPlay = content.getContainerByLabel('btn_play') as Button;
    btnPlay.setText('Play');
    btnPlay.shouldClickOnlyOnce = true;
    btnPlay.clickCallback = this.onPlayGameTouchedHandler.bind(this);
    ViewUtils.alignPivot(btnPlay, Align.CENTER, Align.TOP);
    btnPlay.startPulsating(0.02);
    btnPlay.startShimmer(this.assetsLoader!.getTextureByName('shimmer')!);

    btnPlay.alpha = 0;
    Main.juggler.tween(btnPlay, 0.3, {
      alpha: 1
    }).delay(0.3).start();

    let logo = content.getContainerByLabel('logo_container');
    logo.alpha = 0;

    Main.juggler.tween(logo, 0.3, {
      alpha: 1
    }).delay(0.3).start();

    Main.juggler.tween(logo, 3, {
      y: logo.y + Main.adapt(30),
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
