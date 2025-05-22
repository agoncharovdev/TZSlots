import {GameJuggler, GameTween, type IAnimatable} from "./GameJuggler";
import * as PIXI from 'pixi.js';
import {Easing} from "@tweenjs/tween.js";
import {Main} from "../main.ts";
import {GamePool} from "./GamePool.ts";
import type {IDestroy, IPoolable} from "./interfaces.ts";

export class GameView extends PIXI.Container implements IDestroy, IAnimatable, IPoolable {

  constructor(..._: any[]) {
    super();
    // this.interactive = false;
  }

  public onReturnToPool(): void {
  }

  public onGetFromPool(_: GamePool): void {
  }

  override set interactive(value: boolean) {
    super.interactive = value;
    this.interactiveChildren = value;
  }

  protected get pulsatingDisplayObject(): GameView {
    return this;
  }

  protected _pulsateTween?: GameTween;

  public startPulsating(scaleDiff: number = 0.03, _: number = 0.6) {
    this._pulsateTween?.destroy();
    // console.log(this.pulsatingDisplayObject.scale.x, this.pulsatingDisplayObject.scale.y);

    this._pulsateTween = this.juggler.tween(this.pulsatingDisplayObject, 2, {
      scale: {
        y: this.pulsatingDisplayObject.scale.y - scaleDiff,
        x: this.pulsatingDisplayObject.scale.x - scaleDiff * 3,
      }
    })
      .repeat(Infinity)
      .yoyoFix((t: any) => Easing.Linear.InOut(t)).start();
  }

  public continuePulsating(): void {
    // Main.log('continuePulsating')
    if (this._pulsateTween) {
      this.juggler.addAnimatable(this._pulsateTween);
    }
  }

  public stopPulsating(): void {
    if (this._pulsateTween) {
      this.juggler.removeAnimatable(this._pulsateTween);
    }
  }

  protected _juggler?: GameJuggler;

  public advanceTime(_: number) {
  }

  addToJuggler(): void {
    this.juggler?.addAnimatable(this);
  }

  removeFromJuggler() {
    this.juggler?.removeAnimatable(this);
  }

  onRemovedFromJuggler() {
  }

  public get juggler() {
    return this._juggler || Main.juggler;
  }

  public set juggler(value: GameJuggler) {
    this._juggler = value;
  }


  destroyChildren() {
    while (this.children.length > 0) {
      const child = this.removeChildAt(0);
      if ('destroy' in child && typeof child.destroy === 'function') {
        child.destroy({ children: true });
      }
    }
  }

  override destroy() {
    if (this.destroyed) {
      return;
    }
    this._pulsateTween?.destroy();
    this.removeFromJuggler();
    this.removeFromParent();
    this.destroyChildren();
    super.destroy({
      children: true
    });
  }

}
