import {GameObject} from "./GameObject";
import {Interpolation, Tween} from '@tweenjs/tween.js';
import {Main} from "../main.ts";
import {ArrayUtils} from "./utils/ArrayUtils.ts";
import type {IDestroy} from "./interfaces.ts";

export interface IAnimatable extends IDestroy {
  get juggler(): GameJuggler;

  set juggler(value: GameJuggler);

  advanceTime(delta: number): void;

  addToJuggler(): void;

  removeFromJuggler(): void;

  onRemovedFromJuggler(): void;
}

export class GameDelayCall extends GameObject {

  private readonly _callback: Function;
  private _totalDelta: number = 0;
  private readonly _endDelta: number = 0;

  constructor(juggler: GameJuggler, callback: Function, durationSec: number) {
    super();
    this._juggler = juggler;
    this._callback = callback;
    this._endDelta = durationSec;
  }

  override advanceTime(delta: number) {
    if (this._isDestroyed || !this._juggler) {
      return;
    }
    this._totalDelta += delta;
    if (this._totalDelta >= this._endDelta) {
      this._callback();
      this.destroy();
    }
  }
}

interface TweenBezier {
  startPoint: { x: number; y: number },
  endPoint: { x: number; y: number },
  curviness: number
}

interface TweenParams {
  [key: string]: any;

  bezier?: TweenBezier
}

export class GameTween extends Tween implements IAnimatable, IDestroy {

  private _isDestroyed = false;
  private _juggler: GameJuggler | null = null;
  private _targetObject: IDestroy | null = null;
  private _isCompleted = false;
  private _onComplete: ((object: any) => void) | null = null;

  constructor(target: IDestroy) {
    super(target);
    this._targetObject = target;
    super.onComplete(this.onCompleteInternal.bind(this));
  }

  get targetObject() {
    return this._targetObject;
  }

  addToJuggler(): void {
    this.juggler?.addAnimatable(this);
  }

  removeFromJuggler() {
    this.juggler?.removeAnimatable(this);
  }

  public get juggler() {
    return this._juggler || Main.juggler;
  }

  public set juggler(value: GameJuggler) {
    this._juggler = value;
  }

  public get destroyed(): boolean {
    return this._isDestroyed;
  }

  override start(time?: number, overrideStartingValues?: boolean): this {
    return super.start(time, overrideStartingValues);
  }

  override delay(amount: number): this {
    return super.delay(amount * 1000);
  }

  override repeatDelay(amount: number): this {
    return super.repeatDelay(amount * 1000);
  }

  override stop(): this {
    return super.stop();
  }

  override end(): this {
    return super.end();
  }

  override pause(time?: number): this {
    return super.pause(time ? (time * 1000) : undefined);
  }

  override repeat(times: number): this {
    return super.repeat(times);
  }

  yoyoFix(easingFunction: (amount: number) => number): this {
    return super.easing((t: any) => {
      if (t < 0.5) {
        return easingFunction(2 * t);
      } else {
        return 1 - easingFunction(2 * (t - 0.5));
      }
    });
    // throw new Error("TweenJs bug: https://github.com/tweenjs/tween.js/issues/677#issuecomment-1938289416");
  }

  override easing(easingFunction: (amount: number) => number): this {
    return super.easing(easingFunction);
  }

  override to(props: TweenParams, duration: number): this {
    if (props.bezier) {
      const midPoint = this.calculateMidPoint(props.bezier.startPoint, props.bezier.endPoint, props.bezier.curviness);
      const bezierPath = {
        x: [props.bezier.startPoint.x, midPoint.x, props.bezier.endPoint.x],
        y: [props.bezier.startPoint.y, midPoint.y, props.bezier.endPoint.y],
      };
      delete props.bezier;
      props["x"] = bezierPath.x;
      props["y"] = bezierPath.y;
      this.interpolation(Interpolation.Bezier) // Используем интерполяцию Bezier
    }
    return super.to(props, duration * 1000);
  }

  calculateMidPoint(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    curviness: number
  ): { x: number; y: number } {
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;

    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Смещение средней точки на основе curviness
    const offsetX = -curviness * dy * distance * 0.01;
    const offsetY = curviness * dx * distance * 0.01;

    return {x: midX + offsetX, y: midY + offsetY};
  }

  onRemovedFromJuggler() {
    // if (!this._isDestroyed) {
    //   this.pause();
    //   // App.log('pause');
    // }
  }

  private onCompleteInternal() {
    if (!this._isCompleted) {
      this._isCompleted = true;
      if (this._onComplete) {
        this._onComplete(this._targetObject);
      }
      this.destroy();
    }
  }

  override onComplete(callback?: (object: any) => void): this {
    this._onComplete = callback || null;
    return this;
  }

  advanceTime(_: number) {
    if (!this._juggler) {
      return;
    }
    if (!this._targetObject || this._targetObject.destroyed || this._isCompleted) {
      this.destroy();
      return;
    }
    this.update(Main.pixi.ticker.lastTime);
    // this.update(Main.pixi.ticker.lastTime);
    // this.update();
  }

  destroy() {
    if (!this._isDestroyed) {
      this.removeFromJuggler();
      this.stop();
      this.remove();
      this._isDestroyed = true;
      this._targetObject = null;
      this._juggler = null;
    }
  }
}

export class GameJuggler extends GameObject {

  private _animates: IAnimatable[] = [];

  constructor(parentJuggler?: GameJuggler) {
    super();
    this._juggler = parentJuggler;
  }

  override advanceTime(delta: number) {
    for (let i = this._animates.length - 1; i >= 0; i--) {
      if (this._animates[i]?.destroyed) {
        this.removeAnimatable(this._animates[i]);
      } else {
        this._animates[i]?.advanceTime(delta);
      }
      // App.log(this._animates[i])
    }
  }

  public delayCall(callback: Function, durationSec: number) {
    let delayCall = new GameDelayCall(this, callback, durationSec);
    this._animates?.push(delayCall);
    return delayCall;
  }

  public tween(target: any, duration: number, params: TweenParams) {
    let tween = new GameTween(target);
    this.addAnimatable(tween);
    tween.to(params, duration);
    // App.log(tween);
    return tween;
  }

  public removeTweens(animatable?: IAnimatable | null) {
    if (animatable) {
      for (let i = this._animates.length - 1; i >= 0; i--) {
        const anim = this._animates[i];
        if (anim instanceof GameTween) {
          const tween = anim as GameTween;
          if (tween.targetObject == animatable) {
            tween.destroy();
          }
        }
      }
    }
  }

  public removeAnimatable(animatable?: IAnimatable | null) {
    ArrayUtils.remove(this._animates, animatable);
    if (animatable && !animatable.destroyed) {
      animatable.onRemovedFromJuggler();
    }
  }

  public addAnimatable(animatable: IAnimatable | null) {
    if (animatable && !this._animates?.includes(animatable)) {
      animatable.juggler?.removeAnimatable(animatable);
      animatable.juggler = this;
      this._animates?.push(animatable);
    }
  }

  public purge() {
    while (this._animates?.length) {
      this._animates.pop()?.destroy();
    }
  }

  override destroy() {
    this.purge();
    super.destroy();
  }
}
