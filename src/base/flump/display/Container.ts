import {GameView} from "../../GameView.ts";
import {MovieMold} from "../library/MovieMold.ts";
import {LibraryFlump} from "../library/LibraryFlump.ts";
import {KeyframeMold} from "../library/KeyframeMold.ts";
import {Placer} from "./Placer.ts";
import * as PIXI from 'pixi.js';
import {MovieLayerMold} from "../library/MovieLayerMold.ts";

export class Container extends GameView {

  protected _mold: MovieMold;
  protected _library: LibraryFlump;

  constructor(mold: MovieMold, library: LibraryFlump) {
    super();
    this._mold = mold;
    this._library = library;
    this.label = mold.symbol;
  }

  clone(){
    let clone = new Container(this._mold, this._library);
    clone.label = this.label + '_clone';
    return clone;
  }

  getContainerByLabel(label: string): Container {
    return this.getChildByLabel(label) as Container;
  }

  getImageByLabel(label: string): PIXI.Sprite {
    return this.getChildByLabel(label) as PIXI.Sprite;
  }

  public build(): void {
    for (let i = 0; i < this._mold.layers.length; i++) {
      const moldLayer: MovieLayerMold = this._mold.layers[i];
      const layerName: string = moldLayer.name;
      const firstKeyFrameMold: KeyframeMold = moldLayer.keyframeMolds[0];
      let display: PIXI.Container | null = null;

      if (layerName.indexOf(LibraryFlump.FLUMP_PLACER) > -1) {
        display = this.createPlacer(layerName, firstKeyFrameMold);
      } else if (firstKeyFrameMold && firstKeyFrameMold.ref) {
        display = this.createDisplayObject(layerName, firstKeyFrameMold);
      }

      if (display) {
        this.addChild(display);
      }
    }
  }

  protected createPlacer(layerName: string, firstKeyFrameMold: KeyframeMold): Placer {
    const placer: Placer = new Placer(
      firstKeyFrameMold.x, firstKeyFrameMold.y,
      firstKeyFrameMold.scaleX, firstKeyFrameMold.scaleY,
      firstKeyFrameMold.pivotX, firstKeyFrameMold.pivotY
    );
    placer.label = layerName.replace(LibraryFlump.FLUMP_PLACER, '');
    return placer;
  }

  protected createDisplayObject(layerName: string, firstKeyFrameMold: KeyframeMold) {
    // App.log(layerName);
    const display = this._library.create(firstKeyFrameMold.ref || '');
    if (display) {
      this._library.applyFrameState(display, firstKeyFrameMold);
      display.label = layerName;
      return display;
    }
    return null;
  }

}
