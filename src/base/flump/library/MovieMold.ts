import {GameObject} from "../../GameObject.ts";
import {MovieLayerMold} from "./MovieLayerMold.ts";
import {Movie} from "../display/Movie.ts";
import {LibraryFlump} from "./LibraryFlump.ts";
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class MovieMold extends GameObject {

  symbol: string = '';
  layers: MovieLayerMold[] = [];
  labels: string[] = [];

  get flumpClassLabel(): string {
    return this.layers[this.layers.length - 1]?.name || "";
  }

  getLayerMoldByName(name:string){
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].name == name) {
        return this.layers[i];
      }
    }
    return null;
  }

  static fromJSON(o: Record<string, any>, mult: number = 1): MovieMold {
    const mold = new MovieMold();
    mold.symbol = ObjectUtils.getKeyStringValue(o, "id", "");
    const layers = ObjectUtils.getKeyObjValue(o, "layers", []);
    if (Array.isArray(layers)) {
      for (const layer of layers) {
        const layerMold = MovieLayerMold.fromJSON(layer, mult);
        mold.layers.push(layerMold);
      }
    }
    mold.fillLabels();
    return mold;
  }

  override destroy(): void {
    super.destroy();
    GameObject.destroy(this.layers);
    GameObject.destroy(this.labels);
  }

  private fillLabels(): void {
    const frames = this.layers.reduce((max, layer) => Math.max(max, layer.framesCount), 0);
    if (frames === 0) {
      return;
    }

    this.labels[0] = Movie.FIRST_FRAME;

    let labelsLayer:MovieLayerMold | null = null;

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      if (layer && layer.name == LibraryFlump.FLUMP_LABEL) {
        labelsLayer = layer;
        break;
      }
    }

    if (labelsLayer) {
      for (let i = 0; i < labelsLayer.keyframeMolds.length; i++) {
        const keyframe = labelsLayer.keyframeMolds[i];
        if (keyframe && keyframe.label) {
          this.labels[keyframe.index] = keyframe.label;
        }
      }
    }

    if (frames > 1) {
      this.labels[frames - 1] = Movie.LAST_FRAME;
    }
  }
}
