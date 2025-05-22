import {GameObject} from "../../GameObject.ts";
import { Rectangle, Point } from 'pixi.js';
import {ObjectUtils} from "../../utils/ObjectUtils.ts";

export class AtlasTextureMold extends GameObject {

  symbol: string = '';
  bounds = new Rectangle(0, 0, 0, 0);
  origin = new Point(0, 0);
  tint_color: number = 0;

  static fromJSON(o: Record<string, any>): AtlasTextureMold {
    const mold = new AtlasTextureMold();
    mold.symbol = ObjectUtils.getKeyStringValue(o, "symbol");
    const rect: number[] = ObjectUtils.getKeyArrayValue(o, "rect");
    mold.bounds = new Rectangle(rect[0], rect[1], rect[2], rect[3]);
    const orig: number[] = ObjectUtils.getKeyArrayValue(o, "origin");
    mold.origin = new Point(orig[0], orig[1]);
    mold.tint_color = ObjectUtils.getKeyNumberValue(o, "tint_color");
    return mold;
  }

  override destroy(): void {
    super.destroy();
  }
}
