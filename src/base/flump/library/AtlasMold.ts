import {GameObject} from "../../GameObject.ts";
import {AtlasTextureMold} from "./AtlasTextureMold.ts";
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class AtlasMold extends GameObject {

  private static readonly SCALE_FACTOR: RegExp = /@(\d+)x$/;

  file: string = '';
  atlasTextureMolds: AtlasTextureMold[] = [];

  get scaleFactor(): number {
    return AtlasMold.extractScaleFactor(this.file);
  }

  static extractScaleFactor(filename: string): number {
    const result = this.SCALE_FACTOR.exec(this.stripPathAndDotSuffix(filename));
    return (result !== null ? parseInt(result[1], 10) : 1);
  }

  static fromJSON(o: Record<string, any>): AtlasMold {
    const mold = new AtlasMold();
    mold.file = ObjectUtils.getKeyStringValue(o, "file");
    for (const tex of ObjectUtils.getKeyObjValue(o, "textures")) {
      mold.atlasTextureMolds.push(AtlasTextureMold.fromJSON(tex));
    }
    return mold;
  }

  static stripDotSuffix(filename: string): string {
    const ix = filename.lastIndexOf(".");
    return (ix >= 0 ? filename.substr(0, ix) : filename);
  }

  static stripPath(filename: string, separator: string = "/"): string {
    const ix = filename.lastIndexOf(separator);
    return (ix >= 0 ? filename.substr(ix + 1) : filename);
  }

  static stripPathAndDotSuffix(filename: string, separator: string = "/"): string {
    return this.stripDotSuffix(this.stripPath(filename, separator));
  }

  override destroy(): void {
    super.destroy();
    GameObject.destroy(this.atlasTextureMolds);
  }
}
