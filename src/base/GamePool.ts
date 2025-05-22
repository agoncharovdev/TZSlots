import {ArrayUtils} from "./utils/ArrayUtils.ts";
import {GameObject} from "./GameObject";
import type {IPoolable} from "./interfaces.ts";

export class GamePool extends GameObject {

  private _allObjects:IPoolable[] = [];
  private _pool:IPoolable[] = [];
  private _creator:()=>IPoolable;  // function():Object

  constructor(creator:()=>IPoolable) {
    super();
    this._creator = creator;
  }

  override destroy():void {
    if (this._allObjects) {
      this._allObjects.forEach((gameObject) => {
        gameObject.destroy();
      });
      this._allObjects.length = 0;
    }
    if (this._pool) {
      this._pool.forEach((gameObject) => {
        gameObject.destroy();
      });
      this._pool.length = 0;
    }
    super.destroy();
  }

  public removeFromPool(obj:IPoolable):void {
    if (!this.destroyed && obj) {
      ArrayUtils.remove(this._pool, obj);
      ArrayUtils.remove(this._allObjects, obj);
    }
  }

  public returnToPool(obj:IPoolable):void {
    if (obj && !this._pool.includes(obj)) {
      obj.onReturnToPool();
      this._pool.push(obj);
    }
  }

  public getFromPool() {
    let obj!:IPoolable;
    if (this._pool.length == 0) {
      obj = this._creator();
      this._allObjects.push(obj);
    } else {
      obj = this._pool.pop()!;
    }
    obj.onGetFromPool(this);
    return obj;
  }

  public returnAllToPool() {
    if (!this.destroyed) {
      this._allObjects.forEach((gameObject) => {
        this.returnToPool(gameObject);
      })
    }
  }

}
