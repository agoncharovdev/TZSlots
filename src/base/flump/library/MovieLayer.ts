import {GameObject} from "../../GameObject.ts";
import {Movie} from "../display/Movie.ts";
import {MovieLayerMold} from "./MovieLayerMold.ts";
import {LibraryFlump} from "./LibraryFlump.ts";
import * as PIXI from 'pixi.js';

export class MovieLayer extends GameObject {

  private _currentDisplay: PIXI.Container | null = null;
  private _displaysByFrames: (PIXI.Container | null)[] = [];
  private _library: LibraryFlump;
  private _layerMold: MovieLayerMold;

  constructor(movie: Movie, layerMold: MovieLayerMold, library: LibraryFlump) {
    super();
    this._library = library;
    this._layerMold = layerMold;

    for (let i = 0; i < layerMold.framesMolds.length; i++) {
      const frameMold = layerMold.framesMolds[i];
      if (frameMold) {
        const previousDisplay = this._displaysByFrames[i - 1];
        const previousMold = layerMold.framesMolds[i - 1];
        if (previousMold && previousDisplay && previousMold.ref && previousMold.ref === frameMold.ref) {
          this._displaysByFrames[i] = previousDisplay;
        } else {
          const display = library.create(frameMold.ref!);
          display.label = layerMold.name;
          this._displaysByFrames[i] = display;

          library.applyFrameState(display, frameMold);
          movie.addChild(display);

          display.visible = false;
        }
      } else {
        this._displaysByFrames[i] = null;
      }
    }
  }

  override destroy(): void {
    super.destroy();
    this._currentDisplay?.destroy();
  }

  public drawFrame(frameNumber: number): void {
    if (this._currentDisplay) {
      this._currentDisplay.visible = false;
    }

    let display = this._displaysByFrames[frameNumber - 1];
    if (display) {
      this._currentDisplay = display;
      if (this._currentDisplay) {
        this._library.applyFrameState(this._currentDisplay, this._layerMold.framesMolds[frameNumber - 1]!);
      }
    }
  }
}
