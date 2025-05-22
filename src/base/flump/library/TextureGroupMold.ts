import {GameObject} from "../../GameObject.ts";
import {AtlasMold} from "./AtlasMold.ts";
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class TextureGroupMold extends GameObject {

  scaleFactor: number = 1;
  atlasMolds: AtlasMold[] = [];

  static fromJSON(o: Record<string, any>): TextureGroupMold {
    const mold = new TextureGroupMold();
    mold.scaleFactor = ObjectUtils.getKeyNumberValue(o, "scaleFactor");
    const atlases = ObjectUtils.getKeyObjValue(o, "atlases", []);
    if (Array.isArray(atlases)) {
      for (const atlas of atlases) {
        mold.atlasMolds.push(AtlasMold.fromJSON(atlas));
      }
    }
    return mold;
  }

  override destroy(): void {
    super.destroy();
    GameObject.destroy(this.atlasMolds);
  }
}

