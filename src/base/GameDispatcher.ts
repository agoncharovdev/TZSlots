import { GameObject } from "./GameObject";

export type GameDispatcherListener = (sender?: GameObject | null, argument?: any | null) => void;

export class GameDispatcher extends GameObject {
  private _sender?: any | null;
  private _listeners?: Map<GameDispatcherListener, GameDispatcherListener> | null;

  constructor(sender?: any) {
    super();
    this._sender = sender;
    this._listeners = new Map();
  }

  public add(listener: GameDispatcherListener, context: any): void {
    if (this._isDestroyed || !listener) {
      return;
    }

    if (!this._listeners!.has(listener)) {
      // Привязываем к переданному контексту (если есть) или оставляем оригинал
      const boundListener = context ? listener.bind(context) : listener;
      this._listeners!.set(listener, boundListener);
    }
  }

  public remove(listener: GameDispatcherListener): void {
    if (this.destroyed || !listener) {
      return;
    }

    // Удаляем оригинальный и привязанный вариант
    if (this._listeners!.has(listener)) {
      this._listeners!.delete(listener);
    }
  }

  public dispatch(argument?: any): void {
    if (this._isDestroyed || !this._listeners) {
      return;
    }

    // Вызываем привязанные функции
    for (const [, boundListener] of this._listeners) {
      boundListener(this._sender, argument);
    }
  }

  public hasListener(listener: GameDispatcherListener): boolean {
    if (this.destroyed || !listener) {
      return false;
    }

    return this._listeners!.has(listener);
  }

  public removeAllListeners(): void {
    if (this._listeners) {
      this._listeners.clear();
    }
  }

  override destroy(): void {
    if (this._listeners) {
      this._listeners.clear();
      this._listeners = null;
    }
    this._sender = null;
    super.destroy();
  }
}
