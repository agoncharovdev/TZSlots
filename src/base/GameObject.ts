import {GameJuggler, type IAnimatable} from "./GameJuggler";
import * as PIXI from 'pixi.js';
import {Main} from "../main.ts";
import type {IDestroy} from "./interfaces.ts";

const isIDestroy = (obj: any) => {
  return obj &&
    typeof obj.destroy === 'function' &&
    typeof obj.destroyed === 'boolean';
}

export abstract class GameObject implements IDestroy, IAnimatable {

  protected _isDestroyed = false;

  protected _juggler?: GameJuggler;

  public advanceTime(_: number) {
  }

  addToJuggler(): void {
    this.juggler?.addAnimatable(this);
  }

  onRemovedFromJuggler() {

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

  static destroy(object: any) {
    if (!object) {
      return null;
    }

    // first check on interfaces

    if (object instanceof GameObject) {
      (object as IDestroy).destroy();
      return null;
    }

    if (isIDestroy(object)) {
      (object as IDestroy).destroy();
      return null;
    }

    // second check on implementations

    if (Array.isArray(object)) {
      const objects = object as Object[] | null; // Проверяем, является ли объект массивом
      if (objects) {
        while (objects.length) {
          this.destroy(objects.pop()!); // Вызываем dispose для каждого элемента
        }
      }
      return null;
    }

    if (object instanceof PIXI.Container) {
      let container = object as PIXI.Container;
      container.removeFromParent();
      container.destroy({children: true});
    }

    return null;
  }

  public destroy(): void {
    if (!this._isDestroyed) {
      this._isDestroyed = true;
      this.removeFromJuggler();
    }
  }

}
