import * as PIXI from 'pixi.js';
import type {IDestroy} from "./interfaces.ts";

export class GameSprite extends PIXI.Sprite implements IDestroy {

  public needDestroyTexture = false

  override set interactive(value: boolean) {
    super.interactive = value;
    this.interactiveChildren = value;
  }

  override destroy() {
    if (this.destroyed) {
      return;
    }
    this.removeFromParent();
    super.destroy({
      children: true,

      texture: this.needDestroyTexture,
      textureSource: this.needDestroyTexture,
    });
  }

}
